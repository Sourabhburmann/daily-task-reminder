const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendReminderEmail } = require('./emailService');
const { sendReminderSMS } = require('./smsService');

/**
 * Runs every minute to:
 * 1. Mark overdue tasks
 * 2. Send email + SMS reminders 15 minutes before due time
 */
const startScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const in15Min = new Date(now.getTime() + 15 * 60 * 1000);

      // Mark pending tasks as overdue if past due date
      await Task.updateMany(
        { status: 'pending', dueDate: { $lt: now } },
        { status: 'overdue' }
      );

      // Find tasks due in the next 15 minutes that haven't been reminded yet
      const upcomingTasks = await Task.find({
        status: 'pending',
        dueDate: { $gte: now, $lte: in15Min },
        reminderSent: false,
      }).populate('userId', 'name email phone emailNotifications smsNotifications');

      for (const task of upcomingTasks) {
        const user = task.userId;

        // Send email if user has email notifications enabled
        if (user?.emailNotifications) {
          await sendReminderEmail(user.email, user.name, task);
        }

        // Send SMS if user has SMS notifications enabled and has a phone number
        if (user?.smsNotifications && user?.phone) {
          await sendReminderSMS(user.phone, user.name, task);
        }

        // Mark reminder as sent
        task.reminderSent = true;
        await task.save();
      }
    } catch (err) {
      console.error('Scheduler error:', err.message);
    }
  });

  console.log('✅ Task scheduler started');
};

module.exports = { startScheduler };
