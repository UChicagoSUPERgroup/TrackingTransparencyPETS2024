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
        <h1>Your Tracker Network</h1>
        <p>Your Tracker Network is a visualization of the connections between the first and third party sites you have interacted with on the Web.</p>
        <p>The web below is interactive: click and drag on icons to try to untangle the web!</p>
        <p>A circle icon represents a site that you have visted, and a triangle icon represents a third party that has seen you online. </p>
        <ul>
          <li>A circle icon with many connections is a site you have visited that has lots of third party sites active on it.</li>
          <li>A triangle icon with many connections is a third party site that has seen you on many different sites online.</li>
        </ul>
      </div>
    )
  }
}
