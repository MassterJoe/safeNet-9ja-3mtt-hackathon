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


// notificationsController.js

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email sending function
const sendFloodAlertEmail = async (to, subject, text) => {
  const msg = {
    to, // Recipient email address
    from: 'your_verified_email@example.com', // Your verified sender email in SendGrid
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Notification function to send alerts
const sendFloodAlertToAffectedUsers = async (req, res) => {
  const { affectedArea, alertDetails } = req.body;

  try {
    // Fetch users in the affected area from your database
    const usersToNotify = await User.find({ area: affectedArea });

    // Send alert emails to each user
    usersToNotify.forEach(user => {
      const subject = `Flood Alert for ${affectedArea}`;
      const text = `Dear ${user.name},\n\nPlease be advised of a potential flood in your area. Details:\n\n${alertDetails}\n\nStay safe!`;
      sendFloodAlertEmail(user.email, subject, text);
    });

    res.status(200).json({ message: 'Flood alert sent to affected users.' });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ message: 'Error sending notifications.' });
  }
};

module.exports = {
  sendFloodAlertToAffectedUsers,
};


module.exports = { sendFloodAlert };
