import React from 'react';

import PagesTimeChart from './PagesTimeChart';

class InferenceDetails extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.match && this.props.match.params.name) {
      // loaded via URL
      this.inference = this.props.match.params.name;
    } else if (this.props.inference) {
      // loaded as in page component
      this.inference = this.props.inference;
    }
    this.state = {
      trackers: false,
      timestamps: false
    }
  }

  async componentDidMount() {
    const background = await browser.runtime.getBackgroundPage();
    const trackers = background.queryDatabase('getTrackersByInference', {inference: this.inference, count: 1});
    trackers.then(tr => this.setState({
      trackers: tr
    }))
    const timestamps = background.queryDatabase('getTimestampsByInference', {inference: this.inference, count: 500});
    timestamps.then(ts => this.setState({
      timestamps: ts
    }))
  }

  render() {
    if (!this.inference) {
      return (<div>Category does not exist</div>);
    }
    const {trackers, timestamps} = this.state;
    return (
      <div>
        <h2>{this.inference}</h2>
        {trackers && trackers.length > 0 && <p>Trackers from <strong>{trackers[0].Trackers.tracker}</strong> were present on <strong>{trackers[0].Trackers['COUNT(tracker)']}</strong> pages related to {this.inference}.</p>}
        {/* {timestamps && <PagesTimeChart timestamps={timestamps}/>} */}
        {/* <pre>{JSON.stringify(trackers, null, '\t')}</pre> */}
      </div>
    );
  }
}

export default InferenceDetails;