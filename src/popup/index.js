import React from 'react';
import ReactDOM from 'react-dom';

import '../styles/common.css';
import '../styles/popup.css';


class Popup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      
    }
  }

  async componentDidMount() {
    this.getData();
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

    const tabs = await browser.tabs.query({active: true, lastFocusedWindow: true});
    const tab = tabs[0];

    // get tab data with trackers and stuff here
    const tabData = await background.getTabData(tab.id);
    tabData.then(data => {
      let title = data.title;
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
    })
    
  }
  

  openDashboard() {
    const dashboardData = {
      active: true,
      url: '../dashboard/index.html'
    };
    browser.tabs.create(dashboardData);
  }

  render() {
    const {numTrackers, numInferences, numPages, pageTitle, trackers, topTracker, topTrackerCount} = this.state;

    return (
      <div>        
        <p className="popup-header">Tracking Transparency</p>

        <p>The Tracking Transparency extension lets you learn about what companies could have inferrred about your browsing through trackers and advertisments on the web pages you visit.</p>

        {trackers && 
          <p>On <strong>{pageTitle},</strong> there are <strong>{trackers.length} trackers.</strong></p>
        }

        {topTracker && 
          <p>One of these trackers is <strong>{topTracker}</strong>, which knows about your activity on this page and <strong>{topTrackerCount}</strong> others.</p>
        }

        {numTrackers &&
          <p>In total, <em>{numTrackers} trackers</em> have seen you visit <em>{numPages} pages</em>. The Tracking Transparency extension has determined that these companies could have inferred your interest in <em>{numInferences} topics</em>.</p>
        }  
          
        <button type="button" onClick={this.openDashboard}>Show me more about what the trackers know</button>
      </div>     
    );
  }
}

ReactDOM.render(<Popup />, document.getElementById('root'));
