import React from 'react'
import { SizeMe } from 'react-sizeme'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import ToggleDetails from '@instructure/ui-toggle-details/lib/components/ToggleDetails'

import logging from '../dashboardLogging'
import Metrics from '../components/Metrics'
import PageTable from '../components/PageTable'
import PageTimeGraph from '../components/PageTimeGraph'
import SmallGraphAndTable from '../components/SmallGraphAndTable'
import TTPanel from '../components/TTPanel'
import WordCloud from '../components/WordCloud'

export default class TrackerDetailPage extends React.Component {
  constructor (props) {
    super(props)
    this.wcRef = React.createRef()
    this.tracker = this.props.match.params.name
    this.state = {
      inferences: [],
      domains: [],
      pages: [],
      metrics: [{
        name: '',
        value: ''
      }]
    }
    // this.logLoad = this.logLoad.bind(this);
    this.renderDescription = this.renderDescription.bind(this)
    this.renderPageTable = this.renderPageTable.bind(this)
  }

  async componentWillUnmount () {}

  async componentDidMount () {
    let queryObj = {tracker: this.tracker}
    const background = await browser.runtime.getBackgroundPage()

    const inferencesP = background.queryDatabase('getInferencesByTracker', queryObj)
    const domainsP = background.queryDatabase('getDomainsByTracker', queryObj)
    const timestampsP = background.queryDatabase('getTimestampsByTracker', queryObj)
    const pagesP = background.queryDatabase('getPagesByTracker', queryObj)
    const trackerDataP = import(/* webpackChunkName: "data/trackerData" */'../../data/trackers/companyData.json')

    const [inferences, domains, timestamps, pages, trackerData] =
      await Promise.all([inferencesP, domainsP, timestampsP, pagesP, trackerDataP])

    const trackerInfo = trackerData.default[this.tracker]
    const timestamps2 = timestamps.map(x => parseInt(x.Pages.id))

    const metrics = [
      {
        name: 'Type',
        value: trackerInfo.type
      }, {
        name: 'Sites',
        value: domains.length
      }, {
        name: 'Pages',
        value: pages.length
      }, {
        name: 'Percent of pages',
        value: '?%'
      }, {
        name: 'Inferences',
        value: inferences.length
      }
    ]

    this.setState({
      inferences: inferences,
      domains: domains,
      timestamps: timestamps2,
      pages: pages,
      metrics: metrics,
      trackerInfo: trackerInfo
    })

    // LOGGING
    let hashedTracker = background.hashit(this.tracker)
    let numDomains = domains.length
    let hashedInferences = []
    for (let i = 0; i < inferences.length; i++) {
      let value = await background.hashit(inferences[i]['inference'])
      hashedInferences.push(value)
    }
    let sendDict = {
      'hashedTracker': hashedTracker,
      'numDomainsShown': numDomains,
      'hashedInferencesShown': JSON.stringify(hashedInferences)
    }
    let activityType = 'open non-tab-page: show domains and inferences for a tracker'
    logging.logLoad(activityType, sendDict)
  }

  renderDescription () {
    const { trackerInfo } = this.state
    if (!trackerInfo || !trackerInfo.description) return null

    return (
      <TTPanel>
        <Text>
          {trackerInfo.description && <div>
            <div dangerouslySetInnerHTML={{__html: trackerInfo.description}} />
          </div>}

          {trackerInfo.notes && <ToggleDetails
            summary={'Who is ' + this.tracker + '?'}
          >
            <div dangerouslySetInnerHTML={{__html: trackerInfo.notes}} />
          </ToggleDetails>}
        </Text>

      </TTPanel>
    )
  }

  renderPageTable () {
    const { pages } = this.state
    return (
      <TTPanel>
        <Heading level='h2' margin='0 0 medium 0'>Where has {this.tracker} tracked you?</Heading>
        <PageTable
          title={'Pages where ' + this.tracker + ' trackers were present'}
          data={pages}
          showSite
          showInference
        />
      </TTPanel>
    )
  }

  renderPageTimeGraph () {
    const { timestamps } = this.state
    return (
      <TTPanel>
        <Heading level='h2' margin='0 0 medium 0'>When has {this.tracker} tracked you?</Heading>
        <Text>The following graph shows the number of pages over time where {this.tracker} has tracked you.</Text>
        <PageTimeGraph
          timestamps={timestamps}
        />
      </TTPanel>
    )
  }

  render () {
    const { trackerInfo, domains, inferences, metrics } = this.state
    const ready = trackerInfo && domains && inferences
    if (!ready) return 'Loading…'

    return (
      <div>
        <Grid>
          <GridRow>
            <GridCol>
              <Heading level='h1'>{this.tracker}</Heading>
            </GridCol>
            <GridCol margin='auto'>
              <Metrics metrics={metrics} />
            </GridCol>
          </GridRow>
          <GridRow>
            <GridCol>
              {this.renderDescription()}
            </GridCol>
          </GridRow>
          <GridRow>
            <GridCol width={6}>
              <TTPanel>
                <Heading level='h2'>Inferences</Heading>
                <SizeMe>
                  {({ size }) => (
                    <WordCloud 
                      data={inferences}
                      height={496}
                      width={size.width}
                    />
                  )}
                </SizeMe>
              </TTPanel>
            </GridCol>
            <GridCol width={6}>
              <TTPanel>
              <SmallGraphAndTable
                name='Domains'
                description='TODO: description'
                data={domains}
                c1Header='Site'
                urlStem='#/domains/'
              />
              </TTPanel>
            </GridCol>
          </GridRow>
          <GridRow>
            <GridCol>
              {this.renderPageTable()}
            </GridCol>
          </GridRow>
          <GridRow>
            <GridCol>
              {this.renderPageTimeGraph()}
            </GridCol>
          </GridRow>
        </Grid>
      </div>
    )
  }
}
