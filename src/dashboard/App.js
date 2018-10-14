import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'

import './bootstrap/css/bootstrap.css'
import '../../node_modules/react-vis/dist/style.css'
import '../../node_modules/react-table/react-table.css'
import Navbar from 'react-bootstrap/lib/Navbar'
import Nav from 'react-bootstrap/lib/Nav'
import NavItem from 'react-bootstrap/lib/NavItem'

import theme from '@instructure/ui-themes/lib/canvas'
import IconSettings from '@instructure/ui-icons/lib/Solid/IconSettings'

import TTBreadcrumbs from './components/TTBreadcrumbs'
import {Home, WaitingDataHome} from './Home'
import logging from './dashboardLogging'

import {
  Trackers,
  Inferences,
  Sites,
  Activity,
  DebugPage,
  InfoPage,
  SettingsPage,
  LightbeamWrapper
  // TakeActionPage
} from './loadable'

import tt from '../helpers'
import { themeOverrides } from '../colors'

import '../styles/common.css'
import '../styles/dashboard.css'
import '../styles/navbar.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faEye, faThumbsUp, faAd, faArrowRight, faPaw, faUser,
  faWindowMaximize, faClock, faExclamationTriangle,
  faExternalLinkAlt, faSearch, faUsers
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faEye, faThumbsUp, faAd, faArrowRight, faPaw, faUser,
  faWindowMaximize, faClock, faExclamationTriangle,
  faExternalLinkAlt, faSearch, faUsers
)

theme.use({
  overrides: themeOverrides
})

const NavLink = ({to, title}) => (
  <LinkContainer to={to} className='navbarTolog'>
    <NavItem>{title}</NavItem>
  </LinkContainer>
)

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      okToLoad: false
    }

    // this.logLoad = this.logLoad.bind(this);
    // this.logLeave = this.logLeave.bind(this);
    // this.logClick = this.logClick.bind(this);
  }

  /** ************ BEGIN Instrumentation code *******************
The code for logclick logs ALL the click in every single page.
*************/

  async componentWillUnmount () {
    // window.removeEventListener("beforeunload", this.logLeave)
    // window.removeEventListener("unload", this.logLeave)
    // browser.tabs.onRemoved.removeListener(this.logLeave)
    window.removeEventListener('click', logging.logDashboardClick)
  }

  async componentDidMount () {
    const options = (await browser.storage.local.get('options')).options
    const enoughData = await tt.enoughData()
    const okToLoad = true
    this.setState({ ...options, okToLoad, enoughData })
    logging.logStartDashboardPage()
    window.addEventListener('click', logging.logDashboardClick, true)

    // window.addEventListener("unload", this.logLeave, true);
    // browser.tabs.onRemoved.addListener(this.logLeave)
    // window.addEventListener("beforeunload", this.logLeave, true);
    // window.addEventListener("click", this.logClick, true);
    // window.onbeforeunload = function(){alert('finally');}
  }

  /** ************ END Instrucmentation code ********************************/

  render () {
    const { okToLoad, enoughData } = this.state
    // const enoughData = tt.enoughData();
    const settings = (<IconSettings />)

    // some of these are "show..." and others are "hide..."
    // because they have different desired defaults
    const hideTrackerContent = this.state.showTrackerContent === false
    const hideInferenceContent = this.state.showInferenceContent === false
    const hideHistoryContent = this.state.showHistoryContent === false
    const showLightbeam = this.state.showLightbeam === true

    const TTNavbar = () => {
      return (
        <Navbar>
          <Navbar.Header>
            <LinkContainer to='/'>
              <Navbar.Brand>Tracking Transparency</Navbar.Brand>
            </LinkContainer>
          </Navbar.Header>
          {enoughData && <Nav>
            {!hideInferenceContent && <NavLink to='/interests' title='Interests' />}
            {!hideHistoryContent && <NavLink to='/sites' title='Sites' />}
            {!hideHistoryContent && <NavLink to='/activity' title='Activity' />}
            {!hideTrackerContent && <NavLink to='/trackers' title='Trackers' />}
            {showLightbeam && <NavLink to='/lightbeam' title='Network' />}
            {/* <NavLink to="/takeaction"  title="Take Action"/> */}
          </Nav>}
          <Nav pullRight>
            {!tt.production && <NavLink to='/debug' title='Debug' />}
            <NavLink to='/info' title='About' />
            <NavLink to='/settings' title={settings} />
          </Nav>
        </Navbar>
      )
    }

    return (
      <HashRouter>
        <div>
          <TTNavbar />

          {okToLoad && <div className='container containerInner'>
            <Route path='/*' render={({ match }) => <TTBreadcrumbs url={match.url} />} />

            {enoughData && <div>
              <Route exact path='/' render={props => (
                <Home {...props}
                  hideHistoryContent={hideHistoryContent}
                  hideInferenceContent={hideInferenceContent}
                  hideTrackerContent={hideTrackerContent}
                />
              )} />

              {!hideInferenceContent &&
                <Route path='/interests' render={props => (
                  /* this page is only shown in full study condition
                      so we do no special handling */
                  <Inferences {...props} />
                )} />
              }

              {!hideTrackerContent &&
                <Route path='/trackers' render={props => (
                  <Trackers {...props}
                    hideInferenceContent={hideInferenceContent}
                  />
                )} />
              }

              <Route path='/sites' render={props => (
                <Sites {...props}
                  hideInferenceContent={hideInferenceContent}
                  hideTrackerContent={hideTrackerContent}
                />
              )} />

              <Route path='/activity' render={props => (
                <Activity {...props}
                  hideInferenceContent={hideInferenceContent}
                  hideTrackerContent={hideTrackerContent}
                />
              )} />

              {showLightbeam && <Route path='/lightbeam' component={LightbeamWrapper} />}
              {/* <Route path="/takeaction" component={TakeActionPage}/> */}
            </div>}

            {!enoughData && <Route exact path='/' component={WaitingDataHome} />}

            <Route path='/debug' component={DebugPage} />
            <Route path='/info' component={InfoPage} />
            <Route path='/settings' component={SettingsPage} />
          </div>}

        </div>
      </HashRouter>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
