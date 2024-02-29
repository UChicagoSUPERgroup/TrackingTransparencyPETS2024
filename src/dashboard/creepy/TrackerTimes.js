import React from 'react'

import Button from '@instructure/ui-buttons/lib/components/Button'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import IconArrowOpenEnd from '@instructure/ui-icons/lib/Solid/IconArrowOpenEnd'
import IconInfo from '@instructure/ui-icons/lib/Solid/IconInfo'
import RadioInput from '@instructure/ui-forms/lib/components/RadioInput'
import RadioInputGroup from '@instructure/ui-forms/lib/components/RadioInputGroup'
import Text from '@instructure/ui-elements/lib/components/Text'
import Tooltip from '@instructure/ui-overlays/lib/components/Tooltip'
import { darken, lighten } from '@instructure/ui-themeable/lib/utils/color'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import colors, { axisStyle } from '../../colors'
import CustomAxisLabel from '../components/CustomAxisLabel'
import TrackerSummary from '../trackers/TrackerSummary'
import TTPanel from '../components/TTPanel'
import logging from '../dashboardLogging'

import ReactTable from 'react-table'

import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  HorizontalBarSeries,
  VerticalRectSeries,
  VerticalBarSeries,
  Hint
} from 'react-vis'

const TrackerTable = (data) => {
  const pagecountTooltipText = (
    <div style={{width: 160}}>
      This column shows, for each tracker, how many pages you were tracked on.
    </div>
  )

  const pagecountTooltip = (
    <Tooltip
      tip={pagecountTooltipText}
      variant='inverse'
      placement='end'
    >
      <IconInfo />
    </Tooltip>
  )

  const percentbrowsingTooltipText = (
    <div style={{width: 160}}>
      This column, for each tracker, the percentage of your overall browsing that was tracked.
    </div>
  )

  const percentbrowsingTooltip = (
    <Tooltip
      tip={percentbrowsingTooltipText}
      variant='inverse'
      placement='end'
    >
      <IconInfo />
    </Tooltip>
  )

  return (
    <ReactTable
      data={data}
      columns={[
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Tracker
          </div>),
        accessor: 'name',
        Cell: row => (
          <div key={row.value}>
            <Link className='trackerTableLinkTrackersPage' to={{pathname: '/trackers/' + row.value}}>
              {row.value}
            </Link>
          </div>)
        },
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Page Count {pagecountTooltip}
          </div>),
        accessor: 'count',
        Cell: row =>
          <div style={{textAlign: 'right'}}>
            {row.value}
          </div>},
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Percent of Browsing {percentbrowsingTooltip}
          </div>),
        accessor: 'percent',
        Cell: row =>
          <div style={{textAlign: 'right'}}>
            {row.value.toFixed(2) + ' %'}
          </div>}
      ]}
      // defaultPageSize={20}
      className='-striped -highlight'
    />
  )
}

export default class TrackerTimes extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      trackers: [],
      graphCount: 25,
      numTrackers: '…'
    }
    // this.logLoad = this.logLoad.bind(this);
    this.updateGraphCount = this.updateGraphCount.bind(this)
  }

  async getTrackers () {
    const background = await browser.runtime.getBackgroundPage()
    const numTrackers = await background.queryDatabase('getNumberOfTrackers', {})
    const numPages = await background.queryDatabase('getNumberOfPages', {})
    const trackers = await background.queryDatabase('getTrackers', {})
    const totalData = await background.queryDatabase('getTrackersByTime', {'count': 1400})
    const dates = totalData.map((tracker) => {
      return {
        tracker: tracker.tracker,
        time: (new Date(tracker.pageId)).getHours()
      }
    });

    let starter = [{x: 'morning', y: 0, count: 0, percent: 0},
                  {x:'mid-day',y: 0, count: 0, percent: 0},
                  {x:'afternoon',y: 0, count: 0, percent: 0},
                  {x:'evening',y: 0, count: 0, percent: 0},
                  {x:'night',y: 0, count: 0, percent: 0},
                  {x:'late night',y: 0, count: 0, percent: 0}]
    let groupedTrackers = {} //{morning: {}, midday: {}, afternoon: {}, evening: {}, night: {}, latenight: {}}
    let pageCounts = {morning: 0, 'mid-day': 0, afternoon: 0, evening: 0,night: 0,'late night': 0}
    let trackersByTime = {morning: {}, 'mid-day': {}, afternoon: {}, evening: {},night: {},'late night': {}}
    trackersByTime = dates.reduce((acc, trackerDate) => {
      if (trackerDate.time >= 5 && trackerDate.time <= 10) {
        acc['morning'][trackerDate.tracker] = (acc['morning'][trackerDate.tracker] || 0) + 1
        acc['morning']['pageCount'] = (acc['morning']['pageCount'] || 0) + 1
      } else if (trackerDate.time >= 11 && trackerDate.time <= 13) {
        acc['mid-day'][trackerDate.tracker] = (acc['mid-day'][trackerDate.tracker] || 0) + 1
        acc['mid-day']['pageCount'] = (acc['mid-day']['pageCount'] || 0) + 1
      } else if (trackerDate.time >= 14 && trackerDate.time <= 17) {
        acc['afternoon'][trackerDate.tracker] = (acc['afternoon'][trackerDate.tracker] || 0) + 1
        acc['afternoon']['pageCount'] = (acc['afternoon']['pageCount'] || 0) + 1
      } else if (trackerDate.time >= 18 && trackerDate.time <= 20) {
        acc['evening'][trackerDate.tracker] = (acc['evening'][trackerDate.tracker] || 0) + 1
        acc['evening']['pageCount'] = (acc['evening']['pageCount'] || 0) + 1
      } else if ((trackerDate.time >= 21 && trackerDate.time <= 23) || trackerDate.time == 0) {
        acc['night'][trackerDate.tracker] = (acc['night'][trackerDate.tracker] || 0) + 1
        acc['night']['pageCount'] = (acc['night']['pageCount'] || 0) + 1
      } else if (trackerDate.time >= 1 && trackerDate.time <= 4) {
        acc['late night'][trackerDate.tracker] = (acc['late night'][trackerDate.tracker] || 0) + 1
        acc['late night']['pageCount'] = (acc['late night']['pageCount'] || 0) + 1
      }
      return acc
    }, trackersByTime)
    console.log(trackersByTime)
    // console.log(Object.keys(trackersByTime['morning']))
    let topTrackers = {}
    Object.keys(trackersByTime).map((key) => {
      let keys = Object.keys(trackersByTime[key]).filter((elem) => elem != "pageCount")
      if (keys.length > 0) {
        let x = keys.reduce((a, b) => trackersByTime[key][a] > trackersByTime[key][b] ? a : b);
        trackersByTime[key]["trackerCount"] = keys.length
        trackersByTime[key]["topTracker"] = {tracker: x, count: trackersByTime[key][x], percent: (100 * trackersByTime[key][x] / trackersByTime[key]["pageCount"])}
        topTrackers[key] = trackersByTime[key]["topTracker"]
      } else {
        trackersByTime[key]["trackerCount"] = 0
        trackersByTime[key]["topTracker"] = {}
        // topTrackers[key] = {}
      }

    })
    console.log(trackersByTime)
    console.log(topTrackers)
    groupedTrackers = dates.reduce((acc, trackerDate) => {
      acc[trackerDate.tracker] = acc[trackerDate.tracker] || starter.map((elem => ({...elem, tracker: trackerDate.tracker})))

      if (trackerDate.time >= 5 && trackerDate.time <= 10) {
        // acc[trackerDate.tracker][0].y += 1
        acc[trackerDate.tracker][0].count += 1
        pageCounts['morning'] += 1
        // acc[trackerDate.tracker][0].y = 100 * acc[trackerDate.tracker][0].count / pageCounts['morning']
        // acc[trackerDate.tracker][0].percent = 100 * acc[trackerDate.tracker][0].count / pageCounts['morning']
      } else if (trackerDate.time >= 11 && trackerDate.time <= 13) {
        // acc[trackerDate.tracker][1].y += 1
        acc[trackerDate.tracker][1].count += 1
        pageCounts['mid-day'] += 1
        // acc[trackerDate.tracker][1].y = 100 * acc[trackerDate.tracker][1].count / pageCounts['mid-day']
        // acc[trackerDate.tracker][1].percent = 100 * acc[trackerDate.tracker][1].count / pageCounts['mid-day']
      } else if (trackerDate.time >= 14 && trackerDate.time <= 17) {
        // acc[trackerDate.tracker][2].y += 1
        acc[trackerDate.tracker][2].count += 1
        pageCounts['afternoon'] += 1
        // acc[trackerDate.tracker][2].y = 100 * acc[trackerDate.tracker][2].count / pageCounts['afternoon']
        // acc[trackerDate.tracker][2].percent = 100 * acc[trackerDate.tracker][2].count / pageCounts['afternoon']
      } else if (trackerDate.time >= 18 && trackerDate.time <= 20) {
        // acc[trackerDate.tracker][3].y += 1
        acc[trackerDate.tracker][3].count += 1
        pageCounts['evening'] += 1
        // acc[trackerDate.tracker][3].y = 100 * acc[trackerDate.tracker][3].count / pageCounts['evening']
        // acc[trackerDate.tracker][3].percent = 100 * acc[trackerDate.tracker][3].count / pageCounts['evening']
      } else if ((trackerDate.time >= 21 && trackerDate.time <= 23) || trackerDate.time == 0) {
        // acc[trackerDate.tracker][4].y += 1
        acc[trackerDate.tracker][4].count += 1
        pageCounts['night'] += 1
        // acc[trackerDate.tracker][4].y = 100 * acc[trackerDate.tracker][4].count / pageCounts['night']
        // acc[trackerDate.tracker][4].percent = 100 * acc[trackerDate.tracker][4].count / pageCounts['night']
      } else if (trackerDate.time >= 1 && trackerDate.time <= 4) {
        // acc[trackerDate.tracker][5].y += 1
        acc[trackerDate.tracker][5].count += 1
        pageCounts['late night'] += 1
        // acc[trackerDate.tracker][5].y = 100 * acc[trackerDate.tracker][5].count / pageCounts['late night']
        // acc[trackerDate.tracker][5].percent = 100 * acc[trackerDate.tracker][5].count / pageCounts['late night']
      }
      return acc
    }, groupedTrackers)

    console.log(groupedTrackers)
    // let percentTrackers = groupedTrackers.reduce((acc, tracker) => {
    //   console.log(tracker)
    //   return acc
    // }, groupedTrackers)
    console.log(pageCounts)
    // morning: 5-10; mid-day: 11-13; afternoon: 14-17; evening: 18-20; night: 21-23, 0-4

    let graphData = []
    let allData = []
    for (let val in trackers) {
      // console.log(trackers[val])
      const name = trackers[val]['tracker']
      const pageCount = trackers[val]['COUNT(tracker)']
      const percent = 100 * pageCount / numPages
      graphData.unshift({
        y: name,
        x: pageCount
      })
      allData.push({
        name: name,
        count: pageCount,
        percent: percent
      })
    }

    this.setState({
      trackers: trackers,
      graphDataAll: graphData,
      graphData: graphData.slice(-this.state.graphCount),
      allData: allData,
      numTrackers: numTrackers,
      numPages: numPages,
      groupedTrackers: groupedTrackers,
      topTrackers: topTrackers,
      trackersByTime: trackersByTime,
      pageCounts: pageCounts
    })
  }

  async componentDidMount () {
    this.getTrackers()

    const background = await browser.runtime.getBackgroundPage()
    const numTrackersShown = await background.queryDatabase('getNumberOfTrackers', {})
    let sendDict = {
      'numTrackersShown': numTrackersShown
    }
    let activityType = 'load dashboard tracker summary page'
    logging.logLoad(activityType, sendDict)
  }

  updateGraphCount (event) {
    const num = parseInt(event.target.value)
    console.log(num)
    const { graphDataAll } = this.state
    this.setState({
      graphCount: num,
      graphData: graphDataAll.slice(-num)
    })
  }

  renderIntroText () {
    const { allData, numTrackers } = this.state
    return (
      <TTPanel>
        <Text>
          <p>
            <strong>{numTrackers} trackers</strong> have been present on the sites you visited since installing {EXT.NAME}.
            {allData && allData[0] && <span> Your most frequently encountered tracker is <strong>{allData[0].name}</strong>, which was present on <strong>{allData[0].percent.toFixed(2)}%</strong> of the pages you visited.</span>}
            {allData && !allData[0] && <span> Return to this page after viewing a few sites to see the trackers in your browsing.</span>}
          </p>
        </Text>
      </TTPanel>
    )
  }

  timeMsg (times, trackers) {
    if (times.length < 1) {
      return ''
    } else if (times.length == 1) {
      return trackers[times[0]][0]
    } else if (times.length == 2) {
       return trackers[times[0]][0] + ' and ' + trackers[times[1]][0]
     } else {
      let l = times.pop()
      let ti = times.map(ti => trackers[ti][0])
      // ti.push('and')
      // ti.push(trackers[l][0])
      return ti.join(', ') + ' and ' + trackers[l][0]
    }
  }



  renderCreepyText () {
    let { topTrackers, trackersByTime, numTrackers, allData } = this.state
    let same = true
    let trackers = topTrackers
    let maxI = 0, minI = 0, minP = 0, maxP = 0, secMaxI = 0, secMaxP = 0
    let sameTimes = []
    let otherTimes = []
    let sameTimesMsg = ''
    let otherTimesMsg = ''
    if (topTrackers) {
      // topTrackers = {morning: {tracker: "Facebook", count: 28, percent: 19.577235772357724},
      //               "mid-day": {tracker: "Google", count: 28, percent: 14.577235772357724},
      //               afternoon: {tracker: "Google", count: 29, percent: 23.577235772357724},
      //               evening: {tracker: "Google", count: 26, percent: 44.827586206896555}}
      trackers = Object.entries(topTrackers)
      let tracker = trackers[0][1].tracker

      maxP = trackers[0][1].percent
      minP = maxP

      trackers.map((tr,idx) => {
        if (tr[1].percent < minP) {
          minP = tr[1].percent
          minI = idx
        } else if (tr[1].percent > maxP) {
          maxP = tr[1].percent
          maxI = idx
        }

        if (tr[1].tracker != tracker) {
          same = false
        }

      })
      if (!same) {
        trackers.map((tr,idx) => {
          if (tr[1].tracker != trackers[maxI][1].tracker) {
            otherTimes.push(idx)
          } else {
            sameTimes.push(idx)
          }
        })
        secMaxP = trackers[otherTimes[0]][1].percent
        secMaxI = otherTimes[0]
        otherTimes.map(ti => {
          if (trackers[ti][1].percent > secMaxP) {
            secMaxP = trackers[ti][1].percent
            secMaxI = ti
          }
        })


      }
      //
      sameTimesMsg = this.timeMsg(sameTimes,trackers)
      otherTimesMsg = this.timeMsg(otherTimes,trackers)
    }
    return (
      <TTPanel>
        {trackers &&<Text>
          {same && <p><strong>{trackers[maxI][1].tracker}</strong> is the top tracker you encounter across all times of the day. At the lowest, they are on
            <strong> {trackers[minI][1].percent.toFixed(2)}%</strong> of pages you visit during the <strong>{trackers[minI][0]}</strong>. However, they are on
           <strong> {trackers[maxI][1].percent.toFixed(2)}%</strong> of pages you visit during the <strong>{trackers[maxI][0]}</strong>. As a result,
          they know a lot about your browsing activity over the course of the day, and can target ads based on this.</p>}
          {!same && <p><strong>{trackers[maxI][1].tracker}</strong> is the top tracker you encounter overall, and it is the top tracker during the {sameTimesMsg},
          present on up to <strong> {trackers[maxI][1].percent.toFixed(2)}%</strong> of pages you visit. However, during the {otherTimesMsg},
            <strong> {trackers[secMaxI][1].tracker}</strong> is most frequent, and is on up to <strong> {trackers[secMaxI][1].percent.toFixed(2)}% </strong>of pages you visit during these times.
           As a result, both of these trackers know a lot about your browsing activity over the course of the day, and can target ads based on this.</p>}
        </Text>}
      </TTPanel>
    )
  }

  renderChart () {
    let { graphData, numPages, hovered, groupedTrackers, pageCounts } = this.state
    if (graphData.length === 0) return null
    graphData = graphData.map(d => ({
      ...d,
      color: (hovered && d.y === hovered.y) ? 1 : 0
    }))

    // maroon: '#800000',
    // dkGray: '#767676',
    // ltGray: '#D6D6CE',
    // yellow1: '#FFA319',
    // yellow2: '#FFB547',
    // yellow3: '#CC8214',
    // orange1: '#C16622',
    // orange2: '#D49464',
    // orange3: '#9A5324',
    // red1: '#8F3931',
    // red2: '#B1746F',
    // red3: '#642822',
    // ltGreen1: '#8A9045',
    // ltGreen2: '#ADB17D',
    // ltGreen3: '#616530',
    // dkGreen1: '#58593F',
    // dkGreen2: '#8A8B79',
    // dkGreen3: '#3E3E23',
    // blue1: '#155F83',
    // blue2: '#5B8FA8',
    // blue3: '#0F425C',
    // violet1: '#350E20',
    // violet2: '#725663',
    // cyan: '#47B5FF',
    // magenta: '#FF3399'
    // darken(baseColor, (4.6 * index) % 37.5)
    let colorOpts = [colors.maroon, colors.cyan, colors.magenta, colors.violet1, colors.blue1, colors.dkGreen1, colors.red1, colors.orange1, colors.yellow1]
    const numColors = colorOpts.length
    let trackersList = Object.entries(groupedTrackers)
    trackersList = trackersList.map((elem, idx) => {
      // console.log(elem[1])
      let timeCounts = elem[1].map((time) => ({
        ...time,
        percent: time.count > 0 ? 100 * time.count / pageCounts[time.x] : 0,
        y: time.count > 0 ? 100 * time.count / pageCounts[time.x] : 0
      }))

      return ({
        ...elem,
        timeCounts,
        color: colorOpts[idx % numColors]//darken(baseColor, (4.6 * idx) % 37.5)
      })
    })
    // console.log(trackersList)
    // console.log(trackersList[0])
    // console.log(Object.entries(groupedTrackers)[0][1])

    // const background = await browser.runtime.getBackgroundPage()
    return (
      <TTPanel>
        <FlexibleWidthXYPlot
          xType={'ordinal'}
          stackBy='y'
          height={600}
          margin={{left: 60, bottom: 60}}
          onMouseLeave={() => this.setState({hovered: null})}
          colorDomain={[0, 1]}
          colorRange={[colors.red1, colors.red2]}
        >
          <HorizontalGridLines />
          <VerticalGridLines />
          <YAxis
            height={200}
            tickFormat={(v,i,s,t) => {
              return v + '%'
            }}
            tickLabelAngle={0}
            style={axisStyle}
          />
          <XAxis
            tickLabelAngle={0}
            height={600}
            style={axisStyle}
          />
          {hovered && <Hint
            value={hovered}>
            <div className='rv-hint__content'>
              <div>
                <strong>{hovered.tracker}</strong><br />
                      Present on {hovered.count} pages<br />
                      ({(hovered.count / pageCounts[hovered.x] * 100).toFixed(2)}% of {hovered.x} pages)
              </div>
            </div>
          </Hint>}
          {trackersList.map((elem,idx) => {
            return <VerticalBarSeries
              color={elem.color}
              stack={true}
              data={elem.timeCounts}
              key={idx}
              onValueMouseOver={(datapoint) => {
                console.log(datapoint)
                this.setState({hovered: datapoint})
              }}
              onValueClick={(datapoint) => {
                  this.setState({selectedTracker: datapoint})
                  let activityType = 'selected a tracker on trackers page for more info'
                  logging.logLoad(activityType, {'tracker_clicked': datapoint['tracker'], 'tracker_pages': datapoint['count']})
                }}
            />
          })}
          <CustomAxisLabel title='Time of Day' xAxis />
          <CustomAxisLabel title='Percent of Pages' yAxis />
        </FlexibleWidthXYPlot>

      </TTPanel>
    )
  }

  renderInfoPane () {
    const { selectedTracker } = this.state
    const { hideInferenceContent } = this.props

    return (
      <TTPanel textAlign='start'>
        {!selectedTracker && <Text weight='bold'>The graph to the left shows the trackers on the pages you visited. Click a bar to learn more about that tracker.</Text>}
        {selectedTracker && <div>
          <TrackerSummary
            tracker={selectedTracker.tracker}
            numPages={selectedTracker.count}
            hideInferenceContent={hideInferenceContent}
          />
          <Link
            className='trackerPageSelected-Tracker'
            href={'#/trackers/' + selectedTracker.y}
            icon={IconArrowOpenEnd}
            iconPlacement='end'
          >
            More about this tracker
          </Link>
        </div>}
      </TTPanel>
    )
  }

  render () {
    const { allData, numTrackers } = this.state

    return (
      <Grid>
        <GridRow>
          <GridCol>
            <Heading level='h1'><FontAwesomeIcon icon='eye' /><strong>&nbsp;  Your top trackers over the day</strong></Heading>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol>
            {this.renderCreepyText()}
          </GridCol>
        </GridRow>

        <GridRow>
          <GridCol width={7}>
            {allData && allData.length > 0 && this.renderChart()}
          </GridCol>
          <GridCol width={5}>
            {allData && allData.length > 0 && this.renderInfoPane()}
          </GridCol>
        </GridRow>
      </Grid>
    )
  }
}
