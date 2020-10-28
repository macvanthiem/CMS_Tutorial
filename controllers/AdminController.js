const Post = require('../models/Post').Post;

module.exports = {
    index: (req, res) => {
        res.render('admin/index');
    },

    getPosts: (req, res) => {
        Post.find().lean().then(posts => {
            // console.log(posts);
            res.render('admin/posts', {posts: posts});
        });
    },

    createPost: (req, res) => {
        res.render('admin/posts/create');
    },

    storePost: (req, res) => {
        // console.log(req.body);
        const newPost = new Post({
            title: req.body.title,
            allow_comments: req.body.allow_comments ? true : false,
            desc: req.body.description,
            content: req.body.content,
            status: req.body.status,
        });
        newPost.save().then(post => {
            // console.log(post);
            req.flash('success-message', 'Post created successfully.');
            res.redirect('/admin/posts');
        });
    },

    editPost: (req, res) => {
        const id = req.params.id;
        Post.findById(id).lean().then(post => {
            // console.log(post);
            res.render('admin/posts/edit', {post: post})
        });
    },

    deletePost: (req, res) => {
        const id = req.params.id;
        Post.findByIdAndDelete(id).lean().then(deletePost => {
            req.flash('success-message', `The post ${deletePost.title} has been deleted.`);
            res.redirect('/admin/posts');
        });
    }
}