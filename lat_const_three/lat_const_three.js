 var data; 
 var pointLight;

function drawScene(error, result){
	if (error) console.warn('Error in query being sent.');

	var width = 10000;


	// Clean data and build structure
	 data = QRtoObject(result, keys);

	for (var i = 0; i<data.length; i++){
		if (data[i]['b'] == '') data[i]['b'] = data[i]['a'];
		if (data[i]['c'] == '') data[i]['c'] = data[i]['b'];
		if (data[i]['units'] == 'nm') {
			data[i]['a'] *= 10;
			data[i]['b'] *= 10;
			data[i]['c'] *= 10;
		}
	}	

	// Construct ordinal scale for laying out the unit cells
	var xDomain = d3.set(); // Ordinal scale, so the domain has to have all values possible
	for (var i = 0; i<data.length; i++){
		xDomain.add(data[i]['atom']);
	}
	xDomain = xDomain.values();

	var xScale = d3.scale.ordinal()
		.domain(xDomain)
		.rangePoints([0,width], 3);
	
	var scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 10, 10000); // (field of view, aspect ratio, nearest rendering, farthest rendering)
	
	// Choose WebGL if supported, default to Canvas which is more supported
	if(window.WebGLRenderingContext){
		var renderer = new THREE.WebGLRenderer(); // Multiple renderers, but WebGL is fastest
	}
	else {
		var renderer = new THREE.CanvasRenderer();
	}

	renderer.setSize( window.innerWidth, window.innerHeight); // changes the resolution, not the size of the window its viewed in
	document.body.appendChild(renderer.domElement); // Add to document
	
	var material =  new THREE.MeshLambertMaterial( {color: 0x0066ff }); 
	var meshes = [];
	var stack = d3.map();
	
	d3.select('body').selectAll('div').data(data).enter().append('div').each(function(d){
		console.log(d);
		var geo =  Parapipe(d['a']*10,d['b']*10,d['c']*10,d['alpha'],d['beta'],d['gamma']);
		var mesh = new THREE.Mesh( geo, material );
		mesh.position.y = xScale(d['atom']);
		if (stack.has(d['atom'])) {
			stack.set(d['atom'], stack.get(d['atom'])+100);
		}
		else {
			stack.set(d['atom'], 0);
		}
		mesh.position.x = stack.get(d['atom']);
		mesh.position.z = 0;
		meshes.push(mesh);
	});
	d3.selectAll('div').remove();

	var textmaterial =  new THREE.MeshLambertMaterial( {color: 0xcccccc }); 

	d3.select('body').selectAll('div').data(xDomain).enter().append('div').each(function(d){

		var textgeo= new THREE.TextGeometry( d, {

			size: 30,
			height: 15,
			curveSegments: 2,
			font: "helvetiker"

		});

		var text = new THREE.Mesh(textgeo, textmaterial);
		textgeo.computeBoundingBox();
		text.position.y = xScale(d) + textgeo.boundingBox.max.x;
		text.position.x = -100;
		text.rotation.z = -Math.PI;
		scene.add(text);
	});

	var floor = new THREE.Mesh( new THREE.CubeGeometry(10000,10,10000), material );

	console.log(meshes);
	console.log(stack);
	
	camera.position.x = -300;
	camera.position.z = 500;
	camera.position.y = 5000;
	camera.lookAt(new THREE.Vector3(500, 5000, 0));

	camera.rotation.z = -Math.PI/2;


	for (var i = 0; i<meshes.length; i++){
		scene.add(meshes[i]);
	}

	// create a point light
	pointLight = new THREE.PointLight( 0xFFFFFF );

	// set its position
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 300;

	// add to the scene
	scene.add(pointLight);
	
	d3.select("body")
	    .on("keydown", function() {
			if( d3.event.keyCode == 37 ) camera.position.y+=100;
			if( d3.event.keyCode == 39 ) camera.position.y-=100;
			if( d3.event.keyCode == 38 ) {
	       		camera.position.x+=100;
	       		camera.position.z+=50;

	       	}
			if( d3.event.keyCode == 40 ) {
	       		camera.position.x-=100;
	       		camera.position.z-=50;

	       	}
	    });


	function render(){ // Render loop ??Where's the "loop"??
		requestAnimationFrame(render);
		//meshes[0].rotation.z += 0.01;
		//meshes[0].position.z = 100;
/*		camera.position.z += 1*camera.position.x/80;
		if (camera.position.x < 600){
			camera.position.x+=1;
		}
		if (camera.position.z > 10000){
			camera.position.z = 0;
			camera.position.x = 0;
		}*/
	//	console.log(camera.position.z);
		renderer.render(scene, camera);
		pointLight.position = camera.position;
	}
	render();
	

}
	
// == Datastructure == \\

function QRtoObject(query_result,keys){

	temp = [];
	for (var i = 0; i<query_result.length; i++) {
	    temp.push({});
		for (var j = 0; j<query_result[i].length; j++){
			temp[i][keys[j]]=query_result[i][j];
	    }
	}
	return temp;
};