var persistentSelection = null;
var sensorNameCache = {}; // might be redundant now that i'm storing it all
var sensorDescCache = [];

var chartDiv = document.getElementById("chart");
var focusDiv = document.getElementById("focus");
var padding = 100;
var firstUpdate = true;

var startDateTime = moment("2020-08-23T16:50:05.970327").format('YYYY-MM-DDTHH:mm:ss.SSS');;
var endDateTime = moment("2020-08-23T16:55:05.970327").format('YYYY-MM-DDTHH:mm:ss.SSS');;

var minX, maxX, minY, maxY = null;

var xAxisDataId = "";
var yAxisDataId = "";


function initLines() {
	// create svg
	var svg = d3.select(chartDiv).append("svg");
	var focus = d3.select(focusDiv).append("svg");

	//update the graph initally when loaded
	updateGraph();
}

function updateGraph() {
	// TODO: these are subject to change, but are temporary and needed for loading img
	if (yAxisDataId === "" || startDateTime === "" || endDateTime === "") // xAxis needs to be added when configured
	{
		return;
	}

	var loading = d3.select(loadingGraph);
	loading.style("display", "block");

	//select svg area
	var svg = d3.select(chartDiv).select("svg");
	var focus = d3.select(focusDiv).select("svg");

	// list of sensors available
	var yAxisIds = yAxisDataId;

	// format strings for use in GET request
	for (var i = 0; i < yAxisIds.length; i++) {
		if (!yAxisIds[i].includes('"')){
			yAxisIds[i] = '"' + yAxisIds[i] + '"';
		}
	}

	var url = "http://ts20.billydasdev.com:3000/data?canId=["
		+ yAxisIds.toString()
		+ "]&startTime='" + startDateTime
		+ "'&endTime='" + endDateTime + "'"
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

			url = "http://ts20.billydasdev.com:3000/desc?canId=[" + yAxisIds.toString() + "]"
			fetch(url)
				.then(response => response.json())
				.then(sensorDesc => {
					sensorDescCache = [];
					sensorNameCache = {};

					sensorDesc.forEach(function (d) {
						sensorDescCache.push(d);

						sensorNameCache[d.CanId] = d.Name + ' (' + d.UnitMetric + ')';
					})

					// hide loading graphic
					loading.style("display", "none");

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
	let groupedSensors = groupBy(sensorDescCache, "UnitName");

	var dynamicPaddingLeft = 18;
	dynamicPaddingLeft = (groupedSensors.length + 1) * dynamicPaddingLeft + 25;

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
			.range([dynamicPaddingLeft, (w - w * 0.1) - padding]) // temp fix for names not fitting
		//.nice();
	}
	else {
		// set x axis to scale based on times
		xScale = d3.scaleTime()
			.domain(d3.extent(data, function (d) { return d.UTCTimestamp; }))
			.range([dynamicPaddingLeft, w - padding])
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
		.style("font-size", "1em")
		.text("Time");


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
		.attr("transform", "translate(" + dynamicPaddingLeft + ",0)")
		.call(yAxis);

	// group descs by metric
	function groupBy(arr, prop) {
		const map = new Map(Array.from(arr, obj => [obj[prop], []]));
		arr.forEach(obj => map.get(obj[prop]).push(obj));
		return Array.from(map.values());
	}

	// create group names
	var sensorNames = sumstat.map(function (d) { return d.key })

	// create scale to map sensors to individual colour
	var color = d3.scaleOrdinal()
		.domain(sensorNames)
		.range(d3.schemeCategory10);

	// sorry
	let yAxisPadder = 0;
	for (let key in groupedSensors) {

		svg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 + 18 * yAxisPadder)
			.attr("x", 0 - (h / 2) + (h / 2 / 5))
			.attr("dy", "1em")
			.style("text-anchor", "end")
			.style("font-size", "1em")
			.text(groupedSensors[key][0].UnitName + " (" + groupedSensors[key][0].UnitMetric + ")")

		//var linesToFit = groupedSensors[key].length;
		let keyUnitCount = 0;
		for (let sensorsWithKeyUnit in groupedSensors[key]) {
			// really sorry
			svg.append("line")
				.attr("transform", "rotate(-90)")
				.attr("x1", 0 - (h / 2) + (h / 10) + 3 + (25 * keyUnitCount))
				.attr("y1", -5 + 18 * (yAxisPadder + 1))
				.attr("x2", 0 - (h / 2) + (h / 10) + 23 + (25 * keyUnitCount))
				.attr("y2", -5 + 18 * (yAxisPadder + 1))
				.attr("stroke", function (d) { return color(groupedSensors[key][sensorsWithKeyUnit].CanId); })
				.attr("stroke-width", 1.5)

			keyUnitCount++
		}

		yAxisPadder++;
	}

	svg.append("clipPath")
		.attr("id", "chartClip")
		.append("rect")
		.attr("x", 0 + dynamicPaddingLeft)
		.attr("y", 0)
		.attr("width", (w - w * 0.1) - (dynamicPaddingLeft + padding))
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

	arc = function (d) {
		var e = +(d.type == "e"),
			x = e ? 1 : -1,
			y = focusHeight / 2;
		return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
	}

	// var innerLine = d3.line()
	// 	.length()

	var brushHandle = (g, selection) => {
		g.selectAll(".handle--custom")
			.data([{ type: "w" }, { type: "e" }])
			.join(
				enter => enter.append("path")
					.attr("class", "handle--custom")
					.attr("fill", "#474747")
					.attr("fill-opacity", 0.8)
					.attr("stroke-width", 0.5)
					.attr("stroke", "#D9D9D9")
					.attr("cursor", "ew-resize")
					.attr("d", arc)
			)
			.attr("display", selection === null ? "none" : null)
			.attr("transform", selection === null ? null : (d, i) => `translate(${selection[i]},${0 - focusPadding})`);

			}
		//var margin = { top: 20, right: 20, bottom: 30, left: 40 }

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
			.call(brush)

		if (persistentSelection === null) {
			gb.call(brush.move, defaultSelection)
		} else {
			gb.call(brush.move, [xScale(persistentSelection[0]), xScale(persistentSelection[1])])
		}

	function brushed() {
		if (d3.event.selection) {
			//focus.property("value", d3.event.selection.map(xScale.invert, xScale));
			focus.dispatch("input");

			[minX, maxX] = d3.event.selection.map(xScale.invert, xScale)
			minY = d3.min(data, d => minX <= d.UTCTimestamp && d.UTCTimestamp <= maxX ? d.value : NaN);
			maxY = d3.max(data, d => minX <= d.UTCTimestamp && d.UTCTimestamp <= maxX ? d.value : NaN);

			lineChart(data, svg)

			d3.select(this).call(brushHandle, d3.event.selection);
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
