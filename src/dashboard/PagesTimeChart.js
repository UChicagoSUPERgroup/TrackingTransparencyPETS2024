import React from 'react';

import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries
} from 'react-vis';

import ttDashboard from './dashboardHelpers';

export default class PagesTimeChart extends React.Component {
  constructor(props) {
    super(props);
    const timestamps = this.props.timestamps;
    const data = timestamps.map(x => (
      (new Date(x.Pages.id))
    ))

    this.state = {
      data: {},
    }
  }

  render() {
    const {data} = this.state;

    return (
      <div>
        <XYPlot
        xType="time"
        width={300}
        height={300}>
        <HorizontalGridLines />
        <VerticalGridLines />
        <XAxis title="X Axis" />
        <YAxis title="Y Axis" />
        <LineSeries data={data}/>
        </XYPlot>
      </div>
    )
  }

}