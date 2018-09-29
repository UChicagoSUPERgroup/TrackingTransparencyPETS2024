import React from 'react'
import { Route } from 'react-router-dom'

import TrackerOverview from './TrackerOverview'
import TrackerDetailPage from './TrackerDetailPage'

export default class Trackers extends React.Component {
  render () {
    return (
      <div>
        <Route path={`${this.props.match.url}/:name`} component={TrackerDetailPage} />
        <Route exact path={this.props.match.url} component={TrackerOverview} />
      </div>
    )
  }
}
