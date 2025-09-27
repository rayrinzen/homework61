const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  author: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Article", articleSchema);
