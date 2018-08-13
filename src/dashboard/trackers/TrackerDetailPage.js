import React from 'react';
import { Route, Link } from 'react-router-dom';
import ReactTable from 'react-table';

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import ToggleDetails from '@instructure/ui-toggle-details/lib/components/ToggleDetails'

import PageTable from '../components/PageTable'
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
              <Link className='domainTableLinkTrackersPage' to={{pathname: '/domains/' + row.value}}>
                {row.value}
              </Link>
            </div>)
        },
        {Header: 'Page Count',
          accessor: 'count'},
      ]}
      defaultPageSize={20}
      className="-striped -highlight"
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
              <Link className = 'inferenceTableLinkTrackersPage' to={{pathname: '/inferences/' + row.value}}>
                {row.value}
              </Link>
            </div>)
        },
        {Header: 'Inference Count',
          accessor: 'COUNT(inference)'},
      ]}
      defaultPageSize={20}
      className="-striped -highlight"
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
    //this.logLoad = this.logLoad.bind(this);
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
    for (let i=0;i<inferences.length;i++){
      let value = await background.hashit(inferences[i]['inference'])
      hashedInferences.push(value);
    }
    sendDict = {
      'hashedTracker':hashedTracker,
      'numDomainsShown': numDomains,
      'hashedInferencesShown': JSON.stringify(hashedInferences)
    }
    let activityType = 'open non-tab-page: show domains and inferences for a tracker';
    logging.logLoad(activityType, sendDict);
  }

  render() {
    const { domains, inferences, times, timestamps, trackerInfo, pages } = this.state
    const ready = trackerInfo && domains && inferences

    let numDomains = 0;
    let numInferences = 0;
    let firstDay = 0;
    let msInDay = 86400000;
    var data = [];
    if (domains) {
      numDomains = domains.length;
    }
    if (inferences) {
      numInferences = inferences.length;
    }
    if (timestamps && times[0] && this._) {
      firstDay = new Date(times[0].getFullYear(), times[0].getMonth(), times[0].getDate());
      firstDay = firstDay.getTime();
      let grouped;
      grouped = this._.groupBy(timestamps, t => Math.floor((parseInt(t.Pages.id) - firstDay) / msInDay));
      for (let day in grouped) {
        data.push({
          x: parseInt(day),
          y: grouped[day].length,
        });
      }
    }

    var dataLabel = function(v) {
      var tempDay = new Date((v * msInDay) + firstDay);
      return tempDay.toDateString();
    }

    return (
      <div>
        <Heading level='h1'>Trackers</Heading>
        <Heading level='h2' margin='small 0 0 0'>{this.tracker}</Heading>
        {ready && <div>
        <Text>
          <p>{this.tracker} is a <strong>{trackerInfo.type}</strong> tracker.</p>
          {trackerInfo.notes && <ToggleDetails
            summary='We found the following information about this tracker:'
            defaultExpanded
          >
            <div dangerouslySetInnerHTML={{__html: trackerInfo.description}}></div>
            {trackerInfo.notes && <ToggleDetails
              summary='Additional notes'
            >
              <div dangerouslySetInnerHTML={{__html: trackerInfo.notes}}></div>
            </ToggleDetails>}
          </ToggleDetails>}
        </Text>

        <hr />

        <Heading level='h3' margin='small 0 small 0'>Where has {this.tracker} tracked you?</Heading>
        <PageTable 
          title={'Pages where ' + this.tracker + 'trackers were present'}
          data={pages}
          showSite
          showInference
        />

        <hr />

        <Heading level='h3' margin='small 0 small 0'>When has {this.tracker} tracked you?</Heading>
        <FlexibleWidthXYPlot
          height={200}
          margin={{left: 100, right: 10, top: 10, bottom: 70}}>
          <HorizontalGridLines />
          <LineSeries
            color="#8F3931"
            data={data}/>
          <XAxis
            height={100}
            tickFormat={dataLabel}
            tickLabelAngle={-20}/>
          <YAxis />
        </FlexibleWidthXYPlot>
        <Text>
          <p>You have encountered trackers
            from {this.tracker} on <em>{numDomains}</em> different
            domains. The Tracking Transparency extension has
            found <em>{numInferences}</em> inferences
            that {this.tracker} may have made about you.
          </p>
        </Text>
        <Grid startAt="large">
          <GridRow>
            <GridCol>
              {InferTable(inferences)}
            </GridCol>
            <GridCol>
              {DomainTable(domains)}
            </GridCol>
          </GridRow>
        </Grid>
      </div>}
      </div>
    );
  }
}
