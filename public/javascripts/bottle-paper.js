var values = {
    amount: 15,
    mass: 2,
    count: 0
};

values.invMass = 1 / values.mass;

var path, springs;
var freqs, amps;
var factor = 1;
var size = view.size * [1.2, 1];

var Spring = function(a, b, strength, restLength) {
    this.a = a;
    this.b = b;
    this.restLength = restLength || 80;
    this.strength = strength ? strength : 0.55;
    this.mamb = values.invMass * values.invMass;
};

Spring.prototype.update = function() {
    var delta = this.b - this.a;
    var dist = delta.length;
    var normDistStrength = (dist - this.restLength) /
            (dist * this.mamb) * this.strength;
    delta.y *= normDistStrength * values.invMass * 0.2;
    if (!this.a.fixed)
        this.a.y += delta.y;
    if (!this.b.fixed)
        this.b.y -= delta.y;
};

function createPath(strength) {
    var path = new Path({
        fillColor: {
            gradient: {
                stops: [new Color(0.2, 0.2, 0.6), new Color(0.15, 0.15, 0.4), new Color(0.0, 0.0, 0.2)]
            },
            origin: view.center,
            destination: view.center + size * [0, 0.5]
        }
    });
    springs = [];
    for (var i = 0; i <= values.amount; i++) {
        var segment = path.add(new Point(i / values.amount, 0.5) * size);
        var point = segment.point;
        if (i == 0 || i == values.amount)
            point.y += size.height;
        point.px = point.x;
        point.py = point.y;
        // The first two and last two points are fixed:
        point.fixed = i < 2 || i > values.amount - 2;
        if (i > 0) {
            var spring = new Spring(segment.previous.point, point, strength);
            springs.push(spring);
        }
    }
    path.position.x -= size.width / 4;
    return path;
}

function onResize() {
    if (path)
        path.remove();
    
    size = view.bounds.size * [2, 1];
    factor = size.width / 1200;

    path = createPath(0.1);
}

var canvas = $("#canvas1");
freqs = [],
amps = [];
for (var i = 0; i <= values.amount; i++) {
    freqs[i] = Math.random() * 1.5 + 0.66;
    amps[i] = Math.random() * 7 + 3; 
}

$(window).resize(resizeAndRedrawCanvas);
$resizeFunction = resizeAndRedrawCanvas;

function resizeAndRedrawCanvas()
{
    var desiredWidth = $(window).width();
    var desiredHeight = $('#test').height();
    var windowHeight = $(window).height();

    if (desiredHeight < windowHeight) {
        desiredHeight = windowHeight;
    };

    canvas.width = desiredWidth;
    canvas.height = desiredHeight; 

    view.viewSize = new Size(desiredWidth, desiredHeight);
    view.draw();
};

$(document).ready(function() {
    setTimeout(resizeAndRedrawCanvas, 1000);
});


function onFrame(event) {
    updateWave(path, event.time);
}

function updateWave(path, time) {
    for (var i = 0, l = path.segments.length; i < l; i++) {
        var point = path.segments[i].point;
        point.y = point.py + Math.sin(time * freqs[i]) * amps[i] * factor;
    }
    for (var j = 0, l = springs.length; j < l; j++) {
        springs[j].update();
    }
    path.smooth();
}