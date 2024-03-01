import React from "react";
import ReactBubbleChart from "react-bubble-chart";

import d3 from 'd3'

export default class BubbleChart extends React.Component {

  render() {

    var data = this.props.data.map(d => {
      return {
        _id: d._id,
        value: d.value,
      };
    });

    console.log("ring" + data)

    return (
      <ReactBubbleChart
        data={data}
      />
    );
  }
}
