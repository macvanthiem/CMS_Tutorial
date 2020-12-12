const Post = require('../models/Post').Post;
const Category = require('../models/Category').Category;
const Comment = require('../models/Comment').Comment;
const User = require('../models/User').User;
const { backgroundColor, borderColor } = require('../config/configuration');

module.exports = {

    // Dashboard
    index: async (req, res) => {
        let count_cats = await Category.countDocuments();
        let count_posts = await Post.countDocuments();
        let count_users = await User.countDocuments();
        let count_cmts = await Comment.countDocuments();

        let posts = await Post.find().populate('category').populate('user').limit(5).lean();

        let users = await User.find().limit(5).lean();

        res.render('admin/index', {count_cats: count_cats, count_posts: count_posts, count_users: count_users, count_cmts: count_cmts, posts: posts, users: users});
    },

    prepareData : async (req, res) => {
        let cats = await Category.find().lean();
        let posts = await Post.find().lean();
        let users = await User.find().lean();
        let count_cats = cats.length;
        let count_posts = posts.length;
        let count_users = users.length;
        let bg = new Array();
        let border = new Array();
        let labels = new Array();
        let data = new Array();
        for (let i = 0; i < count_cats; i++) {
            bg[i] = backgroundColor[i];
            border[i] = borderColor[i];
            labels[i] = cats[i].title;
            data[i] = 0;
            for (let j = 0; j < count_posts; j++) {
                if (String(posts[j].category) == String(cats[i]._id)) {
                    data[i] += 1;
                }
            }
        }

        let res_data = {labels: labels, data: data, bg: bg, border: border};

        res.status(200).json(res_data);
    },

    // Posts
    getPosts: (req, res) => {
        Post.find().populate('category').populate('user').lean().then(posts => {
            res.render('admin/posts', {posts: posts});
        })
        .catch(error => {
            req.flash('error-messange', 'Error connecting to server.');
            res.render('admin/posts', {posts: {}});
        });
    },

    createPost: (req, res) => {

        Category.find().lean().then(cats => {
            res.render('admin/posts/create', {cats: cats});
        }).catch(error => {
            res.render('admin/posts/create', {cats: {}});
        })
    },

    storePost: (req, res) => {
        let fileName = '';
        if (req.files != null) {
            let prev = Math.floor(Math.random() * (100000 - 0)) + 0;
            let file  = req.files.banner;
            fileName = prev+file.name;
            let uploadDir = './public/img/';
            file.mv(uploadDir+fileName, error => {
                req.flash('error-message', 'Image file uploaded failed.');
                if (error) {
                    throw error;
                };
            });
        }

        const newPost = new Post({
            title: req.body.title,
            allow_comments: req.body.allow_comments ? true : false,
            desc: req.body.description,
            content: req.body.content,
            user: req.user._id,
            status: req.body.status,
            category: req.body.category,
            banner: fileName=='' ? '/img/758x380.png' : `/img/${fileName}`,
        });
        
        newPost.save().then(post => {
            req.flash('success-message', 'Post created successfully.');
            res.redirect('/admin/posts/show/'+post._id);
        })
        .catch(error => {
            req.flash('error-messange', 'Error connecting to server. Post created failed.');
            res.redirect('/admin/posts');
        });
    },

    editPost: (req, res) => {
        const id = req.params.id;
        Post.findById(id).populate('category').lean().then(post => {
            Category.find().lean().then(cats => {
                res.render('admin/posts/edit', {post: post, cats: cats});
            })
            .catch(error => {
                res.render('admin/posts/edit', {post: post});
            })
            
        })
        .catch (error => {
            res.render('admin/404');
        });
    },

    updatePost: (req, res) => {
        // console.log(req.body.checkUpload);
        let fileName = '';
        if (req.body.checkUpload == '0') {
            // console.log(req.files);
            let file  = req.files.banner;
            let prev = Math.floor(Math.random() * (100000 - 0)) + 0;
            fileName = prev+file.name;
            let uploadDir = './public/img/';
            file.mv(uploadDir+fileName, error => {
                if (error) {
                    throw error;
                };
            });
        }

        var id = req.params.id;

        Post.findById(id).then(post => {
            post.title = req.body.title;
            post.allow_comments = req.body.allow_comments ? true : false;
            post.desc = req.body.description;
            post.content = req.body.content;
            post.status = req.body.status;
            post.category = req.body.category;
            if (req.body.checkUpload == '0') {
                post.banner = `/img/${fileName}`; 
            }

            post.save().then(post => {
                req.flash('success-message', `The post ${post.title} has been updated.`);
                res.redirect('/admin/posts/show/'+post._id);
            }).catch(error => {
                req.flash('error-message', `Post updated failed.`);
                res.redirect('/admin/posts');
            });
        }).catch( error => {
            res.redirect('/admin/404');
        })
    },

    deletePost: (req, res) => {
        const id = req.params.id;
        Post.findByIdAndDelete(id).lean().then(deletePost => {
            req.flash('success-message', `The post ${deletePost.title} has been deleted.`);
            res.redirect('/admin/posts');
        });
    },

    showPost: (req, res) => {
        const id = req.params.id;
        Post.findById(id).populate('user').populate('category').lean().then(post => {
            res.render('admin/posts/show', {post: post});
        }).catch(error => {
            req.flash('error-message', 'Post does not exist!');
            res.redirect('/admin/posts');
        });
    },

    // Categories
    getCategories: (req, res) => {
        Category.find().lean().then(categories => {
            res.render('admin/categories', {cats: categories});
        });
    },

    storeCategory: (req, res) => {
        var categoryName = req.body.name;
        if (categoryName) {
            const newCategory = new Category({
                title: req.body.name,
            });
    
            newCategory.save().then(category => {
                res.status(200).json(category);
            });
        } else {
            res.status(500);
        }
        
    },

    updateCategory: (req, res) => {
        var id = req.params.id;
        var title = req.body;

        Category.updateOne({_id:id}, {$set:title}).exec().then(() => {
            res.status(200).json({
                success: true,
                message: 'OK',
                data: title
            });
        })
        .catch((error) => {
            res.status(500).json({
                success: false,
                message: 'Fail'
            });
        });
    },

    deleteCategory: (req, res) => {
        const id = req.params.id;

        Category.findByIdAndDelete(id).lean().then(deleteCategory => {
            req.flash('success-message', `The post ${deleteCategory.title} has been deleted.`);
            res.redirect('/admin/categories');
        });
    },

    // Comments
    getComments: (req, res) => {
        Post.find().populate({path: 'comments', populate: {path: 'user', model: 'user'}}).lean().then(posts => {
            if (posts) {
                res.render('admin/comments', {posts:posts});
            } else {
                req.flash('error-message', 'No posts at all!');
                res.redirect('/admin');
            }
        }).catch(error => {
            res.redirect('/admin');
        });
        
    },

    updateComment: (req, res) => {
        let id = req.params.id;
        let comment_is_approved = req.body.comment_is_approved;
        Comment.findById(id).then(comment => {
            comment.comment_is_approved = comment_is_approved;
            comment.save().then(newComment => {
                Comment.findById(id).populate('user').lean().then(data => {
                    res.status(200).json(data);
                })
            }).catch(error => {
                res.status(500);
            })
        }).catch(error => {
            res.redirect('/admin/404');
        })
    },

    // User

    getUsers: async (req, res) => {
        let per_page = 1;
        let page = req.params.page || 1;

        const users = await User.find().skip(per_page*page - per_page).limit(per_page).lean();
        const count_posts = await User.countDocuments();
        let count_page = Math.ceil(count_posts/per_page);
        let list_page = new Array();
        for (let i = 1; i <= count_page; i++) {
            list_page.push(i);
        }
        let pre = page > 1 ? true : false;
        let pre_value = Number(page) - 1 ;
        let next = count_page > page ? true : false; 
        let next_value = Number(page) +1;
        res.render('admin/users', {users: users, list_page: list_page, pre: pre, pre_value: pre_value, next: next, next_value: next_value});
    },

    updateRole: (req, res) => {
        let id = req.params.id;
        let role = req.body.role;
        User.findById(id).then(user => {
            user.role = role;
            user.save().then(newUser => {
                res.status(200).json(newUser);
            }).catch(error => {
                res.status(500);
            })
        }).catch(error => {
            res.redirect('/admin/404');
        })
    },

}

