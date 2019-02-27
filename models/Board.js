const mongoose = require('mongoose');

const BoardSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Board = mongoose.model('Board', BoardSchema);

module.exports = { Board };
