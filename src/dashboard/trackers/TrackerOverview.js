import React from 'react'
import { Route } from 'react-router-dom'

import Button from '@instructure/ui-buttons/lib/components/Button'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import IconArrowOpenEnd from '@instructure/ui-icons/lib/Solid/IconArrowOpenEnd'
import IconInfo from '@instructure/ui-icons/lib/Solid/IconInfo'
import NumberInput from '@instructure/ui-forms/lib/components/NumberInput'
import Text from '@instructure/ui-elements/lib/components/Text'
import Tooltip from '@instructure/ui-overlays/lib/components/Tooltip'

import TrackerSummary from './TrackerSummary'
import TTPanel from '../components/TTPanel'
import logging from '../dashboardLogging'

import ReactTable from 'react-table'

import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  HorizontalBarSeries,
  Hint
} from 'react-vis'

const TrackerTable = (data) => {
  const pagecountTooltipText = (
    <div style={{width: 160}}>
      This column shows, for each tracker, how many pages you were tracked on.
    </div>
  )

  const pagecountTooltip = (
    <Tooltip
      tip={pagecountTooltipText}
      variant='inverse'
      placement='end'
    >
      <IconInfo />
    </Tooltip>
  )

  const percentbrowsingTooltipText = (
    <div style={{width: 160}}>
      This column, for each tracker, the percentage of your overall browsing that was tracked.
    </div>
  )

  const percentbrowsingTooltip = (
    <Tooltip
      tip={percentbrowsingTooltipText}
      variant='inverse'
      placement='end'
    >
      <IconInfo />
    </Tooltip>
  )

  return (
    <ReactTable
      data={data}
      columns={[
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Tracker
          </div>),
        accessor: 'name',
        Cell: row => (
          <div key={row.value}>
            <Link className='trackerTableLinkTrackersPage' to={{pathname: '/trackers/' + row.value}}>
              {row.value}
            </Link>
          </div>)
        },
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Page Count {pagecountTooltip}
          </div>),
        accessor: 'count',
        Cell: row =>
          <div style={{textAlign: 'right'}}>
            {row.value}
          </div>},
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Percent of Browsing {percentbrowsingTooltip}
          </div>),
        accessor: 'percent',
        Cell: row =>
          <div style={{textAlign: 'right'}}>
            {row.value.toFixed(2) + ' %'}
          </div>}
      ]}
      // defaultPageSize={20}
      className='-striped -highlight'
    />
  )
}

export default class TrackerOverview extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      trackers: [],
      graphCount: 20
    }
    // this.logLoad = this.logLoad.bind(this);
  }

  async getTrackers () {
    const background = await browser.runtime.getBackgroundPage()
    const numTrackers = await background.queryDatabase('getNumberOfTrackers', {})
    const numPages = await background.queryDatabase('getNumberOfPages', {})
    const trackers = await background.queryDatabase('getTrackers', {})

    let topTracker = ''
    let topPercent = 0
    let graphData = []
    let allData = []
    let tempPercent = 0

    topTracker = trackers[0]['tracker']
    topPercent = ((trackers[0]['COUNT(tracker)'] / numPages) / 100).toFixed(2)
    for (let val in trackers) {
      const name = trackers[val]['tracker']
      const pageCount = trackers[val]['COUNT(tracker)']
      const percent = 100 * pageCount / numPages
      graphData.unshift({
        y: name,
        x: pageCount
      })
      allData.push({
        name: name,
        count: pageCount,
        percent: percent
      })
    }

    this.setState({
      trackers: trackers,
      graphDataAll: graphData,
      graphData: graphData.slice(-this.state.graphCount),
      allData: allData,
      numTrackers: numTrackers,
      numPages: numPages
    })
    // console.log(this.state.trackers);
    // console.log(this.state.allTrackers);
  }

  async componentDidMount () {
    this.getTrackers()

    const background = await browser.runtime.getBackgroundPage()
    const numTrackersShown = await background.queryDatabase('getNumberOfTrackers', {})
    let sendDict = {
      'numTrackersShown': numTrackersShown
    }
    let activityType = 'load dashboard tracker summary page'
    logging.logLoad(activityType, sendDict)
  }

  updateGraphCount (num) {
    const { graphDataAll, graphCount } = this.state
    this.setState({
      graphCount: num,
      graphData: graphDataAll.slice(-num)
    })
  }

  render () {
    const {graphData, allData, numTrackers, numPages, hovered, graphSize, selectedTracker} = this.state

    if (!allData) {
      return 'Loading…'
    }

    return (
      <div>
        <Heading level='h1'>Who is tracking you?</Heading>

        <Text>
          <p><strong>{numTrackers} trackers</strong> have collected information about you based on your browsing history. Your most
            frequently encountered tracker is <strong>{allData[0].name}</strong> which was
            present on <em>{allData[0].percent.toFixed(2)}%</em> of
            the pages you visited.
            Here are your 20 most frequently encountered trackers:</p>
        </Text>
        <Grid startAt='large'>
          <GridRow>
            <GridCol width={6}>
              <FlexibleWidthXYPlot
                yType={'ordinal'}
                height={800}
                margin={{left: 100}}
                onMouseLeave={() => this.setState({hovered: null})}
              >
                <HorizontalGridLines />
                <VerticalGridLines />
                <YAxis
                  height={200}
                  tickLabelAngle={0}
                />
                <XAxis
                  tickFormat={v => (v / numPages * 100).toFixed(2) + '%'}
                />
                {hovered && <Hint
                  value={hovered}>
                  <div className='rv-hint__content'>
                    <div>
                      <strong>{hovered.y}</strong><br />
                      Present on {hovered.x} pages<br />
                      ({(hovered.x / numPages * 100).toFixed(2)}% of all pages)
                    </div>
                  </div>
                </Hint>}
                <HorizontalBarSeries
                  data={graphData}
                  color='#8F3931'
                  onValueMouseOver={(datapoint) => {
                    this.setState({hovered: datapoint})
                  }}
                  onValueClick={(datapoint) => {
                    this.setState({selectedTracker: datapoint})
                  }}
                />
              </FlexibleWidthXYPlot>
              <Button size='small' onClick={() => this.updateGraphCount(undefined)}>See all trackers…</Button>
            </GridCol>
            <GridCol width={6}>
              <TTPanel textAlign='start'>
                {!selectedTracker && <Text weight='bold'>The graph to the left shows the trackers that we detected on the pages you visited. Click a bar on the graph to learn more about that tracker.</Text>}
                {selectedTracker && <div>
                  <TrackerSummary tracker={selectedTracker.y} numPages={selectedTracker.x} />
                  <Link
                    className='trackerPageSelected-Tracker'
                    href={'#/trackers/' + selectedTracker.y}
                    icon={IconArrowOpenEnd}
                    iconPlacement='end'
                  >
                    Learn more
                  </Link>
                </div>}
              </TTPanel>
              {/* TrackerTable(allData) */}
            </GridCol>
          </GridRow>
        </Grid>
      </div>
    )
  }
}
