// BASE SETUP & CONSTANTS
// ==============================================

var express         = require('express');
var app             = express();
var port            = process.env.PORT || 8080;
var mongoose        = require('mongoose');
var fs              = require('fs');
var compress        = require('compression');
var bodyParser      = require('body-parser');

app.use(compress());
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// HOOKING UP
// ==============================================

mongoose.connect('mongodb://herr:ericsson@ds053139.mongolab.com:53139/gubelsdb');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    fs.readdirSync('./controllers').forEach(function (file) {
        if(file.substr(-3) == '.js') {
            var route = require('./controllers/' + file);
            route.controller(app);
        }
    });
    
    // START THE SERVER
    // ==============================================
    app.listen(port);
    console.log('magic happening at: ' +process.env.IP+':'+ port);
});


