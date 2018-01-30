import React from 'react';
import { Route, Link } from 'react-router-dom';

export default class TrackerDetailPage extends React.Component {
  constructor(props) {
    super(props);

    this.tracker = this.props.match.params.name;
    this.state = {
      inferences: [],
      domains: []
    }
  }

  async componentDidMount() {
    let queryObj = {tracker: this.tracker};
    const background = await browser.runtime.getBackgroundPage();
    const inferences = await background.queryDatabase('getInferencesByTracker', queryObj);
    const domains = await background.queryDatabase('getDomainsByTracker', queryObj);
    this.setState({
      inferences: inferences,
      domains: domains
    })
    console.log(inferences);
    console.log(domains);
  }

  render() {
    return (
      <div>
        <p>Tracker detail page. Min/Claire is working on this page.</p>
        <h2>{this.tracker}</h2>
        <pre>{JSON.stringify(this.state.domains, null, '\t')}</pre>
      </div>
    );
  }
}
