if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methorOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require('helmet');

// const { JSDOM } = require("jsdom");
// const { window } = new JSDOM("");
// const $ = require("jquery")(window);

const categoriesRoutes = require("./routes/categories");
const usersRoutes = require("./routes/users");
const postsRoutes = require("./routes/posts");
const commentsRoutes = require("./routes/comments");

const MongoStore = require('connect-mongo');


const mongoSanitize = require('express-mongo-sanitize');

//process.env.DB_URL
//mongodb://127.0.0.1:27017/sekawan2
const dbUrl = "mongodb://127.0.0.1:27017/sekawan2";
mongoose.set("strictQuery", true);
mongoose.connect(dbUrl);

mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongoose.connection.once("open", () => {
  console.log("Database Connected ~mongoose");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methorOverride("_method"));
app.use(mongoSanitize());

const secret = process.env.SECRET || "asecret";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60 // time period in seconds
})
store.on('error', function (e) {
  console.log("SESSION STORE ERROR : ", e)
})
const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure:true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 2,
    maxAge: 1000 * 60 * 60 * 24,
  },
};
app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  // "https://code.jquery.com/",
];
const styleSrcUrls = [
  "https://cdn.jsdelivr.net/",
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://fonts.google.com/",
];
const connectSrcUrls = [
];
const fontSrcUrls = [
  "https://fonts.gstatic.com/",
  "https://fonts.googleapis.com/",
  "https://fonts.google.com/",
];
app.use(
  helmet({ crossOriginEmbedderPolicy: false, }),
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dgny2tywl/",
        "https://images.unsplash.com/",
        "https://drive.google.com/",
        "https://www.youtube.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", categoriesRoutes);
app.use("/posts", postsRoutes);
app.use("/posts/:id/comments", commentsRoutes);
app.use("/", usersRoutes);


app.get("/", (req, res) => {
  res.render("about");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Not Found!", 404));
});
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} ~express`));

