const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send task reminder email
const sendReminderEmail = async (userEmail, userName, task) => {
  if (!process.env.EMAIL_USER) return; // skip if email not configured

  try {
    const transporter = createTransporter();
    const dueTime = new Date(task.dueDate).toLocaleString();

    await transporter.sendMail({
      from: `"Task Reminder" <${process.env.EMAIL_FROM}>`,
      to: userEmail,
      subject: `⏰ Reminder: "${task.title}" is due soon`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Daily Task Reminder</h2>
          <p>Hi ${userName},</p>
          <p>Your task <strong>"${task.title}"</strong> is due at <strong>${dueTime}</strong>.</p>
          ${task.description ? `<p><em>${task.description}</em></p>` : ''}
          <p>Priority: <span style="text-transform: capitalize;">${task.priority}</span></p>
          <p>Don't forget to complete it on time!</p>
          <hr />
          <small style="color: #888;">Daily Task Reminder System</small>
        </div>
      `,
    });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

module.exports = { sendReminderEmail };
