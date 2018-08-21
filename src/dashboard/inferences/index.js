import React from 'react'
import { Route } from 'react-router-dom'
import Loadable from 'react-loadable'

import Loading from '../loadable'

const InferenceOverview = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/InferenceOverview" */'./InferenceOverview'),
  loading: Loading
})

const InferenceDetails = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/InferenceDetails" */'./InferenceDetails'),
  loading: Loading
})

export default class Trackers extends React.Component {
  render () {
    return (
      <div>
        <Route path={`${this.props.match.url}/:name`} component={InferenceDetails} />
        <Route exact path={this.props.match.url} component={InferenceOverview} />
      </div>
    )
  }
}
