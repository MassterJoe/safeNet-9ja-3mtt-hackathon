// routes/api.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendFloodAlert } = require('../controllers/notificationController');


router.put('/users/:id/location', userController.updateLocation);

// Route to send flood alert
router.post('/send-alert', async (req, res) => {
  const { location } = req.body;
  
  if (!location) {
    return res.status(400).json({ message: 'Location is required' });
  }

  try {
    await sendFloodAlert(location);
    res.status(200).json({ message: 'Flood alert sent successfully' });
  } catch (error) {
    console.error('Error sending alert:', error);
    res.status(500).json({ message: 'Failed to send alert' });
  }
});


// Registration endpoint
router.post('/register', async (req, res) => {
  const { email, phoneNumber, location, latitude, longitude } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({
      email,
      phoneNumber,
      location,
      latitude,
      longitude,
    });

    // Save the user to the database
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});



module.exports = router;
