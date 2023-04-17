const mongoose = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');
const Category = require('../models/category');
const Comment = require('./comment');
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

// categorySchema.post('findOneAndDelete', async function (doc) {
//     // postSchema.post : after triggering findOneAndDelete, this function wil be triggered
//     if (doc) {
//         // deleting category => deleting dependencies up (user) and down (posts)=> deleting dependencies's dependencies

//         // dependencies up
//         // deleting post dependencies in user
//         await User.findByIdAndUpdate({ _id: doc.author }, { $pull: { posts: { $in: doc.posts } } });
//         // deleting category dependencies in user
//         await User.findByIdAndUpdate({ _id: doc.author }, { $pull: { posts: doc._id } });

//         // dependencies down
//         // deleting comments dependencies in posts
//         for (let postDoc of doc.posts) {
//             // why not just langsung postDoc.comments ? because doc.posts is not populating comments, so we must manually findById
//             const postDB = await Post.findById(postDoc);
//             await Comment.deleteMany({ _id: { $in: postDB.comments } })
//         }
//         // deleting post
//         await Post.deleteMany({ _id: { $in: doc.posts } });

//     }
// })

module.exports = mongoose.model('Category', categorySchema);