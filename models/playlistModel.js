const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  poster: {
    type:String,
    default:'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "song",
  }],
  owner: [{
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref: "user",
  }],
 
});

module.exports = mongoose.model("playlist", playlistSchema);
