import React from 'react';
import { Route, Link } from 'react-router-dom';
import logging from '../dashboardLogging';
import ReactTable from 'react-table';

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import View from '@instructure/ui-layout/lib/components/View'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import MetricsList from '@instructure/ui-elements/lib/components/MetricsList'
import MetricsListItem from '@instructure/ui-elements/lib/components/MetricsList/MetricsListItem'

import TTPanel from '../components/TTPanel'

const DomainSpecificTable = (data) => {
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: 'Trackers',
          accessor: d => d.Trackers.tracker,
          id: 'tracker',
          Cell: row => (
            <div key={row.value}>
              <Link to={{pathname: '/trackers/' + row.value}}>
                {row.value}
              </Link>
            </div>
          )
        },
        {Header: 'Number of pages',
          accessor: d => d.Pages['COUNT(id)'],
          id: 'trackers',
          Cell: row => (
            row.value)
        }
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}
      className="-striped -highlight"
      noDataText="No Trackers Found"
    />
  );
}

const DomainSpecificInferencesTable = (data) => {
  let new_data = []
  for (var property in data) {
    new_data.push({'inference': property, 'count': data[property]})
  }
  return (
    <ReactTable
      data={new_data}
      columns={[
        {Header: 'Likely inferred interests',
          accessor: d => d.inference,
          id: 'tracker',
          Cell: row => (
            <div key={row.value}>
              <Link to={{pathname: '/inferences/' + row.value}}>
                {row.value}
              </Link>
            </div>
          )
        }
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}
      className="-striped -highlight"
    />
  );
};

const wrappedInDiv = (str) => {
  return (<div>str</div>)
}

const SensitiveModule = (data, domain) => {
  if (data && data.inferred.length > 1) {
    return (
      <div>
        <p>
          Tracking Transparency detected {data.inferred.length} inferences that may
          have been inferred about your browsing on {domain} and may be considered sensitive.
        </p>
        {data.inferred.map(function(val){ return <div key={val}>{val}</div>})}
      </div>
    );
  } else if (data && data.inferred.length == 1) {
    return (
      <div>
        <p>
          Tracking Transparency detected 1 inference that may have been inferred
          about your browsing on {domain} and may be considered sensitive.
        </p>
        {data.inferred.map(function(val){ return <div key={val}>{val}</div>})}
      </div>
    );
  } else {
    return (
      <p>
        Tracking Transparency has not detected any sensitive inferences that could
        have been inferred about your browsing on {domain}.
      </p>
    );
  }
};

function fontSizeMapper(size, min, max, num_entries) {
  let Px = [0.02, 0.01]
  if (num_entries < 4) {
    Px = [0.08, 0.04]
  } else if (num_entries < 10) {
    Px = [0.06, 0.03]
  } else if (num_entries < 40) {
    Px = [0.05, 0.02]
  } else if (num_entries < 80) {
    Px = [0.03, 0.02]
  }
  let fontSizeMapper =
    size ?
      (word => size.height * (Px[1] + ((word.value - min) / (1 + max - min)) * Px[0])) :
      (word => 50)
  return fontSizeMapper;

}


const PageList = (data) => {
  if (! data || data.length == 0) {
    return ''
  } else if (data.length == 1) {
    return data[0]['DISTINCT(title)']
  } else if (data.length ==2) {
    return data[0]['DISTINCT(title)'] + ' and ' + data[1]['DISTINCT(title)']
  } else {
    let pageStr = ''
    let i = 0
    for (i = 0; i < data.length - 1; i++){
      pageStr = pageStr + data[i]['DISTINCT(title)'] + ', '
    }
    pageStr = pageStr + 'and ' + data[i]['DISTINCT(title)']
    return pageStr
  }
}



export default class FirstPartyDetails extends React.Component {
  constructor(props) {
    super(props);

    this.domain = this.props.match.params.name;
    this.state = {
      trackers: []
    }
    this.logPopstate = this.logPopstate.bind(this);
  }

  async logPopstate(){
    const background = await browser.runtime.getBackgroundPage();
    let userParams = await browser.storage.local.get({
      usageStatCondition: 'no monster',
      userId: 'no monster',
      startTS: 0
    });
    const tabs = await browser.tabs.query({active: true, currentWindow: true});
    let parentTabId = tabs[0].openerTabId;
    let tabId = tabs[0].id;
    let x = 'clickData_tabId_'+String(tabId);
    let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain':'','tabId':tabId,'pageId':'','numTrackers':0})});
    tabData = JSON.parse(tabData[x]);
    if (JSON.parse(userParams.usageStatCondition)){//get data when the user click on the button.
      let page = await background.hashit_salt(this.domain)
      let activityType = 'leaving non-tab-page: tracker details for a domain';
      let timestamp=Date.now();
      let userId=userParams.userId;
      let startTS=userParams.startTS;
      let activityData = {
        'shownDomain':JSON.stringify(page),
        'tabId': tabId,
        'parentTabId':parentTabId,
        'parentDomain':tabData.domain,
        'parentPageId':tabData.pageId,
        'parentNumTrackers':tabData.numTrackers
      };
      background.logData(activityType, timestamp, userId, startTS, activityData);
    }

  }

  async componentWillUnmount() {
    window.removeEventListener('popstate', this.logPopstate)
  }

  async componentDidMount() {
    import(/* webpackChunkName: "react-d3-cloud" */'react-d3-cloud')
      .then(wc => { this.WordCloud = wc.default })

    const background = await browser.runtime.getBackgroundPage();
    let args = {domain: this.domain}
    let argsCount = {domain: this.domain, count: 5}
    const trackers = await background.queryDatabase('getTrackersByDomain', args);
    const inferences = await background.queryDatabase('getInferencesByDomain', args);
    const pages = await background.queryDatabase('getPagesByDomain', argsCount);
    const page_count = await background.queryDatabase('getPageCountByDomain', args);
    const tracker_count = await background.queryDatabase('getTrackerCountByDomain', args);
    let inferred = []
    for (let key in inferences) {
      inferred.push(key)
    }
    const categories = (await import(/* webpackChunkName: "data/sensitiveCats" */'../../data/categories_comfort_list.json')).default
    let sensitive = categories.slice(0,20);
    const _ = await import(/* webpackChunkName: "lodash" */'lodash')
    let sensitive_inferred = _.intersection(inferred, sensitive)
    this.setState({
      trackers: trackers,
      inferences: inferences,
      pages: pages,
      page_count: page_count ? page_count[0]['COUNT(title)'] : 0,
      tracker_count: tracker_count ? tracker_count[0]['Trackers']['COUNT(tracker)'] : 0,
      sensitive_inferred: {'inferred': sensitive_inferred}
    })

    if (this.refs.content) {
      let contentRect = this.refs.content.getBoundingClientRect();
      this.setState({
        divsize: contentRect
      })
    }

    window.addEventListener('popstate', this.logPopstate)

  }


  render() {
    const WordCloud = this.WordCloud
    let pageCount = this.state.page_count
    let sensitive = this.state.sensitive_inferred;
    let inferences_q = this.state.inferences;
    let inferences = []
    let min = 0
    let max = 0
    for (var property in inferences_q) {
      min = (inferences_q[property] < min) ? inferences_q[property] : min
      max = (inferences_q[property] > max) ? inferences_q[property] : max
      inferences.push({'text': property, 'value': inferences_q[property]})
    }

    let size = this.state.divsize
    let height = size ? size.height : 0
    let width = size ? 2 * size.width : 0
    let fontFunction = fontSizeMapper(size, min, max, inferences.length)
    const fonts = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'

    const trackerPercent = Math.round(this.state.tracker_count / this.state.page_count)

    return (
      <div>
        <Heading level='h1' margin='0 0 medium 0'>Sites</Heading>
        {/* <Heading level='h2' margin='small 0 small 0'>{this.domain}</Heading> */}
        <TTPanel>
          <MetricsList>
            <MetricsListItem label='Site' value={this.domain} />
            <MetricsListItem label='Pages' value={pageCount || 'Loading…'} />
            <MetricsListItem label='Average trackers per page' value={Number.isNaN(trackerPercent) ? 'Loading…' : trackerPercent} />
          </MetricsList>
        </TTPanel>
          {/* <p>
            You have visited {this.state.page_count} pages at <em>{this.domain}</em> with an average
          of {trackerPercent} trackers per page.
          </p> */}
        <Text>
          <p><strong>Recent Pages: </strong>
              {PageList(this.state.pages)}</p>
        </Text>
        <Grid startAt='large'>
          <GridRow>
            <GridCol width={4}>
              <div ref='content'>
                {DomainSpecificTable(this.state.trackers)}
              </div>
            </GridCol>
            <GridCol width={8}>
              <div>
                {WordCloud && <WordCloud
                  data={inferences}
                  height={height}
                  width={width}
                  fontSizeMapper={fontFunction}
                  font={fonts}
                />}
              </div>
            </GridCol>
          </GridRow>
        </Grid>
        {/*<Text>
            {SensitiveModule(sensitive, String(this.domain))}
          </Text>*/}
      </div>
    );
  }
}
