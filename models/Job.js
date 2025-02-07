const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  postedAt: { type: Date, default: Date.now },
  deadline: { type: Date, required: true }  // New field for application deadline
});

module.exports = mongoose.model('Job', JobSchema);
