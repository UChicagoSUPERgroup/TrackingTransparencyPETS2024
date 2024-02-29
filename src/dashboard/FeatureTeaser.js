        // <GridRow>
        //   <GridCol>
        //     <Heading level='h1'><strong>Individual Explanation Counts</strong></Heading>
        //     {adCounts(adExplanation_counts)}
        //   </GridCol>
        // </GridRow>
        // <GridRow>
        //   <GridCol>
        //     <Heading level='h1'><strong>Ad Explanations Overview</strong></Heading>
        //     {advertiser_deep(ad_deep)}
        //   </GridCol>
        // </GridRow>
        // <GridRow>
        //   <GridCol>
        //     <Heading level='h1'><strong>Ad DOMs (with repeats)</strong></Heading>
        //     {advertiser_ads(allAds)}
        //   </GridCol>
        // </GridRow>
        












import React from 'react'
import ReactTable from 'react-table'
import ReactDOM from 'react-dom';

import Button from '@instructure/ui-buttons/lib/components/Button'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
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


import ReactHtmlParser from 'react-html-parser';

// import CalendarHeatmap from 'reactjs-calendar-heatmap'
import Spinner from '@instructure/ui-elements/lib/components/Spinner'
import CalendarHeatmap from './components/calendar-heatmap.js';
import * as d3 from 'd3';

const my_data = [{
    "date": "2016-01-01",
    "total": 17164,
    "details": [{
      "name": "Project 1",
      "date": "2016-01-01 12:30:45",
      "value": 9192
    },]
  }];


// concept: https://jscharting.com/examples/chart-types/calendar/week-activity-heatmap/#
// doable https://nivo.rocks/calendar/ AND ALSO https://codesandbox.io/s/8wb5p?file=/src/helpers/stats.js 
// actual use: https://www.npmjs.com/package/reactjs-calendar-heatmap
// NKOTB https://github.com/jquintozamora/react-d3-calendar-heatmap
const heatMap_original = (data) => {


  let numEntries = data ? Object.keys(data).length : 0
  if (numEntries === 0) {
     
    return (

            <div>
              <Spinner title='Timeline loading…'/>
            </div>
                    
            )


  } else {


    //
    let total_labels = new Set() // count how many items there are to display

    for (let i = 0; i < Object.keys(data).length; i++) {
      for (let r = 0; r < Object.keys(data[i].details).length; r++) {
        total_labels.add(data[i].details[r].name)
      }
    }

    return ( 
            <CalendarHeatmap
              data={data}
              color={'#cd2327'}
              overview={'year'}
              total_labels={total_labels.size}
              >
            </CalendarHeatmap>
            )

  }


}



// concept: https://jscharting.com/examples/chart-types/calendar/week-activity-heatmap/#
// doable https://nivo.rocks/calendar/ AND ALSO https://codesandbox.io/s/8wb5p?file=/src/helpers/stats.js 
// actual use: https://www.npmjs.com/package/reactjs-calendar-heatmap
// NKOTB https://github.com/jquintozamora/react-d3-calendar-heatmap
const heatMap = (data, slice) => {
        
  let numEntries = data ? Object.keys(data).length : 0



  if (numEntries === 0) {
     

    return (

            <div>
              <Spinner title='Timeline loading…'/>
            </div>
                    
            )


  } else {


    // slice = 'all time', 'last week', last month'

    // aggregate all data together under the same date
    // date 
    // totals 
    // details
    let all_days = new Array()
    let all_details = new Array()
    let all_totals = 0
    let total_labels = new Set() // count how many items there are to display
    let highest_time = 0 // most time spent 
    let highest_category = '' // most common content category from browsing history
    var date_today = new Date();
    let date_today_formatted = moment(date_today).format("YYYY-MM-DD");

    for (let i = 0; i < Object.keys(data).length; i++) {
        
        for (let r = 0; r < Object.keys(data[i].details).length; r++) {

          let new_date_date = data[i].details[r].date.split(" ")[0]
          let new_date_time = data[i].details[r].date.split(" ")[1]

          let one_month_ago = moment(date_today_formatted).subtract(1, 'months').format('YYYY-MM-DD')
          let one_week_ago = moment(date_today_formatted).subtract(1, 'weeks').format('YYYY-MM-DD')
          let one_day_ago = moment(date_today_formatted).subtract(1, 'days').format('YYYY-MM-DD')

          let within_month = moment(date_today_formatted).isAfter(one_month_ago);
          let within_week = moment(date_today_formatted).isAfter(one_week_ago);
          let within_day = moment(date_today_formatted).isAfter(one_day_ago);
          let is_today = (date_today_formatted == new_date_date)

          console.log(date_today_formatted + " is within one week " + within_week + " is within one month " + within_month + " is within one day " + within_day + " is today " + is_today)


          if (slice=='all') {

            all_totals += data[i].details[r].value

            // keep track of most common items 
            if (data[i].details[r].value > highest_time) {
              highest_time = data[i].details[r].value
              highest_category = data[i].details[r].name
            }

            all_details.push({name: data[i].details[r].name, date: date_today_formatted + " " + String(new_date_time), value: data[i].details[r].value, real_time: data[i].details[r].date})

            total_labels.add(data[i].details[r].name)
          }

          else if (within_month == true && slice == 'last month') {

            all_totals += data[i].details[r].value

            // keep track of most common items 
            if (data[i].details[r].value > highest_time) {
              highest_time = data[i].details[r].value
              highest_category = data[i].details[r].name
            }

            all_details.push({name: data[i].details[r].name, date: date_today_formatted + " " + String(new_date_time), value: data[i].details[r].value, real_time: data[i].details[r].date})

            total_labels.add(data[i].details[r].name)

          }

          else if (within_week == true && slice == 'last week') {


            all_totals += data[i].details[r].value

            // keep track of most common items 
            if (data[i].details[r].value > highest_time) {
              highest_time = data[i].details[r].value
              highest_category = data[i].details[r].name
            }

            all_details.push({name: data[i].details[r].name, date: date_today_formatted + " " + String(new_date_time), value: data[i].details[r].value, real_time: data[i].details[r].date})

            total_labels.add(data[i].details[r].name)

          }

          else if (is_today == true && slice == 'today') {


            all_totals += data[i].details[r].value

            // keep track of most common items 
            if (data[i].details[r].value > highest_time) {
              highest_time = data[i].details[r].value
              highest_category = data[i].details[r].name
            }

            all_details.push({name: data[i].details[r].name, date: date_today_formatted + " " + String(new_date_time), value: data[i].details[r].value, real_time: data[i].details[r].date})

            total_labels.add(data[i].details[r].name)

          }

        
        }
    }
    all_days.push({date: date_today_formatted, totals: all_totals, details: all_details})

    console.log(all_days)

    return ( 
            <CalendarHeatmap
              data={all_days}
              color={'#cd2327'}
              overview={'day'}
              total_labels={total_labels.size}
              >
            </CalendarHeatmap>
            )
  }



          
          // // Initialize random data for the demo
          // let now = moment().endOf('day').toDate()
          // let time_ago = moment().startOf('day').subtract(10, 'year').toDate()
          // let data2 = d3.timeDays(time_ago, now).map(function (dateElement, index) {
          //   return {
          //     date: dateElement,
          //     details: Array.apply(null, new Array(Math.floor(Math.random() * 15))).map(function(e, i, arr) {
          //       return {
          //         'name': 'Project ' + Math.ceil(Math.random() * 10),
          //         'date': function () {
          //           let projectDate = new Date(dateElement.getTime())
          //           projectDate.setHours(Math.floor(Math.random() * 24))
          //           projectDate.setMinutes(Math.floor(Math.random() * 60))
          //           return projectDate
          //         }(),
          //         'value': 3600 * ((arr.length - i) / 5) + Math.floor(Math.random() * 3600) * Math.round(Math.random() * (index / 365))
          //       }
          //     }),
          //     init: function () {
          //       this.total = this.details.reduce(function (prev, e) {
          //         return prev + e.value
          //       }, 0)
          //       return this
          //     }
          //   }.init()
          // })


}






























































    //       <GridRow>
    // <div id="treeWrapper" style={{ width: '50em', height: '20em' }}>
    //   <Tree data={orgChart} />
    // </div>
    //     </GridRow>


// value: "/Internet & Telecom/Mobile & Wireless/Mobile Apps & Add-Ons/Android Apps"

// name: type 



        // <GridRow>
        //   <GridCol>
        //     <Heading level='h1'><strong>Gender</strong></Heading>
        //     {predictGenderOnTitle(this.state.allTitles)}
        //   </GridCol>
        // </GridRow>  
        // <GridRow>
        //   <GridCol>
        //      <Heading level='h1'><strong>Age</strong></Heading>
        //     {predictGenderOnPages(this.state.allTitles)}
        //   </GridCol>
        // </GridRow>  
        // <GridRow>
        //   <GridCol>
        //      <Heading level='h1'><strong>Good Actors</strong></Heading>
        //     {NoTrackerTable(noTrackers)}
        //   </GridCol>
        // </GridRow>

let data = {}





// function onCanceled(error) {
//   console.log(`Canceled: ${error}`);
// }
//


// {getAds(allAds)}

// make popup for scraping goolge ad inferences
function getGoogleInferences() {
  chrome.windows.create({'url': 'https://adssettings.google.com/', 'type': 'popup'}, function(window) {});
}



// port from existing feature
const googleInferencesTable = (data) => {
  let numEntries = data ? data.length : 0
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: 'Google Inferences (' + numEntries + ')',
          accessor: d => d,
          id: 'inferences',
          Cell: row => (
            <div key={row.value}>
                {row.value}
            </div>)
        }
      ]}
      defaultPageSize={20}
      style={{ height: "400px"}}
      showPageJump={false}
      showPageSizeOptions={true}
      className='-striped -highlight'
    />
  )
}


const googleAdsSettings2 = (data) => {


  let numEntries = data ? data.length : 0
  let dataLength = data ? data['children'].length : 0


  if (numEntries === 0 || dataLength == 0) {
    return
  } else {


    const getDynamicPathClass = ({ source, target }, orientation) => {
      if (!target.children) {
        // Target node has no children -> this link leads to a leaf node.
        return 'link__to-leaf';
      }

      // Style it as a link connecting two branch nodes by default.
      return 'link__to-branch';
    };




    return (

      // wait, how did https://codesandbox.io/s/xwj6jzvpp?file=/src/Example-React-d3-tree.js:2997-3131 only have white nodes when there is nothing to click
      // grey out lines 
      // make column go full length

      <div id="treeWrapper" style={{ width: '60em', height: String(dataLength * 2) + "em",}}>
        <Tree data={data}
        separation={{ nonSiblings: .1, siblings: .1 }}
        translate={{ x: 50, y: String(dataLength * 15) }}
        nodeSize={{ x: 250, y: 250 }}
        zoom={1}
        initialDepth={1}
        scaleExtent={{ max: 5, min: .1 }}
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
        // Statically apply same className(s) to all links
        pathClassFunc={() => 'custom-link'}
        // Want to apply multiple static classes? `Array.join` is your friend :)
        pathClassFunc={() => ['custom-link', 'extra-custom-link'].join(' ')}
        // Dynamically determine which `className` to pass based on the link's properties.
        pathClassFunc={getDynamicPathClass}

        />



      </div>

      )
  }


}


const googleAdsSettings = (data) => {

  let numEntries = data ? data.length : 0
  let dataLength = data ? data['children'].length : 0


  if (numEntries === 0 || dataLength == 0) {
    return ("...")
  } else {


    return (

      // <Tree
      // data={data}
      // height={1000}
      // width={500}
      // animated
      // duration={1000}
      // easing={easeElastic}
      // />


      <div id="treeWrapper" style={{ width: '60em', height: String(dataLength * 3) + "em",}}>

        <Tree data={data}
        separation={{ nonSiblings: .1, siblings: .1 }}
        translate={{ x: 50, y: String(dataLength * 20) }}
        nodeSize={{ x: 250, y: 250 }}
        zoom={1}
        scaleExtent={{ max: 3, min: .1 }}
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
        />

      </div>
      )
  }


}





const adCounts = (data) => {
  let numEntries = data ? data.length : 0
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: 'Explanation',
          accessor: d => d.explanation,
          id: 'domain',
          Cell: row => (
            <div key={row.value}>
                {row.value}
            </div>)
        },
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Frequency
          </div>),
        accessor: d => d.count,
        id: 'trackers',
        Cell: row => (
          row.value),
        maxWidth: 200
        }
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}
      className='-striped -highlight'
    />
  )
}

const advertiser_deep = (data) => {
  let numEntries = data ? data.length : 0
  console.log(data)
  return (
    <ReactTable
      data={data} 
      columns={[
        {Header: 'Advertiser',
          accessor: d => d.website,
          width: 250,
          id: 'domain',
          Cell: row => (
            <div key={row.value}>
              {row.value}
            </div>)
        },
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Why you saw the ad (ad explanation)
          </div>),
        accessor: d => d.all_explanations.map((line)=><div>{line}</div>),
        style: { 'whiteSpace': 'unset' },
        id: 'all possible explanations',
        Cell: row => (
          row.value),
        maxWidth: 1000
        },
        {Header: 'Ad Count',
          accessor: d => d.count,
          width: 100,
          id: 'count',
          Cell: row => (
            <div key={row.value}>
              {row.value}
            </div>)
        },
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}

      className='-striped -highlight'
    />
  )
}




const advertiser_ads = (data) => {
  let numEntries = data ? data.length : 0
  console.log(data)
  let all_ads = new Array(numEntries)
    var i
    for (i = 0; i < numEntries; i++) {
      let pageId = data[i].pageId
      let url = data[i].url
      let dom = data[i].dom 
      let explanation = data[i].explanation
      let domain = data[i].domain  
      // <div dangerouslySetInnerHTML={{ __html:html}} />
      let obj = {url: url, dom: dom, domain: domain, pageId: pageId, explanation: explanation}
      all_ads.push(obj)
      // break;
    }


    const frame_style = {
      overflow: "hidden",
      border: "0",
      position: "relative",
      width: "100%",
      height: "100%",
      border: "1px solid black",
      // height: "calc(591.44 / 1127.34 * 100%)",
      // width: "calc(591.44 / 1127.34 * 100%)",
    };



    // alert(moment(obj.pageId))
    // var day = moment(data.pageId);
    // alert(day)
    return all_ads.map( (obj) => 
      <GridRow> 
        <iframe srcDoc={obj.dom} style={frame_style} sandbox=""/>
        <Text> ==> {obj.domain} -- {String(obj.explanation)} </Text> 
      </GridRow>

    )

}

    // return (<iframe srcDoc={all_ads}/> )
    // return (<div dangerouslySetInnerHTML={{ __html:all_ads}} />)
    // <iframe srcDoc={obj.dom}/>
    // <iframe srcDoc={obj.dom} style={frame_style}/>
    // <Text> ==> {obj.domain} -- {String(moment(obj.pageId).format('LLLL') )} >< obj.explanation </Text> 


// <Iframe url={obj}/> 
// <Text> -- {obj.domain} -- {String(moment(obj.pageId).format('LLLL') )} </Text> 
// new feature, displays ads you've seen
const getAds = (data) => {

  let numEntries = data ? data.length : 0

  if (numEntries === 0) {
    return ('nothing to see here, move along ==> visit some websites!')
  }


// <Iframe url="https://s0.2mdn.net/2524173/1594752614534/dell_systems_fed_728x90/index.html"
// width="728px"
// height="90px"
// position="relative"/>


  else {
    console.log(Object.values(data))


    // let all_ads = new Array(numEntries)
    // var i
    // for (i = 0; i < numEntries; i++) {
    //   let url = data[i].url
    //   let initiator = data[i].initiator 
    //   let top_level_domain = data[i].domain 
    //   let render = '<GridRow><Iframe url=' + "'" + url + "'" + '/></GridRow>'
    //   all_ads.push(render)
    // }
    // // alert(moment(obj.pageId))
    // // var day = moment(data.pageId);
    // // alert(day)
    // console.log(moment(data.pageId))

    // return data.map( (obj) => 

    //   <GridRow> 
    //     <Iframe url={obj}/> 
    //     <Text> -- {obj[0]} -- {obj[1]} </Text> 
    //   </GridRow> 

    // )

  }

}



// new feature
// predict gender based on titles
const predictGenderOnTitle = (data) => {

  let numEntries = data ? data.length : 0

  if (numEntries === 0) {
    return ('gender determination pending ==> visit some websites!')
  }
  else {
    // tester on gender prediction
    const pg = require('predictgender');
    const pa = require('predictage');
    var output_gender = pg(data);
    var output_age = Math.floor(Object.values(pa(data)));
    var gender_lex = Math.round(Object.values(output_gender));
    var gender_string = '';
    if (gender_lex > 0) {
      gender_string = 'Male';
    }
    else {
      gender_string = 'Female';
    }

    console.log(gender_string, gender_lex);

    const myHTML = `hi`;

    // <div>{ ReactHtmlParser(html) }</div>
    // <div dangerouslySetInnerHTML={{ __html:html}} />


    const html = `
<div id="google_center_div"><div id="google_image_div"><a id="aw0" href="https://www.googleadservices.com/pagead/aclk?sa=L&amp;ai=CXk47N1z4YIzEI6uOjvQPmPSFoArQ78XaV6zj5tCJDrv8lv69FhABIMmrpCBgyYajh9SjgBCgAeqr690CyAEC4AIAqAMByAMIqgTyAU_Q9Cid1lsYrokwBggPMkdqrbwPdrbbET9BRBoBkgCi4ubWYGPfQeLoqVwHoh3HIiycbTB5pyp2McIcyeVenmP92A-WGoMv1rhU7DHEI2H4nKx44oePY0bRLTUGrGKP-ZUgcMpu01tLWeQLKpy2d4erDUyQNZ9xN_XlSYRArOAOW3TNqOENPGRlwyo7IeTclT5Vnv_VMzRIVrj0v5YKqLch4w3FeZmzQaNe-y67pFfOIkizsy2BPErljNki9hzFYxZbsYfmDBfKoJ4MILV0YTcLzVvKS3G4IYqU18IuKZPXZApMIdryEw0MFmqkkGOwVVrlwATxj-yd_gLgBAGIBfCEu8oHoAYC2AYCgAf-05SiAagH1ckbqAfw2RuoB_LZG6gHjs4bqAeT2BuoB7oGqAfulrECqAemvhuoB-zVG6gH89EbqAfs1RuoB5bYG9gHAaAIpYepBLAIAtIIBwiAIRABGB2xCUn4TBi73Xa0gAoDmAsByAsBuAwB2BMNghQZGhd3d3cuc21hbGxuZXRidWlsZGVyLmNvbdAVAYAXAQ&amp;ae=1&amp;num=1&amp;cid=CAASEuRoe54F0z-YF2_qOs-MfuBhfg&amp;sig=AOD64_3uBqaGoxqfv0iucTggMB3fHZ3Ajw&amp;client=ca-pub-9579993617424571&amp;nx=CLICK_X&amp;ny=CLICK_Y&amp;nb=2&amp;adurl=https://www.levelgreenlandscaping.com/request-a-consultation%3Fgclid%3DEAIaIQobChMIzLv86Nr08QIVK4eDCB0YegGkEAEYASAAEgJPR_D_BwE"><img src="https://tpc.googlesyndication.com/daca_images/simgad/13601400601262948032" decoding="async" class="i-amphtml-fill-content i-amphtml-replaced-content" alt=""></a><div id="abgc" dir="ltr" class="abgc abgf pen" aria-hidden="true"><div id="abgcp" class="abgcp pea"><div id="abgs" class="abgs"><a id="abgl" href="https://adssettings.google.com/whythisad?reasons=AB3afGEAAAVBW1tbW251bGwsWzUzXV0sW251bGwsImh0dHBzOi8vZ29vZ2xlYWRzLmcuZG91YmxlY2xpY2submV0L3BhZ2VhZC9pbnRlcmFjdGlvbi8_YWk9Q1hrNDdOMXo0WUl6RUk2dU9qdlFQbVBTRm9BclE3OFhhVjZ6ajV0Q0pEcnY4bHY2OUZoQUJJTW1ycENCZ3lZYWpoOVNqZ0JDZ0FlcXI2OTBDeUFFQzRBSUFxQU1CeUFNSXFnVHlBVV9ROUNpZDFsc1lyb2t3QmdnUE1rZHFyYndQZHJiYkVUOUJSQm9Ca2dDaTR1YldZR1BmUWVMb3FWd0hvaDNISWl5Y2JUQjVweXAyTWNJY3llVmVubVA5MkEtV0dvTXYxcmhVN0RIRUkySDRuS3g0NG9lUFkwYlJMVFVHckdLUC1aVWdjTXB1MDF0TFdlUUxLcHkyZDRlckRVeVFOWjl4Tl9YbFNZUkFyT0FPVzNUTnFPRU5QR1Jsd3lvN0llVGNsVDVWbnZfVk16UklWcmowdjVZS3FMY2g0dzNGZVptelFhTmUteTY3cEZmT0lraXpzeTJCUEVybGpOa2k5aHpGWXhaYnNZZm1EQmZLb0o0TUlMVjBZVGNMelZ2S1MzRzRJWXFVMThJdUtaUFhaQXBNSWRyeUV3ME1GbXFra0dPd1ZWcmx3QVR4ai15ZF9nTGdCQUdJQmZDRXU4b0hvQVlDMkFZQ2dBZi0wNVNpQWFnSDFja2JxQWZ3MlJ1b0JfTFpHNmdIanM0YnFBZVQyQnVvQjdvR3FBZnVsckVDcUFlbXZodW9CLXpWRzZnSDg5RWJxQWZzMVJ1b0I1YllHOWdIQWFBSXBZZXBCTEFJQXRJSUJ3aUFJUkFCR0IyeENVbjRUQmk3M1hhMGdBb0RtQXNCeUFzQnVBd0IyQk1OZ2hRWkdoZDNkM2N1YzIxaGJHeHVaWFJpZFdsc1pHVnlMbU52YmRBVkFZQVhBUVx1MDAyNnNpZ2g9V2hJa1VXdUljNmdcdTAwMjZjaWQ9Q0FRU1BBQ05JckxNMFZ6dFVwSlYxTV9vaXRlaFdxdGhBYWRoeEkyRVBWQS0wZGozS2I3ZFNRTHpkZ2Q0cmprT3QtWkNhUWJKdzVoUVR6Z2lBc1F2RnciLFtudWxsLG51bGwsbnVsbCwiaHR0cHM6Ly9kaXNwbGF5YWRzLWZvcm1hdHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2Fkcy9wcmV2aWV3L2NvbnRlbnQuanM_Y2xpZW50PXd0YVx1MDAyNm9iZnVzY2F0ZWRDdXN0b21lcklkPTYwMTg2MDQ0ODJcdTAwMjZjcmVhdGl2ZUlkPTUzMjM5NjUxMzYxNFx1MDAyNnZlcnNpb25JZD0wXHUwMDI2YWRHcm91cENyZWF0aXZlSWQ9NDgzNjIxNzEyMzAwXHUwMDI2aHRtbFBhcmVudElkPXByZXYtMFx1MDAyNmhlaWdodD0zNDVcdTAwMjZ3aWR0aD00MTRcdTAwMjZzaWc9QUNpVkJfd2RLbGlZUUpMUEFRTEVWWHBBRFF3M0xob3RaUSJdLG51bGwsbnVsbCwyLCJHdzhva1BZNjU1RUlyT1BtMElrT0VQQ0V1OG9IR05LenM2SUJJaGxzWlhabGJHZHlaV1Z1YkdGdVpITmpZWEJwYm1jdVkyOXRNZ2dJQlJNWWhNY0JGRUlYWTJFdGNIVmlMVGsxTnprNU9UTTJNVGMwTWpRMU56RklFbGdDY0FFIiwiMjAzNTIwNDcyMCJdXV0sWzIsMSwxLDFdXSwYX2jWPYXdRfHZPRFGxf4jiEs0rUSOUAuAOgNAgj2DxBqpX2IaPZTKt8_uckheoBCf4MXdfOZagSqMsqDiDDDu0PI83AjhmbOTtT0aebyxb-REdn5gStx8BmQ5Sfn8xTVU_Jy0CFFnr8-SWmjGTqEhWM8XqRw9axWUFhRG5SWbfPsg6ahPASF8X3elBECZQlZ8Ra8KAUqT15U0yuAgdOash64eYMrXtGsUEuCbLh2ZsOPehEmXkBWGzU99A-01bfs1UUcaeCYTGBV_eqJGNhnXccNXZYmQwcCPGBGVEX1wGJ6Cr62fJRYTWDu_vefhxXJsVTcUgDXxrIVRc5ueByU,OSvFCD1oQxg9nkPGjReUDQ&amp;source=display" class="abgl"><img src="https://tpc.googlesyndication.com/pagead/images/adchoices/en.png" decoding="async" class="i-amphtml-fill-content i-amphtml-replaced-content"></a></div><div id="abgb" class="abgb"><a href="https://adssettings.google.com/whythisad?reasons=AB3afGEAAAVBW1tbW251bGwsWzUzXV0sW251bGwsImh0dHBzOi8vZ29vZ2xlYWRzLmcuZG91YmxlY2xpY2submV0L3BhZ2VhZC9pbnRlcmFjdGlvbi8_YWk9Q1hrNDdOMXo0WUl6RUk2dU9qdlFQbVBTRm9BclE3OFhhVjZ6ajV0Q0pEcnY4bHY2OUZoQUJJTW1ycENCZ3lZYWpoOVNqZ0JDZ0FlcXI2OTBDeUFFQzRBSUFxQU1CeUFNSXFnVHlBVV9ROUNpZDFsc1lyb2t3QmdnUE1rZHFyYndQZHJiYkVUOUJSQm9Ca2dDaTR1YldZR1BmUWVMb3FWd0hvaDNISWl5Y2JUQjVweXAyTWNJY3llVmVubVA5MkEtV0dvTXYxcmhVN0RIRUkySDRuS3g0NG9lUFkwYlJMVFVHckdLUC1aVWdjTXB1MDF0TFdlUUxLcHkyZDRlckRVeVFOWjl4Tl9YbFNZUkFyT0FPVzNUTnFPRU5QR1Jsd3lvN0llVGNsVDVWbnZfVk16UklWcmowdjVZS3FMY2g0dzNGZVptelFhTmUteTY3cEZmT0lraXpzeTJCUEVybGpOa2k5aHpGWXhaYnNZZm1EQmZLb0o0TUlMVjBZVGNMelZ2S1MzRzRJWXFVMThJdUtaUFhaQXBNSWRyeUV3ME1GbXFra0dPd1ZWcmx3QVR4ai15ZF9nTGdCQUdJQmZDRXU4b0hvQVlDMkFZQ2dBZi0wNVNpQWFnSDFja2JxQWZ3MlJ1b0JfTFpHNmdIanM0YnFBZVQyQnVvQjdvR3FBZnVsckVDcUFlbXZodW9CLXpWRzZnSDg5RWJxQWZzMVJ1b0I1YllHOWdIQWFBSXBZZXBCTEFJQXRJSUJ3aUFJUkFCR0IyeENVbjRUQmk3M1hhMGdBb0RtQXNCeUFzQnVBd0IyQk1OZ2hRWkdoZDNkM2N1YzIxaGJHeHVaWFJpZFdsc1pHVnlMbU52YmRBVkFZQVhBUVx1MDAyNnNpZ2g9V2hJa1VXdUljNmdcdTAwMjZjaWQ9Q0FRU1BBQ05JckxNMFZ6dFVwSlYxTV9vaXRlaFdxdGhBYWRoeEkyRVBWQS0wZGozS2I3ZFNRTHpkZ2Q0cmprT3QtWkNhUWJKdzVoUVR6Z2lBc1F2RnciLFtudWxsLG51bGwsbnVsbCwiaHR0cHM6Ly9kaXNwbGF5YWRzLWZvcm1hdHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2Fkcy9wcmV2aWV3L2NvbnRlbnQuanM_Y2xpZW50PXd0YVx1MDAyNm9iZnVzY2F0ZWRDdXN0b21lcklkPTYwMTg2MDQ0ODJcdTAwMjZjcmVhdGl2ZUlkPTUzMjM5NjUxMzYxNFx1MDAyNnZlcnNpb25JZD0wXHUwMDI2YWRHcm91cENyZWF0aXZlSWQ9NDgzNjIxNzEyMzAwXHUwMDI2aHRtbFBhcmVudElkPXByZXYtMFx1MDAyNmhlaWdodD0zNDVcdTAwMjZ3aWR0aD00MTRcdTAwMjZzaWc9QUNpVkJfd2RLbGlZUUpMUEFRTEVWWHBBRFF3M0xob3RaUSJdLG51bGwsbnVsbCwyLCJHdzhva1BZNjU1RUlyT1BtMElrT0VQQ0V1OG9IR05LenM2SUJJaGxzWlhabGJHZHlaV1Z1YkdGdVpITmpZWEJwYm1jdVkyOXRNZ2dJQlJNWWhNY0JGRUlYWTJFdGNIVmlMVGsxTnprNU9UTTJNVGMwTWpRMU56RklFbGdDY0FFIiwiMjAzNTIwNDcyMCJdXV0sWzIsMSwxLDFdXSwYX2jWPYXdRfHZPRFGxf4jiEs0rUSOUAuAOgNAgj2DxBqpX2IaPZTKt8_uckheoBCf4MXdfOZagSqMsqDiDDDu0PI83AjhmbOTtT0aebyxb-REdn5gStx8BmQ5Sfn8xTVU_Jy0CFFnr8-SWmjGTqEhWM8XqRw9axWUFhRG5SWbfPsg6ahPASF8X3elBECZQlZ8Ra8KAUqT15U0yuAgdOash64eYMrXtGsUEuCbLh2ZsOPehEmXkBWGzU99A-01bfs1UUcaeCYTGBV_eqJGNhnXccNXZYmQwcCPGBGVEX1wGJ6Cr62fJRYTWDu_vefhxXJsVTcUgDXxrIVRc5ueByU,OSvFCD1oQxg9nkPGjReUDQ&amp;source=display"><img src="https://tpc.googlesyndication.com/pagead/images/adchoices/icon.png" decoding="async" class="i-amphtml-fill-content i-amphtml-replaced-content"></a></div></div><form id="mta" class="sh ss jt amp-animate abgf pen" action="//g.co"><input type="radio" name="a" id="spr0"><input type="radio" name="a" id="spr1"><input type="radio" name="a" id="spr2"><input type="radio" name="a" id="spr3"><label id="cbb" for="spr1" data-vars-label="user_feedback_menu_interaction" class="cbb pea"><svg xmlns="//www.w3.org/2000/svg" width="15" height="15"><path fill="#cdcccc" d="M0,0l15,0l0,15l-15,0Z"></path><path stroke-width="1.25" stroke="#00aecd" d="M3.25,3.25l8.5,8.5M11.75,3.25l-8.5,8.5"></path></svg></label><div id="spv1" class="pn abgf"><div id="menu-dismiss" class="close"><label for="spr0"><svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" class="native-arrow"></path></svg></label></div><div id="ti"><span class="ct">Ads by <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 24" fill="#000000"><path d="M7.5 16.29c-4.07 0-7.49-3.31-7.49-7.38S3.43 1.53 7.5 1.53c2.25 0 3.85.88 5.06 2.03l-1.42 1.42c-.87-.81-2.04-1.44-3.64-1.44-2.97 0-5.29 2.4-5.29 5.37s2.32 5.37 5.29 5.37c1.93 0 3.03-.77 3.73-1.48.58-.58.95-1.4 1.1-2.54H7.5V8.24h6.79c.07.36.11.79.11 1.26 0 1.51-.41 3.39-1.75 4.72-1.3 1.35-2.95 2.07-5.15 2.07zm17.75-4.76c0 2.74-2.13 4.75-4.75 4.75s-4.75-2.02-4.75-4.75c0-2.75 2.13-4.75 4.75-4.75s4.75 2 4.75 4.75zm-2.08 0c0-1.71-1.24-2.88-2.67-2.88s-2.67 1.17-2.67 2.88c0 1.69 1.24 2.88 2.67 2.88s2.67-1.18 2.67-2.88zm13.08 0c0 2.74-2.13 4.75-4.75 4.75s-4.75-2.02-4.75-4.75c0-2.75 2.13-4.75 4.75-4.75s4.75 2 4.75 4.75zm-2.08 0c0-1.71-1.24-2.88-2.67-2.88s-2.67 1.17-2.67 2.88c0 1.69 1.24 2.88 2.67 2.88s2.67-1.18 2.67-2.88zm12.58-4.46v8.53c0 3.51-2.07 4.95-4.52 4.95-2.3 0-3.69-1.55-4.21-2.81l1.82-.76c.32.77 1.12 1.69 2.39 1.69 1.57 0 2.54-.97 2.54-2.79v-.68h-.07c-.47.58-1.37 1.08-2.5 1.08-2.38 0-4.56-2.07-4.56-4.74 0-2.68 2.18-4.77 4.56-4.77 1.13 0 2.03.5 2.5 1.06h.07v-.76h1.98zm-1.84 4.48c0-1.67-1.12-2.9-2.54-2.9-1.44 0-2.65 1.22-2.65 2.9 0 1.66 1.21 2.86 2.65 2.86 1.43.01 2.54-1.2 2.54-2.86zm5.89-9.52V16h-2.09V2.03h2.09zm8.49 11.07l1.62 1.08c-.52.77-1.78 2.11-3.96 2.11-2.7 0-4.72-2.09-4.72-4.75 0-2.83 2.03-4.75 4.48-4.75 2.47 0 3.67 1.96 4.07 3.02l.22.54-6.36 2.63c.49.95 1.24 1.44 2.3 1.44 1.07 0 1.81-.53 2.35-1.32zm-4.99-1.71l4.25-1.76c-.23-.59-.94-1.01-1.76-1.01-1.06 0-2.54.93-2.49 2.77z"></path><path fill="none" d="M0 0h62v24H0z"></path></svg></span></div><div id="btns"><label for="spr2" data-vars-label-instance="1" data-vars-label="user_feedback_menu_option"><a id="rbtn" class="btn"><span>Stop seeing this ad</span></a></label><label><a id="sbtn" href="https://adssettings.google.com/whythisad?reasons=AB3afGEAAAVBW1tbW251bGwsWzUzXV0sW251bGwsImh0dHBzOi8vZ29vZ2xlYWRzLmcuZG91YmxlY2xpY2submV0L3BhZ2VhZC9pbnRlcmFjdGlvbi8_YWk9Q1hrNDdOMXo0WUl6RUk2dU9qdlFQbVBTRm9BclE3OFhhVjZ6ajV0Q0pEcnY4bHY2OUZoQUJJTW1ycENCZ3lZYWpoOVNqZ0JDZ0FlcXI2OTBDeUFFQzRBSUFxQU1CeUFNSXFnVHlBVV9ROUNpZDFsc1lyb2t3QmdnUE1rZHFyYndQZHJiYkVUOUJSQm9Ca2dDaTR1YldZR1BmUWVMb3FWd0hvaDNISWl5Y2JUQjVweXAyTWNJY3llVmVubVA5MkEtV0dvTXYxcmhVN0RIRUkySDRuS3g0NG9lUFkwYlJMVFVHckdLUC1aVWdjTXB1MDF0TFdlUUxLcHkyZDRlckRVeVFOWjl4Tl9YbFNZUkFyT0FPVzNUTnFPRU5QR1Jsd3lvN0llVGNsVDVWbnZfVk16UklWcmowdjVZS3FMY2g0dzNGZVptelFhTmUteTY3cEZmT0lraXpzeTJCUEVybGpOa2k5aHpGWXhaYnNZZm1EQmZLb0o0TUlMVjBZVGNMelZ2S1MzRzRJWXFVMThJdUtaUFhaQXBNSWRyeUV3ME1GbXFra0dPd1ZWcmx3QVR4ai15ZF9nTGdCQUdJQmZDRXU4b0hvQVlDMkFZQ2dBZi0wNVNpQWFnSDFja2JxQWZ3MlJ1b0JfTFpHNmdIanM0YnFBZVQyQnVvQjdvR3FBZnVsckVDcUFlbXZodW9CLXpWRzZnSDg5RWJxQWZzMVJ1b0I1YllHOWdIQWFBSXBZZXBCTEFJQXRJSUJ3aUFJUkFCR0IyeENVbjRUQmk3M1hhMGdBb0RtQXNCeUFzQnVBd0IyQk1OZ2hRWkdoZDNkM2N1YzIxaGJHeHVaWFJpZFdsc1pHVnlMbU52YmRBVkFZQVhBUVx1MDAyNnNpZ2g9V2hJa1VXdUljNmdcdTAwMjZjaWQ9Q0FRU1BBQ05JckxNMFZ6dFVwSlYxTV9vaXRlaFdxdGhBYWRoeEkyRVBWQS0wZGozS2I3ZFNRTHpkZ2Q0cmprT3QtWkNhUWJKdzVoUVR6Z2lBc1F2RnciLFtudWxsLG51bGwsbnVsbCwiaHR0cHM6Ly9kaXNwbGF5YWRzLWZvcm1hdHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2Fkcy9wcmV2aWV3L2NvbnRlbnQuanM_Y2xpZW50PXd0YVx1MDAyNm9iZnVzY2F0ZWRDdXN0b21lcklkPTYwMTg2MDQ0ODJcdTAwMjZjcmVhdGl2ZUlkPTUzMjM5NjUxMzYxNFx1MDAyNnZlcnNpb25JZD0wXHUwMDI2YWRHcm91cENyZWF0aXZlSWQ9NDgzNjIxNzEyMzAwXHUwMDI2aHRtbFBhcmVudElkPXByZXYtMFx1MDAyNmhlaWdodD0zNDVcdTAwMjZ3aWR0aD00MTRcdTAwMjZzaWc9QUNpVkJfd2RLbGlZUUpMUEFRTEVWWHBBRFF3M0xob3RaUSJdLG51bGwsbnVsbCwyLCJHdzhva1BZNjU1RUlyT1BtMElrT0VQQ0V1OG9IR05LenM2SUJJaGxzWlhabGJHZHlaV1Z1YkdGdVpITmpZWEJwYm1jdVkyOXRNZ2dJQlJNWWhNY0JGRUlYWTJFdGNIVmlMVGsxTnprNU9UTTJNVGMwTWpRMU56RklFbGdDY0FFIiwiMjAzNTIwNDcyMCJdXV0sWzIsMSwxLDFdXSwYX2jWPYXdRfHZPRFGxf4jiEs0rUSOUAuAOgNAgj2DxBqpX2IaPZTKt8_uckheoBCf4MXdfOZagSqMsqDiDDDu0PI83AjhmbOTtT0aebyxb-REdn5gStx8BmQ5Sfn8xTVU_Jy0CFFnr8-SWmjGTqEhWM8XqRw9axWUFhRG5SWbfPsg6ahPASF8X3elBECZQlZ8Ra8KAUqT15U0yuAgdOash64eYMrXtGsUEuCbLh2ZsOPehEmXkBWGzU99A-01bfs1UUcaeCYTGBV_eqJGNhnXccNXZYmQwcCPGBGVEX1wGJ6Cr62fJRYTWDu_vefhxXJsVTcUgDXxrIVRc5ueByU,OSvFCD1oQxg9nkPGjReUDQ&amp;source=display" data-vars-label-instance="1" data-vars-label="closebutton_whythisad_click" class="btn"><span>Why this ad?&nbsp;<svg xmlns="//www.w3.org/2000/svg" viewBox="0 0 16 16" id="si" fill="#000000"><circle r="0.67" cy="6" cx="6"></circle><path d="M4.2,11.3Q3.3,11.8,3.3,10.75L3.3,4.1Q3.3,3.1,4.3,3.5L10.4,7.0Q12.0,7.5,10.4,8.0L6.65,10.0L6.65,7.75a0.65,0.65,0,1,0,-1.3,0L5.35,10.75a0.9,0.9,0,0,0,1.3,0.8L12.7,8.2Q13.7,7.5,12.7,6.7L3.3,1.6Q2.2,1.3,1.8,2.5L1.8,12.5Q2.2,13.9,3.3,13.3L4.8,12.5A0.3,0.3,0,1,0,4.2,11.3Z"></path></svg></span></a></label></div></div><div id="spv2" class="pn abgf"><label for="spr3" data-vars-label-instance="8" data-vars-label="mute_survey_option" class="sb so"><div><span>Ad was inappropriate</span></div></label><label for="spr3" data-vars-label-instance="2" data-vars-label="mute_survey_option" class="sb so"><div><span>Seen this ad multiple times</span></div></label><label for="spr3" data-vars-label-instance="7" data-vars-label="mute_survey_option" class="sb so"><div><span>Not interested in this ad</span></div></label><label for="spr3" data-vars-label-instance="3" data-vars-label="mute_survey_option" class="sb so"><div><span>Ad covered content</span></div></label></div><div id="spv3" class="pn abgf"><span id="pct">We'll try not to show that ad again</span></div><div id="spv4" class="pn abgf"><span class="ct fct">Ad closed by <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 24" fill="#000000"><path d="M7.5 16.29c-4.07 0-7.49-3.31-7.49-7.38S3.43 1.53 7.5 1.53c2.25 0 3.85.88 5.06 2.03l-1.42 1.42c-.87-.81-2.04-1.44-3.64-1.44-2.97 0-5.29 2.4-5.29 5.37s2.32 5.37 5.29 5.37c1.93 0 3.03-.77 3.73-1.48.58-.58.95-1.4 1.1-2.54H7.5V8.24h6.79c.07.36.11.79.11 1.26 0 1.51-.41 3.39-1.75 4.72-1.3 1.35-2.95 2.07-5.15 2.07zm17.75-4.76c0 2.74-2.13 4.75-4.75 4.75s-4.75-2.02-4.75-4.75c0-2.75 2.13-4.75 4.75-4.75s4.75 2 4.75 4.75zm-2.08 0c0-1.71-1.24-2.88-2.67-2.88s-2.67 1.17-2.67 2.88c0 1.69 1.24 2.88 2.67 2.88s2.67-1.18 2.67-2.88zm13.08 0c0 2.74-2.13 4.75-4.75 4.75s-4.75-2.02-4.75-4.75c0-2.75 2.13-4.75 4.75-4.75s4.75 2 4.75 4.75zm-2.08 0c0-1.71-1.24-2.88-2.67-2.88s-2.67 1.17-2.67 2.88c0 1.69 1.24 2.88 2.67 2.88s2.67-1.18 2.67-2.88zm12.58-4.46v8.53c0 3.51-2.07 4.95-4.52 4.95-2.3 0-3.69-1.55-4.21-2.81l1.82-.76c.32.77 1.12 1.69 2.39 1.69 1.57 0 2.54-.97 2.54-2.79v-.68h-.07c-.47.58-1.37 1.08-2.5 1.08-2.38 0-4.56-2.07-4.56-4.74 0-2.68 2.18-4.77 4.56-4.77 1.13 0 2.03.5 2.5 1.06h.07v-.76h1.98zm-1.84 4.48c0-1.67-1.12-2.9-2.54-2.9-1.44 0-2.65 1.22-2.65 2.9 0 1.66 1.21 2.86 2.65 2.86 1.43.01 2.54-1.2 2.54-2.86zm5.89-9.52V16h-2.09V2.03h2.09zm8.49 11.07l1.62 1.08c-.52.77-1.78 2.11-3.96 2.11-2.7 0-4.72-2.09-4.72-4.75 0-2.83 2.03-4.75 4.48-4.75 2.47 0 3.67 1.96 4.07 3.02l.22.54-6.36 2.63c.49.95 1.24 1.44 2.3 1.44 1.07 0 1.81-.53 2.35-1.32zm-4.99-1.71l4.25-1.76c-.23-.59-.94-1.01-1.76-1.01-1.06 0-2.54.93-2.49 2.77z"></path><path fill="none" d="M0 0h62v24H0z"></path></svg></span></div></form></div></div></div><img src="//www.google.com/ads/measurement/l?ebcid=ALh7CaTyeva_yPwE-X3YE3RN43k1F_AmjgixT2nZX0BsuHYG-FgqydLQRhUpzHYn9JIM6_yld2C4tKo90NFfbaqpv8ILI1Jzwg"><div style="bottom:0;right:0;width:414px;height:345px;background:initial;position:absolute;max-width:100%;max-height:100%;pointer-events:none;image-rendering:pixelated;z-index:2147483647;background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAWBAMAAACrl3iAAAAABlBMVEUAAAD+AciWmZzWAAAAAnRSTlMAApidrBQAAAB5SURBVBjTbVAJDoAwDGI/4P+vVYEeS2zVlYwhA/iv4/K4ELXL7+EgMeBGI5EYolaj3q9Ps0ubC9W/0+MrxTDbN5p/7KZp1TLjc8tz9EVmWYhtzaO6psuJDtL33L4VIu4Ek0ccbU04ljvB4vqWzca8lza2djmZHN/1AXGVBhUezqyEAAAAAElFTkSuQmCC');"></div><img src="https://securepubads.g.doubleclick.net/pagead/adview?ai=C9gYRN1z4YIzEI6uOjvQPmPSFoArQ78XaV6zj5tCJDrv8lv69FhABIMmrpCBgyYajh9SjgBCgAeqr690CyAEC4AIAqAMByAMIqgTvAU_Q9Cid1lsYrokwBggPMkdqrbwPdrbbET9BRBoBkgCi4ubWYGPfQeLoqVwHoh3HIiycbTB5pyp2McIcyeVenmP92A-WGoMv1rhU7DHEI2H4nKx44oePY0bRLTUGrGKP-ZUgcMpu01tLWeQLKpy2d4erDUyQNZ9xN_XlSYRArOAOW3TNqOENPGRlwyo7IeTclT5Vnv_VMzRIVrj0v5YKqLch4w3FeZmzQaNe-y67pFfOIkizsy2BPErljNki9hzFYxZbsYfmDBfKoJ4MILV0YTcLzVvKS3G4Y4iDRSL19rQKu1ua9a0kx3fEyWhoZ3ymwATxj-yd_gLgBAGIBfCEu8oHkgUECAQYAZIFBAgFGASgBgLYBgKAB_7TlKIBqAfVyRuoB_DZG6gH8tkbqAeOzhuoB5PYG6gHugaoB-6WsQKoB6a-G6gH7NUb2AcB8gcEELLxW6AIpYepBLAIAtIIBwiAIRABGB2ACgPICwHYEw2CFBkaF3d3dy5zbWFsbG5ldGJ1aWxkZXIuY29t0BUBgBcBshcaChgIABIUcHViLTk1Nzk5OTM2MTc0MjQ1NzE&amp;sigh=KVrjAn-scUU"><div class="amp-bcp-top amp-bcp"></div><div class="amp-bcp-right amp-bcp"></div><div class="amp-bcp-bottom amp-bcp"></div><div class="amp-bcp-left amp-bcp"></div><div class="amp-fcp"></div>
`;


    return ('hi')

//     return  ( 

//       <div>{ ReactHtmlParser(html) }</div>




// // <Iframe url="https://s0.2mdn.net/2524173/1594752614534/dell_systems_fed_728x90/index.html"
// // width="800px"
// // height="900px"
// // position="relative"/>

// // <iframe srcDoc={`


// // <html><head></head><body style="margin:0px;" marginwidth="0" marginheight="0">domain -- teenvogue.com  pageID --1626884633314<br><br>trigger: adclick.g. regex on clickable link<br><br><br>ID: tzupj<br><br><br>caller: https://ad.doubleclick.net/ddm/adi/N636.3325855MIQ/B26036167.306962600;dc_ver=77.223;dc_eid=44728099;sz=320x50;u_sd=2;dc_adk=2975593756;ord=zu9kkb;click=https%3A%2F%2Fgoogleads.g.doubleclick.net%2Fdbm%2Fclk%3Fsa%3DL%26ai%3DCZgQHeEr4YMPCCouvhweszI3oAuXA5MljxcuXm5EOj8H5uNUnEAEg9IO5G2DJhqOH1KOAEKABmuCm_wLIAQmoAwGqBO8BT9DRWMoMzD9HcJqwEPXwJEpmeFC1KKWbIp_GpiDKkRhErOoeDPvIce-ZZ_ErSzPJ8OTEX_bDxhVsrxX6Fw85OwvP0sNkYYd_pdZv1-Ru1MbCBcjk5QjraP7WBaqJ53yONUc1ISonizBE_fEznu9aHDxiqlQ-UMs6a73Plg63b6wBGyXcOvq2iBJcEbYOzWRBlFDfhlUP9QcDMp7ftTyz11UKqDti2IeYtK49wL4Kvrj1Fra2v0eijvA4Altxu_JkDdFn80tWfNDKD9DuBvmGIsX_lFdg0HwbcZ3U-ih9sUXuUCkKk9pD1fZ4JzfqoNDABJLDnYDUA-AEA4gF4_r2mTOQBgGgBk3YBgKAB86f2YABqAfVyRuoB_DZG6gH8tkbqAeOzhuoB5PYG6gHugaoB-zVG6gH7paxAqgHpr4bqAfs1RuoB_PRG6gHltgb2AcAoAilh6kEsAgC0ggHCIAhEAEYHYAKA5gLAcgLAYAMAbATld37C9ATANgTA4IUExoRd3d3LnRlZW52b2d1ZS5jb23YFAHQFQGAFwE%26ae%3D1%26num%3D1%26cid%3DCAASEuRo2Khlnn33kapWLTMFdgyDZw%26sig%3DAOD64_3-vITNJQlY8iFIfVmJf1bupYmxRg%26client%3Dca-pub-3844877863303739%26dbm_c%3DAKAmf-DsPVKWyJOhB5niRH4UZ6Ry-QmGBnB-NmhsuTHa8yTEePclTpUSsgNokIR0WfBWLCQ6H-_eBoE8J51kWVTYa_74Rw3INO8yUXwCTNGlY2zjrX7R4Dcp3ASzCURJwB5GFyGlZKBw76lfHy6I6JPkj_5cMxtNMA%26cry%3D1%26dbm_d%3DAKAmf-AeXLWN3IpxRVTFpIp1YUZJsF7T9WzDwViMfUmD_6dRJ5zMK2QZ8k-G58qm5oiyEuL9fCKrZ5LhP7m3aZpeQMSQT5pB2eiTkQ0MWoJ8r_19YGwaSl8yno59Z8Tj0e2vIpwqMUKGdaiYV2UtLJ0BY_bd-EsN-5sFun6kxUL5e58ZutwPhAfPc4jrlB_d2oLCHQ1fL3DZS_UfbjVCooyQEqvF7Xm_-mctm5xEsw3GYYwPXOHDA7o6jWnOdjnzCOPy3newvFEcs6USimdsvGJV7g4ebZ2pShyE2DQHDfUIb-cj0ozBUJrh59F2IcruG31ykIm7KCfrOW25vJTo3wXZufn64X-74AOckNPlUEBM3hIcSmU6p4NCQ01PzgQbbGiO4QgoiUkNz8NouAidt7hKjQHtGRYB4YEhGCI0bPLhmKD3MWBraDpgpatSOBSFH2TCFgx9JBSrkguhwgZP5V4rMLk6qGmhXLSnmpwawBzOmoKa2xSTkZFw3jZwrI1Y9eMwgC2hTP1rW-Yso5IJUZn1tOrudqNDnQ%26adurl%3D;uach=%5B%22Android%22%2C%226.0%22%2C%22%22%2C%22Nexus%205%22%2C%2291.0.4472.114%22%2C%5B%5D%2Cnull%2Cnull%2Cnull%5D;dc_rfl=1,https%3A%2F%2Fwww.teenvogue.com%2F$0;xdt=1;crlt=hbSR)2ki'M;osda=2;sttr=11;prcl=s...undefined<br><br><br>landing page: https://adclick.g.doubleclick.net/pcs/click?xai=AKAOjssy33s4N3kjnYG2Tw2nqrlWI1wv5mK6gL5nx5NT8oz38Y9AYLSQwrLdhqzRMynTjFybLfXfkI82Br5nFA-XjX9kVhcm935NfEKA851RlUaCXpjdJdJpTq3dM4RazgTc592L9OLSTpl2h5qIpDC0TgA3cwosdNwP&amp;sig=Cg0ArKJSzITaPSHknGDC&amp;fbs_aeid=[gw_fbsaeid]&amp;urlfix=1&amp;adurl=https://googleads.g.doubleclick.net/dbm/clk%3Fsa%3DL%26ai%3DCZgQHeEr4YMPCCouvhweszI3oAuXA5MljxcuXm5EOj8H5uNUnEAEg9IO5G2DJhqOH1KOAEKABmuCm_wLIAQmoAwGqBO8BT9DRWMoMzD9HcJqwEPXwJEpmeFC1KKWbIp_GpiDKkRhErOoeDPvIce-ZZ_ErSzPJ8OTEX_bDxhVsrxX6Fw85OwvP0sNkYYd_pdZv1-Ru1MbCBcjk5QjraP7WBaqJ53yONUc1ISonizBE_fEznu9aHDxiqlQ-UMs6a73Plg63b6wBGyXcOvq2iBJcEbYOzWRBlFDfhlUP9QcDMp7ftTyz11UKqDti2IeYtK49wL4Kvrj1Fra2v0eijvA4Altxu_JkDdFn80tWfNDKD9DuBvmGIsX_lFdg0HwbcZ3U-ih9sUXuUCkKk9pD1fZ4JzfqoNDABJLDnYDUA-AEA4gF4_r2mTOQBgGgBk3YBgKAB86f2YABqAfVyRuoB_DZG6gH8tkbqAeOzhuoB5PYG6gHugaoB-zVG6gH7paxAqgHpr4bqAfs1RuoB_PRG6gHltgb2AcAoAilh6kEsAgC0ggHCIAhEAEYHYAKA5gLAcgLAYAMAbATld37C9ATANgTA4IUExoRd3d3LnRlZW52b2d1ZS5jb23YFAHQFQGAFwE%26ae%3D1%26num%3D1%26cid%3DCAASEuRo2Khlnn33kapWLTMFdgyDZw%26sig%3DAOD64_3-vITNJQlY8iFIfVmJf1bupYmxRg%26client%3Dca-pub-3844877863303739%26dbm_c%3DAKAmf-DsPVKWyJOhB5niRH4UZ6Ry-QmGBnB-NmhsuTHa8yTEePclTpUSsgNokIR0WfBWLCQ6H-_eBoE8J51kWVTYa_74Rw3INO8yUXwCTNGlY2zjrX7R4Dcp3ASzCURJwB5GFyGlZKBw76lfHy6I6JPkj_5cMxtNMA%26cry%3D1%26dbm_d%3DAKAmf-AeXLWN3IpxRVTFpIp1YUZJsF7T9WzDwViMfUmD_6dRJ5zMK2QZ8k-G58qm5oiyEuL9fCKrZ5LhP7m3aZpeQMSQT5pB2eiTkQ0MWoJ8r_19YGwaSl8yno59Z8Tj0e2vIpwqMUKGdaiYV2UtLJ0BY_bd-EsN-5sFun6kxUL5e58ZutwPhAfPc4jrlB_d2oLCHQ1fL3DZS_UfbjVCooyQEqvF7Xm_-mctm5xEsw3GYYwPXOHDA7o6jWnOdjnzCOPy3newvFEcs6USimdsvGJV7g4ebZ2pShyE2DQHDfUIb-cj0ozBUJrh59F2IcruG31ykIm7KCfrOW25vJTo3wXZufn64X-74AOckNPlUEBM3hIcSmU6p4NCQ01PzgQbbGiO4QgoiUkNz8NouAidt7hKjQHtGRYB4YEhGCI0bPLhmKD3MWBraDpgpatSOBSFH2TCFgx9JBSrkguhwgZP5V4rMLk6qGmhXLSnmpwawBzOmoKa2xSTkZFw3jZwrI1Y9eMwgC2hTP1rW-Yso5IJUZn1tOrudqNDnQ%26adurl%3Dhttps://baltimore.org/meetings%253Futm_source%253Dmiq%2526utm_medium%253Ddisplay%2526utm_campaign%253Dfy21meetings%2526utm_content%253Dretargeting<br><br><br>explanation: undefined<br><br><br>   <div style="zoom: 0.75; -moz-transform: scale(0.75); -moz-transform-origin: 0 0; position: absolute; left: 50px; top: 50px">

// // </div></div></body></html>

// // `} />



//             // "Based on your web history, we've determined that you are a " + gender_string + "! " +
//             // "Your gender score is " + gender_lex + ", where values closer to 0 are less gender polarized—negative is for female and positive is for male :)"

//             )

  }

}

const predictGenderOnPages = (data) => {

  function mode(arr){
    // gets mode of the array
    // credit: https://stackoverflow.com/a/20762713
    return arr.sort((a,b) =>
          arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
    ).pop();
  }

  let numEntries = data ? data.length : 0

  if (numEntries === 0) {
    return ('gender determination pending ==> visit some websites!')
  }
  else {
    // tester on gender prediction
    const stats = require("stats-lite")
    const pa = require('predictage');
    // alert(JSON.stringify(data))
    var output_age = Math.floor(Object.values(pa(data)));
    let genders = []
    let lexicals = []
    for (var i = 0, l = data.length; i < l; i++) {
      var temp = data[i];
      genders.push(temp.gender)
      lexicals.push(temp.genderLexical)
    }

    var mode_gender = mode(genders);
    var mean_lexical = Math.round(stats.mean(lexicals));


    return  (

            "Based on your web history, we've determined that you are " + output_age + " years old! "

            )

  }

}

// port from existing feature
const NoTrackerTable = (data) => {
  let numEntries = data ? data.length : 0
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: 'Good Actors (' + numEntries + ')',
          accessor: d => d,
          id: 'domain',
          Cell: row => (
            <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' href={'#/sites/' + row.value}>
                {row.value}
              </Link>
            </div>)
        }
      ]}
      defaultPageSize={5}
      showPageJump={false}
      showPageSizeOptions={true}
      className='-striped -highlight'
    />
  )
}





export class FeatureTeaserPage extends React.Component {
constructor (props) {
    super(props)
    this.state = {
      trackers: [],
      graphCount: "all",
      numTrackers: '…'
    }
    // this.logLoad = this.logLoad.bind(this);
    this.updateGraphCount = this.updateGraphCount.bind(this)
  }

  async getData () {
    const background = await browser.runtime.getBackgroundPage()

    let now = new Date(Date.now()).getTime()
    let args = {count: 100, endTime: now}

    const numPages = background.queryDatabase('getNumberOfPages', {})
    const numDomains = background.queryDatabase('getNumberOfDomains', {})
    numPages.then(n => this.setState({numPages: n}))
    numDomains.then(n => this.setState({numDomains: n}))

    const recent = background.queryDatabase('getDomains', args)
    const manyTrackers = background.queryDatabase('getDomainsByTrackerCount', args)
    const noTrackers = background.queryDatabase('getDomainsNoTrackers', {})
    const google_demographics = background.queryDatabase('getGoogleInferencesTree_demographic', {})
    const google_interests = background.queryDatabase('getGoogleInferencesTree_interests', {})
    const allTitles = background.queryDatabase('getAllTitles', {})
    const allGender = background.queryDatabase('getInferencesGender', {})
    const allAds = background.queryDatabase('getAllAds', {})
    const allAdURLs = background.queryDatabase('getAdURLs', {})
    const allGoogleInferences = background.queryDatabase('getAllGoogleInferences', {})
    const adExplanation_counts = background.queryDatabase('getAdExplanationCounts', {})
    const ad_deep = background.queryDatabase('getAdDomainsInformation', {})
    const heat_map = background.queryDatabase('PageIdDataStructure', {})
    

    recent.then(n => this.setState({recent: n}))
    manyTrackers.then(n => this.setState({manyTrackers: n}))
    noTrackers.then(n => this.setState({noTrackers: n}))
    google_demographics.then(n => this.setState({google_demographics: n}))
    google_interests.then(n => this.setState({google_interests: n}))
    allTitles.then(n => this.setState({allTitles: n}))
    allGender.then(n => this.setState({allGender: n}))
    allAds.then(n => this.setState({allAds: n}))
    allAdURLs.then(n => this.setState({allAdURLs: n}))
    adExplanation_counts.then(n => this.setState({adExplanation_counts: n}))
    ad_deep.then(n => this.setState({ad_deep: n}))
    heat_map.then(n => this.setState({heat_map: n}))


    this.setState({
      graphCount: this.state.graphCount,
    })

  }

  async componentDidMount () {

    let d = this.getData()

    let activityType = 'load dashboard good actors page'
    logging.logLoad(activityType, {})
  }


  updateGraphCount (event) {
    const num = event.target.value
    console.log(num)
    this.setState({
      graphCount: num,
    })
  }


  render () {

    const { numPages, noTrackers, google_demographics, graphCount, googleInterests, numDomains, allTitles, allAds, allAdURLs, allGoogleInferences, adExplanation_counts, ad_deep, heat_map} = this.state

    return (
      <Grid>

        <GridRow>
          <GridCol>
            <Heading level='h1'><strong>Best Times to Target You (Aggregated)</strong></Heading>
            {heatMap(this.state.heat_map, this.state.graphCount)}

            <TTPanel>
              <Text>
                <p>
                  Trackers learn what time of the day you are most engaged, and what you spend most of your time doing!  
                </p>
                

        <RadioInputGroup
          name='time slice'
          value={this.state.graphCount}
          onChange={this.updateGraphCount}
          description='Time Slice to Aggregate'
          variant='toggle'
          size='small'
          checked='checked'
        >
          <RadioInput label='all' value={'all'} context='off' />
          <RadioInput label='last month' value={'last month'} context='off' />
          <RadioInput label='last week' value={'last week'} context='off' />
          <RadioInput label='today' value={'today'} context='off' />

        </RadioInputGroup>


              </Text>



            </TTPanel>

          </GridCol>
        </GridRow>

        <GridRow>
          <GridCol>
            <Heading level='h1'><strong>Google thinks...</strong></Heading>
            {googleAdsSettings(this.state.google_demographics)}
            {googleAdsSettings2(this.state.google_interests)}


            <TTPanel>
              <Text>
                <p>
                  Google observes your online habits and categorizes you according to demographics (you are) and interests (you like).
                </p>
              </Text>

              <div>
              <Button onClick={getGoogleInferences}>Import or Update Now!</Button>
              </div>

            </TTPanel>


          </GridCol>
        </GridRow>








      </Grid>



        
    )



  }
}

export default AboutYouPage


