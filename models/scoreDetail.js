const mongoose = require('mongoose');
const { Schema } = mongoose;


const scoreDetailSchema = ({
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    score: {
        type: Number,
    }
})

module.exports = mongoose.model('ScoreDetail', scoreDetailSchema);