const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  nickname: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
});

UserSchema.virtual('userId').get(function () {
  return this._id.toHexString();
});

UserSchema.set('toJSON', {
  virtual: true,
});

module.exports = mongoose.model('User', UserSchema);
