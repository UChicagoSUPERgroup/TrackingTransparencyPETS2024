import 'bootstrap/dist/css/bootstrap.css';
import '../../node_modules/react-vis/dist/style.css';

import React, { Component } from 'react';
import { withRouter } from 'react-router'
import { HashRouter, Route } from 'react-router-dom';

import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';

import {LinkContainer} from 'react-router-bootstrap';

import {Home, WaitingDataHome} from './Home';
import InferencesPage from './Inferences';
import TrackersList from './Trackers';
import FirstPartyList from  './FirstParties';
import RecentPage from './Recent';
import AboutPage from './About';
import DebugPage from './Debug';
import LightbeamWrapper from './LightbeamWrapper';
import tt from '../helpers';
import COLORS from '../colors';

import '../styles/common.css';
import '../styles/dashboard.css';
import '../styles/navbar.css';

const NavLink = ({to, title}) => (
  <LinkContainer to={to}>
    <NavItem>{title}</NavItem>
  </LinkContainer>
)

const TTNavbar = () => {
  const enoughData = tt.enoughData();
  return (
    <Navbar fixedTop>
      <Navbar.Header>
        <LinkContainer to="/">
          <Navbar.Brand>Tracking Transparency</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        {enoughData && <Nav>
          <NavLink to="/trackers" title="Trackers"/>
          <NavLink to="/inferences" title="Inferences"/>
          <NavLink to="/domains" title="Sites"/>
          <NavLink to="/recent" title="Activity"/>
          <NavLink to="/lightbeam" title="Time"/>
        </Nav>}
        <Nav pullRight>
          <NavLink to="/debug" title="Debug"/>
          <NavLink to="/about" title="About"/>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

const TTNavbar_nolight = () => {
  const enoughData = tt.enoughData();
  return (
    <Navbar fixedTop>
      <Navbar.Header>
        <LinkContainer to="/">
          <Navbar.Brand>Tracking Transparency</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        {enoughData && <Nav>
          <NavLink to="/trackers" title="Trackers"/>
          <NavLink to="/inferences" title="Inferences"/>
          <NavLink to="/domains" title="Sites"/>
          <NavLink to="/recent" title="Activity"/>
        </Nav>}
        <Nav pullRight>
          <NavLink to="/debug" title="Debug"/>
          <NavLink to="/about" title="About"/>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.logLoad = this.logLoad.bind(this);
    this.logLeave = this.logLeave.bind(this);
  }


  async logLoad() {
      //console.log('In the log load page')
      const background = await browser.runtime.getBackgroundPage();
      let userParams = await browser.storage.local.get({
        usageStatCondition: "no monster",
        userId: "no monster",
        startTS: 0
      });
      if (JSON.parse(userParams.usageStatCondition)){//get data when the user load the page.
        let activityType='load dashboard home page';
        let timestamp=Date.now();
        let userId=userParams.userId;
        let startTS=userParams.startTS;
        let activityData={
            }
        background.logData(activityType, timestamp, userId, startTS, activityData);
      }
    }

    async logLeave() {
        //console.log('In the log load page')
        alert('ICH bin here');
        const background = await browser.runtime.getBackgroundPage();
        let userParams = await browser.storage.local.get({
          usageStatCondition: "no monster",
          userId: "no monster",
          startTS: 0
        });
        if (JSON.parse(userParams.usageStatCondition)){//get data when the user load the page.
          let activityType='close dashboard home page';
          let timestamp=Date.now();
          let userId=userParams.userId;
          let startTS=userParams.startTS;
          let activityData={}
          background.logData(activityType, timestamp, userId, startTS, activityData);
        }
      }


  async componentWillUnmount() {
    this.logLeave();
  }

  async componentDidMount() {
    const param = await browser.storage.local.get('lightbeamcondition');
    this.setState({lightbeamcondition: JSON.parse(param.lightbeamcondition)});
    this.logLoad();
  }

  render() {
    const {lightbeamcondition} = this.state;
    const enoughData = tt.enoughData();
    return(
      <HashRouter>
        <div>
          {lightbeamcondition && <TTNavbar/>}
          {!lightbeamcondition && <TTNavbar_nolight/>}

          <div className="container containerInner">

            {enoughData && lightbeamcondition && <div>
              <Route exact path="/" component={Home}/>
              <Route path="/inferences" component={InferencesPage}/>
              <Route path="/trackers" component={TrackersList}/>
              <Route path="/domains" component={FirstPartyList}/>
              <Route path="/recent" component={RecentPage}/>
              <Route path="/lightbeam" component={LightbeamWrapper}/>
            </div>}

            {enoughData && !lightbeamcondition && <div>
              <Route exact path="/" component={Home}/>
              <Route path="/inferences" component={InferencesPage}/>
              <Route path="/trackers" component={TrackersList}/>
              <Route path="/domains" component={FirstPartyList}/>
              <Route path="/recent" component={RecentPage}/>
            </div>}


            {!enoughData &&<Route exact path="/" component={WaitingDataHome}/>}

            <Route path="/about" component={AboutPage}/>
            <Route path="/debug" component={DebugPage}/>
          </div>
        </div>
      </HashRouter>
    );
  }
}


export default App;
