import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  userId: String,
  address: String,
  lat: Number,
  lng: Number,
  duration: String,
  housingType: String,
  general_comment: String,
  ratings: {
    secteur: Number,
    acces: Number,
    interieur: Number,
    exterieur: Number,
    loyer: Number
  },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Rating", ratingSchema);
