import React from 'react'
import ReactTable from 'react-table'
import ReactDOM from 'react-dom';

import Button from '@instructure/ui-buttons/lib/components/Button'
import Heading from '@instructure/ui-elements/lib/components/Heading'
// import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'

import logging from './dashboardLogging'
import TTPanel from './components/TTPanel'
import Options from '../options/OptionsUI'

import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import IconInfo from '@instructure/ui-icons/lib/Solid/IconInfo'

import RadioInput from '@instructure/ui-forms/lib/components/RadioInput'
import RadioInputGroup from '@instructure/ui-forms/lib/components/RadioInputGroup'

import Iframe from 'react-iframe'
import * as moment from 'moment'

import Tree from 'react-d3-tree';
import './tree/tree.css'

// import Tree from 'react-tree-graph';
// import 'react-tree-graph/dist/style.css'
// import { easeElastic } from 'd3-ease';

import IframeResizer from 'iframe-resizer-react'
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import Slider from "react-slick";

import ReactHtmlParser from 'react-html-parser';

// import CalendarHeatmap from 'reactjs-calendar-heatmap'
import Spinner from '@instructure/ui-elements/lib/components/Spinner'
import CalendarHeatmap from './components/calendar-heatmap.js';
import * as d3 from 'd3';

import {
  Tip,
  Meter,
  Paragraph,
  Image,
  Icons,
  Box,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Chart,
  Grommet,
  InfiniteScroll,
  Stack,
  Footer,
  Anchor,
} from 'grommet';
import { 
  AidOption,
  Alert,
  Atm,
  BlockQuote,
  Bug,
  Briefcase,
  Cafeteria,
  Configure,
  Currency,
  Cli,
  CircleInformation,
  Compliance,
  Google,
  Info,
  Link,
  Money,
  More,
  MapLocation,
  Home,
  Help,
  HelpOption,
  Book,
  Gift,
  Globe,
  Send,
  Shield,
  User,
  UserFemale,
  UserWorker,
  Workshop,
  Vulnerability,
  View,
  Favorite,
  Baby,
  Close,
  Add,
} from 'grommet-icons';
import { grommet } from 'grommet/themes';
import {Grid as Grid_grommet} from 'grommet';
import {Text as Text_grommet} from 'grommet';
import {List as List_grommet} from 'grommet';
import {Image as Image_grommet} from 'grommet';
import {Carousel as Carousel_grommet} from 'grommet';
import {Button as Button_grommet} from 'grommet';
import { CircularProgressbar } from 'react-circular-progressbar';



// video intro 
import TakeAction from "./video_takeAction_1.mp4";
import ReactPlayer from 'react-player'

import iconGhost from "./icon-ghost.png";
import iconABP from "./icon-abp.png";
import iconTrackTHIS from "./icon-trackTHIS.png";
import iconUblock from "./icon-ublock.png";

// const get_state_global = (data) => {
//   let val;
//   val = localStorage.getItem('viewing')
//   return (
//     val
//   )
// }

const video_explain = () => {
      // <video
      // fluid={false}
      // height={300}
      // controls 
      // autostart={true}
      // autoPlay={true}
      // src={Video} 
      // type="video/mp4" 
      // />
  return (

    <ReactPlayer
      playing={true}
      loop={true}
      url={[
        {src: TakeAction, type: 'video/webm'},
      ]}
      width='100%'
      height="100%"
    />
  )
}








export class TakeActionPage extends React.Component {


  async getData () {
    const background = await browser.runtime.getBackgroundPage()


  }

  async componentDidMount () {

    let d = this.getData()

    let activityType = 'load dashboard take action page'
    logging.logLoad(activityType, {})
  }





  render () {


    return (
      <Grid>





        <GridRow>
          <GridCol>
            <Box background='white' round='small' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>
              {video_explain()}
            </Box>
          </GridCol>
        </GridRow>

        <GridRow>
          <GridCol>
            <Grid_grommet
              rows={['flex', 'flex',]}
              columns={['flex', 'flex',]}
              gap="xsmall"
              areas={[
                { name: 'one', start: [0, 0], end: [1, 0] },
                { name: 'two', start: [1, 0], end: [1, 0] },
                { name: 'three', start: [0, 1], end: [0, 1] },
                { name: 'four', start: [1, 1], end: [1, 1] },
              ]}
            >
              <Box gridArea="one" background='white' round='large' pad="xsmall" margin="xsmall" gap="xsmall"  responsive={true}>
                    <Box background='white' round='large' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>
                      <Box alignSelf="center" align="center" background='none' round='medium' pad="xxsmall" margin="xxsmall" gap="xxsmall" width={{ max: 'xlarge' }} responsive={true}> 
                      {/*<Alert size="large" />*/}
                      <Box height="xsmall" width="xsmall">
                        <Image
                          fit="cover"
                          src={iconGhost}
                        />
                      </Box>
                      <Text_grommet alignSelf='center' > Tools like <Anchor href="https://www.ghostery.com/ghostery-browser-extension" target="_blank" label="Ghostery"/> block trackers (and advertisements) as you browse the web. </Text_grommet>
                      </Box>
                    </Box>
              </Box>


              <Box gridArea="two" background='white' round='large' pad="xsmall" margin="xsmall" gap="xsmall"  responsive={true}>
                    <Box background='white' round='large' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>
                      <Box alignSelf="center" align="center" background='none' round='medium' pad="xxsmall" margin="xxsmall" gap="xxsmall" width={{ max: 'xlarge' }} responsive={true}> 
                      {/*<Alert size="large" />*/}
                      <Box height="xsmall" width="xsmall">
                        <Image
                          fit="cover"
                          src={iconABP}
                        />
                      </Box>
                      <Text_grommet alignSelf='center' > Tools like <Anchor href="https://adblockplus.org" target="_blank" label="Ad Block Plus"/> block ads as you browse the web. </Text_grommet>
                      </Box>
                    </Box>
              </Box>




              <Box gridArea="three" background='white' round='large' pad="xsmall" margin="xsmall" gap="xsmall"  responsive={true}>
                    <Box background='white' round='large' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>
                      <Box alignSelf="center" align="center" background='none' round='medium' pad="xxsmall" margin="xxsmall" gap="xxsmall" width={{ max: 'xlarge' }} responsive={true}> 
                      {/*<Alert size="large" />*/}
                      <Box height="xsmall" width="xsmall">
                        <Image
                          fit="cover"
                          src={iconTrackTHIS}
                        />
                      </Box>
                      <Text_grommet alignSelf='center' > Tools like <Anchor href="https://trackthis.link" target="_blank" label="TrackTHIS"/> try to fool trackers by flooding your browsing history with random websites. Expect this dashboard to get weird! </Text_grommet>
                      </Box>
                    </Box>
              </Box>




              <Box gridArea="four" background='white' round='large' pad="xsmall" margin="xsmall" gap="xsmall"  responsive={true}>
                    <Box background='white' round='large' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>
                      <Box alignSelf="center" align="center" background='none' round='medium' pad="xxsmall" margin="xxsmall" gap="xxsmall" width={{ max: 'xlarge' }} responsive={true}> 
                      {/*<Alert size="large" />*/}
                      <Box height="xsmall" width="xsmall">
                        <Image
                          fit="cover"
                          src={iconUblock}
                        />
                      </Box>
                      <Text_grommet alignSelf='center' >Tools like <Anchor href="https://ublockorigin.com" target="_blank" label="uBlock Origin"/> focus on blocking ads and trackers across the web. </Text_grommet>
                      </Box>
                    </Box>
              </Box>
            </Grid_grommet>
          </GridCol>
        </GridRow>






      </Grid>

    )



  }
}

export default TakeActionPage


