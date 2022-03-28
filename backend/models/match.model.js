const mongoose = require('mongoose');

const { Schema } = mongoose;

const matchSchema = new Schema({
  matchId: {
    type: String,
    trim: true,
    unique: true,
    required: true
  },
  ownerId: {
    type: String,
    trim: true,
    required: true
  },
  thumbnail: {
    type: String,
    trim: true,
    required: true
  },
  title: {
    type: String,
    trim: true,
    required: true
  },
  settings: { }
}, {
  timestamps: true
});

module.exports = mongoose.models.Match || mongoose.model('Match', matchSchema);
