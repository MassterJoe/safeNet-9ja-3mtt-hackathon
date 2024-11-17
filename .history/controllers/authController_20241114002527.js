// controllers/authController.js
const User = require('../models/User');

async function registerUser(req, res) {
  const { email, phoneNumber, location, notificationPreference } = req.body;

  try {
    // Create new user
    const newUser = new User({
      email,
      phoneNumber,
      location,
      notificationPreference: notificationPreference || 'both',  // Default to 'both' if not specified
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user.', error });
  }
}

module.exports = { registerUser };
