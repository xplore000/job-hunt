// Example update to your Job model
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
  jobCategory: { type: String },
  employmentType: { type: String, enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY'], default: 'FULL_TIME' },
  location: {
    streetAddress: { type: String },
    addressLocality: { type: String },
    addressRegion: { type: String },
    postalCode: { type: String },
    addressCountry: { type: String }
  }
});

JobSchema.plugin(AutoIncrement, { inc_field: 'jobId' });

module.exports = mongoose.model('Job', JobSchema);
