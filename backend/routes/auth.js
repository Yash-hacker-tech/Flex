const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    await OTP.deleteMany({ email });
    await OTP.create({ email, code });
    
    // Try to send email, but don't fail if it doesn't work in dev mode
    let emailSent = false;
    try {
      const sendEmail = require('../utils/sendEmail');
      await sendEmail({
        email: email,
        subject: 'Your Flex OTP Code',
        message: `Your OTP code is ${code}. It is valid for 10 minutes.`,
        html: `<p>Your OTP code is <strong>${code}</strong>.</p><p>It is valid for 10 minutes.</p>`
      });
      emailSent = true;
    } catch (err) {
      console.error('Email could not be sent (check SMTP settings):', err.message);
    }

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
    }

    res.json({ message: 'OTP sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OTP.findOne({ email, code: otp });
    
    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });
    
    // Create a temporary verification token to allow registration
    const otpToken = crypto.randomBytes(20).toString('hex');
    
    res.json({ verified: true, otpToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, otpToken } = req.body;
    
    if (!otpToken) return res.status(400).json({ message: 'OTP verification required' });
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    
    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, profileCompletion: user.profileCompletion },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const user = await User.findOne({ email });
    
    if (user && (await user.matchPassword(password))) {
      // If no OTP in request, generate one and ask for it
      if (!otp) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.deleteMany({ email });
        await OTP.create({ email, code });
        
        let emailSent = false;
        try {
          const sendEmail = require('../utils/sendEmail');
          await sendEmail({
            email: email,
            subject: 'Your Flex Login OTP Code',
            message: `Your login OTP code is ${code}. It is valid for 10 minutes.`,
            html: `<p>Your login OTP code is <strong>${code}</strong>.</p><p>It is valid for 10 minutes.</p>`
          });
          emailSent = true;
        } catch (err) {
          console.error('Email could not be sent (check SMTP settings):', err.message);
        }

        if (!emailSent) {
          return res.status(500).json({ message: 'Failed to send OTP email.' });
        }

        return res.json({ otpRequired: true, message: 'OTP sent' });
      }

      // If OTP provided, verify it
      const record = await OTP.findOne({ email, code: otp });
      if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });
      
      // OTP valid, successful login
      res.json({
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, profileCompletion: user.profileCompletion },
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/update-profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    ['name', 'bio', 'location', 'phone', 'title', 'hourlyRate', 'availability', 'company', 'industry'].forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });
    
    if (req.body.skills) user.skills = req.body.skills;
    if (req.body.avatar) user.avatar = req.body.avatar;
    
    await user.save();
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
