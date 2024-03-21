const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { sendtoken } = require("../utils/SendToken");
const id3 = require("node-id3");
const crypto = require("crypto");
const multer = require("multer");
const { Readable } = require("stream");

const userModel = require("../models/userModel");
const songModel = require("../models/songModel");
const playlistModel = require("../models/playlistModel");
const { connectDatabase } = require("../models/database");
const mongoose = require("mongoose");

const imagekit = require("../utils/imagekit").initImagekit();
const path = require("path");

const conn = mongoose.connection;

var gfsImageBucket;

conn.once("open", () => {
  gfsImageBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "image",
  });
});

exports.home = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({ message: "welcome to home" });
});

exports.currentUser = catchAsyncErrors(async (req, res, next) => {
  // console.log(req.id)
  // const user = await userModel.findById(req.id);
  res.json({ user:req.user});
});

exports.userRegister = catchAsyncErrors(async (req, res, next) => {
  const user = await new userModel(req.body).save();
  sendtoken(user, 200, res);
  // Cannot set headers after they are sent to the client ? ye error res.json ek baar aur likhne se aarhi hai
  // res.json({ user });
});

exports.userLogin = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel
    .findOne({ email: req.body.email })
    .select("+password")
    .exec();

  if (!user) {
    return new ErrorHandler("user not found with this email address");
  }

  const isMatch = user.comparepassword(req.body.password);

  if (!isMatch) {
    return new ErrorHandler("worng password");
  }

  sendtoken(user, 200, res);
});

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(req.id, req.body).exec();
  res.status(200).json({ success: true, message: "user updated!", user });
});

// exports.updateImage = catchAsyncErrors(async (req, res, next) => {
//   // console.log(req.files.image)
//   const user = await userModel.findById(req.params.id).exec();
//   const file = req.files.image;

//   const modifiedfilename = `userImage-${Date.now()}${path.extname(file.name)}`;

//   const { fileId, url } = await imagekit.upload({
//     file: file.data,
//     fileName: modifiedfilename,
//   });

//   if (user.image.fileId !== "") {
//     await imagekit.deleteFile(user.image.fileId);
//   }

//   user.image = { fileId, url };
//   await user.save();

//   res
//     .status(200)
//     .json({ success: true, message: "file uploaded successfully" });
// });

exports.uploadImage = catchAsyncErrors(async (req, res, next) => {
  const loggedInUser = await userModel.findById(req.id).exec();
  const randomName = crypto.randomBytes(20).toString("hex");

  const imageData = id3.read(req.file.buffer);
  Readable.from(req.file.buffer).pipe(gfsImageBucket.openUploadStream(randomName));
  loggedInUser.image = { fileId: randomName, url: randomName };
  await loggedInUser.save();
  res
    .status(200)
    .json({ success: true, message: "file uploaded successfully" });
});

exports.getImage = catchAsyncErrors(async (req, res, next) => {
  try {
    gfsImageBucket.openDownloadStreamByName(req.params.fileId).pipe(res);
  } catch (error) {
    console.log(error);
  }
});


exports.userLogout = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  const token = user.getjwttoken();

  const option = {
    exipres: new Date(0),
    httpOnly: true,
    // secure:true
  };
  res
    .status(200)
    .cookie("token",'', option)
    .json({ message: "user logout!" });
});