const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter using your email credentials
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // Needs an App Password if using Gmail
    },
  });

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME || 'Flex'} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // Send the email
  const info = await transporter.sendMail(mailOptions);
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
