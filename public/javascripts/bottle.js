$(document).ready(function() {
    // resize the text area automagically
    $("#letter-desktop").autosize();

    // TAG MANAGER
    var tagApi = jQuery("#search-bar").tagsManager({
        maxTags: 3,
        tagsContainer: $("#tag-list"),
        delimiters: [32, 13, 44] // space, enter, comma
    });

    // The tokenizer/shingle/fuzzinator engine that give suggestions
    var tags = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        limit: 3,
        // 600000
        prefetch: {
            url: '/api/tags',
            ttl: 1,
            filter: function(list) {
                return $.map(list, function(tag) { return { name: tag }; });
            }
        }
    });

    // prefetch
    tags.initialize();
  
    // Initialize the typeahead plugin
    typeApi = $('#search-bar').typeahead({
        minLength: 1,
        highlight: true,
    }, {
      name: 'tag',
      displayKey: 'name',
      source: tags.ttAdapter()
    }).on('typeahead:selected', function (e, d) {
        console.log(d);
        tagApi.tagsManager("pushTag", d.name);
        $('.typeahead').typeahead('val', "");
    });

    log("bottle loaded");
    var results;

    $("#throw").on("click", function() {
        var letterContents = $("#letter").val();
        // if we're reading and appending to an old letter
        if ($("#found").text().length > 0) {
            // append comments
            letterContents = $("#found").text() + "\n\n" + letterContents;
        }

        // delete from local storage
        $.totalStorage.deleteItem("bottleMsg");
        $.totalStorage.deleteItem("bottleId");

        $("#throw").prop("disabled", true);
        var vals = $("#search-bar").val();
        var tagArr = tagApi.tagsManager('tags');
        
        if (!(tagArr instanceof Array)) {
            tagArr = [];
        }

        if (vals.length > 0) {
            tagArr.push(vals);
        }
       
        for(var i=0; i < tagArr.length; i++) {
            tagArr[i] = tagArr[i].replace(/#/, '');
        }
        var data = {
            text: letterContents,
            tags: tagArr
        };

        if (results) {
            // preserve stuff
            data.index = results.id;
            data.tags = results.tags;
        }

        log("threw the bottle into the sea");
        $.growl({title: "", message: "threw the bottle into the sea!" });
        $.ajax({
            type: 'PUT',
            url: "/api/bottles",	
            data: data,
            dataType: 'json',
            success: function(data){
                window.location = "/"
            } 
        });
    });

    $("#letter-desktop").on("keyup", function() {
        var contents = $("#letter-desktop").val();
        log(contents);
        $("#letter").val(contents);
    });

    $("#letter").on("keydown", function() {
        var contents = $("#letter").val();
        $("#letter-desktop").val(contents);
    });

    function makeDiv(posx, posy){
        $newdiv = $('<img>').attr("src", "/img/flame.gif");

        var posx = ($(document).width() / 2 + ((Math.random() - 0.5) * ($(document).width() / 2 ))).toFixed();
        var posy = ($(document).height() / 2 + ((Math.random() - 0.5) * ($(document).height() / 2 ))).toFixed();

        $newdiv.css({
            'position':'absolute',
            'left': posx + 'px',
            'top': posy + 'px',
            'display': 'none'
        }).appendTo( 'body' ).fadeIn(100);
    };

    $("#burn").on("click", function() {
        log("burned the contents of the letter");
        $.growl({title: "Letter BURNT", message: "never to be seen again q.q"});
        // delete from local storage
        $.totalStorage.deleteItem("bottleMsg");
        $.totalStorage.deleteItem("bottleId");

        var flames = [];
        function makeFlames(){
            makeDiv();
            flames.push($newdiv);
            if (flames.length < 13) {
                setTimeout(makeFlames, 50);
            } else {
                if (results) {
                    $.ajax({
                        type: 'DELETE',
                        url: "/api/bottles",    
                        data: {index: results.id},
                        dataType: 'json',
                        success: function(data) {
                            window.location = "/";
                        }
                    });
                } else {
                    window.location = "/";
                }
            }
        }
        setTimeout(makeFlames, 50);

    });

    
    $("#search").on("click", function() {
        var vals = $("#search-bar").val();
        var tagArr = tagApi.tagsManager('tags');
        
        if (!(tagArr instanceof Array)) {
            tagArr = [];
        }

        if (vals.length > 0) {
            tagArr.push(vals);
        }
       
        for(var i=0; i < tagArr.length; i++) {
            tagArr[i] = tagArr[i].replace(/#/, '');
        }

        $.ajax({
            type: 'GET',
            url: "/api/bottles",    
            data: {"tags" : tagArr},
            dataType: 'json',
            success: function(data) {
                results = data;
                console.log(data);
                if (data.id) {
                    $("#notice").hide();
                    // CHECK TO SEE IF THIS WORKS; WELL WHEN SMEETS HAS WOKEN
                    // UP ANYWAY
                    $.totalStorage("bottleMsg", data.text);
                    $.totalStorage("bottleId", data.id);
                    ////////////////////////////////
                    $("#found").text(data.text);
                    $("#hidden-until-bottle").slideToggle();
                    $("#hidden-when-bottle").slideToggle();
                } else {
                    $.growl({ title: "error", message: "no bottles sighted! try a different search" });
                }
            }
        });
    });

    function log(msg) {
        console.log("[bottle] " + msg);
    }
});
