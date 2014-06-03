// server.js

// BASE SETUP
// ==============================================

var express         = require('express');
var ejs             = require('ejs');
var app             = express();
var port            = process.env.PORT || 8080;
var fs              = require('fs');
var path            = require('path');
var lessMiddleware  = require("less-middleware");
var compress        = require('compression');

var cacheTime = 86400000;

app.use(compress());
app.set('view engine', 'ejs');

// STUFF
// ==============================================

function getFile(fileName){
    return fs.readFileSync(__dirname + '/views/' + fileName + '.ejs', 'utf8');
}


app.get('/', function(req, res) {
    res.render('foundation', { 
        body: ejs.render(getFile('index'), {
            title: 'Sample Text',
        }),
    });
});

app.use(lessMiddleware(path.join(__dirname, 'less'), {
    dest: __dirname,
    force: true,
    preprocess: {
        path: function(pathname, req) {
            return pathname.replace('/public/css', '');
        }
    }
}));

app.use('/public',express.static(path.join(__dirname, 'public')/*, { maxAge: cacheTime }*/));
app.use('/bower',express.static(path.join(__dirname, 'bower_components'), { maxAge: cacheTime }));

// START THE SERVER
// ==============================================
app.listen(port);
console.log('magic happening at: ' + port);