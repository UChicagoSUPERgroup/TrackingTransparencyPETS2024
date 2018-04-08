import React from 'react';
import { Route, Link } from 'react-router-dom';
// import { LinkContainer } from 'react-router-bootstrap';
import tt from '../helpers';
import {Grid, Row, Col} from 'react-bootstrap';
import ReactTable from 'react-table';

import PagesTimeChart from './PagesTimeChart';
import PagesTimeScatterplot from './PagesTimeScatterplot';

import las from '../labels';
const {dateLabel, timeLabelSimple, timeLabelAdjusted, dayOfWeekLabel, stringLabel} = las;
const millisecondsInDay = 86400000;
const millisecondsInHour = 3600000;

function recentVisitsTitle(summary) {
  if (summary.size) {
  return "Pages visited on " + dayOfWeekLabel(summary.y) +
    " at " + timeLabelSimple(summary.x);
  } else {
    return "Pages visited"
  }
}

function RecentVisitsTable(summary, data){
  return (
    <ReactTable
      data={data}
      columns={[
        {
          Header: recentVisitsTitle(summary),
          columns: [
            {Header: "Time",
             id: "id",
             accessor: d => (new Date(d.Pages.id).toLocaleTimeString()),
             maxWidth: 150
            },
            {Header: "Site",
             id: "domain",
             accessor: d => d.Pages.domain,
             Cell: row => (
               <div key={row.value}>
                  <Link to={{pathname: '/domains/' + row.value}}>
                     {row.value}
                  </Link>
               </div>),
             width: 200
            },
            {Header: "Page",
             id: "title",
             accessor: d => d.Pages.title},
            {Header: "Inference",
              id: "infer",
              accessor: d => d.Inferences.inference,
              Cell: row => (
                <div key={row.value}>
                   <Link to={{pathname: '/inferences/' + row.value}}>
                      {row.value}
                   </Link>
                </div>)}
          ]
        }
      ]}
      showPageSizeOptions= {false}
      pageSize= {(summary.size >= 1) ? 20 : 3}
      className="-striped -highlight"
    />
  );
}

export default class RecentPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      domains: [],
      recent: []
    }
    this.getByTime = this.getByTime.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  async componentDidMount() {
    const background = await browser.runtime.getBackgroundPage();
    let tempDate = new Date(Date.now() - (6*millisecondsInDay));
    let startDate = new Date(tempDate.getFullYear(),
      tempDate.getMonth(), tempDate.getDate());
    let args = {afterDate: startDate.getTime()}
    const weektimestamps = background.queryDatabase('getTimestamps', args);
    weektimestamps.then(ts => {
      const times = ts.map(x => (
        (new Date(x.id))
      ));
      this.setState({
        weektimestamps: times
      });
    });
  }

  async getByTime(dayOfWeek, hourStart) {
    let background = await browser.runtime.getBackgroundPage();
    let tempDate = new Date(Date.now());
    while (dayOfWeek != tempDate.getDay()){
      tempDate = new Date(tempDate.getTime() - millisecondsInDay);
      //console.log(tempDate);
    }
    let startDate = new Date(tempDate.getFullYear(),
      tempDate.getMonth(), tempDate.getDate(), hourStart);
    let args = {startTime: startDate.getTime(),
      endTime: startDate.getTime() + millisecondsInHour};
    return background.queryDatabase('getPagesByTime', args);
  }

  handleClick(i) {
    let today = (new Date(Date.now())).getDay();
    i.y = (i.y + today) % 7;
    let pagesByTime = this.getByTime(i.y, i.x);
    pagesByTime.then(ps => {
      this.setState({
        recent: i,
        pagesByTime: ps
      });
      console.log(ps);
    });
  }

  render() {
    const {weektimestamps, recent, pagesByTime} = this.state;

    return(
      <div>
        <h1>Recent Activity</h1>
        <Route exact path={this.props.match.url} render={() => (
          <div>
            <Grid>
              <Row>
              <p>
              On this page you can learn about when you've been tracked recently.
              On the left, the histogram shows how many pages you've visited at different times.
              You can toggle between time of day, day of week, and day of month filters.
              On the right, the scatter plot shows when you visit the most pages.
              The axes show the time and day of week of your page visits.
              The size of a circle corresponds to the number of pages visited.
              </p>
              </Row>
              <Row>
                <Col md={7} mdPush={5}>
                  {weektimestamps &&
                    <PagesTimeScatterplot
                    weektimestamps={weektimestamps}
                    update={this.handleClick}/>
                  }
                </Col>
                <Col md={5} mdPull={7}>
                  {weektimestamps && <PagesTimeChart weektimestamps={weektimestamps}/>}
                </Col>
              </Row>
              <br/>
              <Row>
                <Col md={12}>
                {recent && RecentVisitsTable(recent, pagesByTime)}
                </Col>
              </Row>
            </Grid>
          </div>
        )}/>


      </div>
    );
  }
}
