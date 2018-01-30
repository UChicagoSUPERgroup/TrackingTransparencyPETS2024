import React from 'react';
import { Link } from 'react-router-dom';

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
      timestamps: false,
      topSites: false
    }

    this.updateData = this.updateData.bind(this);
  }

  componentDidMount() {
    this.updateData();
  }

  async updateData() {
    const background = await browser.runtime.getBackgroundPage();
    const {inference} = this.state;

    const trackers = background.queryDatabaseRecursive('getTrackersByInference', {inference: inference, count: 1});
    trackers.then(tr => this.setState({
      trackers: tr
    }));
    const timestamps = background.queryDatabaseRecursive('getTimestampsByInference', {inference: inference});
    timestamps.then(ts => {
      const times = ts.map(x => (
        (new Date(x.Pages.id))
      ));
      this.setState({
        timestamps: times
      });
    });

    const topSites = background.queryDatabaseRecursive('getDomainsByInference', {inference: inference, count: 5});
    topSites.then(ts => this.setState({
      topSites: ts
    }));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.inference) {
      this.setState({
        inference: nextProps.inference
      })
    }
    this.updateData();
  }

  render() {
    const {inference, trackers, timestamps, topSites} = this.state;

    let content;

    /* inadequate data/error conditions */

    if (!inference) {
      content = (
        <p>This category does not exist.</p>
      );
    } else if (!timestamps) {
      content = (
        <p>Loading data…</p>
      );
    } else if (timestamps.length === 0) {
      content = (
        <p>There are no recorded page visits for this category.</p>
      );

    /* main condition */

    } else {
      content = (
        <div>

          {topSites && <div>
            <h3>Top Sites</h3>
            <p>Words…</p>
            <ol>
              {topSites.map(site => (
                <li key={site.domain}>
                  <Link to={{pathname: '/domains/' + site}}>{site.domain}</Link> ({site.count} page visits)
                </li>
              ))}
            </ol>
          </div>}

          {trackers && trackers.length > 0 && <div>
            <h3>Trackers</h3>
            <p>Words…</p>
            <ol>
              {trackers.map(t => (
                <li key={t.tracker}>
                  <Link to={{pathname: '/trackers/' + t.tracker}}>{t.tracker}</Link> ({t.count} page visits)
                </li>
              ))}
            </ol>
          </div>}

          {timestamps && timestamps.length > 1 && <div>
            <h3>Time</h3>
            <PagesTimeChart timestamps={timestamps}/>
            <br/>
            <PagesTimeScatterplot timestamps={timestamps}/>
          </div>}
          {/* <pre>{JSON.stringify(trackers, null, '\t')}</pre> */}

        </div>
      );
    }

    return (<div>
      <h2>{inference}</h2>
      {content}
    </div>);
  }
}

export default InferenceDetails;
