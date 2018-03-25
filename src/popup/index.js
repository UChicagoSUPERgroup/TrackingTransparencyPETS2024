import React from 'react';
import ReactDOM from 'react-dom';

import '../styles/common.css';
import '../styles/popup.css';
import '../styles/button.css';
import '../styles/navbar2.css';


class Popup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    }
    this.sendPopupData = this.sendPopupData.bind(this);
    this.openDashboard = this.openDashboard.bind(this);
  }

  async componentDidMount() {
    await this.sendPopupData();
    await this.getData();
    //console.log('in mount')
    //console.log(JSON.stringify(data))
    const {numTrackers, numInferences, numPages, pageTitle, trackers, topTracker, topTrackerCount} = this.state;
    //numTrackers = data['numTrackers']
    //await this.sendPopupData(numTrackers, numInferences, numPages, pageTitle, trackers, topTracker, topTrackerCount);

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

    const tabs = await browser.tabs.query({active: true, currentWindow: true});
    const tab = tabs[0];
    // get tab data with trackers and stuff here
    const tabData = await background.getTabData(tab.id);
    this.setState({tab: JSON.stringify(tabData)})

    let title = tabData.title;
    if (title.length >= 30) {
      title = title.substring(0,30).concat('...');
    }

    this.setState({
      pageTitle: title,
      trackers: tabData.trackers
    })

    if (tabData.trackers.length > 0) {
      const topTracker = tabData.trackers[0];
      const topTrackerCount = background.queryDatabase('getPageVisitCountByTracker', {tracker: topTracker});
      topTrackerCount.then(count => {
        this.setState({
          topTracker: topTracker,
          topTrackerCount: count
        })

      })
    }
    //console.log('returnData');
    //console.log(JSON.stringify(returnData));
    //return returnData;
  }

//async sendPopupData(numTrackers, numInferences, numPages, pageTitle, trackers, topTracker, topTrackerCount){
async sendPopupData(){
  const background = await browser.runtime.getBackgroundPage();
  let userParams = await browser.storage.local.get({
    usageStatCondition: "no monster",
    userId: "no monster",
    startTS: 0
  });
  if (userParams.usageStatCondition){//get data when the user click on the button.
    let activityType='open popup'
    let timestamp=Date.now()
    let userId=userParams.userId
    let startTS=userParams.startTS
    let activityData={
        'clickedElem':'extension icon',
        'otherdata':{
                  /*'numTrackers':numTrackers,
                  'numInferences':numInferences,
                  'numPages':numPages,
                  'pageTitle':pageTitle,
                  'trackers.length':trackers.length,
                  'topTracker':topTracker,
                  'topTrackerCount':topTrackerCount*/
                  }
                }
      //console.log("in send pop data")
      //console.log(activityData)
      background.logData(activityType, timestamp, userId, startTS, activityData)
  }

}

async  openDashboard() {
    const dashboardData = {
      active: true,
      url: '../dashboard/index.html'
    };
    browser.tabs.create(dashboardData);
    const background = await browser.runtime.getBackgroundPage();
    let userParams = await browser.storage.local.get({
      usageStatCondition: "no monster",
      userId: "no monster",
      startTS: 0
    });
    if (userParams.usageStatCondition){//get data when the user click on the button.
      let activityType='open dashboard'
      let timestamp=Date.now()
      let userId=userParams.userId
      let startTS=userParams.startTS
      let activityData={
          'clickedElem':'popup button',
          'otherdata':{}
        }
        //console.log("in send pop data")
        //console.log(activityData)
        background.logData(activityType, timestamp, userId, startTS, activityData);
  }
}

  render() {
    const {numTrackers, numInferences, numPages, pageTitle, trackers, topTracker, topTrackerCount} = this.state;
    //this.sendPopupData(numTrackers, numInferences, numPages, pageTitle, trackers, topTracker, topTrackerCount);
    return (
      <div>
        <div className="navbar">
          <div className="navbarTitle">Tracking Transparency</div>
        </div>

        <div className="content">
          {/* <p>The Tracking Transparency extension lets you learn about what companies could have inferrred about your browsing through trackers and advertisments on the web pages you visit.</p> */}

          {pageTitle &&
            <p>On <strong>{pageTitle},</strong> there are <strong>{trackers.length} trackers.</strong></p>
          }

          {topTracker &&
            <p>One of these trackers is <strong>{topTracker}</strong>, which knows about your activity on this page and <strong>{topTrackerCount}</strong> others.</p>
          }

          {numTrackers && numPages && numInferences &&
            <p>In total, <em>{numTrackers} trackers</em> have seen you visit <em>{numPages} pages</em>. The Tracking Transparency extension has determined that these companies could have inferred your interest in <em>{numInferences} topics</em>.</p>
          }

          <button type="button" className="btn btn-lt" onClick={this.openDashboard}>Show me more about what the trackers know</button>

        </div>
      </div>
    );
  }
}

ReactDOM.render(<Popup />, document.getElementById('root'));
