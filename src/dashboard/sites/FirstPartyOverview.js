import React from 'react';
import { Route, Link } from 'react-router-dom';
import logging from '../dashboardLogging';
import ReactTable from 'react-table';
import Breadcrumb from 'react-bootstrap/lib/Breadcrumb';


import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'

import FirstPartyDetails from './FirstPartyDetails';

// import { LinkContainer } from 'react-router-bootstrap';

const RecentTable = (data) => {
  let numEntries = data ? data.length: 0
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: numEntries + ' recently visited sites',
          accessor: 'DISTINCT(domain)',
          Cell: row => (
            <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' to={{pathname: '/domains/' + row.value}}>
                {row.value}
              </Link>
            </div>)
        }
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}
      className="-striped -highlight"
    />
  );
}

const NoTrackerTable = (data) => {
  let numEntries = data ? data.length: 0
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: 'Sites without trackers (' + numEntries + ')',
          accessor: d => d,
          id: 'domain',
          Cell: row => (
            <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' to={{pathname: '/domains/' + row.value}}>
                {row.value}
              </Link>
            </div>)
        }
      ]}
      defaultPageSize={10}
      // showPagination={false}
      showPageJump={false}
      showPageSizeOptions={false}
      className="-striped -highlight"
    />
  );
}


const ManyTrackersTable = (data) => {
  let numEntries = data ? data.length: 0
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: numEntries + ' sites with the most trackers',
          accessor: d => d.Pages.domain,
          id: 'domain',
          Cell: row => (
            <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' to={{pathname: '/domains/' + row.value}}>
                {row.value}
              </Link>
            </div>)
        },
        {Header: 'Unique trackers',
          accessor: d => d.Trackers['COUNT(DISTINCT(tracker))'],
          id: 'trackers',
          Cell: row => (
            row.value),
          maxWidth: 200
        }
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}
      className="-striped -highlight"
    />
  );
}





export default class FirstPartyOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      domains: []
    }
    this.getDomains = this.getDomains.bind(this)
  }

  async getDomains() {
    const background = await browser.runtime.getBackgroundPage();
    let now = new Date(Date.now()).getTime()
    let args = {count: 100, endTime: now}
    const recent = background.queryDatabase('getDomainsByTime', args);
    const manyTrackers = background.queryDatabase('getDomainsByTrackerCount', args)
    const noTrackers = background.queryDatabase('getDomainsNoTrackers', {})
    recent.then(n => this.setState({recent: n}));
    manyTrackers.then(n => this.setState({manyTrackers: n}));
    noTrackers.then(n => this.setState({noTrackers: n}));
  }

  async componentDidMount() {
    let d = this.getDomains();

    let recent = this.state.recent;

    const background = await browser.runtime.getBackgroundPage();
    let pages = []
    if (recent) {
      for (let i=0; i < recent.length; i++) {
        let value = await background.hashit_salt(domains[i]['Pages']['domain'])
        pages.push(value)
      }
    }
    let activityType='load dashboard sites page';
    let sendDict={'numDomainsShown':pages.length}
    logging.logLoad(activityType, sendDict);
  }

  render() {
    return(
      <div>
        <Route path={`${this.props.match.url}/:name`}  component={FirstPartyDetails}/>
        <Route exact path={this.props.match.url} render={() => (
          <div>
            <Breadcrumb>
              <Breadcrumb.Item><Link to={{pathname: '/'}}>Home</Link></Breadcrumb.Item>
              <Breadcrumb.Item active>Sites</Breadcrumb.Item>
            </Breadcrumb>
            <Heading level='h1'>Sites</Heading>
            <Text>
              <p>We should put some text here!</p>
            </Text>
            <Grid startAt='large'>
              <GridRow>
                <GridCol width={3}>
                  <div>
                    {RecentTable(this.state.recent)}
                  </div>
                </GridCol>
                <GridCol width={6}>
                  <div>
                    {ManyTrackersTable(this.state.manyTrackers)}
                  </div>
                </GridCol>
                <GridCol width={3}>
                  <div>
                    {NoTrackerTable(this.state.noTrackers)}
                  </div>
                </GridCol>
              </GridRow>
            </Grid>
          </div>
        )}/>
      </div>
    );
  }
}
