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
    console.log("hejj");
    console.log(req.body);

    var model = new Model(req.body.title, req.body.tags);
    console.log(model);

    // client.index({
    //     index: es_index,
    //     type: es_type,
    //     body: {
    //         title: 'Test 1',
    //         tags: ['y', 'z'],
    //         published: true,
    //     }
    // }, function (error, response, status) {

    // });
}
exports.search = function(req, res){
    // GET request (query)

    res.json({"query tags": req.query.tags});
    
}