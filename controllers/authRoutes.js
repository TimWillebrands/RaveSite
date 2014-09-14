var express = require('express');
var fs      = require('fs');
var path    = require('path');
var os              = require('os');
var ejs     = require('ejs');
var flickr  = require('../lib/flickrLib');
var Photo   = require('../models/Photo');
var Item   = require('../models/Item');
var Busboy      = require('busboy');

module.exports.controller = function(app) {
    var authRoutes = express.Router();
    
    function getFile(fileName){
        return fs.readFileSync(__dirname + '/../views/' + fileName + '.ejs', 'utf8');
    }
    
    
    authRoutes.get('/', function(req, res) {
        res.render('foundation', { 
            title: 'Admin',
            body: ejs.render(getFile('admin'), {
                items: []
            }),
        });
    });
    
    authRoutes.route('/photo')
    .post(function(req, res) {
        var busboy = new Busboy({ headers: req.headers });
        
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            var saveTo = path.join(os.tmpDir(), filename);
            var writeFile = fs.createWriteStream(saveTo);
            file.pipe(writeFile);
            
    		writeFile.on('finish',function(){
                flickr.uploadImageToFlickr(saveTo,{
                    name : filename,
                    description: "no description",
                },function(image){
                    flickr.getPhotoUrl(image.photo_id,function(photos){
                        var photo = new Photo({
                            name: image.name,
                            description: image.description,
                            thumbnail: photos.thumbnail,
                            url: photos.original,
                            item: req.query.itemId
                        });
                        
                        photo.save(function (err, savedPhoto) {
                            if (err){ res.send("fail"); }  
                            fs.unlinkSync(saveTo);
                            Item.findById(req.query.itemId, function (err, item) {
                                if (err){ res.send("fail"); }  
                                item.photos.push(savedPhoto.id);
                                item.save(function (err, item) {
                                    if (err){ res.send("fail"); }
                                    res.send("succes");
                                    console.log("New Photo: ",savedPhoto.name);
                                });
                            });
                        });
                    });
                },res);
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
	
    authRoutes.route('/item')
    .post(function(req, res) {
        var item = new Item({
            name: "Super item title",
            description: "Super item description",
            thumbnail: "http://www.msgplus.net/Documents/cd0466a1-77cb-4bfb-a130-851d1079de0b/Thumbnail.jpg"
        });
        
        item.save(function (err, savedItem) {
            if (err) return console.error(err);
			res.send("succes");
            console.log("New Item: " + savedItem.id);
        });
	})
    .get(function(req, res) {
		Item.find().sort('index').exec(function(err, items) {
			if (err) return res.send(err);
            var itemIds = [];
            for(var i=0; i<items.length; i++) {
                itemIds.push(items[i]._id);
            }
			res.json(itemIds);
		});
	});
	
	function setIndex(schema, id, index, sort, itemId,photoIds){
		schema.findById(id, function(err, item) {
		    item.index = index;
            item.save(function (err) {
                if (err) return console.error(err);
                if (typeof sort == 'function') { 
                    sort(itemId,photoIds);
                }
            });
		});
	}
	
    authRoutes.route('/item/sort').post(function(req, res) {
		var items = req.body;
		for(var i=0;i<items.length;i++){
            setIndex(Item, items[i].id,items[i].index,i == items.length-1);
        }
	});
	
    /*authRoutes.route('/photo/sort').post(function(req, res) {
		var items = req.body;
		for(var i=0;i<items.length;i++){
            setIndex(Photo, items[i].id,items[i].index);
        }
        Item.find().sort([['index', 'descending']]).all(function (posts) {
          // do something with the array of posts
        });
	});*/
	
    authRoutes.route('/photo/:photo_id')
    .get(function(req, res) {
		Photo.findById(req.params.photo_id, function(err, photo) {
			if (err) {res.send(err)}
			res.json(photo);
		});
	})
    .delete(function(req, res) {
		Photo.findById(req.params.photo_id, function(err, photo) {
			if (err) {res.send(err)}
			Item.findById(photo.item,function(err, item) {
			    if(err) console.log(err);
			    item.photos.splice(item.photos.indexOf(req.params.photo_id),1);
			});
			var photoFlickrId = photo.url.split(/\//g)[4].split(/_/g)[0];
			flickr.deletePhoto(photoFlickrId,function(err, response){
			    if(!err){
			        photo.remove(function (err, product) {
                        if (err) console.error(err);
    			        res.send("succes");
    			        console.info("Deleted photo: ",photoFlickrId);
                    });
			    }else{
			        res.send(err);
			        console.error("photoFlickrId: ",photoFlickrId);
			        console.error(err);
			    }
			});
		});
	});
	
    authRoutes.route('/item/:item_id')
    .post(function(req, res) { // Update item
		Item.findById(req.params.item_id, function(err, item) {
			if (err) {res.send(err)}
			var itemProps = req.body;
			if(itemProps.photos){
			    for(var photoId in itemProps.photos){
			        updatePhoto(photoId, itemProps.photos[photoId]);
			    }
			}
			    
			for(var propt in itemProps){
			    if(propt != "photos")
                    item[propt] = itemProps[propt];
            }
            
            item.save(function (err) {
                if (err) return console.error(err);
                res.json({status: "succes"});
            });
		});
		
		function updatePhoto(photoId, data){
		    Photo.findById(photoId,function(err, photo){
		        for(var propt in data){
		            photo[propt] = data[propt];
		            console.log(propt);
		        }
		        photo.save(function(err){
		            if(err) console.error(err);
		        });
		    });
		}
	})
    .get(function(req, res) { // Get item
		Item.findById(req.params.item_id, function(err, item) {
			if (err) {res.send(err)}
    		res.json(item);
		});
	})
	.put(function(req, res) { //Sort photos of item
		var photos = req.body;
		var photoIds = [];
		
		for(var i=0;i<photos.length;i++){
            photoIds.push(photos[i].id);
            if(i != photos.length-1){ // If last item on list is not set
                setIndex(Photo, photos[i].id,photos[i].index);
            }else{
                setIndex(Photo, photos[i].id,photos[i].index,sortItemList,req.params.item_id,photoIds);
            }
        }
        
        function sortItemList(id,photoIds){ // Called when last photo index is saved
            Item.findById(id, function(err, item){
                var photoCount = item.photos.length;
                var photos = [];
                Photo.find({
                    '_id': { $in: photoIds}
                }).sort('index').exec(function(err, sortedPhotos) {
                    sortedPhotos.forEach(function(sortedPhoto){
                        photos.push(sortedPhoto.id);
                        if(photos.length==photoCount){ // Ugly hack to check if last iteration
                            item.photos = photos;
                            item.save(function(err, savedItem){
                                res.json({status:"succes"});
                                console.log("Item: ",savedItem.id,"sorted");
                            });
                        }
                    });
                });
                
            });
        }
	})
    .delete(function(req, res) { // Delete item
        var itemCheck = false;
        var photoCheck = true;
        
		Item.findById(req.params.item_id, function(err, item) {
			if (!err) {
			    var photos = item.photos;
			    photoCheck = photos.length>0 ? false : true;
    			if(!photoCheck){ 
    			    for(var i = 0; i<photos.length; i++ ){
        			    deletePhoto(photos[i],i==photos.length-1, res);
    			    }
    			}
    			item.remove(function (err, product) {
                    if (err) console.error(err);
    		        console.info("Deleted item: ",req.params.item_id);
    	            itemCheck=true;
    	            reportGraetSucces(res);
                });
			}else{
			    res.send(err);
			    return;
			}
		});
		
        function deletePhoto(photoId,last, res){
            Photo.findById(photoId,function(err, photo){
                if(err) return;
			    var photoFlickrId = photo.url.split(/\//g)[4].split(/_/g)[0];
			    flickr.deletePhoto(photoFlickrId,function(err, response){
    			    console.info("Deleted photo: ",photoFlickrId,"from flickr");
    		        photo.remove(function (err, product) {
                        if (err) console.error(err);
    			        console.info("Deleted photo: ",photoFlickrId,"from database");
    			        if(last){
    			            photoCheck=true;
    			            reportGraetSucces(res);
    			        }
                    });
			    });
            });
		}
		
		function reportGraetSucces(res){
		    if(photoCheck && itemCheck)
		        res.send("succes");
		}
	});
    
    app.use('/admin', authRoutes);
};