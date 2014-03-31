// Public API

var elasticsearch = require('elasticsearch');
var Model = require('../model.js');

var esClient = new elasticsearch.Client({
    host: '192.168.1.146:9200', // TODO: alter to proper host url
    log: 'trace'
});

var redis = require("redis"),
    redisClient = redis.createClient(6379, "192.168.1.146");

var es_index = "flaskpost",
    es_type = "bottle";

exports.index = function (req, res){
    esClient.info(function (err, response, status) {
        res.send(response);
    });
};

// Cache keys, set to false when new key added & key was deleted
var hasChanged = true;
var cachedTagList = [];

exports.tags = function (req, res) {
    if (hasChanged) {
        redisClient.keys("*", function (err, reply) {
            cachedTagList = reply;
            hasChanged = false;
            res.json(reply);
        });
    } else {
        res.json(cachedTagList);
    }
}

exports.update = function(req, res){
    var model = new Model(req.body.text, req.body.tags);

    res.json({resp : "wawaw"});
    
    if (req.body.tags) {
        for (var i = 0, l = req.body.tags.length; i < l; i++) {
            redisClient.incr(req.body.tags[i], function (err, rep){
                if (rep === 1) {
                    hasChanged = true;
                }
            });
        }
    }

    if (req.body.index) {
        esClient.index({
            index: es_index,
            type: es_type,
            id: req.body.index,
            body: model,
            omit_norms: true
        }, function (error, response) {});
    } else {
        esClient.index({
            index: es_index,
            type: es_type,
            body: model,
            omit_norms: true
        }, function (error, response) {
            if (error) console.trace(error);
            esClient.indices.refresh( function (err, resp, status){
                if (error) console.trace(error);
            });
        });
    }
}

function decrementTag(tag) {
    redisClient.decr(tag, function (err, reply) {
        if (reply === 0) {
            redisClient.del(tag, function (error, response) {
                hasChanged = true;
            });
        }
    });
}

exports.delete = function(req, res){
    var index = req.body.index;
    if (index) {
        esClient.get({
            index: es_index,
            type: es_type,
            id: index
        }, function (error, response) {
            if (error) {
                console.trace(error);
            } else {
                esClient.delete({
                    index: es_index,
                    type: es_type,
                    id: index
                }, function (err, resp) {
                    res.json({status: "200", response: "all goody here"});
                });
                var tags = response._source.tags;
                for (var i = 0, l = tags.length; i < l; i++) {
                    decrementTag(tags[i]);
                }
            }
        });
    } else {
        res.json({status: "400", response: "no index provided"});
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

    esClient.search({
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

                esClient.index({
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
