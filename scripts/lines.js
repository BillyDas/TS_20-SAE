
var chartDiv = document.getElementById("chart");
var focusDiv = document.getElementById("focus")
var padding = 100;

var minX, maxX, minY, maxY = null


function init() {
	// create svg
	var svg = d3.select(chartDiv).append("svg");
	var focus = d3.select(focusDiv).append("svg");

	// load the dataset and then draw
	d3.json("data/AssettoSensorData.json").then(function( data ) {
		// data conversion for time and data
		data.forEach( function(d) {
			d.UTCTimestamp = Date.parse(d.UTCTimestamp);
			d.Data = parseFloat(d.Data);
		} )

		// draw line chart initially
		lineChart( data, svg );
		focusChart( data, svg, focus );

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
	d3.selectAll("#chart svg > *").remove();

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

	var xScale = null;
	if (minX != null && maxX != null)
	{
		xScale = d3.scaleTime()
			.domain([minX, maxX])
			.range([padding, w - padding])
			.nice();
	}
	else
	{
		// set x axis to scale based on times
		xScale = d3.scaleTime()
			.domain(d3.extent(data, function(d) { return d.UTCTimestamp; }))
			.range([padding, w - padding])
			.nice();
	}

    // create x axis labels
    xAxisTicks = w / 100;
	var xAxis = d3.axisBottom()
		.ticks(w / 100)
		.scale(xScale);

	// add x axis to the svg
    svg.append("g")
		.attr("transform", "translate(0, " + (h - padding) + ")")
		.call(xAxis);

	// text label for the x axis
	svg.append("text")             
		.attr("transform", "translate(" + (w / 2) + ", " + (h - padding + 40) + ")")
		.style("text-anchor", "middle")
		.style("font-size", "1.5em")
		.text("Date");


	var yScale = null;
	if (minY != null && maxY != null)
	{
		// set y axis to scale based on data
		var yScale = d3.scaleLinear()
			.domain([minY, maxY])
			.range([h - padding, padding])
			.nice();
	}
	else {
		// set y axis to scale based on data
		var yScale = d3.scaleLinear()
			.domain([d3.min(data, function(d) {
				return d.Data;
			}),
				d3.max(data, function(d) {
					return d.Data;
				})])
			.range([h - padding, padding])
			.nice();
	}

    // create y axis labels
    yAxisTicks = h / 100;
    var yAxis = d3.axisLeft()
		.ticks(yAxisTicks)
		.scale(yScale);

	// add y axis to the svg
	svg.append("g")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxis);

	// text label for the y axis
	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", padding / 3)
		.attr("x",0 - (h / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.style("font-size", "1.5em")
		.text("Value"); 

	// create group names
	var sensorNames = sumstat.map(function(d){ return d.key })

	// create scale to map sensors to individual colour
	var color = d3.scaleOrdinal()
		.domain(sensorNames)
		.range(d3.schemeCategory10);

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

	// add dots for the legend
	svg.selectAll("legenddots")
		.data(sensorNames)
		.enter()
		.append("circle")
			.attr("cx", w - 100)
			.attr("cy", function(d,i){ return 100 + i*25})
			.attr("r", 7)
			.style("fill", function(d){ return color(d)})
	
	// add legend text for each sensor
	svg.selectAll("legendnames")
		.data(sensorNames)
		.enter()
		.append("text")
			.attr("x", w - 90)
			.attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
			.style("fill", function(d){ return color(d)})
			.text(function(d){ return d})
			.attr("text-anchor", "left")
			.style("alignment-baseline", "middle")

	// add a title to the chart
	svg.append("text")             
		.attr("transform", "translate(" + w / 2 + ", " + (padding / 2) + ")")
		.style("text-anchor", "middle")
		.style("font-size", "1.5em")
		.text("Sensor Data Information for SAE Formula Car");
}

function focusChart(data, svg, focus) {
	var focusHeight = 100

	var margin = {top: 20, right: 20, bottom: 30, left: 40}

	var w = chartDiv.clientWidth;

	// group data based on CanId
	var sumstat = d3.nest()
		.key(function(d) { return d.CanId; })
		.entries(data);

	// configure focus view size
	focus
		.attr("viewBox", [0, 0, w, focusHeight])
		.style("display", "block")

	// focus shit
	area = (x, y) => d3.area()
		.defined(d => !isNaN(d.value))
		.x(d => x(d.date))
		.y0(y(0))
		.y1(d => y(d.value))

	// set x axis to scale based on times
	var xScale = d3.scaleTime()
		.domain(d3.extent(data, function(d) { return d.UTCTimestamp; }))
		.range([padding, w - padding])
		.nice();

	// create x axis labels
	xAxisTicks = w / 100;
	var xAxis = d3.axisBottom()
		.ticks(w / 100)
		.scale(xScale);

	var focusYScale = d3.scaleLinear()
		.domain([
			d3.min(data, function(d) {
				return d.Data;
			}),
			d3.max(data, function(d) {
				return d.Data;
			})
		])
		.range([focusHeight, 4])
		.nice();

	// create group names
	var sensorNames = sumstat.map(function(d){ return d.key })

	// create scale to map sensors to individual colour
	var color = d3.scaleOrdinal()
		.domain(sensorNames)
		.range(d3.schemeCategory10);

	const brush = d3.brushX()
		.extent([[padding, 0.5], [w - padding, focusHeight + 0.5]])
		.on("brush", brushed)
		.on("end", brushended);

	const defaultSelection = [xScale.range()[0], xScale.range()[1]];

	focus.append("g")
		.call(xAxis, xScale, focusHeight);

	focus.selectAll(".line")
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
				.y(function(d) { return focusYScale(d.Data); })
				(d.values)
		});

	const gb = focus.append("g")
		.attr("id", "focusSlider") // remove when performance fixed
		.call(brush)
		.call(brush.move, defaultSelection);

	// add when performance fixed
	// gb.selectAll(".selection")
	// 	.attr("id", "focusSlider");

	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type == "attributes") {
				[minX, maxX] = focus.property("value")
				minY = d3.min(data, d => minX <= d.UTCTimestamp && d.UTCTimestamp <= maxX ? d.value : NaN);
				maxY = d3.max(data, d => minX <= d.UTCTimestamp && d.UTCTimestamp <= maxX ? d.value : NaN);
				// desperately needs to be rewritten to just change the domain, nothing else, but it works for now...
				lineChart( data, svg )
			}
		});
	});
	observer.observe(document.getElementById("focusSlider"), {
		attributes: true //configure it to listen to attribute changes
	});

	function brushed() {
		if (d3.event.selection) {
			focus.property("value", d3.event.selection.map(xScale.invert, xScale));
			focus.dispatch("input");
		}
	}

	function brushended() {
		if (!d3.event.selection) {
			gb.call(brush.move, defaultSelection);
		}
	}
}

// run init on window load
window.onload = init;
