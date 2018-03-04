import 'bootstrap/dist/css/bootstrap.css';
import '../../node_modules/react-vis/dist/style.css';
import 'typeface-source-sans-pro';

import React, { Component } from 'react';
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
          <NavLink to="/inferences" title="Inferences Sunburst"/>
          <NavLink to="/recent" title="Recent Activity"/>
          <NavLink to="/domains" title="Domains"/>
          <NavLink to="/lightbeam" title="Lightbeam"/>
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
  render() {
    const enoughData = tt.enoughData();

    return(
      <HashRouter>
        <div>
          <TTNavbar/>
          
          <div className="container containerInner">

            {enoughData && <div>
              <Route exact path="/" component={Home}/>
              <Route path="/inferences" component={InferencesPage}/>
              <Route path="/trackers" component={TrackersList}/>
              <Route path="/domains" component={FirstPartyList}/>
              <Route path="/recent" component={RecentPage}/>
              <Route path="/lightbeam" component={LightbeamWrapper}/>
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