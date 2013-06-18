/* $kimobj = {
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


function objToCIS($kimobj){
	return Mustache.render("data_global \n _cell_length_a {{a}}  \n _cell_length_b {{b}} \n _cell_length_c {{c}} \n _cell_angle_alpha {{alpha}} \n _cell_angle_beta {{beta}} \n _cell_angle_gamma {{gamma}} \n _symmetry_space_group_name_H-M \'{{spacegroup}}' \n loop_ \n _atom_site_label \n _atom_site_symmetry_multiplicity \n _atom_site_Wyckoff_symbol \n _atom_site_fract_x \n _atom_site_fract_y \n _atom_site_fract_z {{#wyckoff_sites}} \n {{species}} {{code_number}} {{code_letter}} {{fract_x}} {{fract_y}} {{fract_z}} {{/wyckoff_sites}} ", $kimobj);
}

function objToCISs($kimobj){
	return Mustache.render("data_global \n _cell_length_a {{a}}  \n _cell_length_b {{b}} \n _cell_length_c {{c}} \n _cell_angle_alpha {{alpha}} \n _cell_angle_beta {{beta}} \n _cell_angle_gamma {{gamma}} \n _symmetry_space_group_name_H-M \'{{spacegroup}}' \n loop_ \n _atom_site_label \n _atom_site_symmetry_multiplicity \n _atom_site_Wyckoff_symbol \n _atom_site_fract_x \n _atom_site_fract_y \n _atom_site_fract_z  \n {{species}} {{code_number}} {{code_letter}} {{fract_x}} {{fract_y}} {{fract_z}}  ", $kimobj);
}

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

// Use to preserve data object if modifying
function deepCopy(old){
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