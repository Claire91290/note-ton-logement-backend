// models/Rating.js
import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  address: String,
  lat: Number,
  lng: Number,
  housingType: String,
  duration: String,
  criteria: {
    secteur: Number,
    acces: Number,
    interieur: Number,
    exterieur: Number,
    loyer: Number,
  },
  comments: [String],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Rating", ratingSchema);
