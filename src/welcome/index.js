import React from 'react'
import ReactDOM from 'react-dom'

import theme from '@instructure/ui-themes/lib/canvas'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'

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
  }

  async componentDidMount () {
  }

  render () {
    return (
      <div>
        <div className='container' style={styles.container}>
          <img src="/icons/super.svg" height='150px'/>
          {/*<Heading margin='large 0 medium 0'>Welcome to Tracking Transparency!</Heading>*/}
          <Text>
            <p>Thank you for agreeing to participate in our research study. To activate our browser extension, please copy the activation code that is displayed at the end of the survey.</p>
            <p>This browser extension is a software tool that visualizes aspects of your web browsing. In order to access the extension, click on the icon in the corner of the upper right of your browser window (Chrome and Firefox). </p>
          <Text>
          <img src="/icons/extension-toolbar.png" width='500px'/>
          </Text>
            <p>As we described in the consent form, the browser extension will store on your own computer data about your web browsing from while the extension is installed. This is necessary so that the extension can visualize your web browsing for you. This detailed data will not leave your computer and will not be shared with the researchers. The software will, however, collect for the researchers non-identifiable metadata, including broad descriptions of the topics of webpages you visit (e.g., “entertainment” or “computer hardware”) as well as how many different websites you visit, but not which particular websites you visit. This metadata will also include broad, non-identifiable usage statistics about your web browsing (e.g., the times of day you browse) and how you interact with the browser extension. Only this non-identifiable data and your survey responses will be collected by the researchers. At the end of the study, we will provide detailed instructions for uninstalling this browser extension.</p>
          </Text>
        </div>

      </div>
    )
  }
}

ReactDOM.render(<WelcomePage />, document.getElementById('root'))
