import React from 'react';

import PagesTimeChart from './PagesTimeChart';
import PagesTimeScatterplot from './PagesTimeScatterplot';

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
    const timestamps = background.queryDatabase('getTimestampsByInference', {inference: this.inference});
    timestamps.then(ts => {
      const times = ts.map(x => (
        (new Date(x.Pages.id))
      ));
      this.setState({
        timestamps: times
      });
    });
  }

  render() {
    if (!this.inference) {
      return (<div>Category does not exist</div>);
    }
    const {trackers, timestamps} = this.state;
    return (
      <div>
        <h2>{this.inference}</h2>
        <h3>Time</h3>
        {timestamps && <PagesTimeChart timestamps={timestamps}/>}
        <br/>
        {timestamps && <PagesTimeScatterplot timestamps={timestamps}/>}
        {/* <pre>{JSON.stringify(trackers, null, '\t')}</pre> */}
        <h3>Companies</h3>
        {trackers && trackers.length > 0 && <p>Trackers from <strong>{trackers[0].Trackers.tracker}</strong> were present on <strong>{trackers[0].Trackers['COUNT(tracker)']}</strong> pages related to {this.inference}.</p>}
      </div>
    );
  }
}

export default InferenceDetails;