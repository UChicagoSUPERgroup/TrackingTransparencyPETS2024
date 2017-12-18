import React from 'react';
import { Route, Link } from 'react-router-dom';
// import { LinkContainer } from 'react-router-bootstrap';
import tt from '../helpers';

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
            {timestamps && <PagesTimeChart timestamps={timestamps}/>}
            <br/>
            {timestamps && <PagesTimeScatterplot timestamps={timestamps}/>}
          </div>
        )}/>


      </div>
    );
  }
}