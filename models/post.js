const mongoose = require('mongoose');
const Comment = require('./comment')
const { Schema } = mongoose;

const imageSchema = new Schema({
    url: String,
    filename: String
});
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const postSchema = new Schema({
    title: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: true,
    },
    images: [imageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
        }
    ],
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
    },
    postCategory: {
        type: String,
    },
    isAvailable: {
        type: String,
        default: "true",
    },
    type: {
        type: String,
        enum: ['options', 'essay']
    },
    options: [{
        type: String,
    }],
    key: {
        type: Number,
    },
});


// why here? 
// 1. find out
// 2. because if we trigger Post.findOneAndDelete in another router, we dont need to re write code inside many route. 
// in router, it findByIdAndDelete, but here with findOneAndDelete is still triggered
postSchema.post('findOneAndDelete', async function (doc) {
    // console.log("ASSSSSSSSSSSS")
    // postSchema.post : after triggering findOneAndDelete, this function wil be triggered
    if (doc) {
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
})


module.exports = mongoose.model('Post', postSchema);

// let contoh = {
//     tipe : "pilgan",
//     options : {
//         1 : 'asda',
//         2 : 'asssda',
//         3 : 'assdda',
//         4 : 'asffda',
//         5 : 'asfgda',
//     },
//     key : {
//         1 : true,
//     }
// }