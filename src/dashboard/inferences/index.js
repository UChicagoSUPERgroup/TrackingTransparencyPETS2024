import React from 'react'
import { Route } from 'react-router-dom'
import Loadable from 'react-loadable'

import Loading from '../loadable'
import InferenceDetailPage from './InferenceDetailPage'
import InferenceOverview from './InferenceOverview'

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
