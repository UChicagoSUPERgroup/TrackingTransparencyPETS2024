import React from 'react'
import ReactDOM from 'react-dom'

import theme from '@instructure/ui-themes/lib/canvas'
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import TextInput from '@instructure/ui-forms/lib/components/TextInput'
import Button from '@instructure/ui-buttons/lib/components/Button'
import Link from '@instructure/ui-elements/lib/components/Link'
import Table from '@instructure/ui-elements/lib/components/Table'
import ScreenReaderContent from '@instructure/ui-a11y/lib/components/ScreenReaderContent'

import logging from '../dashboard/dashboardLogging'
import { themeOverrides } from '../colors'

theme.use({ overrides: themeOverrides })

const styles = {}

styles.container = {
  width: '90%',
  maxWidth: '800px',
  marginLeft: 'auto',
  marginRight: 'auto'
}

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')

class WelcomePage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {

    }
    this.toggleExtensionEnabled = this.toggleExtensionEnabled.bind(this)
  }

  async componentDidMount () {
    const background = await browser.runtime.getBackgroundPage()
    const adblockers = await background.getAdblockers()
    this.setState({ adblockers })
  }

  onMTurkCodeInput (event) {
    browser.storage.local.set({ mturkcode: event.target.value})
  }

  async toggleExtensionEnabled (e) {
    const id = e.target.value
    const checked = e.target.checked
    const background = await browser.runtime.getBackgroundPage()
    await background.setExtEnabled(id, checked)
    const adblockers = await background.getAdblockers()
    this.setState({ adblockers })
  }

  renderAdblockTable () {
    const { adblockers } = this.state
    if (!adblockers || adblockers.length === 0) {
      return null
    }

    return (
      <div>
        <Heading margin='large 0 medium 0'>Conflicting extensions</Heading>
        <Text>
          This extension works by collecting information about which trackers and advertisments are on the web pages you visit. As such, having an ad blocker or tracker blocker installed can prevent our extension from collecting the data needed to visualize your web browsing.
          {!isFirefox && " We have detected that you have the following ad or tracker blockers enabled, we would recommend that you disable them using the switches below."}
          {isFirefox && " We have detected that you have the following ad or tracker blockers enabled, we would recommend that you disable them on the addons settings age."}
        </Text>
        <Table
          caption={<ScreenReaderContent>Installed ad or tracker blockers</ScreenReaderContent>}
        >
          <thead>
            <tr>
              <th scope='col'>Name</th>
              {!isFirefox && <th scope='col'>Enabled</th>}
            </tr>
          </thead>
          <tbody>
            {adblockers.map(ext => (
              <tr key={ext.id}>
                <td>{ext.name}</td>
                {!isFirefox && <td>
                  <Checkbox
                    label={<ScreenReaderContent>Checkbox to enable/disable {ext.name}</ScreenReaderContent>}
                    value={ext.id}
                    checked={ext.enabled}
                    onChange={this.toggleExtensionEnabled}
                    variant='toggle'
                  />
                </td>}
              </tr>
            ), this)}
          </tbody>
        </Table>
        {isFirefox && <Button onClick={() => window.open('about:addons', '_blank')}>Open add-ons settings</Button>}
        TODO ADD FF DIRECTIONS
      </div>
    )
  }

  render () {
    return (
      <div>
        <div className='container' style={styles.container}>
          <img src='/icons/super.svg' height='120px' />

          <Heading margin='large 0 medium 0'>About the extension</Heading>
          <Text>
            <p>This browser extension is a software tool that visualizes aspects of your web browsing. To access the extension, click on the icon in the corner of the upper right of your browser window. </p>
            <img src='/icons/extension-toolbar.png' width='700px' style={{border: '1px solid black'}} />
            <p>The extension icon will appear in the upper right corner for Chrome as well as Firefox users. </p>
          </Text>
          <Heading margin='large 0 medium 0'>Data collection</Heading>
          <Text>
            <p>As described in the consent form, this browser extension will store data about your web browsing on your own computer. This detailed data will not leave your computer and will not be shared with the researchers. The extension will send non-identifiable metadata and your survey responses to the researchers. At the end of the study, we will provide detailed instructions for uninstalling this browser extension.</p>
          </Text>
          {this.renderAdblockTable()}
          <Heading margin='large 0 medium 0'>Activation</Heading>
          <Text>
            <p>To activate our browser extension, please enter the activation code that is displayed at the end of the survey:</p>
            <TextInput label='' placeholder='activation code from MTurk' onChange={this.onMTurkCodeInput} />
            <p>By clicking continue, you indicate that you accept the consent form and will be taken to the extension homepage.</p>
          </Text>

          <Button variant='primary' type='submit' href='/dist/dashboard.html'>
              Continue
          </Button>
        </div>

      </div>
    )
  }
}

ReactDOM.render(<WelcomePage />, document.getElementById('root'))
