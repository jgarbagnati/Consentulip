/**
* Gesture control
**/
//
// Startup
//

// Global Variables
var isDown, points, strokeID, recog, iter, circles, glow, gdx;
var circleCanv, gestureCanv, bufferCanv;


// Constants

function onLoadEvent() {
	points = new Array(); // point array for current stroke
	strokeID = 0;
	recog = new PDollarRecognizer();
	isDown = false;
	
	circleCanv = document.createElement('canvas');
	gestureCanv = document.createElement('canvas');
	bufferCanv = document.createElement('canvas');
	resizeCanvas();
	
	iter = 0;
	circles = [];
	glow = 100;
	gdx = 1;
	window.requestAnimationFrame(draw);
}

//
// Mouse Events
//
function mouseDownEvent(x, y, button) {
	document.onselectstart = function() { return false; } // disable drag-select
	document.onmousedown = function() { return false; } // disable drag-select
	if (button <= 1)
	{
		isDown = true;
		if (strokeID == 0)	{
			points.length = 0;
		}
		points[points.length] = new Point(x, y, ++strokeID);
		var bctx = bufferCanv.getContext('2d');
		bctx.lineWidth = 3;
		bctx.moveTo(x, y);
		bctx.strokeStyle = '#ffffff';
		bctx.shadowBlur = 10;
		bctx.shadowColor = 'rgba(255,200,50,.25)';
		console.log("Recording stroke #" + strokeID + "...");
		bctx.beginPath();
		
		circles.unshift({
			x: x,
			y: y,
			radius: 10,
			color: '255,255,0'
		});
	}
	else if (button == 2) {
		console.log("Recognizing gesture...");
	}
}

function mouseMoveEvent(x, y, button) {
	if (isDown) {
		var point = new Point(x, y, strokeID);
		points[points.length] = point; // append
		drawLine(bufferCanv.getContext('2d'), points[points.length-2], point);
	}
}

function mouseUpEvent(x, y, button) {
	document.onselectstart = function() { return true; } // enable drag-select
	document.onmousedown = function() { return true; } // enable drag-select
	if (button <= 1) {
		if (isDown) {
			isDown = false;
			console.log("Stroke #" + strokeID + " recorded.");
			gestureCanv.getContext('2d').drawImage(bufferCanv, 0, 0);
		}
	} else if (button == 2) {
		if (points.length >= 10){
			var result = recog.Recognize(points);
			console.log("Result: " + result.Name + " (" + (Math.round(result.Score * 100) / 100) + ").");
		} else {
			console.log("Too little input made. Please try again.");
		}
		clearStrokes();
	}
}

function drawLine(ctx, a, b) {
	ctx.lineTo(b.X, b.Y);
	var width = Math.sqrt(Math.pow(a.X - b.X, 2) + Math.pow(a.Y - b.Y, 2));
	ctx.lineWidth = 4 - (3 * (width/200));
	ctx.shadowBlur = 10 + (3 * (width/200));
}

function clearStrokes() {
	points.length = 0;
	strokeID = 0;
	var ctx = document.getElementById('gestures').getContext('2d');
	ctx.closePath();
	var sctx = circleCanv.getContext('2d');
	var gctx = gestureCanv.getContext('2d');
	var bctx = bufferCanv.getContext('2d');
	
	// Clear the canvas
	ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	sctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	gctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	bctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	console.log("Canvas cleared.");
}

function createCircle(ctx, x, y, rad, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
}

function draw() {
	var THRESHOLD = 40;
	var canvas = document.getElementById('gestures');
	var ctx = canvas.getContext('2d');
	var sctx = circleCanv.getContext('2d');
	var gctx = gestureCanv.getContext('2d');
	var bctx = bufferCanv.getContext('2d');
	
	// Clear the canvas
	ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	sctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	bctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	
	// Create the circles
	for (var i = circles.length - 1; i >= 0; --i) {
		circles[i].radius += 3;
		var rgb = circles[i].color;
		var a = 0.25 * (1 - (circles[i].radius / THRESHOLD));
		var rgba = 'rgba(' + rgb + ',' + a + ')';
		createCircle(sctx, circles[i].x, circles[i].y, circles[i].radius, rgba);
		if (circles[i].radius > THRESHOLD) {
			circles.splice(i,1);
		}
	}
	
	if (points.length > 0) {
		// Change the glow amount
		glow += gdx;
		if(glow == 60 || glow == 120)
			gdx *= -1;
		
		bctx.stroke();
		var glowLoop = Math.floor(glow / 10)
		for (i = 0; i < glowLoop; ++i) {
			ctx.drawImage(gestureCanv, 0, 0);
			ctx.drawImage(bufferCanv, 0, 0);
		}
	}
	
	ctx.drawImage(circleCanv, 0, 0);
	window.requestAnimationFrame(draw);
}

function resizeCanvas() {
	var width = window.innerWidth;
	var height = window.innerHeight;
	var canvases = [document.getElementById('gestures'), circleCanv, gestureCanv, bufferCanv];
	
	for (var i = 0; i < canvases.length; ++i) {
		var ctx = canvases[i].getContext('2d');
		ctx.canvas.width = width;
		ctx.canvas.height = height;
	}
}

/**
* Babylon Things
**/

function isInFront(cameraAlpha) {
	return (cameraAlpha >= 0)? (cameraAlpha % (Math.PI * 2)) < Math.PI:
		(Math.abs(cameraAlpha) % (Math.PI * 2)) >= Math.PI;
}

window.addEventListener('DOMContentLoaded', function() {
	var canvas = document.getElementById('renderCanvas');
	var engine = new BABYLON.Engine(canvas, true);
	var scene = new BABYLON.Scene(engine);
	
	// Engine functions
	window.addEventListener('resize', function() {
		engine.resize();
		resizeCanvas();
	});
	
	engine.runRenderLoop(function() {
		scene.render();
	});
	
	// Camera settings
	var DEFAULT_CAMERA_TARGET = new BABYLON.Vector3(0,7.5,0);
	var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 4,
		Math.PI / 3, 30, DEFAULT_CAMERA_TARGET, scene);
	camera.upperBetaLimit = Math.PI / 2;
	camera.lowerRadiusLimit = 7.5;
	camera.upperRadiusLimit = 500;
	camera.attachControl(canvas, true, true);
	scene.activeCamera.panningSensibility = 0; // disables camera panning
	
	// Set up the light
	var light = new BABYLON.HemisphericLight("light",
		new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.7;
	
	// Load in the model
	var stem, leaves, petals;
	BABYLON.SceneLoader.ImportMesh('', 'art/models/',
		'tulip.babylon', scene, function (mesh) {
		var SCALE = 5.0;
		leaves = [];
		petals = [];
		for (var i = 0; i < mesh.length; ++i) {
			mesh[i].scaling.x *= SCALE;
			mesh[i].scaling.y *= SCALE;
			mesh[i].scaling.z *= SCALE;
			mesh[i].position.x *= SCALE;
			mesh[i].position.y *= SCALE;
			mesh[i].position.z *= SCALE;
			var name = mesh[i].name;
			var type = 'ignore';
			var info = {};
			if (name === 'stem') {
				stem = mesh[i];
				type = 'stem';
				info = {
					alpha: 0,
					radius: 10,
					yOffset: 0
				}
			} else if (name.substring(0,4) === 'leaf') {
				leaves.push(mesh[i]);
				type = 'leaf';
				info = {
					alpha: 0,
					radius: 12,
					yOffset: 0
				}
				mesh[i].position.y += 0.4 * SCALE;
			} else if (name.substring(0,5) === 'petal') {
				petals.push(mesh[i]);
				type = 'petal';
				var alpha = 0;
				switch(+(name.substring(8))) {
					case 4:
						alpha = Math.PI / 4;
						break;
					case 5:
						alpha = 5 * Math.PI / 4; 
						break;
					case 6:
						alpha = 7 * Math.PI / 4;
						break;
					case 7:
						alpha = 3 * Math.PI / 4;
						break;
					default:
						break;
				}
				info = {
					alpha: alpha,
					radius: 7.5,
					yOffset: .5
				}
			}
			mesh[i].flowerPart = type;
			mesh[i].cameraInfo = info;
		}
    });
	
	// Load in the ground
	var ground = BABYLON.Mesh.CreateGround("ground", 3, 3, 2, scene);	
	scene.clearColor = new BABYLON.Color3(.1, .1, .1);
	
	// Mouse events
	var onPointerDown = function (evt) {
        if (evt.button !== 0) {
            return;
        }

        // check if we are under a mesh
        var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== ground; });
        if (pickInfo.hit) {
			var mesh = pickInfo.pickedMesh;
			if (mesh.flowerPart && mesh.flowerPart !== 'ignore') {
				var info = mesh.cameraInfo;
				camera.target = new BABYLON.Vector3(
					mesh.position.x,
					mesh.position.y + info.yOffset,
					mesh.position.z
				);
				
				// Grab camera info for mesh
				var alpha = info.alpha;
				if (info.alpha == 0)
					alpha = (isInFront(camera.alpha))? Math.PI / 2: 3 * Math.PI / 2;
				var beta = Math.PI / 2;
				var radius = info.radius;
				
				// Lock the camera alpha angle
				camera.alpha = alpha;
				camera.lowerAlphaLimit = alpha;
				camera.upperAlphaLimit = alpha;
				
				// Lock the camera beta angle
				camera.beta = Math.PI / 2;
				camera.lowerBetaLimit = beta;
				camera.upperBetaLimit = beta;
				
				// Lock the camera radius
				camera.radius = info.radius;
				camera.lowerRadiusLimit = radius;
				camera.upperRadiusLimit = radius;
				
				var canvas = document.getElementById('gestures').className = 'active';
				clearStrokes();
			}
        }
    }

    var onPointerUp = function () {
        
    }

    var onPointerMove = function (evt) {
        
    }

    canvas.addEventListener("pointerdown", onPointerDown, false);
    canvas.addEventListener("pointerup", onPointerUp, false);
    canvas.addEventListener("pointermove", onPointerMove, false);
	
	// Ensure screen is sized correctly.
	engine.resize();
	
	onLoadEvent();
});
