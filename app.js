const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;
const SECRET = "supersecretkey";

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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
const users = [
  { id: 1, name: "Андрій", email: "andriy@example.com" },
  { id: 2, name: "Діма", email: "dyma@example.com" },
];
const articles = [
  { id: 1, title: "Перша стаття", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: 2, title: "Друга стаття", content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
];

const usersDB = [];

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
  const allUsers = [
    ...users,
    ...usersDB.map(u => ({ id: u.id, name: u.name, email: u.email }))
  ];
  res.render("pug/users", { users: allUsers, theme: res.locals.theme });
});

app.get("/users/:id", (req, res) => {
  const allUsers = [
    ...users,
    ...usersDB.map(u => ({ id: u.id, name: u.name, email: u.email }))
  ];
  const user = allUsers.find(u => u.id == req.params.id);
  if (!user) return res.status(404).send("Користувача не знайдено");
  res.render("pug/user", { user, theme: res.locals.theme });
});


// EJS
app.get("/articles", (req, res) => {
  res.render("ejs/articles.ejs", { articles, theme: res.locals.theme });
});

app.get("/articles/:id", (req, res) => {
  const article = articles.find(a => a.id == req.params.id);
  if (!article) return res.status(404).send("Статтю не знайдено");
  res.render("ejs/article.ejs", { article, theme: res.locals.theme });
});


// авторизація 
app.get("/auth", (req, res) => {
  res.render("auth", { theme: res.locals.theme });
});

app.post("/auth", async (req, res) => {
  const { username, password, action } = req.body;

  let user = usersDB.find((u) => u.name === username);


 // реєстрація
if (action === "register") {
  if (user) return res.send("❌ Користувач вже існує! <a href='/auth'>Назад</a>");
  const hashed = await bcrypt.hash(password, 10);

  // айди ведет счёт после юзерса
  const newId = users.length + usersDB.length + 1;

  user = { 
    id: newId, 
    name: username,
    email: req.body.email,
    password: hashed 
  };
  usersDB.push(user);
}


  // логін
  if (!user) return res.status(401).send(" Невірний логін або пароль");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).send(" Невірний логін або пароль");

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    SECRET,
    { expiresIn: "1h" }
  );

  res.cookie("token", token, { httpOnly: true });
  res.redirect("/protected");
});

app.get("/protected", auth, (req, res) => {
  res.render("protected", { user: req.user, theme: res.locals.theme });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth");
});

function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/auth");
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.redirect("/auth");
  }
}

app.listen(port, () => {
  console.log(`Сервер працює на http://localhost:${port}`);
});
