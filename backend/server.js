// --- Express Server: server.js ---

// File: server.js (Node.js Backend)
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.post('/validate-task', async (req, res) => {
  const { task } = req.body;

  const prompt = `Decide whether the following text is a meaningful to-do task (not just a greeting or vague text):\n"${task}"\nAnswer "Yes" or "No".`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ]
    });

    const reply = completion.choices[0].message.content.trim();
    const isMeaningful = reply.toLowerCase().includes('yes');
    // res.json({ isMeaningful });
    res.json({ valid: isValid, reason });

  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: 'Failed to validate task.' });
  }
});

