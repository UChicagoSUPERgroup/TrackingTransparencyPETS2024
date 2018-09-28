import React from 'react'
import { Route } from 'react-router-dom'

import SiteOverview from './SiteOverview'
import SiteDetailPage from './SiteDetailPage'

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
