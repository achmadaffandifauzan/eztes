const mongoose = require('mongoose');
const Post = require("./post");
const Comment = require('./comment')
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
})
// why here? reason is in models post.js
categorySchema.post('findOneAndDelete', async function (doc) {
    // postSchema.post : after triggering findOneAndDelete, this function wil be triggered
    if (doc) {
        // deleting comment
        for (let postDoc of doc.posts) {
            // why not just langsung postDoc.comments ? because doc.posts is not populating comments, so we must manually findById
            const postDB = await Post.findById(postDoc);
            await Comment.deleteMany({
                _id: {
                    $in: postDB.comments
                }
            })
        }
        // deleting post
        console.log("doc from categorySchema => ", doc);
        await Post.deleteMany({
            _id: {
                $in: doc.posts
            }
        });

    }
})

module.exports = mongoose.model('Category', categorySchema);