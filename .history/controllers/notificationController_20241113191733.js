// notificationsController.js

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email sending function
const sendFloodAlertEmail = async (to, subject, text) => {
  const msg = {
    to, // Recipient email address
    from: '3mttfloodalerts@gmail.com', // Our verified sender email in SendGrid
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
