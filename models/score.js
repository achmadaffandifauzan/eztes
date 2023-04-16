const mongoose = require('mongoose');
const { Schema } = mongoose;


const scoreSchema = ({
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    scoreCategory: {
        type: Number,
    }
})

module.exports = mongoose.model('Score', scoreSchema);