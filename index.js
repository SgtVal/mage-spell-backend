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
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY); // ✅ From Render secret
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// === IN-MEMORY MAPS ===
const spellMap = {};
const listeningStatus = {};

// === SPELL CASTING ENDPOINTS ===
app.post("/cast", (req, res) => {
  const { userId, spell } = req.body;
  spellMap[userId] = spell;
  console.log(`🪄 Received spell from ${userId}: ${spell}`);
  res.sendStatus(200);
});

app.get("/get-spell/:userId", (req, res) => {
  const userId = req.params.userId;
  const spell = spellMap[userId];
  if (spell) {
    delete spellMap[userId];
    res.json({ spell });
  } else {
    res.json({});
  }
});

// === MIC LISTENING STATUS ===
app.post("/listening", (req, res) => {
  const { userId, active } = req.body;
  listeningStatus[userId] = active;
  console.log(`🎧 Listening ${active} for ${userId}`);
  res.sendStatus(200);
});

app.get("/listening/:userId", (req, res) => {
  const userId = req.params.userId;
  const active = listeningStatus[userId] || false;
  res.json({ active });
});

// === SAVE SPECTRUM TO FIRESTORE ===
app.post("/spectrum-save", async (req, res) => {
  const { userId, spell, spectrum } = req.body;

  // Validate payload
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
