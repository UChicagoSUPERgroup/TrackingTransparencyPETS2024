import React from 'react';
import { Route, Link } from 'react-router-dom';

import {Sunburst} from 'react-vis';

import ttDashboard from './dashboardHelpers';

import InferencesSunburst from './InferencesSunburst';

const InferencesListItem = (inference) => {
  const inferenceName = inference.inference;
  return (
    <div key={inferenceName}>
      <Link to={{
        pathname: '/inferences/' + inferenceName
      }}>
        {inferenceName}
      </Link>
    </div>
  );
}

class InferencesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inferences: null
    }
  }

  async getInferences() {
    const background = await browser.runtime.getBackgroundPage();
    const inferences = await background.queryDatabase("getInferences", {count: 100});
    this.setState({
      inferences: inferences 
    });
  }

  async componentDidMount() {
    this.getInferences();
  }
  
  render() {

    return(
      <div>
        <h1>Inferences</h1>

        <Route path={`${this.props.match.url}/:name`}  component={InferenceDetails}/>
        <Route exact path={this.props.match.url} render={() => (
          <div>
            <InferencesSunburst/>
            {/* {this.state.inferences && <InferencesSunburst inferencesList={this.state.inferences}/>} */}
            {/* <InferencesSunburst inferencesList={this.state.inferences}/> */}
            {/* {this.state.inferences.map(inference => InferencesListItem(inference))} */}
          </div>
        )}/>


      </div>
    );
  }
}

class InferenceDetails extends React.Component {
  constructor(props) {
    super(props);

    this.inference = this.props.match.params.name;
    this.state = {
      inferences: []
    }
  }

  async componentDidMount() {
    // const background = await browser.runtime.getBackgroundPage();
    // const inferences = await background.queryDatabase("getInferencesByInference", {inference: this.inference, count: 100});
    // this.setState({
    //   inferences: inferences
    // })
  }

  render() {
    return (
      <div>
        <h2>{this.inference}</h2>
        {/* <pre>{JSON.stringify(this.state.inferences, null, '\t')}</pre> */}
      </div>
    );
  }
}

export default InferencesPage;