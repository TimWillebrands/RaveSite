var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var photoSchema = Schema({
    _photoId:       Schema.Types.ObjectId,
    title:          String,
    description:    String,
    thumbnail:      String,
    url:            String,
});

module.exports = mongoose.model('user', photoSchema);