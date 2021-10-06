var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

var div = d3.select("div.tooltip");

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

d3.json("miserables.json", function (error, graph) {
  if (error) throw error;

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
    .selectAll("g")
    .data(graph.nodes)
    .enter()
    .append("g")
    .attr("class", "nodegroups");

  var circles = node
    .append("circle")
    .attr("r", 7)
    .attr("fill", function (d) {
      return color(d.group);
    });

  // Create a drag handler and append it to the node object instead
  var drag_handler = d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  drag_handler(node);

  var lables = node
    .append("text")
    .text(function (d) {
      return d.id;
    })
    .attr("x", 8)
    .attr("y", 5);

  node.append("title").text(function (d) {
    return d.id;
  });

  simulation.nodes(graph.nodes).on("tick", ticked);

  simulation.force("link").links(graph.links);

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

    node.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  d3.selectAll(".nodegroups")
    .on("mouseover", function (d, i) {
      // console.log(d);
      // console.log(i);
      // console.log(graph.nodes);
      div
        .style("visibility", "visible")
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      let html = d.id + "<br/>" + d.group + "<br/>test<br/>testttt";
      // if (d.in == d.out) html = "User " + d.userID + "<br/>" + d.in + " conns";
      // else html = "User " + d.userID + "<br/>" + d.in + " in, " + d.out + " out";
      div
        .html(html)
        .style("left", d.x + 8 + "px")
        .style("top", d.y + 230 + "px")
        .style("background", color(d.group));
      // .style("width", "700px");
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
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
  div.style("left", d.x + 8 + "px").style("top", d.y + 230 + "px");
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  // d.fx = null;
  // d.fy = null;
}
