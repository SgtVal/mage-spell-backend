const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const spellMap = {};
const listeningStatus = {};

// Save spell from client (mic page)
app.post("/cast", (req, res) => {
  const { userId, spell } = req.body;
  spellMap[userId] = spell;
  console.log(`Received spell from ${userId}: ${spell}`);
  res.sendStatus(200);
});

// Get spell for Roblox, then clear it
app.get("/get-spell/:userId", (req, res) => {
  const userId = req.params.userId;
  const spell = spellMap[userId];

  if (spell) {
    delete spellMap[userId]; // Clear after fetching
    res.json({ spell });
  } else {
    res.json({}); // No spell available
  }
});

// Set listening status (from Roblox when holding/releasing button)
app.post("/listening", (req, res) => {
  const { userId, active } = req.body;
  listeningStatus[userId] = active;
  console.log(`Listening status for ${userId}: ${active}`);
  res.sendStatus(200);
});

// Get listening status (for mic page polling)
app.get("/listening/:userId", (req, res) => {
  const userId = req.params.userId;
  const active = listeningStatus[userId] || false;
  res.json({ active });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Spell server running on port ${port}`));
