const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    
    title: {
        type: String,
        required: true
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

    content: {
        type: String,
        required: true
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

module.exports = {Post: mongoose.model('post', PostSchema)};