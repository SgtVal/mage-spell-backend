const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static mic page
app.use(express.static(path.join(__dirname, "public")));

const spellMap = {};

// Save spell from client
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
    delete spellMap[userId]; // ✅ Clear after fetching
    res.json({ spell });
  } else {
    res.json({}); // No spell available
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Spell server running on port ${port}`));
