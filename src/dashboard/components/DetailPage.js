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
    this.wcRef = React.createRef()
    this.state = {
      inferences: [],
      domains: [],
      pages: [],
      timestamps: [],
      metrics: props.metrics
    }
    // this.logLoad = this.logLoad.bind(this);
    this.renderPageTable = this.renderPageTable.bind(this)
  }

  async componentWillUnmount () {}

  async componentDidMount () {
    const { showInferences, showDomains, showTrackers } = this.props
    const { queryObj, inferencesQuery, domainsQuery, trackersQuery, timestampsQuery, pagesQuery } = this.props
    const background = await browser.runtime.getBackgroundPage()

    let inferences, domains, trackers
    let metrics = this.state.metrics
    if (showInferences) {
      inferences = await background.queryDatabase(inferencesQuery, queryObj)
      metrics = metrics.concat([{ name: 'Inferences', value: inferences.length }])
    }
    if (showDomains) {
      domains = await background.queryDatabase(domainsQuery, queryObj)
      metrics = metrics.concat([{ name: 'Sites', value: domains.length }])
    }
    const pages = await background.queryDatabase(pagesQuery, queryObj)
    metrics = metrics.concat([{ name: 'Pages', value: pages.length }])
    if (showTrackers) {
      domains = await background.queryDatabase(trackersQuery, queryObj)
      metrics = metrics.concat([{ name: 'Trackers', value: trackers.length }])
    }

    const timestamps = await background.queryDatabase(timestampsQuery, queryObj)
    const timestamps2 = timestamps.map(x => parseInt(x.Pages.id))

    this.setState({
      inferences: inferences,
      domains: domains,
      timestamps: timestamps2,
      pages: pages,
      metrics: metrics
    })

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
    const { title, showDomains, showInferences } = this.props
    const { pages } = this.state
    return (
      <TTPanel>
        <Heading level='h2' margin='0 0 medium 0'>Where has {title} tracked you?</Heading>
        <PageTable
          title={'Pages where ' + title + ' trackers were present'}
          data={pages}
          showSite={showDomains}
          showInference={showInferences}
        />
      </TTPanel>
    )
  }

  renderPageTimeGraph () {
    const { title } = this.props
    const { timestamps } = this.state
    return (
      <TTPanel>
        <Heading level='h2' margin='0 0 medium 0'>When has {title} tracked you?</Heading>
        <Text>The following graph shows the number of pages over time where {title} has tracked you.</Text>
        {timestamps.length > 0 && <PageTimeGraph
          timestamps={timestamps}
        />}
      </TTPanel>
    )
  }

  render () {
    const { title, description } = this.props
    const { showInferences, showDomains, showTrackers } = this.props
    const { domains, inferences, trackers, metrics } = this.state
    const ready = domains && inferences
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
            {showInferences && <GridCol>
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
            {showDomains && <GridCol>
              <TTPanel>
                <SmallGraphAndTable
                  name='Sites'
                  description='TODO: description'
                  data={domains}
                  c1Header='Site'
                  urlStem='#/domains/'
                />
              </TTPanel>
            </GridCol>}
            {showTrackers && <GridCol>
              <TTPanel>
                <SmallGraphAndTable
                  name='Trackers'
                  description='TODO: description'
                  data={trackers}
                  c1Header='Site'
                  urlStem='#/trackers/'
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

  showInferences: PropTypes.bool,
  showDomains: PropTypes.bool,
  showTrackers: PropTypes.bool,

  inferencesQuery: PropTypes.string,
  domainsQuery: PropTypes.string,
  trackersQuery: PropTypes.string,
  timestampsQuery: PropTypes.string,
  pagesQuery: PropTypes.string,

  metrics: PropTypes.array
}
