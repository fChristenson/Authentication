const express = require("express");
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const isLoggedIn = require("./middlewares/isLoggedIn");
const User = require("./models/user");

const app = express();
const saltRounds = 10;

const pathTo = fileName => {
  return path.resolve(__dirname, "..", "public", fileName);
};

app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    secret: "very secret", // never save the production secret in your repo
    resave: false,
    saveUninitialized: true
  })
);

app.use(express.static(path.resolve(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.sendFile(pathTo("index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(pathTo("login.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user) {
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (isCorrectPassword) {
      req.session.userId = user.id;
      return res.redirect("/welcome");
    }
  }

  // don't send 404 if the user is not found, attackers can use this information
  res.redirect("/401");
});

app.get("/register", (req, res) => {
  res.sendFile(pathTo("register.html"));
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const encryptedPassword = await bcrypt.hash(password, saltRounds);

  // in a real application we would first check if there already is a user
  // among other things, this is why you should keep this code somewhere
  // outside your controllers, otherwise they grow super big.
  const user = new User({ username, password: encryptedPassword });

  await user.save();
  res.redirect("/login");
});

// remember, checking if someone is logged in is just one
// thing we could want to check, what if the user tries to update something
// that isn't theirs?
app.get("/welcome", isLoggedIn, (req, res) => {
  res.sendFile(pathTo("welcome.html"));
});

app.get("/401", (req, res) => {
  res.sendFile(pathTo("401.html"));
});

app.get("/logout", async (req, res) => {
  await req.session.destroy();
  res.redirect("/");
});

module.exports = app;
