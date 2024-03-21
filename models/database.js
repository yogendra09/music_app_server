const mongoose = require("mongoose");

exports.connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("databse connected!");
  } catch (error) {
    console.log(error.messsage);
  }
};
