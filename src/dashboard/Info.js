import React from 'react';
import { Link } from 'react-router-dom'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'

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
      <Text>
        <Heading level="h1">About Tracking Transparency</Heading>
        <p>
          Tracking Transparency shows how you interact with trackers when you browse online.
        </p>
        <p>
          When you browse online, your online activity is tracked by the website you are visiting, as well as by third-party advertising and analytics companies. These third-party companies use these logs of browsing behavior to infer your interests, preferences, and demographics. They can then tailor your internet experience in part based on those inferences, impacting the search results, ads, and social feeds that you see.
        </p>
        <p>
          For example, if you visit a blog about traveling with dogs, a third-party tracker on that site could infer that you are interested in dogs. Later, you might encounter an ad that was targeted specifically to dog-lovers.
        </p>

        <Heading level="h2">How the extension works</Heading>
        <p>
          With this extension, we hope to bring you more transparency about the world of online tracking, analytics, and advertising. We track the trackers by looking for trackers on all of the pages you visit while the extension is running. The extension keeps track of
          where and when you encountered these trackers. All of this information is used to show you personalized examples of how you interact with trackers during your normal browsing habits.
        </p>
        <p>
          Tracking Transparency runs in the background while you browse online to collect information about these online trackers.
        </p>
        <p>
        We collect information about:
          <ul>
            <li>Which websites you visit</li>
            <li>Which trackers are on these websites</li>
          </ul>
        Using this information, we show you:
          <ul>
            <li>Which <Link to="/trackers" target="_blank">trackers</Link> have tracked you </li>
            <li>Which <Link to="/inferences" target="_blank">inferences</Link> have been made about you based on the tracking</li>
            <li>When inferences have been made about you during your <Link to="/activity" target="_blank">recent activity</Link></li>
          </ul>
        </p>

        <Heading level="h2">Your privacy</Heading>
        <p>
          The data that Tracking Transparency collects about you is securely stored in your local browser. Your data is never sent to another server, so not even the researchers and developers of Tracking Transparency have access to your data.
        </p>
        <p>
          To show you the data that other companies could gather about your browsing behavior, our extension logs your behavior and page visits in a local database on your computer. The extension also sends a limited number of anonymized statistics so we can understand how people are using the extension. We send information about ???, ???, and ???. The specific websites you visit and your browsing history never leave your computer and are not shared in any way. The statistics collected will only be accessed by the University of Chicago research team. We may publish aggregate statistics and findings from the reported data, but will never sell or share your data. (TODO confirm that we can actually say we will *never* share)
        </p>

        <Heading level="h2">Who we are</Heading>
        <p>The Tracking Transparency extension was built by a research team at the <a href="https://super.cs.uchicago.edu" target="_blank" rel="noopener noreferrer">University of Chicago SUPERgroup</a>. The project is advised by Blase Ur at the University of Chicago, Michelle L. Mazurek at the University of Maryland, and Lorrie Faith Cranor at Carnegie Mellon University.</p>
        <p>Should you have any questions about the plugin or our associated research, you may email the research team at <a href="mailto:trackingtransparency@super.cs.uchicago.edu">trackingtransparency@super.cs.uchicago.edu</a>.</p>
        <p>Our extension is open source, and the code is available under a free license at <a href="https://github.com/UChicagoSUPERgroup/trackingtransparency" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
      </Text>
    )
  }
}

export default InfoPage;
