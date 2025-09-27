require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Article = require("./models/Article");
const User = require("./models/User");


const app = express();

// підключення до манго
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Підключено через Mongoose"))
.catch((err) => console.error("Помилка Mongoose:", err));

// middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "tajemnica",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.set("views", path.join(__dirname, "views"));
app.engine("pug", require("pug").__express);
app.engine("ejs", require("ejs").__express);
app.set("view engine", "pug");

// тема дефолт
app.use((req, res, next) => {
  res.locals.theme = req.cookies.theme || "dark";
  next();
});

// дані
const usersDB = [];

// passport
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ name: username });
    if (!user) return done(null, false, { message: "Немає такого користувача" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: "Невірний пароль" });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});



// головна
app.get("/", (req, res) => {
  res.render("index", { theme: res.locals.theme });
});

// теми
app.get("/theme/:mode", (req, res) => {
  const mode = req.params.mode;
  if (["dark", "light"].includes(mode)) {
    res.cookie("theme", mode, { maxAge: 900000 });
  }
  res.redirect("/");
});

// PUG 
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.render("pug/users", { users, theme: res.locals.theme });
  } catch (err) {
    res.status(500).send("Помилка отримання користувачів");
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("Користувача не знайдено");
    res.render("pug/user", { user, theme: res.locals.theme });
  } catch (err) {
    res.status(500).send("Помилка отримання користувача");
  }
});

// EJS
// статті
app.get("/articles", async (req, res) => {
  try {
    const articles = await Article.find();
    res.render("ejs/articles.ejs", { articles, theme: res.locals.theme });
  } catch (err) {
    res.status(500).send("Помилка отримання статей");
  }
});

app.get("/articles/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).send("Статтю не знайдено");
    res.render("ejs/article.ejs", { article, theme: res.locals.theme });
  } catch (err) {
    res.status(500).send("Помилка отримання статті");
  }
});

// маршрут з курсором
app.get("/api/articles/cursor", async (req, res) => {
  try {
    const cursor = Article.find().cursor();
    const results = [];
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      results.push(doc);
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// агрегаційний запит
app.get("/api/articles/stats", async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: "$author", count: { $sum: 1 } } }
    ];
    const result = await Article.aggregate(pipeline);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// авторизація 
app.get("/auth", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/protected"); 
  }
  res.render("auth", { theme: res.locals.theme });
});

// реєстрація
app.post("/auth", async (req, res) => {
  const { username, password, email, action } = req.body;

  if (action === "register") {
    const existing = await User.findOne({ name: username });
    if (existing) return res.send("Користувач вже існує! <a href='/auth'>Назад</a>");

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name: username, email, password: hashed });

    return res.redirect("/auth");
  }

  res.redirect("/auth");
});

// login
app.post("/login",
  passport.authenticate("local", { failureRedirect: "/auth" }),
  (req, res) => {
    res.redirect("/protected");
  }
);

function auth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/auth");
}

app.get("/protected", auth, (req, res) => {
  res.render("protected", { user: req.user, theme: res.locals.theme });
});

app.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/auth");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});


module.exports = app;