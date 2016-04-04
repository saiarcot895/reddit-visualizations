window.onload = start;

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

            data.forEach(function(d, i) {
                d.disabled = (i >= 10);
            });

            d3.select("#chart").datum(data).call(chart);

            /*d3.select("#top10Button").on('click', function() {
                data.forEach(function(d, i) {
                    d.disabled = (i >= 10);
                });
                chart.update();
            });

            d3.select("#top25Button").on('click', function() {
                data.forEach(function(d, i) {
                    d.disabled = (i >= 25);
                });
                chart.update();
            });

            d3.select("#allButton").on('click', function() {
                data.forEach(function(d, i) {
                    d.disabled = false;
                });
                chart.update();
            });*/

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
                    d.disabled = !d.disabled;
                    chart.update();
                });

            nv.utils.windowResize(chart.update);

            return chart;
        });
    });
}
