import React from 'react';
import _ from 'lodash';

import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  MarkSeries,
  Hint
} from 'react-vis';

import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import ToggleButtonGroup from 'react-bootstrap/lib/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/lib/ToggleButton';

import tt from '../helpers';
import las from '../labels';


export default class PagesTimeScatterplot extends React.Component {
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
      update: this.props.update,
      index: [null,null]
    };

    this.changeSelection = this.changeSelection.bind(this);
  }


  changeSelection(val) {
    this.setState({
      grouping: val
    })
  }

  render() {
    const {times, grouping, index} = this.state;
    const {dateLabel, timeLabelSimple, timeLabelAdjusted,
       dayOfWeekLabel, dayOfWeekLabelAdjusted, stringLabel} = las;

    let grouped;
    let data = [];

    grouped = _.groupBy(times, t => [t.getDay(), t.getHours()]);
    let day = (new Date(Date.now())).getDay();
    for (let elem in grouped) {
      let xy = elem.split(',');
      if (parseInt(xy[0]) <= day) {
        data.push({
          x: parseInt(xy[1]),
          y: parseInt(xy[0]) + (7 - day),
          size: grouped[elem].length
        });
      } else {
        data.push({
          x: parseInt(xy[1]),
          y: parseInt(xy[0]) - day,
          size: grouped[elem].length
        });
      }
    }
    //console.log(data);
    data = data.map((d, i) => ({...d, color: i === index[0] ? 1 : 0}));

    return (
      <div>
        <FlexibleWidthXYPlot
          height={300}
          xDomain={[0,23]}
          yDomain={[0,7]}
          margin={{left: 100, right: 50, top: 10, bottom: 50}}
          colorDomain={[0, 1]}
          colorRange={["#616530", "#8A9045"]}
          onMouseLeave={() => this.setState({index: [null,null]})}>
          <MarkSeries
            onValueClick={(datapoint, event)=>{
              this.props.update(datapoint);
            }}
            onNearestXY={(datapoint, {index}) => {
              this.setState({index: [index, datapoint]});
            }}
            data={data}/>
          <XAxis
            title="Hour"
            tickFormat={timeLabelSimple}
            style={{title: {fill: '#222'}, text: {fill: '#222'}}}/>
          <YAxis
            title="Day of Week"
            tickValues={[0,1,2,3,4,5,6,7]}
            tickFormat={dayOfWeekLabelAdjusted}
            style={{title: {fill: '#222'}, text: {fill: '#222'}}}/>
          {index[1] ?
            <Hint
              value={index[1]}>
              <div className="rv-hint__content">
                <div>
                  { `${index[1].size} pages` }
                </div>
                <div>
                { `${dayOfWeekLabelAdjusted(index[1].y)} at ${timeLabelSimple(index[1].x)}`}
                </div>
              </div>
            </Hint> :
            null
          }
        </FlexibleWidthXYPlot>
      </div>
    )
  }

}
