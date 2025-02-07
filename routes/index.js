// routes/index.js
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Existing route: List all job postings
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.render('index', { jobs });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// New route: Display job details
router.get('/job/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      res.render('job-details', { job });
    } else {
      res.status(404).send('Job not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Optional: Redirect route if you still want the original behavior
router.get('/go/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      return res.redirect(job.url);
    }
    res.status(404).send('Job not found');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
