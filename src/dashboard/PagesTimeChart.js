import React from 'react';
import _ from 'lodash';

import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  VerticalRectSeries
} from 'react-vis';

import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import ToggleButtonGroup from 'react-bootstrap/lib/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/lib/ToggleButton';

import tt from '../helpers';

function dateLabel(v) {
  if (v == Math.floor(v))
    return v.toString();
  return "";
}

function timeLabel(v) {
  let times = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM",
               "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM",
               "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"];
  if (v == Math.floor(v))
    return times[v % 24];
  return "";
}

function dayOfWeekLabel(v) {
  let days = ["Sunday", "Monday", "Tuesday", "Wednesday",
              "Thursday", "Friday", "Saturday"];
  if (v == Math.floor(v))
    return days[v % 7];
  return "";
}

function stringLabel(v) {
  return v.toString();
}

export default class PagesTimeChart extends React.Component {
  constructor(props) {
    super(props);
    let timestamps;
    if (this.props.timestamps) {
      timestamps = this.props.timestamps;
    } else {
      console.log('no time data provided');
    }


    this.state = {
      times: timestamps,
      grouping: 'weekday'
    };

    this.changeSelection = this.changeSelection.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.timestamps) {
      this.setState({
        times: nextProps.timestamps
      })
    }
  }

  changeSelection(val) {
    this.setState({
      grouping: val
    })
  }

  render() {
    const {times, grouping} = this.state;

    let grouped;
    let xTitle;
    let data = [];
    let labelFunc;

    switch(grouping) {
    case 'weekday':
      grouped = _.groupBy(times, t => t.getDay());
      xTitle = 'Weekday';
      labelFunc = dayOfWeekLabel;
      break;

    case 'month-day':
      grouped = _.groupBy(times, t => t.getDate());
      xTitle = 'Day of Month';
      labelFunc = dateLabel;
      break;

    case 'hour':
      grouped = _.groupBy(times, t => t.getHours());
      xTitle = 'Hour';
      labelFunc = timeLabel;
      break;
    }
    for (let day in grouped) {
      data.push({
        x0: parseInt(day),
        x: parseInt(day) + 1,
        y0: 0,
        y: grouped[day].length
      });
    }
    console.log(data);


    return (
      <div>
        <XYPlot
          width={400}
          height={300}
          margin={{left: 40, right: 40, top: 10, bottom: 40}}>
          <HorizontalGridLines />
          <VerticalGridLines />
          <VerticalRectSeries data={data} />
          <XAxis
            title={xTitle}
            tickFormat={labelFunc}
            style={{title: {fill: '#222'}, text: {fill: '#222'}}}/>
          <YAxis
            title="Number of Pages"
            style={{title: {fill: '#222'}, text: {fill: '#222'}}}/>
        </XYPlot>

        <ButtonToolbar>
          <ToggleButtonGroup type="radio" name="grouping-selector" defaultValue={'weekday'} onChange={this.changeSelection}>
            <ToggleButton value={'hour'}>Hour</ToggleButton>
            <ToggleButton value={'weekday'}>Weekday</ToggleButton>
            <ToggleButton value={'month-day'}>Day of Month</ToggleButton>
          </ToggleButtonGroup>
        </ButtonToolbar>
      </div>
    )
  }

}
