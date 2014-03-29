/*
 * POST flasks of post
 */

exports.post = function(req, res) {
    console.log("received: " + req.body.letter);
    res.send(200);
};
