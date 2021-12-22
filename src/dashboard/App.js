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
import IconBlueprint from '@instructure/ui-icons/lib/Solid/IconBlueprint'

import TTBreadcrumbs from './components/TTBreadcrumbs'
import {Home, WaitingDataHome} from './Home'

import {Button as Button_grommet} from 'grommet';
import { 
  Shield,
} from 'grommet-icons';
import {
  Box,
  Layer,
  Tip,
} from 'grommet';
import {Text as Text_grommet} from 'grommet';

import {
  Trackers,
  Inferences,
  Sites,
  Activity,
  DebugPage,
  InfoPage,
  SettingsPage,
  ProfilePage,
  TakeActionPage,
  LightbeamWrapper,
  Creepy,
  TrackerTimes,
  CreepySearches
  // TakeActionPage
} from './loadable'

import { themeOverrides } from '../colors'

import '../styles/common.css'
import '../styles/dashboard.css'
import '../styles/navbar.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faEye, faThumbsUp, faAd, faArrowRight, faPaw, faUser,
  faWindowMaximize, faClock, faExclamationTriangle,
  faExternalLinkAlt, faSearch, faUsers, faQuestion,
  faBrain, faLightbulb, faExclamation, 
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faEye, faThumbsUp, faAd, faArrowRight, faPaw, faUser,
  faWindowMaximize, faClock, faExclamationTriangle,
  faExternalLinkAlt, faSearch, faUsers, faQuestion,
  faBrain, faLightbulb, faExclamation, 
)

theme.use({
  overrides: themeOverrides
})

// clear any popup badge nudge
browser.browserAction.setBadgeText({text: ''})

const NavLink = ({to, title}) => (
  <LinkContainer to={to} className='navbarTolog'>
    <NavItem>{title}</NavItem>
  </LinkContainer>
)


class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      okToLoad: false,
    }
  }



  async componentWillUnmount () {

  }

  async componentDidMount () {
    
    const options = (await browser.storage.local.get('options')).options
    const okToLoad = true
    this.setState({ ...options, okToLoad })

  }

            // {!hideHistoryContent && <NavLink to='/creepy' title='Bedtime' />}
            // {!hideHistoryContent && <NavLink to='/trackertimes' title='Trackers by Time' />}
            // {!hideHistoryContent && <NavLink to='/creepysearches' title='Search Insights' />}

  render () {
    const { okToLoad, show } = this.state
    const settings = (<IconSettings />)

    // some of these are "show..." and others are "hide..."
    // because they have different desired defaults
    const hideTrackerContent = this.state.showTrackerContent === false
    const hideInferenceContent = this.state.showInferenceContent === false
    const hideHistoryContent = this.state.showHistoryContent === false
    const showLightbeam = this.state.showLightbeam === true
    const showProfile = this.state.showProfile === true
    const showTakeAction = this.state.showTakeAction === true

    const TTNavbar = () => {
      return (
        <Navbar>
          <Navbar.Header>
            <LinkContainer to='/'>
              <Navbar.Brand>{EXT.NAME}</Navbar.Brand>
            </LinkContainer>
          </Navbar.Header>
          <Nav>
            {!hideInferenceContent && <NavLink to='/interests' title='Interests' />}
            {!hideTrackerContent && <NavLink to='/trackers' title='Trackers' />}
            {!hideHistoryContent && <NavLink to='/sites' title='Sites' />}
            {!hideHistoryContent && <NavLink to='/activity' title='Activity' />}
            {showLightbeam && <NavLink to='/lightbeam' title='Network' />}
            {showProfile && <NavLink to='/profile' title='Profile' />}
            {showTakeAction && <NavLink to='/takeAction' title='Take Action' />}
            {/* <NavLink to="/takeaction"  title="Take Action"/> */}
          </Nav>
          <Nav pullRight>
            {EXT.DEBUG && <NavLink to='/debug' title='Debug' />}
            <NavLink to='/about' title='About' />
            <NavLink to='/settings' title={settings} />
          </Nav>
        </Navbar>
      )
    }


    const button_style = {
      position:'fixed',
      bottom:'40%', 
      // right:'50%',
      display: 'flex',
      left:'10px',
      zIndex:5,
    }


    return (
      <HashRouter>
        <div>
          <TTNavbar />

          {okToLoad && <div className='container containerInner'>
            <Route path='/*' render={({ match }) => <TTBreadcrumbs url={match.url} />} />

        <Box>

      <Tip
        plain
        content={
          <Box
            background='light-1' 
            round='medium'
            pad="small"
            margin="small"
            gap="small"
            width={{ max: 'medium' }}
            responsive={false}
          >
            <Text_grommet weight="bold" color="status-error">Take Action</Text_grommet>
            <Text_grommet size="small">
              Click me to get some privacy protection!
            </Text_grommet>
          </Box>
        }

        dropProps={{ align:  { top: "bottom" } }} 
      >

        <p style={button_style}><Button_grommet color="status-error" hoverIndicator={true} primary icon={<Shield size="large" />} label="" href='#/takeAction' onClick={() => {  }}  /><br/><br/></p>
        </Tip>
        </Box>

            

            <div>
              <Route exact path='/' render={props => (
                <Home {...props}
                  hideHistoryContent={hideHistoryContent}
                  hideInferenceContent={hideInferenceContent}
                  hideTrackerContent={hideTrackerContent}
                  showLightbeam={showLightbeam}
                  showProfile={showProfile}
                  showTakeAction={showTakeAction}
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

              <Route path='/creepy' render={props => (
                <Creepy {...props}
                  hideInferenceContent={hideInferenceContent}
                  hideTrackerContent={hideTrackerContent}
                />
              )} />

              <Route path='/trackertimes' render={props => (
                <TrackerTimes {...props}
                  hideInferenceContent={hideInferenceContent}
                  hideTrackerContent={hideTrackerContent}
                />
              )} />

              <Route path='/creepysearches' render={props => (
                <CreepySearches {...props}
                  hideInferenceContent={hideInferenceContent}
                  hideTrackerContent={hideTrackerContent}
                />
              )} />


              {showLightbeam && <Route path='/lightbeam' component={LightbeamWrapper} />}
              {showProfile && <Route path='/profile' component={ProfilePage} />}
              {showTakeAction && <Route path='/takeAction' component={TakeActionPage} />}

              {/* <Route path="/takeaction" component={TakeActionPage}/> */}
            </div>

            <Route path='/debug' component={DebugPage} />
            <Route path='/about' render={props => (
              <InfoPage {...props}
                hideInferenceContent={hideInferenceContent}
                hideTrackerContent={hideTrackerContent}
              />
            )} />
            <Route path='/settings' component={SettingsPage} />
          </div>}

        </div>

      </HashRouter>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
