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

export default class Lightbeam extends React.Component {
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
        <IFrame src={browser.runtime.getURL('lightbeam/index.html')} />
      </div>
    )
  }
}