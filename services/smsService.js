// smsService.js
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function sendFloodAlertSMS(to, location) {
  try {
    const message = await client.messages.create({
      body: `Flood Alert: There is a flood warning in ${location}. Please stay safe and avoid flood-prone areas.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,  // Recipient's phone number
    });

    console.log(`SMS sent successfully to ${to}`);
    return message;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

module.exports = { sendFloodAlertSMS };
