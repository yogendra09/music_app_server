require("dotenv").config({ path: "./.env" });
const express = require("express");
const mongoStore = require("connect-mongo");
const app = express();
const path = require("path");
app.use(require("cors")({ origin: true, credentials: true }));

require("./models/database.js").connectDatabase();
//loger
const logger = require("morgan");
app.use(logger("tiny"));

//body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const expressSession = require("express-session");
const cookieparser = require("cookie-parser");

app.use(
  expressSession({
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 2 },
    store: mongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      autoRemove: "disabled",
    }),
  })
);
app.use(cookieparser());

// const fileupload = require("express-fileupload");
// app.use(fileupload());
app.use("/", require("./routes/indexRoutes.js"));
app.use("/song", require("./routes/SongRoutes.js"));
if (process.env.NODE_ENV == "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "frontend/out")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "out", "index.html"));
  });
} else {
  app.get("/",(req,res)=> res.send("server is ready"));
}

const ErrorHandler = require("./utils/ErrorHandler.js");
const { generatedErrors } = require("./middlewares/errors.js");

app.all("*", (req, res, next) => {
  next(new ErrorHandler(`requsted url not found ${req.url}`), 404);
});
app.use(generatedErrors);

app.listen(
  process.env.PORT,
  console.log(`server running on port ${process.env.PORT}`)
);
