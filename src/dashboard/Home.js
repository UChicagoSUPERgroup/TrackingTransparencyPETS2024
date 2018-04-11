import React from 'react';
import { Link } from 'react-router-dom';


export class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
    //this.logClick = this.logClick.bind(this);
    //this.logLoad = this.logLoad.bind(this);
  }

  async getData() {
    const background = await browser.runtime.getBackgroundPage();

    const numPages = background.queryDatabase('getNumberOfPages', {});
    const numTrackers = background.queryDatabase('getNumberOfTrackers', {});
    const numInferences = background.queryDatabase('getNumberOfInferences', {});

    // we use promises here instead of async/await because queries are not dependent on each other
    numPages.then(n => this.setState({numPages: n}));
    numTrackers.then(n => this.setState({numTrackers: n}));
    numInferences.then(n => this.setState({numInferences: n}));
  }

  async componentDidMount() {
    this.getData();
    //this.logLoad(); //will directly load it in App.js
  }

  render() {
    const {numTrackers, numInferences, numPages} = this.state;
    return (
      <div>
        <h1>Tracking Transparency</h1>
        <div className="homeText">

          <p>The Tracking Transparency extension lets you learn about what companies could have inferrred about your browsing through trackers and advertisments on the web pages you visit.</p>

          <p>In total, <em>{numTrackers} trackers</em> have seen you visit <em>{numPages} pages</em>. The Tracking Transparency extension has determined that these companies could have inferred your interest in <em>{numInferences} topics</em>.</p>

          {/* <p>See all the the trackers and inferences on a specific domain, such as <Link to={{pathname: '/domains/www.nytimes.com'}}>www.nytimes.com</Link> or <Link to={{pathname: '/domains/www.yahoo.com'}}>www.yahoo.com</Link>. Learn about a specific tracker such as <Link to={{pathname: '/trackers/Google'}}>Google</Link>. See all the <Link to={{pathname: '/inferences'}}>inferences</Link>  companies may have made about your browsing, or view details about a specific inference such as <Link to={{pathname: '/inferences/warehousing'}}>warehousing</Link>.</p> */}
        </div>
      </div>
    )
  }
}

export const WaitingDataHome = () => (
  <div>
    <h1>Tracking Transparency</h1>
    <div className="homeText">
      <p>Continue using the internet and come back here in a few days to see insights about what companies know about your browsing!</p>
    </div>
  </div>
)
