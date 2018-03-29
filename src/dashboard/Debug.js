import React from 'react';

import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';
import Checkbox from 'react-bootstrap/lib/Checkbox';

import {queryNames} from '../background/database/queries';

const FieldGroup = ({ id, label, ...props }) => {
  return (
    <FormGroup controlId={id} bsSize="small">
      <ControlLabel>{label}</ControlLabel>
      <FormControl
        {...props}
      />
    </FormGroup>
  );
}

class DebugPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      queryFormField: queryNames[0],
      trackerFormField: 'Google',
      domainFormField: 'www.nytimes.com',
      inferenceFormField: 'Warehousing',
      afterDateFormField: '2018-01-01',
      countFormField: false,
      importFormField: false,
      result: false,
      error: false,
      queryTime: false
    }
    this.recursive = false;

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.importData = this.importData.bind(this);
    this.handleClickRecursive = this.handleClickRecursive.bind(this);
    this.logLoad = this.logLoad.bind(this);
  }

  async logLoad() {
        //console.log('In the log load page')
        const background = await browser.runtime.getBackgroundPage();
        let userParams = await browser.storage.local.get({
          usageStatCondition: "no monster",
          userId: "no monster",
          startTS: 0
        });
        const tabs = await browser.tabs.query({active: true, currentWindow: true});
        let tabId = tabs[0].openerTabId;
        let x = 'clickData_tabId_'+String(tabId);
        let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain':'','tabId':tabId,'pageId':'','numTrackers':0})});
        tabData = JSON.parse(tabData[x]);
        if (JSON.parse(userParams.usageStatCondition)){//get data when the user click on the button.
          let activityType='load dashboard debug page';
          let timestamp=Date.now();
          let userId=userParams.userId;
          let startTS=userParams.startTS;
          let activityData={
            'parentTabId':tabId,
            'parentDomain':tabData.domain,
            'parentPageId':tabData.pageId,
            'parentNumTrackers':tabData.numTrackers
          }
          background.logData(activityType, timestamp, userId, startTS, activityData);
        }
      }


componentDidMount() {
  this.logLoad();
}
  async handleClickRecursive() {
    this.recursive = true;
    await this.handleClick();
    this.recursive = false;
  }

  async handleClick() {
    const background = await browser.runtime.getBackgroundPage();
    const query = this.state.queryFormField;
    const queryObj = {
      tracker: this.state.trackerFormField,
      domain: this.state.domainFormField,
      inference: this.state.inferenceFormField,
      afterDate: (new Date(this.state.afterDateFormField)).getTime(),
      count: this.state.countFormField
    };
    console.log('making query', query, queryObj);
    try {
      let t0 = performance.now();
      let result;
      if (this.recursive) {
        console.log('making recursive query');
        result = await background.queryDatabaseRecursive(query, queryObj);
      } else {
        result = await background.queryDatabase(query, queryObj);
      }
      let t1 = performance.now();
      console.log(result);
      this.setState({
        result: result,
        error: false,
        queryTime: t1 - t0
      });
    } catch(e) {
      console.log(e);
      this.setState({
        result: false,
        error: e.message
      });
    }
  }

  saveFile() {
    let blob = new Blob([JSON.stringify(this.state.result, null, '\t')], {type : 'application/json'});
    var objectURL = window.URL.createObjectURL(blob);
    browser.downloads.download({url: objectURL, filename: 'tt_export.json'});
    // FileSaver.saveAs(blob, 'tt_export.json');
  }

  async importData() {
    const background = await browser.runtime.getBackgroundPage();
    await background.importData(this.state.importFormField);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.id;
    // console.log(name, value)
    this.setState({
      [name]: value
    });
  }

  render() {
    const {result, error, queryTime} = this.state;
    return (
      <div>
        <h1>Debug</h1>
        <form>
          <FormGroup controlId="queryFormField">
            <ControlLabel>Query</ControlLabel>
            <FormControl
              componentClass="select"
              placeholder="Query"
              value={this.state.queryFormField}
              onChange={this.handleChange}>
              {queryNames.map(q => <option key={q} value={q}>{q}</option>)}
            </FormControl>
          </FormGroup>

          <FieldGroup
            id="trackerFormField"
            type="text"
            label="Tracker"
            value={this.state.trackerFormField}
            onChange={this.handleChange}
          />
          <FieldGroup
            id="domainFormField"
            type="text"
            label="First party domain"
            value={this.state.domainFormField}
            onChange={this.handleChange}
          />
          <FieldGroup
            id="inferenceFormField"
            type="text"
            label="Inference"
            value={this.state.inferenceFormField}
            onChange={this.handleChange}
          />
          <FieldGroup
            id="afterDateFormField"
            type="date"
            label="After Date"
            value={this.state.afterDateFormField}
            onChange={this.handleChange}
          />
          <FieldGroup
            id="countFormField"
            type="number"
            label="Count"
            value={this.state.countFormField}
            onChange={this.handleChange}
          />
          {/* <FieldGroup
            id="countFormField"
            type="checkbox"
            label="Recursive (on inference categories)"
            value={this.state.recursive}
            onChange={this.handleChange}
          /> */}
          {/* <FormGroup>
            <Checkbox
              value={this.state.recursive}
              onChange={this.handleChange}>
              Recursive (on inference categories)
            </Checkbox>
          </FormGroup> */}
          <Button type="submit" onClick={this.handleClick}>
            Query
          </Button>
          <Button type="submit" onClick={this.handleClickRecursive}>
            Query (recursive on inferences)
          </Button>
          <Button type="submit" onClick={this.saveFile}>
            Download
          </Button>
        </form>
        <br/>
        {error && <Alert bsStyle="danger">{error}</Alert>}
        {result &&<pre id="result">{JSON.stringify(this.state.result, null, '\t')}</pre>}
        {queryTime && <p>Time: {queryTime / 1000} seconds</p>}

        <FieldGroup
          id="importFormField"
          type="text"
          label="Import"
          value={this.state.importFormField}
          onChange={this.handleChange}
        />
        <Button type="submit" onClick={this.importData}>
            Import
          </Button>
      </div>
    );
  }
}

export default DebugPage;
