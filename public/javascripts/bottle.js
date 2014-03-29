$(document).ready(function() {
    log("bottle loaded");
    $("#throw").on("click", function() {
        var letterContents = {letter: $("#letter").val()};
        log("threw the bottle into the sea");
        $.ajax({
            type: 'POST',
            url: "/",	
            data: letterContents,
            dataType: 'json',
            success: function(data) {
                log('success!!!!');
                log(data);
            }
        });
    });

    $("#burn").on("click", function() {
        log("burned the contents of the letter");
    });

    function log(msg) {
        console.log("[bottle] " + msg);
    }
});
