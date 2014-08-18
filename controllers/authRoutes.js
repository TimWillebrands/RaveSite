var express = require('express');
var fs      = require('fs');
var ejs     = require('ejs');
var flickr  = require('../lib/flickrLib');
var Photo   = require('../models/Photo');

module.exports.controller = function(app) {
    var authRoutes          = express.Router();
    
    function getFile(fileName){
        return fs.readFileSync(__dirname + '/../views/' + fileName + '.ejs', 'utf8');
    }
    
    
    authRoutes.get('/', function(req, res) {
        res.render('foundation', { 
            body: ejs.render(getFile('admin'), {
                title: 'Admin',
                items: [
                    {
                        Name: "Item 001",
                        Url: "www.asd.nl/image1.jpg",
                        Description: "Pretty image"
                    },
                    {
                        Name: "Item 002",
                        Url: "www.asd.nl/image3.jpg",
                        Description: "Pretty image"
                    },
                    {
                        Name: "Item 003",
                        Url: "www.asd.nl/image3.jpg",
                        Description: "Pretty image"
                    },
                    {
                        Name: "Item 004",
                        Url: "www.asd.nl/image4.jpg",
                        Description: "Pretty image"
                    },
                    {
                        Name: "Item 006",
                        Url: "www.asd.nl/image6.jpg",
                        Description: "Pretty image"
                    },
                    {
                        Name: "Item 007",
                        Url: "www.asd.nl/image7.jpg",
                        Description: "Pretty image"
                    }
                ]
            }),
        });
    });
    
    authRoutes.route('/photo')
	.post(function(req, res) {
		
		var photo = new Photo(); // create a new instance of the Bear model
		photo.name = req.body.name;  // set the bears name (comes from the request)

		// save the bear and check for errors
		photo.save(function(err) {
			if (err) return res.send(err);

			res.json({ message: 'Photo created!' });
		});
		
		
        flickr.uploadImageToFlickr('./public/images/Joseph.gif',{
            title : "Joseph",
            description: "Mah new bud",
        },function(image){
            flickr.getPhotoUrl(image.photo_id,function(photos){
                var Joseph = new Photo({
                    title: image.title,
                    description: image.description,
                    thumbnail: photos.thumbnail,
                    url: photos.original,
                });
                
                Joseph.save(function (err, fluffy) {
                    if (err) return console.error(err);
                });
            });
        });
		
	})
    .get(function(req, res) {
		Photo.find(function(err, bears) {
			if (err) return res.send(err);

			res.json(bears);
		});
	});
    
    app.use('/admin', authRoutes);
};