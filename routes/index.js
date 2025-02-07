// routes/index.js
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Home page: List job postings with pagination
router.get('/', async (req, res) => {
  // Determine the current page (default to 1)
  let page = parseInt(req.query.page) || 1;
  
  // Set the default limit to 6 (desktop)
  let limit = 6;
  
  // If the user-agent indicates a mobile device, reduce the limit to 3
  if (/mobile/i.test(req.headers['user-agent'])) {
    limit = 3;
  }
  
  // Calculate the number of documents to skip
  const skip = (page - 1) * limit;
  
  try {
    // Count the total number of jobs
    const totalJobs = await Job.countDocuments();
    
    // Retrieve jobs for the current page
    const jobs = await Job.find()
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalJobs / limit);
    
    res.render('index', { jobs, page, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Job details page
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

// (Optional) Redirect directly to the job URL if needed
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
