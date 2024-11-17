// controllers/notificationController.js
const sgMail = require('../config/sendgrid');
const User = require('../models/User'); // Your User model
const { sendFloodAlertSMS } = require('../services/smsService');

async function sendFloodAlert(location) {
  try {
    // Fetch users by location
    const users = await User.find({ location });
    const emails = users.map(user => user.email);
    
    if (emails.length > 0) {
      // Create email message
      const msg = {
        to: emails,
        from: '3mttfloodalerts@gmail.com ', // SendGrid verified email
        subject: 'Flood Alert in Your Area',
        text: 'Please be advised that there is a flood warning in your area. Stay safe!',
        html: '<strong>Flood Alert: Stay safe and avoid flood-prone areas.</strong>',
      };
      
      // Send the email
      await sgMail.sendMultiple(msg);
      console.log('Flood alert emails sent successfully.');
    } else {
      console.log('No users found in this location.');
    }
  } catch (error) {
    console.error('Error sending flood alert emails:', error);
  }
}

module.exports = { sendFloodAlert };
