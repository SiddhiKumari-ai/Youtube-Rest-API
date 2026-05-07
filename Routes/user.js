require('dotenv').config();
const express = require('express')
const Router = express.Router()
const cloudinary = require('cloudinary').v2
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SEC
})

// signup api
Router.post('/signup',async(req,res)=>{
    try
    {
        const users = await User.find({email:req.body.email})
        if(users.length > 0)
        {
            return res.status(409).json({
                error:'email already registered...'
            })
        }
        // const uploadedImage = await cloudinary.uploader.upload(req.files.photo.tempFilePath)
        const hash = await bcrypt.hash(req.body.password,10)

        const newUser = new User({
            fullName:req.body.fullName,
            email:req.body.email,
            phone:req.body.phone,
            password:hash,
            // imageUrl:uploadedImage.secure_url,
            // imageId:uploadedImage.public_id  
        })

        if(req.files)
        {
            const uploadedImage = await cloudinary.uploader.upload(req.files.photo.tempFilePath,{
                resource_type : "image",
                folder : "userPic"
            })

            newUser.imageUrl = uploadedImage.secure_url
            newUser.imageId = uploadedImage.public_id
        }

        const result = await newUser.save()
        res.status(200).json({
            msg:'account created',
            newUser:result
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

// login
Router.post('/login',async(req,res)=>{
    try
    {
        const users = await User.find({email:req.body.email})
        if(users.length == 0)
        {
            return res.status(404).json({
                error:'email not registered...'
            })
        }
        const isMatch = await bcrypt.compare(req.body.password,users[0].password)
        if(!isMatch)
        {
            return res.status(500).json({
                error:'invalid password'
            })
        }

        const newToken = await jwt.sign({
            userId:users[0]._id,
            fullName:users[0].fullName,
            email:users[0].email
        },
            process.env.SEC_KEY,
            {expiresIn:'365d'}
        )

        res.status(200).json({
            userId:users[0]._id,
            fullName:users[0].fullName,
            email:users[0].email,
            phone:users[0].phone,
            imageUrl:users[0].imageUrl,
            imageId:users[0].imageId,
            token:newToken
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