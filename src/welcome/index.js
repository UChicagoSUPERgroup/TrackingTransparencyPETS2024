import React from 'react'
import ReactDOM from 'react-dom'

import theme from '@instructure/ui-themes/lib/canvas'
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Link from '@instructure/ui-elements/lib/components/Link'
import TextInput from '@instructure/ui-forms/lib/components/TextInput'
import Button from '@instructure/ui-buttons/lib/components/Button'
import Table from '@instructure/ui-elements/lib/components/Table'
import ScreenReaderContent from '@instructure/ui-a11y/lib/components/ScreenReaderContent'

import logging from '../dashboard/dashboardLogging'
import { themeOverrides } from '../colors'
import instrumentation from '../background/instrumentation';
import loggingDefault from '../options/loggingDefault'

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
    this.onMTurkCodeInput = this.onMTurkCodeInput.bind(this)
    this.onSave = this.onSave.bind(this)
  }

  async componentDidMount () {
    const background = await browser.runtime.getBackgroundPage()
    const adblockers = await background.getAdblockers()
    this.setState({ adblockers })
  }

  onMTurkCodeInput (event) {
    this.setState({
      mturkcode: event.target.value
    })
  }

  async onSave () {
    await browser.storage.local.set({ mturkcode: this.state.mturkcode })
    // TODO do more stuff here
    loggingDefault.setLoggingDefault()
    instrumentation.firstInstall()
    window.location.href = '/dist/dashboard.html'
  }

  async toggleExtensionEnabled (e) {
    const id = e.target.value
    const checked = e.target.checked
    const background = await browser.runtime.getBackgroundPage()
    await background.setExtEnabled(id, checked)
    const adblockers = await background.getAdblockers()
    this.setState({ adblockers })
  }

  // renderAdblockTable () {
  //   const { adblockers } = this.state
  //   if (!adblockers || adblockers.length === 0) {
  //     return null
  //   }

  //   return (
  //     <div>
  //       <Heading margin='large 0 medium 0'>Conflicting extensions</Heading>
  //       <Text>
  //         This extension works by collecting information about which trackers and advertisments are on the web pages you visit. As such, having an ad blocker or tracker blocker installed can prevent our extension from collecting the data needed to visualize your web browsing.
  //         {!isFirefox && ' We have detected that you have the following ad or tracker blockers enabled, and recommend that you disable them using the switches below.'}
  //         {isFirefox && ' We have detected that you have the following ad or tracker blockers enabled, and recommend that you disable them on the add-ons settings page.'}
  //       </Text>
  //       <Table
  //         caption={<ScreenReaderContent>Installed ad or tracker blockers</ScreenReaderContent>}
  //       >
  //         <thead>
  //           <tr>
  //             <th scope='col'>Name</th>
  //             {!isFirefox && <th scope='col'>Enabled</th>}
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {adblockers.map(ext => (
  //             <tr key={ext.id}>
  //               <td>{ext.name}</td>
  //               {!isFirefox && <td>
  //                 <Checkbox
  //                   label={<ScreenReaderContent>Checkbox to enable/disable {ext.name}</ScreenReaderContent>}
  //                   value={ext.id}
  //                   checked={ext.enabled}
  //                   onChange={this.toggleExtensionEnabled}
  //                   variant='toggle'
  //                 />
  //               </td>}
  //             </tr>
  //           ), this)}
  //         </tbody>
  //       </Table>
  //       {isFirefox && <Text><p>You can disable these add-ons by clicking on the <strong>menu icon</strong> in the top-right corner of your browser window, then clicking <strong>Add-ons</strong>. When the add-ons page opens, click on the <strong>Add-ons</strong> section on the left, and then find the add-ons listed above and clicking <strong>Disable</strong> for each of them.</p></Text>}
  //     </div>
  //   )
  // }

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
            <p>To enable its visualizations, the extension will store on your own computer data about your web browsing from while the extension is installed. This detailed data will not leave your computer and will not be shared with the researchers. The software will, however, collect for the researchers non-identifiable metadata, including broad descriptions of the topics of webpages you visit (e.g., “entertainment” or “computer hardware”) as well as how many different websites you visit, but not which particular websites you visit. This metadata will also include broad, non-identifiable usage statistics about your web browsing (e.g., the times of day you browse) and how you interact with the browser extension. Only this non-identifiable data and your survey responses will be collected by the researchers.</p>
            <p>Full information about the data collected by the extension and how we will use it is available in our <Link href='https://super.cs.uchicago.edu/trackingtransparency/privacy.html' target='_blank'>privacy policy</Link>.</p>
          </Text>
          <Heading margin='large 0 medium 0'>Activation</Heading>
          <Text>
            <p>To activate our browser extension, please enter the activation code that you have been given:</p>
          </Text>
          <TextInput label='' placeholder='activation code from MTurk' onChange={this.onMTurkCodeInput} />
          <Text>
            <p>By clicking continue, you indicate that you accept the <Link href='https://super.cs.uchicago.edu/trackingtransparency/privacy.html' target='_blank'>privacy policy</Link> and will be taken to the extension homepage.</p>
          </Text>

          <Button variant='primary' onClick={this.onSave}>Continue</Button>
        </div>

      </div>
    )
  }
}

ReactDOM.render(<WelcomePage />, document.getElementById('root'))
