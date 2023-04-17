const express = require('express');
const router = express.Router({ mergeParams: true });
const Category = require('../models/category');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const catchAsync = require('../utils/CatchAsync');
const Score = require('../models/score');
const ScoreDetail = require('../models/scoreDetail');
const { cloudinary } = require('../cloudinary');
const dayjs = require('dayjs');

router.get('/categories', catchAsync(async (req, res, next) => {
    //https://stackoverflow.com/questions/5539955/how-to-paginate-with-mongoose-in-node-js
    let limit = 10;
    let page = (Math.abs(req.query.page) || 0);

    if (req.query.categoryName && req.query.authorName) {
        var categories = await Category.find({
            "categoryName": { '$regex': req.query.categoryName, $options: 'i' },
            "authorName": { '$regex': req.query.authorName, $options: 'i' },
        }).limit(limit).skip(limit * page)
    } else if (req.query.categoryName) {
        var categories = await Category.find({
            "categoryName": { '$regex': req.query.categoryName, $options: 'i' },
        }).limit(limit).skip(limit * page)
    } else if (req.query.authorName) {
        var categories = await Category.find({
            "authorName": { '$regex': req.query.authorName, $options: 'i' },
        }).limit(limit).skip(limit * page)
    } else {
        var categories = await Category.find({}).limit(limit).skip(limit * page)
    }
    // console.log(categories)
    // console.log(req.query)
    let pageBefore = (page == 0) ? 0 : page - 1;
    let pageAfter = page + 1;
    res.render('categories/index', { categories, pageBefore, pageAfter })
}))

router.get('/categories/:id', catchAsync(async (req, res, next) => {
    const categories = await Category.findById(req.params.id).populate('posts').populate('author')
    // console.log(categories)
    res.render('categories/category', { categories })
}))
router.get('/categories/:id/answerer', catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    // const comments = await Comment.aggregate([
    //     { "$match": { 'category': category._id } },
    //     { "$group": { _id: "$author" } },
    // ])
    // let Answerer = [];
    // for (let comment of comments) {
    //     Answerer.push(await User.findById(comment))
    // }         ====>>>> new model update already has answerer in the category
    // console.log(Answerer)
    // console.log(category.answerer)
    const scores = await Score.find({ category: category._id, user: { $in: category.answerer } })
    const users = await User.find({ _id: { $in: category.answerer } });
    // console.log(category.answerer, users, scores)
    res.render('categories/answerer', { category, scores, users })
}))
router.get('/categories/:id/setWeight', catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id).populate('posts');
    res.render('categories/setWeight', { category })
}))
router.post('/categories/:id/setWeight', catchAsync(async (req, res, next) => {
    // console.log(req.body.postWeights)
    const category = await Category.findById(req.params.id);
    for (let post of category.posts) {
        // console.log(req.body.postWeights[post._id])
        await Post.findByIdAndUpdate(post._id, { weight: req.body.postWeights[post._id] })
        // await Post.findOneAndUpdate({ _id: post._id }, { weight: req.body.postWeights[post._id] })  ==> somehow in loop doesn't work
    }
    req.flash('success', 'Berhasil memberi bobot soal')
    res.redirect(`/categories/${req.params.id}`)
}))
// router.post('/categories/:id/close', catchAsync(async (req, res, next) => {
//     const category = await Category.findById(req.params.id).populate('posts');
//     for (let answerer of category.answerer) {
//         for (let post of category.posts) {
//             if (post.answerer)
//         }
//     }
// }))
router.get('/categories/:id/:userID', catchAsync(async (req, res, next) => {
    const { id, userID } = req.params;
    const userComment = await User.findById(userID);
    const category = await Category.findById(id).populate('author');
    const posts = await Post.find({ category: category._id });
    const comments = await Comment.find({ author: userID, category: category._id });
    res.render('categories/evaluate', { category, posts, comments, userComment });
}))
// generate score (in evaluate post)
router.post('/categories/:id/:userID', catchAsync(async (req, res, next) => {
    const { id, userID } = req.params;
    const user = await User.findById(userID);
    const category = await Category.findById(id).populate('posts');
    // check if weight is set
    console.log(category)
    if (!category.posts[0].weight) {
        req.flash("error", "Anda belum menyetel bobot soal!")
        return res.redirect(`/categories/${category._id}`)
    };
    let scoreDetailObj = {
        'user': user._id,
    };
    let limitScore = 0;
    let scoreSum = 0;
    // to model ScoreDetail
    let scoreByPosts = Object.entries(req.body.score) // iterate an object
    for (let scoreObj of scoreByPosts) {
        console.log(scoreObj)
        scoreDetailObj['category'] = category._id;
        scoreDetailObj['user'] = user._id;
        // get the post id from scoreObj, where storeObj = ['postID', 'score']
        scoreDetailObj['post'] = scoreObj[0];
        // score is number score * weight of it's post
        // console.log(category.posts)
        const post = await Post.findById(scoreObj[0])
        scoreDetailObj['score'] = scoreObj[1] * post.weight;

        console.log(scoreDetailObj['score'])
        let scoreDetail = await ScoreDetail.findOneAndUpdate({ category: category._id, user: user._id, post: scoreObj[0] },
            { score: scoreDetailObj['score'] }, { new: true });

        if (!scoreDetail) {
            scoreDetail = new ScoreDetail(scoreDetailObj);
        }
        await scoreDetail.save();
        scoreSum += scoreDetailObj['score'];
        limitScore += 100 * post.weight;
    }
    // to model Score
    scoreCategory = scoreSum / limitScore * 100;
    let score = await Score.findOneAndUpdate({ category: category._id, user: user._id },
        { scoreCategory: scoreCategory }, { new: true });

    if (!score) {
        score = new Score({
            category: category._id,
            user: user._id,
            scoreCategory: scoreCategory
        })
    }
    const currentTime = dayjs().format("HH:mm");
    const currentDate = dayjs().format("D MMM YY");
    score.lastScored = `${currentTime} - ${currentDate}`;
    await score.save();
    req.flash('success', 'Nilai Berhasil Dibuat')
    res.redirect(`/categories/${id}`)
}))

router.delete('/categories/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    await Category.findByIdAndDelete(id);


    // deleting category => deleting dependencies up (user) and down (posts)=> deleting dependencies's dependencies

    // dependencies up
    // deleting post dependencies in user
    await User.findByIdAndUpdate({ _id: category.author }, { $pull: { posts: { $in: category.posts } } });
    // deleting category dependencies in user
    await User.findByIdAndUpdate({ _id: category.author }, { $pull: { categories: category._id } });

    // dependencies down
    // deleting comments dependencies in posts
    // also deleting images of posts
    for (let post of category.posts) {
        // why not just langsung category.comments ? because category.posts is not populating comments, so we must manually findById
        const postDB = await Post.findById(post);
        if (postDB.images.length > 0) {
            for (let image of postDB.images) {
                await cloudinary.uploader.destroy(image.filename);
            }
        }
        await Comment.deleteMany({ _id: { $in: postDB.comments } })
    }
    // deleting post
    await Post.deleteMany({ _id: { $in: category.posts } });


    req.flash('success', 'Berhasil menghapus kategori beserta seluruh soal dan jawabannya.')
    res.redirect(`/categories`);
}))


module.exports = router;