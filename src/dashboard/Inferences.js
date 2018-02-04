import React from 'react';
import { Route, Link } from 'react-router-dom';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';

import tt from '../helpers';
import sensitiveCats from '../data/categories_comfort_list.json';


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
    this.handleSensitivitySelection = this.handleSensitivitySelection.bind(this);
    this.handleInferenceLinkClick = this.handleInferenceLinkClick.bind(this);
  }

  async getInferences() {
    const background = await browser.runtime.getBackgroundPage();
    this.topInferences = await background.queryDatabase('getInferences', {count: this.inferenceCount});
    this.setState({
      inferences: this.topInferences 
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

  async handleSensitivitySelection(e) {
    const key = e.target.attributes.getNamedItem('data-key').value;

    let cats;

    const background = await browser.runtime.getBackgroundPage();

    if (key === 'all-sensitive') {
      console.log('all sensitive')
      // reset to default
      this.setState({
        inferences: this.topInferences,
        selectedInference: false
      })
      return;

    } else if (key === 'less-sensitive') {
      console.log('less sensitive')
      cats = sensitiveCats.slice(-50).reverse(); // 50 least sensitive categories

    } else if (key === 'more-sensitive') {
      console.log('more sensitive')

      cats = sensitiveCats.slice(0,50);
    }
    console.log(cats);

    const queryPromises = cats.map(cat => {
      return background.queryDatabase('getInferenceCount', {inference: cat});
    });

    const counts = await Promise.all(queryPromises); // lets all queries happen async

    const data = cats.map((cat, i) => {
      return {
        'inference': cat,
        'COUNT(inference)': counts[i]
      }
    });
    console.log(data)

    this.setState({
      inferences: data,
      selectedInference: false
    })
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

            <div>
              <h3>Filters</h3>
              <p>Sensitivity: <ButtonGroup onClick={this.handleSensitivitySelection}>
                <Button data-key='all-sensitive'>All Inferences</Button>
                <Button data-key='less-sensitive'>Less Sensitive Inferences</Button>
                <Button data-key='more-sensitive'>Sensitive Inferences</Button>
              </ButtonGroup></p>
            </div>

            {inferences && <InferencesSunburst inferenceCounts={inferences} onSelectionChange={this.handleSunburstSelection} selectedInference={selectedInference}/>}

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
