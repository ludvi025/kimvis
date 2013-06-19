// Called to update the plot
function submitOptions(){

	// Construct options object using d3 to access the html form
	options = {
		title : '',
		y: 'Cohesive-Energy',
		x: 'Atoms',
		labels : d3.select('#labels').property('value'),
		errorbar: '',
		yerr:'',
		xerr: '',
		xaxis: 'Atoms',
		yaxis: 'Equilibrium Cohesive Energy' + ' ( ' + d3.select('#cohen-units').property('value') + ' )', 
		xunits: '',
		yunits: d3.select('#cohen-units').property('value'),
		width: Number($('#kimvis').css('width').slice(0,-2)),
		height: window.innerHeight-80,
		margin: { top: 20, right: 40, bottom: 80, left: 50},
	}

	// Create a copy of the data so multiple queries can be avoided, need to do a deep copy to avoid copying references
	var data = deepCopy(query_result);

	// Filtering info in form
	var rdtr = d3.select('#rd-tr').property('value');
	var range = [ Number(d3.select('#y_min').property('value')), Number(d3.select('#y_max').property('value')) ];

	// Filter the data 
	data = data.filter(function(d){
		var keep = true;

		if (!filters.isSelected(d)){	//Checks to see if an item belongs in the graph based on an indeterminate amount of filters in one line. I'm sort of proud of this. 
			keep = false;
		}
		
		// Filtering for reference data / test result
		if ( rdtr != 'b' ){
			if ( d['source'] != rdtr ){
				keep = false;
			}
		}
		
		if (options.yunits == 'kJ/mol'){ // Dirty unit conversion
			d['Cohesive-Energy']*=96.4853;
		}
		
		return keep;
	});

	// Keep reference data only for models
	if (modelFilter.selection.values().length != 0){
		var tempAt = d3.set();
		filters.getFilter('at').selection.forEach(function(e){
			tempAt.add(e);
		});
		var tempSg = d3.set();
		filters.getFilter('sg').selection.forEach(function(e){
			tempSg.add(e);
		});
		var tempSn = d3.set();
		filters.getFilter('sn').selection.forEach(function(e){
			tempSn.add(e);
		});
		filters.getFilter('at').selection = filters.getFilter('at').getIntersection(modelFilter);
		filters.getFilter('sg').selection = filters.getFilter('sg').getIntersection(modelFilter);
		filters.getFilter('sn').selection = filters.getFilter('sn').getIntersection(modelFilter);
		data = data.filter(function(d){
			return filters.isSelected(d);
		})
		filters.getFilter('at').options = filters.getFilter('at').selection;
		filters.getFilter('sg').options = filters.getFilter('sg').selection;
		filters.getFilter('sn').options = filters.getFilter('sn').selection;
		filters.getFilter('at').selection = tempAt;
		filters.getFilter('sg').selection = tempSg;
		filters.getFilter('sn').selection = tempSn;	
	}


	// If the plot already exists, update it, otherwise create it
	if (plot){
		plot.update(data, options);
		plot.draw();
		addInteraction();
	} else {
		plot = new scatterPlotOrdinal(data, options);

		plot.draw();
		// Add Interaction
		plot.svg
			.on('mousedown', mouseDown)
			.on('mouseup', mouseUp)
			.on('mousemove', mouseMove);
		addInteraction();	
	}
}

//==== Interaction ====\\

// -- Buttons -- \\

function selectRangeDown(){

	if (select_range_down){
		d3.select('#select_range_button').attr('src', './icons/select_range_up.png');
		select_range_down = null;
	}
	else{
		d3.select('#select_range_button').attr('src', './icons/select_range_down.png');
		select_range_down = true;
		if (zoom_box_down){
			d3.select('#zoom_box_button').attr('src', './icons/zoom_box_up.png');
			zoom_box_down = null;
		}
	}
}

function zoomBoxDown(){

	if (zoom_box_down){
		d3.select('#zoom_box_button').attr('src', './icons/zoom_box_up.png');
		zoom_box_down = null;
	}
	else{
		d3.select('#zoom_box_button').attr('src', './icons/zoom_box_down.png');
		zoom_box_down = true;

		if (panning_down){
			d3.select('#panning_button').attr('src', './icons/pan_up.png');
			panning_down = null;
		}
	}
}

function zoomOutDown(){
	plot.zoomOut();
	addInteraction();
}

function panBoxDown(){

	if (panning_down){
		d3.select('#panning_button').attr('src', './icons/pan_up.png');
		panning_down = null;
	}
	else{
		d3.select('#panning_button').attr('src', './icons/pan_down.png');
		panning_down = true;

		if (zoom_box_down){
			d3.select('#zoom_box_button').attr('src', './icons/zoom_box_up.png');
			zoom_box_down = null;
		}
	}
}

function inspectDown(){

	if (inspect_down){
		d3.select('#inspect_button').attr('src', './icons/inspect_up.png');
		inspect_down = false;

	}
	else{
		d3.select('#inspect_button').attr('src', './icons/inspect_down.png');
		inspect_down = true;

	}
}

function helpDown(){
	if (d3.select('#help_box').style('visibility') == 'hidden'){
		d3.select('#help_box').style('visibility','visible');
		d3.select('#help_button').attr('src', './icons/help_down.png');
	}
	else {
	d3.select('#help_box').style('visibility','hidden');
	d3.select('#help_button').attr('src', './icons/help_up.png');
	}
}

function toggleMenuOptions(name){
	$('#' +name+'_div').animate({height: 'toggle'},'fast', 'linear');
	if (d3.select('#' +name + '_button').attr('down') == 'true'){
		d3.select('#' +name + '_button').attr('src', './icons/' + name + '_up.png');
		d3.select('#' +name + '_button').attr('down','false');
	}
	else{
		d3.select('#' +name + '_button').attr('src', './icons/'+ name + '_down.png');
		d3.select('#' +name + '_button').attr('down','true');
	}
}

function resetFilters(){
	filters.resetAll();
	modelFilter.reset();
	d3.select('#y_min').property('value', '');
	d3.select('#y_max').property('value', '');
	d3.select('#rd-tr').property('value', 'b');
	submitOptions();
}

function resetDown(){
	// Resets the plot to its original state
	d3.select('#labels').property('value', '');

	resetFilters();
	modelFilter.reset();

	plot = undefined;

	submitOptions();
}

// -- Plot interaction -- \\

function mouseDown(){	
	if (!inspect_down){
		if (zoom_box_down){
			// Start drawing a zoom box
			var loc = d3.mouse(this);
			plot.svg.append('line')
				.attr('id', 'zoom_box_left')
				.attr('class', 'select_line')
				.attr('x1', loc[0])
				.attr('y1', loc[1])
				.attr('x2', loc[0])
				.attr('y2', loc[1]);
			plot.svg.append('line')
				.attr('id', 'zoom_box_top')
				.attr('class', 'select_line')
				.attr('x1', loc[0])
				.attr('y1', loc[1])
				.attr('x2', loc[0])
				.attr('y2', loc[1]);
			plot.svg.append('line')
				.attr('id', 'zoom_box_right')
				.attr('class', 'select_line')
				.attr('x1', loc[0])
				.attr('y1', loc[1])
				.attr('x2', loc[0])
				.attr('y2', loc[1]);
			plot.svg.append('line')
				.attr('id', 'zoom_box_bot')
				.attr('class', 'select_line')
				.attr('x1', loc[0])
				.attr('y1', loc[1])
				.attr('x2', loc[0])
				.attr('y2', loc[1]);
		}
	}
	if (panning_down){
		panning = true;
		plot.panStart(this);
	}
}

function mouseMove(){
	if (zoom_box_down){
		// Update the zoom box
		var left = d3.select('#zoom_box_left');
		var top = d3.select('#zoom_box_top');
		var right = d3.select('#zoom_box_right');
		var bot = d3.select('#zoom_box_bot');
		if (!left.empty()){
			var loc = d3.mouse(this);
			left.attr('y2', loc[1]);
			top.attr('x2', loc[0]);
			bot.attr('y1', loc[1]).attr('y2', loc[1]).attr('x2', loc[0]);
			right.attr('x1', loc[0]).attr('x2', loc[0]).attr('y1', loc[1]);	
		}
	}

	// Change the cursor depending on the tool being used
	if (inspect_down) {
		plot.svg.style('cursor', 'help');
	} else if (zoom_box_down){
		plot.svg.style('cursor', 'crosshair');
	} else if (panning_down){
		plot.svg.style('cursor', 'move');
	} else {
		plot.svg.style('cursor', 'default');
	}

	if(panning){
		plot.pan(this);
		addInteraction();
	}
}
	
function mouseUp(){
	if (zoom_box_down){

		// Get the position of the mouse and the zoom box lines
		var loc = d3.mouse(this);	
		var yRange = d3.select('#zoom_box_left');
		var xRange = d3.select('#zoom_box_top');
		
		// Get the zooming boundaries
		var y_min = plot.yScale.invert(Number(yRange.attr('y1'))-plot.margin.top);
		var y_max = plot.yScale.invert(Number(yRange.attr('y2'))-plot.margin.top);
		var x_min = Number(xRange.attr('x1')) - plot.options.margin.left;
		var x_max = Number(xRange.attr('x2')) - plot.options.margin.left;

		// Remove the zoom box
		d3.selectAll('.select_line').remove();

		// Swap the values if they're backwards (if the user did a right to left drag)
		if (y_min > y_max){
			var temp = y_min;
			y_min = y_max;
			y_max = temp;
		}
		if (x_min > x_max){
			var temp = x_min;
			x_min = x_max;
			x_max = temp;
		}

		// Zoom the plot in
		plot.zoom([x_min, x_max], [y_min,y_max]);
		
		// Add interaction back to the dots
		addInteraction();
	}

	if (panning){
		panning = false;
		plot.panStop();
	}

}

// Data Points

function addInteraction(){
	// Interaction with data points
	plot.dots		
		.on('mouseout', dataMouseOut)
		.on('mouseover', dataMouseOver)
		.on('mousedown', dataMouseOn)
		.on('dblclick', radialView);
}

function dataMouseOn(d){
	if(inspect_down) {
		var temp = '<center><h2>Data Point Information<br/></h2></center><hr>';
		for (i in d)
			temp += '<b>' + i + '</b>' + ': ' + d[i] + '<br/>'; 

		var div = d3.select('body')
			.append('div').attr('class', 'dataInfo');
		div.append('p')
			.attr('class', 'dataInfoP')
			.html(temp)
		.append('input')
			.attr('type', 'button')
			.property('value', 'Close')
			.on('mousedown', function(d){ d3.select(this.parentNode).remove()});
		$(div[0]).draggable();
	}
}

function dataMouseOver(d) {
	var thisG = d3.select(this);
	var thisDot = d3.select(this).select('circle');
	thisDot
		.attr('save_color', d3.select(this).style('fill'))
		.style('fill', '#000');
	thisG.select('text').style('opacity',1);
} 		

function dataMouseOut(d){
	var thisG = d3.select(this);
	var thisDot = d3.select(this).select('circle');
	thisDot.style('fill', d3.select(this).attr('datacolor'));
	thisG.select('text').style('opacity',0.3);
}


// Radial distributes all points on the graph if they're too close to interact with
function radialView(d){
	if (radial_open){
		radial_open = false;
		d3.selectAll('.radiated').attr('transform', function (d){
			return 'translate(' + d3.select(this).attr('x') + ',' + d3.select(this).attr('y') + ')'; 
		})
		.attr('class', 'dot');
		d3.selectAll('.radial').remove();
		d3.select('.radial_area').remove();
		
	} else {
		radial_open = true;
		var thisG = d3.select(this);
		var thisDot = d3.select(this).select('circle');

		if (d3.select('.radial_area').empty()){	

			// Get all nearby dots
			var nearbyDots = d3.selectAll('.dot').filter(function(d){
				var otherG = d3.select(this);
				return  (((Math.abs(thisG.attr('y') - otherG.attr('y')) < 7) && (Math.abs(thisG.attr('x') - otherG.attr('x')) < 7)) && (otherG[0][0]!=thisG[0][0]) );
				});

			if (!nearbyDots.empty()){
				// Allow moving between expanded dots without distribution closing
				thisG.append('circle')      
					.attr('r', 25)
					.attr('class', 'radial_area');
				
				// Compute separation angle
				var delta = 2*Math.PI/nearbyDots[0].length;

				// Move hidden dots outward
				nearbyDots.attr('transform', function(d,i){
					var r = 20;
					var dx = Number(thisG.attr('x'))+r*Math.cos(i*delta+Math.PI/16);
					var dy = Number(thisG.attr('y'))+r*Math.sin(i*delta+Math.PI/16);
					d3.select(this).attr('dx', r*Math.cos(i*delta)).attr('dy', r*Math.sin(i*delta));
					return 'translate(' + dx + ',' + dy + ')'; 
					})
					.attr('class', 'dot radiated');
				
				// Bring blocked dots forward
				for(var i = 0; i< nearbyDots[0].length; i++){
					$(nearbyDots[0][i].parentNode).append(nearbyDots[0][i]);
				}
				$(thisDot[0][0].parentNode).append(thisDot[0][0]);
				
				// Connect outer dots to original location
				nearbyDots.append('line')
					.attr('x1', 0)
					.attr('y1', 0)
					.attr('y2', function(d){ return -d3.select(this.parentNode).attr('dy');})
					.attr('x2', function(d){ return -d3.select(this.parentNode).attr('dx'); })
					.attr('class', 'radial');
			}
		}
	}
	
}

// -- Filters -- \\

function filterButtonClick(filter, multi_id){
	if (multi_id){
	var box = d3.select('#' + filter.getFilter(multi_id).div + '_div');	
		if (box.empty()){
			filter.getFilter(multi_id).addSelectionOptions();

		} else {
			filter.updateSelections();
			filter.updateOptions();
			filter.getFilter(multi_id).removeSelectionBox();
			submitOptions();
		} 
	} else {
		var box = d3.select('#' + filter.div + '_div');
		if (box.empty()){
			filter.addSelectionOptions();
		} else {
			filter.updateSelection();
			filter.removeSelectionBox();	
			filters.updateOptions();		
			submitOptions();
		}
	}
}

function filterSelectAll(filter, multi_id){
	if(multi_id){
		filter.getFilter(multi_id).selectAll();
		var box = d3.select('#' + filter.getFilter(multi_id).div + '_div');
		if(box.empty()){
			filter.updateSelections();
			filter.updateOptions();
			submitOptions();
		}
	} else {
		filter.selectAll();
		filters.updateSelections(); // Bad!!! Filters isn't guaranteed to exist!
		filters.updateOptions();
		submitOptions();
	}
	
}
function filterClear(filter, multi_id){
	if(multi_id){
		filter.getFilter(multi_id).clearSelection();
		var box = d3.select('#' + filter.getFilter(multi_id).div + '_div');
		if(box.empty()){
			filter.updateSelections();
			filter.updateOptions();
			submitOptions();
		}
	} else {
		filter.clearSelection();
		filters.updateSelections(); // Bad!!! Filters isn't guaranteed to exist!
		filters.updateOptions();
		submitOptions();
	}
}


// == Datastructure == \\

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

// Use to preserve data object if modifying
function deepCopy(old){
	if (old instanceof Array){
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

// Load data passed through get
function getArgPassed(variable) {
    var query = window.location.search.substring(1);
    console.log(query);
    var vars = query.split('&');
    console.log(vars);
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        console.log(pair);
        if (pair[0] == variable) {
        	console.log(pair[1].split(','));
            return pair[1].split(',');
        }
    }
    return false;
}