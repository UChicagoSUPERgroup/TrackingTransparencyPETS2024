import React from 'react';
import { Route, Link } from 'react-router-dom';
import logging from './dashboardLogging';
// import { LinkContainer } from 'react-router-bootstrap';


const FirstPartyListItem = (domain) => {
  const domainName = domain.Pages.domain;
  return (
    <div key={domainName}>
      <Link className = "domainsTableLinkDomainsPage" to={{
        pathname: '/domains/' + domainName
      }}>
        {domainName}
      </Link>
    </div>
  );
}

class FirstPartyList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      domains: []
    }
  }

  async getDomains() {
    const background = await browser.runtime.getBackgroundPage();
    const domains = await background.queryDatabase('getDomains', {count: 100});
    this.setState({
      domains: domains
    });
    console.log(this.state.domains);

  }

  async componentDidMount() {
    this.getDomains();
    let domains = this.state.domains;
    /*
    const background = await browser.runtime.getBackgroundPage();
    let pages = []
    for (let i=0; i < domains.length;i++) {
      let value = await background.hashit_salt(domains[i]["Pages"]["domain"])
      pages.push(value)
    }*/
    let activityType='load dashboard sites page';
    let sendDict={'numDomainsShown':pages.length}
    logging.logLoad(activityType, sendDict);
  }

  render() {
    return(
      <div>
        <h1>Domains</h1>
        <Route path={`${this.props.match.url}/:name`}  component={FirstPartyDetails}/>
        <Route exact path={this.props.match.url} render={() => (
          <div>
            {this.state.domains.map(domain => FirstPartyListItem(domain))}
          </div>
        )}/>


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
