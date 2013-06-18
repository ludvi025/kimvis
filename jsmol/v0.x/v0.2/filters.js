// Filtering Tools

function ignoreCaseSort(a,b){
	if (a.toLowerCase() < b.toLowerCase()) return -1;
    if (a.toLowerCase() > b.toLowerCase()) return 1;
    return 0;
}

function inRange(item, range){
	var keep = true;
	if (range[0]){
		if (range[1]){
			if (!( Number(item) <= range[1] && Number(item) >= range[0] )){
				keep = false;
			}
		}
		else if (!(Number(item) >= range[0])){
			keep = false;
		}
	}
	else if (range[1]){
		if (!(Number(item) <= range[1])){
			keep = false;
		}
	}

	return keep;
}

function inSet(item, set){
	var keep = false;
	if (item instanceof Array){
		if (set.has(item.join())){
			keep = true;
		}
	}
	else if (set.has(item)){
		keep = true;
	}
	return keep;
}

// == Filter Object == \\

// Constructor
function filter(data, key, div, dataIsArray){
	// Root name of html elements
	this.div = div;

	// Original set of options	
	this.all = d3.set();
	// Narrowed down options
	this.options = d3.set();	
	// Selected options
	this.selection = d3.set();	

	this.dataIsArray = dataIsArray;

	// Data to be filtered
	this.data = data;

	// Key for accessing the data
	this.key = key;

	// Initialize the set of original options	
	this.setAll();
}

filter.prototype.selectAll = function(){
	var selection = d3.set()
	this.options.forEach(function(val){ selection.add(val)});
	this.selection = selection;
	this.updateSelectionBox();
}

filter.prototype.clearSelection = function(){
	this.selection = d3.set();
	this.updateSelectionBox();
}

filter.prototype.clearOptions = function(){
	this.options = d3.set();
	this.updateSelectionBox();
}

filter.prototype.addOption = function(item){

	if (this.dataIsArray){
		if (item instanceof Array){
			for (var j = 0; j<item.length; j++){
				this.options.add(item[j]);
			}
		} else {
			this.options.add(item);
		}
	} else {
		if (item instanceof Array){
			this.options.add(item.join());	
		} else {
			this.options.add(item);
		}		
	}
}

filter.prototype.setAll = function(){
	// Build set from an array of objects
	if (this.dataIsArray){
		for (var i=0; i<this.data.length; i++){
			if (this.data[i][this.key] instanceof Array){
				for (var j = 0; j<this.data[i][this.key].length; j++){
					this.all.add(this.data[i][this.key][j]);
				}

			} else {
				this.all.add(this.data[i][this.key]);
			}

		}
	} else {
		for (var i=0; i<this.data.length; i++){
			if (this.data[i][this.key] instanceof Array){
				this.all.add(this.data[i][this.key].join());
			} else {
				this.all.add(this.data[i][this.key]);
			}
		}
	}
	var options = this.options;
	this.options.forEach(function(val){ options.remove(val) } );
	this.all.forEach(function(val){ options.add(val) }); 
}

filter.prototype.reset = function(){
	var selection = this.selection;
	var options = this.options;
	this.selection.forEach(function(val){ selection.remove(val) } );
	this.options.forEach(function(val){ options.remove(val) } );
	this.all.forEach(function(val){ options.add(val) }); 
	this.updateSelectionBox();
}

filter.prototype.isSelected = function(item){
	if (this.selection.values().length == 0) {
		var setToUse = 'all';
	} else {
		var setToUse = 'selection';
	}
	if (this.dataIsArray && item instanceof Array){
		var keep = false;
		for (var i = 0; i<item.length; i++){
			if (inSet(item[i], this[setToUse])){
				keep = true;
			}
		}
		return keep;
	} else if (inSet(item, this[setToUse])){
		return true;
	} else {
		return false;
	}

}

filter.prototype.isOption = function(item){
	if (inSet(item, this.options))
		return true;
	else return false;
}

filter.prototype.noneSelected = function (){
	if (this.selection.values().length == 0) return true;
	else return false;
}

filter.prototype.updateSelection = function(){ 
	var options = d3.selectAll('.' + this.div);
	if (!options.empty()){ // There is a box
		var selected = options.filter(function(d){
			return d3.select(this).property('selected');
		});
		var selection_set = d3.set();
		selected.each(function(d){
			selection_set.add(d3.select(this).property('value'));
		});
		this.selection = selection_set;
	}
}

// Filter Box Methods
filter.prototype.addSelectionOptions = function(){
	// Use d3 to add an option to the selection menu for every value in 
	var locationToPut = $('#' + this.div + '_button').offset();
	locationToPut.left -= 65;
	locationToPut.top += 30;
	var div = d3.select('body').append('div').attr('id', this.div + '_div').attr('class', 'filterbox');
	var container = '#' + this.div + '_div';
	$(container).css(locationToPut);
	div.append('select')
		.attr('multiple', true)
		.attr('id', this.div)
		.selectAll('option').data(this.options.values().sort(ignoreCaseSort))
			.enter().append('option').attr('class', this.div)
				.property('value', function(d){ return d;})
				.property('selected', false)	
				.text(function(d){ return d;});
				
	var thisFilter = this; //Get rid of 'this' context since d3 replaces it when we use .each()
	if(this.selection.values().length != 0){
		d3.selectAll('.' + this.div)
			.filter(function(d) { return thisFilter.isSelected(d3.select(this).property('value')); }) // if the option is in the set of selected things,
			.property('selected', true);	// mark it as selected
	}
		
	$('#' + this.div).select2({		// turn our boring selection box into a nice one
		placeholder: 'Select a subset to filter on.',
		allowClear: true,
		closeOnSelect: false
		});
	$('#' + this.div + '_button').attr('value', 'Save');
}

filter.prototype.updateSelectionBox = function(){
	// If there is a box, remove it and call addSelectionOptions()
	var box = d3.select('#' + this.div + '_div');
	if (!box.empty()){
		box.remove();
		this.addSelectionOptions();
	}
}

filter.prototype.removeSelectionBox = function(){
	d3.select('#' + this.div + '_div').remove();
	$('#' + this.div + '_button').attr('value', 'Select');
}

// == Multi Filter Object == \\

function multiFilter(data){ // args == [ {filterName: <string>, filter: <filter>, data_key: <string>} ]
	this.filters = d3.map();
	this.data = data;
}

multiFilter.prototype.addFilter = function(id, key, div, dataIsArray){
	this.filters.set(id, new filter(this.data, key, div, dataIsArray));
}

multiFilter.prototype.isSelected = function(item){
	var keep = true;
	this.filters.forEach(function(id,filter){
		if (!filter.isSelected(item[filter.key])){
			keep = false;
		}
	});

	return keep;
}

multiFilter.prototype.getFilter = function(id) {
	return this.filters.get(id);
};

multiFilter.prototype.updateSelections = function() {
	this.filters.forEach(function(id, filter){
		filter.updateSelection();
	})
};

multiFilter.prototype.updateOptions = function(){
	this.clearOptions();
	for (var i = 0; i<this.data.length; i++){
		var datum = this.data[i];
		if (this.isSelected(datum)){
			this.filters.forEach(function(id,filter){
				filter.addOption(datum[filter.key]);
			});
		}
	}
}

multiFilter.prototype.clearOptions = function() {
	this.filters.forEach(function(id, filter){
		filter.clearOptions();
	})
};

multiFilter.prototype.resetAll = function(){
	this.filters.forEach(function (key, filter){
		filter.reset();
	});
}

multiFilter.prototype.selectAll = function(){
	this.filters.forEach(function (key, filter){
		filter.selectAll();
	});
}