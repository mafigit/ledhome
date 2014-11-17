var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LedstripeSchema   = new Schema({
  name: String,
  ip: String,
  red: Number,
  green: Number,
  blue: Number
});

module.exports = mongoose.model('Ledstripe', LedstripeSchema);
