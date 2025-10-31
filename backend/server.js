
//updated version to add tasks in json file instead of local storage

// backend/server.js
////////////////////////////////////////////////////////////////////////////////

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const tasksFile = path.join(__dirname, 'tasks.json');

// Helper: Read & Write file functions
function readTasks() {
  try {
    const data = fs.readFileSync(tasksFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeTasks(tasks) {
  fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
}

// ✅ Get all tasks
app.get('/tasks', (req, res) => {
  res.json(readTasks());
});

// ✅ Add a new task
app.post('/tasks', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Task text required' });
  }

  const tasks = readTasks();
  const newTask = { id: Date.now(), text: text.trim(), completed: false };
  tasks.push(newTask);
  writeTasks(tasks);
  res.json(newTask);
});

// ✅ Toggle task complete/incomplete
app.put('/tasks/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id);
  const tasks = readTasks();
  const updated = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  writeTasks(updated);
  res.json(updated);
});

// ✅ Edit a task
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { text } = req.body;
  const tasks = readTasks();
  const updated = tasks.map((t) =>
    t.id === id ? { ...t, text } : t
  );
  writeTasks(updated);
  res.json(updated);
});

// ✅ Delete a task
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const tasks = readTasks().filter((t) => t.id !== id);
  writeTasks(tasks);
  res.json({ success: true });
});

// ✅ Clear all
app.delete('/tasks', (req, res) => {
  writeTasks([]);
  res.json({ success: true });
});

app.listen(5000, () => console.log('✅ Server running on port 5000'));
