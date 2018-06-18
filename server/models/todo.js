const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  _creator: { type: mongoose.Schema.Types.ObjectId },
  todo: { type: String }
});

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
