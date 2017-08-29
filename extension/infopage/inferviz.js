'use strict';

const margin = {top: 40, right: 10, bottom: 10, left: 10},
      width = 1200 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

const color = char => {
  const scl = d3.scaleLinear()
    .domain(["A".charCodeAt(0), "W".charCodeAt(0)])
    .range([0,1])(char);
  return d3.interpolatePlasma(scl);
}

const treemap = d3.treemap()
  .size([width, height])
  .padding(0);

const div = d3.selectAll("#inferviz")
    .style("position", "relative")
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px")
    .style("left", margin.left + "px")
    .style("top", margin.top + "px");

function getInferenceCounts(error, callback) {
  d3.json("leaves.json", function(error2, cats) {
    if (error2) throw error;

    let counts = [];

    for (let cat of cats) {
      let promise = queryDatabase("get_inference_count", {inference: cat});
      counts.push(promise);
    }

    Promise.all(counts).then(counts => {
      let map = {}
      for (let i = 0; i < counts.length; i++) {
        map[cats[i]] = counts[i];
      }
      callback(map);
    });
  });
}

d3.json("categories.json", function(error, data) {
  if (error) throw error;

  getInferenceCounts(data, leaves => {

  const root = d3.hierarchy(data)
    .sum((d) => {
      let size = d.children ? 0 : leaves[d.name];
      return size;
    });

  const tree = treemap(root);

  const node = div.datum(root).selectAll(".inferviz-node")
      .data(tree.leaves())
    .enter().append("div")
      .attr("class", "inferviz-node")
      .style("left", (d) => d.x0 + "px")
      .style("top", (d) => d.y0 + "px")
      .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
      .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px")
      .style("background", (d) => color(d.parent.data.name.charCodeAt(0)))
      .text((d) => d.data.name);

  });

  // d3.selectAll("#inferviz-form-input").on("change", function change() {
  //   const value = this.value === "count"
  //       ? (d) => { return d.size ? 1 : 0;}
  //       : (d) => { return d.size; };

  //   const newRoot = d3.hierarchy(data, (d) => d.children)
  //     .sum(value);

  //   node.data(treemap(newRoot).leaves())
  //     .transition()
  //       .duration(1500)
  //       .style("left", (d) => d.x0 + "px")
  //       .style("top", (d) => d.y0 + "px")
  //       .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
  //       .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px")
  // });
});

