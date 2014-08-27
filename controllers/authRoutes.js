var express = require('express');
var fs      = require('fs');
var path    = require('path');
var os              = require('os');
var ejs     = require('ejs');
var flickr  = require('../lib/flickrLib');
var Photo   = require('../models/Photo');
var Item   = require('../models/Item');
var Busboy      = require('busboy');
var inspect = require('util').inspect;

module.exports.controller = function(app) {
    var authRoutes          = express.Router();
    
    function getFile(fileName){
        return fs.readFileSync(__dirname + '/../views/' + fileName + '.ejs', 'utf8');
    }
    
    
    authRoutes.get('/', function(req, res) {
        Item.find(function (err, itms) {
            if (err) return console.error(err);
            res.render('foundation', { 
                body: ejs.render(getFile('admin'), {
                    title: 'Admin',
                    items: itms
                }),
            });
        });
    });
    
    authRoutes.route('/photo')
    .post(function(req, res) {
        var newPhoto;
        var newPhotoInfo = {};
        var busboy = new Busboy({ headers: req.headers });
        
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            console.log(fieldname);
            var saveTo = path.join(os.tmpDir(), filename);
            var writeFile = fs.createWriteStream(saveTo);
            file.pipe(writeFile);
            
    		writeFile.on('finish',function(){
                flickr.uploadImageToFlickr(saveTo,{
                    title : filename,
                    description: "Mah new bud",
                },function(image){
                    flickr.getPhotoUrl(image.photo_id,function(photos){
                        var photo = new Photo({
                            title: image.title,
                            description: image.description,
                            thumbnail: photos.thumbnail,
                            url: photos.original,
                        });
                        
                        photo.save(function (err, fluffy) {
                            if (err) return console.error(err);
                            fs.unlinkSync(saveTo);
                            newPhoto = fluffy;
                        });
                    });
                });
    		});
        });
        busboy.on('field', function(fieldname, val) {
            newPhotoInfo[fieldname] = val;
        });
        busboy.on('finish', function() {
            Item.findById(newPhotoInfo.item, function (err, item) {
                if (err) return console.error(err);
                
                item.addPhoto(newPhoto);
                item.save(function (err) {
                    if (err) return console.error(err);
                    res.send(item);
                });
            });
        });
        req.pipe(busboy);
		return;
	})
    .get(function(req, res) {
		Photo.find(function(err, photos) {
			if (err) return res.send(err);

			res.json(photos);
		});
	});
	
    authRoutes.route('/photo/:photo_id')
    .get(function(req, res) {
		Photo.findById(req.params.photo_id, function(err, photo) {
			if (err) {res.send(err)}
			res.json(photo);
		});
	});
	
    authRoutes.route('/item')
    .post(function(req, res) {
        var item = new Item({
            title: "Super item title",
            description: "Super item description",
            thumbnail: "http://www.msgplus.net/Documents/cd0466a1-77cb-4bfb-a130-851d1079de0b/Thumbnail.jpg"
        });
        
        item.save(function (err, savedItem) {
            if (err) return console.error(err);
			res.json(savedItem._itemId);
            console.log("new Item: " + savedItem.id);
        });
	})
    .get(function(req, res) {
		Item.find(function(err, items) {
			if (err) return res.send(err);

			res.json(items);
		});
	});
    
    app.use('/admin', authRoutes);
};