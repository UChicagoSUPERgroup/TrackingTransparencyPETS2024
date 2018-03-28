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
    this.logLoad = this.logLoad.bind(this);
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

  async logLoad(grouping) {
       //console.log('In the log load page')
       const background = await browser.runtime.getBackgroundPage();
       let userParams = await browser.storage.local.get({
         usageStatCondition: "no monster",
         userId: "no monster",
         startTS: 0
       });
       if (JSON.parse(userParams.usageStatCondition)){//get data when the user click on the button.
         let activityType='click timegroups on dashboard recent activity page';
         let timestamp=Date.now();
         let userId=userParams.userId;
         let startTS=userParams.startTS;
         let activityData={'chosentimegroup':grouping}
         background.logData(activityType, timestamp, userId, startTS, activityData);
       }
     }



  render() {
    const {times, grouping} = this.state;

    let grouped;
    let xTitle;
    let data = [];

    this.logLoad(grouping);

    switch(grouping) {
    case 'weekday':
      grouped = _.groupBy(times, t => t.getDay());
      xTitle = 'Weekday';
      break;

    case 'month-day':
      grouped = _.groupBy(times, t => t.getDate());
      xTitle = 'Day of Month';
      break;

    case 'hour':
      grouped = _.groupBy(times, t => t.getHours());
      xTitle = 'Hour';
      break;
    }
    for (let day in grouped) {
      data.push({
        x0: day,
        x: parseInt(day) + 1,
        y0: 0,
        y: grouped[day].length
      });
    }


    return (
      <div>
        <XYPlot
          width={300}
          height={300}>
          <HorizontalGridLines />
          <VerticalGridLines />
          <XAxis title={xTitle} />
          <YAxis title="Number of Pages" />
          <VerticalRectSeries data={data}/>
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
