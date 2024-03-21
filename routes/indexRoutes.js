const express = require("express");
const router = express.Router();
const app = express();
const {
  home,
  userRegister,
  userLogin,
  currentUser,
  uploadMusic,
  test,
  streamMusic,
  poster,
  updateProfile,
  updateImage,
  uploadImage,
  getImage,
  userLogout,
} = require("../controllers/indexController");
const { isAuthenticated } = require("../middlewares/auth");
const multer = require("multer");

//home
router.get("/", home);

//current user
router.post("/user", isAuthenticated, currentUser);

//user register
router.post("/register", userRegister);

// user login
router.post("/login", userLogin);
router.post("/logout", isAuthenticated ,userLogout);

router.post("/updateProfile", isAuthenticated, updateProfile);

// router.post("/updateImage/:id", isAuthenticated, updateImage);

const storage = multer.memoryStorage();
const upload = multer({storage}) ;

router.post("/uploadimage", isAuthenticated,upload.single("image"),uploadImage);

router.get("/getimage/:fileId",getImage);


module.exports = router;
