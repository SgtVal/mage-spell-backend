const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());


const spellMap = {};

app.post("/cast", (req, res) => {
  const { userId, spell } = req.body;
  spellMap[userId] = spell;
  console.log(`Received spell from ${userId}: ${spell}`);
  res.sendStatus(200);
});

app.get("/get-spell/:userId", (req, res) => {
  const spell = spellMap[req.params.userId] || null;
  res.json({ spell });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Spell server running on port ${port}`));
