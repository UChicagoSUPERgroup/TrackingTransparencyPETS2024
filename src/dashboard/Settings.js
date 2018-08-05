import React from 'react'

import Panel from 'react-bootstrap/lib/Panel';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Button from '@instructure/ui-buttons/lib/components/Button'

import TTOptions from '../options/TTOptions'
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
    <Heading level='h2' margin='medium 0 0 0'>Reset my data</Heading>
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
    return (
      <div>
        <Heading level='h1' margin='0 0 medium 0'>Settings</Heading>
        <TTOptions />
        <Text>
          {resetInfo}
          {uninstallInfo}
        </Text>
      </div>
    )
  }
}

export default SettingsPage
