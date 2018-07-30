import React from 'react'
import { Link } from 'react-router-dom'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import MetricsList from '@instructure/ui-elements/lib/components/MetricsList'
import MetricsListItem from '@instructure/ui-elements/lib/components/MetricsList/MetricsListItem'

import TTPanel from '../components/TTPanel'
import categories from '../../data/categories_comfort_list.json'


const SensitivePanel = (inference) => {
  let sensitiveCategories = categories.slice(0, 20)
  let sensitive = !!((inference && sensitiveCategories.includes(inference)))
  return (
    <TTPanel>
      <Text><em>{inference}</em>
        {sensitive
          ? ' may be considered a sensitive topic.'
          : ' is likely not a sensitive topic.'
        }</Text>
    </TTPanel>
  )
}

export default class InferenceSummary extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      trackers: false,
      timestamps: false,
      topSites: false
    }

    this.updateData = this.updateData.bind(this)
  }

  componentDidMount () {
    this.updateData()
  }

  async updateData () {
    const background = await browser.runtime.getBackgroundPage()
    const { inference } = this.props

    const trackers = background.queryDatabaseRecursive('getTrackersByInference', {inference: inference})
    trackers.then(tr => this.setState({
      trackers: tr
    }))
    const topSites = background.queryDatabaseRecursive('getDomainsByInference', {inference: inference})
    topSites.then(ts => this.setState({
      topSites: ts
    }))
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.inference) {
      this.setState({
        inference: nextProps.inference
      })
    }
    this.updateData()
  }

  render () {
    const { inference } = this.props
    const { trackers, timestamps, topSites } = this.state

    let content

    /* inadequate data/error conditions */

    if (!inference) {
      content = (
        <p>This category does not exist.</p>
      )

    /* main condition */
    } else {
      content = (
        <div>
          <MetricsList>
            <MetricsListItem label='Sites' value={topSites.length} />
            <MetricsListItem label='Trackers' value={trackers.length} />
          </MetricsList>
          <Text>
            <p>Our algorithms have found ??? pages that are likely about {inference}. On these pages, there were a total of {trackers.length} unique trackers that could have inferred your level of interest in {inference}.</p>
            <p>This topic is </p>
          </Text>
        </div>
      )
    }

    return (<div>
      <Heading level='h2' margin='0 0 medium 0'>{inference}</Heading>
      {content}
    </div>)
  }
}
