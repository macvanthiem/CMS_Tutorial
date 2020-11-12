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
        const posts = await Post.find().populate('user').lean(); 
        const cats = await Category.find().lean();
        res.render('default/index', {posts: posts, cats: cats});
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

    preview: (req, res) => {
        res.status(200).json({
            message: 'ok',
            data: dompurify.sanitize(marked(req.body.content))
        })
    },

};