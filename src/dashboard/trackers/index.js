import React from 'react'
import { Route } from 'react-router-dom'
import Loadable from 'react-loadable'

import Loading from '../loadable'

const TrackerOverview = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/TrackerOverview" */'./TrackerOverview'),
  loading: Loading
})

const TrackerDetailPage = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/TrackerDetailPage" */'./TrackerDetailPage'),
  loading: Loading
})

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
