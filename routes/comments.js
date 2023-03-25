const express = require('express');
const router = express.Router({ mergeParams: true });
const Comment = require('../models/comment');
const Post = require('../models/post');
const catchAsync = require('../utils/CatchAsync');
const { isLoggedIn, isCommentAuthor, validateComment, isPostAvailable } = require('../middleware');

router.post('/', isPostAvailable, isLoggedIn, catchAsync(async (req, res, next) => {
    const postDB = await Post.findById(req.params.id);
    const comment = new Comment(req.body.comment);
    console.log(comment)
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
    console.log("AFTER", comment)
    postDB.comments.push(comment);
    await comment.save();
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