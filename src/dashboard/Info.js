import React from 'react';

import { Link } from 'react-router-dom'

// import InferencesPage from './Inferences';
// import TrackersList from './Trackers';
// import FirstPartyList from  './FirstParties';
// import RecentPage from './Recent';

import logging from './dashboardLogging';

export class InfoPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  async componentDidMount() {
    let activityType='load dashboard about page';
    logging.logLoad(activityType, {});
  }

  render() {
    const {numTrackers, numInferences, numPages} = this.state;
    return (
      <div>
        <h1>About</h1>
        <p>
        Tracking Transparency shows how you interact with trackers when you browse online.
        </p>
        <h2>Tracking</h2>
        <p>
        When you browse online, third-parties may track your browsing history, email interactions, and website visitors, usually for marketing and advertising purposes. For example, when you visit a site <a href="" target="_blank">foo.com</a>, an online tracker <b>bar</b> may collect what websites and other things you visit on that page.
        </p>

        <h2>Tracking Transparency</h2>
        <p>
        Tracking Transparency is always running when your browse online, in the background, to collect information about these online trackers.
        </p>
        <p>
        We collect information about:
        <ul>
        <li>What websites you visit</li>
        <li>What trackers are on these websites</li>
        </ul>
        From this collected information, we provide information on:
        <ul>
        <li>Which <Link to="/trackers" target="_blank">trackers</Link> have tracked you </li>
        <li>Which <Link to="/inferences" target="_blank">inferences</Link> have been made about you based on the tracking</li>
        <li>What your <Link to="/recent" target="_blank">browsing activity</Link> has been</li>
        </ul>
        </p>

        <h2>Details</h2>

        <h3>Your Privacy</h3>
        <p>
        The data Tracking Transparency collects about you is securely stored on your local browser. Your data is never sent to another server, so not even the team of researchers has access to your data.
        </p>

        <h3>How we Track the Trackers</h3>
        <p>
        We track the trackers by...
        </p>

        <h3>How we Make Inferences</h3>
        <p>
        We make inferences by...
        </p>

        <h3>Who we are</h3>
        <p>
        The Tracking Transparency extension was built by a team within the <a href="https://super.cs.uchicago.edu" target="_blank" rel="noopener noreferrer">University of Chicago SUPERgroup</a>. It was developed by Ben Weinshel, Claire Dolin, Shawn Shan, Euirim Choi, and Aaron Goldman. The project is advised by Prof. Blase Ur at the University of Chicago, Prof. Michelle L. Mazurek at the University of Maryland, and Lorrie Faith Cranor at Carnegie Mellon University.
        </p>
        <p>Our source code is available on <a href="https://github.com/UChicagoSUPERgroup/trackingtransparency" target="_blank" rel="noopener noreferrer">GitHub</a>.
        </p>
      </div>
    )
  }
}

export default InfoPage;
