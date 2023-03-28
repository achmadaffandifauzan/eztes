const express = require('express');
const router = express.Router({ mergeParams: true });
const Category = require('../models/category');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const catchAsync = require('../utils/CatchAsync');

router.get('/categories', catchAsync(async (req, res, next) => {
    if (req.query.categoryName && req.query.authorName) {
        var categories = await Category.find({
            "categoryName": { '$regex': req.query.categoryName, $options: 'i' },
            "authorName": { '$regex': req.query.authorName, $options: 'i' },
        })
    } else if (req.query.categoryName) {
        var categories = await Category.find({
            "categoryName": { '$regex': req.query.categoryName, $options: 'i' },
        })
    } else if (req.query.authorName) {
        var categories = await Category.find({
            "authorName": { '$regex': req.query.authorName, $options: 'i' },
        })
    } else {
        var categories = await Category.find({}).limit(30);
    }
    console.log(categories)
    console.log(req.query)
    res.render('categories/index', { categories })
}))

router.get('/categories/:id', catchAsync(async (req, res, next) => {
    const categories = await Category.findById(req.params.id).populate('posts').populate('author')
    // console.log(categories)
    res.render('categories/category', { categories })
}))
router.get('/categories/:id/answerer', catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    // const comments = await Comment.find({ category: req.params.id }).populate('author');
    const comments = await Comment.aggregate([
        {
            "$group": {
                _id: "$author",
            },
        },
    ])

    // returning promise instead of result of find
    // const comment = comments.map(async (comment) => {
    //     await User.findById(comment)
    // })
    // console.log(posts[0].comments[0])

    let Answerer = [];
    for (let comment of comments) {
        Answerer.push(await User.findById(comment))
    }
    console.log(Answerer)
    res.render('categories/answerer', { Answerer, category })
}))
router.get('/categories/:id/:userID', catchAsync(async (req, res, next) => {
    const { id, userID } = req.params;
    const userComment = await User.findById(userID);
    const category = await Category.findById(id).populate('author'); //.populate({ path: 'posts', populate: { path: 'comments' } }) include posts
    const posts = await Post.find({ category: category._id }).populate({ path: 'comments', match: { author: userID } }) // separate posts find, not from category populate
    // console.log(posts[1])
    res.render('categories/evaluate', { category, userComment, posts });

}))
module.exports = router;