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
const millisecondsInDay = 86400000;

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
      weektimes: timestamps,
      daytimes: {},
      grouping: 'weekday'
    };

    this.getDaysData = this.getDaysData.bind(this);
    this.changeSelection = this.changeSelection.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.weektimestamps) {
      this.setState({
        weektimes: nextProps.weektimestamps
      })
    }
  }

  async getDaysData(days) {
    const background = await browser.runtime.getBackgroundPage();
    let tempDate = new Date(Date.now() - (days * millisecondsInDay));
    let args = {afterDate: tempDate.getTime()}
    return background.queryDatabase('getTimestamps', args);
  }

  changeSelection(val) {
    let days;
    switch(val){
    case 'hour':
      days = 1;
      break;
    case 'weekday':
      days = 7;
      break;
    }
    let lastDaysData = this.getDaysData(days);
    lastDaysData.then(ts => {
      const daytimestamps = ts.map(x => (
        (new Date(x.id))
      ));
      this.setState({
        daytimes: daytimestamps,
        grouping: val
      });
    });
  }

  render() {
    const {weektimes, daytimes, grouping} = this.state;
    const {dateLabel, timeLabelSimple, timeLabelAdjusted, dayOfWeekLabel, stringLabel} = las;

    let grouped;
    let xTitle;
    let data = [];
    let labelFunc;

    switch(grouping) {
    case 'weekday':
      grouped = _.groupBy(weektimes, t => t.getDay());
      xTitle = 'Weekday';
      labelFunc = dayOfWeekLabel;
      for (let day in grouped) {
        data.push({
          x0: parseInt(day),
          x: parseInt(day) + 1,
          y0: 0,
          y: grouped[day].length
        });
      }
      break;
    case 'hour':
      grouped = _.groupBy(daytimes, t => t.getHours());
      xTitle = 'Hour';
      labelFunc = timeLabelAdjusted;
      let hr = (new Date(Date.now())).getHours();
      for (let i = 0; i < 24; i++) {
        data.push({
          x0: i,
          x: i + 1,
          y0: 0,
          y: 0
        });
      }
      for (let d in grouped) {
        let day = parseInt(d);
        if (day >= hr) {
          data[day - hr] = {
            x0: day - hr,
            x: day - hr + 1,
            y0: 0,
            y: grouped[day].length
          }
        } else {
          data[(24 - hr) + day] = {
            x0: (24 - hr) + day,
            x: (24 - hr) + day + 1,
            y0: 0,
            y: grouped[day].length
          }
        }
      }
      break;
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
          <VerticalRectSeries data={data} opacity={0.95} color={"#616530"}/>
          <XAxis
            title={xTitle}
            tickFormat={labelFunc}
            style={{title: {fill: '#222'}, text: {fill: '#222'}}}/>
          <YAxis
            title="Number of Pages"
            style={{title: {fill: '#222'}, text: {fill: '#222'}}}/>
        </XYPlot>
        <ButtonToolbar>
          <ToggleButtonGroup
            type="radio"
            name="grouping-selector"
            defaultValue={'weekday'}
            onChange={this.changeSelection}>
            <ToggleButton value={'hour'}>Hour</ToggleButton>
            <ToggleButton value={'weekday'}>Weekday</ToggleButton>
          </ToggleButtonGroup>
        </ButtonToolbar>
      </div>
    )
  }

}
