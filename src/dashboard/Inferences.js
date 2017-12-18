import React from 'react';
import { Route, Link } from 'react-router-dom';

import InferenceDetails from './InferenceDetails';
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
    this.inferenceCount = 100;
    this.state = {
      selectedInference: false,
      inferences: null
    }

    this.handleSunburstSelection = this.handleSunburstSelection.bind(this);
  }

  async getInferences() {
    const background = await browser.runtime.getBackgroundPage();
    const inferences = await background.queryDatabase("getInferences", {count: this.inferenceCount});
    this.setState({
      inferences: inferences 
    });
  }

  handleSunburstSelection(inference) {
    this.setState({selectedInference: inference});
  }

  async componentDidMount() {
    this.getInferences();
  }
  
  
  render() {

    return(
      <div>
        <h1>What could they have learned?</h1>

        <Route path={`${this.props.match.url}/:name`} component={InferenceDetails}/>
        <Route exact path={this.props.match.url} render={() => (
          <div>
            <p>The Tracking Transparency extension is able to infer a topic for all the pages that you visit. Online advertisers and trackers most likely are able to make similar inferences about your browsing. This chart shows the {this.inferenceCount} topics that appeared the most in your browsing. You can click on a topic on the diagram to see how companies could have made a specific inference about you.</p>
            <InferencesSunburst onSelectionChange={this.handleSunburstSelection}/>
            {this.state.selectedInference && <InferenceDetails inference={this.state.selectedInference}/>}
            {/* {this.state.inferences && <InferencesSunburst inferencesList={this.state.inferences}/>} */}
            {/* <InferencesSunburst inferencesList={this.state.inferences}/> */}
            {/* {this.state.inferences.map(inference => InferencesListItem(inference))} */}
          </div>
        )}/>


      </div>
    );
  }
}


export default InferencesPage;