
// == Quantitative Scatter Plot Object == \\

// -- Constructor -- //
function scatterPlotQuantitative(data, options){
/* 
	Requires: div element with id '#kimvis'
	Creates scatter plot of the data passed.
  	
  	scatterPlotQuantitative.dots : d3 selection of all the <g> elements containing data points
  	scatterPlotQuantitative.svg : d3 selection of <svg> element of graph, this is persistent between redraws
  	scatterPlotQuantitative.canvas : d3 selection of main <g> which contains the graph
  	scatterPlotQuantitative.xAxis(yAxis) : d3 axis objects
  	scatterPlotQuantitative.xAxisG(yAxisG) : d3 selection of axis <g>
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
		this.data[i][options.x]=Number(this.data[i][options.x]);	
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
	this.xDomain = [d3.min(this.data, function(d) { return d[options.x];}), d3.max(this.data, function(d) { return d[options.x];})];


	this.xScale = d3.scale.linear()
		.range([0+this.width*0.01,this.width-this.width*0.01])
		.domain(this.xDomain).nice();
	
	this.yScale = d3.scale.linear()
		.range([this.height-this.height*0.01, this.margin.top])	// Use zero as bottom of graph, not top
		.domain(this.yDomain).nice();

	// d3 can generate an axis given a scale 
	this.xAxis = d3.svg.axis()
	    .scale(this.xScale)
	    .tickSubdivide(9)
	    .orient('bottom');
	this.yAxis = d3.svg.axis()
	    .scale(this.yScale)
	    .tickSubdivide(9)
	    .orient('left');
}

scatterPlotQuantitative.prototype.draw = function(){
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
	if (this.xDomainZoom)	this.xScale.domain(this.xDomainZoom);
	if (this.yDomainZoom) 	this.yScale.domain(this.yDomainZoom);
	
	// X Axis
	this.xAxisG = this.canvas.append('g')       
	    .attr('transform', 'translate(0,' + (this.height) + ')')
	    .attr('class', 'x axis')    	
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
	this.xAxisG.selectAll('g').append('line')		
		.attr('x1', 0)
		.attr('x2', 0)
		.attr('y1', 0)
		.attr('y2', -this.height)
		.style('stroke', '#aaa');


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
	this.yAxisG.selectAll('g').append('line')		
		.attr('x1', 0)
		.attr('x2', this.width)
		.attr('y1', 0)
		.attr('y2', 0)
		.style('stroke', '#aaa');
	
	// Get rid of the 'this' context for using d3's .each()
	var xScale = this.xScale;
	var yScale = this.yScale;
	var options = this.options;
	var xDomainZoom = this.xDomainZoom;	
	var yDomainZoom = this.yDomainZoom;

	// Setup a filter for only displaying points in the zoomed in region
	if (xDomainZoom &&  yDomainZoom){
		this.zoomFilter = function(d){
			return (d[options.x] < xDomainZoom[1] && d[options.x] > xDomainZoom[0]) && (d[options.y] < yDomainZoom[1] && d[options.y] > yDomainZoom[0]);
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
scatterPlotQuantitative.prototype.zoomOut = function(){
	this.xDomainZoom = undefined;
	this.yDomainZoom = undefined;
	this.xScale.domain(this.xDomain).nice();
	this.yScale.domain(this.yDomain).nice();
	
	this.xAxis.scale(this.xScale);
	this.yAxis.scale(this.yScale);
	this.draw()
}

// Set the zoom and redraw
scatterPlotQuantitative.prototype.zoom = function(xZoom, yZoom) {

	this.xDomainZoom = xZoom; 
	this.yDomainZoom = yZoom;	

	this.draw();
};

scatterPlotQuantitative.prototype.panStart = function(container) {
	if (this.xDomainZoom &&  this.yDomainZoom){
		// Save original mouse position and yScale domain
		this.mouseStart = d3.mouse(container);
		this.yBot = this.yDomainZoom[0];
		this.yTop = this.yDomainZoom[1];
		this.xBot = this.xDomainZoom[0];
		this.xTop = this.xDomainZoom[1];
	}
};

scatterPlotQuantitative.prototype.pan = function(container) {
	// Get the new mouse position, and calculate the adjustments to the x and y axis
	this.Mouse = d3.mouse(container);	
	this.deltaMouse = [this.Mouse[0]-this.mouseStart[0], this.Mouse[1] - this.mouseStart[1]];
	this.xDomainZoom[0] = this.xBot + (this.xScale.invert(this.mouseStart[0]) - this.xScale.invert(this.mouseStart[0]+this.deltaMouse[0]));
	this.xDomainZoom[1] = this.xTop + (this.xScale.invert(this.mouseStart[0]) - this.xScale.invert(this.mouseStart[0]+this.deltaMouse[0]));
	this.yDomainZoom[0] = this.yBot + (this.yScale.invert(this.mouseStart[1]) - this.yScale.invert(this.mouseStart[1]+this.deltaMouse[1]));
	this.yDomainZoom[1] = this.yTop + (this.yScale.invert(this.mouseStart[1]) - this.yScale.invert(this.mouseStart[1]+this.deltaMouse[1]));
	this.draw();	
};

scatterPlotQuantitative.prototype.panStop = function() {

};

scatterPlotQuantitative.prototype.update = function(data, options){
	// Update the data and options and zoom out

	// Reset the zoom
	this.xDomainZoom = undefined;
	this.yDomainZoom = undefined;

	this.data = deepCopy(data);
	this.options = options;	
	
	for (var i = 0; i<this.data.length; i++){
		this.data[i][options.y]=Number(this.data[i][options.y]);
		this.data[i][options.x]=Number(this.data[i][options.x]);
	}
	
	if (options.margin) this.margin = options.margin;
	else this.margin = { top: 20, right: 15, bottom: 20, left: 25}; // Default
	
	if (options.width) this.width = options.width - this.margin.left - this.margin.right;
	else this.width = 800 - this.margin.left - this.margin.right;
	
	if (options.height) this.height = options.height - this.margin.top - this.margin.bottom;
	else this.height = 600 - this.margin.top - this.margin.bottom;
			
	this.yDomain = [d3.min(this.data, function(d) { return d[options.y];}), d3.max(this.data, function(d) { return d[options.y];})];
	this.xDomain = [d3.min(this.data, function(d) { return d[options.x];}), d3.max(this.data, function(d) { return d[options.x];})];

	this.xScale.domain(this.xDomain).nice();
	this.yScale.domain(this.yDomain).nice();

	this.xAxis.scale(this.xScale);
	this.yAxis.scale(this.yScale);	

	this.draw();
}