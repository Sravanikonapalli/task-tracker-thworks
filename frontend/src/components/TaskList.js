import React, { useState } from "react";

const TaskList = ({ tasks, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditForm({ title: task.title, description: task.description || "" });
  };

  const handleSave = (id) => {
    if (!editForm.title.trim()) {
      alert("Title cannot be empty");
      return;
    }
    onUpdate(id, editForm);
    setEditingId(null);
  };

  const handleCancel = () => setEditingId(null);

  const handleStatusChange = (id, e) => {
    onUpdate(id, { status: e.target.value });
  };

  const handlePriorityChange = (id, e) => {
    onUpdate(id, { priority: e.target.value });
  };

  return (
    <div className="task-list">
      <h2>Task List</h2>
      {tasks.length === 0 ? (
        <p>No tasks available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>
                  {editingId === t.id ? (
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                    />
                  ) : (
                    t.title
                  )}
                </td>
                <td>
                  {editingId === t.id ? (
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({ ...editForm, description: e.target.value })
                      }
                    />
                  ) : (
                    t.description || "-"
                  )}
                </td>
                <td>
                  <select
                    value={t.priority}
                    onChange={(e) => handlePriorityChange(t.id, e)}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </td>
                <td>
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.id, e)}
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </td>
                <td>{t.due_date}</td>
                <td>
                  {editingId === t.id ? (
                    <>
                      <button onClick={() => handleSave(t.id)}>Save</button>
                      <button onClick={handleCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(t)}>Edit</button>
                      <button className="delete" onClick={() => onDelete(t.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TaskList;
