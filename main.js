var items = {}, colors = {};
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
	camera.position.x = -5;
	camera.position.y = 2;
	camera.position.z = 5;
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', render); // remove when using animation loop
	// world
	var xMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
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

	var zMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
	var zGeometry = new THREE.Geometry();
	zGeometry.vertices.push(new THREE.Vector3(0, 0, -1000));
	zGeometry.vertices.push(new THREE.Vector3(0, 0, -3));
	var zLine = new THREE.Line(zGeometry, zMaterial);
	scene.add(zLine);

	var zGeometryTwo = new THREE.Geometry();
	zGeometryTwo.vertices.push(new THREE.Vector3(0, 0, 3));
	zGeometryTwo.vertices.push(new THREE.Vector3(0, 0, 1000));
	var zLineTwo = new THREE.Line(zGeometryTwo, zMaterial);
	scene.add(zLineTwo);

	for (var x = -3; x <= 3; x++) {
		var xMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
		var xGeometry = new THREE.Geometry();
		xGeometry.vertices.push(new THREE.Vector3(x, 0, -3));
		xGeometry.vertices.push(new THREE.Vector3(x, 0, 3));
		var xLine = new THREE.Line(xGeometry, xMaterial);
		scene.add(xLine);
	}

	for (var y = -3; y <= 3; y++) {
		var yMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
		var yGeometry = new THREE.Geometry();
		yGeometry.vertices.push(new THREE.Vector3(-3, 0, y));
		yGeometry.vertices.push(new THREE.Vector3(3, 0, y));
		var yLine = new THREE.Line(yGeometry, yMaterial);
		scene.add(yLine);
	}

	renderer.render(scene, camera);

	// lights
	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set(-1, 1, 1);
	scene.add(light);
	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set(1, -1, -1);
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
	scene.remove(items[id]);

	var material = new THREE.LineBasicMaterial({
		color: colors[id],
		linewidth: 13
	});

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

	items[id] = new THREE.Line(geometry, material);

	scene.add(items[id]);
	renderer.render(scene, camera);
}

function createEquationRow() {
	return $(`<div class="row equation">
		<span class="eqn">z=</span>
		<img class="delete" src="close.svg" />
		<a class="color-picker"></a>
	</div>`);
}

function createParametricRow() {
	return $(`<div class="row parametric">
		<label>x = </label><span class="x"></span><br>
		<label>y = </label><span class="y"></span><br>
		<label>z = </label><span class="z"></span>
		<img class="delete" src="close.svg" />
		<a class="color-picker"></a>
	</div>`);
}

function createPointRow() {
	return $(`<div class="row point">
		<span class="coordinates">(0,0,0)</span>
		<img class="delete" src="close.svg" />
	</div>`)
}

function createRow(type) {
	if (type == "parametric") {
		var row = createParametricRow();

		var id = "p" + Math.floor(Math.random() * 1000000);
		row.addClass(id);

		colors[id] = 0x009688;

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

		var deleteHandler = function() {
			$("." + id).remove();

			scene.remove(items[id]);
			renderer.render(scene, camera);
		};

		$("." + id + " .delete").click(deleteHandler);
	} else if (type == "equation") {
		var row = createEquationRow();

		var id = "p" + Math.floor(Math.random() * 1000000);
		row.addClass(id);

		colors[id] = 0x009688;

		row.insertBefore("#new-row-button");

		var editHandler = function() {
			scene.remove(items[id]);

			var z_latex = clean(MQ.MathField($("." + id).find(".eqn").get(0)).latex());

			function custom(u, v) {
				var leftSide = z_latex.split("=")[0];

				u = 4 * (u - 0.5);
				v = 4 * (v - 0.5);
				var w;
				var variables;

				if (leftSide == "x") {
					variables = {y: u, z: v};
				} else if (leftSide == "y") {
					variables = {z: u, x: v};
				} else if (leftSide == "z") {
					variables = {x: u, y: v};
				}

				try {
					w = Evaluatex.evaluate(z_latex.split("=")[1], variables, {latex: true});
				} catch (err) {
					w = 0;
				}

				if (leftSide == "x") {
					return new THREE.Vector3(w, v, u);
				} else if (leftSide == "y") {
					return new THREE.Vector3(v, u, w);
				} else if (leftSide == "z") {
					return new THREE.Vector3(u, w, v);
				}
			}

			function createMesh(geom) {
				var material = new THREE.MeshPhongMaterial({
					color: colors[id],
					shininess: 4,
					side: THREE.DoubleSide
				});

				var plane = THREE.SceneUtils.createMultiMaterialObject(geom, [material]);
				return plane;
			}

			items[id] = createMesh(new THREE.ParametricGeometry(custom, 20, 20));
			scene.add(items[id]);
			renderer.render(scene, camera);
		};

		var eqnField = MQ.MathField($("." + id).find(".eqn").get(0), {
			spaceBehavesLikeTab: true,
			handlers: {
				edit: editHandler
			}
		});

		var deleteHandler = function() {
			$("." + id).remove();

			scene.remove(items[id]);
			renderer.render(scene, camera);
		};

		$("." + id + " .delete").click(deleteHandler);
	} else if (type == "point") {
		var row = createPointRow();

		var id = "p" + Math.floor(Math.random() * 1000000);
		row.addClass(id);

		row.insertBefore("#new-row-button");

		var editHandler = function() {
			scene.remove(items[id]);

			var point_latex = clean(MQ.MathField($("." + id).find(".coordinates").get(0)).latex());
			var point_regex = /\((-?\d*\.?\d+),(-?\d*\.?\d+),(-?\d*\.?\d+)\)/
			var match = point_regex.exec(point_latex);

			if (match != null && match.length == 4) {
				match.shift();
				var coordinates = match.map(Number);

				var geometry = new THREE.SphereGeometry(0.1, 32, 32);
				var material = new THREE.MeshPhongMaterial({
					color: 0x3f51b5,
					shininess: 4
				});

				items[id] = new THREE.Mesh(geometry, material);
				items[id].position.set(match[0], match[2], match[1]);

				scene.add(items[id]);
			}

			renderer.render(scene, camera);
		};

		var pointField = MQ.MathField($("." + id).find(".coordinates").get(0), {
			spaceBehavesLikeTab: true,
			handlers: {
				edit: editHandler
			}
		});

		editHandler();

		var deleteHandler = function() {
			$("." + id).remove();

			scene.remove(items[id]);
			renderer.render(scene, camera);
		};

		$("." + id + " .delete").click(deleteHandler);
	}

	$(".color-picker").click(function(e) {
		var picker = $(`<div id="color-picker">
			<a class="red color" hex="#f44336"></a>
			<a class="pink color" hex="#e91e63"></a>
			<a class="purple color" hex="#9c27b0"></a>
			<a class="deep-purple color" hex="#673ab7"></a>
			<a class="indigo color" hex="#3f51b5"></a>
			<a class="blue color" hex="#2196f3"></a>
			<a class="cyan color" hex="#00bcd4"></a>
			<a class="teal color" hex="#009688"></a>
			<a class="green color" hex="#4caf50"></a>
			<a class="light-green color" hex="#8bc34a"></a>
			<a class="lime color" hex="#cddc39"></a>
			<a class="yellow color" hex="#ffeb3b"></a>
			<a class="amber color" hex="#ffc107"></a>
			<a class="orange color" hex="#ff9800"></a>
			<a class="deep-orange color" hex="#ff5722"></a>
			<a class="brown color" hex="#795548"></a>
		</div>`);

		var id = $(this).parent().attr("class").split(" ")[2];

		picker.attr("row", id);
		picker.css("top", e.clientY + "px");
		picker.css("left", e.clientX + "px");

		$("body").append(picker);

		var colorBox = $(this);

		var clickHandler = function(e) {
			if (id in items) {
				try {
					items[id].material.color = new THREE.Color($(this).attr("hex"));
				} catch (err) {
					items[id].children[0].material.color = new THREE.Color($(this).attr("hex"));
				}
			}

			colors[id] = $(this).attr("hex");
			colorBox.css("background", $(this).attr("hex"));
			renderer.render(scene, camera);
			$("#color-picker").remove();
		};

		$(".color").click(clickHandler);
	});
}

createRow("parametric", 0);

$("#new-row-button").click(function(e) {
	$("#new-dropdown").remove();

	var dropdown = $(`<div id="new-dropdown">
        <p id="dropdown-equation" class="new-dropdown-option">Equation</p>
        <p id="dropdown-parametric" class="new-dropdown-option">Parametric</p>
		<p id="dropdown-point" class="new-dropdown-option">Point</p>
    </div>`);

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

	$("#dropdown-point").click(function() {
		$("#new-dropdown").remove();
		createRow("point", $("#sidebar").children().length - 2);
	});
});

$("#screenshot").click(function(e) {
	window.open(renderer.domElement.toDataURL("image/png"));
});
