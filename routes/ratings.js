import express from "express";
import Rating from "../models/Rating.js";

const router = express.Router();

// 🔸 POST (create or update)
router.post("/", async (req, res) => {
  const { userId, address, lat, lng, duration, housingType, general_comment, ...ratings } = req.body;

  if (!userId || !address) return res.status(400).json({ message: "Champs requis manquants." });

  try {
    const existing = await Rating.findOne({ userId, address });

    if (existing) {
      existing.lat = lat;
      existing.lng = lng;
      existing.duration = duration;
      existing.housingType = housingType;
      existing.general_comment = general_comment;
      existing.ratings = {
        secteur: parseInt(ratings.secteur),
        acces: parseInt(ratings.acces),
        interieur: parseInt(ratings.interieur),
        exterieur: parseInt(ratings.exterieur),
        loyer: parseInt(ratings.loyer)
      };
      await existing.save();
      return res.status(200).json({ message: "Note mise à jour." });
    } else {
      const newRating = new Rating({
        userId,
        address,
        lat,
        lng,
        duration,
        housingType,
        general_comment,
        ratings: {
          secteur: parseInt(ratings.secteur),
          acces: parseInt(ratings.acces),
          interieur: parseInt(ratings.interieur),
          exterieur: parseInt(ratings.exterieur),
          loyer: parseInt(ratings.loyer)
        }
      });
      await newRating.save();
      return res.status(201).json({ message: "Note ajoutée." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 🔸 GET (average by address)
router.get("/", async (req, res) => {
  try {
    const all = await Rating.find();
    const grouped = {};

    all.forEach(r => {
      if (!grouped[r.address]) {
        grouped[r.address] = {
          criteria: {
            secteur: 0,
            acces: 0,
            interieur: 0,
            exterieur: 0,
            loyer: 0
          },
          count: 0,
          lat: r.lat,
          lng: r.lng,
          duration: r.duration,
          userId: r.userId
        };
      }
      grouped[r.address].criteria.secteur += r.ratings.secteur;
      grouped[r.address].criteria.acces += r.ratings.acces;
      grouped[r.address].criteria.interieur += r.ratings.interieur;
      grouped[r.address].criteria.exterieur += r.ratings.exterieur;
      grouped[r.address].criteria.loyer += r.ratings.loyer;
      grouped[r.address].count += 1;
    });

    for (const addr in grouped) {
      const c = grouped[addr].criteria;
      const count = grouped[addr].count;
      for (let key in c) {
        c[key] = c[key] / count;
      }
    }

    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 🔸 DELETE (by userId and address)
router.delete("/", async (req, res) => {
  const { userId, address } = req.body;

  try {
    const result = await Rating.findOneAndDelete({ userId, address });
    if (result) {
      res.status(200).json({ message: "Note supprimée." });
    } else {
      res.status(404).json({ message: "Note non trouvée." });
    }
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression." });
  }
});

export default router;
