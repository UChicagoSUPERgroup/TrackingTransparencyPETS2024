import React from 'react';
import { Route, Link } from 'react-router-dom';
// import { LinkContainer } from 'react-router-bootstrap';

import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  VerticalBarSeries
} from 'react-vis';

import TrackerDetails from './TrackerDetailPage';

const TrackersListItem = (tracker) => {
  const trackerName = tracker["tracker"];
  const trackerCount = tracker["COUNT(tracker)"];
  return (
    <div key={trackerName}>
      <Link to={{
        pathname: '/trackers/' + trackerName
      }}>
        {trackerName} and a count of {trackerCount}
      </Link>
    </div>
  );
}

export default class TrackersPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  async componentDidMount() {
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
  }

  async getTrackers() {
    const background = await browser.runtime.getBackgroundPage();
    const numTrackers = await background.queryDatabase('getNumberOfTrackers', {});
    const numPages = await background.queryDatabase('getNumberOfPages', {});
    const trackers = await background.queryDatabase('getTrackers', {count: 20});

    this.setState({
      trackers: trackers,
      numTrackers: numTrackers,
      numPages: numPages
    });
    console.log(this.state.trackers);
  }

  async componentDidMount() {
    this.getTrackers();
  }

  render() {
    const {trackers,numTrackers, numPages} = this.state;
    let topTracker = "";
    let topPercent = 0;
    //
    //console.log(topTracker);
    //const topPercent = 100 * trackers[0]["COUNT(tracker)"] / numPages;
    //const trackers = this.state.trackers;
    //const numPages = this.state.numPages;
    //const topTracker = trackers[0];
    let data = [];
    for (let val in trackers){
      data.push({
        x: trackers[val]["tracker"],
        y: 100 * trackers[val]["COUNT(tracker)"] / numPages,
        label: trackers[val]["tracker"]
      });
      topTracker = trackers[0]["tracker"];
      topPercent = Math.round(10000 * trackers[0]["COUNT(tracker)"] / numPages) / 100;
    };
    console.log(data);
    console.log(topTracker);

    return(
      <div>
        <p>Tracker list page. Will have bar graphs, etc. Claire is working on this page</p>
        <p><em>{numTrackers} trackers</em> are tracking your browsing. Your most
          frequently encountered tracker is <em>{topTracker}</em> which is
          present on <em>{topPercent}%</em> of
          the pages you visit.
          Here are your 20 most frequently encountered trackers:</p>
        <XYPlot
          xType={'ordinal'}
          width={1000}
          height={350}
          margin={{left: 50, right: 10, top: 10, bottom: 70}}>
          <HorizontalGridLines />
          <VerticalGridLines />
          <XAxis
            height={200}
            tickLabelAngle={-30} />
          <YAxis
            tickFormat={v => v.toString() + "%"} />
          <VerticalBarSeries data={data}/>
        </XYPlot>
        {this.state.trackers.map(tracker => TrackersListItem(tracker))}
      </div>
    );
  }
}
