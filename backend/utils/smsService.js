const twilio = require('twilio');

// Send SMS reminder via Twilio
const sendReminderSMS = async (phone, userName, task) => {
  // Skip if Twilio credentials not configured
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_FROM) {
    console.log('⚠️  Twilio not configured — skipping SMS');
    return;
  }

  // Skip if no phone number
  if (!phone) return;

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const dueTime = new Date(task.dueDate).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
      hour12: true,
    });

    await client.messages.create({
      from: process.env.TWILIO_PHONE_FROM,
      to: phone,
      body: `⏰ Daily Task Reminder: Hi ${userName}! Your task "${task.title}" is due at ${dueTime}. Priority: ${task.priority}. Don't forget!`,
    });

    console.log(`📱 SMS sent to ${phone} for task: ${task.title}`);
  } catch (err) {
    console.error('SMS send error:', err.message);
  }
};

module.exports = { sendReminderSMS };
