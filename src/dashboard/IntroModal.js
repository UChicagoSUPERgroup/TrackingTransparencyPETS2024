import React from 'react';
import { Link } from 'react-router-dom';
import {Panel, Grid, Row, Col, Modal, Button} from 'react-bootstrap';
const millisecondsInDay = 86400000;


const inferenceList = (data) => {
  console.log(data)
  return (
    <p>
      {data.map(p => (
        <span key={p.id}>
          <strong>{p["DISTINCT(inference)"]}</strong>
        </span>))
        .reduce((prev, curr) => [prev, ', ', curr])
      }
    </p>);
}

const trackerList = (data) => {
  return (<p>
    {data.map(p => (
      <span key={p.id}>
        <strong>{p.tracker}</strong>
      </span>))
     .reduce((prev, curr) => [prev, ', ', curr])
    }
    </p>);
  }

export default class IntroModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }


  async getData() {
    const background = await browser.runtime.getBackgroundPage();
    let args = {count: 5}

    const numPages = background.queryDatabase('getNumberOfPages', {});
    const numTrackers = background.queryDatabase('getNumberOfTrackers', {});
    const numInferences = background.queryDatabase('getNumberOfInferences', {});
    const recentInferences = background.queryDatabase('getInferencesByTime', args);
    const topTrackers = background.queryDatabase('getTrackers', args);

    // we use promises here instead of async/await because queries are not dependent on each other
    numPages.then(n => this.setState({numPages: n}));
    numTrackers.then(n => this.setState({numTrackers: n}));
    numInferences.then(n => this.setState({numInferences: n}));
    recentInferences.then(n => this.setState({recentInferences: n}))
    topTrackers.then(n => this.setState({topTrackers: n}))
  }

  async componentDidMount() {
    this.getData();
  }

  render() {
    const {numTrackers, numInferences, numPages, recentInferences, topTrackers} = this.state;
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Title closebutton="true"></Modal.Title>

        <Modal.Body>
          <h2>Welcome to Tracking Transparency!</h2>
          <p> When you browse the Internet, third-party trackers can see your browsing activity and sell this information to advertising companies. We hope this extension will help you understand who is tracking you and what they could have learned.</p>
          <p> In the last week, you visited <strong>{numPages} pages</strong> and encountered <strong>{numTrackers} trackers</strong>.</p>
          <hr />
          <h4> Your top 5 trackers: </h4>
          <p>{topTrackers ? trackerList(topTrackers) : ""}</p>
          <hr />
          <h4> Your top 5 inferred interests: </h4>
          <p> {recentInferences ? inferenceList(recentInferences) : ""} </p>
          <hr />
          <p>Continue to the homepage to learn more about the trackers you have encountered, what they might have learned about you, and more.</p>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.props.onHide}>Continue</Button>
        </Modal.Footer>
      </Modal>

      // <div>
      //   <h1> Welcome to Tracking Transparency!</h1>
      //   <p> When you browse the Internet, third-party trackers can see your browsing activity and sell this information to advertising companies. We hope this extension will help you understand who is tracking you and what they could have learned.</p>
      //   <p> In the last week, you visited <strong>{numPages} pages</strong> and encountered <strong>{numTrackers} trackers</strong>. </p>
      //   <p> The trackers that you have encountered most frequently are {topTrackers ? trackerList(topTrackers) : ""}.</p>
      //   <p> These companies could have inferred your interest in <strong>{numInferences} topics</strong>, like {recentInferences ? inferenceList(recentInferences) : ""} </p>
      //   <p>Continue to the Tracking Transparency homepage to learn more about the trackers you have encountered, what they might have learned about you, and more.</p>
      // </div>
    );
  }
}

export const WaitingDataIntro = () => (
  <div>
    <h1>Tracking Transparency</h1>
    <div className="homeText">
      <p>The Tracking Tranparency extension is currently running in the background to collect information about the trackers in your browsing.</p>
      <p>Continue using the internet and come back here in a few days to see what they might know about your browsing!</p>
    </div>
  </div>
)
