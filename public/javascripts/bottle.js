$(document).ready(function() {
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
        limit: 10,
        prefetch: {
            url: '/api/tags',
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

    $("#throw").on("click", function() {
        var letterContents = $("#letter").val();

        var data = {
            text: letterContents,
            tags: $("#tags").val().split(" ")
        };

        log("threw the bottle into the sea");
        $.ajax({
            type: 'PUT',
            url: "/api/bottles",	
            data: data,
            dataType: 'json',
            success: function(data) {
                log('success!!!!');
                log(data);
            }
        });
    });

    $("#burn").on("click", function() {
        log("burned the contents of the letter");
        $("#test").toggle("slide", {direction: "right"});
    });

    var results = [];
    $("#search").on("click", function() {
        var tags = { "tags" : tagApi.tagsManager('tags') } ;
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
                            alert(results[id]._source.text);
                        });
                    }
                } else {
                    alert("no search results");
                }
            }
        });
    });

    // naive line check, to prevent users from exceeding length of letter with
    // newlines
    // doesn't really work that well
    var maxLines = 40;
    $("#letter").keydown(function(event) {
        var newLines = $(this).val().split("\n").length;

        // if(event.keyCode == 13) {
        //     playSound(1);
        // } else {
        //     playSound(0);
        // }
    });

    function log(msg) {
        console.log("[bottle] " + msg);
    }
});
