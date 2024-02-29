import React from 'react';

import Heading from '@instructure/ui-elements/lib/components/Heading';
import Text from '@instructure/ui-elements/lib/components/Text';
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox';
import Spinner from '@instructure/ui-elements/lib/components/Spinner'
import RadioInput from '@instructure/ui-forms/lib/components/RadioInput'
//import ProgressCircle from '@instructure/ui-elements/lib/components/Progress/ProgressCircle'
import logging from '.././dashboardLogging';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import BedTimeGraph from './BedTimeGraph'
import PageTable from '../components/PageTable'
import TTPanel from '../components/TTPanel'

import las from '../../labels'

const { timeLabelSimple, dayOfWeekLabel } = las
const millisecondsInDay = 86400000
const millisecondsInHour = 3600000

const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1

export class CreepyVis extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      domains: [],
      recent: [],
      pagesByTime: [],
      bedtimes: [],
      morningStart: 6
    }
    this.getByTime = this.getByTime.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleBedtimes = this.handleBedtimes.bind(this)
    this.setMessage = this.setMessage.bind(this)
    //  this.logLoad = this.logLoad.bind(this);
  }

  async componentDidMount () {
    const background = await browser.runtime.getBackgroundPage()
    let tempDate = new Date(Date.now() - (7 * millisecondsInDay)) // start a full week ago?
    let startDate = new Date(tempDate.getFullYear(),
      tempDate.getMonth(), tempDate.getDate())
    let args = {afterDate: startDate.getTime()}
    const weektimestamps = background.queryDatabase('getTimestamps', args)
    let activityType = 'load dashboard Creepy Vis page'
    logging.logLoad(activityType, {})
    weektimestamps.then(ts => {
      const times = ts.map(x => (
        (new Date(x.id))
      ))
      this.setState({
        weektimestamps: times
      })
    })
  }

  async getByTime (dayOfWeek, hourStart) {
    let background = await browser.runtime.getBackgroundPage()
    let tempDate = new Date(Date.now())
    while (dayOfWeek !== tempDate.getDay()) {
      tempDate = new Date(tempDate.getTime() - millisecondsInDay)
    }
    let startDate = new Date(tempDate.getFullYear(),
      tempDate.getMonth(), tempDate.getDate(), hourStart)
    let args = {startTime: startDate.getTime(),
      endTime: startDate.getTime() + millisecondsInHour}
    return background.queryDatabase('getPagesByTime', args)
  }

  recentVisitsTitle (summary) {
    if (summary.size) {
      return 'Pages visited on ' + dayOfWeekLabel(summary.x) +
      ' from ' + timeLabelSimple(summary.y) + ' to ' + timeLabelSimple(summary.y + 1)
    } else {
      return 'Pages visited'
    }
  }

  handleClick (i) {
    let today = (new Date(Date.now())).getDay()

    let day = (i.x + (i.y < (24 - this.state.morningStart) ? -1 : 0) + today) % 7
    let pagesByTime = this.getByTime(day, i.y + this.state.morningStart)
    pagesByTime.then(ps => {
      this.setState({
        recent: {...i, y: i.y + this.state.morningStart, x: day},
        pagesByTime: ps
      })
    })
  }

  handleBedtimes (bedtimes) {
      this.setState({bedtimes: bedtimes});
      console.log(this.state.bedtimes)
  }

  setMessage () {
    if (this.state.bedtimes) {
      let {bedtimes, morningStart} = this.state
      // bedtimes = [{y: 23, x: 1, size: 7, color: 0},
      //   {y: 16, x: 2, size: 11, color: 0},
      //   {y: 20, x: 3, size: 9, color: 0},
      //   {y: 18, x: 4, size: 99, color: 0},
      //   {y: 16, x: 5, size: 7, color: 0},
      //   {y: 15, x: 6, size: 109, color: 0},
      //   {y: 21, x: 7, size: 32, color: 0}]
      const times = bedtimes.map(point => point.y);

      const numDays = bedtimes.length
      const avg = arr => arr.reduce((a,b) => a + b, 0) / arr.length
      const bedtimeAvg = avg(times)
      const early = bedtimes.every((elem) => elem.y <= 10 + morningStart)
      const late = bedtimes.filter((elem) => elem.y >= 14 + morningStart)
      const range = Math.max(...times) - Math.min(...times)

      const starter = "They know that you have been"
      if (early) {
        return starter + " reliably going to bed very early"
      } else if (numDays > 2 && bedtimes[numDays - 1].y > bedtimeAvg && bedtimes[numDays - 2].y > bedtimeAvg ){
        return starter + " having trouble falling asleep the last couple of days"
      } else if (numDays > 2 && bedtimes[numDays - 1].y < bedtimeAvg && bedtimes[numDays - 2].y < bedtimeAvg){
        return starter + " going to bed earlier the last couple of days"
      } else if (late.length >= 5) {
        return starter + " reliably going to bed very late"
      } else if (range >= 4) {
        return starter + " going to bed at very inconsistent times - your bedtime varied by " + range.toString() + " hours over the course of the week -";
      } else if (range < 2) {
        return starter + " following a very consistent bedtime";
      } else {
        return starter + " adhering to a very average sleep schedule"
      }
    }
    return 'No data yet; come back in a couple of days.'
  }

  render () {
    const { weektimestamps, recent, pagesByTime } = this.state
    const { hideInferenceContent, hideTrackerContent } = this.props
    const ok = weektimestamps && weektimestamps.length > 0
    const nodata = weektimestamps && weektimestamps.length === 0
    const msg = this.setMessage()

    return (
      <div>
        <Heading level='h1'><FontAwesomeIcon icon='clock' /><strong>&nbsp; How late you have been online</strong></Heading>
        <TTPanel margin='medium 0 medium 0'>
          <Text>
            <p>
              <span>Trackers monitor your browsing activity across many sites, and profile your interests. </span>
              {ok && <span>
                 {msg} and target ads to you based on that.</span>}
            </p>
            <p>
              <span>The graph shows how late you were online each night over the past week. The bigger the point, the more likely you were tracked. Click on a point to learn more about the tracking that took place.</span>
            </p>
            {nodata && <p>Come back after visiting a few pages to see your activity.</p>}
          </Text>
        </TTPanel>
        {ok && <div>
          <TTPanel margin='medium 0 medium 0'>
            <BedTimeGraph
              weektimestamps={weektimestamps}
              onBedtimesParsed={this.handleBedtimes}
              update={this.handleClick} />
          </TTPanel>
          <TTPanel margin='medium 0 medium 0'>
            {recent &&
            <PageTable
              title={this.recentVisitsTitle(recent)}
              data={pagesByTime}
              noDataText='Click on points in the graph for more information'
              showSite
              showInference={!hideInferenceContent}
              showTrackers={!hideTrackerContent}
              sortAscending
            />
            }
          </TTPanel>

        </div>}


      </div>
    )
  }
}

export default CreepyVis;
