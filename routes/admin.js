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

// Render admin panel with add form and list of jobs (with pagination)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10; // Number of jobs per page
  const message = req.query.message || null;
  try {
    const totalJobs = await Job.countDocuments();
    const jobs = await Job.find()
      .sort({ postedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalPages = Math.ceil(totalJobs / limit);
    res.render('admin', { message, jobs, page, totalPages });
  } catch (error) {
    console.error(error);
    res.render('admin', { message: 'Error fetching job posts.', jobs: [] });
  }
});

// Handle job addition
router.post('/add', async (req, res) => {
  const { title, url, description, deadline, isFresher, isExperienced, jobCategory } = req.body;
  try {
    const newJob = new Job({
      title,
      url,
      description,
      deadline: deadline ? new Date(deadline) : null,
      isFresher: isFresher ? true : false,
      isExperienced: isExperienced ? true : false,
      jobCategory: jobCategory || undefined
    });
    await newJob.save();
    res.redirect('/admin?username=' + process.env.ADMIN_USERNAME + '&password=' + process.env.ADMIN_PASSWORD);
  } catch (error) {
    console.error(error);
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.render('admin', { message: 'Error adding job posting.', jobs });
  }
});

// Render the edit form for a job posting
router.get('/edit/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send('Job not found');
    }
    res.render('admin-edit', { job, message: null });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Handle job update from the edit form
router.post('/edit/:id', async (req, res) => {
  const { title, url, description, deadline, isFresher, isExperienced, jobCategory } = req.body;
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, {
      title,
      url,
      description,
      deadline: deadline ? new Date(deadline) : null,
      isFresher: isFresher ? true : false,
      isExperienced: isExperienced ? true : false,
      jobCategory: jobCategory || undefined
    }, { new: true });
    if (!updatedJob) {
      return res.status(404).send('Job not found');
    }
    // Redirect back to the admin panel with a success message
    res.redirect('/admin?username=' + process.env.ADMIN_USERNAME + '&password=' + process.env.ADMIN_PASSWORD + '&message=' + encodeURIComponent('Edit successful'));
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
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
