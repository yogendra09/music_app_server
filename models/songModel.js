const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  tittle: String,
  artist: String,
  album: String,
  size: Number,
  poster: String,
  fileName: {
    type: String,
    required: true,
  },
  category: [
    {
      type:String,
      enum: ["english","hindi"],
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
  }
});

module.exports = mongoose.model("song", songSchema);
