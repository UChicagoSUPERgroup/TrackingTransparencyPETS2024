import React from 'react'
import Text from '@instructure/ui-elements/lib/components/Text'
import Heading from '@instructure/ui-elements/lib/components/Heading'

import alexa from 'alexarank'

import colors from '../../colors'


export default class SiteDetailPage extends React.Component {
  constructor (props) {
    super(props)
    this.wcRef = React.createRef()
    this.site = this.props.match.params.name
    this.state = { }
  }

  async componentDidMount () {
    const { hideInferenceContent, hideTrackerContent } = this.props

    const queryObj = {domain: this.site}
    const background = await browser.runtime.getBackgroundPage()
    this.DetailPage =  (await import(/* webpackChunkName: "dashboard/DetailPage" */'../components/DetailPage')).default

    const inferencesP = !hideInferenceContent ? background.queryDatabase('getInferencesByDomain', queryObj) : null
    const trackersP = !hideTrackerContent ? background.queryDatabase('getTrackersByDomain', queryObj) : null
    const pagesP = background.queryDatabase('getPagesByDomain', queryObj)

    const [inferences, trackers, pages] =
      await Promise.all([inferencesP, trackersP, pagesP])

    const metrics = [
      {
        name: 'Pages',
        value: pages.length
      }
    ]
    if (inferences) {
      metrics.push({
        name: 'Interests',
        value: inferences.length
      })
    }
    if (trackers) {
      metrics.push({
        name: 'Trackers',
        value: trackers.length
      })
    }

    alexa(this.site, (error, result) => {
      if (!error) {
        let num = result.rank
        let lastDigit = num % 10
        let ending

        switch (lastDigit) {
          case 1:
            ending = "st"
            break
          case 2:
            ending = "nd"
            break
          case 3:
            ending = "rd"
            break
          default:
            ending = "th"
        }

          this.setState({
            rank: (num.toString())+ending
          })
      } else {
          console.log(error);
      }
    })

    this.setState({
      inferences,
      trackers,
      pages,
      metrics
    })
  }

  render () {
    const { metrics, inferences, trackers, pages, rank } = this.state
    const ready = !!pages

    if (!this.DetailPage || !ready) return 'Loading…'

    const introText = (
      <Text>
        <p>You have visited <strong>{pages.length} pages</strong> on {this.site} since installing this extension.</p>
        <p>{this.site} the <strong>{rank}</strong> most popular site on the web, according to <a href='https://www.alexa.com/about'>Alexa</a>. </p>
      </Text>
    )

    return (
      <this.DetailPage
        pageType='site'
        title={this.site}
        icon='window-maximize'
        accentColor={colors.orange1}
        metrics={metrics}
        inferences={inferences}
        trackers={trackers}
        pages={pages}
        description={introText}
        pageTableTitle={'What pages have you visited on ' + this.site + '?'}
        pageTableSubtitle={'Visited pages on ' + this.site}
        timeChartTitle={'When have you visited ' + this.site + '?'}
        timeChartSubtitle={'This graph shows the number of pages visited over time on this site.'}
      />
    )
  }
}
