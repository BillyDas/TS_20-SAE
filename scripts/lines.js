
var chartDiv = document.getElementById("chart");
var padding = 40;

function init() {
	// create svg
	var svg = d3.select(chartDiv).append("svg");

	d3.json("/data/SmallSensorData.json").then(function( data ) {
		data.forEach( function(d) {
			d.UTCTimestamp = Date.parse(d.UTCTimestamp);
			d.Data = parseInt(d.Data);
		} )

		lineChart( data, svg );
	})
	.catch(error => {
		console.log("Following is an error:");
		console.log(error);
	});
}

function lineChart( data, svg ) {
	var w = chartDiv.clientWidth;
	var h = chartDiv.clientHeight;

	svg
		.attr("width", w)
		.attr("height", h);

	var sumstat = d3.nest()
		.key(function(d) { return d.CanId; })
		.entries(data);

	var xScale = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return d.UTCTimestamp; }))
      .range([padding, w - padding]);

	var xAxis = d3.axisBottom()
		.ticks(10)
		.scale(xScale);

    svg.append("g")
		.attr("transform", "translate(0, " + (h - padding) + ")")
		.call(xAxis);

    var yScale = d3.scaleLinear()
				  .domain([d3.min(data, function(d) {
				  		return d.Data;
				  }),
				  d3.max(data, function(d) {
				  	return d.Data;
				  })])
				  .range([h - padding, padding]);
    
    var yAxis = d3.axisLeft()
				  .ticks(10)
				  .scale(yScale);

	svg.append("g")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxis);

	var res = sumstat.map(function(d){ return d.key }) // list of group names
	var color = d3.scaleOrdinal()
		.domain(res)
		.range([
			'#e41a1c',
			'#377eb8',
			'#4daf4a',
			'#984ea3',
			'#ff7f00',
			'#ffff33',
			'#a65628',
			'#f781bf',
			'#999999'
		]);

	//console.log(data);
	//console.log(sumstat);
	svg.selectAll(".line")
		.data(sumstat)
		.enter()
		.append("path")
			.attr("class", "line")
	    	.attr("fill", "none")
	    	.attr("stroke", function(d){ return color(d.key); })
	        .attr("stroke-width", 1.5)
	        .attr("d", function(d) {
	        	return d3.line()
	    		.x(function(d) { return xScale(d.UTCTimestamp); })
	    		.y(function(d) { return yScale(d.Data); })
	    		(d.values)
	    	});
}

window.onload = init;