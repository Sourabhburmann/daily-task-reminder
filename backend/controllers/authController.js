const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      emailNotifications: req.user.emailNotifications,
      phone: req.user.phone || '',
      smsNotifications: req.user.smsNotifications || false,
    },
  });
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, emailNotifications, phone, smsNotifications } = req.body;

    // Validate phone format if provided
    if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone must be in international format e.g. +919876543210' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, emailNotifications, phone: phone || '', smsNotifications: smsNotifications || false },
      { new: true, runValidators: true }
    );
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailNotifications: user.emailNotifications,
        phone: user.phone || '',
        smsNotifications: user.smsNotifications || false,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { signup, login, getMe, updateProfile };
