// File: src/utils/localStorage.js
export const saveToLocalStorage = (tasks) => {
  try {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
  } catch (err) {
    console.warn('Failed to save tasks:', err);
  }
};

export const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem('todo-tasks');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn('Failed to load tasks:', err);
    return [];
  }
};

