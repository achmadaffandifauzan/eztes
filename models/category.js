const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    categoryName: {
        type: String,
    },
    authorName: {
        type: String,
    },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    isAvailable: {
        type: String,
        default: "true",
    },
    answerer: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    dateCreated: {
        type: String,
    },
    lastEdited: {
        type: String,
    },
})


module.exports = mongoose.model('Category', categorySchema);