const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { sendtoken } = require("../utils/SendToken");
const id3 = require("node-id3");
const crypto = require("crypto");

const userModel = require("../models/userModel");
const songModel = require("../models/songModel");
const playlistModel = require("../models/playlistModel");
const { connectDatabase } = require("../models/database");
const mongoose = require("mongoose");
const { Readable } = require("stream");

const conn = mongoose.connection;

var gfsBucket, gfsBucketPoster;
conn.once("open", () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "audio",
  });
  gfsBucketPoster = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "poster",
  });
});

exports.uploadMusic = catchAsyncErrors(async (req, res, next) => {
  const loggedInUser = await userModel.findById(req.id);
  let newSong;
  await Promise.all(
    req.files.map(async (file) => {
      const randomName = crypto.randomBytes(20).toString("hex");

      const songData = id3.read(file.buffer);
      // console.log(songData);
      Readable.from(file.buffer).pipe(gfsBucket.openUploadStream(randomName));
      Readable.from(songData.image.imageBuffer).pipe(
        gfsBucketPoster.openUploadStream(randomName + "poster")
      );

      newSong = await songModel.create({
        tittle: songData.title,
        artist: songData.artist,
        album: songData.album,
        size: file.size,
        poster: randomName + "poster",
        fileName: randomName,
      });
    })
  );
  loggedInUser.uploadedSongs.push(newSong._id);
  newSong.userId = loggedInUser._id;
  await newSong.save();
  await loggedInUser.save();
  res.status(200).json({ message: "songs uploaded" });
});

exports.streamMusic = catchAsyncErrors(async (req, res, next) => {
  const currentSong = await songModel.findOne({
    fileName: req.params.musicName,
  });

  console.log(currentSong);

  const stream = gfsBucket.openDownloadStreamByName(req.params.musicName);

  res.set("Content-Type", "audio/mpeg");
  res.set("Content-Length", currentSong.size + 1);
  res.set(
    "Content-Range",
    `bytes 0-${currentSong.size - 1}/${currentSong.size}`
  );
  res.set("Content-Ranges", "byte");
  res.status(206);

  stream.pipe(res);
});

exports.poster = catchAsyncErrors(async (req, res, next) => {
  if(req.params.posterName){
    gfsBucketPoster.openDownloadStreamByName(req.params.posterName).pipe(res);
  }else{
    res.staus(400).json({message:"not found"});
  }
});

exports.allSongs = catchAsyncErrors(async (req, res, next) => {
  const song = await songModel.find().populate("likes").exec();
  res.json({ song });
});

exports.userLikedSongs = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findById(req.id).exec();

  res.json({ likedSongs: user.liked });
});

exports.likeSong = catchAsyncErrors(async (req, res, next) => {
  const loggedInUser = await userModel.findById(req.id).exec();
  if (!loggedInUser) return;
  const song = await songModel
    .findOne({
      _id: req.params.songId,
    })
    .exec();
  const songIndex = loggedInUser.liked.indexOf(song._id);
  const userIndex = song.likes.indexOf(loggedInUser._id);
  if (songIndex === -1) {
    loggedInUser.liked.push(song._id);
    song.likes.push(loggedInUser._id);
  } else {
    loggedInUser.liked.splice(songIndex, 1);
    song.likes.splice(userIndex, 1);
  }
  await loggedInUser.save();
  await song.save();
});

exports.searchSong = catchAsyncErrors(async (req, res, next) => {
  let regexp = new RegExp("^" + req.params.songName, "i");
  const songs = await songModel
    .find({
      album: regexp,
    })
    .exec();
  res.json({ songs });
});

exports.createPlaylist = catchAsyncErrors(async (req, res, next) => {
  const loggedInUser = await userModel.findById(req.id);
  const playlist = await playlistModel.create({
    Name: req.body.name,
  });
  playlist.owner.push(loggedInUser._id);
  loggedInUser.playlist.push(playlist._id);
  await loggedInUser.save();
  await playlist.save();
});

exports.myPlaylist = catchAsyncErrors(async (req, res, next) => {
  const loggedInUser = await userModel.findById(req.id).populate("playlist");
  // const playlist = req
  const playlist = await playlistModel.find().exec();
  res.json({ playlist });
});

exports.AddSongToplaylist = catchAsyncErrors(async (req, res, next) => {
  const loggedInUser = await userModel.findById(req.id).exec();
  const playlist = await playlistModel.findById(req.body.playlistId).exec();
  const song = await songModel.findById(req.body.songId);
  if (playlist.songs.indexOf(song._id) === -1) {
    playlist.songs.push(song._id);
  }
  await playlist.save();
  // await song.save();
});

exports.playlistSongs = catchAsyncErrors(async (req, res, next) => {
  if (req.params.id !== "likedSongs") {
    const playlist = await playlistModel
      .findById(req.params.id)
      .populate("songs")
      .exec();
    res.json({ playlist: playlist.songs });
  } else {
    const loggedInUser = await userModel.findById(req.id).populate("liked");
    console.log(loggedInUser.liked);
    res.json({ playlist: loggedInUser.liked });
  }
});
