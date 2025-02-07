// models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  postedAt: { type: Date, default: Date.now },
  // Deadline is optional; if not provided, it will be null.
  deadline: { type: Date }
});

module.exports = mongoose.model('Job', JobSchema);
