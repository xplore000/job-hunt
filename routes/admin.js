// routes/admin.js
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Basic admin authentication middleware (using query parameters for demonstration)
router.use((req, res, next) => {
  const { username, password } = req.query;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    return next();
  } else {
    return res
      .status(401)
      .send(
        'Unauthorized: Please provide correct admin credentials as query parameters.'
      );
  }
});

// Render admin panel with add form and list of jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.render('admin', { message: null, jobs });
  } catch (error) {
    console.error(error);
    res.render('admin', { message: 'Error fetching job posts.', jobs: [] });
  }
});

// Handle job addition
router.post('/add', async (req, res) => {
  // Destructure the new fields along with the existing ones
  const { title, url, description, deadline, isFresher, isExperienced } = req.body;
  try {
    const newJob = new Job({
      title,
      url,
      description,
      // Convert deadline to a Date object if provided, otherwise leave as null.
      deadline: deadline ? new Date(deadline) : null,
      // Convert checkbox values to Booleans (true if checked, false otherwise)
      isFresher: isFresher ? true : false,
      isExperienced: isExperienced ? true : false
    });
    await newJob.save();
    res.render('admin', {
      message: 'Job posting added successfully!',
      jobs: await Job.find().sort({ postedAt: -1 })
    });
  } catch (error) {
    console.error(error);
    res.render('admin', {
      message: 'Error adding job posting.',
      jobs: await Job.find().sort({ postedAt: -1 })
    });
  }
});

// Handle job deletion
router.post('/delete/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.redirect(
      '/admin?username=' +
        process.env.ADMIN_USERNAME +
        '&password=' +
        process.env.ADMIN_PASSWORD
    );
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
