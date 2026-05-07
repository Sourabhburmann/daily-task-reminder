const Task = require('../models/Task');

// GET /api/tasks — get all tasks for logged-in user
const getTasks = async (req, res) => {
  try {
    const { status, priority, search, sort } = req.query;
    const filter = { userId: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const sortOptions = {
      date_asc: { dueDate: 1 },
      date_desc: { dueDate: -1 },
      priority_high: { priority: -1 },
      priority_low: { priority: 1 },
    };
    const sortBy = sortOptions[sort] || { dueDate: 1 };

    const tasks = await Task.find(filter).sort(sortBy);
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tasks/stats — task statistics
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [total, completed, pending, overdue, todayTasks, weekCompleted] =
      await Promise.all([
        Task.countDocuments({ userId }),
        Task.countDocuments({ userId, status: 'completed' }),
        Task.countDocuments({ userId, status: 'pending' }),
        Task.countDocuments({ userId, status: 'overdue' }),
        Task.find({ userId, dueDate: { $gte: startOfDay, $lte: endOfDay } }),
        Task.countDocuments({
          userId,
          status: 'completed',
          updatedAt: { $gte: startOfWeek },
        }),
      ]);

    res.json({ total, completed, pending, overdue, todayTasks, weekCompleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tasks — create a task
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required' });
    }

    if (new Date(dueDate) <= new Date()) {
      return res.status(400).json({ message: 'Due date must be in the future' });
    }

    const task = await Task.create({
      userId: req.user._id,
      title,
      description,
      dueDate,
      priority: priority || 'medium',
    });

    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/tasks/:id — update a task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, dueDate, priority, status } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;

    // Reset reminder flag if due date changes
    if (dueDate !== undefined) task.reminderSent = false;

    await task.save();
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/tasks/:id — delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/tasks/:id/complete — mark task as completed
const completeTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'completed' },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTasks, getStats, createTask, updateTask, deleteTask, completeTask };
