// Map group indices to group names

const GROUPS = {
  1: "NYCx Co-Lab Program Managers",
  2: "NYC Government",
  3: "NYS Government",
  4: "Federal Government",
  5: "Northern Manhattan CBOs",
  6: "NYC Civic Tech Organizations",
  7: "Tenants' Rights Organizations",
  8: "Mental Health Organizations",
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
      .distance(150)
      .id(function (d) {
        return d.id;
      })
  )
  .force("charge", d3.forceManyBody().strength(-3));
//.force("center", d3.forceCenter(width / 2, height / 2));

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
    .attr("transform", "translate(100,100)")
    .on("dblclick", function unstick(d) {
      console.log(d);
      d.fx = null;
      d.fy = null;
      d.fixed = false;
    });
  // .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  let circles = node
    .append("circle")
    .attr("r", function (d) {
      switch (d.id) {
        case "MOCTO + NYCEDC":
          return 11;
        case "Heat Seek":
          return 11;
        case "JustFix.nyc":
          return 11;
        case "NextStep HealthTech":
          return 11;
        case "Me, Myself, & I":
          return 11;
        case "Inwood and Washington Heights Community":
          return 15;
        default:
          return 7;
      }
    })
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

  let labels = node
    .append("text")
    .text(function (d) {
      return d.id;
    })
    .attr("x", function (d) {
      switch (d.id) {
        case "MOCTO + NYCEDC":
          return 12;
        case "Heat Seek":
          return 12;
        case "JustFix.nyc":
          return 12;
        case "NextStep HealthTech":
          return 12;
        case "Me, Myself, & I":
          return 12;
        case "Inwood and Washington Heights Community":
          return 16;
        default:
          return 8;
      }
    })
    .attr("y", 5)
    .attr("font-weight", function (d) {
      if (d.id === "Inwood and Washington Heights Community") {
        return "bold";
      } else {
        return "normal";
      }
    });

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
        .style("opacity", 0.95);
      let html =
        "<b>" +
        d.long +
        "</b><br/><br/><i>Type: " +
        GROUPS[d.group] +
        "</i><br/><br/>" +
        d.desc;
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

  node.each(function (d, i) {
    switch (d.id) {
      case "MOCTO + NYCEDC":
        d.fx = width / 2;
        d.fy = height / 4;
        d.fixed = true;
        break;
      case "Inwood and Washington Heights Community":
        d.fx = width / 2;
        d.fy = (3 * height) / 4;
        d.fixed = true;
        break;
      case "HRA":
        d.fx = 40;
        d.fy = (3 * height) / 4 - 30;
        d.fixed = true;
        break;
      case "Manhattan DA":
        d.fx = 40;
        d.fy = (3 * height) / 4;
        d.fixed = true;
        break;
      case "OTDA":
        d.fx = 170;
        d.fy = (3 * height) / 4;
        d.fixed = true;
        break;
      case "HUD":
        d.fx = 40;
        d.fy = (3 * height) / 4 + 30;
        d.fixed = true;
        break;
      case "Other Tenants' Rights Organizations":
        d.fx = 110;
        d.fy = (3 * height) / 4 + 30;
        d.fixed = true;
        break;
      case "Community Board 12":
        d.fx = width / 2 - 160;
        d.fy = (3 * height) / 4 + 60;
        d.fixed = true;
        break;
      case "NYC Council Member Rodríguez":
        d.fx = width / 2 + 10;
        d.fy = (3 * height) / 4 + 60;
        d.fixed = true;
        break;
      case "NYS Assembly Member De La Rosa":
        d.fx = width / 2 - 200;
        d.fy = (3 * height) / 4 + 90;
        d.fixed = true;
        break;
      case "NYS Senator Jackson":
        d.fx = width / 2 + 70;
        d.fy = (3 * height) / 4 + 90;
        d.fixed = true;
        break;
      case "DOHMH":
        d.fx = width - 265;
        d.fy = (3 * height) / 4;
        d.fixed = true;
        break;
      case "NYC Health + Hospitals":
        d.fx = width - 175;
        d.fy = (3 * height) / 4;
        d.fixed = true;
        break;
      case "OMH":
        d.fx = width - 310;
        d.fy = (3 * height) / 4 + 30;
        d.fixed = true;
        break;
      case "Other Mental Health Organizations":
        d.fx = width - 245;
        d.fy = (3 * height) / 4 + 30;
        d.fixed = true;
        break;
      case "Heat Seek":
        d.fx = width / 8;
        d.fy = height / 2;
        d.fixed = true;
        break;
      case "PEU":
        d.fx = width / 8;
        d.fy = height / 2 + 50;
        d.fixed = true;
        break;
      case "JustFix.nyc":
        d.fx = (3 * width) / 8;
        d.fy = height / 2;
        d.fixed = true;
        break;
      case "Manhattan Legal Services":
        d.fx = (3 * width) / 8;
        d.fy = height / 2 - 50;
        d.fixed = true;
        break;
      case "Met Council on Housing":
        d.fx = (3 * width) / 8 - 160;
        d.fy = height / 2 + 40;
        d.fixed = true;
        break;
      case "NMIC":
        d.fx = (3 * width) / 8 + 90;
        d.fy = height / 2 + 40;
        d.fixed = true;
        break;
      case "NextStep HealthTech":
        d.fx = (5 * width) / 8;
        d.fy = height / 2;
        d.fixed = true;
        break;
      case "Me, Myself, & I":
        d.fx = (7 * width) / 8;
        d.fy = height / 2;
        d.fixed = true;
        break;
      case "Inwood and Washington Heights Schools":
        d.fx = (6 * width) / 8;
        d.fy = height / 2 - 70;
        d.fixed = true;
        break;
      case "MOCMH":
        d.fx = (13 * width) / 16;
        d.fy = height / 2 - 140;
        d.fixed = true;
        break;
      case "NYC Council Committee on Technology":
        d.fx = width / 2;
        d.fy = height / 4 - 30;
        d.fixed = true;
        break;
      case "Other Northern Manhattan CBOs":
        d.fx = width / 2 - 70;
        d.fy = height / 4 - 60;
        d.fixed = true;
        break;
      case "HPD":
        d.fx = width / 4;
        d.fy = height / 4 - 30;
        d.fixed = true;
        break;
      case "MOPT":
        d.fx = width / 4 - 100;
        d.fy = height / 4 - 30;
        d.fixed = true;
        break;
      case "Representative Adriano Espaillat":
        d.fx = (6 * width) / 8;
        d.fy = height / 2 + 70;
        d.fixed = true;
        break;
      case "Representative Adriano Espaillat":
        d.fx = (6 * width) / 8;
        d.fy = height / 2 + 70;
        d.fixed = true;
        break;
      default:
        break;
    }
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
