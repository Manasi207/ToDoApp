// src/utils/api.js
// 👇 Replace with your actual backend URL (EC2 Public IP or Render domain)
const API_BASE = "http://13.60.173.117:5000";

// ✅ Get all tasks (from DynamoDB)
export const fetchTasks = async () => {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

// ✅ Add new task (validated and stored in DynamoDB)
export const addTask = async (text) => {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to add task");
  return res.json();
};

// ✅ Update a task (edit text or mark completed)
export const updateTask = async (id, text, completed) => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, completed }),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
};

// ✅ Delete a task by ID
export const deleteTask = async (id) => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
};

// ✅ Validate a task (using OpenAI backend)
export const validateTask = async (task) => {
  const res = await fetch(`${API_BASE}/validate-task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task }),
  });
  if (!res.ok) throw new Error("Failed to validate task");
  return res.json();
};
