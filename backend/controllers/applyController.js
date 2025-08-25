const Application = require('../models/Application');
const Job = require('../models/Job');

// POST /api/applications/apply
exports.applyJob = async (req, res) => {
  const userId = req.user.id;
  const { jobId } = req.body;

  try {
    const alreadyApplied = await Application.findOne({ candidate: userId, job: jobId });
    if (alreadyApplied) return res.status(400).json({ msg: 'Already applied' });

    const application = new Application({ candidate: userId, job: jobId, status: 'Applied' });
    await application.save();

    res.status(201).json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error applying for job' });
  }
};
