import React from 'react';

import PagesTimeChart from './PagesTimeChart';
import PagesTimeScatterplot from './PagesTimeScatterplot';

class InferenceDetails extends React.Component {
  constructor(props) {
    super(props);
    let inference;
    if (this.props.match && this.props.match.params.name) {
      // loaded via URL
      inference = this.props.match.params.name;
    } else if (this.props.inference) {
      // loaded as in page component
      inference = this.props.inference;
    }
    this.state = {
      inference: inference,
      trackers: false,
      timestamps: false
    }

    this.updateTimestamps = this.updateTimestamps.bind(this);
  }

  componentDidMount() {
    this.updateTimestamps();
  }

  async updateTimestamps() {
    const background = await browser.runtime.getBackgroundPage();
    const trackers = background.queryDatabase('getTrackersByInference', {inference: this.state.inference, count: 1});
    trackers.then(tr => this.setState({
      trackers: tr
    }))
    const timestamps = background.queryDatabase('getTimestampsByInference', {inference: this.state.inference});
    timestamps.then(ts => {
      const times = ts.map(x => (
        (new Date(x.Pages.id))
      ));
      this.setState({
        timestamps: times
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.inference) {
      this.setState({
        inference: nextProps.inference
      })
    }
    this.updateTimestamps();
  }

  render() {
    const {inference, trackers, timestamps} = this.state;
    if (!inference) {
      return (
        <div>
          <h2>{inference}</h2>
          <p>This category does not exist.</p>
        </div>
      );
    }
    if (!timestamps) {
      return (
        <div>
          <h2>{inference}</h2>
          <p>Loading data…</p>
        </div>
      );
    }
    if (timestamps.length === 0) {
      return (
        <div>
          <h2>{inference}</h2>
          <p>There are no recorded page visits for this category.</p>
        </div>
      );
    }
    return (
      <div>
        <h2>{inference}</h2>
        <h3>Time</h3>
        {timestamps && <PagesTimeChart timestamps={timestamps}/>}
        <br/>
        {timestamps && <PagesTimeScatterplot timestamps={timestamps}/>}
        {/* <pre>{JSON.stringify(trackers, null, '\t')}</pre> */}
        <h3>Companies</h3>
        {trackers && trackers.length > 0 && <p>Trackers from <strong>{trackers[0].Trackers.tracker}</strong> were present on <strong>{trackers[0].Trackers['COUNT(tracker)']}</strong> pages related to {inference}.</p>}
      </div>
    );
  }
}

export default InferenceDetails;