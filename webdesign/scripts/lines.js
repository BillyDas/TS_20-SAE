// sort these properly...
var persistentSelection = null;
var sensorNameCache = {};

var chartDiv = document.getElementById("chart");
var focusDiv = document.getElementById("focus");
var padding = 100;
var firstUpdate = true;

//var defEndDateTime = moment();
var defEndDateTime = moment("2020-08-23T16:55:05.970327")
var defStartDateTime = moment("2020-08-23T16:50:05.970327");
//var defStartDateTime = moment(defEndDateTime - (24 * 3600 * 1000));

var minX, maxX, minY, maxY = null;

function initLines() {
	// create svg
	var svg = d3.select(chartDiv).append("svg");
	var focus = d3.select(focusDiv).append("svg");

	//setup event listener for sensor selection change
	$('#yAxisSelectPicker').change(function () {
		controlUpdate();
	});

	$('#endDateTime').datetimepicker('date', defEndDateTime);
	$('#startDateTime').datetimepicker('date', defStartDateTime);

	$("#endDateTime").on("change.datetimepicker", ({ date, oldDate }) => {
		$('#chart svg').empty();
		$('#focus svg').empty();
		controlUpdate();
	})

	$("#startDateTime").on("change.datetimepicker", ({ date, oldDate }) => {
		$('#chart svg').empty();
		$('#focus svg').empty();
		controlUpdate();
	})

	//update the graph initally when loaded
	updateGraph();

}

function controlUpdate() {
	if ($('#yAxisSelectPicker').val() != "" && 
			$('#startDateTime').datetimepicker('date').format('YYYY-MM-DDTHH:mm:ss.SSS') != "" &&
			$('#endDateTime').datetimepicker('date').format('YYYY-MM-DDTHH:mm:ss.SSS') != "")  {
		updateGraph();
		console.log(this.id);
	}
	else {
		$('#chart svg').empty();
		$('#focus svg').empty();
	}
}

function updateGraph() {
	//select svg area
	var svg = d3.select(chartDiv).select("svg");
	var focus = d3.select(focusDiv).select("svg");

	// list of sensors available
	var sensorIds = $('#yAxisSelectPicker').val();

	// format strings for use in GET request
	for (var i = 0; i < sensorIds.length; i++) {
		sensorIds[i] = '"' + sensorIds[i] + '"';
	}

	var startTime = $('#startDateTime').datetimepicker('date').format('YYYY-MM-DDTHH:mm:ss.SSS');
	var endTime = $('#endDateTime').datetimepicker('date').format('YYYY-MM-DDTHH:mm:ss.SSS');

	var url = "http://ts20.billydasdev.com:3000/data?canId=["
		+ sensorIds.toString()
		+ "]&startTime='" + startTime
		+ "'&endTime='" + endTime + "'"
		+ "&max=200000";

	// load the dataset and then draw
	fetch(url)
		.then(response => response.json())
		.then(lineData => {
			// data conversion for time and data
			lineData.forEach(function (d) {
				d.UTCTimestamp = Date.parse(d.UTCTimestamp);
				d.Data = parseFloat(d.Data);
			})

			url = "http://ts20.billydasdev.com:3000/desc?canId=[" + sensorIds.toString() + "]"
			fetch(url)
				.then(response => response.json())
				.then(sensorDesc => {
					sensorDesc.forEach(function (d) {
						sensorNameCache[d.CanId] = d.Name
					})

					// draw line chart
					lineChart(lineData, svg);
					focusChart(lineData, svg, focus);

					if (firstUpdate) {
						// add listener to draw on resize
						window.addEventListener("resize", function () {
							lineChart(lineData, svg);
							focusChart(lineData, svg, focus);
						});
						firstUpdate = false;
					}

				})
				.catch(error => {
					// log the caught error if failure to load database
					console.log(error);
				});

		})
		.catch(error => {
			// log the caught error if failure to load database
			console.log(error);
		});
}

function lineChart(data, svg) {

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
		.key(function (d) { return d.CanId; })
		.entries(data);

	var xScale = null;
	if (minX != null && maxX != null) {
		xScale = d3.scaleTime()
			.domain([minX, maxX])
			.range([padding, (w - w * 0.1) - padding]) // temp fix for names not fitting
		//.nice();
	}
	else {
		// set x axis to scale based on times
		xScale = d3.scaleTime()
			.domain(d3.extent(data, function (d) { return d.UTCTimestamp; }))
			.range([padding, w - padding])
		//.nice();
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
	if (minY != null && maxY != null) {
		// set y axis to scale based on data
		var yScale = d3.scaleLinear()
			.domain([minY, maxY])
			.range([h - padding, padding])
			.nice();
	}
	else {
		// set y axis to scale based on data
		var yScale = d3.scaleLinear()
			.domain([d3.min(data, function (d) {
				return d.Data;
			}),
			d3.max(data, function (d) {
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
		.attr("x", 0 - (h / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.style("font-size", "1.5em")
		.text("Value");

	// create group names
	var sensorNames = sumstat.map(function (d) { return d.key })

	// create scale to map sensors to individual colour
	var color = d3.scaleOrdinal()
		.domain(sensorNames)
		.range(d3.schemeCategory10);

	svg.append("clipPath")
		.attr("id", "chartClip")
		.append("rect")
		.attr("x", 0 + padding)
		.attr("y", 0)
		.attr("width", (w - w * 0.1) - (2 * padding))
		.attr("height", chartDiv.clientHeight)
		.attr("fill", "#ccffff");

	// add sensors as lines to the svg
	svg.selectAll(".line")
		.data(sumstat)
		.enter()
		.append("path")
		.attr("class", "line")
		.attr("fill", "none")
		.attr("stroke", function (d) { return color(d.key); })
		.attr("stroke-width", 1.5)
		.attr("d", function (d) {
			return d3.line()
				.x(function (d) { return xScale(d.UTCTimestamp); })
				.y(function (d) { return yScale(d.Data); })
				(d.values)
		})
		.attr("clip-path", "url(#chartClip)");

	// add dots for the legend
	svg.selectAll("legenddots")
		.data(sensorNames)
		.enter()
		.append("circle")
		.attr("cx", (w - w * 0.1) - 80)
		.attr("cy", function (d, i) { return 100 + i * 25 })
		.attr("r", 7)
		.style("fill", function (d) { return color(d) })

	// add legend text for each sensor
	svg.selectAll("legendnames")
		.data(sensorNames)
		.enter()
		.append("text")
		.attr("x", (w - w * 0.1) - 70)
		.attr("y", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
		.style("fill", function (d) { return color(d) })
		.text(function (d) { return sensorNameCache[d] })
		.attr("text-anchor", "left")
		.style("alignment-baseline", "middle")

	// add a title to the chart
	/*svg.append("text")
		.attr("transform", "translate(" + w / 2 + ", " + (padding / 2) + ")")
		.style("text-anchor", "middle")
		.style("font-size", "1.5em")
		.text("Sensor Data Information for SAE Formula Car");*/
}

function focusChart(data, svg, focus) {
	// clear canvas
	d3.selectAll("#focus svg > *").remove();

	var focusHeight = 100
	var focusPadding = 20

	var margin = { top: 20, right: 20, bottom: 30, left: 40 }

	var w = chartDiv.clientWidth;

	// group data based on CanId
	var sumstat = d3.nest()
		.key(function (d) { return d.CanId; })
		.entries(data);

	// configure focus view size
	focus
		.attr("viewBox", [0, 0, w, focusHeight + focusPadding])
		.style("display", "block")

	// focus shit
	area = (x, y) => d3.area()
		.defined(d => !isNaN(d.value))
		.x(d => x(d.date))
		.y0(y(0))
		.y1(d => y(d.value))

	// set x axis to scale based on times
	var xScale = d3.scaleTime()
		.domain(d3.extent(data, function (d) { return d.UTCTimestamp; }))
		.range([padding, w - padding])
	//.nice();

	// create x axis labels
	xAxisTicks = w / 100;
	var xAxis = d3.axisBottom()
		.ticks(w / 100)
		.scale(xScale);

	var focusYScale = d3.scaleLinear()
		.domain([
			d3.min(data, function (d) {
				return d.Data;
			}),
			d3.max(data, function (d) {
				return d.Data;
			})
		])
		.range([focusHeight, 4])
		.nice();

	// create group names
	var sensorNames = sumstat.map(function (d) { return d.key })

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
		.attr("transform", "translate(0, " + (focusHeight + 1) + ")")
		.call(xAxis, xScale, focusHeight);
	// .call(xAxis);

	focus.selectAll(".line")
		.data(sumstat)
		.enter()
		.append("path")
		.attr("class", "line")
		.attr("fill", "none")
		.attr("stroke", function (d) { return color(d.key); })
		.attr("stroke-width", 1.5)
		.attr("d", function (d) {
			return d3.line()
				.x(function (d) { return xScale(d.UTCTimestamp); })
				.y(function (d) { return focusYScale(d.Data); })
				(d.values)
		});

	const gb = focus.append("g")
		//.attr("id", "focusSlider") // remove when performance fixed (????????????)
		.call(brush)
	//.call(brush.move, defaultSelection); // this line resets the focus area on resize,, need to fix...

	if (persistentSelection === null) {
		gb.call(brush.move, defaultSelection)
	} else {
		gb.call(brush.move, [xScale(persistentSelection[0]), xScale(persistentSelection[1])])
	}

	// add when performance fixed (????????????)
	// gb.selectAll(".selection")
	// 	.attr("id", "focusSlider");

	// huh, this was actually unnecessary
	// persistentObserver = new MutationObserver(function(mutations) {
	// 	mutations.forEach(function(mutation) {
	// 		if (mutation.type == "attributes") {
	// 			[minX, maxX] = focus.property("value")
	// 			minY = d3.min(data, d => minX <= d.UTCTimestamp && d.UTCTimestamp <= maxX ? d.value : NaN);
	// 			maxY = d3.max(data, d => minX <= d.UTCTimestamp && d.UTCTimestamp <= maxX ? d.value : NaN);
	// 			// desperately needs to be rewritten to just change the domain, nothing else, but it works for now...
	// 			lineChart( data, svg )
	// 		}
	// 	});
	// });
	// persistentObserver.observe(document.getElementById("focusSlider"), {
	// 	attributes: true //configure it to listen to attribute changes
	// });

	function brushed() {
		if (d3.event.selection) {
			//focus.property("value", d3.event.selection.map(xScale.invert, xScale));
			focus.dispatch("input");

			[minX, maxX] = d3.event.selection.map(xScale.invert, xScale)
			minY = d3.min(data, d => minX <= d.UTCTimestamp && d.UTCTimestamp <= maxX ? d.value : NaN);
			maxY = d3.max(data, d => minX <= d.UTCTimestamp && d.UTCTimestamp <= maxX ? d.value : NaN);

			lineChart(data, svg)
		}
	}

	function brushended() {
		if (!d3.event.selection) {
			gb.call(brush.move, defaultSelection);
		}
		else {
			// can even move to brushed(), just probably better performance here?
			persistentSelection = [xScale.invert(d3.event.selection[0]), xScale.invert(d3.event.selection[1])];
		}
	}
}

// run init on window load
$(document).ready(function () {
	initLines();
});
