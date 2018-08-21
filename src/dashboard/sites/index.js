import React from 'react'
import { Route } from 'react-router-dom'
import Loadable from 'react-loadable'

import Loading from '../loadable'

const FirstPartyOverview = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/FirstPartyOverview" */'./FirstPartyOverview'),
  loading: Loading
})

const FirstPartyDetails = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/FirstPartyDetails" */'./FirstPartyDetails'),
  loading: Loading
})

export default class Sites extends React.Component {
  render () {
    return (
      <div>
        <Route path={`${this.props.match.url}/:name`} component={FirstPartyDetails} />
        <Route exact path={this.props.match.url} component={FirstPartyOverview} />
      </div>
    )
  }
}
