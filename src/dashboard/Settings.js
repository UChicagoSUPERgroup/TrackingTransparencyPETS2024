import React from 'react'

import Button from '@instructure/ui-buttons/lib/components/Button'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'

import logging from './dashboardLogging'
import TTPanel from './components/TTPanel'

// function onCanceled(error) {
//   console.log(`Canceled: ${error}`);
// }
//

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

  async resetOnClick() {
    const background = await browser.runtime.getBackgroundPage()
    await background.resetAllData()
  }

  uninstallOnClick() {
      var uninstalling = browser.management.uninstallSelf({
        showConfirmDialog: true
      })
      uninstalling.then(null, onCanceled)
  }

  resetInfo () {
    return (
      <TTPanel margin='medium 0 medium 0'>
        <Text>
          <Heading level='h2'>Reset my data</Heading>
          <p>
            If you wish to reset all data currently being stored by {EXT.NAME}, click the button below.
          </p>
          <Button variant='danger' onClick={this.resetOnClick}>Reset all data</Button>
        </Text>
      </TTPanel>
    )
  }

  uninstallInfo () {
    return (
      <TTPanel margin='medium 0 medium 0'>
        <Text>
          <Heading level='h2'>Stop {EXT.NAME}</Heading>
          <p>
            You can stop participating at any time by uninstalling {EXT.NAME}. To uninstall, click the button below. No further data will be set after the extension is uninstalled.
          </p>
          <Button variant='danger' onClick={this.uninstallOnClick}>Uninstall extension</Button>
        </Text>
      </TTPanel>
    )
  }

  render () {
    return (
      <div>
        <Heading level='h1'><strong>Settings</strong></Heading>
        {this.resetInfo()}
        {this.uninstallInfo()}
      </div>
    )
  }
}

export default SettingsPage
