const express = require('express');
const router = express.Router({ mergeParams: true });
const Comment = require('../models/comment');
const Post = require('../models/post');
const Category = require('../models/category');
const catchAsync = require('../utils/CatchAsync');
const { isLoggedIn, isCommentAuthor, validateComment, isPostAvailable } = require('../middleware');


// prefix => /posts/:id/
router.post('/', isPostAvailable, isLoggedIn, catchAsync(async (req, res, next) => {
    const postDB = await Post.findById(req.params.id).populate('comments');
    const categoryDB = await Category.find({ posts: req.params.id });
    try {
        // repost answer (comment from this user is already exist)
        const comment = await Comment.findOne(
            {
                author: req.user._id,
                post: req.params.id,
            })
        // console.log("Comment = ", comment)
        if (postDB.type == 'options') {
            let trueOrFalse;
            if (req.body.comment.choice == postDB.key) {
                trueOrFalse = true;
            } else {
                trueOrFalse = false;
            }
            comment.choice = req.body.comment.choice;
            comment.choiceValue = postDB.options[req.body.comment.choice];
            comment.correctness = trueOrFalse;
        } else if (postDB.type == 'essay') {
            comment.text = req.body.comment.text;
        }
        await comment.save();
    } catch (error) {
        // new answer (comment from this user is not exist)

        // console.log(error)
        const comment = new Comment(req.body.comment);
        comment.post = postDB;
        comment.category = categoryDB;
        comment.author = req.user._id;
        if (postDB.type == 'options') {
            comment.type = 'options';
            comment.choiceValue = postDB.options[comment.choice];
            if (comment.choice == postDB.key) {
                comment.correctness = true;
            } else {
                comment.correctness = false;
            }
        } else {
            comment.type = 'essay';
        }
        postDB.comments.push(comment);
        await comment.save();
    }
    await postDB.save();
    res.redirect(`/posts/${postDB._id}`);
}));
router.delete('/:commentId', isLoggedIn, isCommentAuthor, catchAsync(async (req, res, next) => {
    const { id, commentId } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    res.redirect(`/posts/${id}`);
}));

module.exports = router;