const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const cors = require('cors');


const app = express();
app.use(cors()); 
app.use(express.json()); 

const dbPath = path.join(__dirname, 'database.db'); 
const PORT = process.env.PORT || 3000; 
let db; 

async function initializeDatabase() {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT CHECK(priority IN ('Low','Medium','High')) NOT NULL DEFAULT 'Medium',
        due_date TEXT NOT NULL, -- format: YYYY-MM-DD
        status TEXT CHECK(status IN ('Open','In Progress','Done')) NOT NULL DEFAULT 'Open',
        created_at DATETIME DEFAULT (datetime('now'))
      );
    `);

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

initializeDatabase();

// Check if priority is valid
function isValidPriority(priority) {
  const allowed = ['Low', 'Medium', 'High'];
  return allowed.includes(priority);
}

// Check if status is valid
function isValidStatus(status) {
  const allowed = ['Open', 'In Progress', 'Done'];
  return allowed.includes(status);
}

function isoDateFromString(date) {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  return pattern.test(date);
}

// Create a new task
app.post('/tasks', async (req, res) => {
  try {
    const {
      title,
      description = '',
      priority = 'Medium',
      due_date,
      status = 'Open',
    } = req.body;

    // Validation checks
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        error: 'Title is required and must be a non-empty string.',
      });
    }

    if (!due_date || !isoDateFromString(due_date)) {
      return res.status(400).json({
        error: "Due date is required and must be in 'YYYY-MM-DD' format.",
      });
    }

    if (!isValidPriority(priority)) {
      return res.status(400).json({
        error: "Priority must be one of 'Low', 'Medium', or 'High'.",
      });
    }

    if (!isValidStatus(status)) {
      return res.status(400).json({
        error: "Status must be one of 'Open', 'In Progress', or 'Done'.",
      });
    }

    // Insert new task
    const result = await db.run(
      `INSERT INTO tasks (title, description, priority, due_date, status)
       VALUES (?, ?, ?, ?, ?)`,
      [title.trim(), description, priority, due_date, status]
    );

    const newTask = await db.get('SELECT * FROM tasks WHERE id = ?', result.lastID);
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//  GET /tasks
app.get('/tasks', async (req, res) => {
  try {
    const { status, priority, sort, order, limit, offset } = req.query;

    const where = [];
    const params = [];

    if (status) {
      if (!isValidStatus(status)) {
        return res.status(400).json({
          error: "Invalid status filter. Use 'Open', 'In Progress', or 'Done'.",
        });
      }
      where.push('status = ?');
      params.push(status);
    }

    if (priority) {
      if (!isValidPriority(priority)) {
        return res.status(400).json({
          error: "Invalid priority filter. Use 'Low', 'Medium', or 'High'.",
        });
      }
      where.push('priority = ?');
      params.push(priority);
    }

    let sql = 'SELECT * FROM tasks';
    if (where.length) {
      sql += ' WHERE ' + where.join(' AND ');
    }

    let sortClause = '';
    if (sort === 'due_date_asc') sortClause = ' ORDER BY due_date ASC';
    else if (sort === 'due_date_desc') sortClause = ' ORDER BY due_date DESC';
    else if (sort === 'due_date') {
      sortClause =
        order && order.toLowerCase() === 'desc'
          ? ' ORDER BY due_date DESC'
          : ' ORDER BY due_date ASC';
    } else {
      // Default sort
      sortClause = ' ORDER BY due_date ASC, created_at ASC';
    }

    sql += sortClause;

    // Limit & Offset for pagination
    if (limit && Number(limit) > 0) {
      sql += ' LIMIT ' + Number(limit);
      if (offset && Number(offset) >= 0) {
        sql += ' OFFSET ' + Number(offset);
      }
    }

    // Execute query
    const tasks = await db.all(sql, params);
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = ['status', 'priority', 'title', 'description', 'due_date'];
    const updates = [];
    const params = [];

    for (const key of allowedFields) {
      if (req.body.hasOwnProperty(key)) {
        const value = req.body[key];

        // Validate each field
        if (key === 'status' && !isValidStatus(value)) {
          return res.status(400).json({
            error: "Status must be one of 'Open', 'In Progress', or 'Done'.",
          });
        }

        if (key === 'priority' && !isValidPriority(value)) {
          return res.status(400).json({
            error: "Priority must be one of 'Low', 'Medium', or 'High'.",
          });
        }

        if (key === 'due_date' && !isoDateFromString(value)) {
          return res.status(400).json({
            error: "Due date must be in 'YYYY-MM-DD' format.",
          });
        }

        if (key === 'title' && (!value || !value.trim())) {
          return res.status(400).json({
            error: 'Title must be a non-empty string.',
          });
        }

        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update.' });
    }

    params.push(id); // WHERE clause
    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    const result = await db.run(sql, params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', id);
    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /insights
app.get('/insights', async (req, res) => {
  try {
    const { totalTasks = 0 } =
      (await db.get(`SELECT COUNT(*) as totalTasks FROM tasks`)) || {};

    const { totalOpen = 0 } =
      (await db.get(`SELECT COUNT(*) as totalOpen FROM tasks WHERE status != 'Done'`)) ||
      {};

    const priorityRows = await db.all(
      `SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority`
    );

    const countsByPriority = { Low: 0, Medium: 0, High: 0 };
    for (const row of priorityRows) {
      countsByPriority[row.priority] = row.count;
    }

    const dueSoonRow = await db.get(`
      SELECT COUNT(*) as dueSoonCount FROM tasks
      WHERE status != 'Done'
      AND date(due_date) <= date('now', '+3 days')
      AND date(due_date) >= date('now')
    `);
    const dueSoonCount = dueSoonRow ? dueSoonRow.dueSoonCount : 0;

    const busiest = await db.get(`
      SELECT due_date, COUNT(*) as count FROM tasks
      WHERE due_date IS NOT NULL
      GROUP BY due_date
      ORDER BY count DESC, due_date ASC
      LIMIT 1
    `);

    // Simple rule-based summary
    let summary = '';
    if (totalOpen === 0) {
      summary = 'You have no active tasks — great job!';
    } else {
      summary = `You have ${totalOpen} active task${totalOpen > 1 ? 's' : ''}.`;
      if (dueSoonCount > 0) {
        summary += ` ${dueSoonCount} due within 3 days.`;
      }
      if (busiest) {
        summary += ` Busiest day: ${busiest.due_date} (${busiest.count} tasks).`;
      }
    }

    res.json({
      totalTasks,
      totalOpen,
      countsByPriority,
      dueSoonCount,
      busiestDay: busiest || null,
      summary,
    });
  } catch (err) {
    console.error('Error computing insights:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single task
app.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//  Delete a task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.run('DELETE FROM tasks WHERE id = ?', id);
    if (result.changes === 0)
      return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
