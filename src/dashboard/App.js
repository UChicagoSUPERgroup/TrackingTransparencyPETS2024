import React, { Component } from 'react';

import {
  HashRouter,
  Route,
  Link
} from 'react-router-dom';

import { Navbar, Nav, NavItem } from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';

// import Scripts from './Scripts';
import Blocks from './Blocks';
import FirstPartyList from  './FirstParties';
import AboutPage from './About'
import {CharacterPage} from './Characters';
import './App.css';

class App extends Component {
  render() {
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
              <Nav>
                <LinkContainer to="/blocks">
                  <NavItem>
                    Character Blocks
                  </NavItem>
                </LinkContainer>
                <LinkContainer to="/domains">
                  <NavItem>
                    Domains
                  </NavItem>
                </LinkContainer>
              </Nav>
              <Nav pullRight>
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
            <Route exact path="/" component={Home}/>
            {/* <Route path="/scripts" component={Scripts}/> */}
            <Route path="/blocks" component={Blocks}/>
            <Route path="/domains" component={FirstPartyList}/>
            <Route path="/characters/:name" component={CharacterPage}/>
            <Route path="/about" component={AboutPage}/>
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
      <p>See all the the trackers and inferences on a specific domain, such as <Link to={{pathname: '/domains/nytimes.com'}}>nytimes.com</Link> or <Link to={{pathname: '/domains/yahoo.com'}}>yahoo.com</Link>. Learn about a specific tracker such as <Link to={{pathname: '/trackers/Google'}}>Google</Link>. See all the <Link to={{pathname: '/inferences'}}>inferences</Link>  companies may have made about your browsing, or view details about a specific inference such as <Link to={{pathname: '/inferences/warehousing'}}>warehousing</Link>.</p>
    </div>
  </div>
)

export default App;