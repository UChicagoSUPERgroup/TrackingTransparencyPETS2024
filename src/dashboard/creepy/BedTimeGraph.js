import React from 'react'
import logging from '../dashboardLogging'

import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  MarkSeries,
  LineMarkSeries,
  Hint
} from 'react-vis'

import { axisStyle } from '../../colors'
import CustomAxisLabel from '../components/CustomAxisLabel'
import las from '../../labels'

export default class BedTimeGraph extends React.Component {
  constructor (props) {
    super(props)
    let timestamps
    if (this.props.weektimestamps) {
      timestamps = this.props.weektimestamps
    } else {
      console.log('no time data provided')
    }

    this.state = {
      times: timestamps,
      update: this.props.update,
      index: [null, null],
      sent: false,
      bedtimeData: [],
      morningStart: 6 // Also need to correspondingly change the labels (timeLabelNightTime) + CreepyVis.js
    }

    this.changeSelection = this.changeSelection.bind(this)
    this.organizeBedtimes = this.organizeBedtimes.bind(this)


  }

  componentDidMount () {
    import(/* webpackChunkName: "vendors/lodash" */'lodash')
      .then(_ => {
        this.setState({ _: _ })
        let bedtimeData = this.organizeBedtimes()
        // bedtimeData = [{y: 23, x: 1, size: 7, color: 0},
        //   {y: 16, x: 2, size: 11, color: 0},
        //   {y: 20, x: 3, size: 9, color: 0},
        //   {y: 18, x: 4, size: 99, color: 0},
        //   {y: 16, x: 5, size: 7, color: 0},
        //   {y: 15, x: 6, size: 109, color: 0},
        //   {y: 21, x: 7, size: 32, color: 0}]
        this.setState({bedtimeData: bedtimeData})
      })
  }

  changeSelection (val) {
    this.setState({
      grouping: val
    })
  }

  organizeBedtimes () {
    const {times, grouping, index} = this.state
    const {dateLabel, timeLabelSimple, timeLabelAdjusted, timeLabelNightTime,
      dayOfWeekLabel, dayOfWeekLabelNightTime, stringLabel} = las

    let grouped
    let latestData = []
    let data = []

    if (this.state._) {
      const _ = this.state._
      grouped = _.groupBy(times, t => [t.getDay(), t.getHours()])
      let day = (new Date(Date.now())).getDay() - 1
      for (let elem in grouped) {
        let xy = elem.split(',')
        let adjustedDay = parseInt(xy[1]) < this.state.morningStart ? parseInt(xy[0]) - 1 : parseInt(xy[0])

        if (adjustedDay <= day) {
          data.push({
            y: (parseInt(xy[1]) + (24 - this.state.morningStart)) % 24, // HERE
            x: adjustedDay + (7 - day),
            size: grouped[elem].length
          })
        } else {
          data.push({
            y: (parseInt(xy[1]) + (24 - this.state.morningStart)) % 24, // HERE
            x: adjustedDay - day,// + prevNight,
            size: grouped[elem].length
          })
        }
      }

      const justLatest = data.reduce((acc, point) => {

        if (acc[point.x]) {
          if (point.y > acc[point.x].y) {
            acc[point.x] = point;
          }
        } else {
          acc[point.x] = point;
        }
        return acc
      }, {});
      latestData = Object.values(justLatest)



      latestData = latestData.map((d, i) => ({...d, color: i === index[0] ? 1 : 0}))
      if (!this.state.sent && latestData.length > 0) {
        this.props.onBedtimesParsed(latestData);
        this.setState({
          sent: true
        })
      }

      data = data.map((d, i) => ({...d, color: i === index[0] ? 1 : 0}))

      // drop today (but see historical data on today should not be deleted)
      // for (let q = 0; q < data.length; q++) {
      //   console.log(data[q])
      // }

      return latestData
    }
  }

  render () {
    const {times, grouping, index, bedtimeData} = this.state
    const {dateLabel, timeLabelSimple, timeLabelAdjusted, timeLabelNightTime,
      dayOfWeekLabel, dayOfWeekLabelNightTime, stringLabel} = las

    return (
      <div>
        <FlexibleWidthXYPlot
          height={450}
          xDomain={[0, 7]} // HERE
          yDomain={[0, 23]}
          margin={{left: 100, right: 50, top: 30, bottom: 60}}
          colorDomain={[0, 1]}
          colorRange={['#616530', '#8A9045']}
          onMouseLeave={() => this.setState({index: [null, null]})}>
          <LineMarkSeries // HERE
            onValueClick={(datapoint, event) => {
              this.props.update(datapoint)
              let activityType = 'click on the bubble chart on activity page'
              logging.logLoad(activityType, {'datapoint': datapoint})
            }}
            onNearestXY={(datapoint, {index}) => {
              this.setState({index: [index, datapoint]})
            }}
            strokeWidth={3}
            data={bedtimeData} />
          <XAxis // HERE
            tickValues={[0, 1, 2, 3, 4, 5, 6, 7]}
            tickFormat={dayOfWeekLabelNightTime}
            style={axisStyle} />
          <YAxis
            tickFormat={timeLabelNightTime}
            style={axisStyle} />
          {index[1]
            ? <Hint
              value={index[1]}>
              <div className='rv-hint__content'>
                <div>
                  { `${index[1].size} pages` }
                </div>
                <div>
                  { `${dayOfWeekLabelNightTime(index[1].x + (index[1].y >= (24 - this.state.morningStart) ? 1 : 0))} at ${timeLabelNightTime(index[1].y)}`}
                </div>
              </div>
            </Hint>
            : null
          }
          <CustomAxisLabel title='Latest Browsing Detected' />
          <CustomAxisLabel title='Date' xAxis />
        </FlexibleWidthXYPlot>
      </div>
    )
  }
}
