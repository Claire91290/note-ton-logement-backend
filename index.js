const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

let ratings = {};

app.get("/api/ratings", (req, res) => {
  res.json(ratings);
});

app.post("/api/ratings", (req, res) => {
  const data = req.body;
  if (!data.address) return res.status(400).send("Adresse manquante");

  if (!ratings[data.address]) {
    ratings[data.address] = {
      lat: data.lat,
      lng: data.lng,
      criteria: {},
      duration: data.duration,
      count: 0
    };
  }

  const entry = ratings[data.address];
  const crits = ["secteur", "acces", "interieur", "exterieur", "loyer"];
  crits.forEach(c => {
    entry.criteria[c] = ((entry.criteria[c] || 0) * entry.count + Number(data[c])) / (entry.count + 1);
  });
  entry.count += 1;

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
