/**
* Gesture control
**/
//
// Startup
//
var isDown, points, strokeID, recog; // global variables

function onLoadEvent()
{
	points = new Array(); // point array for current stroke
	strokeID = 0;
	recog = new PDollarRecognizer();

	isDown = false;
	
	var gestures = document.getElementById('gestures');
	var ctx = gestures.getContext('2d');
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
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
		var context = document.getElementById('gestures').getContext('2d');
		context.beginPath();
		context.moveTo(x, y);
		console.log("Recording stroke #" + strokeID + "...");
	}
	else if (button == 2) {
		console.log("Recognizing gesture...");
	}
}

function mouseMoveEvent(x, y, button) {
	if (isDown) {
		var point = new Point(x, y, strokeID);
		points[points.length] = point; // append
		drawLine(point);
	}
}

function mouseUpEvent(x, y, button) {
	document.onselectstart = function() { return true; } // enable drag-select
	document.onmousedown = function() { return true; } // enable drag-select
	if (button <= 1) {
		if (isDown) {
			isDown = false;
			console.log("Stroke #" + strokeID + " recorded.");
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

function drawLine(a) {
	var canvas = document.getElementById('gestures');
	var context = canvas.getContext('2d');
	context.lineTo(a.X, a.Y)
	context.stroke();
}

function clearStrokes()
{
	points.length = 0;
	strokeID = 0;
	var canvas = document.getElementById('gestures').getContext('2d');
	canvas.clearRect(0, 0, window.innerWidth, window.innerHeight);
	console.log("Canvas cleared.");
}


/**
* Babylon Things
**/

window.addEventListener('DOMContentLoaded', function() {
	var canvas = document.getElementById('renderCanvas');
	var engine = new BABYLON.Engine(canvas, true);
	var scene = new BABYLON.Scene(engine);
	
	// Engine functions
	window.addEventListener('resize', function() {
		engine.resize();
		var gestures = document.getElementById('gestures');
		var ctx = gestures.getContext('2d');
		ctx.canvas.width = window.innerWidth;
		ctx.canvas.height = window.innerHeight;
	});
	
	engine.runRenderLoop(function() {
		scene.render();
	});
	
	// Populate the scene
	var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 4,
		Math.PI / 3, 10, new BABYLON.Vector3(0,1,0), scene);
	camera.upperBetaLimit = Math.PI / 2;
	camera.lowerRadiusLimit = 7.5;
	camera.upperRadiusLimit = 500;
	camera.attachControl(canvas, true, true);

	var light = new BABYLON.HemisphericLight("light1",
		new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.7;
	
	var flowerBase;
	BABYLON.SceneLoader.ImportMesh('', 'art/models/',
		'flower_base.babylon', scene, function (newMeshes) {
		var SCALE = 0.33;
		flowerBase = newMeshes[0];
		for (var i = 0; i < newMeshes.length; ++i) {
			newMeshes[i].scaling.x = SCALE;
			newMeshes[i].scaling.y = SCALE;
			newMeshes[i].scaling.z = SCALE;
		}
    });
	
	var petal;
	BABYLON.SceneLoader.ImportMesh('', 'art/models/',
		'petal.babylon', scene, function (newMeshes) {
		var SCALE = 0.33;
		petal = newMeshes[0];
		for (var i = 0; i < newMeshes.length; ++i) {
			newMeshes[i].scaling.x = SCALE;
			newMeshes[i].scaling.y = SCALE;
			newMeshes[i].scaling.z = SCALE;
			newMeshes[i].position.x = 0 * SCALE;
			newMeshes[i].position.y = 12.25 * SCALE;
			newMeshes[i].position.z = -0.75 * SCALE;
		}
	});
	
	//var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
	//sphere.position.y = 1;

	var ground = BABYLON.Mesh.CreateGround("ground1", 3, 3, 2, scene);	
	scene.clearColor = new BABYLON.Color3(1, 1, 1);
	
	// Ensure screen is sized correctly.
	engine.resize();
	
	onLoadEvent();
});
