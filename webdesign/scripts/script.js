
//random dataset
var dataset = [];
var numDataPoints = 100;
var xRange = Math.random() * 1000;
var yRange = Math.random() * 1000;
for (var i = 0; i < numDataPoints; i++) {
    var newNumber1 = Math.round(Math.random() * xRange);
    var newNumber2 = Math.round(Math.random() * yRange);
    dataset.push([newNumber1, newNumber2]);
}

// create svg
var chartDiv = document.getElementById("chart");
var svg = d3.select(chartDiv).append("svg");

var textColour = "green";
var padding = 40;

function redraw() {
	d3.selectAll("svg > *").remove();
	
	// grab new chart size
	var w = chartDiv.clientWidth;
	var h = chartDiv.clientHeight;

	svg
		.attr("width", w)
		.attr("height", h);

	var xScale = d3.scaleLinear()
			  .domain([d3.min(dataset, function(d) {
			  		return d[0];
			  }),
			  d3.max(dataset, function(d) {
			  	return d[0];
			  })])
			  .range([padding, w - padding]);

	var yScale = d3.scaleLinear()
				  .domain([d3.min(dataset, function(d) {
				  		return d[1];
				  }),
				  d3.max(dataset, function(d) {
				  	return d[1];
				  })])
				  .range([h - padding, padding]);

	var xAxis = d3.axisBottom()
				  .ticks(10)
				  .scale(xScale);

	var yAxis = d3.axisLeft()
				  .ticks(10)
				  .scale(yScale);

	svg.selectAll("circle")
		.data(dataset)
		.enter()
		.append("circle")
		.attr("cx", function(d) {
			return xScale(d[0]);
		})
		.attr("cy", function(d) {
			return yScale(d[1]);
		})
		.attr("r", 5)
		.attr("fill", "slategrey");

	svg.selectAll("text")
		.data(dataset)
		.enter()
		.append("text")
		.text(function(d) {
			return d[0] + "," + d[1];
		})
		.attr("x", function(d) {
			return xScale(d[0]);
		})
		.attr("y", function(d) {
			return yScale(d[1])-5;
		})
		.attr("font-family", "sans-serif")
		.attr("fill", textColour)
		.attr("font-size", "12px");

	svg.append("g")
		.attr("transform", "translate(0, " + (h - padding) + ")")
		.call(xAxis);

	svg.append("g")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxis);
}

// draw initially
redraw();
// update on window resize
window.addEventListener("resize", redraw);