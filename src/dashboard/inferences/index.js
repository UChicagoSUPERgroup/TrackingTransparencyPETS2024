import React from 'react'
import { Route } from 'react-router-dom'
import Loadable from 'react-loadable'

import Loading from '../loadable'

const InferenceOverview = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/InferenceOverview" */'./InferenceOverview'),
  loading: Loading
})

const InferenceDetailPage = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/InferenceDetailPage" */'./InferenceDetailPage'),
  loading: Loading
})

export default class Trackers extends React.Component {
  render () {
    return (
      <div>
        <Route path={`${this.props.match.url}/:name`} component={InferenceDetailPage} />
        <Route exact path={this.props.match.url} component={InferenceOverview} />
      </div>
    )
  }
}
