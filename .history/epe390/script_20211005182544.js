// Map group indices to group names

const GROUPS = {
  1: "NYCx Co-Lab Program Managers",
  2: "NYC Government",
  3: "NYS Government",
  4: "Federal Government",
  5: "Northern Manhattan CBOs",
  6: "NYC Civic Tech Organizations",
  7: "Other Tenants' Rights Organizations",
  8: "Other Mental Health Organizations",
  9: "Inwood and Washington Heights Community",
};

let svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

let div = d3.select("div.tooltip");

let color = d3.scaleOrdinal(d3.schemeCategory20);

let simulation = d3
  .forceSimulation()
  .force(
    "link",
    d3
      .forceLink()
      .distance(75)
      .id(function (d) {
        return d.id;
      })
  )
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2));

d3.json("data.json", function (error, graph) {
  if (error) throw error;

  let link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("line")
    .attr("stroke-width", function (d) {
      return Math.sqrt(d.value);
    });

  let node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(graph.nodes)
    .enter()
    .append("g")
    .attr("class", "nodegroups")
    .attr("transform", "translate(100,100)");
  // .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  let circles = node
    .append("circle")
    .attr("r", 7)
    .attr("fill", function (d) {
      return color(d.group);
    });

  // Create a drag handler and append it to the node object instead
  let drag_handler = d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  drag_handler(node);

  let lables = node
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

  node
    .on("mouseover", function (d, i) {
      // console.log(d);
      // console.log(i);
      // console.log(graph.nodes);
      div
        .style("visibility", "visible")
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      let html =
        "<b>" +
        d.long +
        "</b><br/><br/><i>Type: " +
        GROUPS[d.group] +
        "</i><br/><br/>test";
      // if (d.in == d.out) html = "User " + d.userID + "<br/>" + d.in + " conns";
      // else html = "User " + d.userID + "<br/>" + d.in + " in, " + d.out + " out";
      div
        .html(html)
        .style("left", d.x + 8 + "px")
        .style("top", d.y + 220 + "px")
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

  // console.log(d3.selectAll(".nodegroups"));
  // console.log(node);
  node.each(function (d, i) {
    console.log(d);
    switch (d.id) {
      case "MOCTO":
        d.x = -50;
        d.y = -100;
        break;
      case "NYCEDC":
        d.x = 0;
        d.y = 0;
        break;
      default:
        break;
    }
    // d.x = d.y = (width / 34) * i;
  });

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    div.style("left", d.x + 8 + "px").style("top", d.y + 220 + "px");
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    // d.fx = null;
    // d.fy = null;
  }
});
