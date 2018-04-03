import React from 'react';
import { Route, Link } from 'react-router-dom';

import ToggleButton from 'react-bootstrap/lib/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/lib/ToggleButtonGroup';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

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
      inferences: null,
      sensitivitySelection: 'all-sensitive',
      dateSelection: 'all-dates'
    };

    this.handleSunburstSelection = this.handleSunburstSelection.bind(this);
    this.handleSensitivitySelection = this.handleSensitivitySelection.bind(this);
    this.handleDateSelection = this.handleDateSelection.bind(this);
    this.handleInferenceLinkClick = this.handleInferenceLinkClick.bind(this);
    this.logLoad = this.logLoad.bind(this);
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
    this.getInferences();
    this.logLoad();
  }

    /******* BEGIN Instrumentation  **************/
  async logLoad() {
      const background = await browser.runtime.getBackgroundPage();
      let {inferences, selectedInference} = this.state;
      //const inferences = await background.queryDatabase('getInferences', {});
      //console.log('trackers page', numTrackersShown);
      let userParams = await browser.storage.local.get({
        usageStatCondition: "no monster",
        userId: "no monster",
        startTS: 0
      });
      const tabs = await browser.tabs.query({active: true, currentWindow: true});
      let parentTabId = tabs[0].openerTabId;
      let tabId = tabs[0].id;
      let x = 'clickData_tabId_'+String(tabId);
      let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain':'','tabId':tabId,'pageId':'','numTrackers':0})});
      tabData = JSON.parse(tabData[x]);
      if (JSON.parse(userParams.usageStatCondition)){//get data when the user click on the button.
        let activityType='load dashboard inferences page';
        let timestamp=Date.now();
        let userId=userParams.userId;
        let startTS=userParams.startTS;
        let activityData={
          'tabId': tabId,
          'parentTabId':parentTabId,
          'parentDomain':tabData.domain,
          'parentPageId':tabData.pageId,
          'parentNumTrackers':tabData.numTrackers
        };
        background.logData(activityType, timestamp, userId, startTS, activityData);
      }
    }

          /******* END Instrumentation  **************/

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

            <Grid>
              <Row>
                <Col md={6} mdPush={6}>
                  <div className={'inferences-sunburst-filters'}>
                    <h3>Filters</h3>
                    <div className={'filter-row'}>Inferences sensitivity: <ToggleButtonGroup
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

                  <p className={'selected-inference'}><em>{selectedInference ? 'Click on the diagram to unselect the current category' : 'Click a category to see more information'}</em></p>
                  <p><strong><Link className = "inferencePageSelected-Inference" to={{pathname: '/inferences/' + selectedInference}}>{selectedInference}</Link></strong></p>
                </Col>
                <Col md={6} mdPull={6}>
                  {inferences && <InferencesSunburst inferenceCounts={inferences} onSelectionChange={this.handleSunburstSelection} selectedInference={selectedInference}/>}
                </Col>
              </Row>
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


export default InferencesPage;
