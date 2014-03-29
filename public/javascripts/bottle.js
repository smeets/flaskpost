$(document).ready(function() {
    log("bottle loaded");
    $("#throw").on("click", function() {
        var letterContents = $("#letter").val();
        $.ajax({
            type: 'POST',
            data: letterContents,
            contentType: 'application/json',
            url: "http://localhost",	
            success: function(data) {
                log('success!!!!');
                log(letterContents);
            }
        });
    });

    function log(msg) {
        console.log("[bottle] " + msg);
    }
});
