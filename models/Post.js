const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const marked = require('marked')
const slugify = require('slugify');
const createDomPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const dompurify = createDomPurify(new JSDOM().window);

const PostSchema = new Schema({
    
    title: {
        type: String,
        required: true
    },
    banner: {
        type: String,
        default: 'http://placehold.it/758x380'
    },

    status: {
        type: String,
        default: 'public'
    },

    allow_comments: {
        type: Boolean,
        default: true
    },

    desc: {
        type: String,
        required: true
    },

    markdown: {
        type: String,
        required: true
    },

    sanitizedHtml: {
        type: String,
        required: true
    },

    slug: {
        type: String,
        required: true,
        unique: true
    },

    created_at: {
        type: Date,
        default: Date.now()
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },

    category: {
        type: Schema.Types.ObjectId,
        ref: 'category'
    },

    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'comment'
        }
    ]
});

PostSchema.pre('validate', function(next) {
    if (this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }

    if (this.markdown) {
        this.sanitizedHtml = dompurify.sanitize(marked(this.markdown))
    }

    next();
})

module.exports = {Post: mongoose.model('post', PostSchema)};