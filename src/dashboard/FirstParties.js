import React from 'react';
import { Route, Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

import helpers from './helpers.js';


function generateEmoticonPermutations(x) {
  return [x];
}

const FirstPartyListItem = (domain) => {
  const domainName = domain.Pages.domain;
  return (
    <LinkContainer key={domainName}
      style={{ textDecoration: 'none' }}
      to={{
        pathname: '/domains/' + domainName
      }}
    >
      <div>
        {domainName}
      </div>
    </LinkContainer>

  );
}

// const FirstPartyBoxLarge = (domain) => {
//   return (
//     <div key={domain.order} className="character-box-large">
//         {domain.emoji}
//     </div>
//   );
// }

class FirstPartyList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      domains: []
    }
  }

  async getDomains() {
    const background = await browser.runtime.getBackgroundPage();
    const domains = await background.queryDatabase("getDomains", {count: 100});
    this.setState({
      domains: domains 
    });
    console.log(this.state.domains);
  }

  async componentDidMount() {
    this.getDomains();
  }
  
  render() {

    // domains = emoji;

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
    const trackers = await background.queryDatabase("getTrackersByDomain", {domain: this.domain, count: 100});
    this.setState({
      trackers: trackers
    })
  }

  render() {
    return (
      <div>
        <h2>{this.domain}</h2>
        <pre>{JSON.stringify(this.state.trackers, null, '\t')}</pre>
        {/* <br/> */}
        {/* <pre>{JSON.stringify(details, null, '\t')}</pre> */}
      </div>
    );
  }
}


export default FirstPartyList;