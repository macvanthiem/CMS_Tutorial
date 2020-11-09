const Post = require('../models/Post').Post;
const Category = require('../models/Category').Category;
const Comment = require('../models/Category').Comment;

module.exports = {

    // Dashboard
    index: (req, res) => {
        res.render('admin/index');
    },

    // Posts
    getPosts: (req, res) => {
        Post.find().populate('category').lean().then(posts => {
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
        let file  = req.files.banner;
        let fileName = file.name;
        let uploadDir = './public/uploads/';
        file.mv(uploadDir+fileName, error => {
            req.flash('error-message', 'Image file uploaded failed.');
            if (error) {
                throw error;
            };
        });

        const newPost = new Post({
            title: req.body.title,
            allow_comments: req.body.allow_comments ? true : false,
            desc: req.body.description,
            content: req.body.content,
            status: req.body.status,
            category: req.body.category,
            banner: `/uploads/${fileName}`,
        });
        newPost.save().then(post => {
            req.flash('success-message', 'Post created successfully.');
            res.redirect('/admin/posts');
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
            fileName = file.name;
            let uploadDir = './public/uploads/';
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
                post.banner = `/uploads/${fileName}`; 
            }

            post.save().then(post => {
                req.flash('success-message', `The post ${post.title} has been updated.`);
                res.redirect('/admin/posts');
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

    // Logout
    logout: (req, res) => {
        req.flash('success-message', 'You have been logouted.');
        req.logout();
        res.redirect('/');
    },

    // Comments
    getComments: (req, res) => {
             
    }

}

