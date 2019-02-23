const mongoose = require('mongoose');

const ReplySchema = mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  created_on: Date,
  delete_password: {
    type: String,
    required: true
  },
  reported: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = ReplySchema;