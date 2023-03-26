const express = require('express');
const router = express.Router({ mergeParams: true });
const Category = require('../models/category');
const catchAsync = require('../utils/CatchAsync');

router.get('/categories', catchAsync(async (req, res, next) => {
    const categories = await Category.find({}).populate('author')
    res.render('categories/index', { categories })
}))

router.get('/categories/:id', catchAsync(async (req, res, next) => {
    const categories = await Category.findById(req.params.id).populate('posts').populate('author')
    console.log(categories)
    res.render('categories/category', { categories })
}))

module.exports = router;