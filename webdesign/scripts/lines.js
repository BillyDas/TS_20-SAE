var loading;

var persistentSelection = null;
var sensorNameCache = {}; // might be redundant now that i'm storing it all
var sensorDescCache = [];
var xAxisCache = {};

var chartDiv = document.getElementById("chart");
var focusDiv = document.getElementById("focus");
var padding = 100;
var firstUpdate = true;

var startDateTime = moment("2020-08-23T16:50:05.970327").format('YYYY-MM-DDTHH:mm:ss.SSS');;
var endDateTime = moment("2020-08-23T16:55:05.970327").format('YYYY-MM-DDTHH:mm:ss.SSS');;

var minX, maxX, minY, maxY = null;

var xAxisDataId = "";
var yAxisDataId = "";

var hostUrl = window.location.origin;
if (hostUrl == null){
	hostUrl = "http://ts20.billydasdev.com";
}


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

	// loadingImgRand = Math.floor(Math.random() * 2);
	loading = d3.select(loadingGraph);
	// TODO: make these NOT discord links...
	//if (loadingImgRand == 0) {
	//	document.getElementById("loadingImg").src = "https://cdn.discordapp.com/attachments/691821735124795448/752082980218077184/loading.gif";
	//} else {
	//	document.getElementById("loadingImg").src = "https://cdn.discordapp.com/attachments/691821735124795448/760064192731807754/waddle2.gif";
	//}
	
	loading.style("display", "block");

	//select svg area
	var svg = d3.select(chartDiv).select("svg");
	var focus = d3.select(focusDiv).select("svg");


	var xAxisIds = xAxisDataId;

	// list of sensors available
	var yAxisIds = yAxisDataId;

	// format strings for use in GET request
	for (var i = 0; i < yAxisIds.length; i++) {
		if (!yAxisIds[i].includes('"')){
			yAxisIds[i] = '"' + yAxisIds[i] + '"';
		}
	}
	if (xAxisIds != "")
	{
		xAxisIds = '"' + xAxisIds + '"';
	}
	

	var url = hostUrl + ":3000/data?canId=["
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

			let xAxisData = null;
			url = hostUrl + ":3000/desc?canId=[" + yAxisIds.toString() + "]"

			fetch(url)
				.then(response => response.json())
				.then(sensorDesc => {
					sensorDescCache = [];
					sensorNameCache = {};

					sensorDesc.forEach(function (d) {
						sensorDescCache.push(d);

						sensorNameCache[d.CanId] = d.Name + ' (' + d.UnitMetric + ')';
					})

					
					if (xAxisIds != "") {
						var url = hostUrl + ":3000/data?canId=["
						+ xAxisIds.toString()
						+ "]&startTime='" + startDateTime
						+ "'&endTime='" + endDateTime + "'"
						+ "&max=200000";

						fetch(url)
							.then(response => response.json())
							.then(xAxisData => {
								xAxisData.forEach(function (d) {
									d.UTCTimestamp = Date.parse(d.UTCTimestamp)
									d.Data = parseFloat(d.Data)
								})

								url = hostUrl + ":3000/desc?canId=[" + xAxisIds.toString() + "]";
								fetch(url)
									.then(response => response.json())
									.then(xAxisDesc => {
										xAxisCache = {};

										xAxisDesc.forEach(function (d) {
											xAxisCache[d.CanId] = d.Name + ' (' + d.UnitMetric + ')';
										})

										// hide loading graphic
										loading.style("display", "none");
										
										// draw line chart
										lineChart(lineData, svg, xAxisData);
										focusChart(lineData, svg, focus, xAxisData);
										
										if (firstUpdate) {
											// add listener to draw on resize
											window.addEventListener("resize", function () {
												lineChart(lineData, svg, xAxisData);
												focusChart(lineData, svg, focus, xAxisData);
											});
											firstUpdate = false;
										}
									})
							});

					} else {
						// hide loading graphic
						loading.style("display", "none");
						
						// draw line chart
						lineChart(lineData, svg, xAxisData);
						focusChart(lineData, svg, focus, xAxisData);
						
						if (firstUpdate) {
							// add listener to draw on resize
							window.addEventListener("resize", function () {
								lineChart(lineData, svg);
								focusChart(lineData, svg, focus);
							});
							firstUpdate = false;
						}
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

function lineChart(data, svg, xAxisData = null) {

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


	if (xAxisData != null) {
		// TODO: this is a terrible TERRIBLE TERRIBLE way of doing it, PLEASE fix
		data.forEach(function(d) {
			d.UTCTimestamp = Math.round(d.UTCTimestamp / 500) * 500;
		})

		xAxisData.forEach(function(d) {
			d.UTCTimestamp = Math.round(d.UTCTimestamp / 500) * 500;
		})

		let extraData = [];
		// data.forEach(function(a) {
		// 	let result = xAxisData.filter(function(b) {
		// 		return b.UTCTimestamp == a.UTCTimestamp;
		// 	});

		// 	if (result.length == 0) {
				
		// 	}
		// })

		let droppedData = 0;

		// god has abandoned us
		data = data.filter(function(a) {
			let result = xAxisData.filter(function(b) {
				return b.UTCTimestamp == a.UTCTimestamp;
			});


			if (result.length == 0) {
				droppedData++;
				return false;
			} else {
				a.xAxisVal = result[0].Data;

				let dupe;

				dupe = Object.assign({}, a);
				// console.log(a);
				// console.log(dupe);

				for (let i = 1; i < result.length; i++) {
					dupe.xAxisVal = result[1].Data;
					extraData.push(dupe);
				}
				
				return true;
			}
		});

		//?
		data.push(...extraData);

		//alert("Dropped " + droppedData + " points of data.");
	}

	

	// group data based on CanId
	var sumstat = d3.nest()
		.key(function (d) { return d.CanId; })
		.entries(data);


	// http://bl.ocks.org/weiglemc/6185069
	// https://www.d3-graph-gallery.com/graph/scatter_basic.html
	// http://learnjsdata.com/combine_data.html


	var xScale = null;
	if (xAxisData != null) {
		if (minX != null && maxX != null) {
			xScale = d3.scaleLinear()
				.domain([minX, maxX])
				.range([dynamicPaddingLeft, (w - w * 0.1) - padding]) // temp fix for names not fitting
			//.nice();
		} else {
			xScale = d3.scaleLinear()
			.domain(d3.extent(xAxisData, function (d) { return d.Data; }))
			.range([dynamicPaddingLeft, (w - w * 0.1) - padding]);
			//.nice();
		}
	} else {
		if (minX != null && maxX != null) {
			xScale = d3.scaleTime()
				.domain([minX, maxX])
				.range([dynamicPaddingLeft, (w - w * 0.1) - padding]) // temp fix for names not fitting
			//.nice();
		} else {
			// set x axis to scale based on times
			xScale = d3.scaleTime()
				.domain(d3.extent(data, function (d) { return d.UTCTimestamp; }))
				.range([dynamicPaddingLeft, w - padding])
			//.nice();
		}	
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
		// TODO: no! no! no!
		// need another api request to get the data for x axis sensor,,, this is temporary hack 
		///.text((xAxisData != null) ? document.getElementById("xAxisSelectPicker").options[document.getElementById("xAxisSelectPicker").selectedIndex].text : "Time");
		.text((xAxisData != null) ? xAxisCache[Object.keys(xAxisCache)[0]] : "Time");


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

	// if x axis isnt time:
	if (xAxisData != null) {
		// every line is pain

		// const g = svg.append("g")
		// 	.attr("fill", "none")
		// 	.attr("stroke-linecap", "round");

		// sumstat.forEach(function(d) {
		// 	g.selectAll(".path")
		// 	.data(d.values)
		// 	.join("path")
		// 		.attr("d", function (d) { return `M${xScale(d.xAxisVal)},${yScale(d.Data)}h0` } )
		// 		.attr("stroke", function (d) { return color(d.CanId) })
		// 	.attr("clip-path", "url(#chartClip)");
		// })
		



		sumstat.forEach(function(d) {
			svg.selectAll(".dot")
				.data(d.values)
				.enter()
				.append("circle")
					.attr("cx", function(d) { return xScale(d.xAxisVal) } )
					.attr("cy", function (d) { return yScale(d.Data) } )
					.attr("r", 2)
					.attr("opacity", 0.3)
					.style("fill", function (d) { return color(d.CanId)
				}).attr("clip-path", "url(#chartClip)");
		})

	

	} else {
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
			}).attr("clip-path", "url(#chartClip)");
	}

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

// TODO: add scatterplot support
function focusChart(data, svg, focus, xAxisData = null) {
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

		if (xAxisData != null) {
			// TODO: this is a terrible TERRIBLE TERRIBLE way of doing it, PLEASE fix
			data.forEach(function(d) {
				d.UTCTimestamp = Math.round(d.UTCTimestamp / 500) * 500;
			})
	
			xAxisData.forEach(function(d) {
				d.UTCTimestamp = Math.round(d.UTCTimestamp / 500) * 500;
			})
	
			let extraData = [];
			// data.forEach(function(a) {
			// 	let result = xAxisData.filter(function(b) {
			// 		return b.UTCTimestamp == a.UTCTimestamp;
			// 	});
	
			// 	if (result.length == 0) {
					
			// 	}
			// })
	
			let droppedData = 0;
	
			// god has abandoned us
			data = data.filter(function(a) {
				let result = xAxisData.filter(function(b) {
					return b.UTCTimestamp == a.UTCTimestamp;
				});
	
	
				if (result.length == 0) {
					droppedData++;
					return false;
				} else {
					a.xAxisVal = result[0].Data;
	
					let dupe;
	
					dupe = Object.assign({}, a);
					// console.log(a);
					// console.log(dupe);
	
					for (let i = 1; i < result.length; i++) {
						dupe.xAxisVal = result[1].Data;
						extraData.push(dupe);
					}
					
					return true;
				}
			});
	
			//?
			data.push(...extraData);
	
			//alert("Dropped " + droppedData + " points of data.");
		}

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



		var xScale = null;
		if (xAxisData != null) {
			xScale = d3.scaleLinear()
				.domain(d3.extent(xAxisData, function (d) { return d.Data; }))
				.range([padding, w - padding])
				//.nice();
		} else {
			if (minX != null && maxX != null) {
				xScale = d3.scaleTime()
					.domain([minX, maxX])
					.range([padding, w - padding])
				//.nice();
			}
			else {
				// set x axis to scale based on times
				xScale = d3.scaleTime()
					.domain(d3.extent(data, function (d) { return d.UTCTimestamp; }))
					.range([padding, w - padding])
				//.nice();
			}	
		}

		// var xScale = null;
		// if (xAxisData != null) {
		// 	if (minX != null && maxX != null) {
		// 		xScale = d3.scaleLinear()
		// 			.domain([minX, maxX])
		// 			.range([dynamicPaddingLeft, (w - w * 0.1) - padding]) // temp fix for names not fitting
		// 		//.nice();
		// 	} else {
		// 		xScale = d3.scaleLinear()
		// 		.domain(d3.extent(xAxisData, function (d) { return d.Data; }))
		// 		.range([dynamicPaddingLeft, (w - w * 0.1) - padding]);
		// 		//.nice();
		// 	}
		// } else {
		// 	if (minX != null && maxX != null) {
		// 		xScale = d3.scaleTime()
		// 			.domain([minX, maxX])
		// 			.range([dynamicPaddingLeft, (w - w * 0.1) - padding]) // temp fix for names not fitting
		// 		//.nice();
		// 	} else {
		// 		// set x axis to scale based on times
		// 		xScale = d3.scaleTime()
		// 			.domain(d3.extent(data, function (d) { return d.UTCTimestamp; }))
		// 			.range([dynamicPaddingLeft, w - padding])
		// 		//.nice();
		// 	}	
		// }

		
		// // set x axis to scale based on times
		// var xScale = d3.scaleTime()
		// 	.domain(d3.extent(data, function (d) { return d.UTCTimestamp; }))
		// 	.range([padding, w - padding])
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


		// if x axis isnt time:
		if (xAxisData != null) {
			// every line is pain
			sumstat.forEach(function(d) {
				focus.selectAll(".dot")
					.data(d.values)
					.enter()
					.append("circle")
						.attr("cx", function(d) { return xScale(d.xAxisVal) } )
						.attr("cy", function (d) { return focusYScale(d.Data) } )
						.attr("r", 2)
						.attr("opacity", 0.3)
						.style("fill", function (d) { return color(d.CanId)})
			})
			// const g2 = focus.append("g")
			// .attr("fill", "none")
			// .attr("stroke-linecap", "round");

			// sumstat.forEach(function(d) {
			// 	g2.selectAll(".path")
			// 	.data(d.values)
			// 	.join("path")
			// 		.attr("d", function (d) { return `M${xScale(d.xAxisVal)},${focusYScale(d.Data)}h0` } )
			// 		.attr("stroke", function (d) { return color(d.CanId) });
			// })
		

		} else {
			// add sensors as lines to the svg
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
				})
				//.attr("clip-path", "url(#chartClip)");
		}




		// focus.selectAll(".line")
		// 	.data(sumstat)
		// 	.enter()
		// 	.append("path")
		// 	.attr("class", "line")
		// 	.attr("fill", "none")
		// 	.attr("stroke", function (d) { return color(d.key); })
		// 	.attr("stroke-width", 1.5)
		// 	.attr("d", function (d) {
		// 		return d3.line()
		// 			.x(function (d) { return xScale(d.UTCTimestamp); })
		// 			.y(function (d) { return focusYScale(d.Data); })
		// 			(d.values)
		// 	});

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

			// TODO always chart linechart here, temp for scatterplot performance issues
			if (xAxisData == null) {
				lineChart(data, svg, xAxisData)
			}
			

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
			
			// TODO, remove this
			if (xAxisData != null)
			{
				lineChart(data, svg, xAxisData)
			}
		}
	}
}

// run init on window load
$(document).ready(function () {
	initLines();
});
