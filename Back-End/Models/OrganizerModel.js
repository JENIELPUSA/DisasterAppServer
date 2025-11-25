const mongoose = require("mongoose");

const OrganizerSchema  = new mongoose.Schema({
    avatar: {
    url: String,
    public_id: String,
  },
  first_name: { type: String, required: true },
  middle_name: { type: String},
  last_name: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female"] },
  contact_number: String,
  email: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Organizer", OrganizerSchema );
