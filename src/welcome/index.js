import React from 'react'
import ReactDOM from 'react-dom'

import theme from '@instructure/ui-themes/lib/canvas'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Link from '@instructure/ui-elements/lib/components/Link'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import View from '@instructure/ui-layout/lib/components/View'
import Button from '@instructure/ui-buttons/lib/components/Button'
import Alert from '@instructure/ui-alerts/lib/components/Alert'

import {Button as Button_grommet} from 'grommet';

import Table from '@instructure/ui-elements/lib/components/Table'
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
import ScreenReaderContent from '@instructure/ui-a11y/lib/components/ScreenReaderContent'

import logging from '../dashboard/dashboardLogging'
import { themeOverrides } from '../colors'
import instrumentation from '../background/instrumentation';
import loggingDefault from '../options/loggingDefault'
import { generateID, saveID } from '../options/userstudy'
import tt from '../helpers'

import ReactPlayer from "react-player";
// import pin from "/icons/pin.mov";

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
library.add( faCheckSquare, faSquare )

theme.use({ overrides: themeOverrides })

import { Spinner as Spinner_grommet } from "grommet";

const styles = {}

styles.container = {
  width: '90%',
  maxWidth: '800px',
  marginLeft: 'auto',
  marginRight: 'auto',
}

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')

class WelcomePage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {text: "Begin Survey 1"}
    this.toggleExtensionEnabled = this.toggleExtensionEnabled.bind(this)
    // this.onSave = this.onSave.bind(this) // older method, checked for URL; newer method, pass messages between extension and survey
    this.updateText = this.updateText.bind(this);
    this.openDashboard = this.openDashboard.bind(this)
    this.launchTesting = this.launchTesting.bind(this)
  }

  async componentDidMount () {
    const background = await browser.runtime.getBackgroundPage()
    const adblockers = await background.getAdblockers()
    this.setState({ adblockers })
    const { mturkcode } = await browser.storage.local.get('mturkcode')
    let id
    if (mturkcode) {
      id = mturkcode
    } else {
      id = await generateID()
    }
    // console.log("extension picking", "about to use saveID")
    await saveID(id)
    this.setState({ id })
    this.setState({ text: this.state.text })
    this.renderOverlayInfo = this.renderOverlayInfo.bind(this)

    await loggingDefault.setLoggingDefault()
    await instrumentation.firstInstall()
    browser.storage.local.set({original_extensions: adblockers});

    console.log("launching backend ID now!")
    const new_ID = "3" + "-pid-" + "0 [telemetry not in use]"
    saveID(new_ID).then(response => { 
      // console.log("SET :)")

    });

    
  }
  
  ///// left for testing
  // // no longer called, new install method to grab crowdworker ID without localstorage
  // async onSave () {
  //   // this.updateText()
  //   // const id = this.state.id
  //   // await loggingDefault.setLoggingDefault()
  //   // await instrumentation.firstInstall()
  //   // await tt.sleep(100)
  //   // window.location.href = 'https://umdsurvey.umd.edu/jfe/form/SV_6ywfM4gHdHX8UJv?id=' + id // 1.0
  //   // window.location.href = 'https://umdsurvey.umd.edu/jfe/form/SV_d6luJbwumkBXpGe?id=' + id // 2.0

  // }

  async openDashboard () {
    const tabs = await browser.tabs.query({active: true, currentWindow: true})
    let tabId = tabs[0].id
    const dashboardData = {
      active: true,
      url: '../dist/dashboard.html',
      openerTabId: parseInt(tabId)
    }

    await browser.tabs.create(dashboardData)

    let activityType = 'click dashboard button on popup'
    let clickedElem = 'dashboard button'
    await logging.logPopupActions(activityType, clickedElem)
    
  }

  async launchTesting() {
    console.log("launching now!")
    const new_ID = "3" + "-pid-" + "0 [telemetry not in use]"
    saveID(new_ID).then(response => { 
      browser.storage.local.get('mturkcode').then(resp => {
        sendResponse({success: true, failure: false});
        // instrumentation.firstInstall()
        // browser.storage.local.get('original_extensions').then(original_extensions => {
        //   logging.logPopupActions('***first install***', original_extensions)
        //   browser.storage.local.remove("original_extensions")

        // })
        
      }) 
    });

  }
  


  async toggleExtensionEnabled (e) {
    const id = e.target.value
    const checked = e.target.checked
    const background = await browser.runtime.getBackgroundPage()
    await background.setExtEnabled(id, checked)
    const adblockers = await background.getAdblockers()
    this.setState({ adblockers })
  }

  renderOverlayInfo () {
    const id = this.state.id || '6'
    const cond = (id.split('-')[0])
    if (cond === '4') { // ghostery condition
      return (<div>
        <p>{EXT.NAME} will load an overlay on each page with the current tracker as displayed below. If you wish to disable the overlay you may do so in your browser's extension options page.</p>
        <img src='/icons/overlay.png' width='700px' style={{border: '1px solid black'}} />
      </div>)
    }
    return null
  }

  renderAdblockTable () {
    const { adblockers } = this.state
    if (!adblockers || adblockers.length === 0) {
      return null
    }

    return (
      <div>
        <Heading margin='large 0 medium 0' border='bottom'>Conflicting Extensions</Heading>
        <Text>
          This extension works by collecting information about which trackers and advertisments are on the web pages you visit. 
          As such, having an ad blocker or tracker blocker installed can prevent our extension from collecting the data needed to visualize your web browsing.
          {!isFirefox && ' We have detected that you have the following ad or tracker blockers enabled, and recommend that you disable them, temporarily, using the switches below.'}
          {isFirefox && ' We have detected that you have the following ad or tracker blockers enabled, and recommend that you disable them on the add-ons settings page.'}
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
        {isFirefox && <Text><p>You can disable these add-ons by clicking on the <strong>menu icon</strong> in the top-right corner of your browser window, then clicking <strong>Add-ons</strong>. When the add-ons page opens, click on the <strong>Add-ons</strong> section on the left, and then find the add-ons listed above and clicking <strong>Disable</strong> for each of them.</p></Text>}
      </div>
    )
  }

  updateText (event) {
    this.setState({
      text: <Spinner_grommet color='light-1' />,
    })
  }


  render () {
    return (
      <div>
        <div className='container' style={styles.container}>
          <img src='/icons/super.svg' height='120px' />
          <img src='/icons/umd.gif' height='120px' />

          {/*
          <Heading margin='large 0 medium 0' border='bottom'>Reviewer Information</Heading>
          <Text>
            <p>If you are a reviewer looking to test the functionality of this extension, you may click on the following link and the extension will load a non-telemetry version: <Button_grommet primary label="REVIEWING" size="small" onClick={this.launchTesting}></Button_grommet></p>
          </Text>
          */}




          <Heading margin='large 0 medium 0' border='bottom'>About</Heading>
          <Text>
            <p>{EXT.NAME} is a software tool that visualizes aspects of your web browsing. To access this extension, 'pin' the extension (see image below) and then click on the extension's icon while browsing. </p>
            {/*{<img src='/icons/pin.png' width="90%" style={{border: '1px solid black'}} />}*/}
            {<img src='/icons/pin.png' width="90%" style={{width: '100%', height: '100%', display: 'block', marginLeft: 'auto', marginRight: 'auto', }} />}

            {this.renderOverlayInfo()}
          </Text>

          {/*
          <Heading margin='large 0 medium 0' border='bottom'>Next Steps</Heading>
          <Text>
            <p>There are two steps to complete right now.</p>
            <Grid hAlign="space-around">
              <GridRow>
                <GridCol>
                  <View as='div' borderWidth='medium' borderRadius='medium' padding='small'>
                    <Heading level='h3' margin='0 small small 0'>First</Heading>
                    <Text>
                      <p><strong>When</strong>: now</p>
                      <p><strong>Steps</strong>:</p>
                      <p style={{'marginLeft':'1em'}}>
                        <FontAwesomeIcon icon='square'/> Pin the {EXT.NAME} extension<br/>
                      </p>
                    </Text>
                  </View>
                </GridCol>
                <GridCol>
                  <View as='div' borderWidth='medium' borderRadius='medium' padding='small'>
                    <Heading level='h3' margin='0 small small 0'>Second</Heading>
                    <Text>
                      <p><strong>When</strong>: after you've pinned the extension</p>
                      <p><strong>Steps</strong>:</p>
                      <p style={{'marginLeft':'1em'}}>
                        <FontAwesomeIcon icon='square'/> Go back to the survey<br/>
                      </p>
                    </Text>
                  </View>
                </GridCol>
              </GridRow>
            </Grid>
          </Text>
          */}
          <br/>

          {this.renderAdblockTable()}


          <Heading margin='large 0 medium 0' border='bottom'>Additional Information</Heading>
          <Text>
            <p>To enable its visualizations, the extension will store data on your computer about your web browsing.</p>
            <p>This extension and the extension's data will not be shared with anyone. Chrome may collect telemetry data on extension install times, or uninstall times, but <b>no data that is collected by this extension (i.e., data enabling visualizations) will be shared with anyone</b>. </p>
            
            {/*<p>Personally-identifiable information (PII) will <em>not</em> leave your computer and will <em>not</em> be shared with the researchers. The software will, however, collect for the researchers certain anonymized metrics, including:</p>*/}
            <p>The extension's data that powers its visualizations includes:</p>
            <ul>
              <li>Data about the web pages you visit, including:</li>
              <ul>
                <li>The page's title and URL</li>
                <li>Date and time information about pages visited</li>
                <li>The trackers present on the page</li>
                <li>A guess about what the page is about (inferred topic)</li>
                <li>Google adsSettings information over time <Link href='https://adssettings.google.com' target='_blank'>AdsSettings</Link></li>
                <ul>
                  <li>This may include page information which could have triggered adsSettings inferences</li>
                </ul> 
                <li>Modified page content if that page is of a particular inferred topic</li>
                <li>Information about advertisements served, included what the ad is about (inferred topic)</li>
              </ul>
              {/*<li>Analytics regarding interaction with the extension</li>*/}
              <li>Whether you have other ad or tracker blocker extensions installed</li>
            </ul>
            <p>Full information about the data collected by the extension and how we will use it is available in our <Link href='https://super.cs.uchicago.edu/trackingtransparency/privacy.html' target='_blank'>privacy policy</Link>.</p>
          </Text>

          <Alert variant='warning'>
           PII will exist only on your local copy of the extension (i.e., on the local device). 
          </Alert>
          {/*<Button variant='primary' onClick={this.onSave}><Heading margin='medium'>{this.state.text}</Heading></Button>*/}

          <br/>

          {/*
          <Heading margin='large 0 medium 0' border='bottom'>Developer Information (NOT FOR SURVEY PARTICIPANTS)</Heading>
          <Text>
            <p>If you are a developer looking to approve or test the functionality of this extension, you may click on the following link for a preview of the extension: <Button_grommet primary label="Testing" size="small" onClick={this.openDashboard}></Button_grommet></p>
          </Text>
          */}

          <br/>
          <br/>
        </div>

      </div>
    )
  }
}

ReactDOM.render(<WelcomePage />, document.getElementById('root'))
