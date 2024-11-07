// app.js
const express = require('express');
const db = require('./database');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// יצירת משימה חדשה
app.post('/tasks', (req, res) => {
    const { title, description, status, due_date } = req.body;
    db.run(
        `INSERT INTO tasks (title, description, status, due_date) VALUES (?, ?, ?, ?)`,
        [title, description, status, due_date],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID });
        }
    );
});

// הצגת כל המשימות (אפשרות סינון לפי סטטוס)
app.get('/tasks', (req, res) => {
    const { status } = req.query;
    let query = 'SELECT * FROM tasks';
    let params = [];

    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// הצגת משימה בודדת לפי מזהה
app.get('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM tasks WHERE id = ?`, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(row);
    });
});

// עדכון משימה קיימת
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, status, due_date } = req.body;

    db.run(
        `UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ? WHERE id = ?`,
        [title, description, status, due_date, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.json({ message: 'Task updated successfully' });
        }
    );
});

// מחיקת משימה לפי מזהה
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM tasks WHERE id = ?`, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

// הפעלת השרת
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
