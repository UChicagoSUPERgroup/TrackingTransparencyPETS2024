import React from 'react'
import ReactDOM from 'react-dom'

import theme from '@instructure/ui-themes/lib/canvas'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import TextInput from '@instructure/ui-forms/lib/components/TextInput'
import Button from '@instructure/ui-buttons/lib/components/Button'
import Link from '@instructure/ui-elements/lib/components/Link'

import logging from '../dashboard/dashboardLogging'
import { themeOverrides } from '../colors'

theme.use({
  overrides: themeOverrides
})

const styles = {}

styles.container = {
  width: '90%',
  maxWidth: '800px',
  marginLeft: 'auto',
  marginRight: 'auto'
}

class WelcomePage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {

    }
    this.onMTurkCodeInput = this.onMTurkCodeInput.bind(this)
    this.onSave = this.onSave.bind(this)
  }

  async componentDidMount () {
  }

  onMTurkCodeInput (event) {
    this.setState({
      mturkcode: event.target.value
    })
  }

  async onSave () {
    await browser.storage.local.set({ mturkcode: this.state.mturkcode })
    // TODO do more stuff here
    window.location.href = '/dist/dashboard.html'
  }

  render () {
    return (
      <div>
        <div className='container' style={styles.container}>
          <img src="/icons/super.svg" height='150px' />
          {/*<Heading margin='large 0 medium 0'>Welcome to Tracking Transparency!</Heading>*/}

          <Text>
            <p>This browser extension is a software tool that visualizes aspects of your web browsing. To access the extension, click on the icon in the corner of the upper right of your browser window. </p>
          </Text>
          <img src="/icons/extension-toolbar.png" width='700px' style={{border:"2px solid black"}} />
          <Text>
            <p>The extension icon will appear in the upper right corner for Chrome as well as Firefox users. </p>
          </Text>
          <Text fontStyle="italic">
            <hr/>
            <p>As described in the consent form, this browser extension will store data about your web browsing on your own computer. This detailed data will not leave your computer and will not be shared with the researchers. The extension will send non-identifiable metadata and your survey responses to the researchers. At the end of the study, we will provide detailed instructions for uninstalling this browser extension.</p>
            <hr/>
          </Text>
          <Text>
            <p>To activate our browser extension, please enter the activation code that is displayed at the end of the survey:</p>
          </Text>
          <TextInput label="" placeholder="activation code from MTurk" onChange={this.onMTurkCodeInput} />
          <Text>
            <p>By clicking continue, you indicate that you accept the consent form and will be taken to the extension homepage.</p>
          </Text>

          <Button variant="primary" onClick={this.onSave}>Continue</Button>
        </div>

      </div>
    )
  }
}

ReactDOM.render(<WelcomePage />, document.getElementById('root'))
