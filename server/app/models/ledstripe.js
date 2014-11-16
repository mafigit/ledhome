var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LedstripeSchema   = new Schema({
  name: String
});

module.exports = mongoose.model('Ledstripe', LedstripeSchema);
