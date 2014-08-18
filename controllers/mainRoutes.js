var express         = require('express');
var fs              = require('fs');
var path            = require('path');
var lessMiddleware  = require("less-middleware");
var ejs             = require('ejs');

var cacheTime = 86400000;

module.exports.controller = function(app) {

    var mainRoutes = express.Router();
    
    function getFile(fileName){
        return fs.readFileSync(__dirname + '/../views/' + fileName + '.ejs', 'utf8');
    }

    mainRoutes.get(['/','/home'], function(req, res) {
        res.render('foundation', { 
            body: ejs.render(getFile('index'), {
                title: 'Home',
            }),
        });
    });
    
    mainRoutes.get('/werk', function(req, res) {
        res.render('foundation', { 
            body: ejs.render(getFile('index'), {
                title: 'Werk',
            }),
        });
    });
    
    mainRoutes.use(lessMiddleware(path.join(__dirname + "/../less"),{
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
    }));
    
    mainRoutes.use('/public',express.static(path.join(__dirname, '/../public')/*, { maxAge: cacheTime }*/));
    mainRoutes.use('/bower',express.static(path.join(__dirname, '/../bower_components'), { maxAge: cacheTime }));
    
    app.use('/', mainRoutes);
};