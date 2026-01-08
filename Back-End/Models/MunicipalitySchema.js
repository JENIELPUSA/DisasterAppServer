const mongoose = require("mongoose");

const municipalitySchema = new mongoose.Schema({
  municipalityName: { type: String, required: true, unique: true },
  code: { type: String },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

module.exports = mongoose.model("Municipality", municipalitySchema);
