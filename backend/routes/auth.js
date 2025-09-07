const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/verifyToken');

//const { register, login } = require('../controllers/authController');



// Register

router.post('/register', async (req, res) => {
  console.log("BODY RECEIVED:", req.body); // 👈 This should log your data
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});
// Generate verification token (valid 24h)
const verifyToken = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Construct verification URL (frontend route)
const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

// Send verification email
await sendEmail({
  to: user.email,
  subject: 'Verify Your Email - Ozarx HR',
  template: 'email_verification', // your template name
  context: {
    name: user.name,
    role: user.role,
    verifyUrl
  }
});
// Email verification endpoint
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send('Token missing');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).send('User not found');

    user.isVerified = true;
    await user.save();

    res.send('Email verified successfully. You can now login.');
  } catch (err) {
    console.error(err);
    res.status(400).send('Invalid or expired token');
  }
});


// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ user });
});

module.exports = router;
