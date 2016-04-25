﻿nv.utils.initSVG = function(svg) {
};

var tooltip = nv.models.tooltip();

function updateTooltip(data) {
	var tooltipData = {
		series: [
		{
			color: "transparent",
			key: data.sname + " and " + data.tname,
			value: data.svalue
		}
		],
		point: {
			x: window.event.clientX,
			y: window.event.clientY
		}
	};
	tooltip.data(tooltipData).hidden(false);
}

function tooltipHide() {
	tooltip.hidden(true);
}

window.onload = function () {
	var filters = {};
	var csvEdges;
	var colors;
	var diagram;

	var update = function() {
		diagram(csvEdges.filter(function (d) {
			return !filters[d.subreddit1].hide && !filters[d.subreddit2].hide;
		}));
	}

	tooltip.contentGenerator(function(d) {
		if (d === null) {
			return '';
		}
		var htmlView = d3.select(document.createElement("div"));
		htmlView.append('p').append('b').text(d.series[0].key);
		htmlView.append('p').text(d.series[0].value);
		return htmlView.node().outerHTML;
	});

	d3.json("daySubredditBreakdown-transformed.json", function (data) {
		nv.addGraph(function ()	{
			var chart = nv.models.stackedAreaChart()
				.margin({ right: 100 })
				.x(function (d) { return d[0] * 1000; })
				.y(function (d) { return d[1]; })
				.useInteractiveGuideline(false)
				.showControls(false)
				.showLegend(false)
				.clipEdge(true);

			chart.xAxis.tickFormat(function (d) { return d3.time.format('%x')(new Date(d)) });
			chart.xAxis.axisLabel("Date");

			chart.yAxis.tickFormat(d3.format(',f'));
			chart.yAxis.axisLabel("Number of comments");

			data.forEach(function(d, i) {
				filters[d.key] = {};
				if (i >= 10) {
					d.disabled = true;
					filters[d.key].hide = true;
				} else {
					d.disabled = false;
					filters[d.key].hide = false;
				}
			});

			d3.select("#chart").datum(data).call(chart);

			colors = chart.stacked.color();

			d3.csv('posts-edge-list.csv', function(row) {
				row.authorCount = +row.authorCount;
				return row;
			}, function (err, data) {
				diagram = chordDiagram(colors);
				csvEdges = data;
				update();
				nv.utils.windowResize(function() {
					$("#chordDiagram").empty();
					diagram = chordDiagram(colors);
					update();
				});
			});

			d3.select(".panel-body")
				.selectAll("button")
				.data(data)
				.enter()
				.append("button")
				.classed("btn btn-primary filterBtn", true)
				.classed("active", function(d) {
					return !d.disabled;
				})
			    .attr("type", "button")
				.attr("data-toggle", "button")
				.attr("autocomplete", "off")
				.attr("aria-pressed", function(d) {
					return !d.disabled;
				})
			    .text(function(d) {
				    return d.key;
			    })
			    .on("click", function(d) {
				    filters[d.key].hide = !filters[d.key].hide;
				    d.disabled = !d.disabled;
				    chart.update();
				    chart.stacked.dispatch.on("areaClick.toggle", null);
				    update();
				    this.blur();
			    });

			nv.utils.windowResize(chart.update);
			chart.stacked.dispatch.on("elementMouseover.darken", function (d)
			{
			    hoverArea(d);
			    dimChords({ "_id": d.series[0].key });
			});
			chart.stacked.dispatch.on("elementMouseout.darken", function(d) {
			    leaveArea(d);
			    resetChords();
			});
			chart.stacked.dispatch.on("areaMouseover.darken", function (d)
			{
			    dimChords({ "_id": d.series });
			});
			chart.stacked.dispatch.on("areaMouseout.darken", function(d) {
			    resetChords();
			});
			chart.stacked.dispatch.on("areaClick.toggle", null);
			chart.stacked.dispatch.on("elementClick.link", function(d) {
				var subreddit = d.series.key;
				var timestamp = d.point[0];
				var link = "https://www.reddit.com/r/"
					+ subreddit
					+ "/search?rank=title&q=timestamp%3A"
					+ timestamp + ".."
					+ (timestamp + 86400) 
					+ "&restrict_sr=on&syntax=cloudsearch";
				window.open(link);
			});
			chart.stacked.dispatch.on("elementMouseover.link", function(d) {
				$("body").css("cursor", "pointer");
			});
			chart.stacked.dispatch.on("elementMouseout.link", function(d) {
				$("body").css("cursor", "");
			});

			return chart;
		});

		$("#search-text").on("input", function() {
			$(".panel-body > button").each(function(i) {
				if ($(this).text().toUpperCase()
						.startsWith($("#search-text").val().toUpperCase())) {
					$(this).show();
				} else {
					$(this).hide();
				}
			});
		});
	});

};

function hoverArea(d)
{
    $('.nv-area-' + d.seriesIndex).addClass("hover");
    
}

function leaveArea(d)
{
    $('.nv-area-' + d.seriesIndex).removeClass("hover");
}
