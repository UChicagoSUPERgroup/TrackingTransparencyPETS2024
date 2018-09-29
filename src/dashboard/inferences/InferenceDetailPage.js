import React from 'react'

import Text from '@instructure/ui-elements/lib/components/Text'
import ToggleDetails from '@instructure/ui-toggle-details/lib/components/ToggleDetails'

import colors from '../../colors'

export default class InferenceDetailPage extends React.Component {
  constructor (props) {
    super(props)
    this.wcRef = React.createRef()
    this.inference = this.props.match.params.name
    this.state = { }
  }

  async componentDidMount () {
    const queryObj = {inference: this.inference}
    const background = await browser.runtime.getBackgroundPage()
    this.DetailPage =  (await import(/* webpackChunkName: "dashboard/DetailPage" */'../components/DetailPage')).default

    const trackersP = background.queryDatabaseRecursive('getTrackersByInference', queryObj)
    const domainsP = background.queryDatabaseRecursive('getDomainsByInference', queryObj)
    const pagesP = background.queryDatabaseRecursive('getPagesByInference', queryObj)
    const interestDataP = import(/* webpackChunkName: "data/trackerData" */'../../data/interests/interests.json')

    const [trackers, domains, pages, interestData] =
      await Promise.all([trackersP, domainsP, pagesP, interestDataP])

    const interestInfo = interestData.default[this.inference]

    const metrics = [
      {
        name: 'Sites',
        value: domains.length
      }, {
        name: 'Pages',
        value: pages.length
      }, {
        name: 'Trackers',
        value: trackers.length
      }
    ]

    this.setState({
      trackers,
      domains,
      pages,
      metrics,
      interestInfo
    })
  }

  render () {
    const { metrics, trackers, domains, pages, interestInfo } = this.state
    const ready = !!pages

    if (!this.DetailPage || !ready) return 'Loading…'

    // these cutoffs are a bit haphazard
    let popularity
    if (interestInfo.impressions >= 10000000000) {
      popularity = 'very popular'
    } else if (interestInfo.impressions >= 1000000000) {
      popularity = 'popular'
    } else if (interestInfo.impressions >= 100000000) {
      popularity = 'somewhat popular'
    } else if (interestInfo.impressions >= 100000000) {
      popularity = 'not very popular'
    }
    const introText = <Text>We have found that <strong>{this.inference}</strong> is a <strong>{popularity}</strong> interest that companies could infer.</Text>

    return (
      <this.DetailPage
        pageType='inference'
        title={this.inference}
        description={introText}
        metrics={metrics}
        accentColor={colors.blue1}
        trackers={trackers}
        domains={domains}
        pages={pages}
        pageTableTitle={'What pages have you visited about ' + this.inference + '?'}
        pageTableSubtitle={'Pages that are likely about ' + this.inference}
        timeChartTitle={'When have you visited pages about ' + this.inference + '?'}
        timeChartSubtitle={'This graph shows the number of pages you visited over time that are likely about ' + this.inference + '.'}
      />
    )
  }
}

