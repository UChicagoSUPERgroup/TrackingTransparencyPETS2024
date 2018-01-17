import React from 'react';
import { Route, Link } from 'react-router-dom';

export default class TrackerDetailPage extends React.Component {
  constructor(props) {
    super(props);

    this.tracker = this.props.match.params.name;
    this.state = {
      trackers: []
    }
  }

  async componentDidMount() {
    const background = await browser.runtime.getBackgroundPage();
    const inferences = await background.queryDatabase('getInferencesByTracker', {tracker: this.tracker, count: 100});
    this.setState({
      inferences: inferences
    })
  }

  render() {
    return (
      <div>
        <p>Tracker detail page. Min/Claire is working on this page.</p>
        <h2>{this.tracker}</h2>
        <pre>{JSON.stringify(this.state.inferences, null, '\t')}</pre>
      </div>
    );
  }
}
