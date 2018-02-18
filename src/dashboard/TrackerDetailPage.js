import React from 'react';
import { Route, Link } from 'react-router-dom';
import ReactTable from 'react-table';
import {Grid, Row, Col} from 'react-bootstrap';
import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries
} from 'react-vis';

import companyData from '../data/trackers/companyData.json';
// companyData['Criteo'].type -> "Advertising"

const DomainTable = (data) => {
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: "Site",
         accessor: "domain"
        },
        {Header: "Page Count",
         accessor: "count"},
      ]}
      defaultPageSize={20}
      className="-striped -highlight"
    />
  );
}

const InferTable = (data) => {
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: "Inference",
         accessor: "inference"
        },
        {Header: "Inference Count",
         accessor: "COUNT(inference)"},
      ]}
      defaultPageSize={20}
      className="-striped -highlight"
    />
  );
}


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
    const timestamps = await background.queryDatabase('getTimestampsByTracker', queryObj);
    //const totalPages = await background.queryDatabase('getDomainsByTracker')
    this.setState({
      inferences: inferences,
      domains: domains,
      timestamps: timestamps
    });
    console.log(inferences);
    console.log(domains);
    console.log(timestamps);
  }

  render() {
    const domains = this.state.domains;
    const inferences = this.state.inferences;
    let numDomains = 0;
    let numInferences = 0;
    if (domains) {
      numDomains = domains.length;
    }
    if (inferences) {
      numInferences = inferences.length;
    }
    return (
      <div>
        <p>Tracker detail page. Min/Claire is working on this page.</p>
        <h2>{this.tracker}</h2>
        <p>You have encountered trackers
            from {this.tracker} on <em>{numDomains}</em> different
            domains. We have found <em>{numInferences}</em> inferences
            that {this.tracker} may have made about you, based on your browsing.
            </p>
        <Grid>
          <Row>
            <Col md={6} mdPush={6}>
              {InferTable(inferences)}
            </Col>
            <Col md={6} mdPull={6}>
              {DomainTable(domains)}
            </Col>
          </Row>
          <Row>
            <Col md={12}>
            <FlexibleWidthXYPlot
              height={300}>
              <HorizontalGridLines />
              <LineSeries
                color="red"
                data={[
                  {x: 1, y: 10},
                  {x: 2, y: 5},
                  {x: 3, y: 15}
                ]}/>
              <XAxis title="X" />
              <YAxis />
            </FlexibleWidthXYPlot>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
