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
  <LinkContainer to={to} className = "navbarTolog">
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
          <NavLink to="/trackers"  title="Trackers"/>
          <NavLink to="/inferences"  title="Inferences"/>
          <NavLink to="/domains"  title="Sites"/>
          <NavLink to="/recent"  title="Activity"/>
          <NavLink to="/lightbeam"  title="Time"/>
        </Nav>}
        <Nav pullRight>
          <NavLink to="/debug"  title="Debug"/>
          <NavLink to="/about"  title="About"/>
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
          <NavLink to="/trackers"  title="Trackers"/>
          <NavLink to="/inferences"  title="Inferencesffsd"/>
          <NavLink to="/domains"  title="Sites"/>
          <NavLink to="/recent"  title="Activity"/>
        </Nav>}
        <Nav pullRight>
        <NavLink to="/debug"  title="Debug"/>
        <NavLink to="/about"  title="About"/>
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
    this.logClick = this.logClick.bind(this);
  }

/************** BEGIN Instrumentation code *******************
The code for logclick logs ALL the click in every single page.
*************/


  async logClick(e){
    console.log(e);
    const background = await browser.runtime.getBackgroundPage();
    let userParams = await browser.storage.local.get({
      usageStatCondition: "no monster",
      userId: "no monster",
      startTS: 0
    });
    if (!JSON.parse(userParams.usageStatCondition))return true;

    let activityType = ''
    let extraData = {}
          /******** navbar click ********/
    //log navbar toggle activity
    if (e.target.localName =='button' && e.target.className.includes("navbar-toggle")){
      activityType = 'click on navbar toggle button'
    }
    //log navbar click activity
    if (e.target.localName =='a' && e.target.parentNode.className.includes("navbarTolog")){
      activityType = 'click on navbar link'
      extraData = {"navLinkClicked":e.target.text}
    }
        /******** trackers section click ********/

    //log click on trackers page links
    if (e.target.localName =='a' && e.target.className.includes("trackerTableLinkTrackersPage")){
      activityType = 'click on tracker link on Trackers dashboard page'
      let linkClicked  = e.target.text;
      linkClicked = await background.hashit(linkClicked);
      extraData = {"trackerTableLinkTrackersPageClicked":linkClicked}
    }
    //log click on domains table for a particular tracker
    if (e.target.localName =='a' && e.target.className.includes("domainTableLinkTrackersPage")){
      activityType = 'click on domain link for a tracker on Trackers dashboard page'
      let linkClicked  = e.target.text;
      linkClicked = await background.hashit_salt(linkClicked);
      extraData = {"domainTableLinkTrackersPageClicked":linkClicked}
    }
    //log click on inferences table for a particular tracker
    if (e.target.localName =='a' && e.target.className.includes("inferenceTableLinkTrackersPage")){
      activityType = 'click on inference link for a tracker on Trackers dashboard page'
      let linkClicked  = e.target.text;
      linkClicked = await background.hashit(linkClicked);
      extraData = {"inferenceTableLinkTrackersPageClicked":linkClicked}
    }

      /******** Inferences section click ********/

    //log click on domains table for a particular inference
    if (e.target.localName =='a' && e.target.className.includes("domainTableLinkInferencesPage")){
      activityType = 'click on domain link for an inference on Inferences dashboard page'
      let linkClicked  = e.target.text;
      linkClicked = await background.hashit_salt(linkClicked);
      extraData = {"domainTableLinkInferencesPageClicked":linkClicked}
    }

    //log click on trackers table for a particular inference
    if (e.target.localName =='a' && e.target.className.includes("trackerTableLinkInferencesPage")){
      activityType = 'click on tracker link for an inference on Inferences dashboard page'
      let linkClicked  = e.target.text;
      linkClicked = await background.hashit(linkClicked);
      extraData = {"trackerTableLinkInferencesPageClicked":linkClicked}
    }

          /******** domains section click ********/

    //log click on domains table in the domains (Sites) section of the dashbord page
    if (e.target.localName =='a' && e.target.className.includes("domainsTableLinkDomainsPage")){
      activityType = 'click on domain link from the list of domains on Domains dashboard page'
      let linkClicked  = e.target.text;
      linkClicked = await background.hashit_salt(linkClicked);
      extraData = {"domainsTableLinkDomainsPageClicked":linkClicked}
    }

    //console.log('activityType ', activityType);

    /******** recent activity section click ********/

//log click on domains table in the domains (Sites) section of the dashbord page
    if (e.target.localName =='input' && e.target.name.includes("grouping-selector")){
      activityType = 'click to select timegroups in recent activity dashboard page'
      let linkClicked  = e.target.value;
      extraData = {"timeGroupSelected":linkClicked}
    }

    if (activityType){
        const {lightbeamcondition, tabId} = this.state;
        //console.log('logLeave', tabId);
        let x = 'clickData_tabId_'+String(tabId);
        let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain':'','tabId':tabId,'pageId':'','numTrackers':0})});
        //console.log('logLeave', tabData);
        tabData = JSON.parse(tabData[x]);

        let timestamp=Date.now();
        let userId=userParams.userId;
        let startTS=userParams.startTS;
        let activityData={
            'parentTabId':tabId,
            'parentDomain':tabData.domain,
            'parentPageId':tabData.pageId,
            'parentNumTrackers':tabData.numTrackers,
            'extraData' : JSON.stringify(extraData)
          }
        background.logData(activityType, timestamp, userId, startTS, activityData);
      }
    }

  async logLoad() {
      //console.log('In the log load page')
      const background = await browser.runtime.getBackgroundPage();
      let userParams = await browser.storage.local.get({
        usageStatCondition: "no monster",
        userId: "no monster",
        startTS: 0
      });
      const tabs = await browser.tabs.query({active: true, currentWindow: true});
      let tabId = tabs[0].openerTabId;
      let x = 'clickData_tabId_'+String(tabId);
      let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain':'','tabId':tabId,'pageId':'','numTrackers':0})});
      tabData = JSON.parse(tabData[x]);
      this.setState({tabId: tabId});

      if (JSON.parse(userParams.usageStatCondition)){//get data when the user load the page.
        let activityType='load dashboard home page';
        let timestamp=Date.now();
        let userId=userParams.userId;
        let startTS=userParams.startTS;
        let activityData={
          'parentTabId':tabId,
          'parentDomain':tabData.domain,
          'parentPageId':tabData.pageId,
          'parentNumTrackers':tabData.numTrackers
        }
        background.logData(activityType, timestamp, userId, startTS, activityData);
      }
    }

    async logLeave() {
        //console.log('In the log leave page');
        //alert('ICH bin here');
        const background = await browser.runtime.getBackgroundPage();
        let userParams = await browser.storage.local.get({
          usageStatCondition: "no monster",
          userId: "no monster",
          startTS: 0
        });
        //const tabs = await browser.tabs.query({active: true, currentWindow: true});
        //let tabId = tabs[0].openerTabId;
        const {lightbeamcondition, tabId} = this.state;
        //console.log('logLeave', tabId);
        let x = 'clickData_tabId_'+String(tabId);
        let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain':'','tabId':tabId,'pageId':'','numTrackers':0})});
        //console.log('logLeave', tabData);
        tabData = JSON.parse(tabData[x]);
        if (JSON.parse(userParams.usageStatCondition)){//get data when the user load the page.
          let activityType='close dashboard home page';
          let timestamp=Date.now();
          let userId=userParams.userId;
          let startTS=userParams.startTS;
          let activityData={
            'parentTabId':tabId,
            'parentDomain':tabData.domain,
            'parentPageId':tabData.pageId,
            'parentNumTrackers':tabData.numTrackers
          }
          background.logData(activityType, timestamp, userId, startTS, activityData);
        }
        await browser.storage.local.remove([x]);
      }

  async componentWillUnmount() {
    window.removeEventListener("beforeunload", this.onUnload)
    window.removeEventListener("click", this.logClick)
  }

  async componentDidMount() {
    const param = await browser.storage.local.get('lightbeamcondition');
    this.setState({lightbeamcondition: JSON.parse(param.lightbeamcondition)});
    this.logLoad();
    window.addEventListener("beforeunload", this.logLeave)
    window.addEventListener("click", this.logClick, true)
  }

  /************** END Instrucmentation code ********************************/

  render() {
    const {lightbeamcondition, tabId} = this.state;
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
