const express = require("express");
const cors = require("cors");
const path = require("path");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (like mic page)
app.use(express.static(path.join(__dirname, "public")));

// === FIREBASE SETUP ===
const serviceAccount = require("./firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// === IN-MEMORY MAPS ===
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

// === SAVE SPECTRUM TO FIRESTORE ===
app.post("/spectrum-save", async (req, res) => {
  const { userId, spell, spectrum } = req.body;

  // ✅ Validate input
  if (!userId || !spell || !Array.isArray(spectrum) || spectrum.length === 0) {
    console.warn("⚠️ Invalid spectrum payload:", req.body);
    return res.status(400).send("Invalid spectrum format");
  }

  try {
    await db.collection("spectrumSamples").add({
      userId,
      spell,
      spectrumData: spectrum,
      timestamp: new Date(),
    });
    console.log(`📊 Saved spectrum sample to Firestore for '${spell}' from ${userId}`);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Firestore save failed:", err);
    res.sendStatus(500);
  }
});

// === START SERVER ===
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Spell server running on port ${port}`);
});
