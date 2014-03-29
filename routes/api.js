// Public API

var elasticsearch = require('elasticsearch');
var Model = require('../model.js');

var client = new elasticsearch.Client({
  host: '192.168.1.146:9200',
  log: 'trace'
});

var es_index = "flaskpost",
    es_type = "bottle";

exports.index = function (req, res){
    client.info(function (err, response, status) {
        res.send(response);
    });
};

exports.update = function(req, res){
    var model = new Model(req.body.title, req.body.tags);

    client.index({
        index: es_index,
        type: es_type,
        body: model
    }, function (error, response) {
        client.indices.refresh( function (error, response, status){
            console.log("refreshed : ", response);
        });
        console.log(response);
        res.send(200);
    });
}
exports.search = function(req, res){
    // GET request (query)

    if (!req.query.tags){
        client.search({
            index: es_index,
            type: es_type,
            q: ''
        }, function (error, response) {
            console.log("did default query");
            res.json(response);
        });
    } else {
        client.search({
            index: es_index,
            type: es_type,
            body: {
                query: {
                    
                        
                            "terms": {
                                tags: req.query.tags
                            }
                        
                    
                }
            }
            
        }, function (error, response) {
            console.log("did tag query");
            res.json(response);
        });
    }
}