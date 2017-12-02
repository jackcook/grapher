if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var line;
var camera, controls, scene, renderer;
init();
render(); // remove when using next line for animation loop (requestAnimationFrame)
//animate();
function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xcccccc );
	scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth - 320, window.innerHeight );
	var container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
	camera = new THREE.PerspectiveCamera( 60, (window.innerWidth - 320) / window.innerHeight, 1, 1000 );
	camera.position.z = 500;
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render ); // remove when using animation loop
	// enable animation loop when using damping or autorotation
	//controls.enableDamping = true;
	//controls.dampingFactor = 0.25;
	controls.enableZoom = false;
	// world
// 	var geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
// 	var material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
// 	for ( var i = 0; i < 500; i ++ ) {
// 		var mesh = new THREE.Mesh( geometry, material );
// 		mesh.position.x = ( Math.random() - 0.5 ) * 1000;
// 		mesh.position.y = ( Math.random() - 0.5 ) * 1000;
// 		mesh.position.z = ( Math.random() - 0.5 ) * 1000;
// 		mesh.updateMatrix();
// 		mesh.matrixAutoUpdate = false;
// 		scene.add( mesh );
// 	}
// 	
// 	var geometry = new THREE.SphereGeometry( 25, 32, 32 );
// var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
// var sphere = new THREE.Mesh( geometry, material );
// scene.add( sphere );

	// var material = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
	// 
	// function x(t) {
	// 	return eval(document.getElementById("x").value);
	// }
	// 
	// function y(t) {
	// 	return eval(document.getElementById("y").value);
	// }
	// 
	// function z(t) {
	// 	return eval(document.getElementById("z").value);
	// }
	// 
	// var geometry = new THREE.Geometry();
	// 
	// var factor = 15;
	// for (var i = -1000; i < 1000; i++) {
	// 	geometry.vertices.push(new THREE.Vector3(x(i / 10) * factor, z(i / 10) * factor, y(i / 10) * factor));
	// }
	// 
	// var line = new THREE.Line(geometry, material);
	// 
	// scene.add(line);
	renderer.render(scene, camera);
	
	// lights
	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	scene.add( light );
	var light = new THREE.DirectionalLight( 0x002288 );
	light.position.set( -1, -1, -1 );
	scene.add( light );
	var light = new THREE.AmbientLight( 0x222222 );
	scene.add( light );
	//
	window.addEventListener("resize", onWindowResize, false);
}
function onWindowResize() {
	camera.aspect = (window.innerWidth - 320) / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth - 320, window.innerHeight );
}
function animate() {
	requestAnimationFrame( animate );
	controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
	render();
}
function render() {
	renderer.render( scene, camera );
}

function clean(latex) {
	return latex.replace("\\sin", "sin")
				.replace("\\cos", "cos")
				.replace("\\left", "")
				.replace("\\right", "");
}

var updateEquation = function(x_latex, y_latex, z_latex) {
	scene.remove(line);
	
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
	
	var factor = 15;
	for (var i = -1000; i < 1000; i++) {
		var x_val = x(i / 10), y_val = y(i / 10), z_val = z(i / 10);
		if (x_val == null || y_val == null || z_val == null) {
			break;
		}
		
		geometry.vertices.push(new THREE.Vector3(x_val * factor, z_val * factor, y_val * factor));
	}
	
	line = new THREE.Line(geometry, material);
	
	scene.add(line);
	renderer.render(scene, camera);
}

var xInput = document.getElementById("x");
var yInput = document.getElementById("y");
var zInput = document.getElementById("z");
// xInput.oninput = updateEquation;
// yInput.oninput = updateEquation;
// zInput.oninput = updateEquation;

var latexSpan = document.getElementById('latex');

var MQ = MathQuill.getInterface(2); // for backcompat
var xField = MQ.MathField(xInput, {
  	spaceBehavesLikeTab: true, // configurable
  	handlers: {
    	edit: function() { // useful event handlers
			var x = xField.latex();
			var y = yField.latex();
			var z = zField.latex();
			updateEquation(x, y, z);
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
			updateEquation(x, y, z);
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
			updateEquation(x, y, z);
    	}
  	}
});
