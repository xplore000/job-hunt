const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Simple admin authentication middleware
router.use((req, res, next) => {
  const { username, password } = req.query; // Using query parameters for demonstration
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    return next();
  } else {
    return res.status(401).send('Unauthorized: Please provide correct admin credentials as query parameters.');
  }
});

// Render the admin panel (updated to include job listings)
router.get('/', async (req, res) => {
  try {
    // Fetch all job postings to display in the admin panel
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.render('admin', { message: null, jobs });
  } catch (error) {
    console.error(error);
    res.render('admin', { message: 'Error fetching job posts.', jobs: [] });
  }
});

// Route to handle adding a new job posting
router.post('/add', async (req, res) => {
  const { title, url, description, deadline } = req.body;
  try {
    const newJob = new Job({ 
      title, 
      url, 
      description, 
      deadline: new Date(deadline)  // Convert the deadline string to a Date object
    });
    await newJob.save();
    res.render('admin', { message: 'Job posting added successfully!', jobs: await Job.find().sort({ postedAt: -1 }) });
  } catch (error) {
    console.error(error);
    res.render('admin', { message: 'Error adding job posting.', jobs: await Job.find().sort({ postedAt: -1 }) });
  }
});

// New route: Handle deletion of a job posting
router.post('/delete/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    // After deletion, redirect back to the admin panel with a refreshed list of jobs
    res.redirect('/admin?username=' + process.env.ADMIN_USERNAME + '&password=' + process.env.ADMIN_PASSWORD);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
