const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// SQLite Datenbank einrichten
const db = new sqlite3.Database("votes.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT,
    rating INTEGER,
    adjustments TEXT,
    date TEXT
  )`);
});

// Vote speichern
app.post("/api/vote", (req, res) => {
  const { name, role, rating, adjustments } = req.body;
  const date = new Date().toISOString().split("T")[0];

  db.run(
    `INSERT INTO votes (name, role, rating, adjustments, date) VALUES (?, ?, ?, ?, ?)`,
    [name, role, rating, JSON.stringify(adjustments), date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Votes abrufen
app.get("/api/votes", (req, res) => {
  const date = req.query.date;
  const query = date ? `SELECT * FROM votes WHERE date = ?` : `SELECT * FROM votes`;
  const params = date ? [date] : [];

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server läuft auf http://localhost:${port}`);
  });
  
