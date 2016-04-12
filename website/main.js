window.onload = start;

function start()
{
	var filters = {};
	var tooltip = {};
	var csvEdges;
	var diagram = chordDiagram();

	var updateTooltip = function(data) {
		tooltip = data;
	}

	var update = function(data, diagram) {
		diagram(data.filter(function (d) {
			return !(
					(filters[d.subreddit1] && filters[d.subreddit1].hide)
					|| (filters[d.subreddit2] && filters[d.subreddit2].hide)
					);
		}));
	}

    d3.json("daySubredditBreakdown-transformed.json", function (data)
    {
        nv.addGraph(function ()
        {
            var chart = nv.models.stackedAreaChart()
                                .margin({ right: 100 })
                                .x(function (d) { return d[0] * 1000; })
                                .y(function (d) { return d[1]; })
                                .useInteractiveGuideline(false)
                                .showControls(false)
                                .showLegend(false)
                                .clipEdge(true);

            chart.xAxis.tickFormat(function (d) { return d3.time.format('%x')(new Date(d)) });

            chart.yAxis.tickFormat(d3.format(',f'));

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

            d3.select(".panel-body")
                .selectAll("button")
                .data(data)
                .enter()
                .append("button")
                .classed("btn btn-primary", true)
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
					update(csvEdges, diagram);
                });

            nv.utils.windowResize(chart.update);
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
            })

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

	d3.csv('posts-edge-list.csv', function(row) {
		row.authorCount = +row.authorCount;
		return row;
	}, function (err, data) {
		csvEdges = data;
		update(csvEdges, diagram);
	});
}
