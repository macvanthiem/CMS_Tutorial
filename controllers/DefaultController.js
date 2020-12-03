const Post = require('../models/Post').Post;
const Category = require('../models/Category').Category;
const User = require('../models/User').User;
const bcrypt = require('bcrypt');
const createDomPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const dompurify = createDomPurify(new JSDOM().window);
const marked = require('marked');

module.exports = {

    index: async (req, res) => {
        let per_page = 1;
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
        res.redirect('/');
    },

    preview: (req, res) => {
        res.status(200).json({
            message: 'ok',
            data: marked(req.body.content)
        })
    },

    postDetail: async (req, res) => {
        var slug = req.params.slug;
        var post = await Post.findOne({slug: slug}).populate('user').populate('category').lean();
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

};