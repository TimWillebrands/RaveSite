var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var photoSchema = Schema({
    name:          String,
    description:    String,
    thumbnail:      String,
    url:            String,
    item:           Number,
});

module.exports = mongoose.model('photo', photoSchema);