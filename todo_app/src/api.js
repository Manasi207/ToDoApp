const API_URL = 'http://localhost:5000';

export async function getTasks() {
  const res = await fetch(`${API_URL}/tasks`);
  return res.json();
}

export async function addTask(text) {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return res.json();
}

export async function toggleTask(id) {
  const res = await fetch(`${API_URL}/tasks/${id}/toggle`, { method: 'PUT' });
  return res.json();
}

export async function editTask(id, text) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function clearAllTasks() {
  const res = await fetch(`${API_URL}/tasks`, { method: 'DELETE' });
  return res.json();
}
