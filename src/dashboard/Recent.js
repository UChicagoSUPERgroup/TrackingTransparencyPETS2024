import React from 'react';
import { Route, Link } from 'react-router-dom';
// import { LinkContainer } from 'react-router-bootstrap';
import tt from '../helpers';

import PagesTimeChart from './PagesTimeChart';
import PagesTimeScatterplot from './PagesTimeScatterplot';


export default class RecentPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      domains: []
    }
  this.logLoad = this.logLoad.bind(this);
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
      let tabData = await browser.storage.local.get({[x]: "no favicon"});
      tabData = JSON.parse(tabData[x]);
      if (JSON.parse(userParams.usageStatCondition)){//get data when the user click on the button.
        let activityType='load dashboard recent activity page';
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
    const background = await browser.runtime.getBackgroundPage();
    const timestamps = background.queryDatabase('getTimestamps', {});
    this.logLoad();
    timestamps.then(ts => {
      const times = ts.map(x => (
        (new Date(x.id))
      ));
      this.setState({
        timestamps: times
      });
    });
  }

  render() {
    const {timestamps} = this.state;
    return(
      <div>
        <h1>Recent Activity</h1>

        <Route exact path={this.props.match.url} render={() => (
          <div>
            {timestamps && <PagesTimeChart timestamps={timestamps}/>}
            <br/>
            {timestamps && <PagesTimeScatterplot timestamps={timestamps}/>}
          </div>
        )}/>


      </div>
    );
  }
}
