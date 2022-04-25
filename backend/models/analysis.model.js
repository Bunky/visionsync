const mongoose = require('mongoose');

const { Schema } = mongoose;

const analysisSchema = new Schema({
  matchId: {
    type: String,
    trim: true,
    required: true
  },
  ownerId: {
    type: String,
    trim: true,
    required: true
  },
  title: {
    type: String,
    trim: true,
    required: true
  },
  settings: {}
}, {
  timestamps: true
});

module.exports = mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);
