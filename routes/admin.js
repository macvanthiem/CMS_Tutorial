const express = require('express');
const AdminController = require('../controllers/AdminController');
const router = express.Router();
const adminController = require('../controllers/AdminController');

function isUserAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}

router.all('/*', isUserAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
})

router.route('/')
    .get(adminController.index);

router.route('/posts')
    .get(adminController.getPosts);

router.route('/posts/create')
    .get(adminController.createPost)
    .post(adminController.storePost);

router.route('/posts/edit/:id')
    .get(adminController.editPost);

router.route('/posts/update/:id')
    .post(adminController.updatePost);

router.route('/posts/delete/:id')
    .delete(adminController.deletePost);

router.route('/categories')
    .get(adminController.getCategories)
    .post(adminController.storeCategory);

router.route('/categories/update/:id')
    .put(adminController.updateCategory);

router.route('/categories/delete/:id')
    .delete(adminController.deleteCategory);

router.route('/logout')
    .get(adminController.logout);

router.route('/comments')
    .get(adminController.getComments);

module.exports = router;