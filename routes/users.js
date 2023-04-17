const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const Category = require('../models/category');
const catchAsync = require('../utils/CatchAsync');
const { isLoggedIn, isGuest } = require('../middleware');
const ExpressError = require('../utils/ExpressError');
const dayjs = require('dayjs');

router.get('/register', isGuest, (req, res) => {
    res.render('users/register');
})
router.post('/register', isGuest, catchAsync(async (req, res, next) => {
    try {
        const { name, email, username, password } = req.body.user;
        const newUser = new User({ email, username, name });
        const registeredUser = await User.register(newUser, password);
        const currentTime = dayjs().format("HH:mm");
        const currentDate = dayjs().format("D MMM YY");
        newUser.dateCreated = `${currentTime} - ${currentDate}`;
        await newUser.save();
        req.login(registeredUser, (error) => {
            if (error) return next(error);
            req.flash('success', 'Anda berhasil terdaftar.');
            res.redirect('/categories');
        })

    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
}));
router.get('/login', isGuest, (req, res) => {
    res.render('users/login');
})
router.post('/login', isGuest, passport.authenticate('local',
    { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }),
    catchAsync(async (req, res, next) => {
        req.flash('success', 'Anda berhasil login.');
        const redirectUrl = req.session.lastPath || '/categories';
        delete req.session.lastPath;
        res.redirect(redirectUrl);
    }));

router.get('/logout', isLoggedIn, catchAsync(async (req, res, next) => {
    req.logout((error) => {
        if (error) return next(error)
        req.flash('success', "Anda berhasil logout.");
        res.redirect('/categories');
    });
}))

router.get('/:userId', catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const posts = await Post.find({ author: user }).populate('comments');
    const categories = await Category.find({ author: user });
    let totCategories = Object.keys(categories).length;
    let totPosts = 0;
    for (let category of categories) {
        console.log(category)
        let post = Object.values(category.posts).length;
        totPosts += post;
    };
    let authorCommentsObj = []
    for (let p of posts) {
        if (p.comments) {
            for (let c of p.comments) {
                authorCommentsObj.push(c.author)
            }
        }
    };
    let totAnswer = authorCommentsObj.length;
    // console.log(authorCommentsObj)
    const authorCommentsGroupedObj = await Comment.aggregate([
        { $match: { 'author': { $in: authorCommentsObj } } },
        { $group: { _id: '$author', count: { $sum: 1 } } }
    ]);
    // console.log(authorCommentsGroupedObj)
    let totAnswerer = authorCommentsGroupedObj.length;

    // console.log(totAnswerer)
    // console.log(totAnswer)
    res.render('users/show', { user, categories, totCategories, totPosts, totAnswerer, totAnswer });
}))

module.exports = router;