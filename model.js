const mongoose = require('mongoose');

const cryptoSchema = new mongoose.Schema({
  coin: String,
  price: Number,
  marketCap: Number,
  '24hChange': Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Crypto = mongoose.model('Crypto', cryptoSchema);

module.exports = Crypto;
