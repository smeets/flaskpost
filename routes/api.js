// Public API

var elasticsearch = require('elasticsearch');
var Model = require('../model.js');
var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: '/var/log/flaskpost.log'})
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: '/var/log/flaskpost_exceptions.log' })
    ]
});

var esClient = new elasticsearch.Client({
    host: 'localhost:9200', // TODO: alter to proper host url
    log: {
        type: 'file',
        level: 'trace',
        path: '/var/log/elasticsearch_flaskpost.log'
    }
});

var redis = require("redis"),
    redisClient = redis.createClient(6379, "localhost");

var es_index = "flaskpost",
    es_type = "bottle";

exports.index = function (req, res){
    logger.info("/api requested");
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
   logger.info(" GET /tags ", { tags : cachedTagList });
}

exports.update = function(req, res){
    var model = new Model(req.body.text, req.body.tags);
    logger.info(" PUT /api/bottles", { index: req.body.index });

    res.json({resp : "wawaw"});
    
    if (req.body.tags) {
        if (! req.body.index) {
            // Only add tags if message was created (no provided index)
            for (var i = 0, l = req.body.tags.length; i < l; i++) {
                redisClient.incr(req.body.tags[i], function (err, rep){
                    if (rep === 1) {
                        hasChanged = true;
                    }
                });
            }
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
                logger.info("deleted tag '" + tag + "'");
                hasChanged = true;
            });
        }
    });
}

exports.delete = function(req, res){
    var index = req.body.index;
    logger.info("DELETE /api/bottles", { id: index });
    if (index) {
        esClient.get({
            index: es_index,
            type: es_type,
            id: index
        }, function (error, response) {
            if (error) {
                //console.trace(error);
                logger.warn("DELETE /api/bottles - error", { id: index, response: response });
            } else {
                esClient.delete({
                    index: es_index,
                    type: es_type,
                    id: index
                }, function (err, resp) {
                    logger.info("DELETE /api/bottles ok", { id: index });
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

function markDocumentTaken(safeObject){
    var model = new Model(safeObject.text, safeObject.tags);
    model.published = false;

    esClient.index({
        index: es_index,
        type: es_type,
        id: safeObject.id,
        body: model,
        omit_norms: true
    }, function (error, response) {});
}

function searchCallback(error, response, res) {
    if (error) {
        logger.warn("GET /api/bottles", { error: error });
        res.json(500, {resp : "server error"});
    } else {
        logger.info("GET /api/bottles - results", { hits: response.hits.total });
        if (response.hits.total > 0) {
            var safeObject = {
                id: response.hits.hits[0]._id,
                text: response.hits.hits[0]._source.text,
                tags: response.hits.hits[0]._source.tags
            };
            
            // Put it back, just editing the published value
            markDocumentTaken(safeObject);
            
            res.json(safeObject);
        } else {
            res.send({resp : "no beef"});
        }
    }    
}

exports.search = function(req, res){
    // GET request (query)
    var tagList = req.query.tags;
    var query = {};
    
    if (tagList) {
        if (!(tagList instanceof Array)) {
            tagList = [];
            tagList.push(req.query.tags);
        }
        query = {
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
        };
    } else {
        query = {
            query: {
                function_score: { 
                    query : { match_all: {} },
                    // boost_mode: "replace", not sure what this does, maybe
                    // uncomment if it doesn't work? :D
                    random_score: {},
                }
            }
        };
    }
    logger.info("GET /api/bottles", { query: query });
    esClient.search({
        index: es_index,
        type: es_type,
        size: 1,
        body: query
    }, function (error, response) {
        searchCallback(error, response, res);
    });
}
