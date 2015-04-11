
/**
 * Module dependencies.
 */
var express       = require('express');
var http          = require('http');
var path          = require('path');
var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var routes        = require('./routes');
var user          = require('./routes/user');
var mongoose      = require('mongoose');
//var flash         = require('connect-flash');

var configDB      = require('./config/database.js');

mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(express.logger('dev')); // log every request to the console
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());  // read cookies (needed for auth)
app.use(express.bodyParser()); // get information from html forms
app.use(express.methodOverride());
app.use(express.session({ secret: 'securedsession' }));
app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());  
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
//routes
// =====================
require('./routing')(app, passport); 

// Start server
// =====================
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// SOCKETS
//===================== 
var io = require('socket.io').listen( server , { log: false });

// All sockets logic in file socketroute.js
require('./routes/socketroute.js')(io);



