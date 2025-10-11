export const saveToLocalStorage = (tasks) => {
  localStorage.setItem('todo-tasks', JSON.stringify(tasks));
};

export const loadFromLocalStorage = () => {
  const data = localStorage.getItem('todo-tasks');
  return data ? JSON.parse(data) : [];
};
