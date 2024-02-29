import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Alert from '@instructure/ui-alerts/lib/components/Alert'
import Button from '@instructure/ui-buttons/lib/components/Button'
import ToggleDetails from '@instructure/ui-toggle-details/lib/components/ToggleDetails'
import FormFieldGroup from '@instructure/ui-forms/lib/components/FormFieldGroup'
import TextArea from '@instructure/ui-forms/lib/components/TextArea'
import TextInput from '@instructure/ui-forms/lib/components/TextInput'
import DateInput from '@instructure/ui-forms/lib/components/DateInput'
import NumberInput from '@instructure/ui-forms/lib/components/NumberInput'

import Table from '@instructure/ui-elements/lib/components/Table'
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
import ScreenReaderContent from '@instructure/ui-a11y/lib/components/ScreenReaderContent'

import logging from './dashboardLogging'
import TTPanel from './components/TTPanel'
import UserstudyOptionsUI from '../options/UserstudyOptionsUI'

import tt from '../helpers'
import { Spinner as Spinner_grommet } from "grommet";
import { Box, FileInput, Form, FormField } from 'grommet';
import { Button as Button_grommet } from "grommet";
import {Checkmark, CircleInformation} from "grommet-icons";
import {Stack, Tip, } from 'grommet';
import { Text as Text_grommet } from "grommet";

class DebugPage extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      queryFormField: '',
      trackerFormField: 'Google',
      domainFormField: 'yahoo.com',
      inferenceFormField: 'Computers & Electronics',
      afterDateFormField: '',
      countFormField: '',
      importFormField: '',
      result: false,
      error: false,
      text: "Reset All Data!",
      query_text: "Query",
      queryTime: false,
      adFetching: 'pending',
      richFeatures: '',
    }
    this.recursive = false
    this.updateText = this.updateText.bind(this);
    this.updateTextDONE = this.updateTextDONE.bind(this);
    this.updateQueryText = this.updateQueryText.bind(this);
    this.updateQueryTextDONE = this.updateQueryTextDONE.bind(this);
    this.onDelete = this.onDelete.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleTextChange = this.handleTextChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.saveFile = this.saveFile.bind(this)
    this.importData = this.importData.bind(this)
    this.handleClickRecursive = this.handleClickRecursive.bind(this)
    this.toggleAdFetchEnabled = this.toggleAdFetchEnabled.bind(this)
    this.toggleRichFeaturesEnabled = this.toggleRichFeaturesEnabled.bind(this)
    // this.logLoad = this.logLoad.bind(this);
  }

  componentDidMount () {
    let activityType = 'load dashboard debug page'
    logging.logLoad(activityType, {})
    this.setState({ text: this.state.text })


    let checker = browser.storage.local.get('deepAdFetching').then(ret => {
      this.setState({ adFetching:ret.deepAdFetching })
      
    })
    let checker2 = browser.storage.local.get('richFeatures').then(ret => {
      this.setState({ richFeatures:ret.richFeatures })
    })

  }

  async toggleAdFetchEnabled (e) {
    let curr = this.state.adFetching 
    if (curr == true){
      this.setState({ adFetching:false })

      await browser.storage.local.set({deepAdFetching: false});

    } else {
      this.setState({ adFetching:true })

      await browser.storage.local.set({deepAdFetching: true});

    }
  }


  async toggleRichFeaturesEnabled (e) {
    let curr = this.state.richFeatures
    console.log(curr)
    if (curr == true){
      this.setState({ richFeatures:false })

      await browser.storage.local.set({richFeatures: false});

    } else {
      this.setState({ richFeatures:true })

      await browser.storage.local.set({richFeatures: true});

    }
  }


  async handleClickRecursive () {
    this.recursive = true
    await this.handleClick()
    this.recursive = false
  }

  async handleClick () {
    this.updateQueryText()
    tt.sleep(500)
    const background = await browser.runtime.getBackgroundPage()
    const query = this.state.queryFormField
    const queryObj = {
      tracker: this.state.trackerFormField,
      domain: this.state.domaindeeFormField,
      inference: this.state.inferenceFormField,
      afterDate: (new Date(this.state.afterDateFormField)).getTime(),
      count: this.state.countFormField
    }
    console.log('making query', query, queryObj)
    try {
      let t0 = performance.now()
      let result
      if (this.recursive) {
        console.log('making recursive query')
        result = await background.queryDatabaseRecursive(query, queryObj)
      } else {
        result = await background.queryDatabase(query, queryObj)
      }
      let t1 = performance.now()
      console.log(result)
      this.setState({
        result: result,
        error: false,
        queryTime: t1 - t0
      })
    } catch (e) {
      console.log("this is the error: ", e)
      console.log("this was the query being made: ", query)
      let error_log = {'error_identified': String(e), "query_call": query}
      let sendDict = {'extraData': JSON.stringify(error_log)}
      logging.logLoad('error', sendDict)
      this.setState({
        result: false,
        error: e.message
      })
    }
    // this.updateQueryTextDONE()
    // tt.sleep(500)
    this.setState({query_text: "Query"})
  }

  updateText (event) {
    this.setState({
      text: <Spinner_grommet color='light-1' />,
    })
  }

  updateTextDONE (event) {
    this.setState({
      text: <Checkmark size="medium" />,
    })
  }

  updateQueryText (event) {
    this.setState({
      query_text: <Spinner_grommet color='light-1' />,
    })
  }

  updateQueryTextDONE (event) {
    this.setState({
      query_text: <Checkmark size="medium" />,
    })
  }

  saveFile () {
    let blob = new Blob([JSON.stringify(this.state.result, null, '\t')], {type: 'application/json'})
    var objectURL = window.URL.createObjectURL(blob)
    browser.downloads.download({url: objectURL, filename: 'tracking_transparency_data_export.json'})
    // FileSaver.saveAs(blob, 'tt_export.json');
  }

  async importData () {
    const background = await browser.runtime.getBackgroundPage()
    await background.importData(this.state.importFormField)
  }

  async resetAll () {
    const background = await browser.runtime.getBackgroundPage()
    await background.resetAllData()
  }

  async onDelete () {
    this.updateText()
    const background = await browser.runtime.getBackgroundPage()
    await background.resetAllData()
    await tt.sleep(500)
    this.updateTextDONE()

  }


  handleChange (e) {
    const value = e.target.value
    const name = e.target.id
    console.log(name, value)
    this.setState({
      [name]: value
    })
  }

  handleTextChange (e) {
    const value = e.target.value
    const name = e.target.name
    // console.log(name, value)
    this.setState({
      [name]: value
    })
  }

  render () {
    const {result, error, queryTime, adFetching, richFeatures} = this.state
    return (
      <div>
        <Heading level='h1' margin='0 0 medium'><strong>Debug</strong></Heading>
        <TTPanel margin='medium 0 medium 0'>
          <Heading level='h2' margin='0 0 medium'>Database query</Heading>
          <FormFieldGroup
            name='query'
            description='Make a database query'
            layout='columns'
            vAlign='top'
            rowSpacing='small'
          >
            <TextInput
              name='queryFormField'
              label='Query'
              placeholder='getAllData'
              value={this.state.queryFormField}
              onChange={this.handleTextChange}
            />
            <TextInput
              name='trackerFormField'
              label='Tracker'
              placeholder='Google'
              value={this.state.trackerFormField}
              onChange={this.handleTextChange}
            />
            <TextInput
              name='domainFormField'
              label='First party domain'
              placeholder='yahoo.com'
              value={this.state.domainFormField}
              onChange={this.handleTextChange}
            />
            <TextInput
              name='inferenceFormField'
              label='Inference'
              placeholder='Warehousing'
              value={this.state.inferenceFormField}
              onChange={this.handleTextChange}
            />
            <DateInput
              previousLabel='previous month'
              nextLabel='next month'
              placeholder='Start date'
              label='Start date'
              dateValue={this.state.afterDateFormField}
              onDateChange={(e, isoValue, rawValue, rawConversionFailed) => { this.setState({afterDateFormField: isoValue.slice(0, 10)}) }}
              invalidDateMessage={(value) => { return `'${value}' is not a valid date` }}
            />
            <NumberInput
              label='Number of results'
              placeholder='12'
              min={1}
              step={1}
              value={this.state.countFormField}
              onChange={(e, num) => this.setState({ countFormField: num })}
            />
          </FormFieldGroup>
          <Button variant='primary' type='submit' onClick={this.handleClick} margin='small small 0 0'>
            {this.state.query_text}
          </Button>
          <Button type='submit' onClick={this.handleClickRecursive} margin='small 0 0 0'>
            Query (recursive on inferences)
          </Button>
          {error && <Alert
            variant='error'
            closeButtonLabel='Close'
            margin='small'
          >
            {error}
          </Alert>}
          {result && <div>
            <pre id='result' style={{ overflow: 'scroll', maxHeight: '20rem', border: '1px solid black' }}>
              {JSON.stringify(this.state.result, null, '\t')}
            </pre>

            <Button type='submit' onClick={this.saveFile}>
              Download
            </Button>
          </div>}
          {queryTime && <p>Time: {queryTime / 1000} seconds</p>}
        </TTPanel>

        <TTPanel margin='medium 0 medium 0'>
          <Heading level='h2' margin='0 0 medium'>Import data</Heading>
{/*
          <Box fill align="center" justify="start" pad="large">
            <Box width="medium">
              <Form validate="submit">
                <FormField name="fileInput" htmlFor="fileInput" required>
                  <FileInput
                    name="fileInput"
                    id="fileInput"
                    multiple={{
                      max: 1,
                    }}

                    onChange={event => {
                      alert(event.target.files)
                      const fileList = event.target.files;
                      for (let i = 0; i < fileList.length; i += 1) {
                        const file = fileList[i];
                        var reader = new FileReader();
                        reader.onload = function(event) {
                          // The file's text will be printed here
                          console.log("hi there", event.target.result)
                          this.state.importFormField = event.target.result
                          this.importData               
                          console.log("---")
                        };

                        reader.readAsText(file);
                      }
                    }}

                  />
                </FormField>
                <Button_grommet label="Submit" primary type="submit" />
              </Form>
            </Box>
          </Box>
*/}

       
          <TextArea
            name='importFormField'
            label='JSON to import'
            placeholder='Paste here'
            maxHeight='10rem'
            value={this.state.importFormField}
            onChange={this.handleTextChange}
          />
          <br />
          <Button type='submit' onClick={this.importData}>
          Import data
          </Button>


        </TTPanel>

{/*
          <FileInput
            name="file"
            onChange={event => {
              alert(event.target.files)
              const fileList = event.target.files;
              for (let i = 0; i < fileList.length; i += 1) {
                const file = fileList[i];
                var reader = new FileReader();
                reader.onload = function(event) {
                  // The file's text will be printed here
                  console.log("hi there", event.target.result)
                  background.importData(event.target.result)
                  console.log("---")
                };

                reader.readAsText(file);
              }
            }}
          />

*/}
        <TTPanel margin='medium 0 medium 0'>
          <Heading level='h2' margin='0 0 medium'>User study settings</Heading>
          <UserstudyOptionsUI />
        </TTPanel>

        <TTPanel margin='medium 0 medium 0'>

          <Table
            caption={<ScreenReaderContent>Optional settings</ScreenReaderContent>}
          >
            <thead>
              <tr>
                <th scope='col'>Feature</th>
                {<th scope='col'>Enabled</th>}
              </tr>
            </thead>
            <tbody>
              
                <tr key={1}>
                  <td>

                  {/*{"Deep ad fetching"}*/}

                  <Box alignSelf="left" align="left">
                  <Stack anchor="top-left">
                    <Box alignSelf="center" align="center" background={'dark-4'} round='medium' pad="small" margin="medium" gap="small" width={{ max: 'small' }} responsive={true}> 
                    <Text_grommet color="white">Deep ad fetching</Text_grommet>
                    </Box>
                    <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">Deep ad grabbing</Text_grommet> <Text_grommet size="small"> This extension will fetch the final destination of an outgoing hyperlink associated with an ad. If you would prefer the extension to make an inference on what the final destination is (reducing accuracy, but not possibly appearing as a click to an advertiser), then turn this feature off.</Text_grommet> </Box> } dropProps={{ align:  { bottom: "top" } }}>
                    <CircleInformation color='dark-3' size="45px" />
                    </Tip>
                  </Stack>
                  </Box>

                  </td>
                  <td>
                    <Checkbox
                      label={<ScreenReaderContent>Checkbox to enable/disable {"test"}</ScreenReaderContent>}
                      value={"1"}
                      checked={this.state.adFetching}
                      onChange={this.toggleAdFetchEnabled}
                      variant='toggle'
                    />
                  </td>
                </tr>

                {/*
                <tr key={2}>
                  <td>{"Rich features (slower)"}</td>
                  <td>
                    <Checkbox
                      label={<ScreenReaderContent>Checkbox to enable/disable {"test"}</ScreenReaderContent>}
                      value={"1"}
                      checked={this.state.richFeatures}
                      onChange={this.toggleRichFeaturesEnabled}
                      variant='toggle'
                    />
                  </td>
                </tr>
                */}
                
            </tbody>
          </Table>


        </TTPanel>

{/*
        <TTPanel margin='medium 0 medium 0'>
          <ToggleDetails
            summary='Danger zone'
          >
          <br/>
            <Button
              variant='danger'
              type='submit'
              onClick={this.onDelete}>
              {this.state.text}
            </Button>
          </ToggleDetails>
        </TTPanel>
*/}
      </div>
    )
  }
}

export default DebugPage
