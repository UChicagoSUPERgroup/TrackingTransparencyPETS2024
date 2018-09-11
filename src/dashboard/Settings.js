import React from 'react'

import Button from '@instructure/ui-buttons/lib/components/Button'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'

import logging from './dashboardLogging'
import TTPanel from './components/TTPanel'
import UserstudyOptionsUI from '../options/UserstudyOptionsUI'

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
  <TTPanel margin='medium 0 medium 0'>
    <Text>
      <Heading level='h2'>Reset my data</Heading>
      <p>
        If you wish to reset all data currently being stored by Tracking Transparency, click the button below.
      </p>
      <Button variant='danger'>Reset all data</Button>
    </Text>
  </TTPanel>
)

const uninstallInfo = (
  <TTPanel margin='medium 0 medium 0'>
    <Text>
      <Heading level='h2'>Stop Tracking Transparency</Heading>
      <p>
        You can stop participating at any time by uninstalling Tracking Transparency. To uninstall, click the button below. No further data will be set after the extension is uninstalled.
      </p>
      <Button variant='danger'>Uninstall extension</Button>
    </Text>
  </TTPanel>
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
        <Heading level='h1'>Settings</Heading>
        <TTPanel margin='medium 0 medium 0'>
          <UserstudyOptionsUI />
        </TTPanel>
        {resetInfo}
        {uninstallInfo}
      </div>
    )
  }
}

export default SettingsPage
