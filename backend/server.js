// // --- Express Server: server.js ---

// // File: server.js (Node.js Backend)
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
//     // res.json({ isMeaningful });
//     res.json({ valid: isValid, reason });

//   } catch (error) {
//     console.error('OpenAI Error:', error);
//     res.status(500).json({ error: 'Failed to validate task.' });
//   }
// });

// app.listen(5000, () => console.log('✅✅ Server running on http://localhost:5000'));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// --- server.js ---
// Backend combining OpenAI validation + DynamoDB CRUD

const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ============ OPENAI VALIDATION ============
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /validate-task
app.post('/validate-task', async (req, res) => {
  const { task } = req.body;

  const prompt = `Decide whether the following text is a meaningful to-do task (not just a greeting or vague text):\n"${task}"\nAnswer "Yes" or "No".`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
    });

    const reply = completion.choices[0].message.content.trim();
    const isMeaningful = reply.toLowerCase().includes('yes');

    res.json({
      valid: isMeaningful,
      reason: isMeaningful ? 'Task looks meaningful!' : 'Not a valid task.',
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: 'Failed to validate task.' });
  }
});

// ============ DYNAMODB CONFIG ============
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const TABLE_NAME = process.env.DYNAMODB_TABLE || 'TodoTasks';

// ============ CRUD ENDPOINTS ============

// GET all tasks
app.get('/tasks', async (req, res) => {
  try {
    const data = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
    const tasks = (data.Items || []).map(item => ({
      id: item.taskId.S,
      text: item.text.S,
      completed: item.completed.BOOL,
    }));
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST create new task
app.post('/tasks', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Task text is required' });

  const newTask = {
    taskId: { S: Date.now().toString() },
    text: { S: text },
    completed: { BOOL: false },
  };

  try {
    await client.send(new PutItemCommand({ TableName: TABLE_NAME, Item: newTask }));
    res.json({ message: 'Task added successfully', task: newTask });
  } catch (err) {
    console.error('Error adding task:', err);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// PUT update task
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;

  try {
    await client.send(
      new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: { taskId: { S: id } },
        UpdateExpression: 'set text = :t, completed = :c',
        ExpressionAttributeValues: {
          ':t': { S: text },
          ':c': { BOOL: completed },
        },
      })
    );
    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE a task
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await client.send(
      new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: { taskId: { S: id } },
      })
    );
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ============ SERVER ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

