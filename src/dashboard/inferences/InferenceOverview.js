import React from 'react';
import { Route, Link } from 'react-router-dom';

import Breadcrumb from 'react-bootstrap/lib/Breadcrumb';
import ToggleButton from 'react-bootstrap/lib/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/lib/ToggleButtonGroup';

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'

import InferenceDetails from './InferenceDetails';
import InferencesSunburst from './InferencesSunburst';

import logging from '../dashboardLogging';

export default class InferencesOverview extends React.Component {
  constructor(props) {
    super(props);
    this.inferenceCount = 100;
    this.state = {
      selectedInference: false,
      inferences: null,
      sensitivitySelection: 'all-sensitive',
      dateSelection: 'all-dates'
    };

    this.handleSunburstSelection = this.handleSunburstSelection.bind(this);
    this.handleSensitivitySelection = this.handleSensitivitySelection.bind(this);
    this.handleDateSelection = this.handleDateSelection.bind(this);
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
      <a className = "inferencePageTopTextInferenceLink" key={inference} onClick={this.handleInferenceLinkClick}>{inference}</a>
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

  async handleSensitivitySelection(key) {

    let cats;

    const background = await browser.runtime.getBackgroundPage();
    const sensitiveCats = (await import(/* webpackChunkName: "data/sensitiveCats" */'../../data/categories_comfort_list.json')).default

    if (key === 'all-sensitive') {
      console.log('all sensitive')
      // reset to default
      this.setState({
        inferences: this.topInferences,
        selectedInference: false,
        sensitivitySelection: key,
        dateSelection: 'all-dates'
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
      selectedInference: false,
      sensitivitySelection: key,
      dateSelection: 'all-dates'
    })
  }

  async handleDateSelection(key) {

    let afterDate;

    const background = await browser.runtime.getBackgroundPage();

    if (key === 'all-dates') {
      // reset to default
      afterDate = 0;

    } else if (key === 'past-24') {
      afterDate = Date.now() - 86400000;

    } else if (key === 'past-week') {
      afterDate = Date.now() - 86400000 * 7;
    }

    console.log(key)
    const data = await background.queryDatabase('getInferences', {count: this.inferenceCount, afterDate: afterDate});

    this.setState({
      inferences: data,
      selectedInference: false,
      sensitivitySelection: 'all-sensitive',
      dateSelection: key
    })
  }

  async componentDidMount() {
    let activityType='load dashboard inferences page';
    logging.logLoad(activityType, {});
    this.getInferences();
  }

  render() {
    let {inferences, selectedInference} = this.state;

    return(
      <div>
        <Route path={`${this.props.match.url}/:name`} component={InferenceDetails}/>
        <Route exact path={this.props.match.url} render={() => (
          <div>
            <Breadcrumb>
              <Breadcrumb.Item><Link to={{pathname: '/'}}>Home</Link></Breadcrumb.Item>
              <Breadcrumb.Item active>Inferences</Breadcrumb.Item>
            </Breadcrumb>
            <Heading level='h1'>What could they have learned?</Heading>
            <Text>
            <p>Trackers collect information about the pages you visit in order to make guesses about things you might be interested in. These guesses, or inferences, are then used to show you targeted ads, to do web analytics, and more. Our algorithms have determined <strong>{this.inferenceCount} topics</strong> that trackers might have inferred you are interested in.</p>
            {inferences && inferences.length >= 3 && <p> {this.InferenceLink(inferences[0].inference)}, {this.InferenceLink(inferences[1].inference)}, and {this.InferenceLink(inferences[2].inference)} were among the most frequent topics that our algorithm determined the pages you visited recently are about.</p>}
          </Text>
            {/* {inferences && <div className='suggested-inferences'>
              <p><strong>Suggested inferences to explore:</strong></p>
              <ul>
                <li>{inferences[0].inference}</li>
                <li>{inferences[1].inference}</li>
                <li>{inferences[2].inference}</li>
              </ul>
            </div>} */}

            <Grid startAt='large'>
              <GridRow>
                <GridCol>
                  {inferences && <InferencesSunburst inferenceCounts={inferences} onSelectionChange={this.handleSunburstSelection} selectedInference={selectedInference}/>}
                </GridCol>
                <GridCol>
                  <div className={'inferences-sunburst-filters'}>
                    <p className={'selected-inference'}><strong>{selectedInference ? 'Click the link below to learn more about this inference.' : 'Click a slice of the inference wheel to see inferences that trackers could have made about you.'}</strong></p>
                    <p><strong><Link className = "inferencePageSelected-Inference" to={{pathname: '/inferences/' + selectedInference}}>{selectedInference}</Link></strong></p>
                    <p><br /><br /><br /><br /><br /><br /></p>

                    <h3>Inference Wheel Filters</h3>
                    <div className={'filter-row'}>Inference sensitivity: <ToggleButtonGroup
                      name="sensitivity-filter"
                      value={this.state.sensitivitySelection}
                      onChange={this.handleSensitivitySelection}
                      defaultValue={'all-sensitive'}>
                      <ToggleButton className = "inferencePageSensitivityChoose" value={'all-sensitive'} bsSize="small">All inferences</ToggleButton>
                      <ToggleButton className = "inferencePageSensitivityChoose" value={'less-sensitive'} bsSize="small">Less sensitive</ToggleButton>
                      <ToggleButton className = "inferencePageSensitivityChoose" value={'more-sensitive'} bsSize="small">More sensitive</ToggleButton>
                    </ToggleButtonGroup></div>
                    <div className={'filter-row'}>Recency of inferences: <ToggleButtonGroup
                      name="date-filter"
                      value={this.state.dateSelection}
                      onChange={this.handleDateSelection}
                      defaultValue={'all-dates'}>
                      <ToggleButton className = "inferencePageDateChoose" value={'all-dates'} bsSize="small">Since you installed the plugin</ToggleButton>
                      <ToggleButton className = "inferencePageDateChoose" value={'past-24'} bsSize="small">Last 24 hours</ToggleButton>
                      <ToggleButton className = "inferencePageDateChoose" value={'past-week'} bsSize="small">Last week</ToggleButton>
                    </ToggleButtonGroup></div>
                  </div>
                </GridCol>
              </GridRow>
            </Grid>

            {/* {selectedInference && <InferenceDetails inference={selectedInference}/>} */}
            {/* {this.state.inferences && <InferencesSunburst inferencesList={this.state.inferences}/>} */}
            {/* <InferencesSunburst inferencesList={this.state.inferences}/> */}
            {/* {this.state.inferences.map(inference => InferencesListItem(inference))} */}
          </div>
        )}/>


      </div>
    );
  }
}
