import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Link from '@instructure/ui-elements/lib/components/Link'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import FormFieldGroup from '@instructure/ui-forms/lib/components/FormFieldGroup'
import RadioInput from '@instructure/ui-forms/lib/components/RadioInput'
import RadioInputGroup from '@instructure/ui-forms/lib/components/RadioInputGroup'
import Tooltip from '@instructure/ui-overlays/lib/components/Tooltip'
import IconArrowOpenEnd from '@instructure/ui-icons/lib/Solid/IconArrowOpenEnd'
import IconInfo from '@instructure/ui-icons/lib/Solid/IconInfo'

import InferenceSummary from './InferenceSummary'
import InferencesSunburst from './InferencesSunburst'
import TTPanel from '../components/TTPanel'

import logging from '../dashboardLogging'

export default class InferencesOverview extends React.Component {
  constructor (props) {
    super(props)
    this.inferenceCount = 100
    this.state = {
      selectedInference: false,
      inferences: null,
      sensitivitySelection: 'all-sensitive',
      dateSelection: 'all-dates',
      numInferences: null
    }

    this.handleSunburstSelection = this.handleSunburstSelection.bind(this)
    this.handleSensitivitySelection = this.handleSensitivitySelection.bind(this)
    this.handleDateSelection = this.handleDateSelection.bind(this)
    this.handleInferenceLinkClick = this.handleInferenceLinkClick.bind(this)
  }

  async getInferences () {
    const background = await browser.runtime.getBackgroundPage()
    background.queryDatabase('getNumberOfInferences', {}).then(i => {
      this.setState({
        numInferences: i
      })
    })
    background.queryDatabase('getInferences', {count: this.inferenceCount}).then(i => {
      this.topInferences = i
      this.setState({
        inferences: i
      })
    })
  }

  InferenceLink (inference) {
    return (
      <a className='inferencePageTopTextInferenceLink' key={inference} onClick={this.handleInferenceLinkClick}>{inference}</a>
    )
  }

  handleInferenceLinkClick (e) {
    e.preventDefault()
    const inference = e.currentTarget.text
    this.setState({selectedInference: inference})
  }

  handleSunburstSelection (inference) {
    this.setState({selectedInference: inference})
  }

  async handleSensitivitySelection (event) {
    let cats
    const key = event.target.value

    const background = await browser.runtime.getBackgroundPage()
    const sensitiveCats = (await import(/* webpackChunkName: "data/sensitiveCats" */'../../data/categories_comfort_list.json')).default

    if (key === 'all-sensitive') {
      // reset to default
      this.setState({
        inferences: this.topInferences,
        selectedInference: false,
        sensitivitySelection: key,
        dateSelection: 'all-dates'
      })
      return
    } else if (key === 'less-sensitive') {
      cats = sensitiveCats.slice(-50).reverse() // 50 least sensitive categories
    } else if (key === 'more-sensitive') {
      cats = sensitiveCats.slice(0, 50)
    }

    const queryPromises = cats.map(cat => {
      return background.queryDatabase('getInferenceCount', {inference: cat})
    })

    const counts = await Promise.all(queryPromises) // lets all queries happen async

    const data = cats.map((cat, i) => {
      return {
        'inference': cat,
        'COUNT(inference)': counts[i]
      }
    })

    this.setState({
      inferences: data,
      selectedInference: false,
      sensitivitySelection: key,
      dateSelection: 'all-dates'
    })
  }

  async handleDateSelection (event) {
    let afterDate
    const key = event.target.value

    const background = await browser.runtime.getBackgroundPage()

    if (key === 'all-dates') {
      // reset to default
      afterDate = 0
    } else if (key === 'past-24') {
      afterDate = Date.now() - 86400000
    } else if (key === 'past-week') {
      afterDate = Date.now() - 86400000 * 7
    // } else if (key === 'past-month') {
    //   afterDate = Date.now() - 86400000 * 7 * 30
    }

    const data = await background.queryDatabase('getInferences', {count: this.inferenceCount, afterDate: afterDate})

    this.setState({
      inferences: data,
      selectedInference: false,
      sensitivitySelection: 'all-sensitive',
      dateSelection: key
    })
  }

  async componentDidMount () {
    let activityType = 'load dashboard inferences page'
    logging.logLoad(activityType, {})
    this.getInferences()
  }

  render () {
    let { inferences, selectedInference, numInferences } = this.state

    const sensitivityTooltipText = (
      <div style={{width: 160}}>
        Our previous research has found that there are certain inferences that users are more comfortable with, and others that are more sensitive.
        Toggle between these filters to show only inferences that are more or less sensitive.
      </div>
    )

    const sensitivityTooltip = (
      <Tooltip
        tip={sensitivityTooltipText}
        variant='inverse'
        placement='end'
      >
        Inference sensitivity <IconInfo />
      </Tooltip>
    )

    const recencyTooltipText = (
      <div style={{width: 160}}>
        Toggle between these filters to show inferences made about you since you've installed Tracking Transparency, only in the last day, or only in the last week.
      </div>
    )

    const recencyTooltip = (
      <Tooltip
        tip={recencyTooltipText}
        variant='inverse'
        placement='end'
      >
        Recency of Inferences <IconInfo />
      </Tooltip>
    )

    const filters = (<TTPanel textAlign='start' className={'inferences-sunburst-filters'}>
      <FormFieldGroup description='Filters'>
        <RadioInputGroup
          name='sensitivity-filter'
          value={this.state.sensitivitySelection}
          onChange={this.handleSensitivitySelection}
          description={sensitivityTooltip}
          variant='toggle'
          size='small'>
          <RadioInput label='All inferences' value='all-sensitive' context='off' />
          <RadioInput label='Less sensitive' value='less-sensitive' context='off' />
          <RadioInput label='More sensitive' value='more-sensitive' context='off' />
        </RadioInputGroup>
        <RadioInputGroup
          name='date-filter'
          value={this.state.dateSelection}
          onChange={this.handleDateSelection}
          description={recencyTooltip}
          variant='toggle'
          size='small'>
          <RadioInput label='Since install' value='all-dates' context='off' />
          <RadioInput label='Last day' value='past-24' context='off' />
          <RadioInput label='Last week' value='past-week' context='off' />
          {/* <RadioInput label='Last month' value='past-month' context='off' /> */}
        </RadioInputGroup>
      </FormFieldGroup>
    </TTPanel>)

    return (
      <Grid startAt='large'>
        <GridRow>
          <GridCol>
            <Heading level='h1'>What could they have learned?</Heading>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol>
            <TTPanel>
              <Text>
                <p>Trackers collect information about the pages you visit in order to make guesses about things you might be interested in. These guesses, or inferences, are then used to show you targeted ads, to do web analytics, and more. Our algorithms have determined <strong>{numInferences} topics</strong> that trackers might have inferred you are interested in.</p>
                {inferences && inferences.length >= 3 && <p> {this.InferenceLink(inferences[0].inference)}, {this.InferenceLink(inferences[1].inference)}, and {this.InferenceLink(inferences[2].inference)} were among the most frequent topics that our algorithm determined the pages you visited recently are about.</p>}
              </Text>

            </TTPanel>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol width='auto'>
            <TTPanel textAlign='center'>
              {/* <Text>This diagram shows some of the inferences that may have been made about your browsing and their frequency. Click on a piece of the chart to see more details.</Text> */}
              {inferences && <InferencesSunburst inferenceCounts={inferences} onSelectionChange={this.handleSunburstSelection} selectedInference={selectedInference} />}
            </TTPanel>
            {filters}
          </GridCol>
          <GridCol>
            <TTPanel textAlign='start'>
              {!selectedInference && <Text className='selected-inference' weight='bold'>
                  The Inference Wheel shows inferences that trackers may have made about you, based on your browsing activity. Click a slice of the wheel to see more details. </Text>}
              {selectedInference && <div>
                <InferenceSummary inference={selectedInference} />
                <Link
                  className='inferencePageSelected-Inference'
                  href={'#/inferences/' + selectedInference}
                  icon={IconArrowOpenEnd}
                  iconPlacement='end'
                >
                    Learn more
                </Link>
              </div>}
            </TTPanel>
          </GridCol>
        </GridRow>
      </Grid>
    )
  }
}
