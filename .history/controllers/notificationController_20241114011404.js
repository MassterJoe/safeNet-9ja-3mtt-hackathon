// controllers/notificationController.js
const sgMail = require('../config/sendgrid');
const smsService = require('../services/smsService');  // Ensure this line is correct
const User = require('../models/User'); // Your User model

async function sendFloodAlert(location) {
  try {
    // Fetch users by location
    const users = await User.find({ location });
    const emails = users.map(user => user.email);
    const phoneNumbers = users.map(user => user.phoneNumber); // Assuming 'phoneNumber' field exists in User model

    // Send email notifications
    if (emails.length > 0) {
      const msg = {
        to: emails,
        from: '3mttfloodalerts@gmail.com', // SendGrid verified email
        subject: 'Flood Alert in Your Area',
        text: 'Please be advised that there is a flood warning in your area. Stay safe!',
        html: '<strong>Flood Alert: Stay safe and avoid flood-prone areas.</strong>',
      };

      // Send the email via SendGrid
      await sgMail.sendMultiple(msg);
      console.log('Flood alert emails sent successfully.');
    } else {
      console.log('No users found for email alert in the specified location.');
    }

    // Send SMS notifications
    if (phoneNumbers.length > 0) {
      for (let phoneNumber of phoneNumbers) {
        try {
          await smsService.sendFloodAlertSMS(phoneNumber, location); // Ensure correct location is passed
        } catch (error) {
          console.error(`Error sending SMS to ${phoneNumber}:`, error);
        }
      }
      console.log('Flood alert SMS sent successfully.');
    } else {
      console.log('No phone numbers found for SMS alert in the specified location.');
    }
  } catch (error) {
    console.error('Error sending flood alerts:', error);
  }
}

module.exports = { sendFloodAlert };
