(function() {
    var fs      = require('fs');
    var flickr  = require('flickr-with-uploads');
    var api     = flickr(
      '6c4961f5f8fc325060fe46624f01745a', // consumer_key
      'ae098d5ff5aec525', // consumer_secret
      '72157645383049465-36ddd44496a478f8', // oauth_token
      '3fe5d13f57207188'); // oauth_token_secret
    
    module.exports.uploadImageToFlickr = function(imagePath,image,callback){
        api({
            method: 'upload',
            title: image.title,
            description: image.description,
            is_public: 1,
            is_friend: 1,
            is_family: 1,
            hidden: 2,
            photo: fs.createReadStream(imagePath)
        }, function(err, response) {
            if (err) {
            console.error('Could not upload ',imagePath,': ', err);
        }
        else {
            var new_photo_id = response.photoid[0];
            image.photo_id = new_photo_id;
            if(callback){
                callback(image);
            }
            api({method: 'flickr.photos.licenses.setLicense', photo_id: new_photo_id,license_id : 3}, function(err, response) {
                //console.log('Full photo info:', response);
            });
        }
        });
    };
    
    module.exports.getPhotoUrl = function(photoid,callback){
        api({method: 'flickr.photos.getSizes', photo_id: photoid}, function(err, response) {
            var sizes = response.sizes[0].size;
            var photos = {};
            for (var propName in sizes) {
                var image = sizes[propName];
                if(image.$.label == "Thumbnail"){
                    photos.thumbnail = image.$.source;
                }else if(image.$.label == "Original"){
                    photos.original = image.$.source;
                }
            }
            if(callback){
                callback(photos);  
            }
        });
    };
}());