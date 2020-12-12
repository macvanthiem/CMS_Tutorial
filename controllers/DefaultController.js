const Post = require('../models/Post').Post;
const Comment = require('../models/Comment').Comment;
const Category = require('../models/Category').Category;
const User = require('../models/User').User;
const bcrypt = require('bcrypt');

var fs = require('fs')


module.exports = {

    index: async (req, res) => {
        let per_page = 3;
        let page = req.params.page || 1;

        const posts = await Post.find().skip(per_page*page - per_page).limit(per_page).populate('user').populate('category').lean(); 
        const count_posts = await Post.countDocuments();
        let count_page = Math.ceil(count_posts/per_page);
        let list_page = new Array();
        for (let i = 1; i <= count_page; i++) {
            list_page.push(i);
        }
        let pre = page > 1 ? true : false;
        let pre_value = Number(page) - 1 ;
        let next = count_page > page ? true : false; 
        let next_value = Number(page) +1;
        const cats = await Category.find().lean();
        if (req.user) {
            let user = req.user;
            let user_name = user.last_name + ' ' + user.first_name;
            let email = user.email;
            let role = user.role;
            res.render('default/index', {posts: posts, cats: cats, list_page: list_page, pre: pre, pre_value: pre_value, next: next, next_value: next_value, name : user_name, email: email, role: role});
        } else {
            res.render('default/index', {posts: posts, cats: cats, list_page: list_page, pre: pre, pre_value: pre_value, next: next, next_value: next_value});
        }
        
    },

    home: (req, res) => {
        res.redirect('/news/1');
    },

    loginGet: (req, res) => {
        res.render('default/login');
    },
    loginPost: (req, res) => {
        res.send('success');
    },
    registerGet: (req, res) => {
        res.render('default/register');
    },
    registerPost: (req, res) => {

        if (req.body.passwordConfirm != req.body.password) {
            req.flash('error-message', 'Password is not match.');
            res.render('default/register');
        } else {
            User.findOne({email: req.body.email}).then(user => {
                if (user) {
                    req.flash('error-message', 'Email already exists, try to login.');
                    res.redirect('/login');
                } else {
                    const newUser = new User({
                        first_name: req.body.firstName,
                        last_name: req.body.lastName,
                        email: req.body.email,
                        password: req.body.password
                    });
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (error, hash) => {
                            newUser.password = hash;
                            newUser.save().then(user => {
                                req.flash('success-message', 'You are now registered.');
                                res.redirect('/login');
                            }).catch( error => {
                                req.flash('error-message', 'User registered failed. Try again!');
                                res.redirect('/register');
                            })
                           
                        })
                        
                    });
                }
            });
        }

    },

    // Logout
    logout: (req, res) => {
        req.flash('success-message', 'You have been logouted.');
        req.logout();
        res.redirect('/news/1');
    },

    postDetail: async (req, res) => {
        var slug = req.params.slug;
        var post = await Post.findOne({slug: slug}).populate('user').populate({path: 'comments', populate: {path: 'user', model: 'user'}}).lean();
        var cats = await Category.find().lean();
        if (req.user) {
            let user = req.user;
            let user_name = user.last_name + ' ' + user.first_name;
            let email = user.email;
            let role = user.role;
            res.render('default/detail', {post: post, cats: cats, name : user_name, email: email, role: role});
        } else {
            res.render('default/detail', {post: post, cats: cats});
        }
    },

    getImage: (req, res) => {
        const images = fs.readdirSync('public/uploads')
        var sorted = []
        for (let item of images){
            if(item.split('.').pop() === 'png'
            || item.split('.').pop() === 'jpg'
            || item.split('.').pop() === 'jpeg'
            || item.split('.').pop() === 'svg'){
                var abc = {
                        "image" : "/uploads/"+item,
                        "folder" : '/'
                }
                sorted.push(abc)
            }
        }
        res.send(sorted);
    },

    uploadImage : (req, res) => {
        let prev = Math.floor(Math.random() * (100000 - 0)) + 0;
        let file  = req.files.flFileUpload;
        let fileName = prev+file.name;
        let uploadDir = './public/uploads/';
        file.mv(uploadDir+fileName, error => {
            req.flash('error-message', 'Image file uploaded failed.');
            if (error) {
                throw error;
            } else {
                res.redirect('back');
            }
        });
    },

    deleteImage: (req, res) => {
        var url_del = 'public' + req.body.url_del;
        if(fs.existsSync(url_del)){
            fs.unlinkSync(url_del)
        }
        res.redirect('back')
    },

    storeComment: (req, res) => {
        let content = req.body.content;
        let post_id = req.body.post;

        Post.findById(post_id).then(post => {
            const new_comment = new Comment({
                content: content,
                user: req.user._id 
            });
            if (post) {
                post.comments.push(new_comment);
                post.save().then(savedPost => {
                    new_comment.save().then(savedComment => {
                        Post.findById(post_id).populate({path: 'comments', populate: {path: 'user', model: 'user'}}).lean().then(data => {
                            res.status(200).json(data.comments);
                        });
                    })
                });
            } else {
                res.status(500);
            }
        }).catch(error => {
            res.status(500);
            throw error;
        });
    }

};