const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// 🧠 Lokale IP herausfinden (für Netzwerkgeräte)
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "localhost";
}
const localIP = getLocalIP();
console.log(`✅ Server läuft auf:`);
console.log(`   http://localhost:${port}`);
console.log(`   http://${localIP}:${port}`);

const db = new sqlite3.Database("votes.db");

// 📁 Upload-Ziel für Food-Bilder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const filename = "food" + path.extname(file.originalname);
    console.log("📝 Bild-Dateiname generiert:", filename);
    cb(null, filename);
  },
});
const upload = multer({ storage });

// 📦 Tabellen anlegen
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
  )`, () => {
    db.run(`DELETE FROM food WHERE id != 0`, () => {
      db.run(`INSERT OR IGNORE INTO food (id, name, image) VALUES (0, '', '')`, () => {
        console.log("✅ food-Tabelle korrekt initialisiert (nur ID 0).");
      });
    });
  });
});

// 🧾 Middleware: Logger
app.use((req, res, next) => {
  console.log(`📥 Anfrage erhalten: [${req.method}] ${req.url}`);
  next();
});

//
// ✅ FOOD API
//

// 🔄 Gericht aktualisieren
app.post("/api/food", (req, res) => {
  const { name, image } = req.body;
  console.log("📦 /api/food Payload:", { name, image });

  if (name && image) {
    db.run(`UPDATE food SET name = ?, image = ? WHERE id = 0`, [name, image], function (err) {
      if (err) {
        console.error("❌ Fehler beim Speichern von Name & Bild:", err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log("✅ Name & Bild erfolgreich gespeichert.");
      res.json({ success: true });
    });
  } else if (name) {
    db.run(`UPDATE food SET name = ? WHERE id = 0`, [name], function (err) {
      if (err) {
        console.error("❌ Fehler beim Speichern von Name:", err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log("✅ Nur Name erfolgreich gespeichert.");
      res.json({ success: true });
    });
  } else if (image) {
    db.run(`UPDATE food SET image = ? WHERE id = 0`, [image], function (err) {
      if (err) {
        console.error("❌ Fehler beim Speichern von Bild:", err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log("✅ Nur Bild erfolgreich gespeichert.");
      res.json({ success: true });
    });
  } else {
    console.warn("⚠️ Nichts zum Speichern empfangen.");
    res.status(400).json({ error: "Kein Inhalt zum Speichern erhalten." });
  }
});

// 📤 Food-Bild separat hochladen
app.post("/api/food-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    console.error("❌ Kein Bild empfangen!");
    return res.status(400).json({ error: "Kein Bild empfangen." });
  }

  const imagePath = `${req.protocol}://${req.headers.host}/uploads/${req.file.filename}`;
  console.log("📤 Bild empfangen:", {
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: imagePath,
  });

  db.run(`UPDATE food SET image = ? WHERE id = 0`, [imagePath], (err) => {
    if (err) {
      console.error("❌ Fehler beim Speichern des Bildpfads in der DB:", err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log("✅ Bildpfad in DB gespeichert.");
    res.json({ success: true, imageUrl: imagePath });
  });
});

// 📄 Gericht abrufen
app.get("/api/food", (req, res) => {
  db.get(`SELECT name, image FROM food WHERE id = 0`, (err, row) => {
    if (err) {
      console.error("❌ Fehler beim Abrufen des Essens:", err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log("📦 food geladen:", row);
    res.json(row || {});
  });
});

//
// ✅ VOTE API
//

// 📝 Vote abgeben
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

// 📋 Alle Votes abrufen
app.get("/api/votes", (req, res) => {
  const date = req.query.date;
  const query = date ? `SELECT * FROM votes WHERE date = ?` : `SELECT * FROM votes`;
  const params = date ? [date] : [];

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 🧠 Abgestimmte Namen abrufen
app.get("/api/voted-names", (req, res) => {
  db.all(`SELECT name FROM votedNames`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const names = rows.map((row) => row.name);
    res.json(names);
  });
});

// 🧼 Namen zurücksetzen
app.delete("/api/voted-names", (req, res) => {
  db.run(`DELETE FROM votedNames`, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

//
// ✅ GÄSTE API
//

// 👥 Gäste abrufen
app.get("/api/guests", (req, res) => {
  db.all(`SELECT name FROM guests`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const names = rows.map((row) => row.name);
    res.json(names);
  });
});

// ➕ Gast hinzufügen
app.post("/api/guests", (req, res) => {
  const { name } = req.body;
  db.run(`INSERT INTO guests (name) VALUES (?)`, [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

// ❌ Gäste löschen
app.delete("/api/guests", (req, res) => {
  db.run(`DELETE FROM guests`, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

//
// ✅ SERVER START
//
app.listen(port, () => {
  console.log("🟢 Server läuft...");
});
