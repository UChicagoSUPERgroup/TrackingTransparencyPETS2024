import React from 'react'
import logging from '../dashboardLogging'
import ReactTable from 'react-table'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import IconInfo from '@instructure/ui-icons/lib/Solid/IconInfo'
import TTPanel from '../components/TTPanel'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const RecentTable = (data) => {
  let numEntries = data ? data.length : 0
  return (
    <ReactTable
      data={data}
      columns={[
        {
          id: 'most-recently-visited',
          Header: 'Most recently visited sites',
          accessor: x => x,
          Cell: row => (
            <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' href={'#/sites/' + row.value}>
                {row.value}
              </Link>
            </div>)
        }
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}
      className='-striped -highlight'
    />
  )
}

const NoTrackerTable = (data) => {
  let numEntries = data ? data.length : 0
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: 'Sites without trackers (' + numEntries + ')',
          accessor: d => d,
          id: 'domain',
          Cell: row => (
            <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' href={'#/sites/' + row.value}>
                {row.value}
              </Link>
            </div>)
        }
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}
      className='-striped -highlight'
    />
  )
}

const ManyTrackersTable = (data) => {
  let numEntries = data ? data.length : 0
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: 'Sites with the most trackers',
          accessor: d => d.Pages.domain,
          id: 'domain',
          Cell: row => (
            <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' href={'#/sites/' + row.value}>
                {row.value}
              </Link>
            </div>)
        },
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Trackers
          </div>),
        accessor: d => d.Trackers['COUNT(DISTINCT(tracker))'],
        id: 'trackers',
        Cell: row => (
          row.value),
        maxWidth: 200
        }
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}
      className='-striped -highlight'
    />
  )
}

const TopicsTable = (data) => {
  let numEntries = data ? data.length : 0
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: 'Sites Visited',
          accessor: d => d.Pages.title,
          id: 'domain',
          Cell: row => (
            <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' href={'#/sites/' + row.original.Pages.domain}>
                {row.value}
              </Link>
            </div>)
        },
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Time
          </div>),
        accessor: d => d.Pages.id, // d.Trackers['COUNT(DISTINCT(tracker))'],
        id: 'time',
        Cell: row => (
          new Date(row.value).toDateString() + ', ' + new Date(row.value).toLocaleTimeString('en-US')),
        maxWidth: 200
        },
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Trackers
          </div>),
        accessor: d => d.Trackers['COUNT(tracker)'],
        id: 'trackers',
        Cell: row => (
          <div style={{textAlign: 'center'}}>
            {row.value}
          </div>),
        maxWidth: 65
        }
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}
      className='-striped -highlight'
    />
  )
}

const SearchesTable = (data) => {
  let numEntries = data ? data.length : 0
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: 'Google Searches',
          accessor: d => d.title.substring(0,d.title.length - 16),
          id: 'title',
          Cell: row => (
            row.value)
        },
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Time
          </div>),
        accessor: d => d.id,
        id: 'time',
        Cell: row => (
          new Date(row.value).toDateString() + ', ' + new Date(row.value).toLocaleTimeString('en-US')),
        maxWidth: 210
        }
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}
      className='-striped -highlight'
    />
  )
}

export default class CreepySearches extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      domains: []
    }
    this.getData = this.getData.bind(this)
  }

  async getData () {
    const background = await browser.runtime.getBackgroundPage()

    let now = new Date(Date.now()).getTime()
    let args = {count: 100, endTime: now}
    let relationshipTopics = ['relationship','partner','dating','boyfriend','girlfriend','love','soulmate']

    const numPages = background.queryDatabase('getNumberOfPages', {})
    const numDomains = background.queryDatabase('getNumberOfDomains', {})
    numPages.then(n => this.setState({numPages: n}))
    numDomains.then(n => this.setState({numDomains: n}))

    const recent = background.queryDatabase('getDomains', args)
    const manyTrackers = background.queryDatabase('getDomainsByTrackerCount', args)
    const noTrackers = background.queryDatabase('getDomainsNoTrackers', {})
    // const searchPages = background.queryDatabase('getSearchPages',{})
    const jobTopicPages = background.queryDatabase('getTopicPages',{topics: ['job','interview'],excluded: ['Lose']})
    const jobTopicSearchPages = background.queryDatabase('getTopicSearchPages',{topics: ['job','employ','negotia'],excluded: ['lose']})

    const relTopicPages = background.queryDatabase('getTopicPages',{topics: relationshipTopics,excluded: ['field']})
    const relTopicSearchPages = background.queryDatabase('getTopicSearchPages',{topics: relationshipTopics,excluded: ['field']})

    recent.then(n => this.setState({recent: n}))
    manyTrackers.then(n => this.setState({manyTrackers: n}))
    noTrackers.then(n => this.setState({noTrackers: n}))
    // searchPages.then(n => this.setState({searchPages: n}))
    jobTopicPages.then(n => this.setState({jobTopicPages: n}))
    jobTopicSearchPages.then(n => this.setState({jobTopicSearchPages: n}))

    relTopicPages.then(n => this.setState({relTopicPages: n}))
    relTopicSearchPages.then(n => this.setState({relTopicSearchPages: n}))
  }

  async componentDidMount () {
    import(/* webpackChunkName: "vendors/lodash" */'lodash')
      .then(_ => {
        this.setState({ _: _ })
      })
      let d = this.getData()

      let recent = this.state.recent

      const background = await browser.runtime.getBackgroundPage()
      let pages = []
      if (recent) {
        for (let i = 0; i < recent.length; i++) {
          let value = await background.hashit_salt(domains[i]['Pages']['domain'])
          pages.push(value)
        }
      }
      let activityType = 'load dashboard Sites page'
      let sendDict = {'numDomainsShown': pages.length}
      logging.logLoad(activityType, sendDict)

  }

  render () {
    const { numPages, noTrackers, numDomains, searchPages, jobTopicPages, jobTopicSearchPages, relTopicPages, relTopicSearchPages} = this.state
    const { hideInferenceContent, hideTrackerContent } = this.props

    let numDNT, nodata
    if (noTrackers) {
      numDNT = noTrackers.length
    } else {
      numDNT = NaN
      nodata = true
    }

    let uniqueJobTopicPages = jobTopicPages
    if (jobTopicPages) {
      if (this.state._) {
        const _ = this.state._
        uniqueJobTopicPages = _.uniqBy(jobTopicPages, function(p){ return p.Pages.title; })
        console.log(uniqueJobTopicPages);
      }
    }
    let uniqueJobTopicSearchPages = jobTopicSearchPages
    if (jobTopicSearchPages) {
      if (this.state._) {
        const _ = this.state._
        uniqueJobTopicSearchPages = _.uniqBy(jobTopicSearchPages, function(p){ return p.title; })
        console.log(uniqueJobTopicSearchPages);
      }
    }

    let uniqueRelTopicPages = relTopicPages
    if (relTopicPages) {
      if (this.state._) {
        const _ = this.state._
        uniqueRelTopicPages = _.uniqBy(relTopicPages, function(p){ return p.Pages.title; })
        console.log(uniqueRelTopicPages);
      }
    }
    let uniqueRelTopicSearchPages = relTopicSearchPages
    if (relTopicSearchPages) {
      if (this.state._) {
        const _ = this.state._
        uniqueRelTopicSearchPages = _.uniqBy(relTopicSearchPages, function(p){ return p.title; })
        console.log(uniqueRelTopicSearchPages);
      }
    }
    // console.log(this.state.manyTrackers)

    // let numDNT = noTrackers ? noTrackers.length : NaN

    let percentTrackedSites = (((numDomains - numDNT) / numDomains) * 100).toFixed(1)
    let ok = !Number.isNaN(percentTrackedSites)

    return (
      <Grid startAt='medium'>
        <GridRow>
          <GridCol>
            <Heading level='h1'><FontAwesomeIcon icon='window-maximize' /><strong>&nbsp; Your Job Search</strong></Heading>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol>
            <TTPanel>
              <Text>
                <p>Trackers know that you may be <strong>looking for a new job.</strong> They followed you through your recent history of job-related web searches, particularly to the below sites. Trackers can build this understanding of you by linking together multiple site visits, and will target ads to you based on this profile.</p>
              </Text>
            </TTPanel>
          </GridCol>
        </GridRow>
        <GridRow>
          {!hideTrackerContent &&
            <GridCol width={6}>
              <TTPanel padding='small'>
                {SearchesTable(uniqueJobTopicSearchPages)}
              </TTPanel>
            </GridCol>
          }
          {!hideTrackerContent &&
            <GridCol width={6}>
              <TTPanel padding='small'>
                {TopicsTable(uniqueJobTopicPages)}
              </TTPanel>
            </GridCol>
          }
        </GridRow>
        <GridRow>
          <GridCol>
            <Heading level='h1'><FontAwesomeIcon icon='window-maximize' /><strong>&nbsp; Your Relationship Status</strong></Heading>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol>
            <TTPanel>
              <Text>
                <p>Trackers know that you may be <strong>looking for a new partner.</strong> They followed you through your recent history of relationship-related web searches, particularly to the below sites. Trackers can build this understanding of you by linking together multiple site visits, and will target ads to you based on this profile.</p>
              </Text>
            </TTPanel>
          </GridCol>
        </GridRow>
        <GridRow>
          {!hideTrackerContent &&
            <GridCol width={6}>
              <TTPanel padding='small'>
                {SearchesTable(uniqueRelTopicSearchPages)}
              </TTPanel>
            </GridCol>
          }
          {!hideTrackerContent &&
            <GridCol width={6}>
              <TTPanel padding='small'>
                {TopicsTable(uniqueRelTopicPages)}
              </TTPanel>
            </GridCol>
          }
        </GridRow>
      </Grid>
    )
  }
}
