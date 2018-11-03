import React from 'react'
import ReactDOM from 'react-dom'

import theme from '@instructure/ui-themes/lib/canvas'
import Text from '@instructure/ui-elements/lib/components/Text'
import Button from '@instructure/ui-buttons/lib/components/Button'
import Link from '@instructure/ui-elements/lib/components/Link'
import TabList from '@instructure/ui-tabs/lib/components/TabList'
import TabPanel from '@instructure/ui-tabs/lib/components/TabList/TabPanel'
import List from '@instructure/ui-elements/lib/components/List'
import ListItem from '@instructure/ui-elements/lib/components/List/ListItem'
import MetricsList from '@instructure/ui-elements/lib/components/MetricsList'
import MetricsListItem from '@instructure/ui-elements/lib/components/MetricsList/MetricsListItem'
import View from '@instructure/ui-layout/lib/components/View'
import Alert from '@instructure/ui-alerts/lib/components/Alert'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEye, faThumbsUp, faAd, faArrowRight, faPaw, faUser,
  faWindowMaximize, faClock, faExclamationTriangle,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons'

import logging from '../dashboard/dashboardLogging'
import tt from '../helpers'
import { themeOverrides } from '../colors'

theme.use({ overrides: themeOverrides })
library.add(
  faEye, faThumbsUp, faAd, faArrowRight, faPaw, faUser,
  faWindowMaximize, faClock, faExclamationTriangle,
  faExternalLinkAlt
)

class Popup extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      tabData: {},
      trackerData: {},
      numTrackers: '…',
      numPages: '…',
      numInferences: '…',
      usageStatCondition: undefined,
      id: ""
    }
    // this.sendPopupData = this.sendPopupData.bind(this);
    this.openDashboard = this.openDashboard.bind(this)
    this.loadID = this.loadID.bind(this)
    this.onClickSurvey2 = this.onClickSurvey2.bind(this)
  }

  async getData () {
    const background = await browser.runtime.getBackgroundPage()
    const numPages = background.queryDatabase('getNumberOfPages', {})
    const numTrackers = background.queryDatabase('getNumberOfTrackers', {})
    const numInferences = background.queryDatabase('getNumberOfInferences', {})

    // we use promises here instead of async/await because queries are not dependent on each other
    numPages.then(n => this.setState({numPages: n}))
    numTrackers.then(n => this.setState({numTrackers: n}))
    numInferences.then(n => this.setState({numInferences: n}))

    const tabs = await browser.tabs.query({active: true, currentWindow: true})
    const tab = tabs[0]
    // get tab data with trackers and stuff here
    const tabData = await background.getTabData(tab.id)

    if (tabData) {
      // this.setState({tab: JSON.stringify(tabData)})

      let title = tabData.title
      if (title.length >= 30) {
        title = title.substring(0, 30).concat('...')
      }

      this.setState({
        pageTitle: title,
        tabData
      })

      if (tabData.trackers.length > 0) {
        const topTracker = tabData.trackers[0]
        const topTrackerCount = background.queryDatabase('getPageVisitCountByTracker', {tracker: topTracker})
        topTrackerCount.then(count => {
          this.setState({
            topTracker: topTracker,
            topTrackerCount: count
          })
        })
      }
    }
  }

  async openDashboard () {
    // console.log('I am here 1');
    const tabs = await browser.tabs.query({active: true, currentWindow: true})
    let tabId = tabs[0].id
    const dashboardData = {
      active: true,
      url: '../dist/dashboard.html',
      openerTabId: parseInt(tabId)
    }

    await browser.tabs.create(dashboardData)

    let activityType = 'click dashboard button on popup'
    let clickedElem = 'dashboard button'
    await logging.logPopupActions(activityType, clickedElem)
  }

  async openWelcome () {
    const data = {
      active: true,
      url: '../dist/welcome.html',
    }
    await browser.tabs.create(data)
  }

  async componentDidMount () {
    /* comment this next line if you want to off logging data
    Also preserve the order if you want the log, since sometimes getData fails
    and sendPopupData will not run
    */
    await this.getData()
    const store = await browser.storage.local.get(['options', 'usageStatCondition'])
    const options = store.options
    const usageStatCondition = store.usageStatCondition === true || store.usageStatCondition === 'true'
    const okToLoad = true
    this.setState({ ...options, okToLoad, usageStatCondition })

    logging.logPopupActions('open popup', 'extension icon')

    this.loadID()
  }

  // alert participants to take survey 2 after 7 days, give link
  async loadID () {
    const store = await browser.storage.local.get('mturkcode')
    const extensionID = store.mturkcode
    this.setState({ id : extensionID })
  }

  onClickSurvey2 () {
    let id = this.state.id
    const survey2link = {
      active: true,
      url: 'https://umdsurvey.umd.edu/jfe/form/SV_552e1c5EZKv3yMR?id=' + id
    }
    browser.tabs.create(survey2link)
  }

  render () {
    const {
      okToLoad, selectedIndex,
      numTrackers, numInferences, numPages, pageTitle, topTracker, topTrackerCount, tabData,
      showTrackerContent, showInferenceContent, showHistoryContent, showDashboard
    } = this.state
    const { trackers, inference } = tabData || {}

    const showMetrics = showDashboard && (showTrackerContent || showHistoryContent || showInferenceContent)
    // this.sendPopupData(numTrackers, numInferences, numPages, pageTitle, trackers, topTracker, topTrackerCount);

    if (this.state.usageStatCondition === false) {
        return (
        <View as='div' textAlign='center'>
          <Button onClick={this.openWelcome} margin='small'>Resume {EXT.NAME} setup</Button>
        </View>
        )
    }

    return (<div style={{width: 450}}>
      <Alert variant='info'>
        Thank you for keeping our extension installed. Survey 2 is now ready.<br/><br/>
        <Button variant='primary' onClick={this.onClickSurvey2}>
          <Text>Take Survey 2</Text>
        </Button>
      </Alert>

      <TabList
        variant='minimal'
        selectedIndex={selectedIndex}
        onChange={(e) => this.setState({ selectedIndex: e })}
      >
        <TabPanel title='Summary'>
          <View as='div' borderWidth='0 0 small 0'>
            <Text>
              {pageTitle && showTrackerContent &&
              <p>You are on "{pageTitle}".</p>
              }
              {showInferenceContent && inference &&
              <p>Our algorithms have determined that this page is likely about <strong>{inference}</strong>.</p>
              }
              {showTrackerContent && trackers &&
              <p>There are <strong>{trackers.length} trackers</strong> on this page.&nbsp;
                {trackers.length > 0 && <Link onClick={() => this.setState({ selectedIndex: 1 })}>See all ⟩</Link>}</p>
              }
              {(!pageTitle || (!showInferenceContent && !showTrackerContent)) && <p>The {EXT.NAME} plugin provides transparency about online privacy.</p>}
            </Text>
          </View>
          {showMetrics && <View as='div' borderWidth='0 0 small 0' padding='medium 0 medium 0'>
            <MetricsList theme={{lineHeight: 2}}>
              {showTrackerContent && <MetricsListItem value={numTrackers} label={<span><FontAwesomeIcon icon='eye' /> Trackers you've seen</span>} />}
              {showHistoryContent && <MetricsListItem value={numPages} label={<span><FontAwesomeIcon icon='window-maximize' /> Pages you've visited</span>} />}
              {showInferenceContent && <MetricsListItem value={numInferences} label={<span><FontAwesomeIcon icon='thumbs-up' /> Your interests</span>} />}
            </MetricsList>
          </View>}
        </TabPanel>
        {showTrackerContent && trackers && trackers.length > 0 && <TabPanel title='Trackers'>
          <Text><p>There are {trackers && trackers.length} trackers on this page, including:</p></Text>
          <List>
            {trackers && trackers.map(t => <ListItem key={t}>{t}</ListItem>)}
          </List>
        </TabPanel>}
      </TabList>
      {/* <div >
        <Heading margin='0 0 medium 0'>Test</Heading>
        <Text>

          {topTracker &&
            <p>One of these trackers is <strong>{topTracker}</strong>, which knows about your activity on this page and <strong>{topTrackerCount}</strong> others.</p>
          }

          {isData &&
            <p>In total, <em>{numTrackers} trackers</em> have seen you visit <em>{numPages} pages</em>. The {EXT.NAME} extension has determined that these companies could have inferred your interest in <em>{numInferences} topics</em>.</p>
          }
        </Text>

      </div> */}
      {showDashboard &&
      <View as='div' textAlign='center'>
        <Button onClick={this.openDashboard} margin='small'>Show me more info about my web browsing</Button>
      </View>
      }
    </div>)
  }
}

ReactDOM.render(<Popup />, document.getElementById('root'))
