const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.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);

module.exports = sgMail;
