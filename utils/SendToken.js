exports.sendtoken = (user, statuscode, res) => {
  const token = user.getjwttoken();

  const options = {
    exipres: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
    // jab https par chalyege tab kar denge secure true
  };
  res
    .status(statuscode)
    .cookie("token", token, options)
    .json({ success: true, id: user._id, token,user });
};
