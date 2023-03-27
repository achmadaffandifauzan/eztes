const express = require('express');
const router = express.Router({ mergeParams: true });
const Category = require('../models/category');
const Post = require('../models/post');
const User = require('../models/user');
const catchAsync = require('../utils/CatchAsync');

router.get('/categories', catchAsync(async (req, res, next) => {
    let categories = await Category.find({}).populate('author')
    // console.log(categories)
    // console.log(req.query)
    // let postCategories = categories.posts.filter((obj) => {
    //     result = false;
    //     if (req.query.postCategory) {
    //         if (obj.postCategory.toLowerCase().includes(req.query.postCategory.toLowerCase())) {
    //             result = true;
    //         }
    //     } else if (req.query.author) {
    //         if (obj.author.username.toLowerCase().includes(req.query.author.toLowerCase())) {
    //             result = true;
    //         }

    //     } else if (!req.query.postCategory) {
    //         result = true;
    //     } else if (!req.query.author) {
    //         result = true;
    //     }
    //     if (result === true) {
    //         return obj
    //     }
    //     // return result === true ? obj : undefined;
    //     //ss
    // });
    res.render('categories/index', { categories })
}))

router.get('/categories/:id', catchAsync(async (req, res, next) => {
    const categories = await Category.findById(req.params.id).populate('posts').populate('author')
    // console.log(categories)
    res.render('categories/category', { categories })
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