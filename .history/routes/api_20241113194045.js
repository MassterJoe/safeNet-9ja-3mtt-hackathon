// routes/api.js
const express = require('express');
const router = express.Router();
const { sendFloodAlert } = require('../controllers/notificationController');

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

module.exports = router;
