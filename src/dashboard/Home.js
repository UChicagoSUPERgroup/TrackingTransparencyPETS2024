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
import Tag from '@instructure/ui-elements/lib/components/Tag'

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
    <div>
      <Heading level="h3">Your Top Interests</Heading>
      <span>
        {data.map((p, i, arr) => {
          const last = (i === (arr.length - 1))
          const inference = p['inference']
          return (
            <div>
              <span><strong>{i+1}</strong></span>
              <span key={inference}>
                <Tag text={inference} size="large" margin="x-small x-small x-small x-small" />
                <br/>
              </span>
            </div>
          )
        })}
      </span>
    </div>
  )
}

const trackerList = (data) => {
  return (
    <div>
      <Heading level="h3">Your Top Trackers</Heading>
      <span>
        {data.map((p, i, arr) => {
          const last = (i === (arr.length - 1))
          return (
            <div>
              <span><strong>{i+1}</strong></span>
              <span key={p.tracker}>
                <Tag text={p.tracker} size="large" margin="x-small x-small x-small x-small" />
                <br/>
              </span>
            </div>
          )
        })}
      </span>
    </div>
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

const stackedIconWord = (icon, word) => {
  return (
    <div style={{width: "auto", display:"inline-block"}}>
      <Grid rowSpacing="none" startAt="small">
        <GridRow>
            <GridCol textAlign="center">
                <div>{icon}</div>
            </GridCol>
        </GridRow>
        <GridRow>
          <GridCol textAlign="center">
            <div>{word}</div>
          </GridCol>
        </GridRow>
      </Grid>
    </div>
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
    const topInferences = background.queryDatabase('getInferences', args)
    const recentDomains = background.queryDatabase('getDomains', args)
    const topTrackers = background.queryDatabase('getTrackers', args)

    // we use promises here instead of async/await because queries are not dependent on each other
    numPages.then(n => this.setState({numPages: n}))
    numTrackers.then(n => this.setState({numTrackers: n}))
    numInferences.then(n => this.setState({numInferences: n}))
    recentInferences.then(n => this.setState({recentInferences: n}))
    topInferences.then(n => this.setState({topInferences: n}))
    recentDomains.then(n => this.setState({recentDomains: n}))
    topTrackers.then(n => this.setState({topTrackers: n}))
  }

  async componentDidMount () {
    this.getData()
    // this.logLoad(); //will directly load it in App.js
  }

  render () {
    const {numTrackers, numInferences, numPages, recentInferences, recentDomains, topTrackers, topInferences} = this.state

    return (
      <Grid startAt='large'>
        <GridRow>
          <GridCol>
            {arrowPanel()}
            <TTPanel margin='medium 0 0 0'>
              <Heading level="h3">What does this mean for you?</Heading>
                <Grid>
                  <GridRow>
                    <GridCol>
                      <Text>
                        <p>If {stackedIconWord(<FontAwesomeIcon icon='user' />, "you")} go online and visit a {stackedIconWord(<FontAwesomeIcon icon='window-maximize' />, "site")} about traveling with {stackedIconWord(<FontAwesomeIcon icon='paw' />, "dogs")}, a third-party {stackedIconWord(<FontAwesomeIcon icon='eye' />, "tracker")} on that {stackedIconWord(<FontAwesomeIcon icon='window-maximize' />, "site")} could {stackedIconWord(<FontAwesomeIcon icon='cogs' />, "guess")} that you have an {stackedIconWord(<FontAwesomeIcon icon='thumbs-up' />, "interest")} in {stackedIconWord(<FontAwesomeIcon icon='paw' />, "dogs")}. Later, you might see an {stackedIconWord(<FontAwesomeIcon icon='ad' />, "ad")} that was specifically {stackedIconWord(<FontAwesomeIcon icon='bullseye' />, "targeted")} to {stackedIconWord(<FontAwesomeIcon icon='user' />, "people")} who like {stackedIconWord(<FontAwesomeIcon icon='paw' />, "dogs.")}</p>
                      </Text>
                    </GridCol>
                    <GridCol>
                      <Text>
                        <p>When advertisers do targeted advertising, they can use your interests in unexpected ways. For example, an advertiser could show you sports ads because they think people who like dogs will also like sports.</p>
                        <p>A third-party tracker could also guess incorrectly about your interests. If you often visit sites about a topic, trackers might guess you are interested in that topic, even if actually aren't.</p>
                      </Text>
                    </GridCol>
                  </GridRow>
                </Grid>
            </TTPanel>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol width={3}>
            <TTPanel>
              {trackerList(topTrackers || [])}
            </TTPanel>
          </GridCol>
          <GridCol width={3}>
            <TTPanel>
              {inferenceTopList(topInferences || [])}
            </TTPanel>

          </GridCol>
          <GridCol width={6}>
            <TTPanel>
              <MetricsList theme={{lineHeight: 2}}>
                <MetricsListItem value={numTrackers || 'Loading…'} label={<span><FontAwesomeIcon icon='eye' /> Trackers you've seen</span>}/>
                <MetricsListItem value={numPages || 'Loading'} label={<span><FontAwesomeIcon icon='window-maximize' /> Pages you've visited</span>}/>
                <MetricsListItem value={numInferences || 'Loading'} label={<span><FontAwesomeIcon icon='thumbs-up' /> Your interests</span>} />
              </MetricsList>
            </TTPanel>

            <TTPanel margin='medium 0 0 0'>
              <View
                display='inline-block'
                margin='small small small small'
              >
                <View
                  as='header'
                  margin='0 0 small small'
                >
                  <Text weight='bold'>Recent Interests</Text>
                </View>
                {recentInferences ? inferenceRecentList(recentInferences) : 'Loading…'}
              </View>
              <View
                display='inline-block'
                margin='small small small small'
              >
                <View
                  as='header'
                  margin='0 0 small small'
                >
                  <Text weight='bold'>Recent Sites</Text>
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
