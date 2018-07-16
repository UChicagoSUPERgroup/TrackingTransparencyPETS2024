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
        We hope that you have learned something about online tracking by using our extension!
        <br/>
        <br/> Indicate your preferences here about online tracking and consumer transparency. Your selections here will <strong>not</strong> change the operation of your browser, but will help us continue our work. We may add your selections as features in the future.
        <br/>
        </p>
        <h2>What do you think about...</h2>

        <Panel id="collapsible-panel-example-2">
          <Panel.Heading>
            <Panel.Title toggle>
              tracking to provide relevant advertisements?
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
            <ListGroup>
              <ListGroupItem active> 
              I want no tracking, even if I won't see any relevant advertisements
              </ListGroupItem>
              <ListGroupItem>
              I'm okay with some tracking, if it means that I will see advertisements relevant to me
              </ListGroupItem>
              <ListGroupItem>
              I'm okay with all tracking because I want to see advertisements relevant to me
              </ListGroupItem>
            </ListGroup>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>

        <Panel id="collapsible-panel-example-2">
          <Panel.Heading>
            <Panel.Title toggle>
              your control over inferences made about you?
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>

          <FormGroup>
            <Checkbox>I would opt-out of all inferencing</Checkbox>
            <Checkbox>I would only want non-sensitive inferencing</Checkbox>{' '}
            <Checkbox>Any and all inferencing is fine</Checkbox>
          </FormGroup>

            </Panel.Body>
          </Panel.Collapse>
        </Panel>

        <Panel id="collapsible-panel-example-2">
          <Panel.Heading>
            <Panel.Title toggle>
              how third-party trackers collect information?
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

