const express = require('express');
const router = express.Router({ mergeParams: true });
const Post = require('../models/post');
const User = require('../models/user');
const Category = require('../models/category');
const catchAsync = require('../utils/CatchAsync');
const { isLoggedIn, isPostAuthor, validatePost, isPostAvailable } = require('../middleware');
const multer = require('multer');
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({ storage });


router.get('/new', isLoggedIn, (req, res) => {
    res.render('posts/new');
})
router.get('/:id', isPostAvailable, catchAsync(async (req, res, next) => {
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
router.get('/:id/edit', isLoggedIn, isPostAuthor, catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        req.flash('error', "Soal tidak tersedia.");
        return res.redirect('/posts')
    } else {
        res.render('posts/edit', { post });
    }
}))
router.post('/:id/hide', isLoggedIn, isPostAuthor, catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    post.isAvailable = "false";
    post.save()
    req.flash('success', "Soal telah ditutup.");
    res.redirect(`/categories/${post.category}`);
}))
router.post('/:id/unhide', isLoggedIn, isPostAuthor, catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    post.isAvailable = "true";
    post.save()
    req.flash('success', "Soal telah dibuka kembali.");
    res.redirect(`/categories/${post.category}`);
}))
router.post('/', isLoggedIn, upload.array('post[image]'), catchAsync(async (req, res, next) => {
    const post = new Post(req.body.post);
    post.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    post.author = req.user._id;
    post.isAvailable = "true";
    post.postCategory = req.body.post.postCategory;

    const user = await User.findById(req.user._id);
    user.posts.push(post._id);

    let category = await Category.findById(post.category);
    if (category) {
        category.posts.push(post);
        post.category = category;
    } else {
        category = new Category({ categoryName: post.postCategory, author: post.author });
        category.authorName = user.name;
        category.posts.push(post);
        user.categories.push(category); // applies only to new category created / new seeds
        post.category = category;
    }

    await post.save();
    await user.save();
    await category.save();
    req.flash('success', 'Berhasil membuat soal.')
    res.redirect(`/posts/${post._id}`);
}))

// router.post('/', upload.array('post[image]'), (req, res,) => {
//     console.log(req.body, req.files);
//     res.send('it worked')
// })
router.put('/:id', isLoggedIn, isPostAuthor, upload.array('post[image]'), catchAsync(async (req, res, next) => {
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
    post.save();
    //console.log("___________UPDATED____________", post)
    req.flash('success', 'Berhasil memperbarui soal.')
    res.redirect(`/posts/${id}`);
}))

router.delete('/:id', isLoggedIn, isPostAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    const category = await Category.findById(post.category);
    await Category.findByIdAndUpdate({ _id: post.category }, { $pull: { posts: id } });
    await User.findByIdAndUpdate({ _id: post.author }, { $pull: { posts: id } });
    await Post.findByIdAndDelete(id);
    req.flash('success', 'Berhasil menghapus soal.')
    res.redirect(`/categories/${category._id}`);
}))

module.exports = router;