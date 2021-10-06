var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");
var toggle = 0;
var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3
  .forceSimulation()
  .force(
    "link",
    d3.forceLink().id(function (d) {
      return d.id;
    })
  )
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2));

var stuff = document.getElementById("mis").innerHTML;
var graph = JSON.parse(stuff);

svg
  .append("rect")
  .attr("width", width)
  .attr("height", height)
  .style("fill", "none")
  .style("pointer-events", "all")
  .call(
    d3
      .zoom()
      .scaleExtent([1 / 2, 4])
      .on("zoom", zoomed)
  );

var link = svg
  .append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(graph.links)
  .enter()
  .append("line")
  .attr("stroke-width", function (d) {
    return Math.sqrt(d.value);
  });

var node = svg
  .append("g")
  .attr("class", "nodes")
  .selectAll("circle")
  .data(graph.nodes)
  .enter()
  .append("circle")
  .attr("r", function (d) {
    return d.group === 1 ? 10 : 5;
  })
  .attr("fill", function (d) {
    return color(d.group);
  })
  .style("stroke", function (d) {
    return d.group === 1 ? "black" : "";
  })
  .call(
    d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  )
  .on("dblclick", connectedNodes);

node.append("svg:title", "fsdfds").text(function (d) {
  return d.id + "\n" + "aaa";
});

simulation.nodes(graph.nodes).on("tick", ticked);

simulation.force("link").links(graph.links);

function zoomed() {
  node.attr("transform", d3.event.transform);
  link.attr("transform", d3.event.transform);
}

function ticked() {
  link
    .attr("x1", function (d) {
      return d.source.x;
    })
    .attr("y1", function (d) {
      return d.source.y;
    })
    .attr("x2", function (d) {
      return d.target.x;
    })
    .attr("y2", function (d) {
      return d.target.y;
    });
  // node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  node
    .attr("cx", function (d) {
      return d.x;
    })
    .attr("cy", function (d) {
      return d.y;
    });
}

var linkedByIndex = {};
for (i = 0; i < graph.nodes.length; i++) {
  linkedByIndex[i + "," + i] = 1;
}
graph.links.forEach(function (d) {
  linkedByIndex[d.source.index + "," + d.target.index] = 1;
});

function neighboring(a, b) {
  return linkedByIndex[a.index + "," + b.index];
}

function connectedNodes() {
  if (toggle == 0) {
    var d = d3.select(this).node().__data__;
    node.style("opacity", function (o) {
      return neighboring(d, o) | neighboring(o, d) ? 1 : 0.15;
    });
    toggle = 1;
  } else {
    node.style("opacity", 1);
    toggle = 0;
  }
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  //d.fx = null;
  //d.fy = null;
}

var div = d3.select("div.tooltip");
d3.selectAll(".circle")
  .on("mouseover", function (d, i) {
    console.log(d);
    console.log(i);
    console.log(graph.nodes);
    div
      .style("visibility", "visible")
      .transition()
      .duration(200)
      .style("opacity", 0.9);
    var html = "test";
    // if (d.in == d.out) html = "User " + d.userID + "<br/>" + d.in + " conns";
    // else html = "User " + d.userID + "<br/>" + d.in + " in, " + d.out + " out";
    div
      .html(html)
      .style("left", d.x + 15 + "px")
      .style("top", d.y - 30 + "px");
  })
  .on("mouseout", function (d, i) {
    div
      .transition()
      .duration(500)
      .style("opacity", 0)
      .on("end", function () {
        div.style("visibility", "hidden");
      });
  });
