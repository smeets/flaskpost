$(document).ready(function() {
    // resize the text area automagically
    $("#letter-desktop").autosize({callback: function(){
        $(window).resize();
    }});
    
    if (window.location.pathname === "/read") {
        var bottleMsg = $.totalStorage("bottleMsg");
        if (bottleMsg) {
            $("#hidden-until-bottle").toggle(0, function(){
                $(window).resize();
            });
        // if bottle in localStorage, load that instead of search bar
            setFoundText(bottleMsg);
        } else {
            $("#hidden-when-bottle").toggle();
        }
    } else {
        //gg
    }

    // TAG MANAGER, only load if we have a search bar
    if($("#search-bar").length !== 0) {
        var tagApi = $("#search-bar").tagsManager({
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
            console.log("pushing " + d.name);
            tagApi.tagsManager("pushTag", d.name);
            //$('.typeahead').typeahead('val', "");
        });
    };
    

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
        var vals = $("#search-bar").val();
        var listRef = tagApi.tagsManager('tags');
        var tagArr = listRef.slice(0);
    
        if (vals.length > 0 && tagArr.length === 0) {
            tagArr.push(vals);
        }
       
        for(var i=0; i < tagArr.length; i++) {
            tagArr[i] = tagArr[i].replace(/#/, '');
        }

        var data = {
            text: letterContents,
            tags: tagArr
        };

        var bottleId = $.totalStorage("bottleId");
        if (bottleId) {
            // preserve stuff
            data.index = bottleId;
            data.tags = $.totalStorage("bottleTags");
        }

        // note: don't cleanse until you've preserved stuff in e.g. data.index
        cleanseLocalStorage();

        log("threw the bottle into the sea");
        $.growl({title: "", message: "threw the bottle into the sea!" });
        $.ajax({
            type: 'PUT',
            url: "/api/bottles",	
            data: data,
            dataType: 'json',
            success: function(data){
                window.location.replace(window.location.pathname);
            } 
        });
    });

    $("#letter-desktop").on("keyup", function() {
        var contents = $("#letter-desktop").val();
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

    var burnMsgs = ["never to be seen again q.q", "to a crisp", "its okay it doesnt hold anything against you",
                    "*poof*", "*crackle* *crackle* *pop*", "Letter-B-Gone-o-tron activated!",
                    "burnnn", "the flame of poetry is quite warming, no?"];
    $("#burn").on("click", function() {
        log("burned the contents of the letter");
        $.growl({title: "Letter BURNT", message: burnMsgs[Math.floor(Math.random() * burnMsgs.length)]});

        // if /read (and we're burning the letter)
        if (window.location.pathname === "/read") {
            var bottleMsg = $.totalStorage("bottleMsg");
            if (bottleMsg != null) {
                // do some cleaning :3
                cleanseLocalStorage();
            }
        }

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
                            window.location.replace(window.location.pathname);
                        }
                    });
                } else {
                    window.location.replace(window.location.pathname);
                }
            }
        }
        setTimeout(makeFlames, 50);

    });

    
    $("#search").on("click", function() {
        var vals = $("#search-bar").val();
        var listRef = tagApi.tagsManager('tags');
        var tagArr = listRef.slice(0);

        if (vals.length > 0) {
            tagArr.push(vals);
        }

        log("wawawaw");
        log(tagApi.tagsManager('tags'));
       
        for(var i=0; i < tagArr.length; i++) {
            tagArr[i] = tagArr[i].replace(/#/, '');
        }

        log("adadadadad");
        log(tagApi.tagsManager('tags'));

        $.ajax({
            type: 'GET',
            url: "/api/bottles",    
            data: {"tags" : tagArr},
            dataType: 'json',
            success: function(data) {
                results = data;
                if (data.id) {
                    $("#notice").hide();
                    $.totalStorage("bottleMsg", data.text);
                    $.totalStorage("bottleId", data.id);
                    $.totalStorage("bottleTags", data.tags);

                    setFoundText(data.text);
                    $("#hidden-until-bottle").slideToggle(function(){
                        $(window).resize();
                    });
                    $("#hidden-when-bottle").slideToggle();
                } else {
                    $.growl({ title: "error", message: "no bottles sighted! try a different search" });
                }
            }
        });
    });

    function setFoundText(text) {
        $("#found").text(text);
        $("#found-mobile").text(text)
        var tags = "" + $.totalStorage("bottleTags");
        $("#found-tags").text("tags: " + tags.replace(/,/g , ", "));
    }

    function cleanseLocalStorage() {
        // delete from local storage
        $.totalStorage.deleteItem("bottleMsg");
        $.totalStorage.deleteItem("bottleId");
        $.totalStorage.deleteItem("bottleTags");
    }

    function log(msg) {
        console.log("[bottle] " + msg);
    }
});
