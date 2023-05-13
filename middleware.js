const { postSchema, commentSchema, userSchema } = require("./joiSchemas");
const Post = require('./models/post');
const Category = require('./models/category');
const Comment = require('./models/comment');
const catchAsync = require('./utils/CatchAsync');
const ExpressError = require('./utils/ExpressError');
const sanitizeHtml = require('sanitize-html');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // req.session.lastPath = req.originalUrl;
        // //console.log(req.query._method)
        // if (req.query._method === 'DELETE') { req.session.lastPath = '/posts'; } //prevent error because redirecting on link with post / delete / put method create an error
        req.flash('error', "Anda belum login!");
        return res.redirect('/login');
    }
    return next();
}
module.exports.isGuest = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.flash('error', "You're still logged in!");
        return res.redirect('/categories');
    }
    return next();
}
module.exports.isCategoryAuthor = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id)
    if (category.author.equals(req.user._id)) {
        return next();
    } else {
        req.flash('error', "Anda tidak memiliki izin untuk itu!");
        res.redirect(`/categories`)
    }
})
module.exports.isPostAuthor = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id)
    if (post.author.equals(req.user._id)) {
        return next();
    } else {
        req.flash('error', "Anda tidak memiliki izin untuk itu!");
        res.redirect(`/posts/${req.params.id}`)
    }
})
module.exports.isCommentAuthor = catchAsync(async (req, res, next) => {
    const { id, commentId } = req.params;
    const comment = await Comment.findById(commentId)
    if (comment.author.equals(req.user._id)) {
        return next();
    } else {
        req.flash('error', "Anda tidak memiliki izin untuk itu!");
        res.redirect(`/posts/${id}`)
    }
})


module.exports.isPostAvailable = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id)
    if (post.isAvailable === "true") {
        return next();
    } else if (req.user) {
        if (post.author.equals(req.user._id)) {
            return next();
        }
    } else {
        req.flash('error', "Soal telah ditutup!");
        res.redirect(`/${post.author}/${post.postCategoryId}`)
    }
})

module.exports.isCategoryAvailable = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id)
    if (category.isAvailable === "true") {
        return next();
    } else if (req.user) {
        if (category.author.equals(req.user._id)) {
            return next();
        }
    } else {
        req.flash('error', "Kategori telah ditutup!");
        res.redirect(`/categories`)
    }
})

module.exports.verifyToken = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (req.user) {
        if (category.author.equals(req.user._id)) {
            return next();
        }
    }
    if (!category.accessToken) {
        return next();
    } else if (!req.query.token) {
        res.redirect(`/categories/${category._id}/formtoken`);
    } else if (category.accessToken === req.query.token) {
        return next();
    } else {
        req.flash('error', 'Token tidak sesuai.');
        res.redirect(`/categories/${category._id}/formtoken`);
    }
})
module.exports.validatePost = (req, res, next) => {
    // this joiSchema only catch error if user pass the client side validation anyway (the bootstrap form validation)
    // ==> why using { ...req.body } ?
    // ==> because: req.body :
    // [Object: null prototype] {
    //     post: [Object: null prototype] {
    //       title: 'asdssada',
    //       description: 'dadasdasdasdas',
    //       postCategory: 'asd',
    //       type: 'essay'
    //     }
    //   }
    // ==> are supposed to be:
    //  {
    //     post: {
    //       title: 'asdssada',
    //       description: 'dadasdasdasdas',
    //       postCategory: 'asd',
    //       type: 'essay'
    //     }
    //   }
    const { error } = postSchema.validate({ ...req.body });
    if (error) {
        // mapping error(s) then joining them to single array of single string
        const messageErr = error.details.map(x => x.message).join(',');
        throw new ExpressError(messageErr, 400);
    } else {
        return next();
    }
}
module.exports.validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if (error) {
        // mapping error(s) then joining them to single array of single string
        const messageErr = error.details.map(x => x.message).join(',');
        throw new ExpressError(messageErr, 400);
    } else {
        return next();
    }
}
module.exports.validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        // mapping error(s) then joining them to single array of single string
        const messageErr = error.details.map(x => x.message).join(',');
        throw new ExpressError(messageErr, 400);
    } else {
        return next();
    }
}

module.exports.validateWeight = (req, res, next) => {
    let weight = ["0", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];
    for (let key in req.body.postWeights) {
        if (req.body.postWeights.hasOwnProperty(key)) {
            if (!weight.includes(req.body.postWeights[key])) {
                throw new ExpressError("Tidak diperbolehkan!", 403);
            }
        }
    }
    return next();
}
module.exports.sanitizeScore = (req, res, next) => {
    for (let i = 0; i < req.body.score.length; i++) {
        let score = sanitizeHtml(req.body.score[i], {
            allowedTags: [],
            allowedAttributes: {},
        });
        req.body.score[i] = score;
    }
    return next();
}
module.exports.validateQuery = (req, res, next) => {
    //https://stackoverflow.com/questions/388996/regex-for-javascript-to-allow-only-alphanumeric
    var alphanumeric = /^[a-z0-9]+$/i;
    if (req.query.authorName) {
        if (!req.query.authorName.match(alphanumeric)) {
            throw new ExpressError("Tidak diperbolehkan mencari dengan kata kunci itu!", 403);
        }
    }
    if (req.query.categoryName) {
        if (!req.query.categoryName.match(alphanumeric)) {
            throw new ExpressError("Tidak diperbolehkan mencari dengan kata kunci itu!", 403);
        }
    }
    return next();
}