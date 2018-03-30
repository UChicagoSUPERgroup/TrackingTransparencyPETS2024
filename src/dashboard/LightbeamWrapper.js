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
        <p>Lightbeam is an add-on that enables you to see connections between the first and third party sites you interact with on the Web.</p>
        <p>The web below is interactive: click and drag on icons to try to untangle the web!</p>
        <p>A circle icon represents a site that you have visted, and a triangle icon represents a third party that has seen you online. </p>
        <ul>
          <li>A circle icon with many connections is a site you have visited that has lots of third party sites active on it.</li>
          <li>A triangle icon with many connections is a third party site that has seen you on many different sites online.</li>
        </ul>
        <p>Learn more at <a href="https://addons.mozilla.org/en-US/firefox/addon/lightbeam/">Mozilla</a>.</p>
        <IFrame src={browser.runtime.getURL('lightbeam/index.html')} />
      </div>
    )
  }
}
