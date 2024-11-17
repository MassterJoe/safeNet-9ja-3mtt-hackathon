// controllers/notificationController.js
const sgMail = require('../config/sendgrid');
const User = require('../models/User'); // assuming you have a User model

async function sendFloodAlert(location) {
  try {
    // Fetch users based on location; adjust query as necessary.
    const users = await User.find({ location });

    // Generate the list of emails
    const emails = users.map(user => user.email);

    if (emails.length > 0) {
      const msg = {
        to: emails,
        from: 'no-reply@yourapp.com', // Use a verified sender email
        subject: 'Flood Alert in Your Area',
        text: 'Please be advised that there is a flood warning in your area. Stay safe and avoid flood-prone locations.',
        html: '<strong>Flood Alert: Please be advised that there is a flood warning in your area. Stay safe and avoid flood-prone locations.</strong>',
      };

      await sgMail.sendMultiple(msg);
      console.log('Flood alert emails sent successfully.');
    } else {
      console.log('No users found in the specified location.');
    }
  } catch (error) {
    console.error('Error sending flood alert emails:', error);
  }
}

module.exports = { sendFloodAlert };
