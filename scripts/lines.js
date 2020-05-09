
var chartDiv = document.getElementById("chart");
var padding = 40;

function init() {
	// create svg
	var svg = d3.select(chartDiv).append("svg");

	// load the dataset and then draw
	d3.json("data/SmallSensorData.json").then(function( data ) {
		// data conversion for time and data
		data.forEach( function(d) {
			d.UTCTimestamp = Date.parse(d.UTCTimestamp);
			d.Data = parseInt(d.Data);
		} )

		// draw line chart initially
		lineChart( data, svg );

		// add listener to draw on resize
		window.addEventListener("resize", function() {
				lineChart( data, svg );
		});
	})
	.catch(error => {
		// log the caught error if failure to load database
		console.log(error);
	});
}

function lineChart( data, svg ) {
	// clear canvas
	d3.selectAll("svg > *").remove();

	// set width and height to current div environment
	var w = chartDiv.clientWidth;
	var h = chartDiv.clientHeight;

	// set svg size
	svg
		.attr("width", w)
		.attr("height", h);

	// group data based on CanId
	var sumstat = d3.nest()
		.key(function(d) { return d.CanId; })
		.entries(data);

	// set x axis to scale based on times
	var xScale = d3.scaleTime()
    	.domain(d3.extent(data, function(d) { return d.UTCTimestamp; }))
    	.range([padding, w - padding]);

    // create x axis labels
	var xAxis = d3.axisBottom()
		.ticks(10)
		.scale(xScale);

	// add x axis to the svg
    svg.append("g")
		.attr("transform", "translate(0, " + (h - padding) + ")")
		.call(xAxis);

	// set y axis to scale based on data
    var yScale = d3.scaleLinear()
		.domain([d3.min(data, function(d) {
				return d.Data;
		}),
		d3.max(data, function(d) {
			return d.Data;
		})])
		.range([h - padding, padding]);
    
    // create y axis labels
    var yAxis = d3.axisLeft()
		.ticks(10)
		.scale(yScale);

	// add y axis to the svg
	svg.append("g")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxis);

	// create group names
	var sensorNames = sumstat.map(function(d){ return d.key })

	// create scale to map sensors to individual colour
	var color = d3.scaleOrdinal()
		.domain(sensorNames)
		.range(d3.schemeSet3);

	// add sensors as lines to the svg
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

	svg.selectAll("legenddots")
		.data(sensorNames)
		.enter()
			.append("circle")
			.attr("cx", w - 100)
			.attr("cy", function(d,i){ return 100 + i*25})
			.attr("r", 7)
			.style("fill", function(d){ return color(d)})

	svg.selectAll("legendnames")
		.data(sensorNames)
		.enter()
		.append("text")
			.attr("x", w - 100)
			.attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
			.style("fill", function(d){ return color(d)})
			.text(function(d){ return d})
			.attr("text-anchor", "left")
			.style("alignment-baseline", "middle")
}

// run init on window load
window.onload = init;
