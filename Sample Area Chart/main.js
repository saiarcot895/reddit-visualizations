﻿window.onload = start;

function start()
{
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

            chart.yAxis.tickFormat(d3.format(',.d'));

            d3.select("#chart").datum(data).call(chart);

            nv.utils.windowResize(chart.update);
            return chart;
        });
    });
}
