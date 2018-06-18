require("./config/config");
require("./db/mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const authenticate = require("./middleware/authenticate");
const Todo = require("./models/todo");
const User = require("./models/user");

app.use(bodyParser.json());

app.get("/todos", authenticate, (req, res) => {
  Todo.find({ _creator: req.user._id })
    .then(todos => res.json({ todos }))
    .catch(err => res.status(500).send(err));
});

app.post("/todos", authenticate, (req, res) => {
  new Todo({
    _creator: req.user._id,
    todo: req.body.todo
  })
    .save()
    .then(doc => res.json(doc))
    .catch(err => res.status(500).send(err));
});

app.post("/users", (req, res) => {
  const user = new User({
    email: req.body.email,
    password: req.body.password
  });
  user
    .generateAuthToken()
    .then(token => {
      res.header("x-auth", token).json(user);
    })
    .catch(err => res.status(500).json(err));
});

app.post("/users/login", (req, res) => {
  User.findByCredentials(req.body.email, req.body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

app.delete("/users/logout", authenticate, (req, res) => {
  req.user
    .removeToken(req.token)
    .then(() => {
      res.status(200).send();
    })
    .catch(() => {
      res.status(500).send();
    });
});

app.listen(process.env.PORT, () => {
  console.log(`Secure todos server running on port ${process.env.PORT}`);
});
