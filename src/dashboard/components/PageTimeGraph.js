import React from 'react'

import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries
} from 'react-vis'

import moment from 'moment'
import _ from 'lodash'

import CustomAxisLabel from './CustomAxisLabel'

moment().format()

export default function PageTimeGraph ({ timestamps }) {
  const times = timestamps.map(t => moment(t))

  let data = []

  const firstDay = times[0].startOf('day')
  let grouped;
  grouped = _.groupBy(times, t => t.diff(firstDay, 'days'));
  console.log(grouped, Object.keys(grouped))
  for (let day in grouped) {
    data.push({
      x: parseInt(day),
      y: grouped[day].length
    });
  }

  const dataLabel = (v) => {
    return moment(firstDay).add(parseInt(v), 'days').format('ddd MMM Do')
  }

  return (
    <div>
      <FlexibleWidthXYPlot
        height={200}
        margin={{left: 100, right: 10, top: 10, bottom: 70}}>
        <HorizontalGridLines />
        <LineSeries
          color='#8F3931'
          data={data} />
        <XAxis
          height={100}
          tickValues={Object.keys(data)}
          tickFormat={dataLabel}
          tickLabelAngle={-20}
        />
        <YAxis />
        <CustomAxisLabel title='Pages'/>
        <CustomAxisLabel title='Day' xAxis yShift={1.6} />
      </FlexibleWidthXYPlot>
    </div>
  )
}
