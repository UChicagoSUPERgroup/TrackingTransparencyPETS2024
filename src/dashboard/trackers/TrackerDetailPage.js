import React from 'react';
import ReactTable from 'react-table';

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'
import MetricsList from '@instructure/ui-elements/lib/components/MetricsList'
import MetricsListItem from '@instructure/ui-elements/lib/components/MetricsList/MetricsListItem'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import ToggleDetails from '@instructure/ui-toggle-details/lib/components/ToggleDetails'
import ToggleGroup from '@instructure/ui-toggle-details/lib/components/ToggleGroup'

import PageTable from '../components/PageTable'
import TTPanel from '../components/TTPanel'
import logging from '../dashboardLogging';

import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries
} from 'react-vis';

const DomainTable = (data) => {
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: 'Site',
          accessor: 'domain',
          Cell: row => (
            <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' href={'#/domains/' + row.value}>
                {row.value}
              </Link>
            </div>)
        },
        {Header: 'Page Count',
          accessor: 'count'}
      ]}
      pageSize={Math.min(10, Math.max(data.length, 3))}
      showPageSizeOptions={false}
      className='-striped -highlight'
    />
  );
}

const InferTable = (data) => {
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: 'Inference',
          accessor: 'inference',
          Cell: row => (
            <div key={row.value}>
              <Link className='inferenceTableLinkTrackersPage' href={'/inferences/' + row.value}>
                {row.value}
              </Link>
            </div>)
        },
        {Header: 'Inference Count',
          accessor: 'COUNT(inference)'}
      ]}
      pageSize={Math.min(10, Math.max(data.length, 3))}
      showPageSizeOptions={false}
      className='-striped -highlight'
    />
  );
}

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
    this.renderInferInfo = this.renderInferInfo.bind(this)
    this.renderDomainInfo = this.renderDomainInfo.bind(this)
    this.renderPageTable = this.renderPageTable.bind(this)
    this.renderTimeGraph = this.renderTimeGraph.bind(this)
  }

  async componentWillUnmount() {}

  async componentDidMount() {
    import(/* webpackChunkName: "lodash" */'lodash')
      .then(_ => { this._ = _ })

    let queryObj = {tracker: this.tracker};
    const background = await browser.runtime.getBackgroundPage();
    const inferences = await background.queryDatabase('getInferencesByTracker', queryObj);
    const domains = await background.queryDatabase('getDomainsByTracker', queryObj);
    const timestamps = await background.queryDatabase('getTimestampsByTracker', queryObj);
    const times2 = timestamps.map(x => (
      (new Date(x.Pages.id))));
    const pages = await background.queryDatabase('getPagesByTracker', queryObj);
    this.setState({
      inferences: inferences,
      domains: domains,
      times: times2,
      timestamps: timestamps,
      pages: pages
    });

    import(/* webpackChunkName: "data/trackerData" */'../../data/trackers/companyData.json').then(data => {
      const trackerInfo = data.default[this.tracker]
      this.setState({
        trackerInfo: trackerInfo
      })
    })

    // LOGGING
    let hashedTracker = background.hashit(this.tracker);
    let numDomains = domains.length;
    let hashedInferences = [];
    for (let i = 0; i < inferences.length; i++) {
      let value = await background.hashit(inferences[i]['inference'])
      hashedInferences.push(value);
    }
    sendDict = {
      'hashedTracker': hashedTracker,
      'numDomainsShown': numDomains,
      'hashedInferencesShown': JSON.stringify(hashedInferences)
    }
    let activityType = 'open non-tab-page: show domains and inferences for a tracker';
    logging.logLoad(activityType, sendDict);
  }

  renderDescription () {
    const { trackerInfo, domains, inferences, pages } = this.state

    const numDomains = domains.length || 0;
    const numInferences = inferences.length || 0;
    const numPages = pages.length || 0;

    return (
      <div>
        <TTPanel>
          <MetricsList>
            <MetricsListItem label='Type' value={trackerInfo.type} />
            <MetricsListItem label='Sites' value={numDomains} />
            <MetricsListItem label='Pages' value={numPages} />
            <MetricsListItem label='Percent of pages' value='?%' />
            <MetricsListItem label='Inferences' value={numInferences} />
          </MetricsList>
        </TTPanel>
        <Text>
          {trackerInfo.description && <div>
            <div dangerouslySetInnerHTML={{__html: trackerInfo.description}} />
          </div>}

          <p>TODO: few sentence summary</p>

          {trackerInfo.notes && <ToggleDetails
            summary='Additional notes'
          >
            <div dangerouslySetInnerHTML={{__html: trackerInfo.notes}} />
          </ToggleDetails>}
        </Text>

      </div>
    )
  }

  renderInferInfo () {
    const { inferences } = this.state
    return (
      <div>
        <Heading level='h2' margin='0 0 medium 0'>Inferences</Heading>
        <Text>TODO: mini graph</Text>
        <ToggleGroup
          summary={'See all inferences'}
          variant='filled'
          margin='medium 0 0 0'
        >
          <div>{InferTable(inferences)}</div>
        </ToggleGroup>
      </div>
    )
  }

  renderDomainInfo () {
    const { domains } = this.state
    return (
      <div>
        <Heading level='h2' margin='0 0 medium 0'>Sites</Heading>
        <Text>TODO: mini graph</Text>
        <ToggleGroup
          summary={'See all sites'}
          variant='filled'
          margin='medium 0 0 0'
        >
          {DomainTable(domains)}
        </ToggleGroup>
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

  renderTimeGraph () {
    const { times, timestamps } = this.state

    let firstDay = 0
    const msInDay = 86400000
    let data = []

    if (timestamps && times[0] && this._) {
      firstDay = new Date(times[0].getFullYear(), times[0].getMonth(), times[0].getDate());
      firstDay = firstDay.getTime();
      let grouped;
      grouped = this._.groupBy(timestamps, t => Math.floor((parseInt(t.Pages.id) - firstDay) / msInDay));
      for (let day in grouped) {
        data.push({
          x: parseInt(day),
          y: grouped[day].length
        });
      }
    }

    const dataLabel = (v) => {
      var tempDay = new Date((v * msInDay) + firstDay);
      return tempDay.toDateString();
    }

    return (
      <div>
        <Heading level='h2' margin='large 0 medium 0'>When has {this.tracker} tracked you?</Heading>
        <Text>The following graph shows the number of pages over time where {this.tracker} has tracked you.</Text>
        <FlexibleWidthXYPlot
          height={200}
          margin={{left: 100, right: 10, top: 10, bottom: 70}}>
          <HorizontalGridLines />
          <LineSeries
            color='#8F3931'
            data={data} />
          <XAxis
            height={100}
            tickFormat={dataLabel}
            tickLabelAngle={-20} />
          <YAxis />
        </FlexibleWidthXYPlot>
      </div>
    )
  }

  render() {
    const { trackerInfo, domains, inferences } = this.state
    const ready = trackerInfo && domains && inferences

    return (
      <div>
        <Heading level='h1' margin='0 0 large 0'>Trackers: {this.tracker}</Heading>
        {ready && <div>
          {this.renderDescription()}
          <hr />
          <Grid startAt='large'>
            <GridRow>
              <GridCol>
                {this.renderInferInfo()}
              </GridCol>
              <GridCol>
                {this.renderDomainInfo()}
              </GridCol>
            </GridRow>
          </Grid>
          <hr />
          {this.renderPageTable()}
          <hr />
          {this.renderTimeGraph()}
          <hr />
        </div>}
      </div>
    );
  }
}
