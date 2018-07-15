import React from 'react';
import { Route, Link } from 'react-router-dom';
import {Grid, Row, Col} from 'react-bootstrap';
import ReactTable from 'react-table'
import "../../node_modules/react-table/react-table.css";
import logging from './dashboardLogging';

import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  HorizontalBarSeries
} from 'react-vis';

import TrackerDetails from './TrackerDetailPage';

const TrackersListItem = (tracker) => {
  const trackerName = tracker["tracker"];
  return (
    <div key={trackerName}>
      <Link to={{
        pathname: '/trackers/' + trackerName
      }} className = "trackerPageTableLink">
        {trackerName}
      </Link>
    </div>
  );
}


const TrackerTable = (data) => {
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: h => (
          <div style={{textAlign: "left"}}>
            Tracker
          </div>),
         accessor: "name",
         Cell: row => (
           <div key={row.value}>
              <Link className = "trackerTableLinkTrackersPage" to={{pathname: '/trackers/' + row.value}}>
                 {row.value}
              </Link>
           </div>)
        },
        {Header: h => (
          <div style={{textAlign: "left"}}>
            Page count
          </div>),
         accessor: "count",
         Cell: row =>
           <div style={{textAlign: "right"}}>
             {row.value}
           </div>},
        {Header: h => (
          <div style={{textAlign: "left"}}>
            Percent of Browsing
          </div>),
         accessor: "percent",
          Cell: row =>
            <div style={{textAlign: "right"}}>
              {((Math.round(row.value) / 100).toString() + " %")}
            </div>}
      ]}
      //defaultPageSize={20}
      className="-striped -highlight"
    />
  );
}

export default class TrackersPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }


  async componentDidMount() {
      //this.logLoad();
  }

  render() {
    return(
      <div>
        <Route path={`${this.props.match.url}/:name`}  component={TrackerDetails}/>
        <Route exact path={this.props.match.url} component={TrackersList}/>
      </div>
    );
  }
}

class TrackersList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trackers: []
    }
    //this.logLoad = this.logLoad.bind(this);
  }

  async getTrackers() {
    const background = await browser.runtime.getBackgroundPage();
    const numTrackers = await background.queryDatabase('getNumberOfTrackers', {});
    const numPages = await background.queryDatabase('getNumberOfPages', {});
    const trackers = await background.queryDatabase('getTrackers', {count: 20});
    const allTrackers = await background.queryDatabase('getTrackers', {});

    this.setState({
      trackers: trackers,
      allTrackers: allTrackers,
      numTrackers: numTrackers,
      numPages: numPages
    });
    //console.log(this.state.trackers);
    //console.log(this.state.allTrackers);
  }

  async componentDidMount() {
    this.getTrackers();

    const background = await browser.runtime.getBackgroundPage();
    const numTrackersShown = await background.queryDatabase('getNumberOfTrackers', {});
    sendDict = {
      'numTrackersShown':numTrackersShown
    }
    logging.logLoad(activityType, sendDict);
  }

  render() {
    const {trackers, allTrackers, numTrackers, numPages} = this.state;
    let topTracker = "";
    let topPercent = 0;
    let data = [];
    let allData = [];
    let tempPercent = 0;

    for (let val in trackers){
      data.push({
        y: trackers[val]["tracker"],
        x: 100 * trackers[val]["COUNT(tracker)"] / numPages,
      });
      topTracker = trackers[0]["tracker"];
      topPercent = Math.round(10000 * trackers[0]["COUNT(tracker)"] / numPages) / 100;
    };
    data.reverse();
    for (let val in allTrackers){
      tempPercent = 10000 * allTrackers[val]["COUNT(tracker)"] / numPages;
      allData.push({
        name: allTrackers[val]["tracker"],
        count: allTrackers[val]["COUNT(tracker)"],
        percent: tempPercent
      });
    };

    return(
      <div>
        <h1>Who is tracking you?</h1>
        <p><em>{numTrackers} trackers</em> have collected information about you based on your browsing history. Your most
          frequently encountered tracker is <em>{topTracker}</em>, which was
          present on <em>{topPercent}%</em> of
          the sites you visited.
          Here are your 20 most frequently encountered trackers:</p>
        <Grid>
          <Row>
            <Col md={6}>
              <FlexibleWidthXYPlot
                yType={'ordinal'}
                height={800}
                margin={{left: 100, right: 10, top: 10, bottom: 50}}>
                <HorizontalGridLines />
                <VerticalGridLines />
                <YAxis
                  height={200}
                  tickLabelAngle={0} />
                <XAxis
                  tickFormat={v => v.toString() + "%"} />
                <HorizontalBarSeries data={data} color="#8F3931"/>
              </FlexibleWidthXYPlot>
            </Col>
            <Col md={6}>
              {TrackerTable(allData)}
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
