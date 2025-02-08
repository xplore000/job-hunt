const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Home page: List job postings with pagination, search, and date filtering
router.get('/', async (req, res) => {
  // Determine the current page (default to 1)
  let page = parseInt(req.query.page) || 1;
  
  // Set the default limit (desktop: 6, mobile: 3)
  let limit = 6;
  if (/mobile/i.test(req.headers['user-agent'])) {
    limit = 3;
  }
  
  // Calculate the number of documents to skip
  const skip = (page - 1) * limit;
  
  // Extract search and date filter query parameters
  const search = req.query.search || '';
  const filterDate = req.query.filterDate || '';

  // Build the query object
  let query = {};

  // If a search term is provided, match against title and description (case-insensitive)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // If a date filter is specified, adjust the query for the postedAt field
  if (filterDate) {
    let startDate, endDate;
    const now = new Date();
    switch (filterDate) {
      case 'today':
        // Jobs posted from today's midnight until tomorrow's midnight
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'yesterday':
        // Jobs posted yesterday (from yesterday's midnight to today's midnight)
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      // Additional date filters can be added here
      default:
        break;
    }
    if (startDate && endDate) {
      query.postedAt = { $gte: startDate, $lt: endDate };
    }
  }

  try {
    // Count total jobs that match the query
    const totalJobs = await Job.countDocuments(query);

    // Retrieve jobs matching the query, sorted by posted date (newest first) with pagination
    const jobs = await Job.find(query)
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate total pages
    const totalPages = Math.ceil(totalJobs / limit);

    // Render the index page, passing along query parameters to maintain state
    res.render('index', { jobs, page, totalPages, search, filterDate });
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
