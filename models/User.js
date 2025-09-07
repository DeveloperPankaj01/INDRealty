// User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, unique: true },
  username: { type: String, required: true, }, // Add username field
  email: { type: String, required: true, unique: true },
  displayName: { type: String },
  photoURL: { type: String },
  providerId: { type: String },
  isAdmin: { type: Boolean, default: false }, // Add this field
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // isAdmin: { type: Boolean, default: false },

});

module.exports = mongoose.model('User', userSchema);


