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
        const { email, username, password } = req.body.user;
        const newUser = new User({ email, username });
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
// router.post('/requestFriend/:friendId/:currentId', isLoggedIn, catchAsync(async (req, res, next) => {
//     const { currentId, friendId } = req.params;
//     const user = await User.findById(friendId);
//     user.friendRequests.push(currentId);
//     await user.save()
//     res.redirect(`/${friendId}`);
// }))
// router.post('/:friendId/:currentId', isLoggedIn, catchAsync(async (req, res, next) => {
//     const { currentId, friendId } = req.params;
//     const user = await User.findById(currentId);
//     user.friends.push(friendId);
//     const user2 = await User.findById(friendId);
//     user2.friends.push(currentId);
//     await User.findByIdAndUpdate(currentId, { $pull: { friendRequests: friendId } });
//     await user.save()
//     await user2.save()
//     res.redirect(`/${friendId}`);
// }))
// router.delete('/:friendId/:currentId', isLoggedIn, catchAsync(async (req, res, next) => {
//     const { currentId, friendId } = req.params;
//     const user = await User.findByIdAndUpdate(currentId, { $pull: { friends: friendId } });
//     const user2 = await User.findByIdAndUpdate(friendId, { $pull: { friends: currentId } });
//     await user.save()
//     await user2.save()
//     res.redirect(`/${friendId}`);
// }))
router.get('/logout', isLoggedIn, catchAsync(async (req, res, next) => {
    req.logout((error) => {
        if (error) return next(error)
        req.flash('success', "Anda Berhasil logout.");
        res.redirect('/categories');
    });
}))
// dont forget to change to user/:userId/ later
router.get('/:userId/', catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('posts').populate('friendRequests').populate('friends');
    const currentUser = req.user;
    if (currentUser) {
        const user2 = await User.findById(currentUser._id);
        const isFriend = user2.friends.includes(user._id) ? true : false;
        res.render('users/show', { user, isFriend })
    } else {
        res.render('users/show', { user })
    }
}))

module.exports = router;