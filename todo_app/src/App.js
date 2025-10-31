// todo_app/src/App.js

/////////////////////////////////////////////////////////////////////////
import React, { useEffect, useState } from 'react';
import TodoItem from './components/TodoItem';
import {
  getTasks,
  addTask,
  toggleTask,
  editTask,
  deleteTask,
  clearAllTasks
} from './api';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // ✅ success, warning, error

  // ✅ Load tasks from backend
  useEffect(() => {
    (async () => {
      const data = await getTasks();
      setTasks(data);
    })();
  }, []);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 2000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    const newTask = await addTask(taskInput);
    setTasks((prev) => [...prev, newTask]);
    setTaskInput('');
    showMessage('New Task Added Successfully!!', 'success'); // ✅ green
  };

  const handleToggle = async (id) => {
    const updated = await toggleTask(id);
    setTasks(updated);
  };

  const handleEdit = async (id, newText) => {
    const updated = await editTask(id, newText);
    setTasks(updated);
    showMessage('Task Updated Successfully!!', 'warning'); // ✅ yellow
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showMessage('One Task Deleted!!', 'error'); // ✅ red
  };

  const handleClear = async () => {
    await clearAllTasks();
    setTasks([]);
    showMessage('All Tasks Cleared!!!', 'error'); // ✅ red
  };

  const filteredTasks = tasks
    .filter((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((t) => {
      if (filterStatus === 'completed') return t.completed;
      if (filterStatus === 'in-progress') return !t.completed;
      return true;
    });

  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <div className="todo-container">

       {/* ✅ Message Popup inside container */}
      {message && (
        <div className={`alert-popup ${messageType}`}>
          {message}
        </div>
      )}

      <h1>Get Things Done!</h1>

       

      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="What's your next task?"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

    
      <div className="search-box">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filter-options">
        <label><input type="radio" checked={filterStatus==='all'} onChange={()=>setFilterStatus('all')} /> All</label>
        <label><input type="radio" checked={filterStatus==='in-progress'} onChange={()=>setFilterStatus('in-progress')} /> In Progress</label>
        <label><input type="radio" checked={filterStatus==='completed'} onChange={()=>setFilterStatus('completed')} /> Completed</label>
      </div>

      <p className="task-count">
        You have <strong>{remaining}</strong> task(s) remaining
      </p>

      {tasks.length > 0 && (
        <button className="clear-btn" onClick={handleClear}>
          Clear All
        </button>
      )}

      <ul className="todo-list">
        {filteredTasks.map((t) => (
          <TodoItem
            key={t.id}
            task={t}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </ul>
    </div>
  );
}

export default App;
