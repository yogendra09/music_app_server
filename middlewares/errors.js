exports.generatedErrors = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (
    (err.name =
      "MongoServerError" && err.message.includes("E11000 duplicate key error"))
  ) {
    err.message = "user with email address already exists";
  }

  res.status(statusCode).json({
    message: err.message,
    errName: err.name,
    stack: err.stack,
  });
};
