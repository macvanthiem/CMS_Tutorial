const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const hbs = require('express-handlebars');
const { mongDbUrl, PORT } = require('./config/configuration');

const app = express();

// Configure Mongoose
mongoose.connect(mongDbUrl, { useNewUrlParser: true })
    .then(response => {
        console.log('Success');
    })
    .catch(error => {
        console.log('Fail');
    });

// Configure express
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

// Setup View Engine To Use Handlebars
app.engine('handlebars', hbs({ defaultLayout: 'default' }));
app.set('view engine', 'handlebars');

// Routes
const router = require('./routes/index');
app.use('/', router);

app.listen(PORT, () => {
    console.log('ok');
});