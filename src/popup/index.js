import React from 'react';
import ReactDOM from 'react-dom';

import '../styles/common.css';
import '../styles/popup.css';
import '../styles/button.css';
import '../styles/navbar2.css';

import logging from '../dashboard/dashboardLogging';

class Popup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    }
    //this.sendPopupData = this.sendPopupData.bind(this);
    this.openDashboard = this.openDashboard.bind(this);
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
  }

async  openDashboard() {
    //console.log('I am here 1');
    const tabs = await browser.tabs.query({active: true, currentWindow: true});
    let tabId = tabs[0].id;
    const dashboardData = {
      active: true,
      url: '../dashboard/index.html',
      openerTabId: parseInt(tabId)
    };

    const tabData = JSON.parse(this.state.tab);
    await browser.tabs.create(dashboardData);
    const background = await browser.runtime.getBackgroundPage();

    let activityType= 'click dashboard button on popup';
    let clickedElem = 'dashboard button';
    await logging.logPopupActions(activityType, clickedElem);
}

  async componentDidMount() {
    /*comment this next line if you want to off logging data
    Also preserve the order if you want the log, since sometimes getData fails
    and sendPopupData will not run
    */
    await logging.logPopupActions('open popup', 'extension icon');
    await this.getData();
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
