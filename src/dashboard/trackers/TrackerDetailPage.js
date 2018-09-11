import React from 'react'

import Text from '@instructure/ui-elements/lib/components/Text'
import ToggleDetails from '@instructure/ui-toggle-details/lib/components/ToggleDetails'

import DetailPage from '../components/DetailPage'

export default class TrackerDetailPage extends React.Component {
  constructor (props) {
    super(props)
    this.wcRef = React.createRef()
    this.tracker = this.props.match.params.name
    this.state = { }
  }

  async componentDidMount () {
    const trackerData = await import(/* webpackChunkName: "data/trackerData" */'../../data/trackers/companyData.json')
    const trackerInfo = trackerData.default[this.tracker]

    this.setState({
      trackerInfo
    })
  }

  render () {
    const { trackerInfo } = this.state

    if (!trackerInfo) return null

    const starterMetrics = [{
      name: 'Type',
      value: trackerInfo.type
    }]

    const introText = trackerInfo.description
      ? <Text>
        {trackerInfo.description && <div>
          <div dangerouslySetInnerHTML={{__html: trackerInfo.description}} />
        </div>}

        {trackerInfo.notes && <ToggleDetails
          summary={'Who is ' + this.tracker + '?'}
        >
          <div dangerouslySetInnerHTML={{__html: trackerInfo.notes}} />
        </ToggleDetails>}
      </Text>
      : null

    return (
      <DetailPage
        pageType='trackers'
        title={this.tracker}
        description={introText}
        showInferences
        showDomains
        queryObj={{ tracker: this.tracker }}
        inferencesQuery='getInferencesByTracker'
        domainsQuery='getDomainsByTracker'
        timestampsQuery='getTimestampsByTracker'
        pagesQuery='getPagesByTracker'
        metrics={starterMetrics}
      />
    )
  }
}
