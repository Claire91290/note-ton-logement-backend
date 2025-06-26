// routes/ratings.js
import express from "express";
import Rating from "../models/Rating.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const ratings = await Rating.find();
  res.json(ratings);
});

router.post("/", async (req, res) => {
  const entry = req.body;
  const { googleId } = entry;

  const user = await User.findOne({ googleId });
  if (!user) return res.status(401).json({ error: "Utilisateur non authentifié" });

  let rating = await Rating.findOne({ address: entry.address, user: user._id });

  if (!rating) {
    rating = new Rating({
      address: entry.address,
      lat: entry.lat,
      lng: entry.lng,
      housingType: entry.housingType,
      duration: entry.duration,
      criteria: {},
      comments: [],
      user: user._id,
    });
  }

  ["secteur", "acces", "interieur", "exterieur", "loyer"].forEach((key) => {
    const value = parseInt(entry[key]);
    if (!rating.criteria[key]) rating.criteria[key] = value;
    else rating.criteria[key] = (rating.criteria[key] + value) / 2;
  });

  if (entry.general_comment) {
    rating.comments.push(entry.general_comment);
  }

  await rating.save();
  res.status(201).json({ message: "Note enregistrée" });
});

router.delete("/", async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).send("Adresse manquante");

  const deleted = await Rating.deleteOne({ address });
  if (deleted.deletedCount === 0) return res.status(404).send("Aucune donnée trouvée");

  res.status(200).send("Note supprimée");
});

export default router;
