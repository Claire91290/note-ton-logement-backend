import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
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
});

export const Rating = mongoose.model("Rating", ratingSchema);
