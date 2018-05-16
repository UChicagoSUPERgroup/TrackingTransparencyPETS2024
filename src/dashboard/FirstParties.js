import React from 'react';
import { Route, Link } from 'react-router-dom';
import logging from './dashboardLogging';
import ReactTable from 'react-table';
import {Grid, Row, Col} from 'react-bootstrap';


// import { LinkContainer } from 'react-router-bootstrap';

const RecentTable = (data) => {
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: "Recently visited sites",
         accessor: "DISTINCT(domain)",
         Cell: row => (
           <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' to={{pathname: '/domains/' + row.value}}>
                 {row.value}
              </Link>
           </div>)
        }
      ]}
      defaultPageSize={10}
      showPagination={false}
      showPageSizeOptions={false}
      className="-striped -highlight"
    />
  );
}

const ManyTrackersTable = (data) => {
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: "Sites with the most trackers",
         accessor: d => d.Pages.domain,
         id: "domain",
         Cell: row => (
           <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' to={{pathname: '/domains/' + row.value}}>
                 {row.value}
              </Link>
           </div>)
        },
        {Header: "Number of trackers",
         accessor: d => d.Trackers["COUNT(DISTINCT(tracker))"],
         id: "trackers",
         Cell: row => (
           row.value)
        }
      ]}
      defaultPageSize={10}
      showPagination={false}
      showPageSizeOptions={false}
      className="-striped -highlight"
    />
  );
}

class FirstPartyList extends React.Component {
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
    let args = {count: 10, endTime: now}
    console.log("hello")
    const recent = await background.queryDatabase('getDomainsByTime', args);
    const manyTrackers = await background.queryDatabase('getDomainsByTrackerCount', args)
    const noTrackers = await background.queryDatabase('getDomainsNoTrackers', {})
    console.log(manyTrackers);
    this.setState({
      recent: recent,
      manyTrackers: manyTrackers
      noTrackers: noTrackers
    });

  }

  async componentDidMount() {
    let d = this.getDomains();

    let recent = this.state.recent;

    const background = await browser.runtime.getBackgroundPage();
    let pages = []
    for (let i=0; i < recent.length;i++) {
      let value = await background.hashit_salt(domains[i]["Pages"]["domain"])
      pages.push(value)
    }
    let activityType='load dashboard sites page';
    let sendDict={'numDomainsShown':pages.length}
    logging.logLoad(activityType, sendDict);
  }

  render() {
    return(
      <div>
        <h1>Domains</h1>
        <Grid>
          <Row>
            <Col md={4}>
            <Route path={`${this.props.match.url}/:name`}  component={FirstPartyDetails}/>
            <Route exact path={this.props.match.url} render={() => (
              <div>
                {RecentTable(this.state.recent)}
              </div>
            )}/>
            </Col>
            <Col md={8}>
            <Route path={`${this.props.match.url}/:name`}  component={FirstPartyDetails}/>
            <Route exact path={this.props.match.url} render={() => (
              <div>
                {ManyTrackersTable(this.state.manyTrackers)}
              </div>
            )}/>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

class FirstPartyDetails extends React.Component {
  constructor(props) {
    super(props);

    this.domain = this.props.match.params.name;
    this.state = {
      trackers: []
    }
    this.logPopstate = this.logPopstate.bind(this);
  }

  async logPopstate(){
    //console.log('In the log leave page')
    const background = await browser.runtime.getBackgroundPage();
    let userParams = await browser.storage.local.get({
      usageStatCondition: "no monster",
      userId: "no monster",
      startTS: 0
    });
    const tabs = await browser.tabs.query({active: true, currentWindow: true});
    let parentTabId = tabs[0].openerTabId;
    let tabId = tabs[0].id;
    let x = 'clickData_tabId_'+String(tabId);
    let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain':'','tabId':tabId,'pageId':'','numTrackers':0})});
    tabData = JSON.parse(tabData[x]);
  if (JSON.parse(userParams.usageStatCondition)){//get data when the user click on the button.
      let page = await background.hashit_salt(this.domain)
      let activityType = 'leaving non-tab-page: tracker details for a domain';
      let timestamp=Date.now();
      let userId=userParams.userId;
      let startTS=userParams.startTS;
      let activityData = {
        'shownDomain':JSON.stringify(page),
        'tabId': tabId,
        'parentTabId':parentTabId,
        'parentDomain':tabData.domain,
        'parentPageId':tabData.pageId,
        'parentNumTrackers':tabData.numTrackers
      };
      background.logData(activityType, timestamp, userId, startTS, activityData);
    }

  }

  async componentWillUnmount() {
      window.removeEventListener("popstate", this.logPopstate)
    }

  async componentDidMount() {
    const background = await browser.runtime.getBackgroundPage();
    const trackers = await background.queryDatabase('getTrackersByDomain', {domain: this.domain, count: 100});
    this.setState({
      trackers: trackers
    })
    window.addEventListener("popstate", this.logPopstate)

  }


  render() {
    return (
      <div>
        <h2>{this.domain}</h2>
        <pre>{JSON.stringify(this.state.trackers, null, '\t')}</pre>
      </div>
    );
  }
}


export default FirstPartyList;
