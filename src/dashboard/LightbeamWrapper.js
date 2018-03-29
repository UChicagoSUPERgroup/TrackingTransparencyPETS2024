import React from 'react';

class IFrame extends React.Component {
  // https://stackoverflow.com/a/33915153
  render() {
    return(
      <div>
        <iframe src={this.props.src} className='lightbeam-iframe'/>
      </div>
    )
  }
}

export default class LightbeamWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
       //console.log('logLeave', tabData);
       tabData = JSON.parse(tabData[x]);
       if (JSON.parse(userParams.usageStatCondition)){//get data when the user click on the button.
         let activityType='load lightbeam page';
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
    return (
      <div>
        <h1>Lightbeam</h1>
        <p>This is a visualization of how different trackers connect to each other.</p>
        <IFrame src={browser.runtime.getURL('lightbeam/index.html')} />
      </div>
    )
  }
}
