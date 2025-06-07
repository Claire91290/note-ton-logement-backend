require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Rating = require('./models/Rating');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ Connexion MongoDB réussie"))
  .catch(err => console.error("❌ Erreur MongoDB :", err));

app.post('/api/ratings', async (req, res) => {
  try {
    const data = req.body;
    const newRating = new Rating({
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      duration: data.duration,
      housingType: data.housingType,
      general_comment: data.general_comment,
      ratings: {
        secteur: Number(data.secteur),
        acces: Number(data.acces),
        interieur: Number(data.interieur),
        exterieur: Number(data.exterieur),
        loyer: Number(data.loyer)
      }
    });

    await newRating.save();
    res.status(201).json({ message: "Évaluation enregistrée." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

app.get('/api/ratings', async (req, res) => {
  try {
    const ratings = await Rating.find();
    const grouped = {};

    for (const rating of ratings) {
      const addr = rating.address;
      if (!grouped[addr]) {
        grouped[addr] = {
          lat: rating.lat,
          lng: rating.lng,
          criteria: {
            secteur: [],
            acces: [],
            interieur: [],
            exterieur: [],
            loyer: []
          },
          durations: []
        };
      }
      const r = rating.ratings;
      grouped[addr].criteria.secteur.push(r.secteur);
      grouped[addr].criteria.acces.push(r.acces);
      grouped[addr].criteria.interieur.push(r.interieur);
      grouped[addr].criteria.exterieur.push(r.exterieur);
      grouped[addr].criteria.loyer.push(r.loyer);
      grouped[addr].durations.push(rating.duration);
    }

    const result = {};
    for (const addr in grouped) {
      const g = grouped[addr];
      const avg = {};
      for (const crit in g.criteria) {
        const values = g.criteria[crit];
        avg[crit] = values.reduce((a, b) => a + b, 0) / values.length;
      }
      result[addr] = {
        lat: g.lat,
        lng: g.lng,
        criteria: avg,
        duration: mostCommon(g.durations)
      };
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur récupération des notes." });
  }
});

function mostCommon(arr) {
  return arr.sort((a,b) =>
    arr.filter(v => v === a).length - arr.filter(v => v === b).length
  ).pop();
}

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
