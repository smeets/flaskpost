
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var api = require('./routes/api');

var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(require('less-middleware')(path.join(__dirname, 'public') ));
app.use(express.favicon());

app.use(express.logger('dev'));
app.use(express.json());

app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon(path.join(__dirname, "public/bottle.ico")));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/api', api.index);
app.get('/api/bottles', api.search);
app.put('/api/bottles', api.update);

app.get("/", routes.index);
app.get('/write', routes.write);
app.get('/read', routes.read);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
