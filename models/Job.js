const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const JobSchema = new mongoose.Schema({
  jobId: { type: Number },
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  postedAt: { type: Date, default: Date.now },
  deadline: { type: Date },
  isFresher: { type: Boolean, default: false },
  isExperienced: { type: Boolean, default: false },
  jobCategory: { type: String }
});

// Automatically increment the jobId field for each new job posting
JobSchema.plugin(AutoIncrement, { inc_field: 'jobId' });

module.exports = mongoose.model('Job', JobSchema);
