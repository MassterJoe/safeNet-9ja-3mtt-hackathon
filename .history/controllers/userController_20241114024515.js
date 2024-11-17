// controllers/userController.js
const User = require('../models/User'); // Import the User model

// Function to update user location
exports.updateLocation = async (req, res) => {
  try {
    const userId = req.params.id;
    const { location, latitude, longitude } = req.body; // Extract location details from request body

    const user = await User.findByIdAndUpdate(
      userId,
      { location, latitude, longitude },
      { new: true } // This option returns the updated document
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User location updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating user location:', error);
    res.status(500).json({ message: 'Failed to update location' });
  }
};
