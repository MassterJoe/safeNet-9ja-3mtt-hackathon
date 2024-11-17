const express = require('express');
const app = express();
const { sendFloodAlert } = require('./controllers/notificationController');

app.use(express.json()); // Make sure to include this to parse JSON request bodies

app.post('/send-alert', async (req, res) => {
    const { location } = req.body; // Make sure `location` is included in the request body
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
