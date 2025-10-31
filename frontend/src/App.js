import React, { useEffect, useState } from "react";
import axios from "axios";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import Insights from "./components/Insights";
import "./App.css";

const BACKEND_URL = "https://task-tracker-thworks.onrender.com";

function App() {
  const [tasks, setTasks] = useState([]);
  const [insights, setInsights] = useState("");

  const fetchTasks = async (filters = {}) => {
    try {
      let url = `${BACKEND_URL}/tasks`;
      const params = new URLSearchParams(filters);
      if (params.toString()) url += `?${params.toString()}`;
      const res = await axios.get(url);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/insights`);
      setInsights(res.data.summary);
    } catch (err) {
      console.error("Error fetching insights:", err);
    }
  };

  const addTask = async (newTask) => {
    try {
      await axios.post(`${BACKEND_URL}/tasks`, newTask);
      fetchTasks();
      fetchInsights();
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      await axios.patch(`${BACKEND_URL}/tasks/${id}`, updates);
      fetchTasks();
      fetchInsights();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

const deleteTask = async (id) => {
  try {
    await axios.delete(`${BACKEND_URL}/tasks/${id}`);
    fetchTasks();
    fetchInsights();
  } catch (err) {
    console.error("Error deleting task:", err);
  }
};

  useEffect(() => {
    fetchTasks();
    fetchInsights();
  }, []);

  return (
    <div className="container">
      <h1>Task Tracker with Smart Insights</h1>
      <TaskForm onAdd={addTask} />
      <Insights summary={insights} />
      <TaskList tasks={tasks} onUpdate={updateTask} onDelete={deleteTask} />
    </div>
  );
}

export default App;
