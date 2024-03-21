const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: [true, "First Name is required"],
      // minLength: [4, "First Name must not contain more than 14 characters"],
    },
    image: {
      type: Object,
      default:{
        fileId:'',
        url:"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      }
    },
    email: {
      type: String,
      unique: true,
      // required: [true, "Email is required"],
      // match: [
      //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      //   "Please fill a valid email address",
      // ],
    },
    // contact: {
    //   type: String,
    //   required: [true, "Contact is required"],
    //   minLength: [10, "Contact must contain 10 characters"],
    //   maxLength: [10, "Contact must contain 10 characters"],
    // },
    resetPasswordToken: {
      type: String,
      default: "0",
    },
    playlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "playlist",
      },
    ],
    uploadedSongs:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"song"
    }],
    liked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "song",
      },
    ],

    password: {
      type: String,
      select: false,
      // required: [true, "password is required"],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  if (!this.isModified("password")) {
    return;
  }

  let salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
});

userSchema.methods.comparepassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.getjwttoken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model("user", userSchema);
