const Post = require('../models/Post').Post;
const Category = require('../models/Category').Category;

module.exports = {

    // Dashboard
    index: (req, res) => {
        res.render('admin/index');
    },
    // Posts
    getPosts: (req, res) => {
        Post.find().lean().then(posts => {
            res.render('admin/posts', {posts: posts});
        });
    },

    createPost: (req, res) => {
        res.render('admin/posts/create');
    },

    storePost: (req, res) => {
        const newPost = new Post({
            title: req.body.title,
            allow_comments: req.body.allow_comments ? true : false,
            desc: req.body.description,
            content: req.body.content,
            status: req.body.status,
        });
        newPost.save().then(post => {
            req.flash('success-message', 'Post created successfully.');
            res.redirect('/admin/posts');
        });
    },

    editPost: (req, res) => {
        const id = req.params.id;
        Post.findById(id).lean().then(post => {
            res.render('admin/posts/edit', {post: post})
        });
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
        }
        
    },

    deleteCategory: (req, res) => {
        const id = req.params.id;

        Category.findByIdAndDelete(id).lean().then(deleteCategory => {
            req.flash('success-message', `The post ${deleteCategory.title} has been deleted.`);
            res.redirect('/admin/categories');
        });
    }

}