const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    
    content: {
        type: String,
        required: true
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },

    created_at: {
        type: Date,
        default: Date.now()
    },

    comment_is_approved: {
        type: Boolean,
        required: false
    },

});

module.exports = {Comment: mongoose.model('comment', CommentSchema)};