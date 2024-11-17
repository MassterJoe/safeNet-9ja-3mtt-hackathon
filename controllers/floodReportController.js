const { sendFloodAlert } = require('./notificationController');

async function verifyFloodReport(reportId) {
  // Assume you’ve already verified the flood report using Google Vision
  const report = await FloodReport.findById(reportId);
  
  if (report && report.verificationStatus === 'verified') {
    // Send flood alerts to users in the affected location
    await sendFloodAlert(report.location);
  }
}
