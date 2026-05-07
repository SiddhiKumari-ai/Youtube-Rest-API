require('dotenv').config();
const express = require('express')
const Router = express()
const Comment = require('../models/Comment')
const jwt = require('jsonwebtoken')
const Video = require('../models/Video')
const User = require('../models/User')

//----Adding a comment----
Router.post('/add-comment/:videoId',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token,process.env.SEC_KEY)

        const video = await Video.findById(req.params.videoId)
        
        newComment = new Comment ({
            videoId : req.params.videoId,
            videoOwnerId : video.userId,
            userId : tokenData.userId,
            text : req.body.text
        })

        const addComment = await newComment.save()

        video.commentsCount += 1
        await video.save()

        res.status(200).json({
            newComment : addComment,
            commentsCount : video.commentsCount
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error : err
        })
    }
})

//get all comments by id
Router.get('/all-comments/:videoId',async(req,res) => {
    try
    {
       const comments = await Comment.find({videoId:req.params.videoId})//.select("videoOwnerId userId text")
       //console.log(comments)

       res.status(200).json({
        allComments : comments
       })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error : err
        })
        
    }
})

//----like and unlike----
Router.post('/like/:comId',async(req,res)=>{
    try
    {
         const token = req.headers.authorization.split(" ")[1]
         const tokenData = await jwt.verify(token,process.env.SEC_KEY)

         const comment = await Comment.findById(req.params.comId)
         
        if(!comment)
         {
            return res.status(404).json({
                error : "Comment not found!"
            })
         }

         const isLiked = comment.likedBy.includes(tokenData.userId)
         const isDisliked = comment.dislikedBy.includes(tokenData.userId)

        if(isLiked)
        {
            comment.likedBy = comment.likedBy.filter(uId => uId != tokenData.userId)
            comment.likes -= 1
        }
        else
        {
            comment.likedBy.push(tokenData.userId)
            comment.likes += 1

             if(isDisliked)
            {
                comment.dislikedBy = comment.likedBy.filter(uId => uId != tokenData.userId)
                comment.dislikes -= 1   
            }
        }

        const result = await comment.save()

        res.status(200).json({
            likes:comment.likes,
            likedBy : comment.likedBy,
            dislikes : comment.dislikes,
            dislikedBY : comment.dislikedBy
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})


//----dislikes----
Router.post('/dislike/:comId',async(req,res)=>{
    try
    {
         const token = req.headers.authorization.split(" ")[1]
         const tokenData = await jwt.verify(token,process.env.SEC_KEY)

         const comment = await Comment.findById(req.params.comId)

         if(!comment)
         {
            return res.status(404).json({
                error : "Comment not found!"
            })
         }

         const isDisliked = comment.dislikedBy.includes(tokenData.userId)
         const isLiked = comment.likedBy.includes(tokenData.userId)
         

        if(isDisliked)
        {
            comment.dislikedBy = comment.dislikedBy.filter(uId => uId != tokenData.userId)
            comment.dislikes -= 1
        }
        else
        {
            comment.dislikedBy.push(tokenData.userId)
            comment.dislikes += 1
            
            if(isLiked)
            {
                comment.likedBy = comment.likedBy.filter(uId => uId != tokenData.userId)
                comment.likes -= 1   
            }
        }

        const result = await comment.save()

        res.status(200).json({
            dislikes:comment.dislikes,
            dislikedBy : comment.dislikedBy,
            likes : comment.likes,
            likedBy : comment.likedBy 
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})


//----update the comment----
Router.patch('/updateComment/:comId', async(req,res)=>{
    try 
    {
        token = req.headers.authorization.split(" ")[1]
        tokenData = await jwt.verify(token,process.env.SEC_KEY)

        const comment = await Comment.findById(req.params.comId)

        if(tokenData.userId != comment.userId)
        {
            return res.status(404).json({
                error : "Invalid user, you can't update this comment!"
            })
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            req.params.comId,
            {text : req.body.text},
            {new : true} // es line se console me log or response bhejne time updated wla jata h.. warna pehle wla de deta...
        )

        res.status(200).json({
            msg : "Comment Updated",
            comment : updatedComment
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

Router.post('/reply/:comId', async (req, res) => {
    try {

        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const comment = await Comment.findById(req.params.comId)

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            })
        }

        const newReply = {
            userId: tokenData.userId,
            commentId: req.params.comId,
            replyText: req.body.replyText
        }

        comment.reply.push(newReply)

        await comment.save()

        res.status(200).json({
            message: "Reply added successfully",
            reply: comment.reply
        })

    }
    catch (err) {
        console.log(err)

        res.status(500).json({
            error: err.message
        })
    }
})

module.exports = Router