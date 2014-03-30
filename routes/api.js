// Public API

var elasticsearch = require('elasticsearch');
var Model = require('../model.js');

var client = new elasticsearch.Client({
  host: '192.168.1.146:9200',
  log: 'trace'
});

var globalTagListChecker = {};
var globalTagList = [
    "tag1", "tag2", "tag3"
];

var es_index = "flaskpost",
    es_type = "bottle";

exports.index = function (req, res){
    client.info(function (err, response, status) {
        res.send(response);
    });
};

exports.tags = function (req, res) {
    res.json(globalTagList);
    console.log("sending tags");
}

exports.update = function(req, res){
    var model = new Model(req.body.text, req.body.tags);

    for (var tag in req.body.tags) {
        if (!globalTagListChecker.hasOwnProperty()) {
            globalTagList.push(tag);
            globalTagListChecker[tag] = globalTagList.length;
        }
    }

    client.index({
        index: es_index,
        type: es_type,
        body: model,
        omit_norms: true
    }, function (error, response) {
        client.indices.refresh( function (error, response, status){
            res.send(200);
        });
    });
}

exports.search = function(req, res){
    // GET request (query)
    if (!req.query.tags){
        res.send("no tags entered, use ?tags=tag1&tags=tag2...&tags=tagN");
    } else {
        var tagList = req.query.tags;
        if (!(tagList instanceof Array)) {
            tagList = [];
            tagList.push(req.query.tags);
        }

        client.search({
            index: es_index,
            type: es_type,
            body: {
                query: {
                    filtered: {
                        query: {
                            terms: { tags: tagList }
                        },
                        filter: {
                            term: { published: true }
                        }
                    }
                }
            }
        }, function (error, response) {
            if (error) {
                res.send("we got error");
            } else {
                res.json(response.hits.hits);
            }    
        });
    }
}