import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ratingsRoutes from "./routes/ratings.js";
import cors from "cors";
import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/ratingsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ Connecté à MongoDB");
}).catch((err) => {
  console.error("❌ Erreur de connexion à MongoDB:", err);
});

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.error("❌ MongoDB erreur :", err));

app.use("/api/ratings", ratingsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));

const dataFile = "data.json";


app.get("/api/ratings", async (req, res) => {
  const ratings = await Rating.find();
  res.json(ratings);
});


app.post("/api/ratings", async (req, res) => {
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
app.delete("/api/ratings", async (req, res) => {
  const { address } = req.body;

  if (!address) return res.status(400).send("Adresse manquante");

  const deleted = await Rating.deleteOne({ address });

  if (deleted.deletedCount === 0) {
    return res.status(404).send("Aucune donnée trouvée pour cette adresse");
  }

  res.status(200).send("Note supprimée");
});

import { OAuth2Client } from "google-auth-library";
const googleClient = new OAuth2Client("821558407646-qpu2vvs7llea21b7jc9peecsmkuvruc0.apps.googleusercontent.com");

async function verifyGoogleToken(token) {
const ticket = await googleClient.verifyIdToken({
idToken: token,
audience: "821558407646-qpu2vvs7llea21b7jc9peecsmkuvruc0.apps.googleusercontent.com",
});
return ticket.getPayload();
}

app.post("/api/verify-google-token", async (req, res) => {
const { token } = req.body;

if (!token) {
return res.status(400).json({ error: "Token manquant" });
}

try {
const userData = await verifyGoogleToken(token);
res.status(200).json({ user: userData });
} catch (error) {
res.status(401).json({ error: "Token invalide" });
}
});

}

const current = data[entry.address];

["secteur", "acces", "interieur", "exterieur", "loyer"].forEach((key) => {
const value = parseInt(entry[key]);
if (!current.criteria[key]) current.criteria[key] = value;
else current.criteria[key] = (current.criteria[key] + value) / 2;
});

if (entry.general_comment) {
current.comments.push(entry.general_comment);
}

writeData(data);
res.status(201).json({ message: "Note enregistrée" });
});

app.listen(PORT, () => {
console.log(`Serveur en ligne sur http://localhost:${PORT}`);
});
app.delete('/api/ratings', async (req, res) => {
const { address, userId } = req.body;
if (!address || !userId) return res.status(400).send("Données manquantes");
