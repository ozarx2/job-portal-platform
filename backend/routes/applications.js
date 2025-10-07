// routes/application.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Application = require("../models/Application");
const Job = require("../models/Job");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// GET /api/applications - Get all applications
router.get('/', verifyToken, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('candidate', 'name email')
      .populate({
        path: 'job',
        select: 'title description location salaryRange jobType category deadline postedBy companyId',
        populate: {
          path: 'companyId',
          select: 'name description website logoUrl location industry'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching applications' 
    });
  }
});

// ⚡ Multer setup for file uploads (resume)
const uploadDir = path.join(__dirname, "../uploads/resumes");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // safer path
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/**
 * 1️⃣ Apply to a job (with resume + details)
 */
router.post("/", verifyToken, upload.single("resume"), async (req, res) => {
  try {
    console.log('📝 Application submission request:', req.body);
    console.log('📁 Resume file:', req.file);
    console.log('👤 User ID:', req.user.id);
    
    const {
      jobId,
      education,
      age,
      experience,
      location,
      currentEmployer,
      status,
      skills,
    } = req.body;
    
    // Validate required fields
    if (!jobId) {
      return res.status(400).json({ 
        success: false,
        msg: "Job ID is required" 
      });
    }

    // Check if already applied
    const existing = await Application.findOne({
      job: jobId,
      candidate: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: "Already applied to this job",
        msg: "Already applied to this job"
      });
    }

    const application = new Application({
      job: jobId,
      candidate: req.user.id,
      education: education || '',
      age: age || null, // Make age optional
      experience: experience ? parseInt(experience) || 0 : 0,
      location: location || '',
      currentEmployer: currentEmployer || '',
      status: status || "Applied",
      skills: skills ? skills.split(",").map((s) => s.trim()) : [],
      resume: req.file ? `/uploads/resumes/${req.file.filename}` : null,
      // Additional fields from frontend
      name: req.body.name || '',
      email: req.body.email || '',
      phone: req.body.phone || '',
      notes: req.body.notes || '',
      bio: req.body.bio || '',
    });

    await application.save();
    console.log('✅ Application saved successfully:', application._id);
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (err) {
    console.error("❌ Error in /applications POST:", err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit application',
      error: err.message 
    });
  }
});

/**
 * 2️⃣ Get applications of current candidate
 */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id }).populate("job");
    res.json(applications);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching applications" });
  }
});

/**
 * 3️⃣ Get applications for employer's jobs
 */
router.get("/employer", verifyToken, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id });
    const jobIds = jobs.map((job) => job._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("job")
      .populate("candidate");

    res.json(applications);
  } catch (err) {
    console.error("❌ Error in /employer route:", err.message);
    res.status(500).json({ msg: "Error fetching employer applications" });
  }
});

/**
 * 4️⃣ Get applications for a specific job
 */
router.get("/job/:jobId", verifyToken, async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.find({ job: jobId })
      .populate("job")
      .populate("candidate");

    res.json(applications);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching applications for this job" });
  }
});

/**
 * 5️⃣ Update application status (employer only)
 */
router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ["Applied", "Shortlisted", "Interviewed", "Hired", "Rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const application = await Application.findById(applicationId).populate("job");

    if (!application || !application.job) {
      return res.status(404).json({ msg: "Application not found" });
    }

    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to update this application" });
    }

    application.status = status;
    await application.save();

    res.json({ msg: "Status updated successfully", application });
  } catch (err) {
    console.error("❌ Error updating status:", err.message);
    res.status(500).json({ msg: "Error updating application status" });
  }
});

// PUT /api/applications/:id - Update an application (admin only)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const updateData = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const application = await Application.findByIdAndUpdate(
      applicationId, 
      updateData, 
      { new: true }
    ).populate('candidate', 'name email')
     .populate({
       path: 'job',
       select: 'title description location salaryRange jobType category deadline postedBy companyId',
       populate: {
         path: 'companyId',
         select: 'name description website logoUrl location industry'
       }
     });

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    res.json({
      success: true,
      msg: "Application updated successfully",
      application
    });
  } catch (err) {
    console.error("❌ Error updating application:", err.message);
    res.status(500).json({ msg: "Error updating application" });
  }
});

// DELETE /api/applications/:id - Delete an application (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const applicationId = req.params.id;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const application = await Application.findByIdAndDelete(applicationId);

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    res.json({
      success: true,
      msg: "Application deleted successfully"
    });
  } catch (err) {
    console.error("❌ Error deleting application:", err.message);
    res.status(500).json({ msg: "Error deleting application" });
  }
});

/**
 * 6️⃣ Get selected jobs for candidates
 */
router.get("/selected", verifyToken, async (req, res) => {
  try {
    const applications = await Application.find({
      candidate: req.user.id,
      status: { $in: ['Selected', 'Hired'] }
    })
      .populate('job', 'title description location salaryRange jobType category deadline postedBy companyId')
      .populate({
        path: 'job',
        populate: {
          path: 'companyId',
          select: 'name description website logoUrl location industry'
        }
      })
      .sort({ createdAt: -1 });

    const selectedJobs = applications.map(app => app.job).filter(job => job !== null);

    res.json({
      success: true,
      selectedJobs,
      count: selectedJobs.length
    });
  } catch (error) {
    console.error('❌ Error fetching selected jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching selected jobs'
    });
  }
});

/**
 * 7️⃣ Get profile completion status for candidates
 */
router.get("/profile-status", verifyToken, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Define required fields for profile completion
    const requiredFields = [
      { key: 'name', label: 'Full Name', value: user.name },
      { key: 'email', label: 'Email Address', value: user.email },
      { key: 'phone', label: 'Phone Number', value: user.phone },
      { key: 'location', label: 'Location', value: user.location },
      { key: 'experience', label: 'Years of Experience', value: user.experience },
      { key: 'education', label: 'Education', value: user.education },
      { key: 'skills', label: 'Skills', value: user.skills },
      { key: 'bio', label: 'Professional Bio', value: user.bio }
    ];

    // Check which fields are missing or incomplete
    const missingFields = [];
    let completedFields = 0;

    requiredFields.forEach(field => {
      if (!field.value || 
          (typeof field.value === 'string' && field.value.trim() === '') ||
          (Array.isArray(field.value) && field.value.length === 0) ||
          (typeof field.value === 'number' && field.value === 0)) {
        missingFields.push(field.label);
      } else {
        completedFields++;
      }
    });

    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
    const isComplete = missingFields.length === 0;

    // Additional recommendations for better profile
    const recommendations = [];
    if (!user.profileImage) recommendations.push('Add a professional profile photo');
    if (!user.linkedin) recommendations.push('Add your LinkedIn profile');
    if (!user.github) recommendations.push('Add your GitHub profile');
    if (!user.website) recommendations.push('Add your personal website/portfolio');
    if (!user.resumeUrl) recommendations.push('Upload your resume');

    res.json({
      success: true,
      isComplete,
      completionPercentage,
      missingFields,
      recommendations,
      profileStrength: {
        basic: completionPercentage,
        enhanced: completionPercentage + (recommendations.length === 0 ? 20 : (5 - recommendations.length) * 4),
        total: requiredFields.length,
        completed: completedFields
      }
    });

  } catch (error) {
    console.error('❌ Error checking profile status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking profile status'
    });
  }
});

module.exports = router;
