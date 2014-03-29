$(document).ready(function() {
    console.log("bottle loaded");
    $("#throw").on("click", function() {
        var letterContents = $("#letter").val();
        console.log("click");
        $.ajax({
            type: 'POST',
            data: letterContents,
            contentType: 'application/json',
            url: "http://localhost",	
            success: function(data) {
                console.log('success!!!!');
                console.log(letterContents);
            }
        });
    });
});
