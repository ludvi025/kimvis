
function isReady(applet) {
	console.log('JSmol is ready.');
}		
function buildDataStruct(arr,keys,id_arr){

		//console.log(id_arr);
	var tempObjArray = [];
	// Construct array of objects from arr using keys
	for (var i = 0; i<arr.length; i++) {
	    tempObjArray.push({});
		for (var j = 0; j<arr[i].length; j++){
			tempObjArray[i][keys[j]]=arr[i][j];
	    }
		// Add an id which is a concatenation of the members corresponding to the array of strings passed in id_arr
		tempObjArray[i].id = "";
		for (var j = 0; j<id_arr.length; j++){
			tempObjArray[i].id += tempObjArray[i][id_arr[j]];
			if (j!=id_arr.length-1) tempObjArray[i].id += ', ';
		}
	}
	
	var objMap = d3.map();

	for (var i = 0; i< tempObjArray.length; i++){
		if (objMap.has(tempObjArray[i].id)){
			// converting to array 
			for (var j = 0; j<keys.length; j++){
				var unique = true;
				var tempObj=objMap.get(tempObjArray[i].id);
				if (tempObj[keys[j]] instanceof Array){
					for (var k = 0; k<tempObj[keys[j]].length; k++){
						if ( tempObj[keys[j]][k] == tempObjArray[i][keys[j]] ) {
							unique = false;
						}
					}
					if (unique) tempObj[keys[j]].push(tempObjArray[i][keys[j]]);
				}
				else{
					if ( tempObj[keys[j]] != tempObjArray[i][keys[j]] ){
						var temp = tempObj[keys[j]];
						tempObj[keys[j]] = [];
						tempObj[keys[j]].push(temp);
						tempObj[keys[j]].push(tempObjArray[i][keys[j]]);
					}
				}
			}
		}
		else {
			objMap.set(tempObjArray[i].id, tempObjArray[i]);
		}
	
	}
	
	return	objMap;
}

function addWyckoffToMap(arr,datamap,keys, id_arr){ // Wyckoff sites are different than the rest of the data because there can be duplicates of the same value which can't be thrown out (can't check and see if there is already an Al atom, since there can be more than one Wyckoff site).
	//console.log(id_arr);
	var tempObjArray = [];
	// Construct array of objects from arr using keys
	for (var i = 0; i<arr.length; i++) {
	    tempObjArray.push({});
		for (var j = 0; j<arr[i].length; j++){
			tempObjArray[i][keys[j]]=arr[i][j];
	    }
		// Add an id which is a concatenation of the members corresponding to the array of strings passed in id_arr
		tempObjArray[i].id = "";
		for (var j = 0; j<id_arr.length; j++){
			tempObjArray[i].id += tempObjArray[i][id_arr[j]];
			if (j!=id_arr.length-1) tempObjArray[i].id += ', ';
		}
	}
	// These objects correspond to Wyckoff Sites, so push onto the Wyckoff site array
	for (var i = 0; i<tempObjArray.length; i++) {
		var tempObj = datamap.get(tempObjArray[i].id); // Get the object from the already constructed map with the same id as this wyckoff site object
		if(!tempObj.wyckoff_sites){ // Check to see if the array exists yet
			tempObj.wyckoff_sites = new Array();
		}
		tempObj.wyckoff_sites.push(tempObjArray[i]); // Add this wyckoff site object to the array
	}
}


function drawAtoms(){
	var selected = query_result.get(d3.select("#structure_select").property("value"));
	for (var i = 0; i<selected.wyckoff_sites.length; i++){
		selected.wyckoff_sites[i].code_number = selected.wyckoff_sites[i].code[0];
		selected.wyckoff_sites[i].code_letter = selected.wyckoff_sites[i].code[1];
	}
	if (selected.units == 'nm'){
		selected.a *= 10;
		selected.b *= 10;
		selected.c *= 10;
		selected.units = 'A';
	}
	cis = objToCIS(selected);
	var loadscript = 'set antialiasDisplay; load INLINE "' + cis + '" {2 2 2}';
	Jmol.script(jmolApplet0, loadscript);
}

function objToCIS(kimobj){
// Uses mustache to generate a CIF file from the given information
/* kimobj = {
	a : <float>
	b : <float>
	c : <float>
	alpha : <float>
	beta : <float>
	gamma : <float>
	spacegroup : <string>
	wyckoff_sites : [
	{
		species : <string>
		code_number : <string>
		code_letter : <string>
		fract-x : <float>
		fract-y : <float>
		fract-z : <float>
	}, ... ]
} */
	for (var i = 0; i<kimobj.wyckoff_sites.length; i++){
		kimobj.wyckoff_sites[i].code_number = kimobj.wyckoff_sites[i].code[0];
		kimobj.wyckoff_sites[i].code_letter = kimobj.wyckoff_sites[i].code[1];
	}
	var temp = Mustache.render("data_global \n _cell_length_a {{a}}  \n _cell_length_b {{b}} \n _cell_length_c {{c}} \n _cell_angle_alpha {{alpha}} \n _cell_angle_beta {{beta}} \n _cell_angle_gamma {{gamma}} \n _symmetry_space_group_name_H-M \'{{spacegroup}}' \n loop_ \n _atom_site_label \n _atom_site_symmetry_multiplicity \n _atom_site_Wyckoff_symbol \n _atom_site_fract_x \n _atom_site_fract_y \n _atom_site_fract_z {{#wyckoff_sites}} \n {{species}} {{code_number}} {{code_letter}} {{fract_x}} {{fract_y}} {{fract_z}} {{/wyckoff_sites}} \n loop_ \n _space_group_symop_operation_xyz \n", kimobj);
	temp += spaceToSym(kimobj.spacegroup);
	return temp;
	
}

function deepCopy(old){
// Use to preserve data object if modifying
	if (Array.isArray(old)){
		var newthing = [];
		for (var i = 0; i< old.length; i++){
			newthing.push(jQuery.extend(true, {}, old[i]));
			}
		}
	else {
		var newthing = jQuery.extend(true, {}, old);
	}
	return newthing;
}


// -- Filters -- \\

function filterButtonClick(filter, multi_id){
	var box = d3.select('#' + filter.getFilter(multi_id).div + '_div');
	if (multi_id){
		if (box.empty()){
			filter.getFilter(multi_id).addSelectionOptions();
		} else {
			filter.updateSelections();
			filter.updateOptions();
			filter.getFilter(multi_id).removeSelectionBox();
		} 
	} 
}

function formatRes(item) {
	var d = item.element[0]['__data__'];
	var id = d.id.replace(',', '<br>');
	if (d.species instanceof Array) {
		var species = d.species.join();
	} else {
		var species = d.species;
	}

	if (d.shortname instanceof Array) {
		var shortname = d.shortname.join();
	} else {
		var shortname = d.shortname;
	}
	var spacegroup = d.spacegroup;
	return '<table id="optstab"><tr><b>' + id + '</b></tr> \
	<tr><td>Spacegroup:</td><td>' + spacegroup + '</td></tr>\
	<tr><td>Atoms:</td><td>' + species + '</td></tr>\
	<tr><td>Shortnames:</td><td>' + shortname + '</td></tr>\
	</table>';
}

function formatSel(item){
	var d = item.element[0]['__data__'];
    return d.id;
}

function addStructs(){
	d3.select("#structure_select").selectAll("option").remove();
	d3.select("#structure_select").selectAll("option").data(query_result.values().filter(function(d){
		return filters.isSelected(d);
	})).enter()
		.append("option")
			.property("value", function(d){return d.id;})
			.text(function(d){return d.id;});

	$('#structure_select').select2({		// turn our boring selection box into a useful one
		placeholder: 'Select a set to filter on.',
		allowClear: true,
		formatResult: formatRes,
		formatSelection: formatSel,
		escapeMarkup: function(m) { return m; },
		closeOnSelect: false
	});
}