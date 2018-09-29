import React from 'react'
import PropTypes from 'prop-types'
import { SizeMe } from 'react-sizeme'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'

import logging from '../dashboardLogging'
import Metrics from '../components/Metrics'
import PageTable from '../components/PageTable'
import PageTimeGraph from '../components/PageTimeGraph'
import SmallGraphAndTable from '../components/SmallGraphAndTable'
import TTPanel from '../components/TTPanel'
import TTPanel2 from '../components/TTPanel2'
import WordCloud from '../components/WordCloud'

export default class DetailPage extends React.Component {
  constructor (props) {
    super(props)
    const { metrics, inferences, domains, trackers, pages } = props
    const timestamps = pages.map(x => x.id).sort((a, b) => a - b)
    this.state = {
      metrics,
      inferences,
      domains,
      trackers,
      pages,
      timestamps,
      showDomains: !!domains,
      showInferences: !!inferences,
      showTrackers: !!trackers
    }
    this.renderPageTable = this.renderPageTable.bind(this)
    this.renderPageTimeGraph = this.renderPageTimeGraph.bind(this)
  }

  async componentWillUnmount () {}

  async componentDidMount () {
    const background = await browser.runtime.getBackgroundPage()

    // LOGGING
    let pageType = this.props.pageType
    let hashedTitle = background.hashit(this.props.title)
    // let numDomains = domains.length
    // let hashedInferences = []
    // for (let i = 0; i < inferences.length; i++) {
    //   let value = await background.hashit(inferences[i]['inference'])
    //   hashedInferences.push(value)
    // }
    let sendDict = {
      pageType: pageType,
      hashedTitle: hashedTitle
      // 'numDomainsShown': numDomains,
      // 'hashedInferencesShown': JSON.stringify(hashedInferences)
    }
    let activityType = 'open detail page' + pageType
    logging.logLoad(activityType, sendDict)
  }

  renderPageTable () {
    const { title, pageTableTitle, pageTableSubtitle } = this.props
    const { pages, showDomains, showInferences } = this.state
    return (
      <TTPanel>
        <Heading level='h2' margin='0 0 medium 0'>{pageTableTitle}</Heading>
        <PageTable
          title={pageTableSubtitle}
          data={pages}
          showSite={showDomains}
          showInference={showInferences}
        />
      </TTPanel>
    )
  }

  renderPageTimeGraph () {
    const { title, timeChartTitle, timeChartSubtitle, accentColor } = this.props
    const { timestamps } = this.state
    return (
      <TTPanel>
        <Heading level='h2' margin='0 0 medium 0'>{timeChartTitle}</Heading>
        <Text>{timeChartSubtitle}</Text>
        {timestamps.length > 0 && <PageTimeGraph
          timestamps={timestamps}
          color={accentColor}
        />}
      </TTPanel>
    )
  }

  render () {
    const { title, description, accentColor } = this.props
    const { domains, inferences, trackers, metrics } = this.state
    const ready = !!metrics
    if (!ready) return <Text>Loading…</Text>

    return (
      <div>
        <Grid>
          <GridRow>
            <GridCol>
              <TTPanel2><Heading level='h1'>Your <em><strong> {title}</strong></em> Profile</Heading></TTPanel2>
              {/* <Heading level='h1'>{title}</Heading> */}
            </GridCol>
            <GridCol margin='auto'>
              <Metrics metrics={metrics} />
            </GridCol>
          </GridRow>
          <GridRow>
            {description && <GridCol>
              <TTPanel>
                {description}
              </TTPanel>
            </GridCol>}
          </GridRow>
          <GridRow>
            {inferences && <GridCol width={6}>
              <TTPanel>
                <Heading level='h2'>What does {title} think your interests are?</Heading>
                <SizeMe>
                  {({ size }) => (
                    <WordCloud
                      data={inferences}
                      height={496}
                      width={size.width}
                    />
                  )}
                </SizeMe>
              </TTPanel>
            </GridCol>}
            {domains && <GridCol width={6}>
              <TTPanel>
                <SmallGraphAndTable
                  name='Sites'
                  description='TODO: description'
                  data={domains}
                  c1Header='On which sites were you tracked?'
                  urlStem='#/sites/'
                  color={accentColor}
                />
              </TTPanel>
            </GridCol>}
            {trackers && <GridCol width={6}>
              <TTPanel>
                <SmallGraphAndTable
                  name='Trackers'
                  description='TODO: description'
                  data={trackers}
                  c1Header='Which trackers could have guessed you have this interest?'
                  urlStem='#/trackers/'
                  color={accentColor}
                />
              </TTPanel>
            </GridCol>}
          </GridRow>
          <GridRow>
            <GridCol>
              {this.renderPageTable()}
            </GridCol>
          </GridRow>
          <GridRow>
            <GridCol>
              {this.renderPageTimeGraph()}
            </GridCol>
          </GridRow>
        </Grid>
      </div>
    )
  }
}

DetailPage.propTypes = {
  title: PropTypes.string.isRequired,
  pageType: PropTypes.string.isRequired,
  description: PropTypes.element,
  accentColor: PropTypes.string,
  metrics: PropTypes.array.isRequired,

  inferences: PropTypes.array,
  domains: PropTypes.array,
  trackers: PropTypes.array,
  pages: PropTypes.array,

  pageTableTitle: PropTypes.string,
  pageTableSubtitle: PropTypes.string,
  timeChartTitle: PropTypes.string,
  timeChartSubtitle: PropTypes.string
}
