const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  // 👤 Owner
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  // 📝 Basic Info
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    maxlength: 5000
  },

  // 🏷️ Tags & Category
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  category: {
    type: String,
    enum: [
      "education",
      "entertainment",
      "music",
      "gaming",
      "technology",
      "news",
      "sports",
      "other"
    ],
    default: "other"
  },

  // 🎥 Media
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  videoId: {
    type: String
  },
  thumbnailId: {
    type: String
  },
//   duration: {
//     type: Number, // seconds
//     required: true
//   },

  // 📊 Stats (IMPORTANT for performance)
  views: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  likedBy: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
],
  dislikesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },


  // 🕒 Timestamps
  publishedAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Video",videoSchema);