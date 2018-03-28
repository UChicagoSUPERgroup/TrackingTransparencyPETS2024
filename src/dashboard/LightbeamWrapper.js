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
       if (JSON.parse(userParams.usageStatCondition)){//get data when the user click on the button.
         let activityType='load lightbeam page';
         let timestamp=Date.now();
         let userId=userParams.userId;
         let startTS=userParams.startTS;
         let activityData={}
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
