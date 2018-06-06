import React from 'react';

import logging from './dashboardLogging';

export class AboutPage extends React.Component {
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
    return (
      <div>
        <h1>About Tracking Transparency</h1>
        <p>
        Tracking is ubiquitous…
        </p>
        <h2>How it works</h2>
        <p>With this extension, we are trying to bring you more transparency about the world of
        online tracking, analytics, and advertising. We track the trackers by looking for trackers
        on all of the pages you visit while the extension is running. The extension keeps track of
        where and when you encountered these trackers. All of this information is used to show you
        personalized examples of how you interact with trackers in your normal activity.</p>
        <p> insert: how we know what trackers are</p>
        <p> insert: how we make inferences</p>
        <p> insert: limits of our approach</p>
        <p> insert: how it compares to other extensions- could be different approach</p>
        <h2>Your Privacy</h2>
        <p>To show you the data that other companies could gather about your browsing behavior, our
        extension logs your behavior and page visits in a local database on your computer. The extension also sends a limited number of anonymized statistics so we can understand how people are using the extension. We send information about ???, ???, and ???. The specific websites you visit and your browsing history never leave your computer and are not shared in any way. The statistics collected will only be accessed by the University of Chicago research team. We may publish aggregate statistics and findings from the reported data, but will never sell or share your data. (TODO confirm that we can actually say we will *never* share)</p>
        <h2>Who We Are</h2>
        <p>The Tracking Transparency extension was built by a research team at the <a href="https://super.cs.uchicago.edu" target="_blank" rel="noopener noreferrer">University of Chicago SUPERgroup</a>. [Insert research team]. The project is advised by Blase Ur at the University of Chicago, Michelle L. Mazurek at the University of Maryland, and Lorrie Faith Cranor at Carnegie Mellon University.</p>
        <p>Should you have any questions about the plugin or our associated research, you may email the research team at <a href="mailto:trackingtransparency@super.cs.uchicago.edu">trackingtransparency@super.cs.uchicago.edu</a>.</p>
        <p>Our extension is open source, and the code is available under a free license at <a href="https://github.com/UChicagoSUPERgroup/trackingtransparency" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
      </div>
    )
  }
}

export default AboutPage;
