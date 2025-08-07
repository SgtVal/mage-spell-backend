const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (like mic page)
app.use(express.static(path.join(__dirname, "public")));

const spellMap = {};
const listeningStatus = {};

// === SPELL CASTING ENDPOINTS ===

// Save spell from client (mic page)
app.post("/cast", (req, res) => {
  const { userId, spell } = req.body;
  spellMap[userId] = spell;
  console.log(`🪄 Received spell from ${userId}: ${spell}`);
  res.sendStatus(200);
});

// Get spell for Roblox, then clear it
app.get("/get-spell/:userId", (req, res) => {
  const userId = req.params.userId;
  const spell = spellMap[userId];

  if (spell) {
    delete spellMap[userId]; // Clear after fetch
    res.json({ spell });
  } else {
    res.json({});
  }
});

// === MIC LISTENING STATUS ===

// Set listening status (from Roblox client)
app.post("/listening", (req, res) => {
  const { userId, active } = req.body;
  listeningStatus[userId] = active;
  console.log(`🎧 Listening ${active} for ${userId}`);
  res.sendStatus(200);
});

// Get current listening status (for mic UI polling)
app.get("/listening/:userId", (req, res) => {
  const userId = req.params.userId;
  const active = listeningStatus[userId] || false;
  res.json({ active });
});

// === OPTIONAL: SAVE RAW SPECTRUM FOR ML TRAINING ===
app.post("/spectrum-save", (req, res) => {
  const { userId, spell, spectrum } = req.body;
  const timestamp = Date.now();
  const fileName = `spectrum_${spell}_${userId}_${timestamp}.json`;

  fs.writeFile(`./data/${fileName}`, JSON.stringify(spectrum), (err) => {
    if (err) {
      console.error("❌ Failed to save spectrum:", err);
      return res.sendStatus(500);
    }
    console.log(`📊 Saved spectrum sample for '${spell}' as ${fileName}`);
    res.sendStatus(200);
  });
});

// === START SERVER ===
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Spell server running on port ${port}`);
});
