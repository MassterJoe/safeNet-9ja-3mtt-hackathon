// routes/alertRoutes.js
const express = require('express');
const router = express.Router();
const { sendFloodAlert } = require('../controllers/notificationController');

router.post('/alert', async (req, res) => {
  const { location } = req.body;

  try {
    await sendFloodAlert(location);
    res.status(200).json({ message: 'Flood alert sent to users in the specified location.' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending flood alert', error });
  }
});


module.exports = router;
