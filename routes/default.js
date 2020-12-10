const express = require('express');
const router = express.Router();
const defaultController = require('../controllers/DefaultController');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { post } = require('./admin');
const localStrategy = require('passport-local').Strategy;
const User = require('../models/User').User;

function checkLogin(req, res,next) {
    if (req.isAuthenticated()) {
        return res.redirect('/admin')
    }
    next()
}

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'default';
    next();
})

router.route('/')
    .get(defaultController.home);

router.route('/news/:page')
    .get(defaultController.index);

passport.use(new localStrategy({
    usernameField: 'email',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({email: email}).then(user => {
        if (!user) {
            return done(null, false, req.flash('error-message', 'User not found with this email.'));
        }

        bcrypt.compare(password, user.password, (error, passwordMatch) => {
            if (error) {
                return error;
            }
            
            if (!passwordMatch) {
                return done(null, false, req.flash('error-message', 'Invalid Username or Password'));
            }
            return done(null, user, req.flash('success-message', 'Login success.'));
        });
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

router.route('/login')
    .get(checkLogin ,defaultController.loginGet)
    .post(passport.authenticate('local', {
        successRedirect: '/news/1',
        failureRedirect: '/login',
        successFlash: true,
        failureFlash: true,
        session: true
    }));

router.route('/register')
    .get(defaultController.registerGet)
    .post(defaultController.registerPost);
    
router.route('/posts/:slug')
    .get(defaultController.postDetail);

router.route('/logout')
    .get(defaultController.logout);

router.route('/files')
    .get(defaultController.getImage);

router.route('/delete_file')
    .post(defaultController.deleteImage);

router.route('/upload')
    .post(defaultController.uploadImage);

router.route('/comment')
    .post(defaultController.storeComment);

module.exports = router;