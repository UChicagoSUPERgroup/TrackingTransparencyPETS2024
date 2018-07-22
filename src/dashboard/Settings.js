import React from 'react'

import Panel from 'react-bootstrap/lib/Panel';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Button from '@instructure/ui-buttons/lib/components/Button'

import logging from './dashboardLogging'

// function onCanceled(error) {
//   console.log(`Canceled: ${error}`);
// }
//
// function uninstallTrackingTransparency() {
//   var uninstalling = browser.management.uninstallSelf({
//     showConfirmDialog: true,
//     dialogMessage: "Testing self-uninstall"
//   });
//   uninstalling.then(null, onCanceled);
// }

const resetInfo = (
  <Text>
    <Heading level='h2'>Reset my data</Heading>
      <p>
        If you wish to reset all data currently being stored by Tracking Transparency, click the button below.
      </p>
    <Button variant='danger'>Reset all data</Button>
  </Text>
)

const uninstallInfo = (
  <Text>
    <Heading level='h2' margin='medium 0 0 0'>Stop Tracking Transparency</Heading>
      <p>
        You can stop participating at any time by uninstalling Tracking Transparency. To uninstall, click the button below. No further data will be set after the extension is uninstalled.
      </p>
    <Button variant='danger'>Uninstall extension</Button>
  </Text>
)

export class SettingsPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  async componentDidMount () {
    let activityType = 'load dashboard settings page'
    logging.logLoad(activityType, {})
  }

  render () {
    const {numTrackers, numInferences, numPages} = this.state
    return (
      <Text>
        <Heading level='h1' margin='0 0 medium'>Settings</Heading>

        <Heading level='h2'>Take Action</Heading>
        <Text>
          <p>We hope that you have learned something about online tracking by using our extension.</p>
          <p>Indicate your preferences here about topics related to online tracking and consumer transparency. Your selections here will <strong>not</strong> change the operation of your browser, but will help us continue our work. We may add your selections as features in the future.</p>
        </Text>

        <Panel id='collapsible-panel-example-2'>
          <Panel.Heading>
            <Panel.Title toggle>
              Tracking
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

        <Panel id='collapsible-panel-example-2'>
          <Panel.Heading>
            <Panel.Title toggle>
              Inferencing
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

        <Panel id='collapsible-panel-example-2'>
          <Panel.Heading>
            <Panel.Title toggle>
              Installing Tracker Blockers
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              Several browser extensions serve as tracker blockers. These extensions prevent advertisers and other third-party services from tracking where and what you browse. We recommend <a href='https://www.eff.org/privacybadger' target='_blank' rel='noopener noreferrer'>Privacy Badger</a> or <a href='https://www.ghostery.com/' target='_blank' rel='noopener noreferrer'>Ghostery</a>. Some ad-blocking services may have this feature as well.
              <ListGroupItem>
              I would use a tracker blocker.
              </ListGroupItem>
              <ListGroupItem>
              I would not use a tracker blocker.
              </ListGroupItem>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>

        <Panel id='collapsible-panel-example-2'>
          <Panel.Heading>
            <Panel.Title toggle>
              Cookies
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              Cookies are pieces of data maintained by the web browser to store information about the way you browse. They may be used to track you as well. Each advertiser gives you the option to disable cookie tracking. You can learn more  <a href='http://optout.aboutads.info/?c=2#!/' target='_blank' rel='noopener noreferrer'>here</a>.
              <ListGroupItem>
              I would block cookies.
              </ListGroupItem>
              <ListGroupItem>
              I would not block cookies.
              </ListGroupItem>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>

        <Panel id='collapsible-panel-example-2'>
          <Panel.Heading>
            <Panel.Title toggle>
              Do Not Track (DNT) setting
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

        <Panel id='collapsible-panel-example-2'>
          <Panel.Heading>
            <Panel.Title toggle>
              Data Broker Profiles
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              Data brokers are third-parties that collect data about you when you use your browser. To prevent these third-parties from collecting information about you and remove any profiles they may already have of you, you can follow <a href='https://www.the-parallax.com/2016/04/07/how-to-clean-up-or-delete-data-brokers-profiles-of-you/' target='_blank' rel='noopener noreferrer'>this article</a>.
              <ListGroupItem>
              I would adjust the profile that data brokers have about me.
              </ListGroupItem>
              <ListGroupItem>
              I would not adjust the profile that data brokers have about me.
              </ListGroupItem>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>

        {resetInfo}

        {uninstallInfo}

      </Text>
    )
  }
}

export default SettingsPage
