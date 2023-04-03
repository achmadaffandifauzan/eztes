const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');
const User = require('../models/user');
const Post = require('../models/post');
const catchAsync = require('../utils/CatchAsync');
const { isLoggedIn } = require('../middleware');
const ExpressError = require('../utils/ExpressError');

router.get('/register', (req, res) => {
    res.render('users/register');
})
router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { name, email, username, password } = req.body.user;
        const newUser = new User({ email, username, name });
        const registeredUser = await User.register(newUser, password);
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
router.get('/login', (req, res) => {
    res.render('users/login');
})
router.post('/login', passport.authenticate('local',
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
    const user = await User.findById(userId).populate('posts');
    res.render('users/show', { user });
}))

module.exports = router;