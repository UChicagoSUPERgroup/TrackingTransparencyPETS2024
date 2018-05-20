import React from 'react';
import { Route, Link } from 'react-router-dom';
import logging from './dashboardLogging';
import ReactTable from 'react-table';
import {Panel, Grid, Row, Col} from 'react-bootstrap';
import WordCloud from 'react-d3-cloud';


const DomainSpecificTable = (data) => {
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: "Trackers",
         accessor: d => d.Trackers.tracker,
         id: "tracker",
         Cell: row => (
           <div key={row.value}>
              <Link to={{pathname: '/trackers/' + row.value}}>
                 {row.value}
              </Link>
           </div>
         )
        },
        {Header: "Number of pages",
         accessor: d => d.Pages["COUNT(id)"],
         id: "trackers",
         Cell: row => (
           row.value)
        }
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}
      className="-striped -highlight"
    />
  );
}

const DomainSpecificInferencesTable = (data) => {
  let new_data = []
  for (var property in data) {
    new_data.push({"inference": property, "count": data[property]})
  }
  console.log(new_data)
  return (
    <ReactTable
      data={new_data}
      columns={[
        {Header: "Likely inferred interests",
         accessor: d => d.inference,
         id: "tracker",
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

function fontSizeMapper(size, min, max, num_entries) {
  let Px = [0.02, 0.01]
  if (num_entries < 4) {
    Px = [0.1, 0.04]
  } else if (num_entries < 10) {
    Px = [0.08, 0.03]
  } else if (num_entries < 40) {
    Px = [0.06, 0.02]
  } else if (num_entries < 80) {
    Px = [0.05, 0.02]
  }
  let fontSizeMapper =
    size ?
    (word => size.height * (Px[1] + ((word.value - min) / (1 + max - min)) * Px[0])) :
    (word => 50)
  return fontSizeMapper;

}


const PageList = (data) => {
  if (! data || data.length == 0) {
    return ""
  } else if (data.length == 1) {
    return data[0]["DISTINCT(title)"]
  } else if (data.length ==2) {
    return data[0]["DISTINCT(title)"] + " and " + data[1]["DISTINCT(title)"]
  } else {
    let pageStr = ""
    let i = 0
    for (i = 0; i < data.length - 1; i++){
      pageStr = pageStr + data[i]["DISTINCT(title)"] + ", "
    }
    pageStr = pageStr + "and " + data[i]["DISTINCT(title)"]
    return pageStr
  }
}



class FirstPartyDetails extends React.Component {
  constructor(props) {
    super(props);

    this.domain = this.props.match.params.name;
    this.state = {
      trackers: []
    }
    this.logPopstate = this.logPopstate.bind(this);
  }

  async logPopstate(){
    //console.log('In the log leave page')
    const background = await browser.runtime.getBackgroundPage();
    let userParams = await browser.storage.local.get({
      usageStatCondition: "no monster",
      userId: "no monster",
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
      window.removeEventListener("popstate", this.logPopstate)
    }

  async componentDidMount() {
    const background = await browser.runtime.getBackgroundPage();
    let args = {domain: this.domain}
    let argsCount = {domain: this.domain, count: 5}
    const trackers = await background.queryDatabase('getTrackersByDomain', args);
    const inferences = await background.queryDatabase('getInferencesByDomain', args)
    const pages = await background.queryDatabase('getPagesByDomain', argsCount);
    this.setState({
      trackers: trackers,
      inferences: inferences,
      pages: pages
    })
    console.log(pages)

    if (this.refs.content) {
      let contentRect = this.refs.content.getBoundingClientRect();
      this.setState({
        divsize: contentRect
      })
    }

    window.addEventListener("popstate", this.logPopstate)

  }


  render() {
    let inferences_q = this.state.inferences
    let inferences = []
    let min = 0
    let max = 0
    for (var property in inferences_q) {
      min = (inferences_q[property] < min) ? inferences_q[property] : min
      max = (inferences_q[property] > max) ? inferences_q[property] : max
      inferences.push({"text": property, "value": inferences_q[property]})
    }
    console.log(inferences)

    let size = this.state.divsize
    let height = size ? size.height : 0
    let width = size ? 2*size.width : 0
    let fontFunction = fontSizeMapper(size, min, max, inferences.length)

    return (
      <div>
        <h1>{this.domain}</h1>
        <Grid>
          <Row>
            <Panel bsStyle="primary">
              <Panel.Body><b>Recent Pages:</b> {PageList(this.state.pages)}</Panel.Body>
            </Panel>
          </Row>
          <Row>
            <Col md={4}>
              <div ref='content'>
              {DomainSpecificTable(this.state.trackers)}
              </div>
            </Col>
            <Col md={8}>
              <div>
                <WordCloud
                  data={inferences}
                  height={height}
                  width={width}
                  fontSizeMapper={fontFunction}
                  font={'Arial Black'}
                />
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default FirstPartyDetails;
