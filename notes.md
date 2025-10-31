## 1. Design Decisions
- **Frontend:** React – simple and modular UI.
- **Backend:** Node.js + Express – easy REST API setup.
- **Database:** SQLite3 – lightweight, file-based DB for easy local storage.

## 2. Database Schema
**Table: tasks**
- id (INTEGER, PK, AUTOINCREMENT)
- title (TEXT)
- description (TEXT)
- priority (TEXT: Low / Medium / High)
- due_date (TEXT: YYYY-MM-DD)
- status (TEXT: Open / In Progress / Done)
- created_at (DATETIME)

## 3. API Endpoints
- POST /tasks – create task
- GET /tasks – get all tasks (filter by status/priority)
- GET /tasks/:id – get single task
- PATCH /tasks/:id – update task
- DELETE /tasks/:id – delete task
- GET /insights – smart summary of tasks

## 4. Smart Insights
- Counts total and open tasks.
- Groups tasks by priority.
- Finds tasks due in next 3 days.
- Finds busiest day by due date.

Example:  
“You have 6 active tasks, 2 due soon, busiest day: 2025-11-02.”

## 5. Improvements
- Add pagination.
- Add user login/auth.
- Add sorting/filtering in frontend.
- Deploy using Render for backend and Vercel for frontend.
