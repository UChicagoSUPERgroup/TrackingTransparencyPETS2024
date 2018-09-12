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
import WordCloud from '../components/WordCloud'

export default class DetailPage extends React.Component {
  constructor (props) {
    super(props)
    const { metrics, inferences, domains, trackers, pages, timestamps } = props
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
    const { title, timeChartTitle, timeChartSubtitle } = this.props
    const { timestamps } = this.state
    return (
      <TTPanel>
        <Heading level='h2' margin='0 0 medium 0'>{timeChartTitle}</Heading>
        <Text>{timeChartSubtitle}</Text>
        {timestamps.length > 0 && <PageTimeGraph
          timestamps={timestamps}
        />}
      </TTPanel>
    )
  }

  render () {
    const { title, description, accentColor } = this.props
    const { domains, inferences, trackers, metrics } = this.state
    const ready = !!metrics
    if (!ready) return 'Loading…'

    return (
      <div>
        <Grid>
          <GridRow>
            <GridCol>
              <Heading level='h1'>{title}</Heading>
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
            {inferences && <GridCol>
              <TTPanel>
                <Heading level='h2'>Inferences</Heading>
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
            {domains && <GridCol>
              <TTPanel>
                <SmallGraphAndTable
                  name='Sites'
                  description='TODO: description'
                  data={domains}
                  c1Header='Site'
                  urlStem='#/domains/'
                  color={accentColor}
                />
              </TTPanel>
            </GridCol>}
            {trackers && <GridCol>
              <TTPanel>
                <SmallGraphAndTable
                  name='Trackers'
                  description='TODO: description'
                  data={trackers}
                  c1Header='Site'
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
  timestamps: PropTypes.array,

  pageTableTitle: PropTypes.string,
  pageTableSubtitle: PropTypes.string,
  timeChartTitle: PropTypes.string,
  timeChartSubtitle: PropTypes.string
}
