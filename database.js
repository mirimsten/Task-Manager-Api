
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

// יצירת טבלת משימות במסד הנתונים
db.serialize(() => {
    db.run(`CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT CHECK(status IN ('for handling', 'in process', 'done')) NOT NULL,
        due_date TEXT
    )`);
});

module.exports = db;
