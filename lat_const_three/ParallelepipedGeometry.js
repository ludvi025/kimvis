// -- Parallelepiped Class for Drawing Unit Cells

// Sort-of-a-class Constructor Function
function Parapipe (a,b,c,alpha,beta,gamma) {
	var geo = new THREE.Geometry;

	// ToDo: Compute vertices given a,b,c,alpha,beta,gamma

	alpha = THREE.Math.degToRad(alpha);
	beta = THREE.Math.degToRad(beta);
	gamma = THREE.Math.degToRad(gamma);


	var h = c * Math.sqrt( 1 - Math.cos(alpha) * Math.cos(alpha) - Math.cos(beta)*Math.cos(beta)*Math.sin(gamma)*Math.sin(gamma));

	geo.vertices.push( new THREE.Vector3( 0,  0, 0 ) );	// 0
	geo.vertices.push( new THREE.Vector3( b*Math.cos(gamma), b*Math.sin(gamma), 0 ) );		// 1
	geo.vertices.push( new THREE.Vector3( a + b*Math.cos(gamma), b*Math.sin(gamma), 0 ) );		// 2
	geo.vertices.push( new THREE.Vector3( a,  0, 0 ) );		// 3
	geo.vertices.push( new THREE.Vector3( c * Math.cos(alpha), c * Math.cos(beta)*Math.sin(gamma), h ) );		// 4
	geo.vertices.push( new THREE.Vector3( c * Math.cos(alpha) + b * Math.cos(gamma), c * Math.cos(beta)*Math.sin(gamma) + b*Math.sin(gamma), h ) );		// 5
	geo.vertices.push( new THREE.Vector3( c * Math.cos(alpha) + b*Math.cos(gamma) + a,  c * Math.cos(beta)*Math.sin(gamma) + b*Math.sin(gamma), h ) );		// 6
	geo.vertices.push( new THREE.Vector3( c * Math.cos(alpha) + a, c * Math.cos(beta)*Math.sin(gamma), h ) ); 		// 7

	// Vertices order is important, must be counter clockwise (RHR)
	geo.faces.push( new THREE.Face4( 0,1,2,3 ) );
	geo.faces.push( new THREE.Face4( 0,3,7,4 ) );
	geo.faces.push( new THREE.Face4( 7,6,5,4 ) );
	geo.faces.push( new THREE.Face4( 1,5,6,2 ) );
	geo.faces.push( new THREE.Face4( 2,6,7,3 ) );
	geo.faces.push( new THREE.Face4( 0,4,5,1 ) );

	geo.computeCentroids();
	geo.mergeVertices();
	geo.computeFaceNormals();

	return geo;

};