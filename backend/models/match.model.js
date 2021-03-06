const mongoose = require('mongoose');

const { Schema } = mongoose;

const matchSchema = new Schema({
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
  config: { }
}, {
  timestamps: true
});

module.exports = mongoose.models.Match || mongoose.model('Match', matchSchema);
