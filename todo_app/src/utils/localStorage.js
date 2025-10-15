// File: src/utils/localStorage.js
export const saveToLocalStorage = (tasks) => {
  try {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
  } catch (e) {
    console.warn("Failed to save to localStorage", e);
  }
};

export const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem('todo-tasks');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn("Failed to load from localStorage", e);
    return [];
  }
};
