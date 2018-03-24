import React from 'react';
import _ from 'lodash';

import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  MarkSeries
} from 'react-vis';

import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import ToggleButtonGroup from 'react-bootstrap/lib/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/lib/ToggleButton';

import tt from '../helpers';

function dayOfWeekLabel(v) {
  let days = ["Sunday", "Monday", "Tuesday", "Wednesday",
              "Thursday", "Friday", "Saturday"];
  if (v == Math.floor(v))
    return days[v];
  return "";
}

export default class PagesTimeScatterplot extends React.Component {
  constructor(props) {
    super(props);
    let timestamps;
    if (this.props.timestamps) {
      timestamps = this.props.timestamps;
    } else {
      console.log('no time data provided');
    }

    this.state = {
      times: timestamps
    };

    this.changeSelection = this.changeSelection.bind(this);
  }


  changeSelection(val) {
    this.setState({
      grouping: val
    })
  }

  render() {
    const {times, grouping} = this.state;

    let grouped;
    let data = [];

    grouped = _.groupBy(times, t => [t.getDay(), t.getHours()]);
    console.log(grouped);
    for (let elem in grouped) {
      let xy = elem.split(',');
      data.push({
        x: xy[1],
        y: xy[0],
        size: grouped[elem].length
      });
    }

    console.log(data);

    const days = [0, 2, 1, 3, 4, 5, 6];
    const hours = [0, 2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

    return (
      <div>
        <XYPlot
          width={600}
          height={300}
          xDomain={[0,23]} yDomain={[0,6]}>
          <XAxis title="Hour" tickValues={hours}/>
          <YAxis title="Day of Week" tickValues={days} tickFormat={dayOfWeekLabel}/>
          <MarkSeries
            onValueMouseOver={(datapoint, event)=>{
              console.log(datapoint,event);
            }}
            data={data}/>
        </XYPlot>
      </div>
    )
  }

}
