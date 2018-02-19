import React from 'react';
import { Route, Link } from 'react-router-dom';
import ReactTable from 'react-table';
import {Grid, Row, Col} from 'react-bootstrap';
import _ from 'lodash';
import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries
} from 'react-vis';

//import companyData from '../data/trackers/companyData.json';
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
    const times2 = timestamps.map(x => (
      (new Date(x.Pages.id))));
    this.setState({
      inferences: inferences,
      domains: domains,
      times: times2,
      timestamps: timestamps
    });

  }

  render() {
    const domains = this.state.domains;
    const inferences = this.state.inferences;
    const times = this.state.times;
    const timestamps = this.state.timestamps;
    let numDomains = 0;
    let numInferences = 0;
    let firstDay = 0;
    let msInDay = 86400000;
    var data = [];
    if (domains) {
      numDomains = domains.length;
    }
    if (inferences) {
      numInferences = inferences.length;
    }
    if (timestamps && times) {
      firstDay = new Date(times[0].getFullYear(), times[0].getMonth(), times[0].getDate());
      firstDay = firstDay.getTime();
      let grouped;
      grouped = _.groupBy(timestamps, t => Math.floor((parseInt(t.Pages.id) - firstDay) / msInDay));
      for (let day in grouped) {
        var tempDay = new Date((day * msInDay) + firstDay);
        data.push({
          x: parseInt(day),
          y: grouped[day].length,
          label: tempDay.toDateString()
        });
      }
    }
    console.log(data);

    var dataLabel = function(v) {
      if(data[v]){
        return data[v].label;
      }
      return v;
    }

    return (
      <div>
        <p>Tracker detail page. Min/Claire is working on this page.</p>
        <h2>{this.tracker}</h2>
        <p>You have encountered trackers
            from {this.tracker} on <em>{numDomains}</em> different
            domains. The Tracking Transparency extension has
            found <em>{numInferences}</em> inferences
            that {this.tracker} may have made about you.
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
              <h2>When have you seen {this.tracker} trackers?</h2>
              <FlexibleWidthXYPlot
                height={400}
                margin={{left: 100, right: 10, top: 10, bottom: 100}}>
                <HorizontalGridLines />
                <LineSeries
                  color="#8F3931"
                  data={data}/>
                <XAxis
                  height={100}
                  tickFormat={dataLabel}
                  tickLabelAngle={-30}/>
                <YAxis />
              </FlexibleWidthXYPlot>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
