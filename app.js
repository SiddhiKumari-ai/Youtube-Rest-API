require('dotenv').config();
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const userRoute = require('./Routes/user')
const videoRoute = require('./Routes/video')
const commentRoute = require('./Routes/comments')
const fileUpload = require('express-fileupload')


const connectDB = async()=>{
    try
    {
        console.log("Mongo URL:", process.env.MONGODB_URL)
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Connected with Database...")
        
    }
    catch(err)
    {
        console.log(err)
        console.log("Something is wrong!")
    }
}

connectDB()

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())


app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/temp/'
}))

app.use('/user',userRoute)
app.use('/video',videoRoute)
app.use('/comments',commentRoute)

module.exports = app