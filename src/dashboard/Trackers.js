import React from 'react';
import { Route, Link } from 'react-router-dom';
import ReactTable from 'react-table'
import "../../node_modules/react-table/react-table.css";
import logging from './dashboardLogging';

import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  VerticalBarSeries
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
        {Header: "Tracker",
         accessor: "name",
         Cell: row => (
           <div key={row.value}>
              <Link className = "trackerTableLinkTrackersPage" to={{pathname: '/trackers/' + row.value}}>
                 {row.value}
              </Link>
           </div>)
        },
        {Header: "Page Count",
         accessor: "count"},
        {Header: "Percent of Browsing",
         accessor: "percent",
          Cell: row => ((Math.round(row.value) / 100).toString() + " %")}
      ]}
      defaultPageSize={20}
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
        <h1>Trackers</h1>
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
    console.log(this.state.trackers);
    console.log(this.state.allTrackers);
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
        x: trackers[val]["tracker"],
        y: 100 * trackers[val]["COUNT(tracker)"] / numPages,
      });
      topTracker = trackers[0]["tracker"];
      topPercent = Math.round(10000 * trackers[0]["COUNT(tracker)"] / numPages) / 100;
    };
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
        <p><em>{numTrackers} trackers</em> are tracking your browsing. Your most
          frequently encountered tracker is <em>{topTracker}</em> which is
          present on <em>{topPercent}%</em> of
          the pages you visit.
          Here are your 20 most frequently encountered trackers:</p>
        <FlexibleWidthXYPlot
          xType={'ordinal'}
          height={350}
          margin={{left: 50, right: 10, top: 10, bottom: 70}}>
          <HorizontalGridLines />
          <VerticalGridLines />
          <XAxis
            height={200}
            tickLabelAngle={-30} />
          <YAxis
            tickFormat={v => v.toString() + "%"} />
          <VerticalBarSeries data={data} color="#8F3931"/>
        </FlexibleWidthXYPlot>
        {TrackerTable(allData)}
      </div>
    );
  }
}
