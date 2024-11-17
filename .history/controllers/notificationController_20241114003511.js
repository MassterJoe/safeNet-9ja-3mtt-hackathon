const sgMail = require('../config/sendgrid');
const User = require('../models/User');
const { sendFloodAlertSMS } = require('../services/smsService');

async function sendFloodAlert(location) {
  try {
    // Fetch users based on location
    const users = await User.find({ location });

    const emails = [];
    const phoneNumbers = [];

    // Filter users based on their preferences
    users.forEach(user => {
      if (user.notificationPreference === 'email' || user.notificationPreference === 'both') {
        emails.push(user.email);
      }
      if (user.notificationPreference === 'sms' || user.notificationPreference === 'both') {
        if (user.phoneNumber) phoneNumbers.push(user.phoneNumber);
      }
    });

    // Send email alerts if there are users who opted for email notifications
    if (emails.length > 0) {
      const msg = {
        to: emails,
        from: 'no-reply@yourapp.com',
        subject: 'Flood Alert in Your Area',
        text: 'Please be advised that there is a flood warning in your area. Stay safe.',
        html: '<strong>Flood Alert: Please stay safe and avoid flood-prone areas.</strong>',
      };
      await sgMail.sendMultiple(msg);
      console.log('Flood alert emails sent successfully.');
    } else {
      console.log('No users found for email alert in the specified location.');
    }

    // Send SMS alerts if there are users who opted for SMS notifications
    for (const phoneNumber of phoneNumbers) {
      await sendFloodAlertSMS(phoneNumber, location);
    }

  } catch (error) {
    console.error('Error sending flood alert notifications:', error);
  }
}

module.exports = { sendFloodAlert };
