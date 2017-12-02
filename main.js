var lines = [], mesh;
var camera, controls, scene, renderer;
init();
render();
function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xcccccc);
	scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth - 320, window.innerHeight );
	var container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
	camera = new THREE.PerspectiveCamera(60, (window.innerWidth - 320) / window.innerHeight, 1, 1000);
	camera.position.z = 10;
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', render); // remove when using animation loop
	controls.enableZoom = false;
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
	var light = new THREE.DirectionalLight( 0x002288 );
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

var updateEquation = function(idx, x_latex, y_latex, z_latex) {
	// scene.remove(line);
	scene.remove(lines[idx]);
	
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
		
		if (x_val < 5 && x_val > -5 && y_val < 5 && y_val > -5 && z_val < 5 && z_val > -5) {
			geometry.vertices.push(new THREE.Vector3(x_val, z_val, y_val));
		}
	}
	
	lines[idx] = new THREE.Line(geometry, material);
	
	scene.add(lines[idx]);
	renderer.render(scene, camera);
}

var xInput = document.getElementById("x");
var yInput = document.getElementById("y");
var zInput = document.getElementById("z");

var latexSpan = document.getElementById('latex');

var MQ = MathQuill.getInterface(2); // for backcompat
var xField = MQ.MathField(xInput, {
  	spaceBehavesLikeTab: true, // configurable
  	handlers: {
    	edit: function() { // useful event handlers
			var x = xField.latex();
			var y = yField.latex();
			var z = zField.latex();
			updateEquation(0, x, y, z);
    	}
  	}
});

var yField = MQ.MathField(yInput, {
  	spaceBehavesLikeTab: true, // configurable
  	handlers: {
    	edit: function() { // useful event handlers
			var x = xField.latex();
			var y = yField.latex();
			var z = zField.latex();
			updateEquation(0, x, y, z);
    	}
  	}
});

var zField = MQ.MathField(zInput, {
  	spaceBehavesLikeTab: true, // configurable
  	handlers: {
    	edit: function() { // useful event handlers
			var x = xField.latex();
			var y = yField.latex();
			var z = zField.latex();
			updateEquation(0, x, y, z);
    	}
  	}
});

var eqnField = MQ.MathField(document.getElementById("eq"), {
	spaceBehavesLikeTab: true,
	handlers: {
		edit: function() {
			function radialWave(u, v) {
				var x = 5 * (u - 0.5);
				var z = 5 * (v - 0.5);
				var y = Math.pow(x, 2) + Math.pow(z, 2);
				// var y = Math.pow(z, 2) - Math.pow(x, 2);
	            return new THREE.Vector3(x, y, z);
	        }
			
			function createMesh(geom) {
	            var meshMaterial = new THREE.MeshPhongMaterial({
	                specular: 0xaaaafff,
	                color: 0x3399ff,
	                shininess: 40,
	                metal: true
	            });
	            meshMaterial.side = THREE.DoubleSide;
	            // create a multimaterial
	            var plane = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial]);
	            return plane;
	        }
		
		var mesh = createMesh(new THREE.ParametricGeometry(radialWave, 120, 120, false));
        scene.add(mesh);
		}
	}
});
