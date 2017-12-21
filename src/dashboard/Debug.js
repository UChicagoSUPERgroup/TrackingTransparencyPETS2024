import React from 'react';

import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

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
      afterDateFormField: '2017-12-01',
      countFormField: false,
      result: false,
      error: false
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  // componentDidMount() {

  // }

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
      const result = await background.queryDatabase(query, queryObj);
      console.log(result);
      this.setState({
        result: result,
        error: false
      });
    } catch(e) {
      console.log(e);
      this.setState({
        result: false,
        error: e.message
      });
    }
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
    const {result, error} = this.state;
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
          <Button type="submit" onClick={this.handleClick}>
            Submit
          </Button>
        </form>
        <br/>
        {error && <Alert bsStyle="danger">{error}</Alert>}
        {result &&<pre>{JSON.stringify(this.state.result, null, '\t')}</pre>}
      </div>
    );
  }
}

export default DebugPage;