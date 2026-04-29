const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendReminderEmail } = require('../utils/emailService');
const { sendReminderSMS } = require('../utils/smsService');

// POST /api/test/email — send a test email to the logged-in user
router.post('/email', protect, async (req, res) => {
  const user = req.user;
  const fakeTask = {
    title: 'Test Task',
    description: 'This is a test reminder from Daily Task Reminder.',
    dueDate: new Date(Date.now() + 15 * 60 * 1000),
    priority: 'high',
  };

  try {
    await sendReminderEmail(user.email, user.name, fakeTask);
    res.json({ message: `Test email sent to ${user.email}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/test/sms — send a test SMS to the logged-in user's phone
router.post('/sms', protect, async (req, res) => {
  const user = req.user;
  if (!user.phone) {
    return res.status(400).json({ message: 'No phone number saved in your profile' });
  }

  const fakeTask = {
    title: 'Test Task',
    dueDate: new Date(Date.now() + 15 * 60 * 1000),
    priority: 'high',
  };

  try {
    await sendReminderSMS(user.phone, user.name, fakeTask);
    res.json({ message: `Test SMS sent to ${user.phone}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
