import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ratingsRoutes from "./routes/ratings.js";
import cors from "cors";

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

function readData() {
if (!fs.existsSync(dataFile)) return {};
const raw = fs.readFileSync(dataFile);
return JSON.parse(raw);
}

function writeData(data) {
fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

app.get("/api/ratings", (req, res) => {
const data = readData();
res.json(data);
});

app.post("/api/ratings", (req, res) => {
const entry = req.body;
const data = readData();
if (!data[entry.address]) {
data[entry.address] = {
criteria: {},
lat: entry.lat,
lng: entry.lng,
housingType: entry.housingType,
duration: entry.duration,
comments: []
};
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
