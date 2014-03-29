
// title = title (string), tags = array of string tags
var Model = function(title, tags){
    this.body = {
        title: title
        tags: tags,
        published: true,
    }
}

exports.Model = Model;