require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const { MongoClient, ObjectId } = require("mongodb");
const LocalStrategy = require("passport-local").Strategy;

const app = express();
const client = new MongoClient(process.env.MONGO_URI);

// підключення до манго
let db;
async function connectDB() {
  try {
    await client.connect();
    console.log("Успішно підключено до MongoDB Atlas");
    db = client.db(process.env.DB_NAME || "myDatabase");
  } catch (err) {
    console.error("Помилка підключення до MongoDB Atlas", err);
    process.exit(1);
  }
}
connectDB();

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
  const user = usersDB.find((u) => u.name === username);
  if (!user) return done(null, false, { message: "Немає такого користувача" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return done(null, false, { message: "Невірний пароль" });

  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = usersDB.find((u) => u.id === id);
  done(null, user || false);
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
app.get("/users", (req, res) => {
  res.render("pug/users", { users: usersDB, theme: res.locals.theme });
});

app.get("/users/:id", (req, res) => {
  const user = usersDB.find(u => u.id == req.params.id);
  if (!user) return res.status(404).send("Користувача не знайдено");
  res.render("pug/user", { user, theme: res.locals.theme });
});

// EJS
// статті
app.get("/articles", async (req, res) => {
  try {
    const articles = await db.collection("articles").find().toArray();
    res.render("ejs/articles.ejs", { articles, theme: res.locals.theme });
  } catch (err) {
    res.status(500).send("Помилка отримання статей");
  }
});

app.get("/articles/:id", async (req, res) => {
  try {
    const article = await db.collection("articles").findOne({ _id: new ObjectId(req.params.id) });
    if (!article) return res.status(404).send("Статтю не знайдено");
    res.render("ejs/article.ejs", { article, theme: res.locals.theme });
  } catch (err) {
    res.status(500).send("Помилка отримання статті");
  }
});

// маршрут з курсором
app.get("/api/articles/cursor", async (req, res) => {
  try {
    const database = db;
    const collection = database.collection("articles");

    const cursor = collection.find({});
    const results = [];

    while (await cursor.hasNext()) {
      const document = await cursor.next();
      results.push(document);
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
    const result = await db.collection("articles").aggregate(pipeline).toArray();
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

  let user = usersDB.find((u) => u.name === username);

  if (action === "register") {
    if (user)
      return res.send("Користувач вже існує! <a href='/auth'>Назад</a>");

    const hashed = await bcrypt.hash(password, 10);
    const newId = usersDB.length + 1;

    user = { id: newId, name: username, email, password: hashed };
    usersDB.push(user);

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

module.exports = app;