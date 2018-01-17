import React from 'react';
import { Route, Link } from 'react-router-dom';
// import { LinkContainer } from 'react-router-bootstrap';

import TrackerDetails from './TrackerDetailPage';

const TrackersListItem = (tracker) => {
  const trackerName = tracker.tracker;
  return (
    <div key={trackerName}>
      <Link to={{
        pathname: '/trackers/' + trackerName
      }}>
        {trackerName}
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
    const trackers = await background.queryDatabase('getTrackers', {count: 100});
    this.setState({
      trackers: trackers 
    });
    console.log(this.state.trackers);
  }

  async componentDidMount() {
    this.getTrackers();
  }
  
  render() {

    return(
      <div>
        <p>Tracker list page. Will have bar graphs, etc. Claire is working on this page</p>
        {this.state.trackers.map(tracker => TrackersListItem(tracker))}
      </div>
    );
  }
}
