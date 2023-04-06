const mongoose = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');
const Category = require('../models/category');
const Comment = require('./comment');
const { Schema } = mongoose;

const commentSchema = new Schema({
    text: String,
    type: {
        type: String,
        enum: ['options', 'essay']
    },
    choice: Number,
    choiceValue: String,
    correctness: Boolean,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    post: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    category: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Category'
        }
    ],
});
module.exports = mongoose.model('Comment', commentSchema);