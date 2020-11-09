module.exports=  {
    mongoDbUrl: 'mongodb://localhost:27017/cms_tutorial',
    PORT: process.env.PORT || 3000,
    globalVar: (req, res, next) => {
        res.locals.success_message = req.flash('success-message');
        res.locals.error_message = req.flash('error-message');
        res.locals.user = req.user || null;
        next();
    }
};