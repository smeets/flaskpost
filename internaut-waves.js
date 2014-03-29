/*
 * POST flasks of post
 */

exports.post = function(req, res) {
    console.log("received: " + req.body.letter);
    res.redirect("/");
    res.send(200);
};
