
// == Ordinal Scatter Plot Object == \\

// -- Constructor -- //
function scatterPlotOrdinal(data, options){
/* 
	Requires: div element with id '#kimvis'
	Creates scatter plot of the data passed.
  	
  	scatterPlotOrdinal.dots : d3 selection of all the <g> elements containing data points
  	scatterPlotOrdinal.svg : d3 selection of <svg> element of graph, this is persistent between redraws
  	scatterPlotOrdinal.canvas : d3 selection of main <g> which contains the graph
  	scatterPlotOrdinal.xAxis(yAxis) : d3 axis objects
  	scatterPlotOrdinal.xAxisG(yAxisG) : d3 selection of axis <g>
  	etc.

Options = {
	-- Required --
x: <string>,
    // Key to use as x-axis
y: <string>,
    // Key to use as y-axis

	-- Labels --
title: <string>,
    // Displayed across top of graph
id: <string>,
    // Labels for each data point
xaxis: <string>,
    // Label for x-axis
yaxis: <string>,
    // Label for y-axis
	
	-- Error --
errorbar: <bool>,
    // 1- Display error bars (req. xerr and yerr)
    // 0- Don't display
xerr: [<string>,<string>],
    // Keys to use for min uncertainty and max uncertainty respectively
yerr: [<string>,<string>],
    // Keys to use for min uncertainty and max uncertainty respectively
	

	-- Size --
width: <int>,
height: <int>,
margin: { top: <int>, right: <int>, bottom: <int>, left: <int>}

}
*/ 
		
	// Remove anything that may be attached to the canvas
	d3.select('.plot').remove();
	
	// Copy the data so the source isn't modified
	this.data = deepCopy(data);
	this.options = options;	
	$('#kimvis').disableSelection()
	
	// Convert to numbers
	for (var i = 0; i<this.data.length; i++){
		this.data[i][options.y]=Number(this.data[i][options.y]);
	}
	
	// Setup width, height, margin
	if (options.margin) this.margin = options.margin;
	else this.margin = { top: 20, right: 15, bottom: 20, left: 25}; // Default
	
	if (options.width) this.width = options.width - this.margin.left - this.margin.right;
	else this.width = 800 - this.margin.left - this.margin.right;
	
	if (options.height) this.height = options.height - this.margin.top - this.margin.bottom;
	else this.height = 600 - this.margin.top - this.margin.bottom;
			
	// Setup the domains for the axes
	this.yDomain = [d3.min(this.data, function(d) { return d[options.y];}), d3.max(this.data, function(d) { return d[options.y];})];
	this.xDomain = d3.set(); // Ordinal scale, so the domain has to have all values possible
	for (var i = 0; i<this.data.length; i++){
		this.xDomain.add(this.data[i][options.x]);
	}
	this.xDomain = this.xDomain.values();
	this.xDomain.sort();	// Alphabetize
	this.xDomainZoom = new Array();
	this.yDomainZoom = new Array();


	this.xBot = 0;
	this.xTop = this.xDomain.length;

	this.xScale = d3.scale.ordinal()
		.domain(this.xDomain)
		.rangePoints([0,this.width],3);
	
	this.yScale = d3.scale.linear()
		.range([this.height-this.height*0.01, this.margin.top])	// Use zero as bottom of graph, not top
		.domain(this.yDomain).nice();

	// d3 can generate an axis given a scale 
	this.xAxis = d3.svg.axis()
	    .scale(this.xScale)
	    .orient('bottom');
	this.yAxis = d3.svg.axis()
	    .scale(this.yScale)
	    .tickSubdivide(9)
	    .orient('left');
}

scatterPlotOrdinal.prototype.draw = function(){
	// Clear the old canvas
	if(this.canvas) this.canvas.remove();	

	// Create an svg element
	if(!this.svg){
		this.svg = d3.select('#kimvis').append('svg').attr('class', 'plot')
		        .attr('width', this.width + this.margin.left + this.margin.right)
			    .attr('height', this.height + this.margin.top + this.margin.bottom)
				.attr('pointer-events', 'all');
	}
	
	// Creat an svg container 
	this.canvas = d3.select('.plot').append('g')	
		.attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
		.attr('id', 'kimviscanvas');
	
	// Add title
	this.canvas.append('text').text(this.options.title)
		.attr('x', this.width/2)
		.attr('y', -5)
		.attr('text-anchor', 'middle')
		.attr('font-size', 20);
	
	// If we're zoomed in, update the scales	
	if (this.xDomainZoom.length != 0)	this.xScale.domain(this.xDomainZoom[this.xDomainZoom.length - 1]);
	if (this.yDomainZoom.length != 0) 	this.yScale.domain(this.yDomainZoom[this.yDomainZoom.length - 1]);

	// X Axis
	this.xAxisG = this.canvas.append('g')  
	    .attr('class', 'x axis')    	
	    .attr('transform', 'translate(0,' + (this.height) + ')')		
	    .call(this.xAxis);    									

	// Label columns	
	this.xAxisG.selectAll('text')								
		.style('text-anchor', 'start')
		.attr('transform', 'rotate(90)')
		.attr('class', 'xtick')
		.attr('dx', 10)
		.attr('dy', -5);

	// Label axis	
	this.xAxisG.append('rect')   							
	    .attr('class', 'label')
	    .attr('x', this.width-50)
	    .attr('y', -20)
		.attr('width', 30)
		.attr('height', 15)
		.attr('opacity', 0.8)
	    .attr('fill', '#fff');
	this.xAxisG.append('text')   							
	    .attr('class', 'label')
	    .attr('x', this.width-50)
	    .attr('y', -10)
	    .style('text-anchor', 'front')
	    .text(this.options.xaxis);

	// Draw vertical lines for easy viewing
	this.xAxisG.selectAll('g').append('line')		
		.attr('x1', 0)
		.attr('x2', 0)
		.attr('y1', 0)
		.attr('y2', -this.height)
		.style('stroke', '#aaa');

	// Dirty way of getting the separation of ticks on the xAxis so we know when the user has moved the mouse enough while "panning" to move the graph 
	if (plot.xAxisG.selectAll('g').length>1){
		var tempX1 = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(d3.select(plot.xAxisG.selectAll('g')[0][0]).attr('transform'))[1];
		var tempX2 = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(d3.select(plot.xAxisG.selectAll('g')[0][1]).attr('transform'))[1];
		this.xTickSeparation = tempX2 - tempX1;
	} else {
		this.xTickSeparation = 30;
	}

	// Y Axis
	this.yAxisG = this.canvas.append('g')       
	    .attr('class', 'y axis')    	
	    .call(this.yAxis);    		
	this.yAxisG.append('text')  
	    .attr('class', 'label')
	    .attr('transform', 'rotate(-90)') // Make the y-axis vertical
	    .attr('y', 6)
	    .attr('dy', '.71em')
	    .style('text-anchor', 'end')
	    .text(this.options.yaxis);
	
	// Get rid of the 'this' context for using d3's .each()
	var xScale = this.xScale;
	var yScale = this.yScale;
	var options = this.options;
	if (this.xDomainZoom.length != 0 &&  this.yDomainZoom.length!=0){
		var xDomainZoom = this.xDomainZoom[this.xDomainZoom.length-1];	
		var yDomainZoom = this.yDomainZoom[this.yDomainZoom.length-1];

		// Setup a filter for only displaying points in the zoomed in region
		var xDomainZoomSet = d3.set(xDomainZoom);
		this.zoomFilter = function(d){
			return xDomainZoomSet.has(d[options.x]) && (d[options.y] < yDomainZoom[1] && d[options.y] > yDomainZoom[0]);
		}
	}
	else this.zoomFilter = function(d){
		return true;
	}

	// Create SVG groups for each data point
	this.dots = this.canvas.selectAll('.dot')
	    .data(this.data)
	  .enter().append('g').filter(this.zoomFilter)
	    .attr('class', 'dot')
	    .attr('transform', function(d,i){ return 'translate(' + xScale(d[options.x]) + ',' + yScale(d[options.y]) + ')';})
		.attr('x', function(d){ return xScale(d[options.x]); })
		.attr('y', function(d){ return yScale(d[options.y]); });

	// Labels
	this.dots.append('text')
		.attr('class','point_label')
	    .attr('x', 5 )
	    .attr('y', -2 )
	    .attr('stroke', 'none')
	    .style('text-anchor','left')
	    .text(function(d) { return d[options.labels]; })
		.each(function(d){
			$(this.parentNode).prepend(this);
		})
		
	// Actual points
	this.dots.append('circle')
	    .attr('r', 4)
		.attr('class', function(d){ return d.source; });	

	// Legend
	var legend = this.canvas.append('g')
		.attr('transform', 'translate(' + (this.width-100) + ')');
	legend.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', 100)
		.attr('height', 40)
		.attr('fill', '#fff')
		.attr('stroke', '#000');

	legend.append('circle')
      .attr('cx', 10)
	  .attr('cy', 10)
      .attr('r', 4)
      .style('fill', '#f66')
	  .style('stroke', '#000');
	legend.append('text')
      .attr('x', 20)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'left')
      .text('Test Result');	
	  
	legend.append('circle')
      .attr('cx', 10)
	  .attr('cy', 30)
      .attr('r', 4)
      .style('fill', '#09f')
	  .style('stroke', '#000');
	legend.append('text')
      .attr('x', 20)
      .attr('y', 29)
      .attr('dy', '.35em')
      .style('text-anchor', 'left')
      .text('Reference Data');	

}

// Reset the zoom on the plot and redraw
scatterPlotOrdinal.prototype.zoomOut = function(){
	this.xDomainZoom.pop();
	this.yDomainZoom.pop();
	if(this.xDomainZoom.length == 0){
		this.xScale.domain(this.xDomain);
		this.yScale.domain(this.yDomain).nice();
	}
	
	this.xAxis.scale(this.xScale);
	this.yAxis.scale(this.yScale);
	this.draw()
}

// Set the zoom and redraw
scatterPlotOrdinal.prototype.zoom = function(xZoom, yZoom) {
	if (this.xDomainZoom.length != 0 && this.yDomainZoom){
		var xDomainZoom = this.xDomainZoom[this.xDomainZoom.length-1];	
		var yDomainZoom = this.yDomainZoom[this.yDomainZoom.length - 1];

		// Get the indices of the domain array which mark the beginning and end of the zoom region 

		for (var i = 0; i<xDomainZoom.length; i++){
			var temp = this.xScale(xDomainZoom[i]);
			if (temp > xZoom[0]){
				for (var j = 0; j<this.xDomain.length; j++){
					if (this.xDomain[j] == xDomainZoom[i]) {
						this.xBot = j;
						break;
					}
				}
				break;
			}
		}
		for (var i = 0; i<xDomainZoom.length; i++){
			var temp = this.xScale(xDomainZoom[i]);
			if (temp > xZoom[1]){
				for (var j = 0; j<this.xDomain.length; j++){
					if (this.xDomain[j] == xDomainZoom[i]) {
						this.xTop = j;
						break;
					}
				}
				break;
			}
		}
	} else {
		for (var i = 0; i<this.xDomain.length; i++){
			var temp = this.xScale(this.xDomain[i]);
			if (temp > xZoom[0]){
					this.xBot = i;
					break;
			}
		}
		for (var i = 0; this.xDomain.length; i++){
			var temp = this.xScale(this.xDomain[i]);
			if (temp > xZoom[1]){
					this.xTop = i;
					break;
			}
		}
	}

	// Use the indices to get the zoomed in domain
	this.xDomainZoom.push(this.xDomain.slice(this.xBot,this.xTop))
	this.yDomainZoom.push(yZoom);

	this.draw();
};

scatterPlotOrdinal.prototype.panStart = function(container) {
	// Save original mouse position and yScale domain
	this.mouseStart = d3.mouse(container);
	this.yBot = this.yDomainZoom[this.yDomainZoom.length-1][0];
	this.yTop = this.yDomainZoom[this.yDomainZoom.length-1][1];
};

scatterPlotOrdinal.prototype.pan = function(container) {
	// Get the new mouse position, and calculate the adjustments to the x and y axis
	var xDomainZoom = this.xDomainZoom[this.xDomainZoom.length-1];
	var yDomainZoom = this.yDomainZoom[this.yDomainZoom.length-1]
	this.Mouse = d3.mouse(container);	
	this.deltaMouse = [this.Mouse[0]-this.mouseStart[0], this.Mouse[1] - this.mouseStart[1]];
	this.xDomainZoom[this.xDomainZoom.length-1] = this.xDomain.slice(this.xBot - Math.round(this.deltaMouse[0]/this.xTickSeparation), this.xTop - Math.round(this.deltaMouse[0]/this.xTickSeparation));
	this.yDomainZoom[this.yDomainZoom.length-1][0] = this.yBot + (this.yScale.invert(this.mouseStart[1]) - this.yScale.invert(this.mouseStart[1]+this.deltaMouse[1]));
	this.yDomainZoom[this.yDomainZoom.length-1][1] = this.yTop + (this.yScale.invert(this.mouseStart[1]) - this.yScale.invert(this.mouseStart[1]+this.deltaMouse[1]));
	this.draw();	
};

scatterPlotOrdinal.prototype.panStop = function() {
	// Save the new slice indices
	this.xBot -= Math.round(this.deltaMouse[0]/this.xTickSeparation);
	this.xTop -= Math.round(this.deltaMouse[0]/this.xTickSeparation);
};

scatterPlotOrdinal.prototype.update = function(data, options){
	// Update the data and options and zoom out

	// Reset the zoom
	this.xDomainZoom = new Array();
	this.yDomainZoom = new Array();

	this.data = deepCopy(data);
	this.options = options;	
	
	for (var i = 0; i<this.data.length; i++){
		this.data[i][options.y]=Number(this.data[i][options.y]);
	}
	
	if (options.margin) this.margin = options.margin;
	else this.margin = { top: 20, right: 15, bottom: 20, left: 25}; // Default
	
	if (options.width) this.width = options.width - this.margin.left - this.margin.right;
	else this.width = 800 - this.margin.left - this.margin.right;
	
	if (options.height) this.height = options.height - this.margin.top - this.margin.bottom;
	else this.height = 600 - this.margin.top - this.margin.bottom;
			
	this.yDomain = [d3.min(this.data, function(d) { return d[options.y];}), d3.max(this.data, function(d) { return d[options.y];})];
	this.xDomain = d3.set(); 
	for (var i = 0; i<this.data.length; i++){
		this.xDomain.add(this.data[i][options.x]);
	}
	this.xDomain = this.xDomain.values();
	this.xDomain.sort();	

	this.xScale.domain(this.xDomain);
	this.yScale.domain(this.yDomain).nice();

	this.xAxis.scale(this.xScale);
	this.yAxis.scale(this.yScale);	

	this.draw();
}