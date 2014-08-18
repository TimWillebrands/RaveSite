var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var photoSchema = mongoose.Schema({
 
    _itemId:        Schema.Types.ObjectId,   title: Str         ing,
    description: Stri   ng,
    thumbnail: Strin     g,
    url: String           ,
});


    photoIds:       [Number]module.exports = mongoose.model('user', photoSchema);