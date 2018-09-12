import React from 'react'
import { Route } from 'react-router-dom'
import Loadable from 'react-loadable'

import Loading from '../loadable'
import SitesDetailPage from './SitesDetailPage'
import SitesOverview from './SitesOverview'

export default class Sites extends React.Component {
  render () {
    return (
      <div>
        <Route path={`${this.props.match.url}/:name`} component={SitesDetailPage} />
        <Route exact path={this.props.match.url} component={SitesOverview} />
      </div>
    )
  }
}
