import React from 'react';
import { Route, Link } from 'react-router-dom';
// import { LinkContainer } from 'react-router-bootstrap';
import tt from '../helpers';
import {Grid, Row, Col} from 'react-bootstrap';
import ReactTable from 'react-table';

import PagesTimeChart from './PagesTimeChart';
import PagesTimeScatterplot from './PagesTimeScatterplot';

import las from '../labels';
const {dateLabel, timeLabel, dayOfWeekLabel, stringLabel} = las;

function recentVisitsTitle(summary) {
  if (summary[0])
    return "Pages visited on " + dayOfWeekLabel(summary[0].y) +
      " at " + timeLabel(summary[0].x);
  return "Pages visited";
}

function RecentVisitsTable(summary){
  return (
    <ReactTable
      data={summary}
      columns={[
        {
          Header: recentVisitsTitle(summary),
          columns: [
            {Header: "Site",
             accessor: "x"
            },
            {Header: "Page Count",
             accessor: "size"}
          ]
        }
      ]}
      defaultPageSize={2}
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
    this.handleClick = this.handleClick.bind(this);
  }

  async componentDidMount() {
    const background = await browser.runtime.getBackgroundPage();
    const timestamps = background.queryDatabase('getTimestamps', {});
    timestamps.then(ts => {
      const times = ts.map(x => (
        (new Date(x.id))
      ));
      this.setState({
        timestamps: times
      });
    });
  }

  handleClick(i) {
    console.log('You clicked! '+ i);
    this.setState({
      recent: [i]
    });
  }

  render() {
    const {timestamps, recent} = this.state;

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
                  {timestamps &&
                    <PagesTimeScatterplot
                    timestamps={timestamps}
                    update={this.handleClick}/>
                  }
                </Col>
                <Col md={5} mdPull={7}>
                  {timestamps && <PagesTimeChart timestamps={timestamps}/>}
                </Col>
              </Row>
              <br />
              <Row>
                <Col md={12}>
                {recent && RecentVisitsTable(recent)}
                </Col>
              </Row>
            </Grid>
          </div>
        )}/>


      </div>
    );
  }
}
