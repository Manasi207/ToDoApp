
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // backend/server.js --> Local Storage Integration version
// const express = require('express');
// const cors = require('cors');
// const { OpenAI } = require('openai');
// require('dotenv').config();

// const app = express();
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// app.use(cors());
// app.use(express.json());

// app.post('/validate-task', async (req, res) => {
//   const { task } = req.body;

//   const prompt = `Decide whether the following text is a meaningful to-do task (not just a greeting or vague text):\n"${task}"\nAnswer "Yes" or "No".`;

//   try {
//     const completion = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo',
//       messages: [
//         { role: 'system', content: 'You are a helpful assistant.' },
//         { role: 'user', content: prompt }
//       ]
//     });

//     const reply = completion.choices[0].message.content.trim();
//     const isMeaningful = reply.toLowerCase().includes('yes');

//     res.json({ valid: isMeaningful, reason: reply });
//   } catch (error) {
//     console.error('OpenAI Error:', error);
//     res.status(500).json({ error: 'Failed to validate task.' });
//   }
// });

// app.listen(5000, () => console.log('✅ Server running on port 5000'));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//updated version to add tasks in json file instead of local storage
// backend/server.js
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
