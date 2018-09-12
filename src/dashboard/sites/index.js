import React from 'react'
import { Route } from 'react-router-dom'
import Loadable from 'react-loadable'

import Loading from '../loadable'

const SiteOverview = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/SiteOverview" */'./SiteOverview'),
  loading: Loading
})

const SiteDetailPage = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/SiteDetailPage" */'./SiteDetailPage'),
  loading: Loading
})

export default class Sites extends React.Component {
  render () {
    return (
      <div>
        <Route path={`${this.props.match.url}/:name`} component={SiteDetailPage} />
        <Route exact path={this.props.match.url} component={SiteOverview} />
      </div>
    )
  }
}
