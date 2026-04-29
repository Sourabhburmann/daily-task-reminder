const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendReminderEmail = async (userEmail, userName, task) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER === 'your_gmail@gmail.com') {
    console.log('⚠️  Email not configured — fill EMAIL_USER and EMAIL_PASS in .env');
    return;
  }

  const transporter = createTransporter();

  const dueTime = new Date(task.dueDate).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }[task.priority] || '#6366f1';

  await transporter.sendMail({
    from: `"Daily Task Reminder" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `⏰ Reminder: "${task.title}" is due soon`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px;">
        <div style="background:#6366f1;padding:20px 24px;border-radius:8px;margin-bottom:20px;">
          <h2 style="color:#fff;margin:0;font-size:20px;">📋 Daily Task Reminder</h2>
        </div>
        <p style="font-size:16px;color:#111;">Hi <strong>${userName}</strong>,</p>
        <p style="color:#444;">Your task is due in <strong>15 minutes</strong>:</p>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin:16px 0;">
          <h3 style="margin:0 0 8px;color:#111;">${task.title}</h3>
          ${task.description ? `<p style="color:#666;margin:0 0 8px;font-size:14px;">${task.description}</p>` : ''}
          <p style="margin:0;font-size:14px;">🕐 Due: <strong>${dueTime}</strong></p>
          <p style="margin:4px 0 0;font-size:14px;">Priority: <span style="color:${priorityColor};font-weight:600;text-transform:capitalize;">${task.priority}</span></p>
        </div>
        <p style="color:#888;font-size:13px;">Don't forget to complete it on time!</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
        <small style="color:#aaa;">Daily Task Reminder System</small>
      </div>
    `,
  });

  console.log(`📧 Email sent to ${userEmail} for task: ${task.title}`);
};

module.exports = { sendReminderEmail };
