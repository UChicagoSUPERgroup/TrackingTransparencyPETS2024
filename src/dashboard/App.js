import 'bootstrap/dist/css/bootstrap.css';
import '../../node_modules/react-vis/dist/style.css';

import React, { Component } from 'react';
import { HashRouter, Route } from 'react-router-dom';

import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';

import {LinkContainer} from 'react-router-bootstrap';

import {Home, WaitingDataHome} from './Home';
import IntroModal from './IntroModal';
import InferenceOverview from './inferences/InferenceOverview';
import TrackerOverview from './trackers/TrackerOverview';
import FirstPartyOverview from  './sites/FirstPartyOverview';
import ActivityOverview from './activity/ActivityOverview';
import AboutPage from './About';
import TakeActionPage from './TakeAction';
import DebugPage from './Debug';
import LightbeamWrapper from './LightbeamWrapper';

import tt from '../helpers';

// import COLORS from '../colors';

import '../styles/common.css';
import '../styles/dashboard.css';
import '../styles/navbar.css';
import '../styles/panel.css'

import logging from './dashboardLogging';


const NavLink = ({to, title}) => (
  <LinkContainer to={to} className = "navbarTolog">
    <NavItem>{title}</NavItem>
  </LinkContainer>
)

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: true 
    }

    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleModalShow = this.handleModalShow.bind(this);
    //this.logLoad = this.logLoad.bind(this);
    //this.logLeave = this.logLeave.bind(this);
    //this.logClick = this.logClick.bind(this);
  }

  handleModalClose() {
    this.setState({ showModal: false });
  }

  handleModalShow() {
    this.setState({ showModal: true });
  }

/************** BEGIN Instrumentation code *******************
The code for logclick logs ALL the click in every single page.
*************/



  async componentWillUnmount() {
    //window.removeEventListener("beforeunload", this.logLeave)
    //window.removeEventListener("unload", this.logLeave)
    //browser.tabs.onRemoved.removeListener(this.logLeave)
    window.removeEventListener("click", logging.logDashboardClick)
  }

  async componentDidMount() {
    const enoughDataP = tt.enoughData();
    enoughDataP.then(ed => this.setState({enoughData: ed}))

    const param = await browser.storage.local.get('lightbeamcondition');
    this.setState({lightbeamcondition: JSON.parse(param.lightbeamcondition)});
    logging.logStartDashboardPage();
    window.addEventListener("click", logging.logDashboardClick, true);

    //window.addEventListener("unload", this.logLeave, true);
    //browser.tabs.onRemoved.addListener(this.logLeave)
    //window.addEventListener("beforeunload", this.logLeave, true);
    //window.addEventListener("click", this.logClick, true);
    //window.onbeforeunload = function(){alert('finally');}
  }

  /************** END Instrucmentation code ********************************/

  render() {
    const {lightbeamcondition, tabId, enoughData, showModal} = this.state;
    const TTNavbar = () => {
      const {lightbeamcondition, tabId} = this.state;
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
              <NavLink to="/trackers"  title="Trackers"/>
              <NavLink to="/inferences"  title="Inferences"/>
              <NavLink to="/domains"  title="Sites"/>
              <NavLink to="/activty"  title="Activity"/>
              {lightbeamcondition && <NavLink to="/lightbeam"  title="Time"/>}
            </Nav>}
            <Nav pullRight>
              <NavItem onClick={this.handleModalShow}>Show Intro</NavItem>
              {!tt.production && <NavLink to="/debug"  title="Debug"/>}
              <NavLink to="/about"  title="About"/>
              <NavLink to="/takeaction"  title="Take Action"/>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      )
    }

    return(

      <HashRouter>
        <div>
          <TTNavbar/>

          <IntroModal show={this.state.showModal} onHide={this.handleModalClose} />

          <div className="container containerInner">

            {enoughData && <div>
              <Route exact path="/" component={Home}/>
              <Route path="/inferences" component={InferenceOverview}/>
              <Route path="/trackers" component={TrackerOverview}/>
              <Route path="/domains" component={FirstPartyOverview}/>
              <Route path="/activity" component={ActivityOverview}/>
              {lightbeamcondition && <Route path="/lightbeam" component={LightbeamWrapper}/>}
            </div>}

            {!enoughData &&<Route exact path="/" component={WaitingDataHome}/>}

            <Route path="/about" component={AboutPage}/>
            <Route path="/takeaction" component={TakeActionPage}/>
            <Route path="/debug" component={DebugPage}/>
          </div>

        </div>
      </HashRouter>
    );
  }
}


export default App;
