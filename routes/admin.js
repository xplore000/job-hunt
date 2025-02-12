// routes/admin.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Import Mongoose models
const Job = require('../models/Job');
const Visitor = require('../models/Visitor');

// --- ADMIN AUTHENTICATION MIDDLEWARE ---
// (For demonstration, admin credentials are passed as query parameters)
router.use((req, res, next) => {
  const { username, password } = req.query;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).send('Unauthorized: Please provide correct admin credentials as query parameters.');
  }
});

// --- GET /admin ---
// Render admin panel with add form and list of jobs (with pagination)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10; // jobs per page
  const message = req.query.message || null;
  try {
    const totalJobs = await Job.countDocuments();
    const jobs = await Job.find()
      .sort({ postedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalPages = Math.ceil(totalJobs / limit);
    // Passing the process object so that our views can access environment variables
    res.render('admin', { message, jobs, page, totalPages, process });
  } catch (error) {
    console.error(error);
    res.render('admin', { message: 'Error fetching job posts.', jobs: [], page, totalPages: 0, process });
  }
});

// --- POST /admin/add ---
// Handle job addition (and send email notifications if requested)
router.post('/add', async (req, res) => {
  const {
    title,
    url,
    description,
    deadline,
    isFresher,
    isExperienced,
    jobCategory,
    employmentType,
    streetAddress,
    addressLocality,
    addressRegion,
    postalCode,
    addressCountry,
    sendEmail // checkbox value ("on" if checked)
  } = req.body;

  try {
    const newJob = new Job({
      title,
      url,
      description,
      deadline: deadline ? new Date(deadline) : null,
      isFresher: isFresher ? true : false,
      isExperienced: isExperienced ? true : false,
      jobCategory: jobCategory || undefined,
      employmentType,
      location: {
        streetAddress,
        addressLocality,
        addressRegion,
        postalCode,
        addressCountry
      }
    });

    await newJob.save();

  // If "Send Email Notification" checkbox is checked, send email notifications
if (sendEmail) {
  // Retrieve all subscriber emails from the database
  const subscribers = await Visitor.find();
  const emailList = subscribers.map(subscriber => subscriber.email);

  if (emailList.length > 0) {
    // Configure Nodemailer transport using Gmail credentials
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    // Compute job type string (e.g., "Fresher / Experienced")
    let jobTypeStr = "";
    if (newJob.isFresher || newJob.isExperienced) {
      const types = [];
      if (newJob.isFresher) types.push("Fresher");
      if (newJob.isExperienced) types.push("Experienced");
      jobTypeStr = types.join(" / ");
    } else {
      jobTypeStr = "Not specified";
    }

    // Compose the email HTML (without the job description)
    let emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header Section -->
          <div style="background-color: #007BFF; padding: 20px; text-align: center;">
            <h2 style="margin: 0; color: #ffffff; font-size: 24px;">New Job Opportunity</h2>
          </div>
          <!-- Body Section -->
          <div style="padding: 20px; color: #333333;">
            <h3 style="font-size: 20px; margin-top: 0;">${newJob.title}</h3>
            ${newJob.jobCategory ? `<p style="font-size: 16px; margin: 8px 0;">Category: ${newJob.jobCategory}</p>` : ''}
            <p style="font-size: 16px; margin: 8px 0;">Job Type: ${jobTypeStr}</p>
            <p style="font-size: 16px; margin: 8px 0;">Application Deadline: ${newJob.deadline ? new Date(newJob.deadline).toLocaleDateString() : "Closing soon – apply at the earliest"}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${req.protocol}://${req.get('host')}/job/${newJob._id}" 
                 style="background-color: #007BFF; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-size: 16px; display: inline-block;">
                View Job Details
              </a>
            </div>
          </div>
          <!-- Footer Section -->
          <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #777777;">
            <p style="margin: 0;">Thank you for subscribing to Job Looker.</p>
          </div>
        </div>
      </div>
    `;

    let mailOptions = {
      from: '"Job Looker" <noreply@joblooker.com>',
      bcc: emailList,
      subject: 'New Job Posting on Job Looker',
      html: emailHtml
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending emails:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}


    res.redirect(`/admin?username=${process.env.ADMIN_USERNAME}&password=${process.env.ADMIN_PASSWORD}&message=${encodeURIComponent('Job posted successfully! Email notifications sent.')}`);
  } catch (error) {
    console.error(error);
    res.redirect(`/admin?username=${process.env.ADMIN_USERNAME}&password=${process.env.ADMIN_PASSWORD}&message=${encodeURIComponent('Error adding job posting.')}`);
  }
});

// --- GET /admin/edit/:id ---
// Render the edit form for a job posting
router.get('/edit/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send('Job not found');
    }
    res.render('admin-edit', { job, message: null, process });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// --- POST /admin/edit/:id ---
// Handle job update from the edit form
router.post('/edit/:id', async (req, res) => {
  const {
    title,
    url,
    description,
    deadline,
    isFresher,
    isExperienced,
    jobCategory,
    employmentType,
    streetAddress,
    addressLocality,
    addressRegion,
    postalCode,
    addressCountry
  } = req.body;

  try {
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title,
        url,
        description,
        deadline: deadline ? new Date(deadline) : null,
        isFresher: isFresher ? true : false,
        isExperienced: isExperienced ? true : false,
        jobCategory: jobCategory || undefined,
        employmentType,
        location: {
          streetAddress,
          addressLocality,
          addressRegion,
          postalCode,
          addressCountry
        }
      },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).send('Job not found');
    }

    res.redirect(`/admin?username=${process.env.ADMIN_USERNAME}&password=${process.env.ADMIN_PASSWORD}&message=${encodeURIComponent('Edit successful')}`);
  } catch (error) {
    console.error(error);
    res.redirect(`/admin?username=${process.env.ADMIN_USERNAME}&password=${process.env.ADMIN_PASSWORD}&message=${encodeURIComponent('Error updating job posting')}`);
  }
});

// --- POST /admin/delete/:id ---
// Handle job deletion
router.post('/delete/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.redirect(`/admin?username=${process.env.ADMIN_USERNAME}&password=${process.env.ADMIN_PASSWORD}&message=${encodeURIComponent('Job deleted successfully!')}`);
  } catch (error) {
    console.error(error);
    res.redirect(`/admin?username=${process.env.ADMIN_USERNAME}&password=${process.env.ADMIN_PASSWORD}&message=${encodeURIComponent('Error deleting job posting')}`);
  }
});

module.exports = router;
