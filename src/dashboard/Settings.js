import React from 'react';

import { Link } from 'react-router-dom';
import { Modal, Button, Accordion, PanelGroup, Panel } from 'react-bootstrap';
import { FormGroup, FormControl, ControlLabel, Checkbox, Radio, HelpBlock } from 'react-bootstrap';

import logging from './dashboardLogging';

export class SettingsPage extends React.Component {
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
        <h1>Settings</h1>

        <h2>Customize Settings</h2>

        <PanelGroup accordion id="accordion-example" defaultActiveKey="1">
          <Panel eventKey="1">
            <Panel.Heading>
              <Panel.Title toggle>Install Tracker Blocker</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>
            Several browser extensions serve as tracker blockers. These extensions prevent advertisers and other third-party services from tracking where and what you browse. We recommend <a href="https://www.eff.org/privacybadger" target="_blank" rel="noopener noreferrer">Privacy Badger</a> or <a href="https://www.ghostery.com/" target="_blank" rel="noopener noreferrer">Ghostery</a>. Some ad-blocking services may have this feature as well.
            </Panel.Body>
            <Panel.Footer>
            <FormGroup>
              <Checkbox>I would enable this feature.</Checkbox>
            </FormGroup>
            </Panel.Footer>
          </Panel>
          <Panel eventKey="2">
            <Panel.Heading>
              <Panel.Title toggle>Opt-out cookies</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>
            Cookies are pieces of data maintained by the web browser to store information about the way you browse. They may be used to track you as well. You can disable cookie tracking by going to the advanced settings in your browser. This will still maintain cookies that keep track of your login information on various websites.
            </Panel.Body>
            <Panel.Footer>
            <FormGroup>
              <Checkbox>I would enable this feature.</Checkbox>
            </FormGroup>
            </Panel.Footer>
          </Panel>
          <Panel eventKey="3">
            <Panel.Heading>
              <Panel.Title toggle>Do not track preference</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>

            </Panel.Body>
            <Panel.Footer>
            <FormGroup>
              <Checkbox>I would enable this feature.</Checkbox>
            </FormGroup>
            </Panel.Footer>
          </Panel>
          <Panel eventKey="4">
            <Panel.Heading>
              <Panel.Title toggle>Data broker opt-out</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>
            Data brokers are third-parties that collect data about you when you use your browser. To prevent these third-parties from collecting information about you and remove any profiles they may already have of you, you can follow <a href="https://www.the-parallax.com/2016/04/07/how-to-clean-up-or-delete-data-brokers-profiles-of-you/" target="_blank" rel="noopener noreferrer">this article</a>.
            </Panel.Body>
            <Panel.Footer>
            <FormGroup>
              <Checkbox>I would enable this feature.</Checkbox>
            </FormGroup>
            </Panel.Footer>
          </Panel>
        </PanelGroup>

        <h2>Reset my Data</h2>
        <p>
        Reset your data by...
        </p>

        <h2>Reset my Data</h2>
        <p>
        Reset your data by...
        </p>

        <h2>Stop Tracking Transarency</h2>
        <p>
        Uninstall app by...
        </p>

        <h2>Help</h2>
        <p>
        To learn more about Tracking Transparency, please visit the <Link to="/info" target="_blank">info</Link> page.
        </p>
      </div>
    )
  }
}

export default SettingsPage;
