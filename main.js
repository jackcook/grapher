if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
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

	var material = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
	
	function x(i) {
		return Math.cos(i);
	}
	
	function y(i) {
		return Math.sin(i);
	}
	
	function z(i) {
		return i;
	}

	var geometry = new THREE.Geometry();
	
	var factor = 15;
	for (var i = -1000; i < 1000; i++) {
		geometry.vertices.push(new THREE.Vector3(x(i / 10) * factor, z(i / 10) * factor, y(i / 10) * factor));
	}
	
	var line = new THREE.Line(geometry, material);
	
	scene.add(line);
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
