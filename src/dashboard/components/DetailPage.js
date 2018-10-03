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
//import {hashit, hashit_salt} from '../../background/instrumentation';

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
    let hashedTitle = 'not hashed yet'
    if (pageType=="site"){
      console.log('this is alright ', pageType);
      hashedTitle = await background.hashit_salt(this.props.title)
    }else{
      hashedTitle = await background.hashit(this.props.title)
    }
    console.log(hashedTitle);
    let sendDict = {
      pageType: pageType,
      hashedTitle: hashedTitle
    }
    let temp = []
    temp = this.state.metrics
    let summaryStat={}
    for (let i = 0; i < temp.length; i++) {
        let value = temp[i]
        summaryStat[value['name']]=value['value']
   }
   sendDict['summary']=summaryStat

    if (this.state.showInferences){
        temp = this.state.inferences
        let numInferences = temp.length
        let hashedInferences=[]
        for (let i = 0; i < temp.length; i++) {
         //let value = await background.hashit(domains[i]['inference'])
         let value = temp[i]
         value['name'] = await background.hashit(value['name'])//hash it
         hashedInferences.push(value)
       }
       //sendDict['numInferences']=numInferences;
       sendDict['hashedInferences']=JSON.stringify(hashedInferences);
    }
/*
    if (this.state.showTrackers){
        temp = this.state.trackers
        let numTrackers = temp.length
        let hashedTrackers=[]
        for (let i = 0; i < temp.length; i++) {
         //let value = await background.hashit(domains[i]['inference'])
         let value = temp[i]
         hashedTrackers.push(value)
       }
       //sendDict['numTrackers']=numTrackers;
       //sendDict['hashedTrackers']=JSON.stringify(hashedTrackers);
    }
    if (this.state.showDomains){
        temp = this.state.domains
        let numDomains = temp.length
        let hashedDomains=[]
        for (let i = 0; i < temp.length; i++) {
         //let value = await background.hashit(domains[i]['inference'])
         let value = temp[i]
         hashedDomains.push(value)
       }
       //sendDict['numDomains']=numDomains;
       //sendDict['hashedDomains']=JSON.stringify(hashedDomains);
    }
*/
    let activityType = 'open detail page for ' + pageType
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
            {inferences && <GridCol width={6}>
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
            {domains && <GridCol width={6}>
              <TTPanel>
                <SmallGraphAndTable
                  name='Sites'
                  description='TODO: description'
                  data={domains}
                  c1Header='Site'
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

  pageTableTitle: PropTypes.string,
  pageTableSubtitle: PropTypes.string,
  timeChartTitle: PropTypes.string,
  timeChartSubtitle: PropTypes.string
}
