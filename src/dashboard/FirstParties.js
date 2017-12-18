import React from 'react';
import { Route, Link } from 'react-router-dom';
// import { LinkContainer } from 'react-router-bootstrap';
import tt from '../helpers';


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
  }

  async getDomains() {
    const background = await browser.runtime.getBackgroundPage();
    const domains = await background.queryDatabase('getDomains', {count: 100});
    this.setState({
      domains: domains 
    });
    tt.log(this.state.domains);
  }

  async componentDidMount() {
    this.getDomains();
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
  }

  async componentDidMount() {
    const background = await browser.runtime.getBackgroundPage();
    const trackers = await background.queryDatabase('getTrackersByDomain', {domain: this.domain, count: 100});
    this.setState({
      trackers: trackers
    })
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