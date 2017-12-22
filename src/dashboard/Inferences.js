import React from 'react';
import { Route, Link } from 'react-router-dom';

import tt from '../helpers';

import InferenceDetails from './InferenceDetails';
import InferencesSunburst from './InferencesSunburst';


class InferencesPage extends React.Component {
  constructor(props) {
    super(props);
    this.inferenceCount = 100;
    this.state = {
      selectedInference: false,
      inferences: null
    };

    this.handleSunburstSelection = this.handleSunburstSelection.bind(this);
    this.handleInferenceLinkClick = this.handleInferenceLinkClick.bind(this);
  }

  async getInferences() {
    const background = await browser.runtime.getBackgroundPage();
    const inferences = await background.queryDatabase('getInferences', {count: this.inferenceCount});
    this.setState({
      inferences: inferences 
    });
  }

  InferenceLink(inference) {
    return(
      <a key={inference} onClick={this.handleInferenceLinkClick}>{inference}</a>
    )
  }

  handleInferenceLinkClick(e) {
    e.preventDefault();
    const inference = e.currentTarget.text;
    this.setState({selectedInference: inference});
  }

  handleSunburstSelection(inference) {
    this.setState({selectedInference: inference});
  }

  async componentDidMount() {
    this.getInferences();
  }
  
  
  render() {
    let {inferences, selectedInference} = this.state;

    return(
      <div>
        <h1>What could they have learned?</h1>

        <Route path={`${this.props.match.url}/:name`} component={InferenceDetails}/>
        <Route exact path={this.props.match.url} render={() => (
          <div>
            <p>The Tracking Transparency extension is able to infer a topic for all the pages that you visit. Online advertisers and trackers most likely are able to make similar inferences about your browsing. This chart shows the {this.inferenceCount} topics that appeared the most in your browsing. You can click on a topic on the diagram to see how companies could have made a specific inference about you.</p>
            {inferences && inferences.length >= 3 && <p>Some of the most frequent inferences made about you include {this.InferenceLink(inferences[0].inference)}, {this.InferenceLink(inferences[1].inference)}, and {this.InferenceLink(inferences[2].inference)}</p>}
            {/* {inferences && <div className='suggested-inferences'>
              <p><strong>Suggested inferences to explore:</strong></p>
              <ul>
                <li>{inferences[0].inference}</li>
                <li>{inferences[1].inference}</li>
                <li>{inferences[2].inference}</li>
              </ul>
            </div>} */}
            <InferencesSunburst onSelectionChange={this.handleSunburstSelection} selectedInference={selectedInference}/>
            {selectedInference && <InferenceDetails inference={selectedInference}/>}
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
