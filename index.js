import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

