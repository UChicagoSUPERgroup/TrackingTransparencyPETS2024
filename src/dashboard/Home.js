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

import IconEye from '@instructure/ui-icons/lib/Solid/IconEye'
import IconLike from '@instructure/ui-icons/lib/Solid/IconLike'
import IconWarning from '@instructure/ui-icons/lib/Solid/IconWarning'

import SVGIcon from '@instructure/ui-svg-images/lib/components/SVGIcon'

import TTPanel from './components/TTPanel'

const inferenceList = (data) => {
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

const inferenceListDisplay = (data) => {
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

    const eye = (<IconEye />)
    const like = (<IconLike />)
    const warning = (<IconWarning />)
    return (
      <Grid startAt='large'>
        <GridRow>
          <GridCol>
            <Heading level='h1'>Home</Heading>
          </GridCol>
        </GridRow>

        <GridRow>
          <GridCol>
            <div>
              <SVGIcon src={eye} size="small" title="Eye" />
            </div>
            <TTPanel>

              <Text>
                {eye}
                <p>When you browse online, your online activity is tracked by the website you are visiting, as well as by third-party advertising and analytics companies. </p>

                {like}
                <p>Third-party companies track your browsing in order to make guesses about what topics you might be interested in. We call these topics interests.</p>

                {warning}
                <p>Trackers can use your interests to tailor your internet experience, which changes the search results, ads, and social feeds that you see.</p>

                <p>For example, if you visit a blog about traveling with dogs, a third-party tracker on that site could guess that you are interested in dogs. Later, you might see an ad that was targeted specifically to dog-lovers. The same could happen with topics related to shopping, health, finance, sports, and more.</p>

                <p>Using the Tracking Transparency browser extension, you can see the information that tracking companies collect about you.</p>

                <p>In total, <strong>{numTrackers || 'Loading…'} trackers</strong> have seen you visit <strong>{numPages || 'Loading…'} pages</strong>. The Tracking Transparency extension has determined that these companies could have inferred your interest in <strong>{numInferences || 'Loading…'} topics</strong>.</p>
              </Text>
              <Text>
                <p> When you browse the Internet, third-party companies can track your browsing activity and use this information to target ads and for other purposes. We hope this extension will help you understand who is tracking you and what they could have learned.</p>
                <p> In the last week, you visited <strong>{numPages} pages</strong> and encountered <strong>{numTrackers} trackers</strong>.</p>
                <hr />
                {topTrackers && topTrackers.length > 0 && <div>
                  <p><strong>Your top 5 trackers:</strong></p>
                  <div>{trackerList(topTrackers)}</div>
                  <hr />
                </div>}
                {recentInferences && recentInferences.length > 0 && <div>
                  <p><strong>Your top 5 inferred interests:</strong></p>
                  <div>{inferenceListDisplay(recentInferences)}</div>
                  <hr />
                </div>}
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
