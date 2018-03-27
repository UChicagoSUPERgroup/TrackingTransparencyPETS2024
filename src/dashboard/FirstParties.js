import React from 'react';
import { Route, Link } from 'react-router-dom';
// import { LinkContainer } from 'react-router-bootstrap';


const FirstPartyListItem = (domain) => {
  const domainName = domain.Pages.domain;
  return (
    <div key={domainName}>
      <Link to={{
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
    this.logLoad = this.logLoad.bind(this);
  }

    async logLoad() {
        //console.log('In the log load page')
        const background = await browser.runtime.getBackgroundPage();
        let domains = await background.queryDatabase('getDomains', {count: 100});
        let userParams = await browser.storage.local.get({
          usageStatCondition: "no monster",
          userId: "no monster",
          startTS: 0
        });
        if (userParams.usageStatCondition){//get data when the user click on the button.
          let pages = []
          for (let i=0; i < domains.length;i++) {
              let value = domains[i]["Pages"]["domain"]
              pages.push(background.hashit(value))
              //console.log(value);
          }
          let activityType='load dashboard sites page';
          let timestamp=Date.now();
          let userId=userParams.userId;
          let startTS=userParams.startTS;
          let activityData={'shownSites':JSON.stringify(pages)};
          background.logData(activityType, timestamp, userId, startTS, activityData);
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
    this.logLoad();
  }

  render() {
    //if(this.state.reload)this.logLoad();
    //this.setState({reload: true});
    //this.logLoad();
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
    this.logLoad = this.logLoad.bind(this);
  }



  async logLoad() {
      //console.log('In the log load page')
      const background = await browser.runtime.getBackgroundPage();
      let userParams = await browser.storage.local.get({
        usageStatCondition: "no monster",
        userId: "no monster",
        startTS: 0
      });
      if (userParams.usageStatCondition){//get data when the user click on the button.
        let page = background.hashit(this.domain)
        let activityType='click site link on dashboard sites page';
        let timestamp=Date.now();
        let userId=userParams.userId;
        let startTS=userParams.startTS;
        let activityData={'clickedSite':JSON.stringify(page)};
        background.logData(activityType, timestamp, userId, startTS, activityData);
      }
    }

  async componentDidMount() {
    const background = await browser.runtime.getBackgroundPage();
    const trackers = await background.queryDatabase('getTrackersByDomain', {domain: this.domain, count: 100});
    this.setState({
      trackers: trackers
    })
    this.logLoad();
    //the following is to catch the back button event
    window.onpopstate = async function(event) {
      const background = await browser.runtime.getBackgroundPage();
      let userParams = await browser.storage.local.get({usageStatCondition: "no monster"});
      if (userParams.usageStatCondition){window.location.reload();}
    };
  }

/*routerWillLeave(nextLocation) {
    this.logLoad();
    return null;
  }*/

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
