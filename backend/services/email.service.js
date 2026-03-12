const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = require('../config/environment');

let transporter = null;

const getTransporter = () => {
  if (!transporter && SMTP_HOST && SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT) || 587,
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();
  if (!t) {
    console.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
    return { stubbed: true };
  }
  return t.sendMail({ from: SMTP_FROM, to, subject, html });
};

const sendRegistrationConfirmation = async (participant, event) => {
  return sendEmail({
    to: participant.email,
    subject: `Registration Confirmed - ${event.name}`,
    html: `
      <h2>Registration Confirmed!</h2>
      <p>Hi ${participant.name},</p>
      <p>You have been registered for <strong>${event.name}</strong>.</p>
      <p><strong>Date:</strong> ${event.date}</p>
      <p><strong>Venue:</strong> ${event.venue}</p>
    `
  });
};

const sendTeamCreatedEmail = async (leader, team, event) => {
  return sendEmail({
    to: leader.email,
    subject: `Team Created - ${event.name}`,
    html: `
      <h2>Team Created!</h2>
      <p>Hi ${leader.name},</p>
      <p>Your team <strong>${team.name}</strong> has been created for <strong>${event.name}</strong>.</p>
      <p>Share this code with your teammates: <strong>${team.code}</strong></p>
    `
  });
};

module.exports = { sendEmail, sendRegistrationConfirmation, sendTeamCreatedEmail };
