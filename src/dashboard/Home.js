import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Link from '@instructure/ui-elements/lib/components/Link'
import List from '@instructure/ui-elements/lib/components/List'
import ListItem from '@instructure/ui-elements/lib/components/List/ListItem'
import MetricsList from '@instructure/ui-elements/lib/components/MetricsList'
import MetricsListItem from '@instructure/ui-elements/lib/components/MetricsList/MetricsListItem'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import View from '@instructure/ui-layout/lib/components/View'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import TTPanel from './components/TTPanel'

const inferenceRecentList = (data) => {
  return (
    <List
      size='small'
    >
      {data.map(function (dataValue) {
        let key = dataValue['DISTINCT(inference)']
        return (<ListItem key={key}>
          <Link href={'#/interests/' + key}>
            {key}
          </Link>
        </ListItem>)
      })}
    </List>
  )
}

const inferenceTopList = (data) => {
  return (
    <p>
      {data.map((p, i, arr) => {
        const last = (i === (arr.length - 1))
        const inference = p['DISTINCT(inference)']
        return (
          <span key={inference}>
            {inference}{!last ? ', ' : ''}
          </span>
        )
      })}
    </p>
  )
}

const trackerList = (data) => {
  return (
    <p>
      {data.map((p, i, arr) => {
        const last = (i === (arr.length - 1))
        return (
          <span key={p.tracker}>
            {p.tracker}{!last ? ', ' : ''}
          </span>
        )
      })}
    </p>
  )
}

const domainList = (data) => {
  return (
    <List
      size='small'
    >
      {data.map(val => {
        return (<ListItem key={val}>
          <Link href={'#/sites/' + val}>
            {val}
          </Link>
        </ListItem>)
      })}
    </List>
  )
}

const arrowPanel = () => {
  return (
    <TTPanel>
      <Grid vAlign='middle' hAlign='space-between' colSpacing='none' rowSpacing='none'>
        <GridRow>
          <GridCol textAlign='center' width={3}>
            <FontAwesomeIcon icon='eye' size='8x' />
          </GridCol>
          <GridCol textAlign='center' >
            <FontAwesomeIcon icon='arrow-right' size='3x' />
          </GridCol>
          <GridCol textAlign='center' width={3}>
            <FontAwesomeIcon icon='thumbs-up' size='7x' />
          </GridCol>
          <GridCol textAlign='center' >
            <FontAwesomeIcon icon='arrow-right' size='3x' />
          </GridCol>
          <GridCol textAlign='center' width={3}>
            <FontAwesomeIcon icon='ad' size='8x' />
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol width={3} textAlign='center'>
            <p>When you browse online, your online activity is tracked by the website you're visiting, as well as by analytics and ad companies. </p>
          </GridCol>
          <GridCol width={3} textAlign='center'>
            <p>These companies track your browsing to make guesses about what topics you might be interested in. We call these topics <em>interests</em>.</p>
          </GridCol>
          <GridCol width={3} textAlign='center'>
            <p>Your interests are then used to tailor your web experience, which changes the ads, search results, and social feeds that you see.</p>
          </GridCol>
        </GridRow>

      </Grid>
    </TTPanel>
  )
}

export class Home extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
    // this.logClick = this.logClick.bind(this);
    // this.logLoad = this.logLoad.bind(this);
  }

  async getData () {
    const background = await browser.runtime.getBackgroundPage()
    let args = {count: 5}

    const numPages = background.queryDatabase('getNumberOfPages', {})
    const numTrackers = background.queryDatabase('getNumberOfTrackers', {})
    const numInferences = background.queryDatabase('getNumberOfInferences', {})
    const recentInferences = background.queryDatabase('getInferencesByTime', args)
    const recentDomains = background.queryDatabase('getDomains', args)
    const topTrackers = background.queryDatabase('getTrackers', args)

    // we use promises here instead of async/await because queries are not dependent on each other
    numPages.then(n => this.setState({numPages: n}))
    numTrackers.then(n => this.setState({numTrackers: n}))
    numInferences.then(n => this.setState({numInferences: n}))
    recentInferences.then(n => this.setState({recentInferences: n}))
    recentDomains.then(n => this.setState({recentDomains: n}))
    topTrackers.then(n => this.setState({topTrackers: n}))
  }

  async componentDidMount () {
    this.getData()
    // this.logLoad(); //will directly load it in App.js
  }

  render () {
    const {numTrackers, numInferences, numPages, recentInferences, recentDomains, topTrackers} = this.state

    return (
      <Grid startAt='large'>
        <GridRow>
          <GridCol>
            <Heading level='h1'>Home</Heading>
          </GridCol>
        </GridRow>

        <GridRow>
          <GridCol>
            {arrowPanel()}
            <TTPanel margin='medium 0 0 0'>
              <Text>
                <p>For example, if you visit a blog about traveling with dogs, a third-party tracker on that site could guess that you are interested in dogs. Later, you might see an ad that was targeted specifically to dog-lovers. The same could happen with topics related to shopping, health, finance, sports, and more.</p>

                <p>Using the Tracking Transparency browser extension, you can see the information that tracking companies collect about you.</p>

                <p>In total, <strong>{numTrackers || 'Loading…'} trackers</strong> have seen you visit <strong>{numPages || 'Loading…'} pages</strong>. The Tracking Transparency extension has determined that these companies could have inferred your interest in <strong>{numInferences || 'Loading…'} topics</strong>.</p>
              </Text>
            </TTPanel>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol width={6}>
            <TTPanel>
              <MetricsList theme={{lineHeight: 2}}>
                <MetricsListItem label='Trackers Seen' value={numTrackers || 'Loading…'} />
                <MetricsListItem label='Pages Visited' value={numPages || 'Loading'} />
                <MetricsListItem label='Inferred Interests' value={numInferences || 'Loading'} />
              </MetricsList>
            </TTPanel>

            <TTPanel margin='medium 0 0 0'>
              <Text>
                {topTrackers && topTrackers.length > 0 && <div>
                  <p><strong>Your top 5 trackers:</strong></p>
                  <div>{trackerList(topTrackers)}</div></div>}
                {recentInferences && recentInferences.length > 0 && <div>
                  <p><strong>Your top 5 inferred interests:</strong></p>
                  <div>{inferenceTopList(recentInferences)}</div> </div>}
              </Text>
            </TTPanel>
          </GridCol>
          <GridCol width={6}>
            <TTPanel>
              <View
                display='inline-block'
                margin='small medium small large'
              >
                <View
                  as='header'
                  margin='0 0 small small'
                >
                  <Text weight='bold'>Recent Inferences</Text>
                </View>
                {recentInferences ? inferenceRecentList(recentInferences) : 'Loading…'}
              </View>
              <View
                display='inline-block'
                margin='small small small medium'
              >
                <View
                  as='header'
                  margin='0 0 small small'
                >
                  <Text weight='bold'>Recent Domains</Text>
                </View>
                {recentDomains ? domainList(recentDomains) : 'Loading…'}
              </View>
            </TTPanel>
          </GridCol>
        </GridRow>
      </Grid>
    )
  }
}

export const WaitingDataHome = () => (
  <div>
    <Heading level='h1'>Tracking Transparency</Heading>
    <TTPanel>
      <Text>
        <p>The Tracking Tranparency extension is currently running in the background to collect information about the trackers in your browsing.</p>
        <p>Continue using the internet and come back here in a few days to see what they might know about your browsing!</p>
      </Text>
    </TTPanel>
  </div>
)
