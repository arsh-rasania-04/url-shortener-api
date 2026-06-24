const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  urlCode: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: String,
    default: Date.now,
  }
});

module.exports = mongoose.model('Url', urlSchema);