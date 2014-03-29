var Bottle = function (throatWidth, throatHeight, smoothWidth, smoothHeight, bottleWidth, bottleHeight) {
    /*
    the points of the bottle
            x.  .x


            .    .

        .   x    x   .







        .            .
    */

    var Point = function (x, y){
        this.x = x;
        this.y = y;
    }

    var PROXY_THROAT_FACTOR = 0.25,
        DISPLAY_WIDTH = 960,
        DISPLAY_HEIGHT = 480;

    this.canvas = document.querySelector('#test>canvas');
    this.context = canvas.getContext( '2d' );

    this.canvas.width = DISPLAY_WIDTH;
    this.canvas.height = DISPLAY_HEIGHT;

    botLeft = new Point(100, DISPLAY_HEIGHT);
    botRight = new Point(botLeft.x + bottleWidth, DISPLAY_HEIGHT);
    topRight = new Point(botRight.x, botRight.y - bottleHeight);
    proxyRight = new Point(topRight.x - smoothWidth, topRight.y);
    throatMR = new Point(proxyRight.x, proxyRight.y - smoothHeight);
    throatPR = new Point(throatMR.x, throatMR.y - throatHeight);
    throatTPR = new Point(throatPR.x - throatWidth * PROXY_THROAT_FACTOR, throatPR.y);
    throatTPL = new Point(throatPR.x - throatWidth * (1 - PROXY_THROAT_FACTOR), throatTPR.y);
    throatPL = new Point(throatTPL.x - throatWidth * 0.25, throatTPL.y);
    throatML = new Point(throatPL.x, throatPL.y + throatHeight);
    proxyLeft = new Point(throatML.x, throatML.y + smoothHeight);
    throatXL = new Point(proxyLeft.x - smoothWidth, proxyLeft.y);

    var self = this;

    this.draw = function() {
        self.context.clearRect( 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT );

        self.context.save();
        self.context.strokeStyle = 'rgba(255,0,0,1)';
        self.context.fillStyle = 'rgba(255,0,0,1)';
        self.context.lineJoin = 'round';
        self.context.beginPath();
        
        self.context.moveTo( botLeft.x,  botLeft.y  );
        self.context.lineTo( botRight.x, botRight.y );
        self.context.lineTo( topRight.x, topRight.y );
        self.context.quadraticCurveTo( proxyRight.x, proxyRight.y,
                                       throatMR.x, throatMR.y);
        self.context.quadraticCurveTo( throatPR.x, throatPR.y,
                                       throatTPR.x, throatTPR.y );
        self.context.lineTo( throatTPL.x, throatTPL.y );
        self.context.quadraticCurveTo( throatPL.x, throatPL.y,
                                       throatML.x, throatML.y );
        self.context.quadraticCurveTo( proxyLeft.x, proxyLeft.y,
                                       throatXL.x, throatXL.y );
        self.context.lineTo( botLeft.x, botLeft.y );


        //self.context.fill();
        self.context.stroke();
        self.context.restore();
        

        requestAnimFrame(self.draw);
    }

}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();


$(document).ready(function() {
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
        $("#test").toggle("slide");
    });

    var results = [];
    $("#search").on("click", function() {
        var bottle = new Bottle(50, 100, 50, 50, 150 , 250);
                    bottle.draw();
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

    function log(msg) {
        console.log("[bottle] " + msg);
    }
});
