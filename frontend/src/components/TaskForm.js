import React, { useState } from "react";

const TaskForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    due_date: "",
    status: "Open",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.due_date) {
      alert("Title and Due Date are required!");
      return;
    }
    onAdd(formData);
    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      due_date: "",
      status: "Open",
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        placeholder="Task Title"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
      />
      <select name="priority" value={formData.priority} onChange={handleChange}>
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
      <input
        type="date"
        name="due_date"
        value={formData.due_date}
        onChange={handleChange}
        required
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;
