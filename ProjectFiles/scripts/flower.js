var Flower = {
	petalColor: {r:0, g:0, b:0, btn: 0},
	leaves: [],
	petals: [],
	outerPetals: [],
	interactable: [],
	stem: null,
	pot: [],
	rocks: [],
	
	loadModels: function() {
		// Load in the model
		BABYLON.SceneLoader.ImportMesh('', 'art/models/',
			'tulip.babylon', Game.scene, function (mesh) {
			var COMBINED_SCALE = 
				Constants.FLOWER_SCALE * Constants.FLOWER_HEAD_SCALE;
			for (var i = 0; i < mesh.length; ++i) {
				mesh[i].scaling.x *= Constants.FLOWER_SCALE;
				mesh[i].scaling.y *= Constants.FLOWER_SCALE;
				mesh[i].scaling.z *= Constants.FLOWER_SCALE;
				mesh[i].position.x *= Constants.FLOWER_SCALE;
				mesh[i].position.y *= Constants.FLOWER_SCALE;
				mesh[i].position.z *= Constants.FLOWER_SCALE;
				var name = mesh[i].name;
				var type = 'ignore';
				var info = {};
				var offset = [];
				var interactable = false;
				
				if (name === 'stem') {
					Flower.stem = mesh[i];
					Desire.notDesired.push(mesh[i]);
					type = 'stem';
					info = {
						alpha: 0,
						radius: 10,
						yOffset: 0
					};
					offset.push(new BABYLON.Vector3(
						0,
						-0.1 * COMBINED_SCALE,
						0
					));
					offset.push(new BABYLON.Vector3(
						0,
						-0.01 * COMBINED_SCALE,
						0
					));
					offset.push(new BABYLON.Vector3(
						0,
						0.08 * COMBINED_SCALE,
						0
					));
					interactable = true;
				} else if (name.substring(0,4) === 'leaf') {
					Flower.leaves.push(mesh[i]);
					Desire.notDesired.push(mesh[i]);
					type = 'leaf';
					info = {
						alpha: 0,
						radius: 12,
						yOffset: 0
					};
					offset.push(new BABYLON.Vector3(
						0,
						0,
						-0.66 * COMBINED_SCALE
					));
					offset.push(new BABYLON.Vector3(
						0,
						0,
						0.66 * COMBINED_SCALE
					));
					
					mesh[i].position.y += 0.4 * Constants.FLOWER_SCALE;;
					if (Flower.leaves.length == 1) {
						mesh[i].position.y += 0.4 * Constants.FLOWER_SCALE;;
					}
					interactable = true;
				} else if (name.substring(0,5) === 'petal') {
					Flower.petals.push(mesh[i]);
					type = 'petal';
					var alpha = 0;
					if (+(name.substring(8)) > 3) {
						Flower.outerPetals.push(mesh[i]);
						Desire.notDesired.push(mesh[i]);
						offset.push(new BABYLON.Vector3(
							0,
							0.1 * COMBINED_SCALE,
							-0.66 * COMBINED_SCALE
						));
						interactable = true;
					}
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
							type = 'ignore';
							break;
					}
					info = {
						alpha: alpha,
						radius: 7.5,
						yOffset: 1.33
					};
					
					// Change flower scaling
					mesh[i].scaling.x *= Constants.FLOWER_HEAD_SCALE;
					mesh[i].scaling.y *= Constants.FLOWER_HEAD_SCALE;
					mesh[i].scaling.z *= Constants.FLOWER_HEAD_SCALE;
					mesh[i].position.x *= Constants.FLOWER_HEAD_SCALE;
					mesh[i].position.z *= Constants.FLOWER_HEAD_SCALE;
					
					// Adjust color
					mesh[i].renderOverlay = true;
					mesh[i].overlayAlpha = 0.25;
					mesh[i].overlayColor = Flower.petalColor;
				}
				mesh[i].flowerPart = type;
				mesh[i].cameraInfo = info;
				mesh[i].blinkOffset = offset;
				
				mesh[i].outlineCounter = 0;
				mesh[i].outlineColor = {
					r: 255,
					g: 255,
					b: 0
				};
				
				if (interactable)
					Flower.interactable.push(mesh[i]);
			}
		});
		
		// Load in the pot
		BABYLON.SceneLoader.ImportMesh('', 'art/models/',
			'pot.babylon', Game.scene, function (mesh) {
			for (var i = 0; i < mesh.length; ++i) {
				mesh[i].isSoil = true;
				Flower.pot.push(mesh[i]);
				mesh[i].scaling.x *= Constants.FLOWER_SCALE;
				mesh[i].scaling.y *= Constants.FLOWER_SCALE;
				mesh[i].scaling.z *= Constants.FLOWER_SCALE;
				mesh[i].position.x *= Constants.FLOWER_SCALE;
				mesh[i].position.y *= Constants.FLOWER_SCALE;
				mesh[i].position.z *= Constants.FLOWER_SCALE;
				mesh[i].position.y += -0.80 * Constants.FLOWER_SCALE;
				
				if (mesh[i].name === 'TopSoil') {
					mesh[i].scaling.x += 0.015 * Constants.FLOWER_SCALE;
					mesh[i].scaling.z += 0.015 * Constants.FLOWER_SCALE;
					mesh[i].position.y -= 0.015 * Constants.FLOWER_SCALE;
				} else if (mesh[i].name.substring(0,4) === 'Cube'){
					Flower.rocks.push(mesh[i]);
					mesh[i].dir = 1;
					if (i % 2 == 0) {
						mesh[i].dir = -1;
						mesh[i].position.y -= (Constants.ROCK_Y_MAX
							- Constants.ROCK_Y_MIN);
					}
				}
				
				mesh[i].outlineCounter = 0;
				mesh[i].outlineColor = {
					r: 255,
					g: 255,
					b: 0
				};
			}
		});
	},
	
	randomizeColor: function() {
		var random = Constants.FLOWER_COLORS[Math.floor(
			Math.random() * Constants.FLOWER_COLORS.length)];
		this.petalColor.r = random.r;
		this.petalColor.g = random.g;
		this.petalColor.b = random.b;
		this.petalColor.btn = random.btn;
		
		UI.filterButtonHue(random.btn);
	}
};
