const express = require('express');
const router = express.Router({ mergeParams: true });
const Post = require('../models/post');
const User = require('../models/user');
const catchAsync = require('../utils/CatchAsync');
const { isLoggedIn, isPostAuthor, validatePost, isPostAvailable } = require('../middleware');
const multer = require('multer');
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({ storage });



router.get('/', catchAsync(async (req, res, next) => {
    const categories = await Post.aggregate(
        [{
            $group: {
                _id: "$postCategoryId",
                "authorId": { "$first": "$author" },
                "postCategory": { "$first": "$postCategory" },
                count: { $sum: 1 }
            }
        }]
    );
    for (let cat of categories) {
        cat.author = await User.findById(cat.authorId);
    }
    console.log(categories)
    // console.log(req.query)
    newCat = categories.filter((obj) => {
        result = false;
        if (req.query.postCategory) {
            if (obj.postCategory.toLowerCase().includes(req.query.postCategory.toLowerCase())) {
                result = true;
            }
        } else if (req.query.author) {
            if (obj.author.username.toLowerCase().includes(req.query.author.toLowerCase())) {
                result = true;
            }

        } else if (!req.query.postCategory) {
            result = true;
        } else if (!req.query.author) {
            result = true;
        }
        if (result === true) {
            return obj
        }
        // return result === true ? obj : undefined;
    });

    res.render('posts/index', { newCat });
}))
router.get('/new', isLoggedIn, (req, res) => {
    res.render('posts/new');
})
router.get('/:id', isPostAvailable, catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id)
        .populate({ path: 'comments', populate: { path: 'author' } })
        .populate('author');
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
    res.redirect(`/posts/${post._id}`);
}))
router.post('/:id/unhide', isLoggedIn, isPostAuthor, catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    post.isAvailable = "true";
    post.save()
    req.flash('success', "Soal telah dibuka kembali.");
    res.redirect(`/posts/${post._id}`);
}))
router.post('/', isLoggedIn, upload.array('post[image]'), validatePost, catchAsync(async (req, res, next) => {
    const post = new Post(req.body.post);
    post.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    post.author = req.user._id;
    post.postCategoryId = post.postCategory + "___" + req.user._id;
    post.isAvailable = "true";
    const user = await User.findById(req.user._id);
    user.posts.push(post._id);
    await post.save();
    await user.save();
    //console.log(post);
    req.flash('success', 'Berhasil membuat soal.')
    res.redirect(`/posts/${post._id}`);
}))

// router.post('/', upload.array('post[image]'), (req, res,) => {
//     console.log(req.body, req.files);
//     res.send('it worked')
// })
router.put('/:id', isLoggedIn, isPostAuthor, upload.array('post[image]'), validatePost, catchAsync(async (req, res, next) => {
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
    await Post.findByIdAndDelete(id);
    req.flash('success', 'Berhasil menghapus soal.')
    res.redirect("/posts");
}))

module.exports = router;