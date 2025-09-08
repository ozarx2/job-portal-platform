const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/verifyToken');
const sendEmail = require('../utils/email');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

//const { register, login } = require('../controllers/authController');



// Register

// Ensure JSON parsing at router level (extra safety)
router.use(express.json());

router.post('/register', async (req, res) => {
  console.log("BODY RECEIVED:", req.body); // 👈 This should log your data
  const body = (req && typeof req.body === 'object' && req.body) ? req.body : {};
  const { name, email, password, role } = body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    // Send verification email
    const verifyToken = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;
    const html = `
      <p>Hi ${newUser.name || 'there'},</p>
      <p>Welcome to Ozarx HR. Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>If you did not create this account, you can ignore this email.</p>
    `;
    try {
      await sendEmail({ to: newUser.email, subject: 'Verify Your Email - Ozarx HR', html });
    } catch (e) {
      console.error('Failed to send verification email:', e.message);
    }

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});
// Email verification endpoint
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send('Token missing');

    const decoded = jwt.verify(token, JWT_SECRET);
    const foundUser = await User.findById(decoded.id);
    if (!foundUser) return res.status(404).send('User not found');

    foundUser.isVerified = true;
    await foundUser.save();

    res.send('Email verified successfully. You can now login.');
  } catch (err) {
    console.error(err);
    res.status(400).send('Invalid or expired token');
  }
});


// Login
router.post('/login', async (req, res) => {
  const body = (req && typeof req.body === 'object' && req.body) ? req.body : {};
  const { email, password } = body;
  try {
    console.log('Login attempt body:', req.body);
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    const foundUser = await User.findOne({ email });
    console.log('User found:', !!foundUser);
    if (!foundUser) return res.status(400).json({ msg: 'Invalid credentials' });

    if (!foundUser.password || typeof foundUser.password !== 'string') {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, foundUser.password);
    } catch (cmpErr) {
      console.error('bcrypt.compare failed:', cmpErr);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: foundUser._id, role: foundUser.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user: foundUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});
router.get('/me', authMiddleware, async (req, res) => {
  const me = await User.findById(req.user.id).select('-password');
  res.json({ user: me });
});

module.exports = router;
