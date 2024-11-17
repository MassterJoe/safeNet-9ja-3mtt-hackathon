// controllers/notificationController.js
const sgMail = require('../config/sendgrid');
const User = require('../models/User'); // Your User model
const { sendFloodAlertSMS } = require('../services/smsService');

async function sendFloodAlert(location) {
  try {
    // Fetch users by location
    const users = await User.find({ location });
    const emails = users.map(user => user.email);
    const phoneNumbers = users.map(user => user.phoneNumber); // Assuming 'phoneNumber' field exists in User model

    
    if (emails.length > 0) {
      // Create email message
      const msg = {
        to: emails,
        from: '3mttfloodalerts@gmail.com ', // SendGrid verified email
        subject: 'Flood Alert in Your Area',
        text: 'Please be advised that there is a flood warning in your area. Stay safe!',
        html: '<strong>Flood Alert: Stay safe and avoid flood-prone areas.</strong>',
      };
      
// controllers/notificationController.js
const sgMail = require('../config/sendgrid');
const smsService = require('../services/smsService');  // Ensure this line is correct
const User = require('../models/User');

async function sendFloodAlert(location) {
    // Rest of your notification logic
    smsService.sendSms(user.phoneNumber, 'Flood Alert: Flood warning in your area.');
}


      // Send the email
      await sgMail.sendMultiple(msg);
      console.log('Flood alert emails sent successfully.');
    } else {
      console.log('No users found for email alert in the specified location.');
    }
  } catch (error) {
    console.error('Error sending flood alert emails:', error);
  }
}

module.exports = { sendFloodAlert };
