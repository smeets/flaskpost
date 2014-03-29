// Public API

var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: '192.168.1.146:9200',
  log: 'trace'
});

exports.index = function(req, res){
    client.search({
        q: ''
    }).then(function (body) {
        res.json(body);
    }, function (error) {
        console.trace(error.message);
    });
};