// based on http://paperjs.org/examples/future-splash/
// Code ported to Paper.js from http://the389.com/9/1/
// with permission.

var values = {
	friction: 0.8,
	timeStep: 0.01,
	amount: 20,
	mass: 2,
	count: 0
};
values.invMass = 1 / values.mass;

var path, springs;
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
		fillColor: new Color(0, 0, 1, 0.025)
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
	path = createPath(0.1);
}

function onPivotMove(pivot) {
    var location = path.getNearestLocation(pivot);
	var segment = location.segment;
	var point = segment.point;

	if (!point.fixed && location.distance < size.height / 4) {
		var y = pivot.y;
		point.y += (y - point.y) / 6;
		if (segment.previous && !segment.previous.fixed) {
			var previous = segment.previous.point;
			previous.y += (y - previous.y) / 24;
		}
		if (segment.next && !segment.next.fixed) {
			var next = segment.next.point;
			next.y += (y - next.y) / 24;
		}
	}
}

var pivot = new Point(view.size.width, view.size.height) * 0.5;
var direction = Point.random() - 0.5;
var speed = Point.random().x * 60;

var count = 0;
function onFrame(event) {
    count = (count + 1) % 3;
    if (count > 1) {
        return;
    }
    updatePivot();
    //pivot = new Point(view.size.width, view.size.height) * Point.random();
    if (Math.random() > 0.9) {
        var direction = Point.random() - 0.5;
        var speed = Point.random().x * 50;
    }
    onPivotMove(pivot);
	updateWave(path);
}

function updatePivot() {
    var old_pivot = pivot;
    pivot = pivot + direction * speed;
    if (pivot.x < view.size.width * 0.1) {
        direction.x = Math.abs(direction.x);
    } else if (pivot.x > view.size.width * 0.9) {
        direction.x = -Math.abs(direction.x);
    }

    if (pivot.y < view.size.height * 0.1) {
        direction.y = Math.abs(direction.y);
    } else if (pivot.y > view.size.height * 0.9) {
        direction.y = -Math.abs(direction.y);
    }
    //console.log("updatePivot: ", old_pivot, ", ", direction, ", ", speed, " -> ", pivot);
}

function updateWave(path) {
	var force = 1 - values.friction * values.timeStep * values.timeStep;
	for (var i = 0, l = path.segments.length; i < l; i++) {
		var point = path.segments[i].point;
		var dy = (point.y - point.py) * force;
		point.py = point.y;
		point.y = Math.max(point.y + dy, 0);
	}

	for (var j = 0, l = springs.length; j < l; j++) {
		springs[j].update();
	}
	path.smooth({ type: 'continuous' });
}

function onKeyDown(event) {
    /*
	if (event.key == 'space') {
		path.fullySelected = !path.fullySelected;
		path.fillColor = path.fullySelected ? null : 'black';
	}
    */
}
