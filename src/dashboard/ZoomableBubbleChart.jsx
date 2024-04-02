import React from "react";
import ReactBubbleChart from "react-bubble-chart";

export default class ZoomableBubbleChart extends React.Component {
  state = {
    key: 'start',
    data: this.props.data
  };

  render() {
    return (
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactBubbleChart
          {...this.props}
          className="chart__bubble"
          key={this.state.key}
          data={this.state.data}
          onClick={this.handleClick}
        />
      </div>
    );
  }

  handleClick = data => {
    const isGroup = data.children !== undefined;

    this.setState(() => ({
      key: isGroup ? data.children._id : 'updated',
      data: isGroup ? data.children : this.props.data
    }));
  };
}
