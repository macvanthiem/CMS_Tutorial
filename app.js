const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const hbs = require('express-handlebars');
const { mongoDbUrl, PORT, globalVar } = require('./config/configuration');
const flash = require('connect-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
const passport = require('passport');

const app = express();

// Configure Mongoose
mongoose.connect(mongoDbUrl, { useNewUrlParser: true })
.then(response => {
    console.log('Success');
})
.catch(error => {
    console.log('Fail');
});

// Flash and Session

app.use(session({
    secret: 'anysecret',
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(globalVar);

// File Upload
app.use(fileUpload());

// Configure Express
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

// Setup View Engine To Use Handlebars
app.engine('handlebars', hbs({ defaultLayout: 'default' }));
app.set('view engine', 'handlebars');

// Method Override
app.use(methodOverride('newMethod'));

// Routes
const defaultRouter = require('./routes/default');
const adminRouter = require('./routes/admin');

app.use('/', defaultRouter);
app.use('/admin', adminRouter);
app.get('/*', (req, res) => {
    res.render('404');
});

app.listen(PORT, () => {
    console.log('ok');
});