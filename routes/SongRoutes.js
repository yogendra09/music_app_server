const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  uploadMusic,
  streamMusic,
  poster,
  likeSong,
  searchSong,
  createPlaylist,
  myPlaylist,
  AddSongToplaylist,
  playlistSongs,
  userLikedSongs,
} = require("../controllers/songController");
const { isAuthenticated } = require("../middlewares/auth");
const { allSongs } = require("../controllers/songController");
const { Readable } = require("stream");
const  mongoose  = require("mongoose");
const conn = mongoose.connection;
conn.once("open", () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "audio",
  });
  gfsBucketPoster = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "poster",
  });
});



//stream music source to play music
router.get("/stream/:musicName", streamMusic);
//poster source to play music
router.get("/poster/:posterName", poster);

const storage = multer.memoryStorage();
const upload = multer({storage:storage});

router.post("/uploadmusic",isAuthenticated,upload.array("song"),uploadMusic)

router.post("/allsongs", allSongs);

router.post("/likesong/:songId", isAuthenticated, likeSong);

router.post("/likedSongs", isAuthenticated, userLikedSongs);

router.get("/search/:songName", searchSong);

router.post("/create/playlist", isAuthenticated, createPlaylist);

router.post("/myplaylist", isAuthenticated, myPlaylist);

router.post("/add/playlist", isAuthenticated, AddSongToplaylist);

router.post("/playlistSongs/:id", isAuthenticated, playlistSongs);

module.exports = router;
