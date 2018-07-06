import React from 'react';
import Panel from 'react-bootstrap/lib/Panel';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Checkbox from 'react-bootstrap/lib/Checkbox';

import logging from './dashboardLogging';

export class TakeActionPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  async componentDidMount() {
    let activityType='load dashboard take action page';
    logging.logLoad(activityType, {});
  }

  render() {
    return (
      <div>


        <h1>Take Action</h1>
        <p>
        You learned a lot through this extension... now what do you want to do?
        <br/>
        <br/>Note: these settings will NOT change the processing of your browser. These settings are for research purposes only; we will collect your preferences in order to inform what changes should be made.
        </p>
        <h2>Things you could do</h2>

        <Panel id="collapsible-panel-example-2">
          <Panel.Heading>
            <Panel.Title toggle>
              Advertisement Blocking
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
            <ListGroup>
              <ListGroupItem href="#" active> 
              Item 1</ListGroupItem>
              <ListGroupItem>Item 2</ListGroupItem>
              <ListGroupItem>&hellip;</ListGroupItem>
            </ListGroup>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>

        <Panel id="collapsible-panel-example-2">
          <Panel.Heading>
            <Panel.Title toggle>
              Inference Control
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>

          <FormGroup>
            <Checkbox>Opt-out of all inferencing</Checkbox>
            <Checkbox>Only non-sensitive inferencing</Checkbox>{' '}
            <Checkbox>All inferencing is fine</Checkbox>
          </FormGroup>

            </Panel.Body>
          </Panel.Collapse>
        </Panel>

        <Panel id="collapsible-panel-example-2">
          <Panel.Heading>
            <Panel.Title toggle>
              Something else
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              Anim pariatur cliche reprehenderit, enim eiusmod high life
              accusamus terry richardson ad squid. Nihil anim keffiyeh
              helvetica, craft beer labore wes anderson cred nesciunt sapiente
              ea proident.
            </Panel.Body>
          </Panel.Collapse>
        </Panel>


      </div>
    )
  }
}

export default TakeActionPage;

