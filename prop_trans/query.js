
var data = d3.map();
data.set('latconst', new Array());
data.set('cohen', new Array());
data.set('bulkmod', new Array());

for (var i=0; i<100; i++){
	if(i%20){
		var source = 'tr';
	} else {
		var source = 'rd';		
	}

	data.get('latconst').push({
		y: gR(0,10),
		source: source, 
		id: 'latconst_ ' + i
	})
	data.get('cohen').push({
		y: gR(10,40),
		source: source, 
		id: 'cohen_ ' + i
	})	
	data.get('bulkmod').push({
		y: gR(200,1000),
		source: source, 
		id: 'bulkmod_ ' + i
	})
}

/*// Do some magic to come up with a list of properties

var uri = "https://datalog-search.openkim.org/api/query";

[:find ?test  :where
  [?e :test-result.test-extended-id ?test]
  [?e :test-result.model-extended-id "model_Cu_PF_Johnson__MO_532418735376_000"]]
  */

function gR(min, max) {
  return Math.random() * (max - min) + min;
}