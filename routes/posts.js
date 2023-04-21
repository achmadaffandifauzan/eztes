const express = require('express');
const router = express.Router({ mergeParams: true });
const Post = require('../models/post');
const User = require('../models/user');
const Category = require('../models/category');
const Comment = require('../models/comment');
const catchAsync = require('../utils/CatchAsync');
const { isLoggedIn, isPostAuthor, validatePost, isPostAvailable } = require('../middleware');
const multer = require('multer');
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({ storage });
const dayjs = require('dayjs');


router.get('/posts/new', isLoggedIn, (req, res) => {
    res.render('posts/new');
})
router.get('/posts/:id', isPostAvailable, catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id)
        .populate({ path: 'comments', populate: { path: 'author' } })
        .populate('author');
    // console.log(post)
    //console.log(post.isAvailable)
    if (!post) {
        req.flash('error', "Soal tidak tersedia.");
        return res.redirect('/posts')
    } else {
        res.render('posts/show', { post });
    }
}))
router.get('/posts/:id/edit', isLoggedIn, isPostAuthor, catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        req.flash('error', "Soal tidak tersedia.");
        return res.redirect('/posts')
    } else {
        res.render('posts/edit', { post });
    }
}))
router.post('/posts/:id/hide', isLoggedIn, isPostAuthor, catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    post.isAvailable = "false";
    post.save()
    req.flash('success', "Soal telah ditutup.");
    res.redirect(`/categories/${post.category}`);
}))
router.post('/posts/:id/unhide', isLoggedIn, isPostAuthor, catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    post.isAvailable = "true";
    post.save()
    req.flash('success', "Soal telah dibuka kembali.");
    res.redirect(`/categories/${post.category}`);
}))
router.post('/posts', isLoggedIn, upload.array('post[image]'), validatePost, catchAsync(async (req, res, next) => {
    const post = new Post(req.body.post);
    // console.log(req.body.post)
    post.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    post.author = req.user._id;
    post.isAvailable = "true";
    post.postCategory = req.body.post.postCategory;
    const currentTime = dayjs().format("HH:mm");
    const currentDate = dayjs().format("D MMM YY");
    post.dateCreated = `${currentTime} - ${currentDate}`;

    const user = await User.findById(req.user._id);
    user.posts.push(post._id);

    // check if category is not exist (new category)
    let category = await Category.findOne({ categoryName: post.postCategory, author: post.author });
    // console.log(category)
    if (category) {
        category.posts.push(post);
        post.category = category;
        const currentTime = dayjs().format("HH:mm");
        const currentDate = dayjs().format("D MMM YY");
        category.lastEdited = `${currentTime} - ${currentDate}`;
    } else {
        category = new Category({ categoryName: post.postCategory, author: post.author });
        category.authorName = user.name;
        category.posts.push(post);
        const currentTime = dayjs().format("HH:mm");
        const currentDate = dayjs().format("D MMM YY");
        category.dateCreated = `${currentTime} - ${currentDate}`;
        user.categories.push(category); // applies only to new category created / new seeds
        post.category = category;
    }

    await post.save();
    await user.save();
    await category.save();
    req.flash('success', 'Berhasil membuat soal.')
    res.redirect(`/posts/${post._id}`);
}))

router.put('/posts/:id', isLoggedIn, isPostAuthor, upload.array('post[image]'), validatePost, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    const imagesArr = req.files.map(file => ({ url: file.path, filename: file.filename }));
    post.images.push(...imagesArr);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await post.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    const currentTime = dayjs().format("HH:mm");
    const currentDate = dayjs().format("D MMM YY");
    post.lastEdited = `${currentTime} - ${currentDate}`;
    post.save();
    req.flash('success', 'Berhasil memperbarui soal.')
    res.redirect(`/posts/${id}`);
}))

router.delete('/posts/:id', isLoggedIn, isPostAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (post.images.length > 0) {
        for (let image of post.images) {
            await cloudinary.uploader.destroy(image.filename);
        }
    }
    await Post.findByIdAndDelete(id);
    const category = await Category.findById(post.category);

    // deleting post => deleting dependencies up (category and user) and down (comments)=> deleting dependencies's dependencies
    // console.log("ASSSSSSSSSSSS")


    // dependencies up
    await Category.findOneAndUpdate({ _id: post.category }, { $pull: { posts: post._id } });
    await User.findOneAndUpdate({ _id: post.author }, { $pull: { posts: post._id } });

    // dependencies down
    await Comment.deleteMany({ _id: { $in: post.comments } });


    req.flash('success', 'Berhasil menghapus soal.')
    res.redirect(`/categories/${category._id}`);
}))

module.exports = router;