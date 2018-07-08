import React from 'react';
import { Link } from 'react-router-dom';
import {Panel, Grid, Row, Col} from 'react-bootstrap';
const millisecondsInDay = 86400000;


const inferenceList = (data) => {
  return (
    <div>
      {data.map(function(dataValue) {
        let key = dataValue["DISTINCT(inference)"]
        return (<span key={key}>
          <Link to={{pathname: '/inferences/' + key}}>
             {key},&nbsp;
          </Link>
        </span>);
      })}
    </div>
  )
}

const trackerList = (data) => {
  return (<div>
      {data.map(p => <span key={p.id}>{p.tracker}</span>)     // get just tracker name
           .reduce((prev, curr) => [prev, ', ', curr])        // comma-delimit
      }
    </div>);
  }


export class Intro extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
    //this.logClick = this.logClick.bind(this);
    //this.logLoad = this.logLoad.bind(this);
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
    //this.logLoad(); //will directly load it in App.js
  }

  render() {
    const {numTrackers, numInferences, numPages, recentInferences, topTrackers} = this.state;
    return (
      <div>
        <h1> Welcome to Tracking Transparency!</h1>
        <p> When you browse the Internet, you will encounter trackers online that track your browsing activity. In the last week, you visited <strong>{numPages} pages</strong> and encountered <strong>{numTrackers} trackers</strong>. </p>
        <p> The trackers that you have encountered most frequently are {topTrackers ? trackerList(topTrackers) : ""}.</p>
        <p> These companies could have inferred your interest in <strong>{numInferences} topics</strong>, like {recentInferences ? inferenceList(recentInferences) : ""} </p>
        <p>Continue to the Tracking Transparency homepage to learn more about the trackers you have encountered, what they might have learned about you, and more.</p>
      </div>
    )
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
