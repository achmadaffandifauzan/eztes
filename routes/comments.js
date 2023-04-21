const express = require('express');
const router = express.Router({ mergeParams: true });
const Comment = require('../models/comment');
const Post = require('../models/post');
const Category = require('../models/category');
const catchAsync = require('../utils/CatchAsync');
const { isLoggedIn, isCommentAuthor, validateComment, isPostAvailable } = require('../middleware');
const dayjs = require('dayjs');


router.post('/posts/:id/comments/', isPostAvailable, isLoggedIn, validateComment, catchAsync(async (req, res, next) => {
    const postDB = await Post.findById(req.params.id).populate('comments');
    const categoryDB = await Category.findById(postDB.category);
    if (!postDB.answerer.includes(req.user._id)) {
        // list this user to post.answerer if not listed yet
        postDB.answerer.push(req.user._id)
        await postDB.save();
    };
    if (!categoryDB.answerer.includes(req.user._id)) {
        // list this user to category.answerer if not listed yet
        categoryDB.answerer.push(req.user._id)
        await categoryDB.save();
    };
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
        const currentTime = dayjs().format("HH:mm");
        const currentDate = dayjs().format("D MMM YY");
        comment.lastSubmitted = `${currentTime} - ${currentDate}`;
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
        const currentTime = dayjs().format("HH:mm");
        const currentDate = dayjs().format("D MMM YY");
        comment.lastSubmitted = `${currentTime} - ${currentDate}`;
        await comment.save();
    }
    await postDB.save();
    res.redirect(`/posts/${postDB._id}`);
}));
router.delete('/posts/:id/comments/:commentId', isLoggedIn, isCommentAuthor, catchAsync(async (req, res, next) => {
    const { id, commentId } = req.params;
    const post = await Post.findByIdAndUpdate(id, {
        $pull: {
            comments: commentId,
            answerer: req.user._id
        }
    });
    const comments = await Comment.find({ _id: req.user._id, category: post.category });
    // check if this user still has a comment on this category, if not, it will be removed from answerer list
    console.log(comments)
    if (comments.length == 0) {
        await Category.findByIdAndUpdate(post.category, { $pull: { answerer: req.user._id } });
    }
    await Comment.findByIdAndDelete(commentId);
    res.redirect(`/posts/${id}`);
}));

module.exports = router;