import React from 'react';

export class AboutPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
    this.logClick = this.logClick.bind(this);
    this.logLoad = this.logLoad.bind(this);
  }

async logClick(e) {
    //console.log('We can get the id of the object clicked with e.target.id', e.target.id)
    console.log('We can access more info in the e.target object', e.target)
    e.persist();
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

    if (JSON.parse(userParams.usageStatCondition)){//get data when the user click on the button.
      let activityType='click dashboard about page';
      let timestamp=Date.now();
      let userId=userParams.userId;
      let startTS=userParams.startTS;
      let activityData={
          'clickedElemId':e.target.id,
          'parentTabId':tabId,
          'parentDomain':tabData.domain,
          'parentPageId':tabData.pageId,
          'parentNumTrackers':tabData.numTrackers
          }
      background.logData(activityType, timestamp, userId, startTS, activityData);
    }
  }

  async logLoad() {
      //console.log('In the log load page')
      const background = await browser.runtime.getBackgroundPage();
      const tabs = await browser.tabs.query({active: true, currentWindow: true});
      let tabId = tabs[0].openerTabId;
      let x = 'clickData_tabId_'+String(tabId);
      let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain':'','tabId':tabId,'pageId':'','numTrackers':0})});
      tabData = JSON.parse(tabData[x]);

      //console.log('About page', tabId, tabData);
      let userParams = await browser.storage.local.get({
        usageStatCondition: "no monster",
        userId: "no monster",
        startTS: 0
      });
      if (JSON.parse(userParams.usageStatCondition)){//get data when the user load the page.
        let activityType='load dashboard about page';
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

  async componentDidMount() {
    this.logLoad();
  }

  render() {
    const {numTrackers, numInferences, numPages} = this.state;
    return (
      <div>
        <h1>About</h1>
        <p>
        Tracking is ubiquitous…
        </p>
        <h2>How it works</h2>
        <p>With this extension, we are trying to bring you more transparency about the world of
        online tracking, analytics, and advertising. We track the trackers by looking for trackers
        on all of the pages you visit while the extension is running. The extension keeps track of
        where and when you encountered these trackers. All of this information is used to show you
        personalized examples of how you interact with trackers in your normal activity.</p>
        <p> insert: how we know what trackers are</p>
        <p> insert: how we make inferences</p>
        <p> insert: limits of our approach</p>
        <p> insert: how it compares to other extensions- could be different approach</p>
        <h2>Your privacy</h2>
        <p>To show you the data that other companies could gather about your browsing behavior, our
        extension also needs to log your behavior and page visits. All of your data is stored in a
        local database on your device and so nobody, not even our team of researchers, has access to
        your information. Your data stays on your computer and is never sent to another server.</p>
        <h2>Who we are</h2>
        <p>The Tracking Transparency extension was built by a team within the <a href="https://super.cs.uchicago.edu" target="_blank" rel="noopener noreferrer">University of Chicago SUPERgroup</a>. It was developed by Ben Weinshel, Claire Dolin, Shawn Shan, Euirim Choi, and Aaron Goldman. The project is advised by Prof. Blase Ur at the University of Chicago, Prof. Michelle L. Mazurek at the University of Maryland, and Lorrie Faith Cranor at Carnegie Mellon University.</p>
        <p>Our source code is available on <a href="https://github.com/UChicagoSUPERgroup/trackingtransparency" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
      </div>
    )
  }
}

export default AboutPage;
