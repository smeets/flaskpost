$(document).ready(function() {
    // resize the text area automagically
    $("#letter-desktop").autosize();

    // TAG MANAGER
    var tagApi = jQuery("#search-bar").tagsManager({
        maxTags: 3,
        tagsContainer: $("#tag-list"),
        delimiters: [32, 9, 13, 44] // space, tab, enter, comma
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
    var results = [];

    $("#throw").on("click", function() {
        var letterContents = $("#letter").val();
        // if we're reading and appending to an old letter
        if ($("#found").text().length > 0) {
            // append comments
            letterContents = $("#found").text() + "\n\n" + letterContents;
        }

        var data = {
            text: letterContents,
            tags: tagApi.tagsManager('tags'),
            index: $("#found").attr("result-id")
        };

        log("threw the bottle into the sea");
        $.ajax({
            type: 'PUT',
            url: "/api/bottles",	
            data: data,
            dataType: 'json',
            success: window.location = "/", 
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

    $("#burn").on("click", function() {
        log("burned the contents of the letter");
        $("#burn").toggle("slide", {direction: "right"});
    });

    
    $("#search").on("click", function() {
        var tags = { "tags" : tagApi.tagsManager('tags') } ;
        var vals = $("#search-bar").val();

        if (!(tags.tags instanceof Array))
            tags = [];

        if (vals.length > 0) {
            console.log(vals);
            tags.tags.push(vals);
        }

        $.ajax({
            type: 'GET',
            url: "/api/bottles",    
            data: tags,
            dataType: 'json',
            success: function(data) {
                results = data;
                if (data.length > 0) {
                    // we got some hits
                    for (var i = 0; i < data.length; i++) {
                        var btn = $("<button>");

                        btn.text(i).attr("id", i);
                        $("#results").append(btn);

                        btn.on("click", function (){
                            var id = $(this).attr('id');
                            console.log(results[id]);
                            $("#found").text(results[id]._source.text);
                            $("#found").attr("result-id", results[id]._id);
                            $("#hidden-until-bottle").slideToggle();
                            $("#hidden-when-bottle").slideToggle();
                        });
                    }
                } else {
                    $("#notice").css("opacity", "100").css("visibility", "visible").hide().fadeIn("fast");
                }
            }
        });
    });

    function log(msg) {
        console.log("[bottle] " + msg);
    }
});
