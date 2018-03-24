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
import las from '../labels';


export default class PagesTimeChart extends React.Component {
  constructor(props) {
    super(props);
    let timestamps;
    if (this.props.weektimestamps) {
      timestamps = this.props.weektimestamps;
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
    if (nextProps.weektimestamps) {
      this.setState({
        times: nextProps.weektimestamps
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
    const {dateLabel, timeLabel, dayOfWeekLabel, stringLabel} = las;

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
          width={540}
          height={300}
          margin={{left: 40, right: 40, top: 10, bottom: 40}}>
          <HorizontalGridLines />
          <VerticalGridLines />
          <VerticalRectSeries data={data} opacity={0.95}/>
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
