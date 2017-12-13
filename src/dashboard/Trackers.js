import React from 'react';
import { Route, Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

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

class TrackersList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trackers: []
    }
  }

  async getTrackers() {
    const background = await browser.runtime.getBackgroundPage();
    const trackers = await background.queryDatabase("getTrackers", {count: 100});
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
        <h1>Trackers</h1>

        <Route path={`${this.props.match.url}/:name`}  component={TrackerDetails}/>
        <Route exact path={this.props.match.url} render={() => (
          <div>
            {this.state.trackers.map(tracker => TrackersListItem(tracker))}
          </div>
        )}/>


      </div>
    );
  }
}

class TrackerDetails extends React.Component {
  constructor(props) {
    super(props);

    this.tracker = this.props.match.params.name;
    this.state = {
      trackers: []
    }
  }

  async componentDidMount() {
    const background = await browser.runtime.getBackgroundPage();
    const inferences = await background.queryDatabase("getInferencesByTracker", {tracker: this.tracker, count: 100});
    this.setState({
      inferences: inferences
    })
  }

  render() {
    return (
      <div>
        <h2>{this.tracker}</h2>
        <pre>{JSON.stringify(this.state.inferences, null, '\t')}</pre>
      </div>
    );
  }
}


export default TrackersList;