
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'flaskpost' });
};

exports.write = function(req, res){
  res.render('bottle', { title: 'flaskpost' });
};

exports.read = function(req, res){
  res.render('read', { title: 'flaskpost' });
};

