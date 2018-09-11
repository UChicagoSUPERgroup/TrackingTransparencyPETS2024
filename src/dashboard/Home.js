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

import TTPanel from './components/TTPanel'

const inferenceList = (data) => {
  return (
    <List
      size='small'
    >
      {data.map(function (dataValue) {
        let key = dataValue['DISTINCT(inference)']
        return (<ListItem key={key}>
          <Link href={'#/inferences/' + key}>
            {key}
          </Link>
        </ListItem>)
      })}
    </List>
  )
}

const domainList = (data) => {
  return (
    <List
      size='small'
    >
      {data.map(val => {
        return (<ListItem key={val}>
          <Link href={'#/domains/' + val}>
            {val}
          </Link>
        </ListItem>)
      })}
    </List>
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

    // we use promises here instead of async/await because queries are not dependent on each other
    numPages.then(n => this.setState({numPages: n}))
    numTrackers.then(n => this.setState({numTrackers: n}))
    numInferences.then(n => this.setState({numInferences: n}))
    recentInferences.then(n => this.setState({recentInferences: n}))
    recentDomains.then(n => this.setState({recentDomains: n}))
  }

  async componentDidMount () {
    this.getData()
    // this.logLoad(); //will directly load it in App.js
  }

  render () {
    const {numTrackers, numInferences, numPages, recentInferences, recentDomains} = this.state
    return (
      <Grid startAt='large'>
        <GridRow>
          <GridCol>
            <Heading level='h1'>Home</Heading>
          </GridCol>
        </GridRow>

        <GridRow>
          <GridCol>
            <TTPanel>
              <Text>

                <p>Our browser extension lets you learn about what companies could have inferrred about your browsing through trackers and advertisments on the web pages you visit.</p>

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
                {recentInferences ? inferenceList(recentInferences) : 'Loading…'}
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
