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
  }

  async componentDidMount() {
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
