import React from 'react';

import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';


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
      queryFormField: 'getTrackers',
      trackerFormField: 'Google',
      domainFormField: 'www.nytimes.com',
      inferenceFormField: 'Warehousing',
      countFormField: '10',
      result: {}
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  // componentDidMount() {

  // }

  async handleClick() {
    const background = await browser.runtime.getBackgroundPage();
    const result = await background.queryDatabase(this.state.queryFormField, {
      tracker: this.state.trackerFormField,
      domain: this.state.domainFormField,
      inference: this.state.inferenceFormField,
      count: this.state.countFormField
    });
    this.setState({
      result: result
    });
    console.log(this.state.result);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.id;
    this.setState({
      [name]: value
    });
  }

  render() {
    return (
      <div>
        <h1>Debug</h1>
        <form>
          <FieldGroup
            id="queryFormField"
            type="text"
            label="Query"
            placeholder="getTrackers"
            value={this.state.query}
            onChange={this.handleChange}
          />
          <FieldGroup
            id="trackerFormField"
            type="text"
            label="Tracker"
            placeholder="Google"
            value={this.state.tracker}
            onChange={this.handleChange}
          />
          <FieldGroup
            id="domainFormField"
            type="text"
            label="First party domain"
            placeholder="www.nytimes.com"
            value={this.state.domain}
            onChange={this.handleChange}
          />
          <FieldGroup
            id="inferenceFormField"
            type="text"
            label="Inference"
            placeholder="Warehousing"
            value={this.state.inference}
            onChange={this.handleChange}
          />
          <FieldGroup
            id="countFormField"
            type="number"
            label="Count"
            placeholder="10"
            value={this.state.count}
            onChange={this.handleChange}
          />
          <Button type="submit" onClick={this.handleClick}>
            Submit
          </Button>
        </form>
        <br/>
        <pre>{JSON.stringify(this.state.result, null, '\t')}</pre>
      </div>
    );
  }
}

export default DebugPage;