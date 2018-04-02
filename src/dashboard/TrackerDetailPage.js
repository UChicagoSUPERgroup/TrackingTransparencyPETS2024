import React from 'react';
import { Route, Link } from 'react-router-dom';
import ReactTable from 'react-table';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import _ from 'lodash';
import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries
} from 'react-vis';

//import companyData from '../data/trackers/companyData.json';
// companyData['Criteo'].type -> "Advertising"

const DomainTable = (data) => {
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: "Site",
         accessor: "domain",
         Cell: row => (
           <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' to={{pathname: '/domains/' + row.value}}>
                 {row.value}
              </Link>
           </div>)
        },
        {Header: "Page Count",
         accessor: "count"},
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
        {Header: "Inference",
         accessor: "inference",
         Cell: row => (
           <div key={row.value}>
              <Link className = 'inferenceTableLinkTrackersPage' to={{pathname: '/inferences/' + row.value}}>
                 {row.value}
              </Link>
           </div>)
        },
        {Header: "Inference Count",
         accessor: "COUNT(inference)"},
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
      domains: []
    }
    this.logLoad = this.logLoad.bind(this);
  }

  async logLoad(tracker, inferences, domains) {
      const background = await browser.runtime.getBackgroundPage();
      let userParams = await browser.storage.local.get({
        usageStatCondition: "no monster",
        userId: "no monster",
        startTS: 0
      });

      const tabs = await browser.tabs.query({active: true, currentWindow: true});
      let tabId = tabs[0].openerTabId;
      let x = 'clickData_tabId_'+String(tabId);
      let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain':'','tabId':tabId,'pageId':'','numTrackers':0})});
      tabData = JSON.parse(tabData[x]);
      if (JSON.parse(userParams.usageStatCondition)){//get data when the user click on the button.
        let hashedTracker = background.hashit(tracker);
        let numDomains = domains.length;
        let hashedInferences = [];
        for (let i=0;i<inferences.length;i++){
          let value = await background.hashit(inferences[i]["inference"])
          hashedInferences.push(value);
        }
        let activityType = 'open non-tab-page: show domains and inferences for a tracker';
        let timestamp = Date.now();
        let userId = userParams.userId;
        let startTS = userParams.startTS;
        let activityData={
          'hashedTracker':hashedTracker,
          'numDomainsShown': numDomains,
          'hashedInferencesShown': JSON.stringify(hashedInferences),
          'parentTabId':tabId,
          'parentDomain':tabData.domain,
          'parentPageId':tabData.pageId,
          'parentNumTrackers':tabData.numTrackers
        };
        background.logData(activityType, timestamp, userId, startTS, activityData);
      }
    }

  async componentWillUnmount() {}

  async componentDidMount() {
    let queryObj = {tracker: this.tracker};
    const background = await browser.runtime.getBackgroundPage();
    const inferences = await background.queryDatabase('getInferencesByTracker', queryObj);
    const domains = await background.queryDatabase('getDomainsByTracker', queryObj);
    const timestamps = await background.queryDatabase('getTimestampsByTracker', queryObj);
    const times2 = timestamps.map(x => (
      (new Date(x.Pages.id))));
    this.setState({
      inferences: inferences,
      domains: domains,
      times: times2,
      timestamps: timestamps
    });
    this.logLoad(this.tracker, inferences, domains);
  }

  render() {
    const domains = this.state.domains;
    const inferences = this.state.inferences;
    const times = this.state.times;
    const timestamps = this.state.timestamps;
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
    if (timestamps && times[0]) {
      firstDay = new Date(times[0].getFullYear(), times[0].getMonth(), times[0].getDate());
      firstDay = firstDay.getTime();
      let grouped;
      grouped = _.groupBy(timestamps, t => Math.floor((parseInt(t.Pages.id) - firstDay) / msInDay));
      for (let day in grouped) {
        data.push({
          x: parseInt(day),
          y: grouped[day].length,
        });
      }
    }
    console.log(data);

    var dataLabel = function(v) {
      var tempDay = new Date((v * msInDay) + firstDay);
      return tempDay.toDateString();
    }

    return (
      <div>
        <h2>{this.tracker}</h2>
        <p>You have encountered trackers
            from {this.tracker} on <em>{numDomains}</em> different
            domains. The Tracking Transparency extension has
            found <em>{numInferences}</em> inferences
            that {this.tracker} may have made about you.
            </p>
        <Grid>
          <Row>
            <Col md={6} mdPush={6}>
              {InferTable(inferences)}
            </Col>
            <Col md={6} mdPull={6}>
              {DomainTable(domains)}
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <h2>When has {this.tracker} tracked you?</h2>
              <FlexibleWidthXYPlot
                height={400}
                margin={{left: 100, right: 10, top: 10, bottom: 100}}>
                <HorizontalGridLines />
                <LineSeries
                  color="#8F3931"
                  data={data}/>
                <XAxis
                  height={100}
                  tickFormat={dataLabel}
                  tickLabelAngle={-30}/>
                <YAxis />
              </FlexibleWidthXYPlot>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
