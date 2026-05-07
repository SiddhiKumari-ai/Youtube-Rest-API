const mongoose = require('mongoose')

const replySchema = new mongoose.Schema({

    userId: {   // reply karne wala
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    commentId: {   // kis comment pe reply hai
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        required: true
    },

    replyText: {
        type: String,
        required: true
    },

    time: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });


const commentSchema = new mongoose.Schema({

    videoId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Video',
        required : true
    },

    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    videoOwnerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    text : {
        type : String,
        required : true
    },
    likes : {
        type : Number,
        default : 0
    },
    likedBy : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        }
    ],
        dislikes : {
        type : Number,
        default : 0
    },
    dislikedBy : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        }
    ],

    reply : [replySchema],
    time : {
        type : Date,
        default : Date.now
    }
},
{
    timestamps : true
})

module.exports = mongoose.model('Comment', commentSchema)