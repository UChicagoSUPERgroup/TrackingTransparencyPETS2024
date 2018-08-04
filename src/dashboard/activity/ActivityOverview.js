import React from 'react';
import { Route, Link } from 'react-router-dom';
import ReactTable from 'react-table';

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'

import PagesTimeScatterplot from './PagesTimeScatterplot';
import logging from '../dashboardLogging';

import las from '../../labels';
const {dateLabel, timeLabelSimple, timeLabelAdjusted, dayOfWeekLabel, stringLabel} = las;
const millisecondsInDay = 86400000;
const millisecondsInHour = 3600000;

function recentVisitsTitle(summary) {
  if (summary.size) {
    return 'Pages visited on ' + dayOfWeekLabel(summary.y) +
    ' from ' + timeLabelSimple(summary.x) + ' to ' + timeLabelSimple(summary.x+1);
  } else {
    return 'Pages visited'
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
            {Header: 'Time',
              id: 'id',
              accessor: d => (new Date(d.Pages.id).toLocaleTimeString()),
              maxWidth: 150
            },
            {Header: 'Site',
              id: 'domain',
              accessor: d => d.Pages.domain,
              Cell: row => (
                <div key={row.value}>
                  <Link to={{pathname: '/domains/' + row.value}}>
                    {row.value}
                  </Link>
                </div>),
              width: 200
            },
            {Header: 'Page',
              id: 'title',
              accessor: d => d.Pages.title},
            {Header: 'Inference',
              id: 'infer',
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
      pageSize= {(data && (data.length >= 1)) ? 20 : 3}
      noDataText= {(data && !(data.length >= 1)) ?
        'No inferred interests at this time' :
        'Click in the scatterplot for more information'}
      className="-striped -highlight"
    />
  );
}

export default class ActivityOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      domains: [],
      recent: []
    }
    this.getByTime = this.getByTime.bind(this);
    this.handleClick = this.handleClick.bind(this);
    //  this.logLoad = this.logLoad.bind(this);
  }



  async componentDidMount() {
    const background = await browser.runtime.getBackgroundPage();
    let tempDate = new Date(Date.now() - (6*millisecondsInDay));
    let startDate = new Date(tempDate.getFullYear(),
      tempDate.getMonth(), tempDate.getDate());
    let args = {afterDate: startDate.getTime()}
    const weektimestamps = background.queryDatabase('getTimestamps', args);
    let activityType='load dashboard recent activity page';
    logging.logLoad(activityType, {});
    weektimestamps.then(ts => {
      console.log(ts)
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
    }
    let startDate = new Date(tempDate.getFullYear(),
      tempDate.getMonth(), tempDate.getDate(), hourStart);
    let args = {startTime: startDate.getTime(),
      endTime: startDate.getTime() + millisecondsInHour};
    console.log(args);
    //let waiting = background.queryDatabase('getPagesNoInferences', args);
    //console.log(waiting);
    return background.queryDatabase('getPagesByTime', args);
  }

  handleClick(i) {
    let today = (new Date(Date.now())).getDay();
    i.y = (i.y + today) % 7;
    let pagesByTime = this.getByTime(i.y, i.x);
    console.log(pagesByTime)
    pagesByTime.then(ps => {
      this.setState({
        recent: i,
        pagesByTime: ps
      });
    });
  }

  render() {
    const {weektimestamps, recent, pagesByTime} = this.state;

    return(
      <div>
        <Heading level='h1'>When were you tracked?</Heading>
        <Route exact path={this.props.match.url} render={() => (
          <div>
            <Text>
              <p>
                Here you can learn about when you have been tracked recently.
                The scatter plot shows when you visited the most pages over the past week.
                Click on a point to learn more about the tracking that took place.
              </p>
            </Text>
            <div>
              {weektimestamps &&
                <PagesTimeScatterplot
                  weektimestamps={weektimestamps}
                  update={this.handleClick}/>
              }
            </div>
            <div>
            {recent && RecentVisitsTable(recent, pagesByTime)}
            </div>
          </div>
        )} />


      </div>
    );
  }
}
