import React from 'react';
import { Route, Link } from 'react-router-dom';
// import { LinkContainer } from 'react-router-bootstrap';
import tt from '../helpers';
import {Grid, Row, Col} from 'react-bootstrap';


import PagesTimeChart from './PagesTimeChart';
import PagesTimeScatterplot from './PagesTimeScatterplot';


export default class RecentPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      domains: []
    }
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

  render() {
    const {timestamps} = this.state;
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
                <Col md={8} mdPush={4}>
                  {timestamps && <PagesTimeScatterplot timestamps={timestamps}/>}
                </Col>
                <Col md={4} mdPull={8}>
                  {timestamps && <PagesTimeChart timestamps={timestamps}/>}
                </Col>
              </Row>
            </Grid>
          </div>
        )}/>


      </div>
    );
  }
}
