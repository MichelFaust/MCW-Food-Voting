const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// SQLite Datenbank einrichten
const db = new sqlite3.Database("votes.db");

// Upload-Ziel für Bilder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, "food" + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT,
    rating INTEGER,
    adjustments TEXT,
    date TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS votedNames (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS food (
    id INTEGER PRIMARY KEY CHECK (id = 0),
    name TEXT,
    image TEXT
  )`);

  db.run(`INSERT OR IGNORE INTO food (id, name, image) VALUES (0, '', '')`);
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

      db.run(`INSERT INTO votedNames (name) VALUES (?)`, [name], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true, id: this.lastID });
      });
    }
  );
});

// Alle Votes abrufen
app.get("/api/votes", (req, res) => {
  const date = req.query.date;
  const query = date ? `SELECT * FROM votes WHERE date = ?` : `SELECT * FROM votes`;
  const params = date ? [date] : [];

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Abgestimmte Namen abrufen
app.get("/api/voted-names", (req, res) => {
  db.all(`SELECT name FROM votedNames`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const names = rows.map((row) => row.name);
    res.json(names);
  });
});

// Abgestimmte Namen zurücksetzen
app.delete("/api/voted-names", (req, res) => {
  db.run(`DELETE FROM votedNames`, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Gäste abrufen
app.get("/api/guests", (req, res) => {
  db.all(`SELECT name FROM guests`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const names = rows.map((row) => row.name);
    res.json(names);
  });
});

// Gast hinzufügen
app.post("/api/guests", (req, res) => {
  const { name } = req.body;
  db.run(`INSERT INTO guests (name) VALUES (?)`, [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

// Gäste löschen
app.delete("/api/guests", (req, res) => {
  db.run(`DELETE FROM guests`, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Gericht (Name & Bild) speichern
app.post("/api/food", (req, res) => {
  const { name, image } = req.body;
  db.run(`UPDATE food SET name = ?, image = ? WHERE id = 0`, [name, image], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Gericht abrufen
app.get("/api/food", (req, res) => {
  db.get(`SELECT name, image FROM food WHERE id = 0`, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

// Gericht-Bild separat hochladen
app.post("/api/food-image", upload.single("image"), (req, res) => {
  const imagePath = `http://${req.hostname}:3001/uploads/${req.file.filename}`;
  db.run(`UPDATE food SET image = ? WHERE id = 0`, [imagePath], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, imageUrl: imagePath });
  });
});

// Server starten
app.listen(port, () => {
  console.log(`✅ Server läuft auf http://localhost:${port}`);
});
