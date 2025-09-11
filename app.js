const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

const users = [
  { id: 1, name: "Андрій", email: "andriy@example.com" },
  { id: 2, name: "Діма", email: "dyma@example.com" },
];
const articles = [
  { id: 1, title: "Перша стаття", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: 2, title: "Друга стаття", content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
];

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));

app.engine("pug", require("pug").__express);
app.engine("ejs", require("ejs").__express);

// Глав стр
app.get("/", (req, res) => {
  res.render("index.pug"); 
});

// PUG
app.get("/users", (req, res) => {
  res.render("pug/users.pug", { users });
});

app.get("/users/:id", (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (!user) return res.status(404).send("Користувача не знайдено");
  res.render("pug/user.pug", { user });
});

// EJS
app.get("/articles", (req, res) => {
  res.render("ejs/articles.ejs", { articles });
});

app.get("/articles/:id", (req, res) => {
  const article = articles.find(a => a.id == req.params.id);
  if (!article) return res.status(404).send("Статтю не знайдено");
  res.render("ejs/article.ejs", { article });
});

app.listen(port, () => {
  console.log(`Сервер працює на http://localhost:${port}`);
});

