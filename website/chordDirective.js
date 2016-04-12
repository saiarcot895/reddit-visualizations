function chordDiagram(colors) {
    var size = [750, 750]; // SVG SIZE WIDTH, HEIGHT
    var marg = [50, 50, 50, 50]; // TOP, RIGHT, BOTTOM, LEFT
    var dims = []; // USABLE DIMENSIONS
    dims[0] = size[0] - marg[1] - marg[3]; // WIDTH
    dims[1] = size[1] - marg[0] - marg[2]; // HEIGHT

    var chord = d3.layout.chord()
        .padding(0.02)
        .sortGroups(d3.descending)
        .sortSubgroups(d3.ascending);

    var matrix = chordMatrix()
        .layout(chord)
        .filter(function (item, r, c) {
            return (item.subreddit1 === r.name && item.subreddit2 === c.name) ||
                (item.subreddit1 === c.name && item.subreddit2 === r.name);
        })
    .reduce(function (items, r, c) {
        var value;
        if (!items[0]) {
            value = 0;
        } else {
            value = items.reduce(function (m, n) {
                if (r === c) {
                    return m + (n.authorCount * 2);
                } else {
                    return m + (n.authorCount);
                }
            }, 0);
        }
        return {value: value, data: items};
    });

    var innerRadius = (dims[1] / 2) - 100;

    var arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(innerRadius + 20);

    var path = d3.svg.chord()
        .radius(innerRadius);

    var svg = d3.select("#chordDiagram")
        .attr("preserveAspectRatio", "xMinYMin")
        .attr("viewBox", "0 0 " + size[0] + " " + size[1]);

    var container = svg.append("g")
        .attr("class", "container")
        .attr("transform", "translate(" + ((dims[0] / 2) + marg[3]) + "," + ((dims[1] / 2) + marg[0]) + ")");

    var messages = svg.append("text")
        .attr("class", "messages")
        .attr("transform", "translate(10, 10)")
        .text("Updating...");

    var drawChords = function (data) {

        messages.attr("opacity", 1);
        messages.transition().duration(1000).attr("opacity", 0);

        matrix.data(data)
            .resetKeys()
            .addKeys(['subreddit1', 'subreddit2'])
            .update()

            var groups = container.selectAll("g.group")
            .data(matrix.groups(), function (d) { return d._id; });

        var gEnter = groups.enter()
            .append("g")
            .attr("class", "group");

        gEnter.append("path")
            .style("pointer-events", "none")
            .style("fill", function (d) {
                var buttons = $(".panel-body > button");
                var index = -1;
                for (var i = 0; i < buttons.length; i++) {
                    if ($(buttons[i]).text() == d._id) {
                        index = i;
                        break;
                    }
                }
                return colors(index);
            })
            .attr("d", arc);

        gEnter.append("text")
            .attr("dy", ".35em")
            .on("click", groupClick)
            .on("mouseover", dimChords)
            .on("mouseout", resetChords)
            .text(function (d) {
                return d._id;
            });

        groups.select("path")
            .transition().duration(2000)
            .attrTween("d", matrix.groupTween(arc));

        groups.select("text")
            .transition()
            .duration(2000)
            .attr("transform", function (d) {
                d.angle = (d.startAngle + d.endAngle) / 2;
                var r = "rotate(" + (d.angle * 180 / Math.PI - 90) + ")";
                var t = " translate(" + (innerRadius + 26) + ")";
                return r + t + (d.angle > Math.PI ? " rotate(180)" : " rotate(0)"); 
            })
        .attr("text-anchor", function (d) {
            return d.angle > Math.PI ? "end" : "begin";
        });

        groups.exit().select("text").attr("fill", "orange");
        groups.exit().select("path").remove();

        groups.exit().transition().duration(1000)
            .style("opacity", 0).remove();

        var chords = container.selectAll("path.chord")
            .data(matrix.chords(), function (d) { return d._id; });

        chords.enter().append("path")
            .attr("class", "chord")
            .style("fill", function (d) {
                var buttons = $(".panel-body > button");
                var index = -1;
                for (var i = 0; i < buttons.length; i++) {
                    if ($(buttons[i]).text() == d.source._id) {
                        index = i;
                        break;
                    }
                }
                return colors(index);
            })
        .attr("d", path)
            .on("mouseover", chordMouseover)
            .on("mouseout", hideTooltip);

        chords.transition().duration(2000)
            .attrTween("d", matrix.chordTween(path));

        chords.exit().remove();

        function groupClick(d) {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            var link = "https://www.reddit.com/r/" + d._id;
            window.open(link);
        }

        function chordMouseover(d) {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            dimChords(d);
            d3.select("#tooltip").style("opacity", 1);
            updateTooltip(matrix.read(d));
        }

        function hideTooltip() {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            d3.select("#tooltip").style("opacity", 0);
            resetChords();
        }

        function resetChords() {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            container.selectAll("path.chord").style("opacity",0.9);
        }

        function dimChords(d) {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            container.selectAll("path.chord").style("opacity", function (p) {
                if (d.source) { // COMPARE CHORD IDS
                    return (p._id === d._id) ? 0.9: 0.1;
                } else { // COMPARE GROUP IDS
                    return (p.source._id === d._id || p.target._id === d._id) ? 0.9: 0.1;
                }
            });
        }
    }; // END DRAWCHORDS FUNCTION

    return drawChords;
};
