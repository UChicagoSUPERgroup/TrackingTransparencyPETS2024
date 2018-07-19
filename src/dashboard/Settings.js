import React from 'react';

import { Link } from 'react-router-dom';
import { Modal, Button, Accordion, PanelGroup, Panel , ListGroup, ListGroupItem} from 'react-bootstrap';
import { FormGroup, FormControl, ControlLabel, Checkbox, Radio, HelpBlock } from 'react-bootstrap';

import logging from './dashboardLogging';

export class SettingsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  async componentDidMount() {
    let activityType='load dashboard settings page';
    logging.logLoad(activityType, {});
  }

  render() {
    const {numTrackers, numInferences, numPages} = this.state;
    return (
      <div>
        <h1>Settings</h1>

        <h2>Reset my Data</h2>
        <p>
          Reset your data by...
        </p>

        <h2>Stop Tracking Transarency</h2>
        <p>
          You can uninstall Tracking Transparency by visiting your respective browser&#39;s settings or customize tabs, similar to how you installed the extension.
        </p>

        <h2>Help</h2>
        <p>
          To learn more about Tracking Transparency, please visit the <Link to="/info" target="_blank">info</Link> page.
        </p>

        <h2>Take Action</h2>
        <p>
          We hope that you have learned something about online tracking by using our extension.
        <br/>
        <br/>
          Indicate your preferences here about online tracking and consumer transparency. Your selections here will <strong>not</strong> change the operation of your browser, but will help us continue our work. We may add your selections as features in the future.
        <br/>
        </p>

        <Panel id="collapsible-panel-example-2">
          <Panel.Heading>
            <Panel.Title toggle>
              tracking to provide relevant advertisements?
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
            <ListGroup>
              <ListGroupItem>
              I want no tracking, even if I won't see any relevant advertisements
              </ListGroupItem>
              <ListGroupItem>
              I'm okay with some tracking, if it means that I will see advertisements relevant to me
              </ListGroupItem>
              <ListGroupItem>
              I'm okay with all tracking because I want to see advertisements relevant to me
              </ListGroupItem>
            </ListGroup>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>

        <Panel id="collapsible-panel-example-2">
          <Panel.Heading>
            <Panel.Title toggle>
              your control over inferences made about you?
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              <ListGroupItem>
              I would opt-out of all inferencing
              </ListGroupItem>
              <ListGroupItem>
              I would only want non-sensitive inferencing
              </ListGroupItem>
              <ListGroupItem>
              Any and all inferencing is fine
              </ListGroupItem>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>

        <Panel id="collapsible-panel-example-2">
          <Panel.Heading>
            <Panel.Title toggle>
              installing tracker blockers?
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              Several browser extensions serve as tracker blockers. These extensions prevent advertisers and other third-party services from tracking where and what you browse. We recommend <a href="https://www.eff.org/privacybadger" target="_blank" rel="noopener noreferrer">Privacy Badger</a> or <a href="https://www.ghostery.com/" target="_blank" rel="noopener noreferrer">Ghostery</a>. Some ad-blocking services may have this feature as well.
              <ListGroupItem>
              I would use a tracker blocker.
              </ListGroupItem>
              <ListGroupItem>
              I would not use a tracker blocker.
              </ListGroupItem>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>

        <Panel id="collapsible-panel-example-2">
          <Panel.Heading>
            <Panel.Title toggle>
              opting out of cookies?
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              Cookies are pieces of data maintained by the web browser to store information about the way you browse. They may be used to track you as well. Each advertiser gives you the option to disable cookie tracking. You can learn more  <a href="http://optout.aboutads.info/?c=2#!/" target="_blank" rel="noopener noreferrer">here</a>.
              <ListGroupItem>
              I would block cookies.
              </ListGroupItem>
              <ListGroupItem>
              I would not block cookies.
              </ListGroupItem>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>

        <Panel id="collapsible-panel-example-2">
          <Panel.Heading>
            <Panel.Title toggle>
              using the Do Not Track (DNT) setting?
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              Do Not Track (DNT) is a browser setting that sends the request <q> don&#39;t want to be tracked</q> with every website you visit. it’s like a setting in your browser preferences. However, few companies respect this request.
              <ListGroupItem>
              I would enable DNT.
              </ListGroupItem>
              <ListGroupItem>
              I would not enable DNT.
              </ListGroupItem>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>

        <Panel id="collapsible-panel-example-2">
          <Panel.Heading>
            <Panel.Title toggle>
              adjusting data brokers' profile of you?
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              Data brokers are third-parties that collect data about you when you use your browser. To prevent these third-parties from collecting information about you and remove any profiles they may already have of you, you can follow <a href="https://www.the-parallax.com/2016/04/07/how-to-clean-up-or-delete-data-brokers-profiles-of-you/" target="_blank" rel="noopener noreferrer">this article</a>.
              <ListGroupItem>
              I would adjust the profile that data brokers have about me.
              </ListGroupItem>
              <ListGroupItem>
              I would not adjust the profile that data brokers have about me.
              </ListGroupItem>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>

      </div>
    )
  }
}

export default SettingsPage;
