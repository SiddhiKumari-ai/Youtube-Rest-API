require('dotenv').config();
const express = require('express')
const Router = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Video = require('../models/Video')
const User = require('../models/User')
const cloudinary = require('cloudinary').v2


cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SEC
})



//----video upload----
Router.post('/upload',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)
        console.log(req.files.thumbnail)
        const uploadedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath,{
        resource_type: "image",
        folder: "thumbnail"
      })
      console.log(req.files.video)
        const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
        resource_type: "video",
        folder: "videos"
      })

      const newVideo = new Video({
        userId:tokenData.userId,
        title:req.body.title,
        description:req.body.description,
        tags:req.body.tags,
        videoUrl:uploadedVideo.secure_url,
        videoId:uploadedVideo.public_id,
        thumbnailUrl:uploadedThumbnail.secure_url,
        thumbnailId:uploadedThumbnail.public_id,
        category:req.body.category,
        // duration:req.body.duration
      })

      const result = await newVideo.save()
      res.status(200).json({
        video:result
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


//----get all videos---- 
Router.get('/all-video',async(req,res)=>{
  try
  {
    const allVideos = await Video.find().select("_id title thumbnailUrl userId  publishedAt").populate('userId',"fullName imageUrl")
    res.status(200).json({
      videos:allVideos
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

//----get video by id----
Router.get('/:id',async(req,res)=>{
  try
  {
    const video = await Video.findById(req.params.id).populate('userId','imageUrl fullName').populate('likedBy','fullName')
    console.log(video)
    // console.log(video.userId._id)
    const videoCreator = await User.findById(video.userId._id)
    video.views += 1
    await video.save()
    // console.log(videoCreator)
    const newResponse = {
      ...video._doc,
      subscribersCount:videoCreator.subscribers.length
    }

    res.status(200).json({
      video:newResponse
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

//----delete video----
Router.delete('/:id',async(req,res)=>{
  try
  {
    const token = req.headers.authorization.split(" ")[1]
    const tokenData = await jwt.verify(token,process.env.SEC_KEY)
    console.log('data',tokenData)
    
    const video = await Video.findById(req.params.id)
    if(video.userId != tokenData.userId)
    {
      return res.status(500).json({
        error:'invalide user!'
      })
    }

    await cloudinary.uploader.destroy(video.thumbnailId)
    await cloudinary.uploader.destroy(video.videoId,{
      resource_type:'video'
    })
    await Video.findByIdAndDelete(req.params.id)

    res.status(200).json({
      msg:'video deleted!'
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


// like and unlike
Router.post('/likeAndUnlike/:videoId',async(req,res)=>{
  try
  {
    
     const token = req.headers.authorization.split(" ")[1]
     const tokenData = await jwt.verify(token,process.env.SEC_KEY)
     const userId = tokenData.userId

     const video = await Video.findById(req.params.videoId)
     const isLiked = video.likedBy.includes(userId)
      

     if(isLiked)
     {
      // unlike
      video.likedBy = video.likedBy.filter(uId => uId != userId)
      video.likesCount -= 1
     }
     else
     {
      video.likedBy.push(userId)
      video.likesCount += 1
     }
     await video.save()
     res.status(200).json({
      likeCount:video.likesCount
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

// dislike and remove dislike api
Router.post('/dislike/:videoId',async(req,res)=>{
  try
  {
    const token = req.headers.authorization.split(" ")[1]
    const tokenData = await jwt.verify(token,process.env.SEC_KEY)

    const video = await findById(req.params.videoId)
    const isDisliked = video.dislikedBy.includes(tokenData.userId)

    if(isDisliked)
    {
      video.dislikedBy = video.dislikedBy.filter(userId => userId != video.userId) //which means, dislikedBy wale array me un sare userIds ko dalo jo not equal h tokenData k userId se
      //filter:- un sb ko rakho jo es condition ko satisfy kre.. means uska userId, tokenData k userId se match nhi kra too usko usi array me rkho, warna hata doo...
      video.dislikesCount -= 1
    }
    else
    {
      video.dislikedBy.push(tokenData.userId)
      video.disLikesCount += 1
    }


    res.status(200).json({
      dislikesCount : video.dislikesCount
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


module.exports = Router