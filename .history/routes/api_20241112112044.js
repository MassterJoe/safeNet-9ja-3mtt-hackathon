const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route to register a new user
router.post('/register', async (req, res) => {
  const { email, location } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already registered.' });
    }

    // Create a new user
    user = new User({ email, location });
    await user.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user.', error });
  }
});

module.exports = router;
