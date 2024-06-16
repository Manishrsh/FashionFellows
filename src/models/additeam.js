// src/models/bill.js
const mongoose = require('mongoose');

const iteamSchema = new mongoose.Schema({
  iteam: {
    type: String,
    required: true,
    maxLength: 80
  },
  prize: {
    type: String,
    required: true
   
  },
  
});

const Iteam = mongoose.model('Iteam', iteamSchema);

module.exports = Iteam;
