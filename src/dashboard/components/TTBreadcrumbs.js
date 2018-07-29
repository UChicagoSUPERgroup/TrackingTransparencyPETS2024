import React from 'react'
import Breadcrumb from '@instructure/ui-breadcrumb/lib/components/Breadcrumb'
import BreadcrumbLink from '@instructure/ui-breadcrumb/lib/components/Breadcrumb/BreadcrumbLink'

const urlComponentMapping = {
  '': 'Home',
  inferences: 'Inferences',
  domains: 'Sites',
  trackers: 'Trackers',
  activity: 'Activity',
  lightbeam: 'Network',
  info: 'Info',
  settings: 'Settings',
  takeaction: 'Take Action',
  debug: 'Debug'
}

export default class TTBreadcrumbs extends React.Component {
  urlToArray (rawurl) {
    let url

    // strip off trailing /
    if (rawurl.endsWith('/')) {
      url = rawurl.slice(0, -1)
    } else {
      url = rawurl
    }

    // special handling for home
    if (url === '') {
      return [{
        name: 'Home',
        path: '#/'
      }]
    }

    const arr = url.split('/')
    let incPath = '#'
    const names = arr.map(x => {
      let name
      if (urlComponentMapping[x]) {
        name = urlComponentMapping[x]
      } else {
        name = x
      }
      incPath += x + '/'
      return {
        name: name,
        path: incPath
      }
    })
    return names
  }

  render () {
    let names = this.urlToArray(this.props.url)
    return (
      <div>
        <Breadcrumb label='You are here:' margin='none none medium none'>
          {names.map((x, i, arr) => {
            if (i === arr.length - 1) {
              return <BreadcrumbLink key={x.name}>{x.name}</BreadcrumbLink>
            } else {
              return <BreadcrumbLink href={x.path} key={x.name}>{x.name}</BreadcrumbLink>
            }
          })}
        </Breadcrumb>
      </div>
    )
  }
}
