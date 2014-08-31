var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var itemSchema = mongoose.Schema({
    
    name:          String,
    description:    String,
    thumbnail:      String,
    photos:         [String]
});

itemSchema.methods.addPhoto = function (photo) {
    this.photos.push(photo.id);
    photo.item = this.id;
    photo.save(function (err) {
        if (err) return console.error(err);
    });
    this.save(function (err) {
        if (err) return console.error(err);
    });
};

module.exports = mongoose.model('item', itemSchema);