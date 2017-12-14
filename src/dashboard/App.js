import React, { Component } from 'react';

import {
  HashRouter,
  Route,
  Link
} from 'react-router-dom';

import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';

import {LinkContainer} from 'react-router-bootstrap';

import '../../node_modules/react-vis/dist/style.css';

import InferencesPage from './Inferences';
import TrackersList from './Trackers';
import FirstPartyList from  './FirstParties';
import AboutPage from './About';
import DebugPage from './Debug';
import ttDashboard from './dashboardHelpers';
import './App.css';

class App extends Component {
  render() {
    const enoughData = ttDashboard.enoughData();

    return(
      <HashRouter>
        <div>
          <Navbar fixedTop>
            <Navbar.Header>
              <LinkContainer to="/">
                <Navbar.Brand>
                  Tracking Transparency
                </Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              {enoughData && <Nav>
                <LinkContainer to="/trackers">
                  <NavItem>
                    What have they tracked?
                  </NavItem>
                </LinkContainer>
                <LinkContainer to="/inferences">
                  <NavItem>
                    What could they have learned?
                  </NavItem>
                </LinkContainer>
                <LinkContainer to="/domains">
                  <NavItem>
                    Domains
                  </NavItem>
                </LinkContainer>
              </Nav>}
              <Nav pullRight>
                <LinkContainer to="/debug">
                  <NavItem>
                    Debug
                  </NavItem>
                </LinkContainer>
                <LinkContainer to="/about">
                  <NavItem>
                    About
                  </NavItem>
                </LinkContainer>
                <NavItem href="https://github.com/UChicagoSUPERgroup/trackingtransparency" target="_blank">GitHub</NavItem>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          
          
          <div className="container containerInner">
            {enoughData &&<Route exact path="/" component={Home}/>}
            {enoughData &&<Route path="/inferences" component={InferencesPage}/>}
            {enoughData &&<Route path="/trackers" component={TrackersList}/>}
            {enoughData &&<Route path="/domains" component={FirstPartyList}/>}

            {!enoughData &&<Route exact path="/" component={WaitingDataHome}/>}

            <Route path="/about" component={AboutPage}/>
            <Route path="/debug" component={DebugPage}/>
          </div>
        </div>
      </HashRouter>
    );
  }
}

const Home = () => (
  <div>
    <h1>Tracking Transparency</h1>
    <div className="homeText">
      <p>Learn about online tracking!</p>
      <p>Short example here…</p>
      <p>See all the the trackers and inferences on a specific domain, such as <Link to={{pathname: '/domains/www.nytimes.com'}}>www.nytimes.com</Link> or <Link to={{pathname: '/domains/www.yahoo.com'}}>www.yahoo.com</Link>. Learn about a specific tracker such as <Link to={{pathname: '/trackers/Google'}}>Google</Link>. See all the <Link to={{pathname: '/inferences'}}>inferences</Link>  companies may have made about your browsing, or view details about a specific inference such as <Link to={{pathname: '/inferences/warehousing'}}>warehousing</Link>.</p>
    </div>
  </div>
)

const WaitingDataHome = () => (
  <div>
    <h1>Tracking Transparency</h1>
    <div className="homeText">
      <p>Continue using the internet and come back here in a few days to see insights about what companies know about your browsing!</p>
    </div>
  </div>
)
export default App;