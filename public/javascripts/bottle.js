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
    var results;

    $("#throw").on("click", function() {
        var letterContents = $("#letter").val();
        // if we're reading and appending to an old letter
        if ($("#found").text().length > 0) {
            // append comments
            letterContents = $("#found").text() + "\n\n" + letterContents;
        }

        $("#throw").prop("disabled", true);

        var tagArr = tagApi.tagsManager('tags');
        for(var i=0; i < tagArr.length; i++) {
             tagArr[i] = tagArr[i].replace(/#/g, '');
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

    $("#burn").on("click", function() {
        log("burned the contents of the letter");
        $("#burn").toggle("slide", {direction: "right"});
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
                    var btn = $("<button>");

                    btn.text("click me");
                    $("#results").append(btn);

                    btn.on("click", function (){
                        console.log(results);
                        $("#found").text(data.text);
                        $("#hidden-until-bottle").slideToggle();
                        $("#hidden-when-bottle").slideToggle();
                    });
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
