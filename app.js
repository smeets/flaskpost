
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
app.set('port', '8000');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(require('less-middleware')(path.join(__dirname, 'public') ));

app.use(express.logger('dev'));
app.use(express.json());

app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon(path.join(__dirname, "public/bottle.ico")));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/api', api.index);
app.get('/api/bottles', api.search);
app.put('/api/bottles', api.update);
app.get('/api/tags', api.tags);
app.delete('/api/bottles', api.delete);
app.post('/xmlrpc.php', function (req, res){
    console.log(req);
    res.send(404);
});
app.get("/", routes.index);
app.get("/about", function(req, res) {
    res.render('about', { title: 'flaskpost' })
});
app.get('/write', routes.write);
app.get('/read', routes.read);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
