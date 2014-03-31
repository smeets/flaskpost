// Public API

var elasticsearch = require('elasticsearch');
var Model = require('../model.js');

var client = new elasticsearch.Client({
    host: '192.168.1.146:9200', // TODO: alter to proper host url
    log: 'trace'
});

var globalTagListChecker = {};
var globalTagList = [];

var es_index = "flaskpost",
    es_type = "bottle";

exports.index = function (req, res){
    client.info(function (err, response, status) {
        res.send(response);
    });
};

exports.tags = function (req, res) {
    console.log(globalTagList);
    res.json(globalTagList);
}

exports.update = function(req, res){
    var model = new Model(req.body.text, req.body.tags);

    res.json({resp : "wawaw"});
    
    if (req.body.tags) {
        for (var i = 0; i < req.body.tags.length; i++) {
            var tag = req.body.tags[i];
            if (!globalTagListChecker.hasOwnProperty(tag)) {
                globalTagList.push(tag);
                globalTagListChecker[tag] = globalTagList.length;
                console.log("adding tag: " + tag);
            }
        }
    }

    if (req.body.index) {
        client.index({
            index: es_index,
            type: es_type,
            id: req.body.index,
            body: model,
            omit_norms: true
        }, function (error, response) {
            // log error
        });
    } else {
        client.index({
            index: es_index,
            type: es_type,
            body: model,
            omit_norms: true
        }, function (error, response) {
            // log error
            client.indices.refresh( function (err, resp, status){
                // log error
            });
        });
    }
}

exports.search = function(req, res){
    // GET request (query)
    var tagList = req.query.tags;
    if (!tagList){
        tagList = [];
        tagList.push("_all");
    } else {
        if (!(tagList instanceof Array)) {
            tagList = [];
            tagList.push(req.query.tags);
        }
    }

    client.search({
        index: es_index,
        type: es_type,
        size: 1,
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
            res.json(500, {resp : "no beef"});
        } else {
            if (response.hits.total > 0) {
                var safeObject = {
                    id: response.hits.hits[0]._id,
                    text: response.hits.hits[0]._source.text,
                    tags: response.hits.hits[0]._source.tags
                };
                
                // Put it back, just editing the published value
                var model = new Model(safeObject.text, safeObject.tags);
                model.published = false;

                client.index({
                    index: es_index,
                    type: es_type,
                    id: safeObject.id,
                    body: model,
                    omit_norms: true
                }, function (error, response) {});
                
                res.json(safeObject);
            } else {
                res.send({resp : "no beef"});
            }
        }    
    });
}
