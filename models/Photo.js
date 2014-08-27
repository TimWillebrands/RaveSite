var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var photoSchema = Schema({
    title:          String,
    description:    String,
    thumbnail:      String,
    url:            String,
    item:           Number,
});

module.exports = mongoose.model('photo', photoSchema);