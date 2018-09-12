import React from 'react'

import Text from '@instructure/ui-elements/lib/components/Text'
import ToggleDetails from '@instructure/ui-toggle-details/lib/components/ToggleDetails'

import colors from '../../colors'
import DetailPage from '../components/DetailPage'

export default class TrackerDetailPage extends React.Component {
  constructor (props) {
    super(props)
    this.wcRef = React.createRef()
    this.inference = this.props.match.params.name
    this.state = { }
  }

  async componentDidMount () {
    const queryObj = {inference: this.inference}
    const background = await browser.runtime.getBackgroundPage()

    const trackersP = background.queryDatabase('getTrackersByInference', queryObj)
    const domainsP = background.queryDatabase('getDomainsByInference', queryObj)
    const pagesP = background.queryDatabase('getPagesByInference', queryObj)

    const [trackers, domains, pages] =
      await Promise.all([trackersP, domainsP, pagesP])

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
    console.log(trackers, domains, pages)

    this.setState({
      trackers,
      domains,
      pages,
      metrics
    })
  }

  render () {
    const { metrics, trackers, domains, pages } = this.state
    const ready = !!pages

    if (!ready) return null

    return (
      <DetailPage
        pageType='inference'
        title={this.inference}
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

