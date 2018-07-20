import React from 'react';
import { Link } from 'react-router-dom';
import {Panel, Breadcrumb} from 'react-bootstrap';

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'

const millisecondsInDay = 86400000;


const inferenceList = (data) => {
  return (
    <div>
      {data.map(function(dataValue) {
        let key = dataValue["DISTINCT(inference)"]
        return (<p key={key}>
          <Link to={{pathname: '/inferences/' + key}}>
             {key}
          </Link>
        </p>);
      })}
    </div>
  )
}

const domainList = (data) => {
  return (
    <div>
      {data.map(function(dataValue) {
        let key = dataValue["DISTINCT(domain)"]
        return (<p key={key}>
          <Link to={{pathname: '/domains/' + key}}>
             {key}
          </Link>
        </p>);
      })}
    </div>
  )
}


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
    let args = {count: 5}

    const numPages = background.queryDatabase('getNumberOfPages', {});
    const numTrackers = background.queryDatabase('getNumberOfTrackers', {});
    const numInferences = background.queryDatabase('getNumberOfInferences', {});
    const recentInferences = background.queryDatabase('getInferencesByTime', args);
    const recentDomains = background.queryDatabase('getDomainsByTime', args);
    console.log(recentDomains);

    // we use promises here instead of async/await because queries are not dependent on each other
    numPages.then(n => this.setState({numPages: n}));
    numTrackers.then(n => this.setState({numTrackers: n}));
    numInferences.then(n => this.setState({numInferences: n}));
    recentInferences.then(n => this.setState({recentInferences: n}))
    recentDomains.then(n => this.setState({recentDomains: n}))
  }

  async componentDidMount() {
    this.getData();
    //this.logLoad(); //will directly load it in App.js
  }

  render() {
    const {numTrackers, numInferences, numPages, recentInferences, recentDomains} = this.state;
    return (
      <div>
        <Breadcrumb>
          <Breadcrumb.Item active>Home</Breadcrumb.Item>
        </Breadcrumb>
        <Heading level='h1'>Tracking Transparency</Heading>
          <Text>

            <p>The Tracking Transparency extension lets you learn about what companies could have inferrred about your browsing through trackers and advertisments on the web pages you visit.</p>

            <p>In total, <em>{numTrackers} trackers</em> have seen you visit <em>{numPages} pages</em>. The Tracking Transparency extension has determined that these companies could have inferred your interest in <em>{numInferences} topics</em>.</p>

            {/* <p>See all the the trackers and inferences on a specific domain, such as <Link to={{pathname: '/domains/www.nytimes.com'}}>www.nytimes.com</Link> or <Link to={{pathname: '/domains/www.yahoo.com'}}>www.yahoo.com</Link>. Learn about a specific tracker such as <Link to={{pathname: '/trackers/Google'}}>Google</Link>. See all the <Link to={{pathname: '/inferences'}}>inferences</Link>  companies may have made about your browsing, or view details about a specific inference such as <Link to={{pathname: '/inferences/warehousing'}}>warehousing</Link>.</p> */}
            </Text>
        <Grid startAt='large'>
          <GridRow>
            <GridCol width={2}>
            <Panel bsStyle="primary">
              <Panel.Heading>
                <Panel.Title>Trackers Seen</Panel.Title>
              </Panel.Heading>
              <Panel.Body><h2>{numTrackers}</h2></Panel.Body>
            </Panel>
            </GridCol>
            <GridCol width={2}>
            <Panel bsStyle="primary">
              <Panel.Heading>
                <Panel.Title>Pages Visited</Panel.Title>
              </Panel.Heading>
              <Panel.Body><h2>{numPages}</h2></Panel.Body>
            </Panel>
            </GridCol>
            <GridCol width={2}>
            <Panel bsStyle="primary">
              <Panel.Heading>
                <Panel.Title>Inferred Interests</Panel.Title>
              </Panel.Heading>
              <Panel.Body><h2>{numInferences}</h2></Panel.Body>
            </Panel>
            </GridCol>
            <GridCol width={3}>
            <Panel bsStyle="primary">
              <Panel.Heading>
                <Panel.Title>Recent Inferences</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                {recentInferences ? inferenceList(recentInferences) : ""}
              </Panel.Body>
            </Panel>
            </GridCol>
            <GridCol width={3}>
            <Panel bsStyle="primary">
              <Panel.Heading>
                <Panel.Title>Recent Sites</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                {recentDomains ? domainList(recentDomains) : ""}
              </Panel.Body>
            </Panel>
            </GridCol>
          </GridRow>
        </Grid>
      </div>
    )
  }
}

export const WaitingDataHome = () => (
  <div>
    <Heading level='h1'>Tracking Transparency</Heading>
    <Text>
      <p>The Tracking Tranparency extension is currently running in the background to collect information about the trackers in your browsing.</p>
      <p>Continue using the internet and come back here in a few days to see what they might know about your browsing!</p>
    </Text>
  </div>
)
