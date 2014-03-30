$(document).ready(function() {
    var ns = 20; //The number of sounds to preload. This depends on how often the sounds need to be played, but if too big it will probably cause long loading times.
    var sounds = []; //This will be a matrix of all the sounds
    var sources = [];
    sources.push("/sounds/keypress-shorter.ogg");    
    sources.push("/sounds/ding-shorter.ogg");    
    
    //We need to have ns different copies of each sound, hence:
    // for (i = 0; i < ns; i ++) 
    //     sounds.push([]);

    // for (i = 0; i < sources.length; i++) {
    //     for (j = 0; j < ns ; j++) {
    //         sounds[j].push(new Audio(sources[i]));
    //     }
    // }
    
    var playing = [];
    playing[0] = 0;
    playing[1] = 0;


    // vol is a real number in the [0, 1] interval
    var playSound = function(id, vol) {
        if (vol <= 1 && vol >= 0)
            sounds[playing[id]][id].volume = vol;
        else
            sounds[playing[id]][id].volume = 1;

        sounds[playing[id]][id].play();
        ++playing[id]; //Each time a sound is played, increment this so the next time that sound needs to be played, we play a different version of it,

        if (playing[id] >= ns)
            playing[id] = 0;
    }

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
        $("#burn").toggle("slide", {direction: "right"});
    });

    var results = [];
    $("#search").on("click", function() {
        var tags = { "tags" : $("#search-bar").val().split(" ") } ;
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


    $("#letter").keydown(function(event) {
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
