
//TodoItem.js

import React, { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

function TodoItem({ task, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState(task.text);

  const handleEditSave = () => {
    if (newText.trim() !== '') {
      onEdit(task.id, newText.trim());
      setIsEditing(false);
    }
  };

  return (
    <li className={`todo-item ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      {isEditing ? (
        <input
          className="edit-input"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onBlur={handleEditSave}
          onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
          autoFocus
        />
      ) : (
        <span className="task-text" onClick={() => onToggle(task.id)}>
          {task.text}
        </span>
      )}
      <div className="buttons">
        <button className="edit-btn" onClick={() => setIsEditing(true)}>
          <FiEdit2 />
        </button>
        <button className="delete-btn" onClick={() => onDelete(task.id)}>
          <FiTrash2 />
        </button>
      </div>
    </li>
  );
}

export default TodoItem;
