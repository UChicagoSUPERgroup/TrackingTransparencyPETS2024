import React from 'react';
import { Route, Link } from 'react-router-dom';
import ReactTable from 'react-table'

import companyData from '../data/trackers/companyData.json';
// companyData['Criteo'].type -> "Advertising"

const DomainTable = (data) => {
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: "Site",
         accessor: "domain"
         /*
         sortMethod: (a, b) => {
           let a1 = a;
           let b1 = b;
           if (a1.startsWith('www.')) {
             a1 = a1.substring(4);
           }
           if (b1.startsWith('www.')) {
             b1 = b1.substring(4);
           }
           console.log("compare " + a1 + " " + b1 + " " + a + " " + b + " " + (a1>b1));
           return (a1 > b1);
         }
         */
        },
        {Header: "Page Count",
         accessor: "count"},
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
    //const totalPages = await background.queryDatabase('getDomainsByTracker')
    this.setState({
      inferences: inferences,
      domains: domains
    });
    console.log(inferences);
    console.log(domains);
  }

  render() {
    const domains = this.state.domains;
    let numDomains = 0;
    if (domains) {
      numDomains = domains.length;
    }
    return (
      <div>
        <p>Tracker detail page. Min/Claire is working on this page.</p>
        <h2>{this.tracker}</h2>
        <p>You have encountered trackers
            from {this.tracker} on <em>{numDomains}</em> different
            domains.</p>
        {DomainTable(domains)}
        <pre>{JSON.stringify(this.state.domains, null, '\t')}</pre>
      </div>
    );
  }
}
