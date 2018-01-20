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
    const trackers = await background.queryDatabase('getTrackers', {count: 20});

    this.setState({
      trackers: trackers,
      numTrackers: numTrackers
    });
    console.log(this.state.trackers);
  }

  async componentDidMount() {
    this.getTrackers();
  }

  render() {
    const numTrackers = this.state.numTrackers;
    const trackers = this.state.trackers;
    let data = [];
    for (let val in trackers){
      data.push({
        x: trackers[val]["tracker"],
        y: trackers[val]["COUNT(tracker)"],
        label: trackers[val]["tracker"]
      });
    };
    console.log(data)
    const myData = [
      {x: 'A', y: 10},
      {x: 'B', y: 5},
      {x: 'C', y: 15}
    ]

    return(
      <div>
        <p>Tracker list page. Will have bar graphs, etc. Claire is working on this page</p>
        <p><em>{numTrackers} trackers</em> are tracking your browsing.
          These are your most frequently encountered trackers:</p>
        <XYPlot
          xType={'ordinal'}
          width={1200}
          height={300}>
          <HorizontalGridLines />
          <VerticalGridLines />
          <YAxis title="Number of Pages"/>
          <XAxis title="Your Top Trackers"/>
          <VerticalBarSeries data={data}/>
        </XYPlot>
        {this.state.trackers.map(tracker => TrackersListItem(tracker))}
      </div>
    );
  }
}
