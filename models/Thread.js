const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ReplySchema = require('./Reply');

const ThreadSchema = mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  created_on: Date,
  bumped_on: Date,
  reported: {
    type: Boolean,
    required: true,
    default: false,
  },
  delete_password: {
    type: String,
    required: true,
  },
  replies: [ReplySchema],
  boardName: {
    type: String,
    required: true,
  },
});

ThreadSchema.pre('save', function(next){
  var thread = this;

  if(thread.isModified('delete_password')){
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(thread['delete_password'], salt, (err, hash) => {
        thread['delete_password'] = hash;
        next();
      });
    })
  }else{
    next();
  }
});

const Thread = mongoose.model('Thread', ThreadSchema);

module.exports = { Thread };
