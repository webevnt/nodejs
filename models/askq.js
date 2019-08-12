const mongoose = require('mongoose');

// User Schema
const AskSchema = mongoose.Schema({
  answer:{
    type: String,
    required: true
  }
});

const AskQ = module.exports = mongoose.model('AskQ', AskSchema);
