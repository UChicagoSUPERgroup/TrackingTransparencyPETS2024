import React from 'react';
import { Link } from 'react-router-dom';
import ReactTable from 'react-table';
import {Grid, Row, Col} from 'react-bootstrap';


import PagesTimeChart from './PagesTimeChart';
import PagesTimeScatterplot from './PagesTimeScatterplot';


const SiteTable = (data) => {
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: "Site",
         accessor: "domain",
         Cell: row => (
           <div key={row.value}>
              <Link className='domainTableLinkInferencesPage'  to={{pathname: '/domains/' + row.value}}>
                 {row.value}
              </Link>
           </div>)
        },
        {Header: "Page Visits",
         accessor: "count"},
      ]}
      defaultPageSize={20}
      className="-striped -highlight"
    />
  );
}

const TrackerTable = (data) => {
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: "Trackers",
         accessor: "tracker",
         Cell: row => (
           <div key={row.value}>
              <Link className = "trackerTableLinkInferencesPage" to={{pathname: '/trackers/' + row.value}}>
                 {row.value}
              </Link>
           </div>)
        },
        {Header: "Page Visits",
         accessor: "count"},
      ]}
      defaultPageSize={20}
      className="-striped -highlight"
    />
  );
}



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
          <Grid>
            <Row>
              <Col md={6} mdPush={6}>
                {topSites && <div>
                  <h3>Top Sites</h3>
                  <p>Words…</p>
                  {SiteTable(topSites)}
                </div>}
              </Col>
              <Col md={6} mdPull={6}>
                {trackers && trackers.length > 0 && <div>
                  <h3>Trackers</h3>
                  <p>Words…</p>
                  {TrackerTable(trackers)}
                </div>}
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                {timestamps && timestamps.length > 1 && <div>
                  <h3>Time</h3>
                  <PagesTimeChart timestamps={timestamps}/>
                  <br/>
                  <PagesTimeScatterplot timestamps={timestamps}/>
                </div>}
                {/* <pre>{JSON.stringify(trackers, null, '\t')}</pre> */}
              </Col>
            </Row>
          </Grid>
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
