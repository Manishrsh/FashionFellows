const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  email: { type: String },
  otp: { type: Number, required: true },
  companyCode: { type: String }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
