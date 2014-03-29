$(document).ready(function() {
    log("bottle loaded");
    $("#throw").on("click", function() {
        var letterContents = $("#letter").val();

        var data = {
            letter: letterContents,
            title: "hejsan",
            tags: ["log", "message", "t1"]
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
        $("#test").toggle("slide");
    });

    $("#search").on("click", function() {
        log("searched for a bottle");
    });

    function log(msg) {
        console.log("[bottle] " + msg);
    }
});
