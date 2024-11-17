// emailService.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

module.exports = sendFloodAlertEmail;
