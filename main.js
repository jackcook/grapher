var lines = {}, meshes = [];
var camera, controls, scene, renderer;

var MQ = MathQuill.getInterface(2); // for backcompat

init();
render();
function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x9e9e9e);
	scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
	renderer = new THREE.WebGLRenderer({
		preserveDrawingBuffer: true
	});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth - 320, window.innerHeight );
	var container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
	camera = new THREE.PerspectiveCamera(60, (window.innerWidth - 320) / window.innerHeight, 1, 1000);
	camera.position.x = 5;
	camera.position.y = 2;
	camera.position.z = 5;
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', render); // remove when using animation loop
	// world
	var xMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
	var xGeometry = new THREE.Geometry();
	xGeometry.vertices.push(new THREE.Vector3(-1000, 0, 0));
	xGeometry.vertices.push(new THREE.Vector3(1000, 0, 0));
	var xLine = new THREE.Line(xGeometry, xMaterial);
	scene.add(xLine);

	var yMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 3 });
	var yGeometry = new THREE.Geometry();
	yGeometry.vertices.push(new THREE.Vector3(0, -1000, 0));
	yGeometry.vertices.push(new THREE.Vector3(0, 1000, 0));
	var yLine = new THREE.Line(yGeometry, yMaterial);
	scene.add(yLine);

	var zMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
	var zGeometry = new THREE.Geometry();
	zGeometry.vertices.push(new THREE.Vector3(0, 0, -1000));
	zGeometry.vertices.push(new THREE.Vector3(0, 0, 1000));
	var zLine = new THREE.Line(zGeometry, zMaterial);
	scene.add(zLine);

	renderer.render(scene, camera);

	// lights
	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set(1, 1, 1);
	scene.add(light);
	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set(-1, -1, -1);
	scene.add(light);
	var light = new THREE.AmbientLight( 0x222222 );
	scene.add(light);
	//
	window.addEventListener("resize", onWindowResize, false);
}
function onWindowResize() {
	camera.aspect = (window.innerWidth - 320) / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth - 320, window.innerHeight );
}
function render() {
	renderer.render(scene, camera);
}

function clean(latex) {
	return latex.replace("\\sin", "sin")
				.replace("\\cos", "cos")
				.replace("\\left", "")
				.replace("\\right", "");
}

var updateEquation = function(id, x_latex, y_latex, z_latex) {
	scene.remove(lines[id]);

	var material = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });

	function x(t) {
		try {
			return Evaluatex.evaluate(clean(x_latex), {t: t}, {latex: true});
		} catch(err) {
			return null;
		}
	}

	function y(t) {
		try {
 			return Evaluatex.evaluate(clean(y_latex), {t: t}, {latex: true});
 		} catch(err) {
 			return null;
 		}
	}

	function z(t) {
		try {
			return Evaluatex.evaluate(clean(z_latex), {t: t}, {latex: true});
		} catch(err) {
			return null;
		}
	}

	var geometry = new THREE.Geometry();

	var tMax = 50;
	var tMin = -50;
	var increment = 10;

	for (var i = tMin * increment; i <= tMax * increment; i++) {
		var x_val = x(i / increment), y_val = y(i / increment), z_val = z(i / increment);

		if (x_val == null || y_val == null || z_val == null) {
			break;
		}

		if (x_val < 10 && x_val > -10 && y_val < 10 && y_val > -10 && z_val < 10 && z_val > -10) {
			geometry.vertices.push(new THREE.Vector3(x_val, z_val, y_val));
		}
	}

	lines[id] = new THREE.Line(geometry, material);

	scene.add(lines[id]);
	renderer.render(scene, camera);
}

function createEquationRow() {
	return $("<div class=\"row equation\">" +
		"<label>z = </label><span class=\"eqn\"></span>" +
		"</div>");
}

function createParametricRow() {
	return $("<div class=\"row parametric\">" +
		"<label>x = </label><span class=\"x\"></span><br>" +
		"<label>y = </label><span class=\"y\"></span><br>" +
		"<label>z = </label><span class=\"z\"></span>" +
	"</div>");
}

function createRow(type) {
	if (type == "parametric") {
		var row = createParametricRow();

		var id = "p" + Math.floor(Math.random() * 1000000);
		row.addClass(id);

		row.insertBefore("#new-row-button");

		var editHandler = function() {
			var x = MQ.MathField($("." + id).find(".x").get(0)).latex();
			var y = MQ.MathField($("." + id).find(".y").get(0)).latex();
			var z = MQ.MathField($("." + id).find(".z").get(0)).latex();
			updateEquation(id, x, y, z);
		};

		var xField = MQ.MathField($("." + id).find(".x").get(0), {
		  	spaceBehavesLikeTab: true, // configurable
		  	handlers: {
		    	edit: editHandler
		  	}
		});

		var yField = MQ.MathField($("." + id).find(".y").get(0), {
		  	spaceBehavesLikeTab: true, // configurable
		  	handlers: {
		    	edit: editHandler
		  	}
		});

		var zField = MQ.MathField($("." + id).find(".z").get(0), {
		  	spaceBehavesLikeTab: true, // configurable
		  	handlers: {
		    	edit: editHandler
		  	}
		});
	} else if (type == "equation") {
		var row = createEquationRow();

		var id = "p" + Math.floor(Math.random() * 1000000);
		row.addClass(id);

		row.insertBefore("#new-row-button");

		var editHandler = function() {
			scene.remove(meshes[id]);

			var z_latex = MQ.MathField($("." + id).find(".eqn").get(0)).latex();

			function radialWave(u, v) {
				var x = 4 * (u - 0.5);
				var z = 4 * (v - 0.5);
				var y;

				try {
					y = Evaluatex.evaluate(clean(z_latex), {x: x, y: z}, {latex: true});
				} catch (err) {
					y = 0;
				}

				return new THREE.Vector3(x, y, z);
			}

			function createMesh(geom) {
				var meshMaterial = new THREE.MeshPhongMaterial({
					color: 0x3f51b5,
					shininess: 4
				});
				meshMaterial.side = THREE.DoubleSide;
				// create a multimaterial
				var plane = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial]);
				return plane;
			}

			meshes[id] = createMesh(new THREE.ParametricGeometry(radialWave, 20, 20));
			scene.add(meshes[id]);
			renderer.render(scene, camera);
		};

		var eqnField = MQ.MathField($("." + id).find(".eqn").get(0), {
			spaceBehavesLikeTab: true,
			handlers: {
				edit: editHandler
			}
		});
	}
}

createRow("parametric", 0);

$("#new-row-button").click(function(e) {
	$("#new-dropdown").remove();

	var dropdown = $("<div id=\"new-dropdown\">" +
        "<p id=\"dropdown-equation\" class=\"new-dropdown-option\">Equation</p>" +
        "<p id=\"dropdown-parametric\" class=\"new-dropdown-option\">Parametric</p>" +
    "</div>");

	dropdown.css("top", (e.clientY - $(this).parent().offset().top) + "px");
	dropdown.css("left", (e.clientX - $(this).parent().offset().left) + "px");

	$("body").append(dropdown);

	$("#dropdown-equation").click(function() {
		$("#new-dropdown").remove();
		createRow("equation", $("#sidebar").children().length - 2);
	});

	$("#dropdown-parametric").click(function() {
		$("#new-dropdown").remove();
		createRow("parametric", $("#sidebar").children().length - 2);
	});
});

$("#screenshot").click(function(e) {
	window.open(renderer.domElement.toDataURL("image/png"));
});
