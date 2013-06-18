function scatterPlotMultiAxes(data, options){
	/*
	data is a map of property strings to the corresponding set of data for that property
	?? Separate the reference data from the test result data ??

	data = d3.map(<property_string> > {y: <number>, source: "rd"/"tr", id: <string>})
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

	// Get the values to be used for the x-axis
	this.xDomain = data.keys();
	
	// Setup separate yDomains to be used for individual yScales
	this.yDomains = d3.map();
	data.forEach(function(property, data){
		this.yDomains.set(property, [d3.min(data),d3.max(data)]);
	});

	// xScale is just an ordinal scale
	this.xScale = d3.scale.ordinal()
		.domain(this.xDomain)
		.rangePoints([0,this.width],3);

	// An individual yScale for each property
	this.yScales = d3.map();
	this.yDomain.forEach(function(property, domain){
		var temp = d3.scale.linear()
			.range([this.height-this.height*0.01, this.margin.top])	// Use zero as bottom of graph, not top
			.domain(domain).nice();
		this.yScales.set(property, temp);
	})

	this.xAxis = d3.svg.axis()
	    .scale(this.xScale)
	    .orient('bottom');

	this.yAxes = d3.map();
	this.yScales.forEach(function(property, scale){
		var temp = d3.svg.axis()
		    .scale(scale)
		    .tickSubdivide(9)
		    .orient('left');
		this.yAxes.set(property, temp);
	});

}

scatterPlotMultiAxes.prototype.draw = function() {
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

	// Y Axis
	this.yAxisGs
	this.yAxes.forEach(function(property, axis){
		var temp = this.canvas.append('g')       
		    .attr('class', 'y axis')    	
		    .call(axis);  
		temp.append('text')  
		    .attr('class', 'label')
		    .attr('transform', 'rotate(-90)') // Make the y-axis vertical
		    .attr('y', 6)
		    .attr('dy', '.71em')
		    .style('text-anchor', 'end')
		    .text(this.options.yaxis); 
		this.yAxisGs.set(property, temp);
	});

	// Create SVG groups for each data point
	var xScale = this.xScale;
	var yScales = this.yScales;
	this.dots = this.canvas.selectAll('.dot')
	    .data(this.data.entries())
	  .enter().append('g')
	    .attr('class', 'dot')
	    .attr('transform', function(d,i){ return 'translate(' + xScale(d.key) + ',' + yScales.get(key)(d.value.y) + ')';})
		.attr('x', function(d){ return xScale(d.key); })
		.attr('y', function(d){ return yScales.get(key)(d.value.y); });

	// Actual points
	this.dots.append('circle')
	    .attr('r', 4)
		.attr('class', function(d){ return d.value.source; });

		
}