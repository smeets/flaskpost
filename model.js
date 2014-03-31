// text = letter, tags = array of string tags
var Model = function(text, tags){
    this.text = text;
    if (tags) {
        this.tags = tags;
    } else {
        this.tags = [];
    }
    this.published = true;
}

module.exports = exports = Model;