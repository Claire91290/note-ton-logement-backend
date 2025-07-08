import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import ratingsRoutes from "./routes/ratings.js";
import Rating from "./models/Rating.js";
import User from "./models/User.js";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
useNewUrlParser: true,
useUnifiedTopology: true,
})
.then(() => console.log("✅ Connecté à MongoDB"))
.catch((err) => console.error("❌ Erreur de connexion à MongoDB:", err));

// Routes API
app.use("/api/ratings", ratingsRoutes);

// Route GET – récupérer toutes les évaluations
app.get("/api/ratings", async (req, res) => {
try {
const ratings = await Rating.find();
res.json(ratings);
} catch (err) {
res.status(500).json({ error: "Erreur lors de la récupération des données" });
}
});

// Route POST – ajouter une évaluation
app.post("/api/ratings", async (req, res) => {
try {
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

// Mettre à jour les critères
["secteur", "acces", "interieur", "exterieur", "loyer"].forEach((key) => {
const value = parseInt(entry[key]);
if (!isNaN(value)) {
if (!rating.criteria[key]) rating.criteria[key] = value;
else rating.criteria[key] = (rating.criteria[key] + value) / 2;
}
});

// Ajouter le commentaire
if (entry.general_comment) {
rating.comments.push(entry.general_comment);
}

await rating.save();
res.status(201).json({ message: "Note enregistrée" });
} catch (err) {
console.error("Erreur POST /api/ratings :", err);
res.status(500).json({ error: "Erreur lors de l'enregistrement" });
}
});

// Route DELETE – supprimer une évaluation
app.delete("/api/ratings", async (req, res) => {
const { address } = req.body;

if (!address) return res.status(400).send("Adresse manquante");

try {
const deleted = await Rating.deleteOne({ address });

if (deleted.deletedCount === 0) {
return res.status(404).send("Aucune donnée trouvée pour cette adresse");
}

res.status(200).send("Note supprimée");
} catch (err) {
res.status(500).send("Erreur lors de la suppression");
}
});

// Authentification Google
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
const ticket = await googleClient.verifyIdToken({
idToken: token,
audience: process.env.GOOGLE_CLIENT_ID,
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

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
