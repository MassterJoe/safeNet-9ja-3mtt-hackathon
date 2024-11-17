// controllers/notificationController.js
const sgMail = require('../config/sendgrid');
const User = require('../models/User'); // Your User model

async function sendFloodAlert(location) {
  try {
    // Fetch users by location
    const users = await User.find({ location });
    const emails = users.map(user => user.email);
    
    if (emails.length > 0) {
      // Create email message
      const msg = {
        to: emails,
        from: 'no-reply@yourapp.com', // verified email here
        subject: 'Flood Alert in Your Area',
        text: 'Flood warning in your area. Stay safe!',
        html: '<strong>Flood Alert: Stay safe and avoid flood-prone areas.</strong>',
      };
      
      // Send the email
      await sgMail.sendMultiple(msg);
      console.log('Flood alert emails sent.');
    } else {
      console.log('No users found in this location.');
    }
  } catch (error) {
    console.error('Error sending flood alert:', error);
  }
}

module.exports = { sendFloodAlert };
