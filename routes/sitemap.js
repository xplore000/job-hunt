// routes/sitemap.js
const express = require('express');
const router = express.Router();
const Job = require('../models/Job'); // Adjust path if necessary

router.get('/', async (req, res) => {
  try {
    // 1. Fetch all job data from your database
    const jobs = await Job.find().sort({ postedAt: -1 });
    
    // 2. Start building the XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    // Note: The namespace "xmlns" is for the standard sitemap protocol
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // 3. For each job, create a <url> entry
    jobs.forEach((job) => {
      // Typically, you’d generate a URL with a slug or use job._id
      // Example: https://example.com/job/123
      // Replace "example.com" with your domain or use your production URL
      const jobUrl = `https://joblooker.info/job/${job._id}`;
      
      // Optionally use job.postedAt or updatedAt for <lastmod>
      const lastModified = new Date(job.postedAt).toISOString().split('T')[0];
      
      xml += `
        <url>
          <loc>${jobUrl}</loc>
          <lastmod>${lastModified}</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.7</priority>
        </url>
      `;
    });

    // 4. Close the urlset
    xml += `</urlset>`;

    // 5. Set the correct Content-Type and send the XML
    res.header('Content-Type', 'application/xml');
    res.send(xml);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
