import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'

import PagesTimeScatterplot from './PagesTimeScatterplot'
import PageTable from '../components/PageTable'
import logging from '../dashboardLogging'
import TTPanel from '../components/TTPanel'

import las from '../../labels'
const { timeLabelSimple, dayOfWeekLabel } = las
const millisecondsInDay = 86400000
const millisecondsInHour = 3600000

export default class ActivityOverview extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      domains: [],
      recent: [],
      pagesByTime: []
    }
    this.getByTime = this.getByTime.bind(this)
    this.handleClick = this.handleClick.bind(this)
    //  this.logLoad = this.logLoad.bind(this);
  }

  async componentDidMount () {
    const background = await browser.runtime.getBackgroundPage()
    let tempDate = new Date(Date.now() - (6 * millisecondsInDay))
    let startDate = new Date(tempDate.getFullYear(),
      tempDate.getMonth(), tempDate.getDate())
    let args = {afterDate: startDate.getTime()}
    const weektimestamps = background.queryDatabase('getTimestamps', args)
    let activityType = 'load dashboard recent activity page'
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
      return 'Pages visited on ' + dayOfWeekLabel(summary.y) +
      ' from ' + timeLabelSimple(summary.x) + ' to ' + timeLabelSimple(summary.x + 1)
    } else {
      return 'Pages visited'
    }
  }

  handleClick (i) {
    let today = (new Date(Date.now())).getDay()
    i.y = (i.y + today) % 7
    let pagesByTime = this.getByTime(i.y, i.x)
    pagesByTime.then(ps => {
      this.setState({
        recent: i,
        pagesByTime: ps
      })
    })
  }

  render () {
    const {weektimestamps, recent, pagesByTime} = this.state

    return (
      <div>
        <Heading level='h1'>When were you tracked?</Heading>
        <TTPanel margin='medium 0 medium 0'>
          <Text>
            <p>
                Trackers are able to track your browsing activity across many different sites, [[[and may be able to link multiple inferences made about you, based on when you were browsing??]]]. Our algorithms have determined that you were most tracked this week on <strong>[day of the week] between [hours]</strong>.
            </p>
            <p>
                The scatterplot shows how many pages you visited for each hour of the last week. The bigger the point, the more likely you were tracked. Click on a point to learn more about the tracking that took place.
            </p>
          </Text>
        </TTPanel>
        <TTPanel margin='medium 0 medium 0'>
          {weektimestamps &&
          <PagesTimeScatterplot
            weektimestamps={weektimestamps}
            update={this.handleClick} />
          }
        </TTPanel>
        <TTPanel margin='medium 0 medium 0'>
          {recent &&
          <PageTable
            title={this.recentVisitsTitle(recent)}
            data={pagesByTime}
            noDataText='Click in the scatterplot for more information'
            showSite
            showInference
          />
          }
        </TTPanel>

      </div>
    )
  }
}
