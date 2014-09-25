var express         = require('express');
var fs              = require('fs');
var path            = require('path');
var lessMiddleware  = require("less-middleware");
var ejs             = require('ejs');
var Photo           = require('../models/Photo');
var Item            = require('../models/Item');

var cacheTime = 86400000;

module.exports.controller = function(app) {

    var mainRoutes = express.Router();
    var ajaxRoutes = express.Router();
    
    function getFile(fileName){
        return fs.readFileSync(__dirname + '/../views/' + fileName + '.ejs', 'utf8');
    }
    
    
    //MAIN HTML AND STATIC CONTENT ROUTES

    mainRoutes.get(['/','/home','/rave'], function(req, res) {
        res.render('test', {
            title: 'Tim Willebrands',
            page: 'home',
            item: null
        });
    });
    
    mainRoutes.get('/portfolio', function(req, res) {
        res.render('test', {
            title: 'Portfolio',
            page: 'portfolio',
            item: null
        });
    });
    
    mainRoutes.get('/portfolio/:item_id', function(req, res) {
		Item.findById(req.params.item_id, function(err, item) {
			if (err) {res.send(err)}
            res.render('test', {
                title: 'Ravé - CAD/CAM voor Goudsmeden',
                page: 'portfolio',
                item: JSON.stringify(item)
            });
		});
    });
    
    mainRoutes.get('/contact', function(req, res) {
        res.render('test', {
            title: 'Contact',
            page: 'contact',
            item: null
        });
    });
    
    /*mainRoutes.use(lessMiddleware(path.join(__dirname + "/../less"),{
    	dest: path.join(__dirname + "/../"),
    	preprocess: {
            path: function(pathname, req) {
                return pathname.replace('/public/css', '');
            }
        },
    	// force true recompiles on every request... not the
    	// best for production, but fine in debug while working
    	// through changes
    	force: true
    }));*/
    
    mainRoutes.use(lessMiddleware(path.join(__dirname + "/../public/elements"),{
    	dest: path.join(__dirname + "/../"),
    	preprocess: {
            path: function(pathname, req) {
                //console.log(pathname);
                return pathname.replace('/public/css', '');
            }
        },
    	// force true recompiles on every request... not the
    	// best for production, but fine in debug while working
    	// through changes
    	force: true
    }));
    
    mainRoutes.use('/public',express.static(path.join(__dirname, '/../public')/*, { maxAge: cacheTime }*/));
    mainRoutes.use('/bower',express.static(path.join(__dirname, '/../bower_components'), { maxAge: cacheTime }));
    
    
    //AJAX CONTENT ROUTES
    
    ajaxRoutes.route('/item')
    .post(function(req, res) {
		var tags = req.body;
        for(var i=0; i<tags.length; i++) {
            console.log("Item tags:",tags[i]);
        }
		Item.find().sort('index').exec(function(err, items) {
			if (err) return res.send(err);
            var itemIds = [];
            for(var i=0; i<items.length; i++) {
                itemIds.push(items[i]._id);
            }
			res.json(itemIds);
		});
    });
    
    ajaxRoutes.route('/item/:item_id')
    .get(function(req, res) {
		Item.findById(req.params.item_id, function(err, item) {
			if (err) {res.send(err)}
			res.json(item);
		});
	});
    
    ajaxRoutes.route('/photo/:photo_id')
    .get(function(req, res) {
		Photo.findById(req.params.photo_id, function(err, photo) {
			if (err) {res.send(err)}
			res.json(photo);
		});
	});
    
    app.use('/', mainRoutes);
    app.use('/ajax', ajaxRoutes);
};