import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'
import MetricsList from '@instructure/ui-elements/lib/components/MetricsList'
import MetricsListItem from '@instructure/ui-elements/lib/components/MetricsList/MetricsListItem'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import ToggleDetails from '@instructure/ui-toggle-details/lib/components/ToggleDetails'

import PageTable from '../components/PageTable'
import PageTimeGraph from '../components/PageTimeGraph'
import SmallGraphAndTable from '../components/SmallGraphAndTable'
import TTPanel from '../components/TTPanel'
import logging from '../dashboardLogging'

export default class TrackerDetailPage extends React.Component {
  constructor(props) {
    super(props);

    this.tracker = this.props.match.params.name;
    this.state = {
      inferences: [],
      domains: [],
      pages: []
    }
    // this.logLoad = this.logLoad.bind(this);
    this.renderDescription = this.renderDescription.bind(this)
    this.renderPageTable = this.renderPageTable.bind(this)
  }

  async componentWillUnmount() {}

  async componentDidMount() {
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
    });

    // LOGGING
    let hashedTracker = background.hashit(this.tracker);
    let numDomains = domains.length;
    let hashedInferences = [];
    for (let i = 0; i < inferences.length; i++) {
      let value = await background.hashit(inferences[i]['inference'])
      hashedInferences.push(value);
    }
    let sendDict = {
      'hashedTracker': hashedTracker,
      'numDomainsShown': numDomains,
      'hashedInferencesShown': JSON.stringify(hashedInferences)
    }
    let activityType = 'open non-tab-page: show domains and inferences for a tracker';
    logging.logLoad(activityType, sendDict);
  }

  renderMetrics () {
    const { metrics } = this.state

    return (
      <TTPanel>
        <MetricsList>
          {metrics.map(m => (
            <MetricsListItem key={m.name} label={m.name} value={m.value} />
          ))}
        </MetricsList>
      </TTPanel>
    )
  }

  renderDescription () {
    const { trackerInfo, domains, inferences, pages } = this.state

    const numDomains = domains.length || 0;
    const numInferences = inferences.length || 0;
    const numPages = pages.length || 0;

    return (
      <div>
        <Text>
          {trackerInfo.description && <div>
            <div dangerouslySetInnerHTML={{__html: trackerInfo.description}} />
          </div>}

          <p>TODO: few sentence summary</p>

          {trackerInfo.notes && <ToggleDetails
            summary={'Who is ' + this.tracker + '?'}
          >
            <div dangerouslySetInnerHTML={{__html: trackerInfo.notes}} />
          </ToggleDetails>}
        </Text>

      </div>
    )
  }

  renderPageTable () {
    const { pages } = this.state
    return (
      <div>
        <Heading level='h2' margin='large 0 medium 0'>Where has {this.tracker} tracked you?</Heading>
        <PageTable
          title={'Pages where ' + this.tracker + ' trackers were present'}
          data={pages}
          showSite
          showInference
        />
      </div>
    )
  }

  render() {
    const { trackerInfo, domains, inferences, timestamps } = this.state
    const ready = trackerInfo && domains && inferences

    return (
      <div>
        <Heading level='h1' as='span' margin='0 0 large 0'>Trackers: {this.tracker}</Heading>
        {ready && <div>
          {this.renderMetrics()}
          {this.renderDescription()}
          <hr />
          <Grid startAt='large'>
            <GridRow>
              <GridCol>
                <SmallGraphAndTable
                  name='Inferences'
                  description='TODO: description'
                  data={inferences}
                  c1Header='Infererence'
                  c1Accessor='inference'
                  urlStem='#/inferences/'
                />
              </GridCol>
              <GridCol>
                <SmallGraphAndTable
                  name='Domains'
                  description='TODO: description'
                  data={domains}
                  c1Header='Site'
                  c1Accessor='domain'
                  urlStem='#/domains/'
                />
              </GridCol>
            </GridRow>
          </Grid>
          <hr />
          {this.renderPageTable()}
          <hr />

          <Heading level='h2' margin='large 0 medium 0'>When has {this.tracker} tracked you?</Heading>
          <Text>The following graph shows the number of pages over time where {this.tracker} has tracked you.</Text>

          <PageTimeGraph
            timestamps={timestamps}
          />
          <hr />
        </div>}
      </div>
    );
  }
}
