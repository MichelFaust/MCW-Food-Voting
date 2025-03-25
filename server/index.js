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

app.get("/api/votes", (req, res) => {
  const date = req.query.date;
  const query = date ? `SELECT * FROM votes WHERE date = ?` : `SELECT * FROM votes`;
  const params = date ? [date] : [];

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/api/voted-names", (req, res) => {
  db.all(`SELECT name FROM votedNames`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const names = rows.map((row) => row.name);
    res.json(names);
  });
});

app.delete("/api/voted-names", (req, res) => {
  db.run(`DELETE FROM votedNames`, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

//
// ✅ GÄSTE API
//
app.get("/api/guests", (req, res) => {
  db.all(`SELECT name FROM guests`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const names = rows.map((row) => row.name);
    res.json(names);
  });
});

app.post("/api/guests", (req, res) => {
  const { name } = req.body;
  db.run(`INSERT INTO guests (name) VALUES (?)`, [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

app.delete("/api/guests", (req, res) => {
  db.run(`DELETE FROM guests`, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

//
// ✅ NEU: Ergebnisse für bestimmtes Datum berechnen
//
app.get("/api/results", (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ error: "Kein Datum angegeben." });

  db.all(`SELECT rating FROM votes WHERE date = ?`, [date], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const counts = [0, 0, 0, 0]; // Index = rating 0–3
    rows.forEach(row => {
      if (row.rating >= 0 && row.rating <= 3) counts[row.rating]++;
    });

    const total = counts.reduce((sum, val) => sum + val, 0);
    const percentages = counts.map(c => total ? Math.round((c / total) * 100) : 0);

    res.json({
      date,
      total,
      ratings: {
        "😡": counts[0],
        "😟": counts[1],
        "😊": counts[2],
        "😍": counts[3]
      },
      percentages: {
        "😡": percentages[0],
        "😟": percentages[1],
        "😊": percentages[2],
        "😍": percentages[3]
      }
    });
  });
});

//
// ✅ NEU: Alle Voting-Daten (Tagesliste) abrufen
//
app.get("/api/vote-dates", (req, res) => {
  db.all(`SELECT DISTINCT date FROM votes ORDER BY date DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const dates = rows.map(row => row.date);
    res.json(dates);
  });
});

//
// ✅ NEU: Alle Votes löschen
//
app.delete("/api/votes", (req, res) => {
  db.run(`DELETE FROM votes`, (err) => {
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

const ExcelJS = require("exceljs");
const { Parser } = require("json2csv");

function mapRatingToSmiley(rating) {
  return {
    0: "😡 (0)",
    1: "😟 (1)",
    2: "😊 (2)",
    3: "😍 (3)"
  }[rating] || rating;
}

function countRatings(rows) {
  const counts = [0, 0, 0, 0];
  rows.forEach(r => {
    if (r.rating >= 0 && r.rating <= 3) counts[r.rating]++;
  });
  const total = counts.reduce((sum, val) => sum + val, 0);
  const percentages = counts.map(c => total ? Math.round((c / total) * 100) : 0);
  return { counts, percentages, total };
}

app.get("/api/export", (req, res) => {
  const { date, type } = req.query;
  if (!date || !type) return res.status(400).json({ error: "Fehlende Parameter" });

  db.all(`SELECT * FROM votes WHERE date = ?`, [date], async (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const data = rows.map(row => ({
      Name: row.name,
      Rolle: row.role,
      Bewertung: mapRatingToSmiley(row.rating),
      Würzung: JSON.parse(row.adjustments || "[]").join(", "),
      Datum: row.date
    }));

    const { counts, percentages, total } = countRatings(rows);

    const summary = [
      { Bewertung: "😡", Stimmen: counts[0], Prozent: `${percentages[0]}%` },
      { Bewertung: "😟", Stimmen: counts[1], Prozent: `${percentages[1]}%` },
      { Bewertung: "😊", Stimmen: counts[2], Prozent: `${percentages[2]}%` },
      { Bewertung: "😍", Stimmen: counts[3], Prozent: `${percentages[3]}%` },
      { Bewertung: "Gesamt", Stimmen: total, Prozent: "100%" }
    ];

    if (type === "json") {
      return res.json({ date, votes: data, summary });
    }

    if (type === "csv") {
      const parser = new Parser();
      const csv = parser.parse([...data, {}, ...summary]);
      res.header("Content-Type", "text/csv");
      res.attachment(`votes_${date}.csv`);
      return res.send(csv);
    }

    if (type === "xlsx") {
      const wb = new ExcelJS.Workbook();
      const sheet = wb.addWorksheet(date);

      sheet.addRow(["Name", "Rolle", "Bewertung", "Würzung", "Datum"]);
      data.forEach(row => sheet.addRow(Object.values(row)));
      sheet.addRow([]);
      sheet.addRow(["Auswertung"]);
      summary.forEach(row => sheet.addRow([row.Bewertung, row.Stimmen, row.Prozent]));

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="votes_${date}.xlsx"`);

      await wb.xlsx.write(res);
      res.end();
    }
  });
});

app.get("/api/export-all", async (req, res) => {
  const { type } = req.query;
  if (!type) return res.status(400).json({ error: "Kein Typ angegeben" });

  db.all(`SELECT * FROM votes ORDER BY date`, async (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.date]) grouped[row.date] = [];
      grouped[row.date].push(row);
    });

    if (type === "json") {
      const allData = {};
      for (const [date, rows] of Object.entries(grouped)) {
        const votes = rows.map(row => ({
          Name: row.name,
          Rolle: row.role,
          Bewertung: mapRatingToSmiley(row.rating),
          Würzung: JSON.parse(row.adjustments || "[]").join(", "),
          Datum: row.date
        }));
        const { counts, percentages, total } = countRatings(rows);
        const summary = [
          { Bewertung: "😡", Stimmen: counts[0], Prozent: `${percentages[0]}%` },
          { Bewertung: "😟", Stimmen: counts[1], Prozent: `${percentages[1]}%` },
          { Bewertung: "😊", Stimmen: counts[2], Prozent: `${percentages[2]}%` },
          { Bewertung: "😍", Stimmen: counts[3], Prozent: `${percentages[3]}%` },
          { Bewertung: "Gesamt", Stimmen: total, Prozent: "100%" }
        ];
        allData[date] = { votes, summary };
      }
      return res.json(allData);
    }

    if (type === "csv") {
      let allRows = [];
      for (const [date, rows] of Object.entries(grouped)) {
        allRows.push({ Abschnitt: `=== ${date} ===` });
        const votes = rows.map(row => ({
          Name: row.name,
          Rolle: row.role,
          Bewertung: mapRatingToSmiley(row.rating),
          Würzung: JSON.parse(row.adjustments || "[]").join(", "),
          Datum: row.date
        }));
        allRows = allRows.concat(votes);
        allRows.push({});
        const { counts, percentages, total } = countRatings(rows);
        allRows = allRows.concat([
          { Bewertung: "😡", Stimmen: counts[0], Prozent: `${percentages[0]}%` },
          { Bewertung: "😟", Stimmen: counts[1], Prozent: `${percentages[1]}%` },
          { Bewertung: "😊", Stimmen: counts[2], Prozent: `${percentages[2]}%` },
          { Bewertung: "😍", Stimmen: counts[3], Prozent: `${percentages[3]}%` },
          { Bewertung: "Gesamt", Stimmen: total, Prozent: "100%" },
          {}
        ]);
      }
      const parser = new Parser();
      const csv = parser.parse(allRows);
      res.header("Content-Type", "text/csv");
      res.attachment(`votes_full_export.csv`);
      return res.send(csv);
    }

    if (type === "xlsx") {
      const wb = new ExcelJS.Workbook();

      for (const [date, rows] of Object.entries(grouped)) {
        const sheet = wb.addWorksheet(date);
        const votes = rows.map(row => ({
          Name: row.name,
          Rolle: row.role,
          Bewertung: mapRatingToSmiley(row.rating),
          Würzung: JSON.parse(row.adjustments || "[]").join(", "),
          Datum: row.date
        }));

        sheet.addRow(["Name", "Rolle", "Bewertung", "Würzung", "Datum"]);
        votes.forEach(row => sheet.addRow(Object.values(row)));
        sheet.addRow([]);
        sheet.addRow(["Auswertung"]);

        const { counts, percentages, total } = countRatings(rows);
        const summary = [
          { Bewertung: "😡", Stimmen: counts[0], Prozent: `${percentages[0]}%` },
          { Bewertung: "😟", Stimmen: counts[1], Prozent: `${percentages[1]}%` },
          { Bewertung: "😊", Stimmen: counts[2], Prozent: `${percentages[2]}%` },
          { Bewertung: "😍", Stimmen: counts[3], Prozent: `${percentages[3]}%` },
          { Bewertung: "Gesamt", Stimmen: total, Prozent: "100%" }
        ];

        summary.forEach(row => sheet.addRow([row.Bewertung, row.Stimmen, row.Prozent]));
      }

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="votes_full_export.xlsx"`);

      await wb.xlsx.write(res);
      res.end();
    }
  });
});
