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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.logLoad = this.logLoad.bind(this);
    //this.logLeave = this.logLeave.bind(this);
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
      extraData = {"navbarTolog_Clicked":e.target.text}
    }
        /******** trackers section click ********/

    //log click on trackers page links
    if (e.target.localName =='a' && e.target.className.includes("trackerTableLinkTrackersPage")){
      activityType = 'click on tracker link on Trackers dashboard page'
      let linkClicked  = e.target.text;
      linkClicked = await background.hashit(linkClicked);
      extraData = {"trackerTableLinkTrackersPage_Clicked":linkClicked}
    }
    //log click on domains table for a particular tracker
    if (e.target.localName =='a' && e.target.className.includes("domainTableLinkTrackersPage")){
      activityType = 'click on domain link for a tracker on Trackers dashboard page'
      let linkClicked  = e.target.text;
      linkClicked = await background.hashit_salt(linkClicked);
      extraData = {"domainTableLinkTrackersPage_Clicked":linkClicked}
    }
    //log click on inferences table for a particular tracker
    if (e.target.localName =='a' && e.target.className.includes("inferenceTableLinkTrackersPage")){
      activityType = 'click on inference link for a tracker on Trackers dashboard page'
      let linkClicked  = e.target.text;
      linkClicked = await background.hashit(linkClicked);
      extraData = {"inferenceTableLinkTrackersPage_Clicked":linkClicked}
    }

      /******** Inferences section click ********/

    //log click on domains table for a particular inference
    if (e.target.localName =='a' && e.target.className.includes("inferencePageTopTextInferenceLink")){
      activityType = 'click on inference link on Inferences dashboard page top text'
      let linkClicked  = e.target.text;
      linkClicked = await background.hashit(linkClicked);
      extraData = {"inferencePageTopTextInferenceLink_Clicked":linkClicked}
    }

    if (e.target.localName =='label' && e.target.className.includes("inferencePageDateChoose")){
      activityType = 'click on date picker button on Inferences dashboard page'
      let linkClicked  = e.target.innerText;
      //linkClicked = await background.hashit(linkClicked);
      extraData = {"inferencePageDateChoose_Chosen":linkClicked}
    }

    if (e.target.localName =='label' && e.target.className.includes("inferencePageSensitivityChoose")){
      activityType = 'click on sensitivity picker button on Inferences dashboard paget'
      let linkClicked  = e.target.innerText;
      //linkClicked = await background.hashit(linkClicked);
      extraData = {"inferencePageSensitivityChoose_Chosen":linkClicked}
    }

    if (e.target.localName =='a' && e.target.className.includes("inferencePageSelected-Inference")){
      activityType = 'click on inference link for selected inference on Inferences dashboard page '
      let linkClicked  = e.target.text;
      linkClicked = await background.hashit(linkClicked);
      extraData = {"inferencePageSelected-Inference_Clicked":linkClicked}
    }

    if (e.target.localName =='a' && e.target.className.includes("domainTableLinkInferencesPage")){
      activityType = 'click on domain link for an inference on Inferences dashboard page'
      let linkClicked  = e.target.text;
      linkClicked = await background.hashit_salt(linkClicked);
      extraData = {"domainTableLinkInferencesPage_Clicked":linkClicked}
    }

    if (e.target.localName =='label' && e.target.className.includes("pagesTimeChart-grouping-selector")){
      activityType = 'select time groups for grouping selector on pagesTimeChart'
      let linkClicked  = e.target.innerText;
      //linkClicked = await background.hashit_salt(linkClicked);
      extraData = {"pagesTimeChart-grouping-selector_chosen":linkClicked}
    }

    //log click on trackers table for a particular inference
    if (e.target.localName =='a' && e.target.className.includes("trackerTableLinkInferencesPage")){
      activityType = 'click on tracker link for an inference on Inferences dashboard page'
      let linkClicked  = e.target.text;
      linkClicked = await background.hashit(linkClicked);
      extraData = {"trackerTableLinkInferencesPage_Clicked":linkClicked}
    }

          /******** domains section click ********/

    //log click on domains table in the domains (Sites) section of the dashbord page
    if (e.target.localName =='a' && e.target.className.includes("domainsTableLinkDomainsPage")){
      activityType = 'click on domain link from the list of domains on Domains dashboard page'
      let linkClicked  = e.target.text;
      linkClicked = await background.hashit_salt(linkClicked);
      extraData = {"domainsTableLinkDomainsPage_Clicked":linkClicked}
    }

    //console.log('activityType ', activityType);

    /******** recent activity section click ********/
    /*
    if (e.target.localName =='input' && e.target.name.includes("grouping-selector")){
      activityType = 'click to select timegroups in recent activity dashboard page'
      let linkClicked  = e.target.value;
      extraData = {"timeGroupSelected":linkClicked}
    }
    */
    if (activityType){
        //const {lightbeamcondition, tabId, parentTabId} = this.state;
        //console.log('logLeave', tabId);
        let tabId = this.state.tabId;
        let parentTabId = this.state.parentTabId;
        let x = 'clickData_tabId_'+String(tabId);
        let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain':'','tabId':tabId,'pageId':'','numTrackers':0})});
        //console.log('logLeave', tabData);
        tabData = JSON.parse(tabData[x]);

        let timestamp=Date.now();
        let userId=userParams.userId;
        let startTS=userParams.startTS;
        let activityData={
            'tabId': tabId,
            'parentTabId':parentTabId,
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
      console.log(tabs[0]);
      let parentTabId = tabs[0].openerTabId;
      let tabId = tabs[0].id;
      const tabData_1 = await background.getTabData(parentTabId);
      let domain = '';
      let pageId = '';
      let numTrackers = 0;
      if (tabData_1){
        //console.log('I am in dashboard ', tabData, tabData.pageId);
        //console.log('Here I am monster', tabData.pageId, tabData.domain);
        domain = await background.hashit_salt(tabData_1.domain);
        pageId = tabData_1.pageId;
        numTrackers = tabData_1.trackers.length;
      }
      let tabData = {
        'domain':domain,
        'tabId':parentTabId,
        'pageId':pageId,
        'numTrackers':numTrackers
      }
      let x = 'clickData_tabId_'+String(parentTabId);
      let y = 'clickData_tabId_'+String(tabId);
      await browser.storage.local.set({[y]: JSON.stringify(tabData)});
      //console.log('In the log load page ', tabId);
      //let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain':'','tabId':tabId,'pageId':'','numTrackers':0})});
      //await browser.storage.local.set({[y]: JSON.stringify(tabData[x])});
      await browser.storage.local.remove([x]);
      //tabData = JSON.parse(tabData[x]);
      this.setState({tabId: tabId});
      this.setState({parentTabId: parentTabId});

      if (JSON.parse(userParams.usageStatCondition)){//get data when the user load the page.
        let activityType='load dashboard home page';
        let timestamp=Date.now();
        let userId=userParams.userId;
        let startTS=userParams.startTS;
        let activityData={
          'tabId':tabId,
          'parentTabId':parentTabId,
          'parentDomain':tabData.domain,
          'parentPageId':tabData.pageId,
          'parentNumTrackers':tabData.numTrackers
        }
        background.logData(activityType, timestamp, userId, startTS, activityData);
      }
    }


  async componentWillUnmount() {
    //window.removeEventListener("beforeunload", this.logLeave)
    //window.removeEventListener("unload", this.logLeave)
    //browser.tabs.onRemoved.removeListener(this.logLeave)
    window.removeEventListener("click", this.logClick)
  }

  async componentDidMount() {
    const param = await browser.storage.local.get('lightbeamcondition');
    this.setState({lightbeamcondition: JSON.parse(param.lightbeamcondition)});
    this.logLoad();
    window.addEventListener("click", this.logClick, true);

    //window.addEventListener("unload", this.logLeave, true);
    //browser.tabs.onRemoved.addListener(this.logLeave)
    //window.addEventListener("beforeunload", this.logLeave, true);
    //window.addEventListener("click", this.logClick, true);
    //window.onbeforeunload = function(){alert('finally');}
  }

  /************** END Instrucmentation code ********************************/

  render() {
    const {lightbeamcondition, tabId} = this.state;
    const enoughData = tt.enoughData();
    const TTNavbar = () => {
      const enoughData = tt.enoughData();
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
              <NavLink to="/recent"  title="Activity"/>
              {lightbeamcondition && <NavLink to="/lightbeam"  title="Time"/>}
            </Nav>}
            <Nav pullRight>
              <NavLink to="/debug"  title="Debug"/>
              <NavLink to="/about"  title="About"/>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      )
    }

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
              {lightbeamcondition && <Route path="/lightbeam" component={LightbeamWrapper}/>}
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
