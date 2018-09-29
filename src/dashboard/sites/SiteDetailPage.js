import React from 'react'

import colors from '../../colors'

export default class SiteDetailPage extends React.Component {
  constructor (props) {
    super(props)
    this.wcRef = React.createRef()
    this.site = this.props.match.params.name
    this.state = { }
  }

  async componentDidMount () {
    const queryObj = {domain: this.site}
    const background = await browser.runtime.getBackgroundPage()
    this.DetailPage =  (await import(/* webpackChunkName: "dashboard/DetailPage" */'../components/DetailPage')).default

    const inferencesP = background.queryDatabase('getInferencesByDomain', queryObj)
    const trackersP = background.queryDatabase('getTrackersByDomain', queryObj)
    const pagesP = background.queryDatabase('getPagesByDomain', queryObj)

    const [inferences, trackers, pages] =
      await Promise.all([inferencesP, trackersP, pagesP])

    const metrics = [
      {
        name: 'Pages',
        value: pages.length
      }, {
        name: 'Interests',
        value: inferences.length
      }, {
        name: 'Trackers',
        value: trackers.length
      }
    ]

    this.setState({
      inferences,
      trackers,
      pages,
      metrics
    })
  }

  render () {
    const { metrics, inferences, trackers, pages } = this.state
    const ready = !!pages

    if (!this.DetailPage || !ready) return 'Loading…'

    return (
      <this.DetailPage
        pageType='site'
        title={this.site}
        accentColor={colors.orange1}
        metrics={metrics}
        inferences={inferences}
        trackers={trackers}
        pages={pages}
        pageTableTitle={'What pages have you visited on ' + this.site + '?'}
        pageTableSubtitle={'Visited pages on ' + this.site}
        timeChartTitle={'When have you visited ' + this.site + '?'}
        timeChartSubtitle={'This graph shows the number of pages visited over time on this site.'}
      />
    )
  }
}
