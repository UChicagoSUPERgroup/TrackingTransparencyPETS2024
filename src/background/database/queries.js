/** @module queries */



import lf from 'lovefield'
import _ from 'lodash'
import * as moment from 'moment'

import * as groupByTime from 'group-by-time' 

import trackerData from '../../data/trackers/companyData.json'
import comfortData from '../../data/interests/interests.json'
// import keywordData from '../../data/interests/keywords_mondovo.json'
import keywordData2 from '../../data/interests/keywords_mondovo2.json'

import tldjs from 'tldjs';

import {primaryDbPromise, primarySchemaBuilder} from './setup'
import * as store from './storage';

// check ad DOMs for closeness
import { stringSimilarity } from "string-similarity-js";



let ttDb;
(async function () {
  ttDb = await primaryDbPromise
})()

const Inferences = primarySchemaBuilder.getSchema().table('Inferences')
const Trackers = primarySchemaBuilder.getSchema().table('Trackers')
const Pages = primarySchemaBuilder.getSchema().table('Pages')
const Ads = primarySchemaBuilder.getSchema().table('Ads')
const GoogleInferences = primarySchemaBuilder.getSchema().table('GoogleInference')
const IPAddresses = primarySchemaBuilder.getSchema().table('IPAddress')

const WORD_CLOUD_MAX = 50 //(((optimization, but does not result in large penalty, so keep at 50)))
let DO_OPTIMIZATIONS = false; 
// let checker = chrome.storage.local.get('richFeatures').then(ret => {DO_OPTIMIZATIONS = ret})

function makeURL (Page) {
  return Page.protocol + '//' + Page.hostname + Page.path
}

/* ================ */
/*     QUERIES      */
/* ================ */

async function getAllData () {
  let pages = ttDb.select().from(Pages).exec()
  let trackers = ttDb.select().from(Trackers).exec()
  let inferences = ttDb.select().from(Inferences).exec()
  let ads = ttDb.select().from(Ads).exec()
  let googleInferences = ttDb.select().from(GoogleInferences).exec()
  let ipaddresses = ttDb.select().from(IPAddresses).exec()
  return {
    pages: await pages,
    trackers: await trackers,
    inferences: await inferences,
    ads: await ads,
    googleInferences: await googleInferences,
    ipaddresses: await ipaddresses,
  }
}

/**
 * gets all titles of all pages visited
 *
 * @param {any} args
 * @returns {Object[]} titles of pages visited
 */
async function getAllTitles (args) {
  let query = ttDb.select().from(Pages)

  let pages = new Set()
  var i
  const pagesQuery = await query.exec()
  for (i = 0; i < pagesQuery.length; i++) {
    pages.add(pagesQuery[i]['title'])
  }
  return Array.from(pages)
}

/**
 * gets all timeStamps of all pages visited
 * TODO: toss out 123
 * TODO: remove duplicates (occurs when interests have more than pages)
 *
 * // data example
 * // time expressed in seconds 
 * // date is year, month, day
 *
 * var data = [
 * 
 * {
 * "date": "2016-01-01",
 * "total": 34445,          
 * "details": [{"name": "Project 1", "date": "2016-01-01 12:30:45","value": 9192}, {}, {}]
 * },
 * 
 * {},
 * 
 * {},
 * 
 * 
 * 
 * ]
 *
 * @param {any} args
 * @returns {Object[]} id,timeStamp of pages visited
 */
async function PageIdDataStructure (args) {


  // get each page, the page inference, and the time spent on the page 
  let query = ttDb.select(Inferences.inference, Inferences.pageId, Inferences.id, Pages.activity_events)
    .from(Pages)
    .innerJoin(Inferences, Inferences.pageId.eq(Pages.id))


  // re-format time from UNIX to date (YMD) and time (hour,minute,second)
  let time_series_data = new Array()
  const inferenceQuery = await query.exec()
  for (let i = 0; i < inferenceQuery.length; i++) {

    let overall_page_time = inferenceQuery[i]['Pages']['activity_events'][inferenceQuery[i]['Pages']['activity_events'].length-1].overall_time / 1000
    // // get sequence of time events as length of time on page
    // // start 
    // // focus (means stop)
    // // focus (means start)
    // // focus (stop)
    // // focus (start)
    // let result = [];
    // let arr = inferenceQuery[i]['Pages']['activity_events']; // activity as array for each page 
    // arr.forEach((x,y,z) => !(y % 2) ? result.push(z.slice(y, y + 2)) : '');

    // // start      // add 
    // // stop 

    // // start      // add
    // // stop 
    // ///////////////////////
    //               // totals 

    // let overall_page_time = 0
    // for (let p = 0; p < Object.keys(result).length; p++) {

    //   let single_slice = result[p]

    //   // the last event has no pair becuase exit or focus repeats (do not consider it)
    //   // this will also catch the situation where a page is currently being visited and has no history, which should be ignored
    //   if (Object.keys(single_slice).length !== 1) {

    //     let start; 
    //     let end; 

    //     if (Object.keys(single_slice[0]) == 'start') {
    //       start = single_slice[0]['start']
    //       end = single_slice[1]['value']
    //     }
    //     else {
    //       start = single_slice[0]['value']
    //       end = single_slice[1]['value']
    //     }

    //     // overall_page_time += (end-start) 
    //     overall_page_time += (end-start) / 1000
        
    //   }



    // }

    var time =  new Date(inferenceQuery[i]['Inferences']['pageId']).toLocaleTimeString("en-GB") // British English uses 24-hour time without AM/PM
    var date = new Date(inferenceQuery[i]['Inferences']['pageId']).toLocaleDateString("en-GB").split('/').reverse().join('-'); // British English uses day-month-year order
    var date_time = date + " " + time
    
    time_series_data.push({name: inferenceQuery[i]['Inferences']['inference'], date: date_time, value: overall_page_time})


  }

  // 'details' group inner time around date (YMD) as outer group {date}{date}{date}
  var grouped_time = time_series_data.reduce(function (r, a) {
      r[a.date.split(" ")[0]] = r[a.date.split(" ")[0]] || [];
      r[a.date.split(" ")[0]].push(a);
      return r;
  }, Object.create(null));

  // 'summary' group as summary of days with breakdown listed in details
  let ret = new Array()
  for (var key of Object.keys(grouped_time)) {
    let totals = 0
    for (var key2 of Object.keys(grouped_time[key])) {
      totals += grouped_time[key][key2].value
    }
    ret.push({date: key, total: totals, details: grouped_time[key] })
  }

  return (ret)
}


function groupBy(objectArray, property) {
  return objectArray.reduce(function (acc, obj) {
    var key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

function merge_on_time(time_series_data) {
  // merge on time
  let ret = []
  var grouped = groupBy(time_series_data, 'time_log');
  for (var key of Object.keys(grouped)) {
    let to_ret = {}
    to_ret.date = new Date(key) 
    
    let all_time = 0
    let interest_overview = {}
    let details = []
    let total_webpage_count = 0
    for (var obj of Object.keys(grouped[key])) {
      let entry = grouped[key][obj]
      all_time += entry['count']
      total_webpage_count += 1
      let to_save = {}
      to_save.inference = entry['inference']
      to_save.title = entry['title']
      to_save.real_time = entry['real_time']
      to_save.count = entry['count']
      details.push(to_save)

      if (entry['inference'] in interest_overview) {
        interest_overview[entry['inference']] += entry['count']
      } else {
        interest_overview[entry['inference']] = entry['count']
      }

    }

    to_ret.count = all_time
    to_ret.interest_overview = interest_overview
    to_ret.total_webpage_count = total_webpage_count
    to_ret.details = details

    ret.push(to_ret)
  }
  return ret
}

/**
 * gets all timeStamps of all pages visited for revised heatMap
 * TODO: return aggregates according to "all", "last month", "last week", "today"
 *
 * // data example
 * // count is seconds 
 * // inference is used in tooltip
 *
 * var data = [
 * 
 * {date: "8.31.2021 01:51", count: 25, inference: {domain: "smallnetbuilder", time_tracked: 139, inference: "news"} }, 
 * 
 * 
 * ]
 *
 * @param {any} args
 * @returns {Object[]} id,timeStamp of pages visited
 */
async function PageIdDataStructure_revisedHeatmap (args) {

  // get each page, the page inference, and the time spent on the page 
  let query = ttDb.select(Inferences.inference, Inferences.pageId, Inferences.id, Pages.activity_events, Pages.title, Pages.domain)
    .from(Pages)
    .innerJoin(Inferences, Inferences.pageId.eq(Pages.id))


  // re-format time from UNIX to date (YMD) and time (hour,minute,second)
  let time_series_data = new Array()

  let time_series_data_today = new Array()
  let time_series_data_last_week = new Array()
  let time_series_data_last_month = new Array()
  let time_series_data_all = new Array()


  const inferenceQuery = await query.exec()
  for (let i = 0; i < inferenceQuery.length; i++) {

    // get sequence of time events as length of time on page
    // start 
    // focus (means stop)
    // focus (means start)
    // focus (stop)
    // focus (start)
    let overall_page_time = inferenceQuery[i]['Pages']['activity_events'][inferenceQuery[i]['Pages']['activity_events'].length-1].overall_time / 1000
    // let result = [];
    // let arr = inferenceQuery[i]['Pages']['activity_events']; // activity as array for each page 
    // arr.forEach((x,y,z) => !(y % 2) ? result.push(z.slice(y, y + 2)) : '');

    // // start      // add 
    // // stop 

    // // start      // add
    // // stop 
    // ///////////////////////
    //               // totals 

    // let overall_page_time = 0
    // for (let p = 0; p < Object.keys(result).length; p++) {

    //   let single_slice = result[p]

    //   // the last event has no pair becuase exit or focus repeats (do not consider it)
    //   // this will also catch the situation where a page is currently being visited and has no history, which should be ignored
    //   if (Object.keys(single_slice).length !== 1) {

    //     let start; 
    //     let end; 

    //     if (Object.keys(single_slice[0]) == 'start') {
    //       start = single_slice[0]['start']
    //       end = single_slice[1]['value']
    //     }
    //     else {
    //       start = single_slice[0]['value']
    //       end = single_slice[1]['value']
    //     }

    //     // overall_page_time += (end-start) 
    //     overall_page_time += (end-start) / 1000
        
    //   }



    // }

    var time =  new Date(inferenceQuery[i]['Inferences']['pageId']).toLocaleTimeString("en-GB") // British English uses 24-hour time without AM/PM
    var date = new Date(inferenceQuery[i]['Inferences']['pageId']).toLocaleDateString("en-GB").split('/').reverse().join('-'); // British English uses day-month-year order
    var date_time = date + " " + time
    var time_log = String(time).split(":")[0] + ":" + String(time).split(":")[1]
    
    time_series_data.push({inference: inferenceQuery[i]['Inferences']['inference'], title: inferenceQuery[i]['Pages']['title'], date: date, time_log: date + " " + time_log, count: overall_page_time})


    // get sliced data here 
    // todo this doesn't consider time, just days
    var date_today = new Date();
    let date_today_formatted = moment(date_today).format("YYYY-MM-DD");
    let one_month_ago = moment(date_today_formatted).subtract(1, 'months').format('YYYY-MM-DD')
    let one_week_ago = moment(date_today_formatted).subtract(1, 'weeks').format('YYYY-MM-DD')
    let one_day_ago = moment(date_today_formatted).subtract(1, 'days').format('YYYY-MM-DD')
    let within_month = moment(date).isAfter(one_month_ago);
    let within_week = moment(date).isAfter(one_week_ago);
    let within_day = moment(date).isAfter(one_day_ago);


    time_series_data_all.push({inference: inferenceQuery[i]['Inferences']['inference'], title: inferenceQuery[i]['Pages']['title'], date: date, time_log: date + " " + time_log, count: overall_page_time})

    if (within_month) {
      time_series_data_last_month.push({inference: inferenceQuery[i]['Inferences']['inference'], title: inferenceQuery[i]['Pages']['title'], date: date, time_log: date + " " + time_log, count: overall_page_time})
    }
    if (within_week) {
      time_series_data_last_week.push({inference: inferenceQuery[i]['Inferences']['inference'], title: inferenceQuery[i]['Pages']['title'], date: date, time_log: date + " " + time_log, count: overall_page_time})
    }
    if (within_day) {
      time_series_data_today.push({inference: inferenceQuery[i]['Inferences']['inference'], title: inferenceQuery[i]['Pages']['title'], date: date, time_log: date + " " + time_log, count: overall_page_time})
    }


  }




  let all = merge_on_time(time_series_data_all)
  let month = merge_on_time(time_series_data_last_month)
  let week = merge_on_time(time_series_data_last_week)
  let day = merge_on_time(time_series_data_today)

  let sliced_ret = {"all": all, "month": month, "week": week, "day": day}

  // // merge on time
  // let ret = []
  // var grouped = groupBy(time_series_data, 'time_log');
  // for (var key of Object.keys(grouped)) {
  //   let to_ret = {}
  //   to_ret.date = new Date(key) 
    
  //   let all_time = 0
  //   let interest_overview = {}
  //   let details = []
  //   let total_webpage_count = 0
  //   for (var obj of Object.keys(grouped[key])) {
  //     let entry = grouped[key][obj]
  //     all_time += entry['count']
  //     total_webpage_count += 1
  //     let to_save = {}
  //     to_save.inference = entry['inference']
  //     to_save.title = entry['title']
  //     to_save.real_time = entry['real_time']
  //     to_save.count = entry['count']
  //     details.push(to_save)

  //     if (entry['inference'] in interest_overview) {
  //       interest_overview[entry['inference']] += entry['count']
  //     } else {
  //       interest_overview[entry['inference']] = entry['count']
  //     }

  //   }

  //   to_ret.count = all_time
  //   to_ret.interest_overview = interest_overview
  //   to_ret.total_webpage_count = total_webpage_count
  //   to_ret.details = details

  //   ret.push(to_ret)
    
  // }





  // // 'details' group inner time around date (YMD) as outer group {date}{date}{date}
  // var grouped_time = time_series_data.reduce(function (r, a) {
  //     r[a.date.split(" ")[0]] = r[a.date.split(" ")[0]] || [];
  //     r[a.date.split(" ")[0]].push(a);
  //     return r;
  // }, Object.create(null));

  // // 'summary' group as summary of days with breakdown listed in details
  // let ret = new Array()
  // for (var key of Object.keys(grouped_time)) {
  //   let totals = 0
  //   for (var key2 of Object.keys(grouped_time[key])) {
  //     totals += grouped_time[key][key2].value
  //   }
  //   ret.push({date: key, total: totals, details: grouped_time[key] })
  // }

  return (sliced_ret)
}



/**
 * gets all timeStamps of all pages visited and puts them in [[<day of week> <hour> <value> <tooltip>], []] 
 *
 * @param {any} args
 * @returns {Object[]} list of lists
 */
async function PageIdDataStructure_revisedHeatmap_version2 (args) {

  // a page without inferences will be ignored here, is this expected behavior? 
  // get each page, the page inference, and the time spent on the page 
  let query = ttDb.select(Inferences.inference, Inferences.pageId, Inferences.id, Pages.activity_events, Pages.title, Pages.domain)
    .from(Pages)
    .innerJoin(Inferences, Inferences.pageId.eq(Pages.id))
    .where(Inferences.inference.neq('none')) // exclude pages where our content classification did not work (not very helpful unless debugging)


  // re-format time from UNIX to date (YMD) and time (hour,minute,second)
  let time_series_data = new Array()
  let time_series_data_today = new Array()
  let time_series_data_last_week = new Array()
  let time_series_data_last_month = new Array()
  let time_series_data_all = new Array()


  const inferenceQuery = await query.exec()
  for (let i = 0; i < inferenceQuery.length; i++) {

    // get sequence of time events as length of time on page
    // start 
    // focus (means stop)
    // focus (means start)
    // focus (stop)
    // focus (start)
    let overall_page_time = inferenceQuery[i]['Pages']['activity_events'][inferenceQuery[i]['Pages']['activity_events'].length-1].overall_time 
    // let result = [];
    // let arr = inferenceQuery[i]['Pages']['activity_events']; // activity as array for each page 
    // arr.forEach((x,y,z) => !(y % 2) ? result.push(z.slice(y, y + 2)) : '');

    // // start      // add 
    // // stop 

    // // start      // add
    // // stop 
    // ///////////////////////
    //               // totals 

    // let overall_page_time = 0
    // for (let p = 0; p < Object.keys(result).length; p++) {

    //   let single_slice = result[p]

    //   // the last event has no pair becuase exit or focus repeats (do not consider it)
    //   // this will also catch the situation where a page is currently being visited and has no history, which should be ignored
    //   if (Object.keys(single_slice).length !== 1) {

    //     let start; 
    //     let end; 

    //     if (Object.keys(single_slice[0]) == 'start') {
    //       start = single_slice[0]['start']
    //       end = single_slice[1]['value']
    //     }
    //     else {
    //       start = single_slice[0]['value']
    //       end = single_slice[1]['value']
    //     }

    //     // overall_page_time += (end-start) 
    //     overall_page_time += (end-start)
        
    //   }

    // }

    if (overall_page_time != 0) {
      var time =  new Date(inferenceQuery[i]['Inferences']['pageId']).toLocaleTimeString("en-GB") // British English uses 24-hour time without AM/PM
      var date = new Date(inferenceQuery[i]['Inferences']['pageId']).toLocaleDateString("en-GB").split('/').reverse().join('-'); // British English uses day-month-year order
      var date_time = date + " " + time
      var time_log = String(time).split(":")[0] + ":" + String(time).split(":")[1]
      
      time_series_data.push({inference: inferenceQuery[i]['Inferences']['inference'], title: inferenceQuery[i]['Pages']['title'], date: date, time_log: date + " " + time_log, count: overall_page_time})



      // get sliced data here 
      // todo this doesn't consider time, just days
      var date_today = new Date();
      let date_today_formatted = moment(date_today).format("YYYY-MM-DD");
      let one_month_ago = moment(date_today_formatted).subtract(1, 'months').format('YYYY-MM-DD')
      let one_week_ago = moment(date_today_formatted).subtract(1, 'weeks').format('YYYY-MM-DD')
      let one_day_ago = moment(date_today_formatted).subtract(1, 'days').format('YYYY-MM-DD')
      let within_month = moment(date).isAfter(one_month_ago);
      let within_week = moment(date).isAfter(one_week_ago);
      let within_day = moment(date).isAfter(one_day_ago);


      time_series_data_all.push({inference: inferenceQuery[i]['Inferences']['inference'], title: inferenceQuery[i]['Pages']['title'], date: date, time_log: date + " " + time_log, count: overall_page_time})

      if (within_month) {
        time_series_data_last_month.push({inference: inferenceQuery[i]['Inferences']['inference'], title: inferenceQuery[i]['Pages']['title'], date: date, time_log: date + " " + time_log, count: overall_page_time})
      }
      if (within_week) {
        time_series_data_last_week.push({inference: inferenceQuery[i]['Inferences']['inference'], title: inferenceQuery[i]['Pages']['title'], date: date, time_log: date + " " + time_log, count: overall_page_time})
      }
      if (within_day) {
        time_series_data_today.push({inference: inferenceQuery[i]['Inferences']['inference'], title: inferenceQuery[i]['Pages']['title'], date: date, time_log: date + " " + time_log, count: overall_page_time})
      }

    }




  }


  let all = merge_on_time(time_series_data_all)
  let month = merge_on_time(time_series_data_last_month)
  let week = merge_on_time(time_series_data_last_week)
  let day = merge_on_time(time_series_data_today)

  let sliced_ret = {"all": all, "month": month, "week": week, "day": day}

  let sliced_ret2 = {}

  // let iso_to_display = {6: 0, 5: 1, 4: 2, 3: 1, 2: 4, 1: 5, 6: 7}
  // 0 saturday 
  // 1 friday 
  // 2 thursday
  // 3 wednesday
  // 4 tuesday
  // 5 monday
  // 6 sunday 
  // isoWeekday: 1-7 where 1 is Monday and 7 is Sunday
  let iso_to_display = {"Monday": 5, "Tuesday": 4, "Wednesday": 3, "Thursday": 2, "Friday": 1, "Saturday": 0, "Sunday": 6}


  for (const [key_outer, value_outer] of Object.entries(sliced_ret)) {

    let temp_ret = []
    let temp_set = new Object()
    for (let entry of value_outer) {
      let bin_hour = parseInt(moment(entry.date).format("H"))
      var bin_day_number = moment(entry.date, "YYYY-MM-DD HH:mm:ss")
      // let bin_day = moment(entry.date).isoWeekday()
      let bin_day_string = bin_day_number.format('dddd');
      let bin_day = iso_to_display[bin_day_string]// the converted version for displaying correctly on our chart

      let pair = String(bin_day) + '-' + String(bin_hour)
      if (!temp_set.hasOwnProperty(pair)) {
        let to_add = new Object()
        to_add['count'] = entry.count
        to_add['interests'] = entry.interest_overview
        to_add['webpage_count'] = entry.total_webpage_count
        temp_set[pair] = to_add
      } 
      else {
        let current = temp_set[pair]
        let newer = new Object()
        newer['count'] = entry.count + current.count 
        newer['webpage_count'] = entry.total_webpage_count + current.webpage_count
        for (const [key, value] of Object.entries(entry.interest_overview)) {
          if (current['interests'][key] !== undefined) {
            current['interests'][key] += value
          } else {
            current['interests'][key] = value
          }
          
        }
        newer['interests'] = current['interests']
        temp_set[pair] = newer
      }

      let this_entry = [bin_day, bin_hour, entry.count, {"grouped_interests": entry.interest_overview, "webpage_count": entry.total_webpage_count}]
      temp_ret.push(this_entry)
    }

    let to_ret = []
    for (const [key, value] of Object.entries(temp_set)) {
      let day = parseInt(key.split('-')[0])
      let hour = parseInt(key.split("-")[1])
      let count = value.count
      let tooltip = new Object()
      tooltip.webpage_count = value.webpage_count 
      tooltip.grouped_interests = Object.keys(value.interests).map((key) => [key, value.interests[key]])
      tooltip.grouped_interests.sort((a, b) => (b[1] - a[1])) 
      // strip out or make more identifiable "none" type
      for (let entry of tooltip.grouped_interests){
        if (entry[0] == 'none') {
        entry[0] = "--no interest found on page--"
        }
      }
      to_ret.push([day, hour, count, tooltip])
    }

    sliced_ret2[key_outer] = to_ret

  }

  return (sliced_ret2)
}



/* ================ */
/*    DOMAINS       */
/* ================ */

/** get domains by time window
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.startTime] - time start window
 * @param  {number} [args.endTime] - time end window
 * @param  {number} [args.count] - number of entries to return
 */
async function getDomains (args) {
  let query = ttDb.select(lf.fn.distinct(Pages.domain))
    .from(Pages)
  if (args.startTime && args.endTime) {
    query = query.where(
      lf.op.and(
        Pages.id.gte(args.startTime),
        Pages.id.lte(args.endTime)
      )
    )
  } else if (args.startTime) {
    query = query.where(Pages.id.gte(args.startTime))
  } else if (args.endTime) {
    query = query.where(Pages.id.lte(args.endTime))
  }
  query = query.orderBy(Pages.id, lf.Order.DESC)
  query = args.count ? query.limit(args.count) : query
  const res = await query.exec()
  return res.map(x => x['DISTINCT(domain)'])
}

/**
 * Domain visits by tracker (i.e. TRACKERNAME knows you have been to the following sites)
 * @param {Object} args - args object
 * @param {string} args.tracker - tracker domain
 * @returns {string[]} array of domains
 */
async function getDomainsByInference (args) {
  let query = ttDb.select()
    .from(Pages, Inferences)
    .where(lf.op.and(
      Inferences.pageId.eq(Pages.id),
      Inferences.inference.eq(args.inference)
    ))
  let qRes = await query.exec()

  let merged = _.reduce(qRes, function (result, value) {
    const domain = value.Pages.domain
    if (result[domain]) {
      result[domain]++
    } else {
      result[domain] = 1
    }
    return result
  }, {})

  let res = Object.keys(merged).map(key => ({name: key, count: merged[key]}))
  res.sort((a, b) => (b.count - a.count))
  return res
}

/**
 * Domain visits by tracker (i.e. TRACKERNAME knows you have been to the following sites)
 * @param {Object} args - args object
 * @param {string} args.tracker - tracker domain
 * @returns {string[]} array of domains
 */
async function getDomainsByTracker (args) {
  let query = ttDb.select()
    .from(Pages, Trackers)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Trackers.tracker.eq(args.tracker)
    ))
  let qRes = await query.exec()
  let merged = _.reduce(qRes, function (result, value) {
    const domain = value.Pages.domain
    if (result[domain]) {
      result[domain]++
    } else {
      result[domain] = 1
    }
    return result
  }, {})
  let mergedRes = []
  mergedRes = Object.keys(merged).map(key => ({name: key, count: merged[key]}))
  mergedRes.sort((a, b) => (b.count - a.count))
  return mergedRes
}

/**
 * get domains by tracker count
 * (e.g. use case: find domain that has most trackers)
 *
 * @param {any} args
 * @returns {Object[]} trackers, with count of inferences
 */
async function getDomainsByTrackerCount (args) {
  let query = ttDb.select(Pages.domain, lf.fn.count(lf.fn.distinct(Trackers.tracker)))
    .from(Pages, Trackers)
    .where(Trackers.pageId.eq(Pages.id))
    .groupBy(Pages.domain)
    .orderBy(lf.fn.count(lf.fn.distinct(Trackers.tracker)), lf.Order.DESC)
  query = args.count ? query.limit(args.count) : query
  return query.exec()
}

/** gets all domains without any trackers
 *
 * @param  {Object} args - no args accepted currently
 * @returns [domain] query result is an array of strings
 */
async function getDomainsNoTrackers (args) {
  let query = ttDb.select(Pages.domain, lf.fn.count(Trackers.tracker))
    .from(Pages)
    .leftOuterJoin(Trackers, Pages.id.eq(Trackers.pageId))
    .groupBy(Pages.domain)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.ASC)

  let domains = []
  var i
  const domainsQuery = await query.exec()
  for (i = 0; i < domainsQuery.length; i++) {
    ((domainsQuery[i]['Trackers']['COUNT(tracker)'] === 0)
      ? domains.push(domainsQuery[i]['Pages']['domain'])
      : i = domainsQuery.length)
  }
  return domains
}

/* ================ */
/*   INFERENCES     */
/* ================ */

/** gets all inferences
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 * @param  {number} [args.afterDate] - only include page visits after this date,
 *                                     given as an integer for number of milliseconds since 1/1/1970
 * @returns {Object} query result
 */

async function getInferences (args) {
  let query = ttDb.select(Inferences.inference, lf.fn.count(Inferences.inference))
    .from(Inferences)
    .where(Inferences.inference.neq('none'))

  query = args.afterDate ? query.where(Inferences.pageId.gte(args.afterDate)) : query

  query = query
    .groupBy(Inferences.inference)
    .orderBy(lf.fn.count(Inferences.inference), lf.Order.DESC)


  query = args.count ? query.limit(args.count) : query
  let qRes = await query.exec()
  // let count = 0
  // for (let obj of qRes) {
  //   if (obj.inference == 'none') {
  //     qRes = qRes.slice(count);
  //   }
  //   count += 1
  // }

  qRes = qRes.filter(function(el){
    return el.inference != "none";
  });

  return query.exec() // original
  // return qRes
}

/**
 * Inferences by domain (i.e. INFERENCES have been made on DOMAIN)
 * @param {Object} args - args object
 * @param {string} args.domain - domain
 * @returns {Object} infernce and count
 */
async function getInferencesByDomain (args) {
  let query = ttDb.select(Inferences.inference)
    .from(Pages, Inferences)
    .where(lf.op.and(
      Inferences.pageId.eq(Pages.id),
      Pages.domain.eq(args.domain)
      // .groupBy(Inferences.inference)
      // .orderBy(lf.fn.count(Inferences.inference), lf.Order.DESC);
    ))
  // return await query.exec();

  let qRes = await query.exec()

  let merged = _.reduce(qRes, function (result, value) {
    const inference = value.Inferences.inference
    if (result[inference]) {
      result[inference]++
    } else {
      result[inference] = 1
    }
    return result
  }, {})

  let res = Object.keys(merged).map(key => ({name: key, count: merged[key]}))
  res.sort((a, b) => (b.count - a.count))
  return res
}

/** get inferences made by a specifc tracker
 *
 * @param  {Object} args - arguments object
 * @param  {string} args.tracker - tracker
 * @param  {number} [args.count] - number of entries to return
 * @returns {Object} query result
 */
async function getInferencesByTracker (args) {
  if (!args.tracker) {
    throw new Error('Insufficient args provided for query (getInferencesByTracker)')
  }
  let query = ttDb.select(Inferences.inference, lf.fn.count(Inferences.inference))
    .from(Trackers, Inferences)
    .where(lf.op.and(
      Trackers.pageId.eq(Inferences.pageId),
      Trackers.tracker.eq(args.tracker)
    ))
    .groupBy(Inferences.inference)
    .orderBy(lf.fn.count(Inferences.inference), lf.Order.DESC)
  query = args.count ? query.limit(args.count) : query
  const res = await query.exec()
  return res.map(x => ({
    name: x.Inferences['inference'],
    count: x.Inferences['COUNT(inference)']
  }))
}

/** get inferences by time window-
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 */
async function getInferencesByTime (args) {
  let query = ttDb.select(lf.fn.distinct(Inferences.inference))
    .from(Inferences)
    .orderBy(Inferences.pageId, lf.Order.DESC)
  query = args.count ? query.limit(args.count) : query
  return query.exec()
}

async function getInferenceCount (args) {
  let query = await ttDb.select(lf.fn.count(Inferences.inference))
    .from(Inferences)
    .where(Inferences.inference.eq(args.inference))
    .groupBy(Inferences.inference)
    .exec()
  let res
  if (typeof query !== 'undefined' && query != null && query.length > 0) {
    res = (query[0])['COUNT(inference)']
  } else {
    res = '0'
  }
  return res
}

/** gets all inferences along with their page Id (which is basically timestamp) and domain
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 * @param  {number} [args.afterDate]
 */

async function getInferencesDomainsToSend (args) {
  // let query = ttDb.select(Inferences.inference, lf.fn.count(Inferences.inference))
  //  .from(Inferences);
  let query = ttDb.select(Inferences.inference, Inferences.pageId, Inferences.id, Pages.domain, Trackers.tracker)
    .from(Inferences)
    .innerJoin(Pages, Pages.id.eq(Inferences.pageId))
    .innerJoin(Trackers, Pages.id.eq(Trackers.pageId))
  /*
let query = ttDb.select(Inferences.inference, Inferences.pageId, Inferences.id, Pages.domain)
  .from(Inferences).
  innerJoin(Pages, Pages.id.eq(Inferences.pageId));
*/
  query = args.afterDate ? query.where(Inferences.pageId.gte(args.afterDate)) : query

  // query = query
  //  .groupBy(Inferences.inference)
  //  .orderBy(lf.fn.count(Inferences.inference), lf.Order.DESC);

  query = args.count ? query.limit(args.count) : query
  return query.exec()
}


/** globs all information around pageID for smaller datastructure 
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 * @param  {number} [args.afterDate]
 */

async function getInferencesDomainsToSend_v2 (args) {

  let query = ttDb.select(Pages.id, Pages.title, Pages.domain, Pages.hostname, Pages.path, Pages.protocol, Inferences.inference, Inferences.inferencePath)
    .from(Pages, Inferences)
    .where(lf.op.and(
      Inferences.pageId.eq(Pages.id),
    ))
  let objects = await query.exec()
  let returnable = {}
  for (let obj of objects) {
    let this_pageId = obj['Pages'].id
    if (!(this_pageId in returnable)){
      let temp = {} 
      temp['domain'] = obj['Pages'].domain
      temp['title'] = obj['Pages'].title
      temp['path'] = obj['Pages'].path
      temp['hostname'] = obj['Pages'].hostname 
      temp['activity_events'] = obj['Pages'].activity_events 
      temp['inference'] = obj['Inferences'].inference
      temp['inferencePath'] = obj['Inferences'].inferencePath
      let args = {'pageId': this_pageId}
      let trackers = await getTrackersByPageId(args)
      temp['trackers'] = trackers
      let ads = await getAdsByPageId(args)
      temp['ads'] = ads
      returnable[this_pageId] = temp
    }

  }
  let googleInferences = await getGoogleInferences_forStorage()
  returnable['googleInferences_slice_current'] = googleInferences
  return returnable 
}

/** globs all information around pageID for smaller datastructure 
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 * @param  {number} [args.afterDate]
 */

async function getInferencesDomainsToSend_v3 (args) {
  var waiter = await update_search_habits()
  // console.log("MOVING ON HERE")
  let item = await getAllData()

  let to_return = {}
  Object.entries(item).forEach(([key, value]) => {
    // console.log(key, value);
    if (key == 'pages') {
      for (let page of item[key]) {
        // console.log(page)
        to_return[page.id] = page
      }
    }
    if (key == 'trackers') {
      let tracker_list = {}
      for (let tracker of item[key]) {
        // console.log(tracker)
        if (tracker.pageId in tracker_list) {
          let curr = tracker_list[tracker.pageId]
          // console.log(curr)
          curr.push(tracker.tracker)
        } else {
          tracker_list[tracker.pageId] = [tracker.tracker]
        }
      }
      Object.entries(tracker_list).forEach(([tracker_pageID, tracker_names]) => {
        if (tracker_pageID in to_return == false) {
          to_return[tracker_pageID] = {'trackers':tracker_names}
        } else {
          let curr = to_return[tracker_pageID]
          curr['trackers'] = tracker_names
          to_return[tracker_pageID] = curr
        }
      })
    }

    if (key == 'inferences') {
      let inference_list = {}
      for (let inference of item[key]) {
        // console.log(inference)
        if (inference.pageId in inference_list) {
          let curr = inference_list[inference.pageId]
          // console.log(curr)
          curr.push(inference)
        } else {
          // don't keep inference if it does not have an associated pageID
          inference_list[inference.pageId] = [inference]
        }
      }
      Object.entries(inference_list).forEach(([inference_pageID, inference_info]) => {
        if (inference_pageID in to_return == false) {
          to_return[inference_pageID] = {'inferences':inference_info}
        } else {
          let curr = to_return[inference_pageID]
          curr['inferences'] = inference_info
          to_return[inference_pageID] = curr
        }
      })
    }

    if (key == 'ads') {
      let ads_list = {}
      for (let ad of item[key]) {
        // console.log(ad)
        if (ad.pageId in ads_list) {
          let curr = ads_list[ad.pageId]
          // console.log(curr)
          curr.push(ad)
        } else {
          ads_list[ad.pageId] = [ad]
        }
      }
      Object.entries(ads_list).forEach(([ad_pageID, ad_info]) => {
        if (ad_pageID in to_return == false) {
          to_return[ad_pageID] = {'ads':ad_info}
        } else {
          let curr = to_return[ad_pageID]
          curr['ads'] = ad_info
          to_return[ad_pageID] = curr
        }
      })
    }

  });

  // clear out empty, non-page-assocaited items
  Object.entries(to_return).forEach(([key, value]) => { 
    if (value.id == undefined) {
      delete to_return[key];
    }
  });
  
  let googleInferences = await getGoogleInferences_forStorage()
  to_return['googleInferences_slice_current'] = googleInferences

  // optimization edit to add search habits to page table made this not necessary 
  // // we lose titles, so this visual would be lost 
  // let search_habits = await getTopicsOfInterest()
  // to_return['search_habits'] = search_habits


  return to_return
}



/** gets all gender inferences from all pages
 *
 * @param  {Object} args - arguments object
 * @returns {Object} all gender inference information
 */
async function getInferencesGender (args) {
  let query = await ttDb.select(Inferences.gender, Inferences.genderLexical)
    .from(Inferences)

  const genderQuery = query.exec()
  
  return (genderQuery)

}

/** gets most sensitive interests
 *
 * @param  {Object} args - arguments object
 * @returns {Object} list of sensitive interests based on comfort 
 */
async function getInferencesMostSensitive (args) {

  // helper https://gist.github.com/James1x0/8443042
  function getGreetingTime (m) {
    var g = null; //return g
    
    if(!m || !m.isValid()) { return; } //if we can't find a valid or filled moment, we return.
    
    var split_afternoon = 12 //24hr time to split the afternoon
    var split_evening = 17 //24hr time to split the evening
    var currentHour = parseFloat(m.format("HH"));

    if(currentHour >= split_afternoon && currentHour <= split_evening) {
      g = "afternoon";
    } else if(currentHour >= split_evening) {
      g = "evening";
    } else {
      g = "morning";
    }
    
    return g;
  }

  let query = ttDb.select(Pages.id, Pages.title, Pages.domain, Pages.hostname, Pages.path, Pages.protocol, Inferences.inference)
    .from(Pages, Inferences, Trackers)
    .where(lf.op.and(
      Inferences.pageId.eq(Pages.id),
    ))
  let objects = await query.exec()

  let sensitive_interests = []
  let seen_it = []
  for (let obj of objects) {
    let specific_interest = obj['Inferences'].inference
    if (comfortData[specific_interest]) {
      // only select likely uncomfortable interests
      if (comfortData[specific_interest].comfort < -1) {

        if (seen_it.includes(obj['Pages'].title) == false) {
          seen_it.push(obj['Pages'].title)

          let temp = {}
          let str = ''
          let string_size = (comfortData[specific_interest].path.length) -1
          let counter = 0
          for (let item of comfortData[specific_interest].path) {
            if (counter !== string_size) {
              let to_log = String(item) + " ==> "
              str += to_log
            } else {
              let to_log = String(item) 
              str += to_log
            }
            counter += 1
            
          }
          temp['id'] = obj['Pages'].id
          temp['path'] = str
          temp['score'] = comfortData[specific_interest].comfort
          temp['domain'] = obj['Pages'].domain
          temp['title'] = obj['Pages'].title
          let args = {'title': obj['Pages'].title}
          let count = await getNumberOfPages_perTitle(args)
          temp['webpage_visits'] = count
          if (count >= 2) {
            temp['webpage_visits_freq'] = "occasionally"
          } else if (count >= 3) {
            temp['webpage_visits_freq'] = "often"
          }
          let times = await getTimesOfPages_perTitle(args)
          let most_often = new Array()
          for (let time of times) {
            let that_time = getGreetingTime(moment(time.id))
            most_often.push(that_time)
          }
          let ret = _.countBy(most_often)
          let ret_highest = Object.keys(ret).reduce((a, b) => obj[a] > obj[b] ? a : b);
          temp['time_of_day'] = ret
          temp['time_of_day_highest'] = ret_highest

          let args2 = {'pageId': obj['Pages'].id}
          let tracker_info = await getNumber_andNames_OfTrackers_perPage(args2)
          let unique_trackers = new Array()
          for (let track of tracker_info) {
            if (unique_trackers.includes(track['tracker']) == false) {
              unique_trackers.push(track['tracker'])
            }
          }
          unique_trackers.unshift("------------")
          unique_trackers.unshift("Total Count: " + (unique_trackers.length - 1))
          temp['tracker_info'] = unique_trackers

          sensitive_interests.push(temp)

        }
      } 
    }
  }

  // title, interest, how often visits, general time of visit, 

  return Array.from(sensitive_interests)
}


/** gets most sensitive interests out of all interests
 *
 * @param  {Object} args - arguments object
 * @returns {Object} list of sensitive interests based on comfort 
 */
async function getInferencesMostSensitive_version2 (args) {

  // get each page, the page inference, and the time spent on the page 
  let query = ttDb.select(Inferences.inference, Inferences.pageId, Inferences.id, Pages.activity_events, Pages.title, Pages.domain)
    .from(Pages)
    .innerJoin(Inferences, Inferences.pageId.eq(Pages.id))


  // re-format time from UNIX to date (YMD) and time (hour,minute,second)
  let time_series_data = new Array()
  let time_series_data_all = new Array()


  const inferenceQuery = await query.exec()
  let seen_it = []
  let total_time = 0
  let seen_it_same_inference = new Object()
  for (let i = 0; i < inferenceQuery.length; i++) {

    // get sequence of time events as length of time on page
    // start 
    // focus (means stop)
    // focus (means start)
    // focus (stop)
    // focus (start)
    let overall_page_time = inferenceQuery[i]['Pages']['activity_events'][inferenceQuery[i]['Pages']['activity_events'].length-1].overall_time 
    // let result = [];
    // let arr = inferenceQuery[i]['Pages']['activity_events']; // activity as array for each page 
    // arr.forEach((x,y,z) => !(y % 2) ? result.push(z.slice(y, y + 2)) : '');

    // // start      // add 
    // // stop 

    // // start      // add
    // // stop 
    // ///////////////////////
    //               // totals 

    // let overall_page_time = 0
    // for (let p = 0; p < Object.keys(result).length; p++) {

    //   let single_slice = result[p]

    //   // the last event has no pair becuase exit or focus repeats (do not consider it)
    //   // this will also catch the situation where a page is currently being visited and has no history, which should be ignored
    //   if (Object.keys(single_slice).length !== 1) {

    //     let start; 
    //     let end; 

    //     if (Object.keys(single_slice[0]) == 'start') {
    //       start = single_slice[0]['start']
    //       end = single_slice[1]['value']
    //     }
    //     else {
    //       start = single_slice[0]['value']
    //       end = single_slice[1]['value']
    //     }

    //     // count is milliseconds
    //     overall_page_time += (end-start)
        
    //   }



    // }
    // duplicates exist, ne need to include them
    if (!(inferenceQuery[i]['Inferences']['pageId'] in seen_it_same_inference)) {
      
      // get full path and comfort if exists
      let specific_interest = inferenceQuery[i]['Inferences']['inference']
      let str;
      let comfort;
      try {
        comfort = comfortData[specific_interest].comfort
        let temp = {}
        str = ''
        let string_size = (comfortData[specific_interest].path.length) -1
        let counter = 0
        for (let item of comfortData[specific_interest].path) {
          if (counter !== string_size) {
            let to_log = String(item) + " ⟶ "
            str += to_log
          } else {
            let to_log = String(item) 
            str += to_log
          }
          counter += 1
        }
      } catch (e) {
        if (specific_interest.includes("Sensitive Subjects") || specific_interest.includes("Adult")) {
          comfort = -3
        }
        else {
          comfort = 0
        }
        str = specific_interest
      }

      time_series_data_all.push({inference: str, comfort: comfort, domain: inferenceQuery[i]['Pages']['domain'], pageId: inferenceQuery[i]['Inferences']['pageId'], title: inferenceQuery[i]['Pages']['title'], count: overall_page_time})
      total_time += overall_page_time
      seen_it_same_inference[inferenceQuery[i]['Inferences']['pageId']] = inferenceQuery[i]['Inferences']['inference']

    }
    

  }


  // // group under inferences (to show domain on x axis and time spent on y axis)
  const groups = time_series_data_all.reduce((groups, item) => {
    if (item.comfort >= -1) {
      const group = (groups["non-sensitive"] || []);
      item["percentage"] = (item.count / total_time) * 100
      group.push(item);
      groups["non-sensitive"] = group;
    } else {
      const group = (groups[item.inference] || []);
      item["percentage"] = (item.count / total_time) * 100
      group.push(item);
      groups[item.inference] = group;
    }

    return groups;
  }, {});

  // // add up total time (get percentages for outer pie) 
  // // 

  let outer_most_band = []
  let middle_layer_all_nonsensitive = []
  let middle_layer_for_nonsensitive = []
  let last_layer_for_nonsensitive = []
  let last_layer_for_sensitive = []
  let last_layer_combined = []
  for (var type in groups) {
    if (type == "non-sensitive") {
      // non-sensitive categories, outer band is followed by inference pie chart, then time columns
      let total_percentage = 0
      for (let obj of groups[type]) {
        total_percentage += obj.percentage

        middle_layer_all_nonsensitive.push(obj)

        // let temp = new Object()
        // temp["name"] = type 
        // temp['y'] = obj.percentage
        // temp['drilldown'] = obj.inference 
        // temp['comfort'] = obj.comfort 
        // temp['domain'] = obj.domain 
        // temp['pageId'] = obj.pageId 
        // temp['title'] = obj.title 
        // temp['count'] = obj.count

        // outer_most_band.push(temp)
      }
      let temp = new Object() 
      temp['name'] = type 
      temp['y'] = total_percentage
      temp['drilldown'] = type
      outer_most_band.push(temp)
    } 
    else {
      // sensitive categories, outer band is followed by time columns
      let total_percentage = 0
      let list_of_data = []
      let innermost_list = []
      // todo combine domains to aggregate time on domain (e.g., google search queries all become google)
      let seen_it_domain = []
      for (let obj of groups[type]) {
        if (obj.count !== 0) {
          total_percentage += obj.percentage

          if (seen_it_domain.includes(obj.domain)) {
            let index = 0
            for (let known of innermost_list) {
              if (known['name'] == obj.domain) {
                // the list order is linked to the page visites (e.g., y_list count is first page, then second...)
                innermost_list[index]['title'].push(obj.title)
                innermost_list[index]['pageId'].push(obj.pageId)
                innermost_list[index]['y_list'].push(obj.count)
                innermost_list[index]['y'] += obj.count
              }
              index += 1
            }
          }
          else {
            let temp = new Object()
            temp['name'] = obj.domain 
            temp['y'] = obj.count 
            temp['y_list'] = [obj.count]
            temp['title'] = [obj.title]
            temp['pageId'] = [obj.pageId]
            innermost_list.push(temp)
            seen_it_domain.push(obj.domain)
          }

        }

      } 
      let temp = new Object()
      temp["name"] = type 
      temp['y'] = total_percentage
      temp['drilldown'] = type
      outer_most_band.push(temp)


      let temp2 = new Object()
      temp2['type'] = 'column'
      temp2['name'] = type
      temp2['id'] = type
      temp2['data'] = innermost_list
      last_layer_for_sensitive.push(temp2)


      // last_layer_combined.push(temp)
      last_layer_combined.push(temp2)

    }
  }

  // // group under nonsensitive inferences (to show domain on x axis and time spent on y axis)
  const groups_nonsensitive = middle_layer_all_nonsensitive.reduce((groups, item) => {
    const group = (groups[item.inference] || []);
    group.push(item);
    groups[item.inference] = group;
    return groups;
  }, {});

  for (var type in groups_nonsensitive) {

    let total_percentage = 0
    let list_of_data = []
    let innermost_list = []
    // todo combine domains to aggregate time on domain (e.g., google search queries all become google)
    let seen_it_domain = []
    for (let obj of groups_nonsensitive[type]) {
      if (obj.count !== 0) {
        total_percentage += obj.percentage

        if (seen_it_domain.includes(obj.domain)) {
          let index = 0
          for (let known of innermost_list) {
            if (known['name'] == obj.domain) {
              // the list order is linked to the page visites (e.g., y_list count is first page, then second...)
              innermost_list[index]['title'].push(obj.title)
              innermost_list[index]['pageId'].push(obj.pageId)
              innermost_list[index]['y_list'].push(obj.count)
              innermost_list[index]['y'] += obj.count
            }
            index += 1
          }
        }
        else {
          let temp = new Object()
          temp['name'] = obj.domain 
          temp['y'] = obj.count 
          temp['y_list'] = [obj.count]
          temp['title'] = [obj.title]
          temp['pageId'] = [obj.pageId]
          innermost_list.push(temp)
          seen_it_domain.push(obj.domain)
        }

      }

    } 
    let temp = new Object()
    temp["name"] = type 
    temp['id'] = type
    temp['type'] = 'pie'
    temp['y'] = total_percentage
    temp['drilldown'] = type
    middle_layer_for_nonsensitive.push(temp)


    let temp2 = new Object()
    temp2['type'] = 'column'
    temp2['name'] = type
    temp2['id'] = type
    temp2['data'] = innermost_list
    last_layer_for_nonsensitive.push(temp2)


    // last_layer_combined.push(temp)
    last_layer_combined.push(temp2)

  }

  let overview = {name: "non-sensitive", type: 'pie', colorByPoint: true, id: "non-sensitive", data: middle_layer_for_nonsensitive}
  last_layer_combined.push(overview)

  let to_ret = {outer_all: outer_most_band, last_layer: last_layer_combined}

  return to_ret
}



/** gets all interests and times
 *
 * @param  {Object} args - arguments object
 * @returns {Object} list of sensitive interests based on comfort 
 */
async function getInferencesMostSensitive_version3 (args) {

  // get each page, the page inference, and the time spent on the page 
  let query = ttDb.select(Inferences.inference, Inferences.pageId, Inferences.id, Inferences.inferencePath, Pages.activity_events, Pages.title, Pages.domain)
    .from(Pages)
    .innerJoin(Inferences, Inferences.pageId.eq(Pages.id))
    .where(Inferences.inference.neq('none')) // exclude pages where our content classification did not work (not very helpful unless debugging)


  // re-format time from UNIX to date (YMD) and time (hour,minute,second)
  let time_series_data = new Array()
  let time_series_data_all = new Array()

  // slice it out! 
  let time_series_data_today = new Array()
  let time_series_data_last_week = new Array()
  let time_series_data_last_month = new Array()

  const inferenceQuery = await query.exec()
  let seen_it = []
  let total_time = 0
  let seen_it_same_inference = new Object()
  for (let i = 0; i < inferenceQuery.length; i++) {

    // get sequence of time events as length of time on page
    // start 
    // focus (means stop)
    // focus (means start)
    // focus (stop)
    // focus (start)
    let overall_page_time = inferenceQuery[i]['Pages']['activity_events'][inferenceQuery[i]['Pages']['activity_events'].length-1].overall_time 
    // let result = [];
    // let arr = inferenceQuery[i]['Pages']['activity_events']; // activity as array for each page 
    // arr.forEach((x,y,z) => !(y % 2) ? result.push(z.slice(y, y + 2)) : '');

    // // start      // add 
    // // stop 

    // // start      // add
    // // stop 
    // ///////////////////////
    //               // totals 

    // let overall_page_time = 0
    // for (let p = 0; p < Object.keys(result).length; p++) {

    //   let single_slice = result[p]

    //   // the last event has no pair becuase exit or focus repeats (do not consider it)
    //   // this will also catch the situation where a page is currently being visited and has no history, which should be ignored
    //   if (Object.keys(single_slice).length !== 1) {

    //     let start; 
    //     let end; 

    //     if (Object.keys(single_slice[0]) == 'start') {
    //       start = single_slice[0]['start']
    //       end = single_slice[1]['value']
    //     }
    //     else {
    //       start = single_slice[0]['value']
    //       end = single_slice[1]['value']
    //     }

    //     // count is milliseconds
    //     overall_page_time += (end-start)
        
    //   }



    // }

    if (overall_page_time != 0) {

      // duplicates exist, ne need to include them
      if (!(inferenceQuery[i]['Inferences']['pageId'] in seen_it_same_inference)) {
        
        // get full path and comfort if exists
        let specific_interest = inferenceQuery[i]['Inferences']['inference']
        let str = []
        let comfort;


        try {
          if (specific_interest.includes("Sensitive Subjects") || specific_interest.includes("Adult")) {
            comfort = -3
          }  else {
            comfort = comfortData[specific_interest].comfort
          }
          str = inferenceQuery[i]['Inferences']['inferencePath']

          str = ''
          let string_size = (inferenceQuery[i]['Inferences']['inferencePath'].length) -1
          let counter = 0
          for (let item of inferenceQuery[i]['Inferences']['inferencePath']) {
            if (counter !== string_size) {
              let to_log = String(item) + " ⟶ "
              str += to_log
            } else {
              let to_log = String(item) 
              str += to_log
            }
            counter += 1
          }

        } catch (e) {
          if (specific_interest.includes("Sensitive Subjects") || specific_interest.includes("Adult")) {
            comfort = -3
          }
          else {
            comfort = 0
          }
          str = ''
          let string_size = (inferenceQuery[i]['Inferences']['inferencePath'].length) -1
          let counter = 0
          for (let item of inferenceQuery[i]['Inferences']['inferencePath']) {
            if (counter !== string_size) {
              let to_log = String(item) + " ⟶ "
              str += to_log
            } else {
              let to_log = String(item) 
              str += to_log
            }
            counter += 1
          }
        }


        // get sliced data here 
        // todo this doesn't consider time, just days
        var time =  new Date(inferenceQuery[i]['Inferences']['pageId']).toLocaleTimeString("en-GB") // British English uses 24-hour time without AM/PM
        var date = new Date(inferenceQuery[i]['Inferences']['pageId']).toLocaleDateString("en-GB").split('/').reverse().join('-'); // British English uses day-month-year order
        var date_time = date + " " + time
        var time_log = String(time).split(":")[0] + ":" + String(time).split(":")[1]


        time_series_data_all.push({inference: str, comfort: comfort, domain: inferenceQuery[i]['Pages']['domain'], pageId: inferenceQuery[i]['Inferences']['pageId'], title: inferenceQuery[i]['Pages']['title'], count: overall_page_time, date: date, time_log: date + " " + time_log})
        total_time += overall_page_time
        seen_it_same_inference[inferenceQuery[i]['Inferences']['pageId']] = inferenceQuery[i]['Inferences']['inference']

        var date_today = new Date();
        let date_today_formatted = moment(date_today).format("YYYY-MM-DD");
        let one_month_ago = moment(date_today_formatted).subtract(1, 'months').format('YYYY-MM-DD')
        let one_week_ago = moment(date_today_formatted).subtract(1, 'weeks').format('YYYY-MM-DD')
        let one_day_ago = moment(date_today_formatted).subtract(1, 'days').format('YYYY-MM-DD')
        let within_month = moment(date).isAfter(one_month_ago);
        let within_week = moment(date).isAfter(one_week_ago);
        let within_day = moment(date).isAfter(one_day_ago);

        if (within_month) {
          time_series_data_last_month.push({inference: str, comfort: comfort, domain: inferenceQuery[i]['Pages']['domain'], pageId: inferenceQuery[i]['Inferences']['pageId'], title: inferenceQuery[i]['Pages']['title'], count: overall_page_time, date: date, time_log: date + " " + time_log})
        }
        if (within_week) {
          time_series_data_last_week.push({inference: str, comfort: comfort, domain: inferenceQuery[i]['Pages']['domain'], pageId: inferenceQuery[i]['Inferences']['pageId'], title: inferenceQuery[i]['Pages']['title'], count: overall_page_time, date: date, time_log: date + " " + time_log})
        }
        if (within_day) {
          time_series_data_today.push({inference: str, comfort: comfort, domain: inferenceQuery[i]['Pages']['domain'], pageId: inferenceQuery[i]['Inferences']['pageId'], title: inferenceQuery[i]['Pages']['title'], count: overall_page_time, date: date, time_log: date + " " + time_log})
        }

      }

    }
    

  }

  // let all = merge_on_time(time_series_data_all)
  // let month = merge_on_time(time_series_data_last_month)
  // let week = merge_on_time(time_series_data_last_week)
  // let day = merge_on_time(time_series_data_today)

  let sliced_ret = {"all ": time_series_data_all, "last month ": time_series_data_last_month, "last week ": time_series_data_last_week, "today ": time_series_data_today}

  let sliced_ret2 = {}


  for (const [key_outer, value_outer] of Object.entries(sliced_ret)) {

          // let time_series_data_all = value_outer

          // // group under inferences (to show domain on x axis and time spent on y axis)
          const groups = value_outer.reduce((groups, item) => {

            const group = (groups[item.inference] || []);
            item["percentage"] = (item.count / total_time) * 100
            group.push(item);
            groups[item.inference] = group;
            

            return groups;
          }, {});



          // // add up total time (get percentages for outer pie) 
          // // 

          let outer_most_band = []
          let middle_layer_all_nonsensitive = []
          let middle_layer_for_nonsensitive = []
          let last_layer_for_nonsensitive = []
          let last_layer_for_sensitive = []
          let last_layer_combined = []
          for (var type in groups) {
            // sensitive categories, outer band is followed by time columns
            let total_percentage = 0
            let list_of_data = []
            let innermost_list = []
            // todo combine domains to aggregate time on domain (e.g., google search queries all become google)
            let seen_it_domain = []
            for (let obj of groups[type]) {
              if (obj.count !== 0) {
                total_percentage += obj.percentage

                if (seen_it_domain.includes(obj.domain)) {
                  let index = 0
                  for (let known of innermost_list) {
                    if (known['name'] == obj.domain) {
                      // the list order is linked to the page visites (e.g., y_list count is first page, then second...)
                      innermost_list[index]['title'].push(obj.title)
                      innermost_list[index]['pageId'].push(obj.pageId)
                      innermost_list[index]['y_list'].push(obj.count)
                      innermost_list[index]['y'] += obj.count
                    }
                    index += 1
                  }
                }
                else {
                  let temp = new Object()
                  temp['name'] = obj.domain 
                  temp['y'] = obj.count 
                  temp['y_list'] = [obj.count]
                  temp['title'] = [obj.title]
                  temp['pageId'] = [obj.pageId]
                  innermost_list.push(temp)
                  seen_it_domain.push(obj.domain)
                }

              }

            } 
            let temp = new Object()
            let replace_none = "--no interest found on page--"
            if (type == 'none') {
              type = replace_none
            }
            temp["name"] = type 
            temp['y'] = total_percentage
            temp['drilldown'] = type
            outer_most_band.push(temp)


            let temp2 = new Object()
            if (name == 'none') {
              type = replace_none
            }
            temp2['type'] = 'column'
            temp2['name'] = type
            temp2['id'] = type
            temp2['data'] = innermost_list
            last_layer_for_sensitive.push(temp2)


            // last_layer_combined.push(temp)
            last_layer_combined.push(temp2)
          }

          // // group under nonsensitive inferences (to show domain on x axis and time spent on y axis)
          const groups_nonsensitive = middle_layer_all_nonsensitive.reduce((groups, item) => {
            const group = (groups[item.inference] || []);
            group.push(item);
            groups[item.inference] = group;
            return groups;
          }, {});

          for (var type in groups_nonsensitive) {

            let total_percentage = 0
            let list_of_data = []
            let innermost_list = []
            // todo combine domains to aggregate time on domain (e.g., google search queries all become google)
            let seen_it_domain = []
            for (let obj of groups_nonsensitive[type]) {
              if (obj.count !== 0) {
                total_percentage += obj.percentage

                if (seen_it_domain.includes(obj.domain)) {
                  let index = 0
                  for (let known of innermost_list) {
                    if (known['name'] == obj.domain) {
                      // the list order is linked to the page visites (e.g., y_list count is first page, then second...)
                      innermost_list[index]['title'].push(obj.title)
                      innermost_list[index]['pageId'].push(obj.pageId)
                      innermost_list[index]['y_list'].push(obj.count)
                      innermost_list[index]['y'] += obj.count
                    }
                    index += 1
                  }
                }
                else {
                  let temp = new Object()
                  temp['name'] = obj.domain 
                  temp['y'] = obj.count 
                  temp['y_list'] = [obj.count]
                  temp['title'] = [obj.title]
                  temp['pageId'] = [obj.pageId]
                  innermost_list.push(temp)
                  seen_it_domain.push(obj.domain)
                }

              }

            } 
            let temp = new Object()
            temp["name"] = type 
            temp['id'] = type
            temp['type'] = 'pie'
            temp['y'] = total_percentage
            temp['drilldown'] = type
            middle_layer_for_nonsensitive.push(temp)


            let temp2 = new Object()
            temp2['type'] = 'column'
            temp2['name'] = type
            temp2['id'] = type
            temp2['data'] = innermost_list
            last_layer_for_nonsensitive.push(temp2)


            // last_layer_combined.push(temp)
            last_layer_combined.push(temp2)

          }

          let overview = {name: "non-sensitive", type: 'pie', colorByPoint: true, id: "non-sensitive", data: middle_layer_for_nonsensitive}
          last_layer_combined.push(overview)



          sliced_ret2[key_outer] = {outer_all: outer_most_band, last_layer: last_layer_combined}


        //   // group similar cats
        //   function removeNumber(arr, num){
        //      return arr.filter(el => el.name !== num);
        //   }
        //   let separate_list = []
        //   // let seen_it = []
        //   for (let entry of outer_most_band) {
        //     let this_entry = entry.name
        //     for (let obj of this_entry.split(" ⟶ ")) {
        //       for (let entry_outer of outer_most_band) {
        //         for (let obj_outer of entry_outer.name.split(" ⟶ ")) {
                  

        //           let already_seen_it = false; 
        //           for (let seen of outer_most_band) {
        //             let seen_name = seen.name
        //             if (obj == seen_name) {
        //               already_seen_it = true
        //             }
        //           }

                  
                  
        //           if (obj == obj_outer && this_entry !== entry_outer.name && !already_seen_it) {
        //             console.log(obj + "------- entry " + this_entry + " ((((outer)))) " + entry_outer.name)
                    

                    
        //             // merge entry and entry_outer
        //             // // take entry in outer_most_band and delete both of them, creating a new entry with isolated values 
        //             let idx = 0
        //             let merged = {}
        //             merged.name = obj
        //             merged.y = 0
        //             merged.drilldown = obj + "--" + "merged"
                    
        //             let middle = {}
        //             middle.name = merged.drilldown
        //             middle.id = merged.drilldown
        //             let data_to_push = []
        //             middle.type = "pie"
        //             middle.colorByPoint = true
                    
        //             for (let n of outer_most_band) {
                    
        //               if (n.name == this_entry) {
        //                 console.log("dropping " + n.name)

        //                 // iterate through larger list and find matches, and add those matches infomration with drilldown tag known here 
        //                 // add a simple case here in drilldown that then pops out to the others
        //                  let middle = {}
        //                 middle.name = this_entry
        //                 middle.y = entry.y
        //                 middle.drilldown = this_entry
        //                 middle.type = "pie"
        //                 middle.data = [{name: this_entry, y: entry.y, drilldown: this_entry}]
        //                 middle.colorByPoint = true
        //                 middle.id = merged.drilldown
        //                 last_layer_combined.push(middle) 
        //                 data_to_push.push({name: this_entry, y: entry.y, drilldown: this_entry})
                        
        //                 /* merged.y += n.y */
        //                 outer_most_band = removeNumber(outer_most_band, n.name);
        //               }
        //                if (n.name == entry_outer.name) {
        //                 console.log("dropping " + n.name)
        //                 // iterate through larger list and find matches, and add those matches infomration with drilldown tag known here 
        //                 // add a simple case here in drilldown that then pops out to the others
        // /*                 let middle = {}
        //                 middle.name = entry_outer.name
        //                 middle.y = entry.y
        //                 middle.drilldown = entry_outer.name
        //                 middle.data.push({name: this_entry, y: entry.y, drilldown: this_entry})
        //                 middle.type = "pie"
        //                 middle.colorByPoint = true
        //                 middle.id = merged.drilldown
        //                 last_layer_combined.push(middle) */
        //                 data_to_push.push({name: entry_outer.name, y: entry_outer.y, drilldown: entry_outer.name})
        //                 outer_most_band = removeNumber(outer_most_band, n.name);
        //               }
        //               console.log(data_to_push)
        //               middle.data = data_to_push
                      
        //               idx += 1
        //               //seen_it.push(obj)
        //             }
        //             last_layer_combined.push(middle)
        //             console.log(merged)
        //             outer_most_band.push(merged)
        //             console.log(outer_most_band)
        //             console.log("=========================================")

        //             // have drilldown added 
                    
        //           }
                  
        //         }
        //       }
        //     }
        //   }



  }


  
  return sliced_ret2
  // let to_ret = {outer_all: outer_most_band, last_layer: last_layer_combined}
  // return to_ret
}


/** gets all interests and times
 *
 * @param  {Object} args - arguments object
 * @returns {Object} list of sensitive interests based on comfort 
 */
async function getInferencesMostSensitive_version4 (args) {

  // get each page, the page inference, and the time spent on the page 
  let query = ttDb.select(Inferences.inference, Inferences.pageId, Inferences.id, Inferences.inferencePath, Pages.activity_events, Pages.title, Pages.domain)
    .from(Pages)
    .innerJoin(Inferences, Inferences.pageId.eq(Pages.id))


  // re-format time from UNIX to date (YMD) and time (hour,minute,second)
  let time_series_data = new Array()
  let time_series_data_all = new Array()
  let data_for_manipulation = new Array()


  const inferenceQuery = await query.exec()
  let seen_it = []
  let total_time = 0
  let seen_it_same_inference = new Object()
  for (let i = 0; i < inferenceQuery.length; i++) {

    // get sequence of time events as length of time on page
    // start 
    // focus (means stop)
    // focus (means start)
    // focus (stop)
    // focus (start)
    let overall_page_time = inferenceQuery[i]['Pages']['activity_events'][inferenceQuery[i]['Pages']['activity_events'].length-1].overall_time 
    // let result = [];
    // let arr = inferenceQuery[i]['Pages']['activity_events']; // activity as array for each page 
    // arr.forEach((x,y,z) => !(y % 2) ? result.push(z.slice(y, y + 2)) : '');

    // // start      // add 
    // // stop 

    // // start      // add
    // // stop 
    // ///////////////////////
    //               // totals 

    // let overall_page_time = 0
    // for (let p = 0; p < Object.keys(result).length; p++) {

    //   let single_slice = result[p]

    //   // the last event has no pair becuase exit or focus repeats (do not consider it)
    //   // this will also catch the situation where a page is currently being visited and has no history, which should be ignored
    //   if (Object.keys(single_slice).length !== 1) {

    //     let start; 
    //     let end; 

    //     if (Object.keys(single_slice[0]) == 'start') {
    //       start = single_slice[0]['start']
    //       end = single_slice[1]['value']
    //     }
    //     else {
    //       start = single_slice[0]['value']
    //       end = single_slice[1]['value']
    //     }

    //     // count is milliseconds
    //     overall_page_time += (end-start)
        
    //   }



    // }

    if (overall_page_time != 0) {

      // duplicates exist, ne need to include them
      if (!(inferenceQuery[i]['Inferences']['pageId'] in seen_it_same_inference)) {
        
        // get full path and comfort if exists
        let specific_interest = inferenceQuery[i]['Inferences']['inference']
        let str = []
        let comfort;


        try {
          if (specific_interest.includes("Sensitive Subjects") || specific_interest.includes("Adult")) {
            comfort = -3
          }  else {
            comfort = comfortData[specific_interest].comfort
            str = inferenceQuery[i]['Inferences']['inferencePath']

            str = ''
            let string_size = (inferenceQuery[i]['Inferences']['inferencePath'].length) -1
            let counter = 0
            for (let item of inferenceQuery[i]['Inferences']['inferencePath']) {
              if (counter !== string_size) {
                let to_log = String(item) + " ⟶ "
                str += to_log
              } else {
                let to_log = String(item) 
                str += to_log
              }
              counter += 1
            }
          }

        } catch (e) {
          if (specific_interest.includes("Sensitive Subjects") || specific_interest.includes("Adult")) {
            comfort = -3
          }
          else {
            comfort = 0
          }
          str = ''
          let string_size = (inferenceQuery[i]['Inferences']['inferencePath'].length) -1
          let counter = 0
          for (let item of inferenceQuery[i]['Inferences']['inferencePath']) {
            if (counter !== string_size) {
              let to_log = String(item) + " ⟶ "
              str += to_log
            } else {
              let to_log = String(item) 
              str += to_log
            }
            counter += 1
          }
        }

        time_series_data_all.push({inference: specific_interest, comfort: comfort, domain: inferenceQuery[i]['Pages']['domain'], pageId: inferenceQuery[i]['Inferences']['pageId'], title: inferenceQuery[i]['Pages']['title'], count: overall_page_time})
        data_for_manipulation.push({inference: inferenceQuery[i]['Inferences']['inferencePath'], comfort: comfort, domain: inferenceQuery[i]['Pages']['domain'], pageId: inferenceQuery[i]['Inferences']['pageId'], title: inferenceQuery[i]['Pages']['title'], count: overall_page_time})
        total_time += overall_page_time
        seen_it_same_inference[inferenceQuery[i]['Inferences']['pageId']] = inferenceQuery[i]['Inferences']['inference']

      }

    }
    

  }




  // // group under inferences (to show domain on x axis and time spent on y axis)
  const groups = time_series_data_all.reduce((groups, item) => {

    const group = (groups[item.inference] || []);
    item["percentage"] = (item.count / total_time) * 100
    group.push(item);
    groups[item.inference] = group;
    

    return groups;
  }, {});



  // // add up total time (get percentages for outer pie) 
  // // 

  let outer_most_band = []
  let middle_layer_all_nonsensitive = []
  let middle_layer_for_nonsensitive = []
  let last_layer_for_nonsensitive = []
  let last_layer_for_sensitive = []
  let last_layer_combined = []
  for (var type in groups) {
    // sensitive categories, outer band is followed by time columns
    let total_percentage = 0
    let list_of_data = []
    let innermost_list = []
    // todo combine domains to aggregate time on domain (e.g., google search queries all become google)
    let seen_it_domain = []
    for (let obj of groups[type]) {
      if (obj.count !== 0) {
        total_percentage += obj.percentage

        if (seen_it_domain.includes(obj.domain)) {
          let index = 0
          for (let known of innermost_list) {
            if (known['name'] == obj.domain) {
              // the list order is linked to the page visites (e.g., y_list count is first page, then second...)
              innermost_list[index]['title'].push(obj.title)
              innermost_list[index]['pageId'].push(obj.pageId)
              innermost_list[index]['y_list'].push(obj.count)
              innermost_list[index]['y'] += obj.count
            }
            index += 1
          }
        }
        else {
          let temp = new Object()
          temp['name'] = obj.domain 
          temp['y'] = obj.count 
          temp['y_list'] = [obj.count]
          temp['title'] = [obj.title]
          temp['pageId'] = [obj.pageId]
          innermost_list.push(temp)
          seen_it_domain.push(obj.domain)
        }

      }

    } 
    let temp = new Object()
    temp["name"] = type 
    temp['y'] = total_percentage
    temp['drilldown'] = type
    outer_most_band.push(temp)


    let temp2 = new Object()
    temp2['type'] = 'column'
    temp2['name'] = type
    temp2['id'] = type
    temp2['data'] = innermost_list
    last_layer_for_sensitive.push(temp2)


    // last_layer_combined.push(temp)
    last_layer_combined.push(temp2)
  }

  // // group under nonsensitive inferences (to show domain on x axis and time spent on y axis)
  const groups_nonsensitive = middle_layer_all_nonsensitive.reduce((groups, item) => {
    const group = (groups[item.inference] || []);
    group.push(item);
    groups[item.inference] = group;
    return groups;
  }, {});

  for (var type in groups_nonsensitive) {

    let total_percentage = 0
    let list_of_data = []
    let innermost_list = []
    // todo combine domains to aggregate time on domain (e.g., google search queries all become google)
    let seen_it_domain = []
    for (let obj of groups_nonsensitive[type]) {
      if (obj.count !== 0) {
        total_percentage += obj.percentage

        if (seen_it_domain.includes(obj.domain)) {
          let index = 0
          for (let known of innermost_list) {
            if (known['name'] == obj.domain) {
              // the list order is linked to the page visites (e.g., y_list count is first page, then second...)
              innermost_list[index]['title'].push(obj.title)
              innermost_list[index]['pageId'].push(obj.pageId)
              innermost_list[index]['y_list'].push(obj.count)
              innermost_list[index]['y'] += obj.count
            }
            index += 1
          }
        }
        else {
          let temp = new Object()
          temp['name'] = obj.domain 
          temp['y'] = obj.count 
          temp['y_list'] = [obj.count]
          temp['title'] = [obj.title]
          temp['pageId'] = [obj.pageId]
          innermost_list.push(temp)
          seen_it_domain.push(obj.domain)
        }

      }

    } 
    let temp = new Object()
    temp["name"] = type 
    temp['id'] = type
    temp['type'] = 'pie'
    temp['y'] = total_percentage
    temp['drilldown'] = type
    middle_layer_for_nonsensitive.push(temp)


    let temp2 = new Object()
    temp2['type'] = 'column'
    temp2['name'] = type
    temp2['id'] = type
    temp2['data'] = innermost_list
    last_layer_for_nonsensitive.push(temp2)


    // last_layer_combined.push(temp)
    last_layer_combined.push(temp2)

  }

  let overview = {name: "non-sensitive", type: 'pie', colorByPoint: true, id: "non-sensitive", data: middle_layer_for_nonsensitive}
  last_layer_combined.push(overview)


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //https://codereview.stackexchange.com/q/219418
  function createTree(arr, topItem = "Top") {
    const node = (name, original_info, parent = null) => ({
      name,
      parent,
      original_info,
      children: []
    });
    const addNode = (parent, child) => {
      parent.children.push(child);

      return child;
    };
    const findNamedNode = (name, parent) => {
      for (const child of parent.children) {
        if (child.name === name) {
          return child
        }
        const found = findNamedNode(name, child);
        if (found) {
          return found
        }
      }
    };

    const top = node(topItem);
    let current;


    for (const children of arr) {
      console.log(JSON.stringify(children) + " is here")
      current = top;
      for (const name of children.inference) {
        const found = findNamedNode(name, current);
        current = found ? found : addNode(current, node(name, children, current.name));
      }
    }

    return top;
  }


  let tree = createTree(data_for_manipulation, )


  let outer_most_layer = []
  let inner_layers = []
  for (let obj of tree['children']) {
    console.log(obj)
    // this is outermost layer 
    console.log(obj.name)
    let t = 0
    for (let all of time_series_data_all) {
      if (all.inference.includes(obj.name)) {
        t += all.count
      }
    }
    console.log(t)
    let is_child = obj.children.length >= 1
    let drilldown_name = "";
    if (is_child) {
      drilldown_name = " [merged]"
    }
    let temp = {name: obj.name, type: "pie", y: t/total_time, drilldown: obj.name + drilldown_name}
    outer_most_layer.push(temp)
    
    if (is_child) {
      let children_1_layer = obj.children
      for (let child of children_1_layer) {
        console.log(child)
        let name = child.name 
        let type = "pie"
        let id = obj.name + drilldown_name
        let data = [] // teh full breakdown in each child plus a marker for drilldown 
        if (child.children.length >= 1) {
          for (let child_child of child.children) {

            data.push({name:child_child.name, type: "pie", id: child_child.name, y: child_child.original_info.count / total_time, drilldown: child_child.name})
          }
          console.log(data)
          inner_layers.push({name: name, id: id, data: data})
          
          
          console.log("pizza" + child.children.children)
          
        } 

        
      }
    }
    
    // first layer
    // time is t as percentage 
    // name is name
    // drilldown is next layer 
  }

  for (let obj of inner_layers) {
    last_layer_combined.push(obj)
  }
  console.log(outer_most_layer)
  console.log(inner_layers)
  console.log("END") 
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




  let to_ret = {outer_all: outer_most_layer, last_layer: last_layer_combined}
  return to_ret
}


/** gets most sensitive interests for bubbleView
 *
 * series = [ {name: <enter>, data: [{name: <enter>, value: <enter> }, {}, {} ...]  }, {}, {}... ]
 *
 * @param  {Object} args - arguments object
 * @returns {Object} list of sensitive interests based on comfort 
 */

async function getInferencesMostSensitive_bubbles (args) {

  let query = ttDb.select(Pages.id, Pages.title, Pages.domain, Pages.hostname, Pages.path, Pages.protocol, Inferences.inference, Inferences.wordCloud)
    .from(Pages, Inferences, Trackers)
    .where(lf.op.and(
      Inferences.pageId.eq(Pages.id),
    ))
  let objects = await query.exec()

  let sensitive_interests = []
  let seen_it = []

  let series = []

  for (let obj of objects) {
    let specific_interest = obj['Inferences'].inference
    if (comfortData[specific_interest]) {
      // only select likely uncomfortable interests
      if (comfortData[specific_interest].comfort < 0) {

        if (seen_it.includes(obj['Pages'].title) == false) {
          seen_it.push(obj['Pages'].title)

          let temp = {}
          
          temp['id'] = obj['Pages'].id
          temp['path'] = comfortData[specific_interest].path
          temp['title'] = obj['Pages'].title
          temp['score'] = comfortData[specific_interest].comfort



          let args2 = {'pageId': obj['Pages'].id}
          let tracker_info = await getNumber_andNames_OfTrackers_perPage(args2)
          let unique_trackers = new Array()
          for (let track of tracker_info) {
            if (unique_trackers.includes(track['tracker']) == false) {
              unique_trackers.push(track['tracker'])
            }
          }
          temp['tracker_info'] = unique_trackers

          sensitive_interests.push(temp)

          let inner_data = {}
          let outer_data = {}
          if (comfortData[specific_interest].path.length > 1) {
            inner_data["name"] = comfortData[specific_interest].path.slice(-1)[0]
            inner_data["value"] = Math.pow(Math.abs(comfortData[specific_interest].comfort), 5) + (Math.random(0,10) * 500)
            inner_data['full_path'] = comfortData[specific_interest].path
            inner_data['tracker_info'] = unique_trackers
            // only include drilldown if there is a wordCloud
            if (obj['Inferences'].wordCloud !== '') {
              inner_data['drilldown'] = inner_data["name"]
              inner_data['wordCloud'] = obj['Inferences'].wordCloud
            }
            // inner_data['drilldown'] = inner_data["name"]
            // inner_data['wordCloud'] = obj['Inferences'].wordCloud


            let index = (comfortData[specific_interest].path.length) - 2
            let second_last_item_in_path = comfortData[specific_interest].path[index]

            var exists = false;
            let current; 
            for (let obj of series){
              let name_check = obj['name']
              if (second_last_item_in_path == name_check) {
                exists = true
                current = obj['data']
              }
            }

            if (exists) {
              // don't push if this name already exists
              // this occurs because this is a different website visit to the same category of website (e.g., plannedParenthood/about v. plannedParenthood/home)
              let sub_exists = false 
              let to_add_anyways; 
              for (let obj of current) {
                let name_check = obj['name']
                if (inner_data["name"] == name_check) {
                  sub_exists = true
                  // tracker_info should be updated anyways 
                  let current_trackers = obj['tracker_info']
                  for (let i = 0; i < unique_trackers.length; i++) {
                    if (!current_trackers.includes(unique_trackers[i])) {
                      current_trackers.push(unique_trackers[i])
                    }
                  }
                  
                }
              }
              if (!sub_exists) {
                current.push(inner_data)
              }
              
            }
            else {
              outer_data['data'] = [inner_data]
              outer_data['name'] = second_last_item_in_path
              outer_data['drilldown'] = "tester"
            }

          } 
          // path length is less than 1 so log the full path
          else {
            let outer_data = {}
            outer_data["name"] = comfortData[specific_interest].path
            outer_data["value"] = Math.pow(Math.abs(comfortData[specific_interest].comfort), 5)
            outer_data['tracker_info'] = unique_trackers
            outer_data['drilldown'] = "tester"

          }
          
          series.push(outer_data)
          
        }
      } 
    }
  }

  // there is an empty object in this list for some reason
  // filter is used to get rid of it
  let outer_layer = series.filter(value => Object.keys(value).length !== 0)


  // [{
  //   type: 'wordcloud',
  //   id: 'Chrome',
  //   data: wordcloudData,
  //   name: 'Occurrences'
  // }, ]

  function parsed_wordCloud(text) {
    const lines = text.split(/[,. ]+/g);
    const wordcloudData = lines.reduce((acc, word) => {
    let el = acc.find(each => each.name === word);

    if (el) {
      el.weight += 1;
    } else {
      el = {
        name: word,
        weight: 1,
        // drilldown: word,
      };

      acc.push(el);
    }

    return acc;
    }, []);

    let sorted = wordcloudData.sort((a, b) => (a.weight > b.weight) ? 1 : -1).reverse()
    let sliced = sorted.slice(0, WORD_CLOUD_MAX)
    return sliced
  }

  let count = 0
  let inner_layer = []
  for (let obj of outer_layer) {
    let title = obj['name']
    let data_list = obj['data']
    let index = 0
    for (let inner of data_list) {
      if (inner.drilldown) {
        console.log(inner.drilldown)
        let temp = {}
        temp['type'] = 'wordcloud'
        temp['id'] = inner.drilldown
        temp['data'] = parsed_wordCloud(inner.wordCloud)
        temp['name'] = inner.drilldown
        temp['rotation'] = {from: 0, to: 0, orientations: 0}

        inner_layer.push(temp)
        outer_layer[count]['data'][index].wordCloud = ''
      }
      index += 1
    }
    count += 1
  }

  return {outer: outer_layer, inner: inner_layer}
}


/** gets most sensitive interests for bubbleView, without layers
 *
 * series = [ {name: <enter>, data: [{name: <enter>, value: <enter> }, {}, {} ...]  }, {}, {}... ]
 *
 * @param  {Object} args - arguments object
 * @returns {Object} list of sensitive interests based on comfort 
 */

async function getInferencesMostSensitive_bubbles_version2 (args) {

  let query = ttDb.select(Pages.id, Pages.title, Pages.domain, Pages.activity_events, Inferences.inference, Inferences.inferenceCategory, Inferences.wordCloud)
    .from(Pages, Inferences)
    .where(lf.op.and(
      Inferences.pageId.eq(Pages.id),
    ))
  let objects = await query.exec()

  let sensitive_interests = []
  let seen_it = []
  let word_cloud = []
  let series = []

  for (let obj of objects) {

    // if sensitive, it will have wordCloud
    if (obj['Inferences'].wordCloud !== '') {

      let specific_interest = obj['Inferences'].inferenceCategory

      let args2 = {'pageId': obj['Pages'].id}
      let tracker_info = await getNumber_andNames_OfTrackers_perPage(args2)
      // get tackers per page
      let unique_trackers = new Array()
      for (let track of tracker_info) {
        if (unique_trackers.includes(track['tracker']) == false) {
          unique_trackers.push(track['tracker'])
        }
      }

      ///////////////////////////////////////////////////////////////////////////////// get timing
      let ms_timing = 0;
      let overall_page_time = obj['Pages']['activity_events'][obj['Pages']['activity_events'].length-1].overall_time 
      // let result = [];
      // let arr = obj['Pages']['activity_events']; // activity as array for each page 
      // arr.forEach((x,y,z) => !(y % 2) ? result.push(z.slice(y, y + 2)) : '');

      // // start      // add 
      // // stop 

      // // start      // add
      // // stop 
      // ///////////////////////
      //               // totals 

      // let overall_page_time = 0
      // for (let p = 0; p < Object.keys(result).length; p++) {

      //   let single_slice = result[p]

      //   // the last event has no pair becuase exit or focus repeats (do not consider it)
      //   // this will also catch the situation where a page is currently being visited and has no history, which should be ignored
      //   if (Object.keys(single_slice).length !== 1) {

      //     let start; 
      //     let end; 

      //     if (Object.keys(single_slice[0]) == 'start') {
      //       start = single_slice[0]['start']
      //       end = single_slice[1]['value']
      //     }
      //     else {
      //       start = single_slice[0]['value']
      //       end = single_slice[1]['value']
      //     }

      //     // count is milliseconds
      //     overall_page_time += (end-start)
          
      //   }
      // }
      if (overall_page_time != 0) {
        ms_timing = overall_page_time
      } else {
        ms_timing = 300
      }
      ///////////////////////////////////////////////////////////////////////////////// get timing


      // need to merge on domains, but know what the titles are 
      // if seen domain, accumulate information
      // if new domain, add it to category 
      if (!seen_it.includes(specific_interest)) {
        let inner_data = {}

        inner_data["name"] = obj['Pages'].domain
        inner_data["title"] = [obj['Pages'].title]
        inner_data["pageId"] = [obj['Pages'].id]
        inner_data["value"] =  ms_timing
        inner_data['tracker_info'] = [unique_trackers]
        inner_data['drilldown'] = specific_interest + "--" + inner_data["name"]
        inner_data['wordCloud'] = obj['Inferences'].wordCloud

        let outer_data = {}
        outer_data['data'] = [inner_data]
        outer_data['name'] = specific_interest

        series.push(outer_data)
        seen_it.push(specific_interest)
      } else {
        // aggregate title, wordCloud, pageId information
        let count = 0
        for (let exists of series) {
          let name = exists.name 
          if (name == specific_interest) {
            // this is what we should be updating


            // if same domain then aggregate, else add a new data block
            let domain_under_consideration = obj['Pages'].domain
            let logged_domain = series[count]["data"][0].name
            if (domain_under_consideration == logged_domain) {
              let currPageId = obj['Pages'].id
              let curr_Ids = series[count]["data"][0].pageId
              if (!curr_Ids.includes(currPageId)) {
                let curr_title = series[count]["data"][0].title
                curr_title.push(obj['Pages'].title)
                series[count]["data"][0].title = curr_title

                let curr_Ids = series[count]["data"][0].pageId
                curr_Ids.push(obj['Pages'].id)
                series[count]["data"][0].pageId = curr_Ids

                let curr_trackers = series[count]["data"][0].tracker_info
                curr_trackers.push(unique_trackers)
                series[count]["data"][0].tracker_info = curr_trackers

                let curr_msTime = series[count]["data"][0].value
                curr_msTime += ms_timing
                series[count]["data"][0].value = curr_msTime


                // aggregate the worldCloud to combine titles
                let curr_wordCloud = series[count]["data"][0].wordCloud
                curr_wordCloud += obj['Inferences'].wordCloud
                series[count]["data"][0].wordCloud = curr_wordCloud

              }
            } else {
              // find the name of domain that matches and insert it
              
              // check if it already exists, if not add it
              let this_index = 0 
              let does_not_exist = true;
              for (let domain_slice of series[count]["data"]) {
                let this_domain = domain_slice.name 
                if (this_domain == obj['Pages'].domain) {

                  does_not_exist = false;

                  // let curr_id = this_domain.pageId
                  // if (!curr_id.includes(obj['Pages'].id)) {
                  let curr_title = series[count]["data"][this_index].title
                  curr_title.push(obj['Pages'].title)
                  series[count]["data"][this_index].title = curr_title

                  let curr_Ids = series[count]["data"][this_index].pageId
                  curr_Ids.push(obj['Pages'].id)
                  series[count]["data"][this_index].pageId = curr_Ids

                  let curr_trackers = series[count]["data"][this_index].tracker_info
                  curr_trackers.push(unique_trackers)
                  series[count]["data"][this_index].tracker_info = curr_trackers

                  let curr_msTime = series[count]["data"][this_index].value
                  curr_msTime += ms_timing
                  series[count]["data"][this_index].value = curr_msTime


                  // aggregate the worldCloud to combine titles
                  let curr_wordCloud = series[count]["data"][this_index].wordCloud
                  curr_wordCloud += obj['Inferences'].wordCloud
                  series[count]["data"][this_index].wordCloud = curr_wordCloud

                  // }
                }
                this_index += 1
              }

              if (does_not_exist) {
                // add new block to data 
                let domain_under_consideration = obj['Pages'].domain
                let logged_domain = series[count]["data"][0].name
                let inner_data = {}
                inner_data["name"] = obj['Pages'].domain
                inner_data["title"] = [obj['Pages'].title]
                inner_data["pageId"] = [obj['Pages'].id]
                inner_data["value"] =  ms_timing
                // inner_data["value"] = comfortData[specific_interest].comfort // Math.pow(Math.abs(comfortData[specific_interest].comfort), 5)
                inner_data['tracker_info'] = [unique_trackers]
                inner_data['drilldown'] = specific_interest + "--" + inner_data["name"]
                inner_data['wordCloud'] = obj['Inferences'].wordCloud

                let current_data_block = series[count]["data"]
                current_data_block.push(inner_data)
                series[count]["data"] = current_data_block
              }


            }




            // series[count]["data"].tracker_info.push(unique_trackers)
            // series[count]["data"].wordCloud += obj['Inferences'].wordCloud
          }
          count += 1
        }
      }

    }



  }

  // helper function for wordCloud
  function parsed_wordCloud(text) {
    const lines = text.split(/[,. ]+/g);
    const wordcloudData = lines.reduce((acc, word) => {
    let el = acc.find(each => each.name === word);

    if (el) {
      el.weight += 1;
    } else {
      el = {
        name: word,
        weight: 1,
        // drilldown: word,
      };

      acc.push(el);
    }

    return acc;
    }, []);

    let sorted = wordcloudData.sort((a, b) => (a.weight > b.weight) ? 1 : -1).reverse()
    let sliced = sorted.slice(0, WORD_CLOUD_MAX)
    return sliced
  }

  let count = 0
  let inner_layer = []
  for (let obj of series) {
    let title = obj['name']
    let data_list = obj['data']
    let index = 0
    for (let inner of data_list) {
      if (inner.drilldown) {
        let temp = {}
        temp['type'] = 'wordcloud'
        temp['id'] = inner.drilldown
        temp['data'] = parsed_wordCloud(inner.wordCloud)
        temp['name'] = inner.drilldown
        temp['rotation'] = {from: 0, to: 0, orientations: 0}
        temp['spiral'] = 'rectangular'
        temp['placementStrategy'] = 'center'
        temp['wordSpaces'] = 1

        word_cloud.push(temp)
        series[count]['data'][index].wordCloud = ''
      }
      index += 1
    }
    count += 1
  }
  // // alphabetical sorting
  // // add legendIndex
  // let inner = word_cloud.sort((a, b) => a.id.localeCompare(b.id))
  // let idx = 0
  // for (let entry of inner) {
  //   let curr = inner[idx]
  //   curr['legendIndex'] = idx
  //   inner[idx] = curr
  //   idx += 1
  // }
  // alphabetical sorting
  // add legendIndex
  let outer = series.sort((a, b) => a.name.localeCompare(b.name))
  let idx = 0
  for (let entry of outer) {
    let curr = outer[idx]
    curr['legendIndex'] = idx
    outer[idx] = curr
    idx += 1
  }

  return {outer: outer, inner: word_cloud}
}




/** gets most sensitive interests for bubbleView, just words
 *
 * series = [ {name: <enter>, data: [{name: <enter>, value: <enter> }, {}, {} ...]  }, {}, {}... ]
 *
 * @param  {Object} args - arguments object
 * @returns {Object} list of sensitive interests based on comfort 
 */

async function getInferencesMostSensitive_bubbles_text (args) {

  let query = ttDb.select(Pages.id, Pages.title, Pages.domain, Pages.activity_events, Inferences.inference, Inferences.inferenceCategory, Inferences.wordCloud)
    .from(Pages, Inferences)
    .where(lf.op.and(
      Inferences.pageId.eq(Pages.id),
    ))
  let objects = await query.exec()

  let sensitive_interests = []
  let seen_it = []
  let word_cloud = []
  let series = []

  for (let obj of objects) {

    // if sensitive, it will have wordCloud
    if (obj['Inferences'].wordCloud !== '') {

      let specific_interest = obj['Inferences'].inferenceCategory

      let args2 = {'pageId': obj['Pages'].id}
      let tracker_info = await getNumber_andNames_OfTrackers_perPage(args2)
      // get tackers per page
      let unique_trackers = new Array()
      for (let track of tracker_info) {
        if (unique_trackers.includes(track['tracker']) == false) {
          unique_trackers.push(track['tracker'])
        }
      }

      ///////////////////////////////////////////////////////////////////////////////// get timing
      let ms_timing = 0;
      let result = [];
      let overall_page_time = obj['Pages']['activity_events'][obj['Pages']['activity_events'].length-1].overall_time 
      // let arr = obj['Pages']['activity_events']; // activity as array for each page 
      // arr.forEach((x,y,z) => !(y % 2) ? result.push(z.slice(y, y + 2)) : '');

      // // start      // add 
      // // stop 

      // // start      // add
      // // stop 
      // ///////////////////////
      //               // totals 

      // let overall_page_time = 0
      // for (let p = 0; p < Object.keys(result).length; p++) {

      //   let single_slice = result[p]

      //   // the last event has no pair becuase exit or focus repeats (do not consider it)
      //   // this will also catch the situation where a page is currently being visited and has no history, which should be ignored
      //   if (Object.keys(single_slice).length !== 1) {

      //     let start; 
      //     let end; 

      //     if (Object.keys(single_slice[0]) == 'start') {
      //       start = single_slice[0]['start']
      //       end = single_slice[1]['value']
      //     }
      //     else {
      //       start = single_slice[0]['value']
      //       end = single_slice[1]['value']
      //     }

      //     // count is milliseconds
      //     overall_page_time += (end-start)
          
      //   }
      // }
      if (overall_page_time != 0) {
        ms_timing = overall_page_time
      } else {
        ms_timing = 300
      }
      ///////////////////////////////////////////////////////////////////////////////// get timing


      // need to merge on domains, but know what the titles are 
      // if seen domain, accumulate information
      // if new domain, add it to category 
      if (!seen_it.includes(specific_interest)) {
        let inner_data = {}

        inner_data["name"] = obj['Pages'].domain
        inner_data["title"] = [obj['Pages'].title]
        inner_data["pageId"] = [obj['Pages'].id]
        inner_data["value"] =  ms_timing
        inner_data['tracker_info'] = [unique_trackers]
        inner_data['drilldown'] = specific_interest + "--" + inner_data["name"]
        inner_data['wordCloud'] = obj['Inferences'].wordCloud

        let outer_data = {}
        outer_data['data'] = [inner_data]
        outer_data['name'] = specific_interest

        series.push(outer_data)
        seen_it.push(specific_interest)
      } else {
        // aggregate title, wordCloud, pageId information
        let count = 0
        for (let exists of series) {
          let name = exists.name 
          if (name == specific_interest) {
            // this is what we should be updating


            // if same domain then aggregate, else add a new data block
            let domain_under_consideration = obj['Pages'].domain
            let logged_domain = series[count]["data"][0].name
            if (domain_under_consideration == logged_domain) {
              let currPageId = obj['Pages'].id
              let curr_Ids = series[count]["data"][0].pageId
              if (!curr_Ids.includes(currPageId)) {
                let curr_title = series[count]["data"][0].title
                curr_title.push(obj['Pages'].title)
                series[count]["data"][0].title = curr_title

                let curr_Ids = series[count]["data"][0].pageId
                curr_Ids.push(obj['Pages'].id)
                series[count]["data"][0].pageId = curr_Ids

                let curr_trackers = series[count]["data"][0].tracker_info
                curr_trackers.push(unique_trackers)
                series[count]["data"][0].tracker_info = curr_trackers

                let curr_msTime = series[count]["data"][0].value
                curr_msTime += ms_timing
                series[count]["data"][0].value = curr_msTime


                // aggregate the worldCloud to combine titles
                let curr_wordCloud = series[count]["data"][0].wordCloud
                curr_wordCloud += obj['Inferences'].wordCloud
                series[count]["data"][0].wordCloud = curr_wordCloud

              }
            } else {
              // find the name of domain that matches and insert it
              
              // check if it already exists, if not add it
              let this_index = 0 
              let does_not_exist = true;
              for (let domain_slice of series[count]["data"]) {
                let this_domain = domain_slice.name 
                if (this_domain == obj['Pages'].domain) {

                  does_not_exist = false;

                  // let curr_id = this_domain.pageId
                  // if (!curr_id.includes(obj['Pages'].id)) {
                  let curr_title = series[count]["data"][this_index].title
                  curr_title.push(obj['Pages'].title)
                  series[count]["data"][this_index].title = curr_title

                  let curr_Ids = series[count]["data"][this_index].pageId
                  curr_Ids.push(obj['Pages'].id)
                  series[count]["data"][this_index].pageId = curr_Ids

                  let curr_trackers = series[count]["data"][this_index].tracker_info
                  curr_trackers.push(unique_trackers)
                  series[count]["data"][this_index].tracker_info = curr_trackers

                  let curr_msTime = series[count]["data"][this_index].value
                  curr_msTime += ms_timing
                  series[count]["data"][this_index].value = curr_msTime


                  // aggregate the worldCloud to combine titles
                  let curr_wordCloud = series[count]["data"][this_index].wordCloud
                  curr_wordCloud += obj['Inferences'].wordCloud
                  series[count]["data"][this_index].wordCloud = curr_wordCloud

                  // }
                }
                this_index += 1
              }

              if (does_not_exist) {
                // add new block to data 
                let domain_under_consideration = obj['Pages'].domain
                let logged_domain = series[count]["data"][0].name
                let inner_data = {}
                inner_data["name"] = obj['Pages'].domain
                inner_data["title"] = [obj['Pages'].title]
                inner_data["pageId"] = [obj['Pages'].id]
                inner_data["value"] =  ms_timing
                // inner_data["value"] = comfortData[specific_interest].comfort // Math.pow(Math.abs(comfortData[specific_interest].comfort), 5)
                inner_data['tracker_info'] = [unique_trackers]
                inner_data['drilldown'] = specific_interest + "--" + inner_data["name"]
                inner_data['wordCloud'] = obj['Inferences'].wordCloud

                let current_data_block = series[count]["data"]
                current_data_block.push(inner_data)
                series[count]["data"] = current_data_block
              }


            }




            // series[count]["data"].tracker_info.push(unique_trackers)
            // series[count]["data"].wordCloud += obj['Inferences'].wordCloud
          }
          count += 1
        }
      }

    }



  }

  // helper function for wordCloud
  function parsed_wordCloud(text) {
    const lines = text.split(/[,. ]+/g);
    const wordcloudData = lines.reduce((acc, word) => {
    let el = acc.find(each => each.name === word);

    if (el) {
      el.weight += 1;
    } else {
      el = {
        name: word,
        weight: 1,
        // drilldown: word,
      };

      acc.push(el);
    }

    return acc;
    }, []);

    let sorted = wordcloudData.sort((a, b) => (a.weight > b.weight) ? 1 : -1).reverse()
    let sliced = sorted.slice(0, WORD_CLOUD_MAX)
    return sliced
  }

  let count = 0
  let inner_layer = []
  let all_words = ''
  for (let obj of series) {
    let title = obj['name']
    let data_list = obj['data']
    let index = 0
    for (let inner of data_list) {
      if (inner.drilldown) {
        // let temp = {}
        // temp['type'] = 'wordcloud'
        // temp['id'] = inner.drilldown
        // temp['data'] = parsed_wordCloud(inner.wordCloud)
        all_words += inner.wordCloud
      }
      index += 1
    }
    count += 1
  }

  let to_ret = parsed_wordCloud(all_words)

  return to_ret
}



/* ================ */
/*   COUNTING       */
/* ================ */

/**
 * get the total number of pages
 *
 * @returns {Integer} number of page visits
 * TODO: bug -- this counts duplicates
 */
async function getNumberOfPages () {
  let query = await ttDb.select(lf.fn.count(Pages.id))
    .from(Pages)
    .exec()
  return (query[0])['COUNT(id)']
}

/**
 * get the total number of pages visited to a specific website domain
 *
 * @domain {String} domain to match and search for
 * @returns {Integer} number of page visits
 */
async function getNumberOfPages_perTitle (args) {
  let query = await ttDb.select(lf.fn.count(Pages.id))
    .from(Pages)
    .where(Pages.title.eq(args.title))
    .exec()
  return (query[0])['COUNT(id)']
}

/**
 * get the total number of pages visited to a specific website domain
 *
 * @domain {String} domain to match and search for
 * @returns {Integer} number of page visits
 */
async function getTimesOfPages_perTitle (args) {

  let query = ttDb.select()
    .from(Pages)
    .where(Pages.title.eq(args.title))
  let times = await query.exec()
  return Array.from(times)

}


/**
 * get the total number of unique trackers
 *
 * @returns {Integer} number of trackers
 */
async function getNumberOfTrackers () {
  let query = await ttDb.select(lf.fn.count(lf.fn.distinct(Trackers.tracker)))
    .from(Trackers)
    .exec()
  return (query[0])['COUNT(DISTINCT(tracker))']
}

/**
 * get number and names of unique trackers on a page
 *
 * @returns {Integer} number of trackers
 * @returns {String} names of trackers

 */
async function getNumber_andNames_OfTrackers_perPage (args) {
  let query = await ttDb.select()
    .from(Trackers)
    .where(Trackers.pageId.eq(args.pageId))

  let tracker_into = await query.exec() 
  return (Array.from(tracker_into))
}

/**
 * get the total number of unique inferences
 *
 * @returns {Integer} number of inferences made
 */
async function getNumberOfInferences () {
  let query = await ttDb.select(lf.fn.count(lf.fn.distinct(Inferences.inference)))
    .from(Inferences)
    .where(lf.op.and(
      Inferences.inference.neq('none'),
      Inferences.inference.neq('error - empty'),
    ))
    .exec()
  //let excludables = ['error - empty' , 'none']
  return (query[0])['COUNT(DISTINCT(inference))']
}

/**
 * get the total number of domains
 *
 * @returns {Integer} number of domains
 */
async function getNumberOfDomains () {
  let query = await ttDb.select(lf.fn.count(lf.fn.distinct(Pages.domain)))
    .from(Pages)
    .exec()
  return (query[0])['COUNT(DISTINCT(domain))']
}

/**
 * get the total number of unique ads
 *
 * @returns {Integer} number of ads logged
 */
async function getNumberOfAds () {
  let query = await ttDb.select(lf.fn.count(Ads.id)).from(Ads).exec()
  return (query[0])['COUNT(DISTINCT(tracker))']
}

/* ================ */
/*      PAGES       */
/* ================ */

/** get pages by domain
 *
 * @param  {Object} args - arguments object
 * @param  {number} args.domain - domain
 * @param  {number} [args.count] - number of entries to return
 */
async function getPagesByDomain (args) {
  // console.log(args)
  if (!args.domain) {
    // throw new Error('Insufficient args provided for query (getPagesByDomain)')
    console.log('Insufficient args provided for query (getPagesByDomain)')
    return
  }

  let query = ttDb.select()
    .from(Pages)
    .where(Pages.domain.eq(args.domain))

  query = args.count ? query.limit(args.count) : query
  query = query.orderBy(Pages.id, lf.Order.DESC)
  let pages = await query.exec()

  pages = pages.map(async (page) => {
    page.url = makeURL(page)

    let inferQ = ttDb.select(Inferences.inference)
      .from(Inferences)
      .where(Inferences.pageId.eq(page.id))
    let infer = (await inferQ.exec())

    if (infer[0] && infer[0].inference) {
      page.inference = infer[0].inference
    }
    return page
  })
  return Promise.all(pages)
}

/** get titles of pages which do not have mondovo search history matching yet 
 *
 */
async function getPagesByEmptySearchHabits () {

  // get pages which have not been assessed for matches on mondovo yet
  let query2 = ttDb.select()
    .from(Pages)
    .where(Pages.search_habits.isNull())

  let pages = await query2.exec()
  let array_full = []

  for (let page of pages) {
    array_full.push(page['title'].toLowerCase().replace(/[+=]/g, ""))
  }

  let to_ret = []
  let success = []

  var array_part = Object.keys(keywordData2)
  let rx = new RegExp(array_part.join('|'))
  let matches = array_full.filter(w => rx.test(w))
  let matches_cleaned = [...new Set(matches)];
  // console.log(matches_cleaned)

  // of the matches, get page titles and create a list of pages to be updated 
  for (let option of Object.keys(keywordData2)) {
    for (let match of matches_cleaned) {
      if (match.includes(option)) {
        let keyword_category_match = keywordData2[option]
        // console.log("keyword category   ", keyword_category_match)
        // console.log("long string keyword match   ",option)
        // console.log("title of searched pages matched   ",match)
        for (let page of pages) {
          if (page['title'].toLowerCase().replace(/[+=]/g, "") == match) {

            if (success.includes(page.id)) {
              for (let obj of to_ret) {
                if (obj.pageId == page.id) {
                  let curr = obj.search_habits 
                  curr.push([option, keyword_category_match])
                }
              }
            } else {
              let info = {'search_habits': [[option, keyword_category_match]], 'pageId': page.id, 'title': page.title, 'domain': page.domain, 'hostname': page.hostname, 'path': page.path, 'protocol': page.protocol, 'activity_events': page.activity_events}
              to_ret.push(info)
              success.push(page.id)
            }

          }
        }
      }
    }
  }

  // mark rest of the pages as viewed before
  for (let page of pages) {
    if (!success.includes(page.id)) {
      let info = {'search_habits': [], 'pageId': page.id, 'title': page.title, 'domain': page.domain, 'hostname': page.hostname, 'path': page.path, 'protocol': page.protocol, 'activity_events': page.activity_events}
      to_ret.push(info)
    }
  }


  return to_ret
}


/** get pages by domain, fuzzy matching with .includes()
 *
 * @param  {Object} args - arguments object
 * @param  {number} args.domain - domain
 * @param  {number} [args.count] - number of entries to return
 */
async function getPagesByDomain_fuzzy (args) {
  if (!args.domain) {
    throw new Error('Insufficient args provided for query (getPagesByDomain_fuzzy)')
  }

  let query = ttDb.select()
    .from(Pages)

  query = args.count ? query.limit(args.count) : query
  query = query.orderBy(Pages.id, lf.Order.DESC)
  let pages = await query.exec()

  // fuzzy matching with includes
  let temp = []
  for (let entry of pages) {
    if (entry.domain.includes(args.domain)) {
      temp.push(entry)
    }
  }
  pages = temp

  pages = pages.map(async (page) => {
    page.url = makeURL(page)

    let inferQ = ttDb.select(Inferences.inference)
      .from(Inferences)
      .where(Inferences.pageId.eq(page.id))
    let infer = (await inferQ.exec())

    if (infer[0] && infer[0].inference) {
      page.inference = infer[0].inference
    }
    return page
  })
  return Promise.all(pages)
}



/** get pages by inference
 *
 * @param  {Object} args - arguments object
 * @param  {number} args.inference - inference
 * @param  {number} [args.count] - number of entries to return
 */
async function getPagesByInference (args) {
  if (!args.inference) {
    throw new Error('Insufficient args provided for query (getPagesByInference)')
  }

  let query = ttDb.select(Pages.id, Pages.title, Pages.domain, Pages.hostname, Pages.path, Pages.protocol)
    .from(Pages, Inferences)
    .where(lf.op.and(
      Inferences.pageId.eq(Pages.id),
      Inferences.inference.eq(args.inference)
    ))
  query = args.count ? query.limit(args.count) : query
  query = query.orderBy(Pages.id, lf.Order.DESC)
  let pages = await query.exec()

  pages = pages.map(async (p) => {
    let page = p.Pages
    page.url = makeURL(page)

    return page
  })
  return Promise.all(pages)
}

/** get pages by time window- needs both start and end times
 *
 * @param  {Object} args - arguments object
 * @param  {number} args.startTime - time start window
 * @param  {number} args.endTime - time end window
 * @param  {number} [args.count] - number of entries to return
 */
async function getPagesByTime (args) {
  if (!args.startTime) {
    args.startTime = (new Date('January 1 2018')).getTime()
  }
  if (!args.endTime) {
    args.endTime = Date.now()
  }
  let noInferences = await getPagesNoInferences(args)
  noInferences = noInferences.map(x => x.Pages)

  let query = ttDb.select(Pages.title, Pages.id, Pages.domain, Inferences.inference)
    .from(Pages, Inferences)
  query = (args.startTime && args.endTime)
    ? query.where(lf.op.and(
      lf.op.and(
        Pages.id.gte(args.startTime),
        Pages.id.lte(args.endTime)),
      Inferences.pageId.eq(Pages.id)))
    : query
  query = args.count ? query.limit(args.count) : query
  query = query.orderBy(Pages.id, lf.Order.DESC)
  let withInferences = await query.exec()
  withInferences = withInferences.map(x => ({
    ...x.Pages,
    inference: x.Inferences.inference
  }))
  let combined = noInferences
    .concat(withInferences)
    .sort(function (a, b) {
      return b['id'] - a['id']
    })

  const rv = args.count ? combined.slice(0, args.count) : combined
  return rv
}


/** get pages by time window - default is all times, not time slice
 *
 * @param  {Object} args - arguments object
 * @param  {number} args.startTime - time start window
 * @param  {number} args.endTime - time end window
 * @param  {number} [args.count] - number of entries to return
 */
async function getPagesByTime_bedtime (args) {

  let cut_off_for_optimize_threshold = DO_OPTIMIZATIONS ? 1000000 : 50

  let start = performance.now();
  let end;

  if (!args.startTime) {
    args.startTime = (new Date('January 1 2018')).getTime()
  }
  if (!args.endTime) {
    args.endTime = Date.now()
  }
  let noInferences = await getPagesNoInferences(args)
  noInferences = noInferences.map(x => x.Pages)

  let query = ttDb.select(Pages.title, Pages.id, Pages.domain, Inferences.inference)
    .from(Pages, Inferences)
  query = (args.startTime && args.endTime)
    ? query.where(lf.op.and(
      lf.op.and(
        Pages.id.gte(args.startTime),
        Pages.id.lte(args.endTime)),
      Inferences.pageId.eq(Pages.id)))
    : query
  query = args.count ? query.limit(args.count) : query
  query = query.orderBy(Pages.id, lf.Order.DESC)
  let withInferences = await query.exec()
  withInferences = withInferences.map(x => ({
    ...x.Pages,
    inference: x.Inferences.inference
  }))
  // let combined = noInferences 
  //   .concat(withInferences)
  //   .sort(function (a, b) {
  //     return b['id'] - a['id']
  //   })

  let optimize_it = false
  if (withInferences.length >= cut_off_for_optimize_threshold) {
    optimize_it = true
  }

  end = performance.now();
  console.log("intro queries", end-start)
  let ret = []
  let seen_it = []
  let latest_nights = []
  let logged_late_night = []
  const window_reach_back = 6 // within how many hours should you not consider this datapoint
  for (let entry of withInferences) {
    if (!seen_it.includes(entry.id)) {

      let this_entry = new Date(entry.id).getHours()
      let this_minutes = new Date(entry.id).getMinutes()
      // later than 6PM
      if (this_entry >= 18) {
        //keep it
        // ret.push([entry.id, this_entry, {"title": entry.title}, {"domain": entry.domain}, {"inference": entry.inference}])
        ret.push([entry.id, parseFloat(String(this_entry) + "." + String( ((this_minutes / 60) * 10)  )), {"title": entry.title}, {"domain": entry.domain}, {"inference": entry.inference}])

        // (((optimize))) 
        if (optimize_it == false) {
          // this added a late night averages bar, but was incredibly slow
          // don't consider any time from today
          // because of day switch at midnight, consider the last 12 hours to be today
          // let rightNow = moment().format("YYYY-MM-DD HH:mm:ss");
          let hours_ago = moment().subtract(12, 'hours').format("YYYY-MM-DD HH:mm:ss");
          let earlier_time = moment(entry.id).format('YYYY-MM-DD HH:mm:ss')
          if (moment(earlier_time).isBefore(hours_ago))   {
          
            // get all of the same day as entry.id
            // get the latest timestamp in that set 
            let target_slice = entry.id 
            let same_day_days = []
            let next_day_is_early = false;
            // should be a better datastructure for faster lookup
            for (let day of withInferences) {
              // if day.id has same day as target_slice 
              // and the next day doesn't have any time before 5AM
              let within_same_day = String(moment(target_slice).format('D')) == String(moment(day.id).format('D'))
              for (let next_day of withInferences) {
                let is_next_day = String(moment(target_slice).add(1,'days').format('D')) == String(moment(next_day.id).format('D'))
                if (is_next_day) {
                  let next_day_hour = String(moment(next_day.id).format('HH'))
                  let next_day_minute = String(moment(next_day.id).format('mm'))
                  if (parseInt(next_day_hour) <= "04" || (next_day_hour == "05" && next_day_minute == '00')) {
                    next_day_is_early = true;
                  }
                }
              }
              if (within_same_day && !next_day_is_early) {
                same_day_days.push(day.id)
                break;
              }
            }
            // same_day_days.sort((dateA, dateB) => dateA - dateB)
            if (same_day_days[0] != null) {
              if (!logged_late_night.includes(same_day_days[0])) {
          
                let hours = String(moment(same_day_days[0]).format('HH'))
                let minutes = String(moment(same_day_days[0]).format('mm'))
          
                let temp_store = new Object()
                temp_store[same_day_days[0]] =  parseFloat(hours + "." + minutes)
          
                latest_nights.push( temp_store )
                logged_late_night.push(same_day_days[0])
              } 
            }
          
          } 
        }

        
      }
      // original was 5AM, but seems too early, and is possible wake up time 
      if (this_entry <= 4) {
        //keep it and add 24
        ret.push([entry.id, parseFloat(String(this_entry+24) + "." + String( ((this_minutes / 60) * 10)  )), {"title": entry.title}, {"domain": entry.domain}, {"inference": entry.inference}])
      
        if (optimize_it == false) {
          // don't consider any time from today
          let hours_ago = moment().subtract(12, 'hours').format("YYYY-MM-DD HH:mm:ss");
          let earlier_time = moment(entry.id).format('YYYY-MM-DD HH:mm:ss')
          if (moment(earlier_time).isBefore(hours_ago)) {
            // get all of this day as entry.id within that 5AM slice 
            // out of all those days with times less than 5
            // get the one that is closest to 5
            let target_slice = entry.id 
            let same_day_days = []
            for (let day of withInferences) {
              // if day.id has same day as target_slice 
              // and the next day doesn't have any time before 5AM
              let within_same_day = String(moment(target_slice).format('D')) == String(moment(day.id).format('D'))
              let hours = String(parseInt(moment(day.id).format('HH')))
              let minutes = String(moment(day.id).format('mm'))
              let is_early = ( parseInt(hours) <= "04" || (hours == "05" && minutes == '00') )
              if (within_same_day && is_early) {
                same_day_days.push(day.id)
                // break;
              }
            }
            // same_day_days.sort((dateA, dateB) => dateA - dateB)
            if (same_day_days[0] != null) {
              if (!logged_late_night.includes(same_day_days[0])) {
          
                let hours = String(parseInt(moment(same_day_days[0]).format('HH')) + 24)
                let minutes = String(moment(same_day_days[0]).format('mm'))
          
                let temp_store = new Object()
                temp_store[same_day_days[0]] =  parseFloat(hours + "." + minutes)
          
                latest_nights.push( temp_store )
                logged_late_night.push(same_day_days[0])
              } 
            }
          } 
        }
      }

      seen_it.push(entry.id)
    }
  }

  if (optimize_it == false) {
    let temp_a = []
    for (let peaks of latest_nights) {
      temp_a.push(Object.values(peaks)[0])
    }

    let latest_nights_average;
    const average = (array) => array.reduce((a, b) => a + b) / array.length
    if (temp_a.length >= 1) {
      latest_nights_average = average(temp_a)
    }

    let test = []
    for (let specials of latest_nights) {
      let target = Object.keys(specials)
      let index = 0
      for (let alls of ret) {
        let checker = alls[0]
        if (String(checker) == target) {
          let old_object = ret[index]
          old_object.push({peak: latest_nights_average})
          ret[index] = old_object
        }
        index += 1
      }
    }
  }

  return ret 
  // return ret

  // const rv = args.count ? combined.slice(0, args.count) : combined
  // return rv
}

/** get pages by time window - default is all times, not time slice
 *
 * @param  {Object} args - arguments object
 * @param  {number} args.startTime - time start window
 * @param  {number} args.endTime - time end window
 * @param  {number} [args.count] - number of entries to return
 */
async function getPagesByTime_bedtime_version2 (args) {
  // let one = {'one': 'two'}
  return (one['two']) // this will throw an error
  if (!args.startTime) {
    args.startTime = (new Date('January 1 2018')).getTime()
  }
  if (!args.endTime) {
    args.endTime = Date.now()
  }
  let noInferences = await getPagesNoInferences(args)
  noInferences = noInferences.map(x => x.Pages)

  let query = ttDb.select(Pages.title, Pages.id, Pages.domain, Inferences.inference)
    .from(Pages, Inferences)
  query = (args.startTime && args.endTime)
    ? query.where(lf.op.and(
      lf.op.and(
        Pages.id.gte(args.startTime),
        Pages.id.lte(args.endTime)),
      Inferences.pageId.eq(Pages.id)))
    : query
  query = args.count ? query.limit(args.count) : query
  query = query.orderBy(Pages.id, lf.Order.DESC)
  let withInferences = await query.exec()
  withInferences = withInferences.map(x => ({
    ...x.Pages,
    inference: x.Inferences.inference
  }))
  // let combined = noInferences 
  //   .concat(withInferences)
  //   .sort(function (a, b) {
  //     return b['id'] - a['id']
  //   })


  function toMs(timeUnformatted) {
    timeUnformatted = timeUnformatted < 10 ? ("0" + timeUnformatted) : timeUnformatted.toString();
    console.log(timeUnformatted)
    return Date.parse("1/1/1 " + timeUnformatted.replace(".", ":") + ":00") - Date.parse("1/1/1 00:00:00");
  }

  let ret = []
  let seen_it = []
  let data_low = []
  let data_high = []
  let late_night_average = 86280000
  let all_times_unique = []
  for (let entry of withInferences) {
    if (!seen_it.includes(entry.id)) {

      let this_hours = new Date(entry.id).getHours()
      let this_minutes = new Date(entry.id).getMinutes()

      all_times_unique.push(entry.id)

      // later than 6PM
      if (this_hours >= 18) {
        //keep it
        // ret.push([entry.id, this_entry, {"title": entry.title}, {"domain": entry.domain}, {"inference": entry.inference}])
        data_low.push ([entry.id, toMs(parseFloat( (String(this_hours) + "." + String(this_minutes) ))), {"title": entry.title}, {"domain": entry.domain}, {"inference": entry.inference}])
        data_high.push([entry.id, null, null, null, null])

      } 
      if (this_hours <= 5) {
        //keep it and add 24
        data_high.push([entry.id, toMs(parseFloat( (String(this_hours) + "." + String(this_minutes) ))), {"title": entry.title}, {"domain": entry.domain}, {"inference": entry.inference}])
        data_low.push([entry.id, 86280000, {"title": entry.title}, {"domain": entry.domain}, {"inference": entry.inference}])
      }

      seen_it.push(entry.id)
    }
  }

  let to_ret = [{
    yAxis: 0,
    data: data_high,
    marker: {
            symbol: 'circle'
        },
    zones: [{
            value: 79200000, //all
            color: 'black'
        },]
  },{
    yAxis: 1,
    data: data_low,
    marker: {
            symbol: 'circle'
        },
    zones: [{
            value: 79200000, //10
            color: 'black'
        },{
            value: 86220000, // almost midnight
            color: 'black'
        }, {
            value: 86340000, // has to match above
            color: 'black'
        }, ]
  }, {"latest_nights": late_night_average}]


  var groups = _.groupBy(all_times_unique, function (date) {
    return moment(date).startOf('day').format();
  });

  var as_list = Object.keys(groups).map((key) => [key, groups[key]]);

  let latest_times = []

  let days = []
  for (let i = 0; i < as_list.length; i++) {
    let single_day = as_list[i]
    let header = single_day[0]
    let timestamps = single_day[1]
    let temp = []
    let prev_day;

    try {
      prev_day = as_list[i-1][1][0]

    } catch (error) {
      prev_day = "none" // not yesterday
    }


//////////////////////////////////////////////////////////////////////////////////////// missing regualr days that end late (((like just 10PM days)))


    for (let entry of timestamps) {


      let this_day_of_month = moment(entry).format('D')
      let prev_day_of_month = moment(entry).add(-1,'days').format('D')
      let yesterday_data_exists = (moment(entry).add(1,'days').format('D') == moment(prev_day).format('D'))


      // TODO only the infernece not the title of the


      // if the previous day exists
      // check if that day had any timestamps before 5AM
      // if yes, grab the last one (latest time of the slice before 5AM) and call it this day's latest time
      // if no, do nothing
      let temp_late_times = []
      if (yesterday_data_exists) {
        let yesterday_timestamps = as_list[i-1][1]
        for (let yest of yesterday_timestamps) {
          // let full_time = moment(yest, "YYYY-MM-DD HH:mm:ss")
          // var currentHours = full_time.format("HH")
          // if (currentHours <= 5 && ) {
          //   // latest_times.push(yest)
          //   latest_times.push(String(moment(yest).format("dddd, MMMM Do YYYY, h:mm:ss a")))
          // }
          let current_time_hours = String(moment(yest).format("HH"))
          let cutoff_time_hours = "04"
          let current_time_minutes = String(moment(yest).format("mm"))

          let hours_earlier = (current_time_hours <= cutoff_time_hours) || (current_time_hours == "05" && current_time_minutes == "00")
          if (hours_earlier) {
            temp_late_times.push(yest)
            // latest_times.push(String(moment(yest).format("dddd, MMMM Do YYYY, h:mm:ss a")))
          }
        }
      }
      let last_one = temp_late_times.map(function(e) { return e; }).sort().reverse()[0]
      latest_times.push(String(moment(last_one).format("hh:mm:ss a")))
      break;

      // if no previous day 
      // grab the last time in the day (latest), closest to midnight
      if (!yesterday_data_exists) {
        // we are currently on this day
        // latest_times.push(timestamps[0])
        latest_times.push(String(moment(timestamps[0]).format("hh:mm:ss a")))
        break; // no need to log other times, we know first time is latest
      }


      temp.push( "this_day_is " + String(moment(entry).format('dddd')) + "--" + "previous day is " + String(moment(entry).add(-1,'days').format('D')) + "--" + "and that day exists?   ==>" + (moment(entry).add(1,'days').format('D') == moment(prev_day).format('D')) + "<==" + "--" + String(moment(entry).format("dddd, MMMM Do YYYY, h:mm:ss a")))
    }
    days.push(temp)
  }

  return to_ret

  // const rv = args.count ? combined.slice(0, args.count) : combined
  // return rv
}

/** get pages by tracker
 *
 * @param  {Object} args - arguments object
 * @param  {number} args.tracker - tracker
 * @param  {number} [args.count] - number of entries to return
 */
async function getPagesByTracker (args) {
  if (!args.tracker) {
    throw new Error('Insufficient args provided for query (getPagesByTracker)')
  }

  let query = ttDb.select(Pages.id, Pages.title, Pages.domain, Pages.hostname, Pages.path, Pages.protocol)
    .from(Pages, Trackers)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Trackers.tracker.eq(args.tracker)
    ))
  query = args.count ? query.limit(args.count) : query
  query = query.orderBy(Pages.id, lf.Order.DESC)
  let pages = await query.exec()

  pages = pages.map(async (p) => {
    let page = p.Pages
    page.url = makeURL(page)

    let inferQ = ttDb.select(Inferences.inference)
      .from(Inferences)
      .where(Inferences.pageId.eq(page.id))
    let infer = (await inferQ.exec())

    if (infer[0] && infer[0].inference) {
      page.inference = infer[0].inference
    }
    return page
  })
  return Promise.all(pages)
}

/** get all google search pages
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 */
async function getSearchPages (args) {
  let query = ttDb.select(Pages.title,Pages.id)
    .from(Pages)
    .where(Pages.title.match("Google Search"))

  query = args.count ? query.limit(args.count) : query
  query = query.orderBy(Pages.id, lf.Order.DESC)
  return query.exec()
}

/** get pages where title contains topic
 *
 * @param  {Object} args - arguments object
 * @param {string[]} [args.topics] - array of topics to match
 * @param {string[]} [args.excluded] - array of topics to exclude
 * @param  {number} [args.count] - number of entries to return
 */
async function getTopicPages (args) {
  let topicRegex = args.topics ? args.topics.join('|') : ''
  let excludeRegex = args.excluded ? args.excluded.join('|') : ''
  //let reg = new RegExp(`^(?!.*( - Google *)).*(${topicRegex}).*$`,'i'); // (?!.*${excludeRegex})
  let reg = args.excluded ? new RegExp(`^(?!.*${excludeRegex}).*(${topicRegex})(?!.*( - Google *)).*$`,'i')
                          : new RegExp(`^.*(${topicRegex})(?!.*( - Google *)).*$`,'i');
  let query = ttDb.select(Pages.id, Pages.title, Pages.domain, lf.fn.count(Trackers.tracker))
    .from(Pages)
    .leftOuterJoin(Trackers, Pages.id.eq(Trackers.pageId))
    .where(Pages.title.match(reg))
    .groupBy(Pages.id)

  query = args.count ? query.limit(args.count) : query
  query = query.orderBy(Pages.id, lf.Order.DESC)
  return query.exec()

}

/** get pages where title contains topic, Google Search pages only
 *
 * @param  {Object} args - arguments object
 * @param {string[]} [args.topics] - array of topics to match
 * @param {string[]} [args.excluded] - array of topics to exclude
 * @param  {number} [args.count] - number of entries to return
 */
async function getTopicSearchPages (args) {
  let topicRegex = args.topics ? args.topics.join('|') : ''//${topicRegex}
  let excludeRegex = args.excluded ? args.excluded.join('|') : ''
  let reg = args.excluded ? new RegExp(`^(?!.*${excludeRegex})(.*(${topicRegex})).(?=.*- Google Search).*$`,'i')
                          : new RegExp(`^(.*(${topicRegex})).(?=.*- Google Search).*$`,'i');
  let query = ttDb.select(Pages.title,Pages.id)
    .from(Pages)
    .where(Pages.title.match(reg))

  query = args.count ? query.limit(args.count) : query
  query = query.orderBy(Pages.id, lf.Order.DESC)
  return query.exec()
}

/** helper function for making sure we have all page search habits information
 *
 * @returns updates all pages in DB without search habit info
 */
async function update_search_habits() {
  // clean up the stragglers that were missed in the every-5 run of this function
  console.log("[-] attempting search habits title update list")
  let to_update = await getPagesByEmptySearchHabits()

  for (let item of to_update){
    // console.log(item)
    var waiter = await store.updatePage_search_habits(item)
  }
  console.log("[+] DONE -- attempting search habits title update list")
}

/** get pages where title contains topic of interest
 *
 * @param  {Object} args - arguments object
 * @returns {Object[]} pageIds of interesting topics and associated information
 */
async function getTopicsOfInterest (args) {

  var waiter = await update_search_habits()
  let pages_of_interest = await getPagesWithSearchHabits()
  // console.log("pages of interest", pages_of_interest)
  if (pages_of_interest.length == 0) {
    return []
  }
  let array_full__2 = []
  let time_series_data_all__2 = new Array()
  let total_time__2 = 0
  for (let page of pages_of_interest) {

    for (let i = 0; i < pages_of_interest.length; i++) {
      let result = [];
      let overall_page_time = pages_of_interest[i]['activity_events'][pages_of_interest[i]['activity_events'].length-1].overall_time 
      // let arr = pages_of_interest[i]['activity_events']; // activity as array for each page 
      // arr.forEach((x,y,z) => !(y % 2) ? result.push(z.slice(y, y + 2)) : '');
      // // start      // add 
      // // stop 

      // // start      // add
      // // stop 
      // ///////////////////////
      //               // totals 

      // let overall_page_time = 0
      // for (let p = 0; p < Object.keys(result).length; p++) {

      //   let single_slice = result[p]

      //   // the last event has no pair becuase exit or focus repeats (do not consider it)
      //   // this will also catch the situation where a page is currently being visited and has no history, which should be ignored
      //   if (Object.keys(single_slice).length !== 1) {

      //     let start; 
      //     let end; 

      //     if (Object.keys(single_slice[0]) == 'start') {
      //       start = single_slice[0]['start']
      //       end = single_slice[1]['value']
      //     }
      //     else {
      //       start = single_slice[0]['value']
      //       end = single_slice[1]['value']
      //     }

      //     // count is milliseconds
      //     overall_page_time += (end-start)
          
      //   }
      // }
      if (overall_page_time != 0) {
        time_series_data_all__2.push({domain: pages_of_interest[i]['domain'], pageId: pages_of_interest[i]['id'], title: pages_of_interest[i]['title'], search_habits: pages_of_interest[i]['search_habits'], count: overall_page_time})
        total_time__2 += overall_page_time
        if (!pages_of_interest[i]['title'].includes('http')) {
          array_full__2.push(pages_of_interest[i]['title'].toLowerCase().replace(/[+=]/g, ""))
        }
      }

    } 

    // let startTime = performance.now()
    // let endTime;
  }
  // console.log("new array full    ", array_full__2)
  // console.log("new time series data    ",time_series_data_all__2)

  // // new optimize 
  // // new optimize 
  // // new optimize 
  // // new optimize 


  // ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 
  // ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 
  // ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 
  // ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 
  // let startTime = performance.now()
  // let array_full = []

  // // get each page, the page inference, and the time spent on the page 
  // let query = ttDb.select(Inferences.inference, Inferences.pageId, Inferences.id, Pages.activity_events, Pages.title, Pages.domain)
  //   .from(Pages)
  //   .innerJoin(Inferences, Inferences.pageId.eq(Pages.id))



  // // re-format time from UNIX to date (YMD) and time (hour,minute,second)
  // let time_series_data = new Array()
  // let time_series_data_all = new Array()


  // const inferenceQuery = await query.exec()
  // let seen_it = []
  // let total_time = 0
  // let seen_it_same_inference = new Object()

  // let endTime = performance.now()
  // console.log('get query.  ', endTime - startTime)


  // // console.log(inferenceQuery)
  // if (inferenceQuery.length == 0) {
  //   return inferenceQuery
  // }


  // // get time series data
  // for (let i = 0; i < inferenceQuery.length; i++) {

  //   // get sequence of time events as length of time on page
  //   // start 
  //   // focus (means stop)
  //   // focus (means start)
  //   // focus (stop)
  //   // focus (start)
  //   let result = [];
  //   let arr = inferenceQuery[i]['Pages']['activity_events']; // activity as array for each page 
  //   arr.forEach((x,y,z) => !(y % 2) ? result.push(z.slice(y, y + 2)) : '');

  //   // start      // add 
  //   // stop 

  //   // start      // add
  //   // stop 
  //   ///////////////////////
  //                 // totals 

  //   let overall_page_time = 0
  //   for (let p = 0; p < Object.keys(result).length; p++) {

  //     let single_slice = result[p]

  //     // the last event has no pair becuase exit or focus repeats (do not consider it)
  //     // this will also catch the situation where a page is currently being visited and has no history, which should be ignored
  //     if (Object.keys(single_slice).length !== 1) {

  //       let start; 
  //       let end; 

  //       if (Object.keys(single_slice[0]) == 'start') {
  //         start = single_slice[0]['start']
  //         end = single_slice[1]['value']
  //       }
  //       else {
  //         start = single_slice[0]['value']
  //         end = single_slice[1]['value']
  //       }

  //       // count is milliseconds
  //       overall_page_time += (end-start)
        
  //     }



  //   }
  //   // duplicates exist, no need to include them
  //   if (!(inferenceQuery[i]['Inferences']['pageId'] in seen_it_same_inference) && overall_page_time != 0) {
      
  //     // get full path and comfort if exists
  //     let specific_interest = inferenceQuery[i]['Inferences']['inference']
  //     let str;
  //     let comfort;
  //     try {
  //       comfort = comfortData[specific_interest].comfort
  //       let temp = {}
  //       str = ''
  //       let string_size = (comfortData[specific_interest].path.length) -1
  //       let counter = 0
  //       for (let item of comfortData[specific_interest].path) {
  //         if (counter !== string_size) {
  //           let to_log = String(item) + " ⟶ "
  //           str += to_log
  //         } else {
  //           let to_log = String(item) 
  //           str += to_log
  //         }
  //         counter += 1
  //       }
  //     } catch (e) {
  //       if (specific_interest.includes("Sensitive Subjects") || specific_interest.includes("Adult")) {
  //         comfort = -3
  //       }
  //       else {
  //         comfort = 0
  //       }
  //       str = specific_interest
  //     }

  //     time_series_data_all.push({inference: str, comfort: comfort, domain: inferenceQuery[i]['Pages']['domain'], pageId: inferenceQuery[i]['Inferences']['pageId'], title: inferenceQuery[i]['Pages']['title'], count: overall_page_time})
  //     total_time += overall_page_time
  //     seen_it_same_inference[inferenceQuery[i]['Inferences']['pageId']] = inferenceQuery[i]['Inferences']['inference']
  //     if (!inferenceQuery[i]['Pages']['title'].includes('http')) {
  //       array_full.push(inferenceQuery[i]['Pages']['title'].toLowerCase().replace(/[+=]/g, ""))
  //     }
      
  //   }
    
  // }


  // console.log("old array full    ", array_full)
  // console.log("old time series data    ",time_series_data_all)

  // endTime = performance.now()
  // console.log('get all time series data.  ', endTime - startTime)
  // ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 
  // ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 
  // ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 
  // ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 






  // // new optimize
  // // new optimize
  // // new optimize
  // // new optimize
  // let specialCheck_start = performance.now()
  // var array_part = Object.keys(keywordData2)
  // // console.log(array_part)
  // let keepers2 = []
  // let seen_it_entries = {}
  // for (let entry of time_series_data_all) {
  //   let temp2 = {}
  //   temp2['hit_category'] = entry.search_habits[0] 
  //   temp2['hit_keywords'] = entry.search_habits[1] 
  //   temp2['domain'] = entry.domain 
  //   temp2['pageId'] = entry.pageId 
  //   temp2['title'] = entry.title
  //   temp2['count'] = entry.count
  //   keepers2.push(temp2)
  //   if (entry.pageId in seen_it_entries) {
  //     let curr = seen_it_entries[entry.pageId]
  //     curr.push(keyword_category_match)
  //   } else {
  //     seen_it_entries[entry.pageId] = [entry.search_habits[0]]
  //   }
  // }




  ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 
  ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 
  ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 
  ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  /



  // console.log("new array full    ", array_full__2)
  // console.log("new time series data    ",time_series_data_all__2)
  // console.log("-----------------------------------")
  // console.log(time_series_data_all__2)
  // console.log("-----------------------------------")
  let keepers2__2 = []
  let seen_page_id = {}
  for (let entry of time_series_data_all__2) {
    // console.log("new entry loop   ", entry)
    let general_type_category = new Set()
    for (let pack of entry.search_habits[0]) {
      for (let category_matcher of pack) {
        // console.log(category_matcher)
        general_type_category.add(category_matcher[1])
      }
    }
    for (let cat of general_type_category) {

      // console.log("***")
      // console.log(seen_page_id)
      // console.log(entry.pageId)
      // console.log(seen_page_id)
      // console.log(Object.keys(seen_page_id))
      // console.log(entry.pageId in Object.keys(seen_page_id))
      // console.log("have you seen this page ID before:", Object.keys(seen_page_id).includes(entry.pageId))

      // only keey unique category and pageId
      // first time i'm seeing this page
      if (String(entry.pageId) in seen_page_id == false) {
        // console.log("new cat", cat)
        // console.log(entry.domain)
        // console.log(entry.title)
        // console.log(entry.pageId)

        let temp2__2 = {}
        temp2__2['hit_category'] = cat 
        temp2__2['domain'] = entry.domain 
        temp2__2['pageId'] = entry.pageId 
        temp2__2['title'] = entry.title
        temp2__2['count'] = entry.count
        keepers2__2.push(temp2__2)
        seen_page_id[String(entry.pageId)] = [cat]
      } else {
        // console.log("seen this pageId, but checking the list of items associated with pageID")
        let curr = seen_page_id[String(entry.pageId)]
        if (curr.includes(cat)) {
          //do nothing
        } else {
          let temp2__2 = {}
          temp2__2['hit_category'] = cat 
          temp2__2['domain'] = entry.domain 
          temp2__2['pageId'] = entry.pageId 
          temp2__2['title'] = entry.title
          temp2__2['count'] = entry.count
          keepers2__2.push(temp2__2)
          curr.push(cat)
          seen_page_id[String(entry.pageId)] = curr
        }
      }

      

    }
  }

  // console.log(keepers2__2)



  // // add column to pages which is mondovo match 
  // // every fifth page visit, update the pages on whether there is a match 
  // let rx = new RegExp(array_part.join('|'))
  // let matches = array_full.filter(w => rx.test(w))
  // let matches_cleaned = [...new Set(matches)];
  // console.log(matches_cleaned)

  // // let matches_cleaned2 = await getPagesTitlesOnlyUniqueWithSearchHabits() // (((optimization)))
  // // console.log(matches_cleaned2)

  // // console.log(matches_cleaned)
  // let keepers2 = []
  // let seen_it_entries = {}
  // for (let option of Object.keys(keywordData2)) {
  //   for (let match of matches_cleaned) {
  //     if (match.includes(option)) {
  //       let keyword_category_match = keywordData2[option]
  //       for (let entry of time_series_data_all) {
  //         if (entry.title.toLowerCase() == match) {
  //           let do_it_anyways = false
  //           if (entry.pageId in seen_it_entries) {
  //             let curr = seen_it_entries[entry.pageId]
  //             if (curr.includes(keyword_category_match)) {
  //               do_it_anyways = false 
  //             } else {
  //               do_it_anyways = true
  //             }
  //           } else {
  //             do_it_anyways = true
  //           }
  //           if (do_it_anyways) {
  //             let temp2 = {}
  //             temp2['hit_category'] = keyword_category_match 
  //             temp2['hit_keywords'] = option
  //             temp2['inference'] = entry.inference 
  //             temp2['comfort'] = entry.comfort 
  //             temp2['domain'] = entry.domain 
  //             temp2['pageId'] = entry.pageId 
  //             temp2['title'] = entry.title
  //             temp2['count'] = entry.count
  //             keepers2.push(temp2)
  //             if (entry.pageId in seen_it_entries) {
  //               let curr = seen_it_entries[entry.pageId]
  //               curr.push(keyword_category_match)
  //             } else {
  //               seen_it_entries[entry.pageId] = [keyword_category_match]
  //             }
  //           }
  //         }
  //       } 
  //     }
  //   }
  // }
  // ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 
  // ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 
  // ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 
  // ////////////////////////////////////////////////////////// / / / / / / ///     // / / / /    / /   //  / 


  // console.log("OLD-->", keepers2)
  // console.log("NEW-->", keepers2__2)
  // let specialCheck_end = performance.now()
  // console.log('special check  ', specialCheck_end - specialCheck_start)
  // // console.log(matches_cleaned)

  // //------------------------------------------------------------------------------------- (((optimize)))
  // ////////////////////////////////////// using full list previously created, look at each entry and do a mondovo lookup each time 
  // // get keywords from mondovo scrape  
  // let job_words = ["job"]
  // let relationship_words = ['relationship','partner','dating','boyfriend','girlfriend','love','soulmate']

  // let sanity = []
  // let keepers = []

  // for (let entry of time_series_data_all) {

  //   // // optimize (((doesn't work becuase we need substring matching)))
  //   // let hit_category = []
  //   // let hit_keywords = []
  //   // if (entry['title'].toLowerCase() in keywordData2) { 
  //   //   hit_category.push(keywordData2[entry['title'].toLowerCase()] )       
  //   //   hit_keywords.push(entry['title'].toLowerCase())
  //   //   let temp2 = {}
  //   //   temp2['hit_category'] = keywordData2[entry['title'].toLowerCase()]
  //   //   temp2['hit_keywords'] = hit_keywords
  //   //   temp2['inference'] = entry.inference 
  //   //   temp2['comfort'] = entry.comfort 
  //   //   temp2['domain'] = entry.domain 
  //   //   temp2['pageId'] = entry.pageId 
  //   //   temp2['title'] = entry.title
  //   //   temp2['count'] = entry.count
  //   //   keepers.push(temp2)
  //   // }

  //   for (let option of Object.keys(keywordData)) {

  //     if (option != "Most Searched Words on Google") {

  //       let list = keywordData[option]
  //       let hit_category = []
  //       let exists_inference = false
  //       let exists_title = false
  //       let hit_keywords = []
  //       for (let keyword of list) {
  //         // leads to too many matches
  //         // if (entry['inference'].toLowerCase().includes(keyword.toLowerCase())) {
  //         //   exists_inference = true 
  //         //   if (!hit_category.includes(option)) {
  //         //     hit_category.push(option)
  //         //   }
  //         //   hit_keywords.push(keyword)
  //         // }

  //         if (entry['title'].toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
  //         // if (entry['title'].toLowerCase().includes(keyword.toLowerCase())) {
  //           exists_title= true 
  //           // if (!hit_category.includes(option)) {
  //           //   hit_category.push(option)
  //           // }   
  //           hit_category.push(option)       
  //           hit_keywords.push(keyword)
  //         }
  //       }

  //       // let exists_inference = list.some(word => entry['inference'].toLowerCase().includes(word))
  //       // let exists_title = list.some(word => entry['title'].toLowerCase().includes(word))
  //       if (exists_title) {
  //         // let temp = entry 
  //         // temp['hit_category'] = option
  //         // temp['hit_keywords'] = hit_keywords
  //         // get_keyword_matches.push(entry)

  //         let temp2 = {}
  //         temp2['hit_category'] = option 
  //         temp2['hit_keywords'] = hit_keywords
  //         temp2['inference'] = entry.inference 
  //         temp2['comfort'] = entry.comfort 
  //         temp2['domain'] = entry.domain 
  //         temp2['pageId'] = entry.pageId 
  //         temp2['title'] = entry.title
  //         temp2['count'] = entry.count
  //         keepers.push(temp2)
  //       }

  //     }
  //   }

  // }
  // //------------------------------------------------------------------------------------- (((optimize)))


  let keepers2 = keepers2__2

  // endTime = performance.now()
  // console.log('check substrings against monodovo  ', endTime - startTime)

  // group the matches on keywords according to categories (which may be multiple, so double counting on different cats is ok)
  let grouped = keepers2.reduce(function (r, a) {
      r[a.hit_category] = r[a.hit_category] || [];
      r[a.hit_category].push(a);
      return r;
  }, Object.create(null));


  // get category and time aggregate of category
  let time_grouped = []
  for (let key of Object.keys(grouped)) {
    let temp = {}
    temp['name'] = key 
    let count = 0
    let list_of_entries = grouped[key]
    let times = groupByTime(list_of_entries, 'pageId', 'day')
    time_grouped.push(times)
  }


  // // get first day and last day for x axis (to show peaks of activity over time)
  let args_for_pages = {}
  let first_and_last_list = await getPagesByTime(args_for_pages)
  let most_recent = first_and_last_list[0].id
  let oldest = first_and_last_list[first_and_last_list.length-1].id
  let both = [{id: oldest}, {id: most_recent}]
  let tester = groupByTime(both, 'id', 'day')

  let asInt_first;
  let asInt_second
  let first; 
  let second;
  let days_between;
  let first_flag;

  if (Object.keys(tester).length == 1) {
    // there is only one day of timeStamps
    // each hit-category needs to share timestamps 
    // for each timestamp, the hit categories determine the time aggregation 
    // first is oldest; last is newest 
    first_flag = true

    asInt_first = parseInt(Object.keys(tester)[0])
    asInt_second = parseInt(Object.keys(tester)[0])

    first = moment(asInt_first) // older
    second = moment(asInt_second) // sooner

    days_between = 1
  } else {
    // each hit-category needs to share timestamps 
    // for each timestamp, the hit categories determine the time aggregation 
    // first is oldest; last is newest 

    asInt_first = parseInt(Object.keys(tester)[0])
    asInt_second = parseInt(Object.keys(tester)[1])

    first = moment(asInt_first) // older
    second = moment(asInt_second) // sooner

    days_between = Math.abs(first.diff(second, 'days')) 
  }

  // endTime = performance.now()
  // console.log('misc. after monodovo  ', endTime - startTime)


  let ret = []
  for (let i = 0; i <= days_between; i ++) {

    if (first_flag && i == 1) {
      break;
    }

    let current = moment(first).add(i, 'days')
    let current_as_string = String(moment(current).unix()) + "000"
    let all_types = Object.keys(grouped)
    
    for (let obj of time_grouped) {
      //console.log("matching on " + current_as_string + " with obj ===>" + JSON.stringify(obj))
      //console.log(obj)
      for (let k = 0; k < Object.keys(obj).length; k++) {
        let this_one = Object.keys(obj)[k]
        if (this_one == current_as_string) {
          let list_of_entries_under_type = obj[this_one]
          let count = 0
          let singular = []
          let cat;
          let hit_keywords = []; 
          let inference; 
          let comfort = []; 
          let domain = []; 
          let pageId = []; 
          let title = []; 
          let count_time;
          for (let e of list_of_entries_under_type) {
            // console.log(e)
            count += e.count
            cat = e.hit_category
            hit_keywords.push(e.hit_keywords)
            inference = e.inference
            comfort.push(e.comfort)
            domain.push(e.domain)
            pageId.push(e.pageId)
            title.push(e.title)
            count_time = e.count
          }
          singular.push(parseInt(current_as_string))
          singular.push(count)
          singular.push(hit_keywords)
          singular.push(inference)
          singular.push(comfort)
          singular.push(domain)
          singular.push(pageId)
          singular.push(title)
          singular.push(count_time)
          singular.push(cat)
          ret.push(singular)       
          all_types = all_types.filter(item => item !== cat)
        }

      }
      
    }
    for (let type_leftOver of all_types) {
      let singular = []
      singular.push(parseInt(current_as_string))
      singular.push(0)
      singular.push(type_leftOver)
      ret.push(singular)  
    }

    // ret.push(String(moment(current).unix()))
  }
  // ret.push(String(moment(second).unix()))


  let to_ret = []
  let series = Object.keys(grouped)
  for (let name of series) {
    to_ret.push({name: name, data: []})
  }

  for (let point of ret) {

    let len = point.length 
    let cat = point[len-1]

    for (let obj of to_ret) {
      if (obj.name == cat) {
        let current = obj.data 
        current.push(point)
      }
    }

  }

  // endTime = performance.now()
  // console.log('highcharts organization  ', endTime - startTime)

  return (to_ret)
}



/**
 * page visit count by tracker (i.e. TRACKERNAME knows # sites you have visited)
 *
 * @param {any} args
 * @returns {Object[]} trackers, with count of page visits
 */
async function getPageVisitCountByTracker (args) {
  let query = await ttDb.select(lf.fn.count(Pages.domain))
    .from(Pages, Trackers)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Trackers.tracker.eq(args.tracker)
    ))
    .exec()
  return query[0].Pages['COUNT(domain)']
}

/**
 * pages with valid search habit info
 *
 * @returns {Object[]} pages with search habit info else nothing
 */
async function getPagesWithSearchHabits () {
  let query = ttDb.select(Pages.id, Pages.title, Pages.domain, Pages.hostname, Pages.path, Pages.protocol, Pages.search_habits, Pages.activity_events)
    .from(Pages)
    .where(Pages.search_habits.isNotNull())
  let pages = await query.exec()
  let to_ret = []
  for (let page of pages) {
    // console.log(page)
    // console.log(page.search_habits)
    // console.log(page.search_habits.length)
    // console.log(page.search_habits[0].length)
    // console.log(page.search_habits[0][0].length)
    if (page.search_habits[0][0].length != 0) {
      to_ret.push(page)
    }
  }
  return to_ret
}

/**
 * pages with valid search habit info
 *
 * @returns {Object[]} pages with search habit info else nothing
 */
async function getPagesTitlesOnlyUniqueWithSearchHabits () {
  
  let title_set = new Set()

  let query = ttDb.select(Pages.id, Pages.title, Pages.domain, Pages.hostname, Pages.path, Pages.protocol, Pages.search_habits)
    .from(Pages)
    .where(Pages.search_habits.isNotNull())

  let pages = await query.exec()

  let applicable_titles = new Set()
  for (let page of pages){
    applicable_titles.add(page.title)
  }

  return Array.from(applicable_titles)
}


/* ================ */
/*   TRACKERS       */
/* ================ */

/** gets all trackers
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 * @returns {Object} query result
 */
async function getTrackers (args) {
  let query = ttDb.select(Trackers.tracker, lf.fn.count(Trackers.tracker))
    .from(Trackers)
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC)
  query = args.count ? query.limit(args.count) : query
  return query.exec()
}

/** get trackers with timestamps
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 * @param  {number} [args.afterDate] - only include trackers after this date,
 *                                     given as an integer for number of milliseconds since 1/1/1970
 * @returns {Object} query result
 */
async function getTrackersByTime (args) {
  let query = ttDb.select(Trackers.tracker, Trackers.pageId)
    .from(Trackers)
    .orderBy(Trackers.pageId, lf.Order.DESC)
  query = args.afterDate ? query.where(Trackers.pageId.gte(args.afterDate)) : query
  query = args.count ? query.limit(args.count) : query
  return query.exec()
}

/** get trackers present on a given domain
 *
 * @param  {Object} args - arguments object
 * @param  {string} args.domain - domain
 * @param  {number} [args.count] - number of entries to return
 * @param  {number} [args.afterDate] - only include page visits after this date,
 *                                     given as an integer for number of milliseconds since 1/1/1970
 * @returns {Object} query result
 */
async function getTrackersByDomain (args) {
  if (!args.domain) {
    throw new Error('Insufficient args provided for query (getTrackersByDomain)')
  }
  let sel = ttDb.select(Trackers.tracker, lf.fn.count(Pages.id))
    .from(Trackers, Pages)
  let where
  if (args.afterDate) {
    where = sel.where(lf.op.and(
      Pages.id.gte(args.afterDate),
      lf.op.and(
        Trackers.pageId.eq(Pages.id),
        Pages.domain.eq(args.domain)
      ))
    )
  } else {
    where = sel.where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Pages.domain.eq(args.domain)
    ))
  }
  let query = where.groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Pages.id), lf.Order.DESC)
  query = args.count ? query.limit(args.count) : query
  const res = await query.exec()
  return res.map(x => ({
    name: x.Trackers['tracker'],
    count: x.Pages['COUNT(id)']
  }))
}

/** get trackers that have made a given inference
 *
 * @param  {Object} args - arguments object
 * @param  {string} args.inference - inference
 * @param  {number} [args.count] - number of entries to return
 * @returns {Object} query result
 */
async function getTrackersByInference (args) {
  if (!args.inference) {
    throw new Error('Insufficient args provided for query (getTrackersByInference)')
  }
  let query = ttDb.select(Trackers.tracker, lf.fn.count(Trackers.tracker))
    .from(Trackers, Inferences)
    .where(lf.op.and(
      Trackers.pageId.eq(Inferences.pageId),
      Inferences.inference.eq(args.inference)
    ))
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC)
  query = args.count ? query.limit(args.count) : query
  const res = await query.exec()
  return res.map(x => ({
    name: x.Trackers['tracker'],
    count: x.Trackers['COUNT(tracker)']
  }))
}

/** get trackers by pageId
 *
 * @param  {Object} args - arguments object
 * @param  {string} args.inference - inference
 * @param  {number} [args.count] - number of entries to return
 * @returns {Object} query result
 */
async function getTrackersByPageId (args) {
  if (!args.pageId) {
    throw new Error('Insufficient args provided for query (getTrackersByPageId)')
  }
  let query = ttDb.select(Trackers.tracker, Trackers.pageId)
    .from(Trackers)
    .where(lf.op.and(
      Trackers.pageId.eq(args.pageId),
    ))

  const res = await query.exec()
  let unique_trackers = []
  for (let obj of res) {
    let tracker = obj.tracker
    if (!unique_trackers.includes(tracker)) {
      unique_trackers.push(tracker)
    }
  }
  return unique_trackers
}

/** get timestamps of all page visits
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 * @param  {number} [args.afterDate] - only include page visits after this date,
 *                                     given as an integer for number of milliseconds since 1/1/1970
 * @returns {Object} query result
 */
async function getTimestamps (args) {
  let query = ttDb.select(Pages.id)
    .from(Pages)
  query = args.afterDate ? query.where(Pages.id.gte(args.afterDate)) : query
  query = args.count ? query.limit(args.count) : query
  return query.exec()
}

/**
 * simulates mozilla lighbeam
 *
 * @param {Object} args - args object
 * @param {string} args.domain - domain
 * @param {string} args.inference - inference
 * @returns {Object} object in desired lighbeam format
 */
async function lightbeam (args) {
  /* WE WANT TO RETURN
    {
      "www.firstpartydomain.com": {
        favicon: "http://blah...",
        firstParty: true,
        firstPartyHostnames: false,
        hostname: "www.firstpartydomain.com",
        thirdParties: [
          "www.thirdpartydomain.com"
        ]
      },
      "www.thirdpartydomain.com": {
        favicon: "",
        firstParty: false,
        firstPartyHostnames: [
          "www.firstpartydomain.com"
        ],
        hostname: "www.thirdpartydomain.com",
        thirdParties: []
      }
    }
    */
  let websites = {}

  const domains = (await getDomains({startTime: args.afterDate}))

  await Promise.all(domains.map(async (domain) => {
    const q = (await getTrackersByDomain({domain: domain, afterDate: args.afterDate}))
    const trackers = q.map(x => {
      const company = x.name
      return trackerData[company].site // uses outdated version of companyData
    })

    if (websites[domain]) {
      websites[domain].firstParty = true
      websites[domain].thirdParties.concat(trackers)
    } else {
      websites[domain] = {
        favicon: 'http://' + domain + '/favicon.ico',
        firstParty: true,
        firstPartyHostnames: false,
        hostname: domain,
        thirdParties: trackers
      }
    }

    for (let tracker of trackers) {
      if (websites[tracker]) {
        if (websites[tracker].firstPartyHostnames) {
          websites[tracker].firstPartyHostnames.push(domain)
        } else {
          websites[tracker].firstPartyHostnames = [domain]
        }
      } else {
        websites[tracker] = {
          favicon: '',
          firstParty: false,
          firstPartyHostnames: [domain],
          hostname: tracker,
          thirdParties: []
        }
      }
    }
  }))

  return websites
}

/**
 * gets pages without trackers
 *
 * @param {any} args
 * @returns {Object[]} pages visited
 */
async function getPagesNoTrackers () {
  let query = ttDb.select(Pages.domain, lf.fn.count(Trackers.tracker))
    .from(Pages)
    .leftOuterJoin(Trackers, Pages.id.eq(Trackers.pageId))
    .groupBy(Pages.id)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.ASC)

  let pages = new Set()
  var i
  const pagesQuery = await query.exec()
  for (i = 0; i < pagesQuery.length; i++) {
    if (pagesQuery[i]['Trackers']['COUNT(tracker)'] === 0) {
      pages.add(pagesQuery[i]['Pages']['domain'])
    }
  }
  return Array.from(pages)
}

/**
 * gets pages without inferences
 *
 * @param {any} args
 * @param  {number} args.startTime - time start window
 * @param  {number} args.endTime - time end window
 * @returns {Object[]} pages visited
 */
async function getPagesNoInferences (args) {
  let query = ttDb.select(Pages.domain, Pages.id, Pages.title, lf.fn.count(Inferences.inference))
    .from(Pages)
    .leftOuterJoin(Inferences, Pages.id.eq(Inferences.pageId))
  query = (args.startTime && args.endTime)
    ? query.where(
      lf.op.and(
        Pages.id.gte(args.startTime),
        Pages.id.lte(args.endTime)))
    : query
  query = query.groupBy(Pages.id)
    .orderBy(lf.fn.count(Inferences.inference), lf.Order.ASC)
  // query = args.count ? query.limit(args.count) : query

  let pages = new Set()
  var i
  const pagesQuery = await query.exec()
  for (i = 0; i < pagesQuery.length; i++) {
    if (pagesQuery[i]['Inferences']['COUNT(inference)'] === 0) {
      pages.add(pagesQuery[i])
    }
  }
  return Array.from(pages)
}

/* ================ */
/*   ADs            */
/* ================ */

/**
 * gets all ads from all pages visited
 *
 * @param {any} args
 * @returns {Object[]} titles of pages visited
 */
async function getAllAds (args) {
  let query = ttDb.select().from(Ads)

  let all_ads = new Set()
  var i
  const adsQuery = await query.exec()
  for (i = 0; i < adsQuery.length; i++) {
    all_ads.add(adsQuery[i])
  }
  return Array.from(all_ads)
}

/**
 * gets all ad URLs from all pages visited
 *
 * @param {any} args
 * @returns {Object[]} titles of pages visited
 */
async function getAdURLs (args) {
  let query = ttDb.select().from(Ads)

  let all_ads = new Set()
  var i
  const adsQuery = await query.exec()
  for (i = 0; i < adsQuery.length; i++) {
    all_ads.add(adsQuery[i].url)
  }
  return Array.from(all_ads)
}


/** get ads by pageId
 *
 * @param  {Object} args - arguments object
 * @param  {string} args.inference - inference
 * @param  {number} [args.count] - number of entries to return
 * @returns {Object} query result
 */
async function getAdsByPageId (args) {
  if (!args.pageId) {
    throw new Error('Insufficient args provided for query (getTrackersByPageId)')
  }
  let query = ttDb.select()
    .from(Ads)
    .where(lf.op.and(
      Ads.pageId.eq(args.pageId),
    ))

  const res = await query.exec()
  let only_needed = []
  for (let obj of res) {
    let keeps = {}
    keeps['ad_seen_on'] = obj.domain 
    keeps['url_landing_page_long'] = obj.url_landing_page_long
    keeps['url_landing_page_short'] = obj.url_landing_page_short
    keeps['inference'] = obj.inference 
    keeps['inferencePath'] = obj.inferencePath
    keeps['provided_explanation'] = obj.explanation
    keeps['provided_explanation_url'] = obj.url_explanation
    only_needed.push(keeps)
  }
  return only_needed
}



/**
 * gets all ad DOMs from all pages visited
 *
 * @param {any} args
 * @returns {Object[]} titles of pages visited
 */
async function getAdDOMs(args) {
  let query = ttDb.select().from(Ads)

  // get unique ad DOMs
  let all_ads = new Set()
  let all_ads_extra = new Set()
  var i
  const adsQuery = await query.exec()
  for (i = 0; i < adsQuery.length; i++) {
    // if (adsQuery[i].inference == "Health") {
    all_ads.add( "<!DOCTYPE html> <html> <body> <div style='zoom: 0.60; -moz-transform: scale(.60);'>" + adsQuery[i].dom + "<div> </body> </html>")
    let pages_for_inference = await getPagesByInference({inference: adsQuery[i].inference})
    all_ads_extra.add({domain: adsQuery[i].domain, inference: adsQuery[i].inference, pages: pages_for_inference, dom: "<!DOCTYPE html> <html> <body> <div style='zoom: 0.60; -moz-transform: scale(.60);'>" + adsQuery[i].dom + "<div> </body> <script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.5.3/iframeResizer.contentWindow.js'></script> </html>"})
    // }
  }

  // drop similar ads (noted by only slight changes, like different embedded URLs)
  let to_check = Array.from(all_ads)
  let to_check_extra = Array.from(all_ads_extra)
  let all_dissimilar_ads = new Set()
  let is_dropped = new Set()
  let seen_it = new Array()
  let sanity = new Array()

  // pairwise comparison and log ads to be dropped 
  for (i = 0; i < to_check.length; i++) {
    let first = to_check[i]
    for (let q = 0; q < to_check.length; q++) {
      let second = to_check[q]

      if (q !== i && !seen_it.includes(i) && !seen_it.includes(q)) {

        // sanity.push([i, q])

        let similarness = stringSimilarity(first, second)
        if (similarness >= .80) {
          is_dropped.add([i, q])
        }
      }
    }
    seen_it.push(i)
  }

  // drop the right ads 
  let dropper = Array.from(is_dropped)
  let to_be_dropped = new Array()
  let sanity_drop = new Array()
  for (i = 0; i < dropper.length; i++) {
    let first = dropper[i][0]
    let second = dropper[i][1]
    sanity_drop.push(["to be dropped", first, second])
    if (to_be_dropped.includes(first)) {
      to_be_dropped.push(first)
    } else {
      to_be_dropped.push(second)
    }
  }
  let final_drop_list = new Set(to_be_dropped);
  for(let drop_me of final_drop_list) {
    to_check.splice(drop_me, 1);
    to_check_extra.splice(drop_me, 1);
  } 

  return Array.from(to_check_extra)
}

/**
 * checks if string (i.e., ad identifier) already exists
 *
 * @param {String} string_to_match
 * @returns {Boolean} of string match
 */
async function getAdMatch(string_to_match) {
  let query = ttDb.select().from(Ads)
  let all_ads = new Array()
  var i
  const adsQuery = await query.exec()
  for (i = 0; i < adsQuery.length; i++) {
    all_ads.push(String(adsQuery[i].url_landing_page_long))
    if (string_to_match == String(adsQuery[i].url_landing_page_long)) {
      return true
    }
    
  }
  return false
}


/**
 * gets all ad DOMs from all pages visited, with meta information
 *
 * @param {any} args
 * @returns {Object[]} titles of pages visited
 */
async function getAdDOMs_version2(args) {
  let query = ttDb.select().from(Ads)

  // get unique ad DOMs
  let all_ads = new Set()
  // let all_ads_extra = new Set()
  var i

  let to_ret = []

  // ad category 
  // other pages with same category 
  // google interests with same category 
  // ad domain (short) ==> you visited <> and <> paid to advertise to you 
  // ad domain matches in previous pages domains 
  // explanation says anything useful 

  let count_of_grabbed = 0 //(((optimize)))
  let count_of_grabbed_cats = new Set()

  const adsQuery = await query.exec()
  for (i = 0; i < adsQuery.length; i++) {

    // all_ads.add( "<!DOCTYPE html> <html> <body> <div style='zoom: 0.60; -moz-transform: scale(.60);'>" + adsQuery[i].dom + "<div> </body> </html>")
    let pages_for_inference = []
    let google_inferences_matches = []
    let comfortable = comfortData[adsQuery[i].inference]
    if (comfortable != undefined) {
      comfortable = comfortable.comfort 
    } else {
      comfortable = '3'
    }
    // console.log(adsQuery[i].inference)
    // console.log("this is comfort", comfortData[adsQuery[i].inference])
    // console.log("this is comfort checker", comfortable)


    if (comfortable <= -2 || count_of_grabbed < DO_OPTIMIZATIONS ? 1000000 : 15) { //(((optimize)))

      if (adsQuery[i].inference != "none") {
        pages_for_inference = await getPagesByInference({inference: adsQuery[i].inference})
        google_inferences_matches = await getGoogleInferences_byInference({word: adsQuery[i].inference})
      }
      
      let exact_domain_in_history = []
      let domain_fuzzy = ''
      let fuzzy_domain_in_history = []
      if (adsQuery[i].url_landing_page_short != '') {
        let domain_to_get = tldjs.getDomain(adsQuery[i].url_landing_page_short)
        if (domain_to_get != undefined) {
          exact_domain_in_history = await getPagesByDomain({domain: domain_to_get})
          fuzzy_domain_in_history = await getPagesByDomain_fuzzy({domain: domain_to_get})
        }
      }

      let ad_cat_renaming;
      if (adsQuery[i].inference == "none") {
        ad_cat_renaming = "uncategorized"
      } else {
        ad_cat_renaming = adsQuery[i].inference
      }


      let temp = {}
      temp.you_were_visiting = adsQuery[i].domain
      temp.on = adsQuery[i].pageId
      // breaks some ads
      // temp.dom = "<!DOCTYPE html> <html> <body> <div style='zoom: 0.75; -moz-transform: scale(0.75); -moz-transform-origin: 0 0; position: absolute; left: 50px; top: 50px'>" + adsQuery[i].dom + "<div> </body> </html>"
      temp.dom = adsQuery[i].dom 
      temp.ad_category = ad_cat_renaming
      temp.ad_category_matches_other_pages = pages_for_inference
      temp.ad_category_matches_google_interests =  google_inferences_matches
      temp.ad_domain_raw = adsQuery[i].url_landing_page_short
      temp.ad_domain_mod = domain_fuzzy
      temp.ad_explanation = adsQuery[i].explanation
      temp.ad_domain_exactly_seen_in_history = exact_domain_in_history
      temp.ad_domain_fuzzy_seen_in_history = fuzzy_domain_in_history

      // get number of hits
      let count = 0
      if (temp.ad_category != 'none') { count += 1 }
      if (temp.ad_category_matches_other_pages.length != 0) { count += 1 }
      if (temp.ad_category_matches_google_interests.length != 0) { count += 1 }
      if (temp.ad_domain_raw != '') { count += 1 }
      if (temp.ad_domain_mod != '') { count += 1 }
      if (temp.ad_domain_fuzzy_seen_in_history.length != 0) {count += 1}
      if (temp.ad_domain_exactly_seen_in_history.length != 0) { count += 1 }
      if (temp.ad_explanation != null) {
        if (temp.ad_explanation[0] != 'none provided by advertiser') { count += 1 }
      }
      temp.hits = count

      // all_ads_extra.add({you_were_visiting: adsQuery[i].domain, inference: adsQuery[i].inference, pages: pages_for_inference, dom: "<!DOCTYPE html> <html> <body> <div style='zoom: 0.60; -moz-transform: scale(.60);'>" + adsQuery[i].dom + "<div> </body> </html>"})
      
      to_ret.push(temp)
      count_of_grabbed_cats.add(temp.ad_category)
      count_of_grabbed = count_of_grabbed_cats.size //(((otpimization)))

    }

    
  }

  // all ads might be overwhelming
  let at_most =  DO_OPTIMIZATIONS ? 1000000 : 4 // will result in number-1 results // 11 was older version //(((optimize)))

  let keepers = []
  let count_per_group = {}
  let count_all = 0
  let to_ret_categorized = {}
  let sanity = {}
  for (let ad of to_ret) {

    if (ad.ad_category != "uncategorized") {

      // keep track of counts so that we can limit the number shown 
      if (count_per_group[ad.ad_category]) {
        count_per_group[ad.ad_category] += 1
      } else {
        count_per_group[ad.ad_category] = 1
      }


      if (count_per_group[ad.ad_category] < at_most) {
        if (Object.keys(to_ret_categorized).includes(ad.ad_category)) {
          let curr = to_ret_categorized[ad.ad_category]
          curr.push(ad)
          to_ret_categorized[ad.ad_category] = curr
        } else {
          to_ret_categorized[ad.ad_category] = [ad]
        }
      }

    }
  }

  // console.log(to_ret_categorized)
  // console.log(comfortData)

  ////sort by comfort before returning 
  const sortObjectByKeys = (object) => Object.fromEntries(
    Object.entries(object).sort(([k1], [k2]) => {
      // console.log(k1)
      // console.log(k2)
      // console.log(k1 in comfortData)
      // console.log(k2 in comfortData)
      let first; 
      if (k1 in comfortData == false) {
        first = 3
      } else {
        first = comfortData[k1].comfort
      }
      let second;
      if (k2 in comfortData == false) {
        second = 3 
      } else {
        second = comfortData[k2].comfort
      }
      // console.log(first)
      // console.log(second)
      // console.log(first < second ? -1 : 1)
      return (first < second ? -1 : 1)
      // comfortData[k1].comfort < comfortData[k2].comfort ? -1 : 1
    })
  )
  to_ret_categorized = sortObjectByKeys(to_ret_categorized)
  // console.log(to_ret_categorized)

  return to_ret_categorized
}


/**
 * gets overview for ad DOMs from all pages visited
 *
 * @param {any} args
 * @returns {Object[]} titles of pages visited
 */
async function getAdDOMs_overview(args) {
  let query = ttDb.select().from(Ads)

  // get unique ad DOMs
  let all_ads = new Set()
  // let all_ads_extra = new Set()
  var i

  let to_ret = {}
  let totals = 0
  let creeps = {}

  // ad category: count 

  const adsQuery = await query.exec()
  for (i = 0; i < adsQuery.length; i++) {

    let category = ''

    if (adsQuery[i].inference == "none") {
      category = "-uncategorized-"
    }
    else {
      category = adsQuery[i].inference
    }

    if (Object.keys(to_ret).includes(category) && category != "-uncategorized-") {
      to_ret[category] += 1
    } 
    else {
      if (category != "-uncategorized-") {
        to_ret[category] = 1
        if (category in comfortData) {
          creeps[category] = comfortData[category].comfort
        }
      }
    }
    totals += 1
    
  }

  creeps = Object.entries(creeps)
    .sort(([,a],[,b]) => a-b)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
  for( let entry of Object.keys(creeps)) {
    creeps[entry] = to_ret[entry]
  }
  return {breakdown: to_ret, totals: totals, creeps: creeps}
}


/**
 * gets bar chart for categories of ads served
 *
 * @param {any} args
 * @returns {Object[]} titles of pages visited
 */
async function getAdDOMs_bars(args) {
  let query = ttDb.select().from(Ads)

  const adsQuery = await query.exec()
  // console.log(adsQuery)

  let test = [["one", 1], ["two", 2]]
  let seen_it = false
  let checker_seen_it = test.forEach((data) => {if (data[0] == "three") {seen_it = true}});
  // console.log(seen_it)


  let to_ret = {}
  let drilldown = {}
  let totals = 0

  // ad category: count 

  for (let i = 0; i < adsQuery.length; i++) {

    let category = ''

    category = adsQuery[i].inference
    

    if (Object.keys(to_ret).includes(category) && category != "none") {
      to_ret[category] += 1
        
      let curr = drilldown[category]
      let served_while_visiting = adsQuery[i].domain
      let seen_it = false
      let index;
      for (let i = 0; i < curr.length; i++) {
        if (drilldown[category][i][0] == served_while_visiting) {
          seen_it = true
          index = i
        }
      }
      if (seen_it) {
        drilldown[category][index][1] += 1
      } else {
        drilldown[category].push([served_while_visiting, 1])
      }
    } 
    else {
      // console.log('first time seeing')
      if (category != "none") {
        to_ret[category] = 1
        let served_while_visiting = adsQuery[i].domain
        drilldown[category] = [[served_while_visiting, 1]]

      }
      
    }
    totals += 1

  }

  // console.log(to_ret)
  // console.log(drilldown)

  let series_for_chart = []
  Object.keys(to_ret).forEach((key, index) => {
      let extra_info = drilldown[key]
      let temp = {name: key, y: to_ret[key], extra: extra_info}
      series_for_chart.push(temp)
  });

  // let drilldown_for_chart = []
  // Object.keys(drilldown).forEach((key, index) => {
  //     console.log(key)
  //     console.log(drilldown[key])
  //     let temp = {name: key, id: key, data: drilldown[key]}
  //     drilldown_for_chart.push(temp)
  // });

  /* drilldown.forEach(item => {
    console.log(item)
    //let key = Object.keys(item)
    //let value = Object.values(item)
    //let temp = {name: key, id: key, data: value}
    //series.push(temp)
  }) */



  // console.log(series_for_chart)
  // console.log(drilldown_for_chart)
  // console.log(to_ret)

  let final_ret = {series_for_chart: series_for_chart}
  return final_ret
}

/**
 * gets count of ad explanations strings
 *
 * @param {any} args
 * @returns {Object[]} dictionary count of ad explanation strings
 */
async function getAdExplanationCounts (args) {
  let query = ttDb.select().from(Ads)


  let all_ads = new Array()
  const adsQuery = await query.exec()
  for (let i = 0; i < adsQuery.length; i++) {
    let explanation_group = adsQuery[i].explanation
    for (let p = 0; p < explanation_group.length; p ++) {
      all_ads.push(explanation_group[p])

    }
  }
  var counts = {};
  all_ads.forEach(function(i) { counts[i] = (counts[i]||0) + 1;});
  let sorted =  _(counts).toPairs().orderBy(1, 'desc').fromPairs().value()

  console.log(sorted)

  let all_explanations = new Object()
  all_explanations = Object.keys(sorted)
  let all_counts = new Object()
  all_counts = Object.values(sorted)
  let all_explanations_counts = new Array()

  for (let i = 0; i < Object.keys(sorted).length; i++) {
    let temp = new Object()
    temp.explanation = all_explanations[i];
    temp.count = all_counts[i];
    all_explanations_counts.push(temp)
  }

  return (all_explanations_counts)
}

/**
 * gets the ad domains (href), count of times the domain advertised, and explanations
 *
 * @param {any} args
 * @returns {Object[]} dictionary of domain, count, [explanations]
 */
async function getAdDomainsInformation (args) {
  let query = ttDb.select().from(Ads)


  let advertisers = new Array()

  const adsQuery = await query.exec()
  for (let i = 0; i < adsQuery.length; i++) {
    advertisers.push(adsQuery[i].domain)
  }

  var counts = {};
  advertisers.forEach(function(i) { counts[i] = (counts[i]||0) + 1;});
  let sorted =  _(counts).toPairs().orderBy(1, 'desc').fromPairs().value()
  
  const advertiser_explanations = new Array()

  for (let i = 0; i < Object.keys(sorted).length; i++) {
    let this_advertiser = Object.keys(sorted)[i]
    let this_count = Object.values(sorted)[i]
    let temp = new Object()
    temp.website = this_advertiser 
    temp.count = this_count

    let all_explanations = new Set()
    for (let p = 0; p < adsQuery.length; p++) {
      if (this_advertiser == adsQuery[p].domain) {
        let explanation_group = adsQuery[p].explanation;
        for (let r = 0; r < explanation_group.length; r ++) {
          all_explanations.add(explanation_group[r])
        }
      }
    }
    temp.all_explanations = Array.from(all_explanations) 
    advertiser_explanations.push(temp)
  }

  return (advertiser_explanations)
}


/* ====================== */
/*   Google Inferences    */
/* ====================== */


/**
 * gets all inferences google has made about you
 *
 * @param {any} args
 * @returns {Object[]} array of unique inferences (from set)
 */
async function getAllGoogleInferences (args) {
  let query = ttDb.select().from(GoogleInferences)

  let all_inferences = new Set()
  const inferencesQuery = await query.exec()
  for (let i = 0; i < inferencesQuery.length; i++) {
    let inference_group = inferencesQuery[i].inferences
    for (let p = 0; p < inference_group.length; p ++) {
      all_inferences.add(inference_group[p])
    }
    
  }

  return Array.from(all_inferences)
}

/**
 * gets any differences (set difference) between google scrapes
 *
 * @param {any} args
 * @returns {Object[]} array of set difference
 */
async function getGoogleInferencesDifferences (args) {
  let query = ttDb.select().from(GoogleInferences)

  let all_inferences = new Array()
  const inferencesQuery = await query.exec()
  for (let i = 0; i < inferencesQuery.length; i++) {
    let inference_group = inferencesQuery[i].inferences
    let temp = new Array()
    for (let p = 0; p < inference_group.length; p ++) {
      temp.push(inference_group[p])
    }
    all_inferences.push(temp) 
  }

  if (all_inferences.length <= 1) {
    return "No difference yet, try re-scraping google after some website activity!"
  }

  let is_diff = new Array()
  for (let i = 0; i < all_inferences.length-1; i++) {
    var diff = _.difference(all_inferences[i], all_inferences[i+1])

    if (diff.length == 0) {
      console.log("no change")
    } else {
      let temp = new Object()
      temp.difference = diff; 
      temp.start = i 
      temp.end = i+1
      is_diff.push(temp) 
    }
  }
  
  if (is_diff.length == 0) {
    return "no change anywhere!"
  }
  
  var difference_list = new Array()
  for (let i = 0; i < is_diff.length; i++) {
    let start = is_diff[i].start 
    let end = is_diff[i].end 
    let difference =  is_diff[i].difference
    let date_first = inferencesQuery[start].pageId
    let data_second = inferencesQuery[end].pageId
    let temp = new Object()
    temp.start = date_first 
    temp.end = data_second 
    temp.difference = difference
    difference_list.push(temp)
  }

  return Array.from(difference_list)
}

/**
 * gets days and counts from google inferences for collection purposes
 *
 * @param {any} args
 * @returns {Object[]} array of set difference
 */
async function getGoogleInferences_forStorage (args) {
  let query = ttDb.select().from(GoogleInferences).orderBy(GoogleInferences.pageId)

  let all_inferences = new Array()
  const inferencesQuery = await query.exec()
  for (let i = 0; i < inferencesQuery.length; i++) {
    let inference_group = inferencesQuery[i].inferences
    let temp = {}
    temp.date = inferencesQuery[i].pageId
    // temp.y = inference_group.length
    for (let entry of inferencesQuery[i].inferences) {
      if (entry.type == 'my_email') {
        temp.account = entry.value
      }
    }
    temp.inferences_to_compare = inferencesQuery[i].inferences
    all_inferences.push(temp) 
  }

  // get groups of accounts
  let ObjMap ={};
  let count = 1;
  all_inferences.forEach(element => {
    var makeKey = element.account;
    if(!ObjMap[makeKey]) {
      ObjMap[makeKey] = [];
    }

    ObjMap[makeKey].push({
      date: element.date,
      // y: element.y,
      account: element.account,
      inferences: element.inferences_to_compare,
    });
    count += 1
  });

  // get differences, toss rest
  // https://stackoverflow.com/questions/21987909/how-to-get-the-difference-between-two-arrays-of-objects-in-javascript
  const isSameUser = (a, b) => a.value == b.value;
  const onlyInLeft = (left, right, compareFunction) => 
    left.filter(leftValue =>
      !right.some(rightValue => 
        compareFunction(leftValue, rightValue)));
   
  // let sanity = []
  let outer_index = 0
  for (let objName of Object.keys(ObjMap)) {
    let all_in_group = ObjMap[objName]
    let index = 0
    let prev;
    for (let slice of all_in_group) {
      let curr = slice.inferences
      if (index != 0) {
        let onlyInOne = onlyInLeft(curr, prev, isSameUser)

        // if (onlyInOne.length != 0) {
        let curr_obj = ObjMap[objName][index]
        curr_obj['diff'] = onlyInOne
        curr_obj['this_time'] = curr_obj.date 
        if (curr_obj['diff'].length != 0) {
          let time_now = curr_obj.date 
          let reach_back = moment(time_now).subtract(5, 'minute').unix(); // date object reach back window
          let reach_forward = moment(time_now).add(30, 'second').unix(); // date object reach forward window
          let pages_visited = await getPagesByTime ({startTime: parseInt(reach_back + "000"), endTime: parseInt(reach_forward + "000")})
          let keepers = []
          for (let t of pages_visited) {
            if (!keepers.includes(t.title)) {
              keepers.push(t.title + " [" + String(t.inference) + ", " + String(t.domain) + "]")
            }
          }
          curr_obj['pages_visited'] = keepers
        }else {
          curr_obj['prev_time'] = ""
        }

        
        ObjMap[objName][index] = curr_obj
        // todo for efficiency -- drop curr_obj.interests because no reason to keep it
        // sanity.push(onlyInOne)
        // sanity.push("BREAK")
        // curr_value.diff = res
        // ObjMap[Object.keys(ObjMap)[outer_index]].data[index] = curr_value
        // }
        prev = curr
      } else {
        prev = slice.inferences
        // set to empty so tooltip doesn't break
        let curr_obj = ObjMap[objName][index]
        curr_obj['diff'] = []
        ObjMap[objName][index] = curr_obj
      }
      index += 1


    }
    outer_index += 1
  }

  // // drop all the inferences, no need to keep all this data around anymore, just differences
  // outer_index = 0
  // for (let objName of Object.keys(ObjMap)) {
  //   let all_in_group = ObjMap[objName]
  //   let index = 0
  //   let prev;
  //   for (let slice of all_in_group) {
  //     let curr = slice.inferences
  //     ObjMap[Object.keys(ObjMap)[outer_index]][index]['inferences'] = []
  //     index += 1
  //   }
  // }


  // resetting the x axis for the chart
  let to_ret = []
  let idx = 0
  for (let objName of Object.keys(ObjMap)) {
    let temp = {}
    temp.name = objName
    temp.data = ObjMap[objName]
    let point_start;
    try {
      let prev = Object.keys(ObjMap)[idx - 1]
      let last_count = ObjMap[prev].length
      point_start = last_count + 1
    } catch (e) {
      point_start = 0
    }
    temp.pointStart = point_start
    
    to_ret.push(temp)
    idx += 1
  }


  if (all_inferences.length == 0) {
    return "No grabs yet, try re-scraping google after some website activity!"
  }

  // let temp = groupByTime(all_inferences, 'x', 'day')

  // scrup emails and names and add back in first item 

  // add back in first set of inferences for each user 
  // all_inferences[0]['inferences_to_compare']
  let done_for_this_account = []
  for (let final_object of to_ret){
    let this_account = final_object.name 
    if (final_object.data[0].inferences.length == 0) {
      for (let i = 0; i < inferencesQuery.length; i++) {
        let inference_group = inferencesQuery[i].inferences
        let all = []
        let to_add_flag = false 
        for (let entry of inference_group) {
          all.push(entry)
          if (entry.type == 'my_email' && entry.value == final_object.data[0].account && !done_for_this_account.includes(final_object.data[0].account)) {
            to_add_flag = true 
          }
        }
        if (to_add_flag = true) {
          final_object.data[0].inferences = all
          done_for_this_account.push(final_object.data[0].account)
        }

      }
    }
  }


  return to_ret
}

/**
 * gets days and counts from google inferences
 *
 * @param {any} args
 * @returns {Object[]} array of set difference
 */
async function getGoogleInferences_overview (args) {
  let query = ttDb.select().from(GoogleInferences).orderBy(GoogleInferences.pageId)

  let all_inferences = new Array()
  const inferencesQuery = await query.exec()
  for (let i = 0; i < inferencesQuery.length; i++) {
    let inference_group = inferencesQuery[i].inferences
    let temp = {}
    temp.date = inferencesQuery[i].pageId
    temp.y = inference_group.length
    for (let entry of inferencesQuery[i].inferences) {
      if (entry.type == 'my_email') {
        temp.account = entry.value
      }
    }
    temp.inferences_to_compare = inferencesQuery[i].inferences
    all_inferences.push(temp) 
  }

  // get groups of accounts
  let ObjMap ={};
  let count = 1;
  all_inferences.forEach(element => {
    var makeKey = element.account;
    if(!ObjMap[makeKey]) {
      ObjMap[makeKey] = [];
    }

    ObjMap[makeKey].push({
      date: element.date,
      y: element.y,
      account: element.account,
      inferences: element.inferences_to_compare,
    });
    count += 1
  });

  // get differences, toss rest
  // https://stackoverflow.com/questions/21987909/how-to-get-the-difference-between-two-arrays-of-objects-in-javascript
  const isSameUser = (a, b) => a.value == b.value;
  const onlyInLeft = (left, right, compareFunction) => 
    left.filter(leftValue =>
      !right.some(rightValue => 
        compareFunction(leftValue, rightValue)));
   
  // let sanity = []
  let outer_index = 0
  for (let objName of Object.keys(ObjMap)) {
    let all_in_group = ObjMap[objName]
    let index = 0
    let prev;
    for (let slice of all_in_group) {
      let curr = slice.inferences
      if (index != 0) {
        let onlyInOne = onlyInLeft(curr, prev, isSameUser)

        // if (onlyInOne.length != 0) {
        let curr_obj = ObjMap[objName][index]
        curr_obj['diff'] = onlyInOne
        curr_obj['this_time'] = curr_obj.date 
        if (curr_obj['diff'].length != 0) {
          let time_now = curr_obj.date 
          let reach_back = moment(time_now).subtract(3, 'minute').unix(); // date object
          let reach_forward = moment(time_now).add(30, 'second').unix(); // date object
          let pages_visited = await getPagesByTime ({startTime: parseInt(reach_back + "000"), endTime: parseInt(reach_forward + "000")})
          let keepers = []
          for (let t of pages_visited) {
            if (!keepers.includes(t.title)) {
              keepers.push(t.title + " [" + String(t.inference) + ", " + String(t.domain) + "]")
            }
          }
          curr_obj['pages_visited'] = keepers
        }else {
          curr_obj['prev_time'] = ""
        }

        
        ObjMap[objName][index] = curr_obj
        // todo for efficiency -- drop curr_obj.interests because no reason to keep it
        // sanity.push(onlyInOne)
        // sanity.push("BREAK")
        // curr_value.diff = res
        // ObjMap[Object.keys(ObjMap)[outer_index]].data[index] = curr_value
        // }
        prev = curr
      } else {
        prev = slice.inferences
        // set to empty so tooltip doesn't break
        let curr_obj = ObjMap[objName][index]
        curr_obj['diff'] = []
        ObjMap[objName][index] = curr_obj
      }
      index += 1


    }
    outer_index += 1
  }

  // // drop all the inferences, no need to keep all this data around anymore, just differences
  // TODO -- bring this optimization back in, check siging in and out and in of multiple accounts, bug caused sending to break
  // this is a repeat codeBlock, and appears in one other function 
  // outer_index = 0
  // for (let objName of Object.keys(ObjMap)) {
  //   let all_in_group = ObjMap[objName]
  //   let index = 0
  //   let prev;
  //   for (let slice of all_in_group) {
  //     let curr = slice.inferences
  //     ObjMap[Object.keys(ObjMap)[outer_index]][index]['inferences'] = []
  //     index += 1
  //   }
  // }


  // resetting the x axis for the chart
  let to_ret = []
  let idx = 0
  for (let objName of Object.keys(ObjMap)) {
    let temp = {}
    temp.name = objName
    temp.data = ObjMap[objName]
    let point_start;
    try {
      let prev = Object.keys(ObjMap)[idx - 1]
      let last_count = ObjMap[prev].length
      point_start = last_count + 1
    } catch (e) {
      point_start = 0
    }
    temp.pointStart = point_start
    
    to_ret.push(temp)
    idx += 1
  }


  if (all_inferences.length == 0) {
    return "No grabs yet, try re-scraping google after some website activity!"
  }

  // let temp = groupByTime(all_inferences, 'x', 'day')

  return to_ret
}


// /**
//  * checks if google demographic data is present
//  *
//  * @param {any} args
//  * @returns {Object[]} bool 
//  */
// async function valid_google_demographics (args) {

//   let query = ttDb.select().from(GoogleInferences)
//   let answer = await query.exec()
//   if (Object.values(answer)[0]['inferences'].length > 0) {
//     return true
//   } else {
//     return false
//   }

// }

/**
 * creates tree view from google inferences data
 * specifically looks only at demographics
 *
 * @param {any} args
 * @returns {Object[]} tree to use with react-tree-graph
 */
async function getGoogleInferencesTree_demographic (args) {
  let query = ttDb.select().from(GoogleInferences)

  let all_demographic = new Array()
  let seen_it = new Array()
  let seen_it2 = {}

  const inferencesQuery = await query.exec()
  for (let i = 0; i < inferencesQuery.length; i++) {
    let inference_group = inferencesQuery[i].inferences

    let origin = ''

    for (let p = 0; p < inference_group.length; p ++) {
      if (inference_group[p].type == "my_email") {
        origin += inference_group[p].value
      }
    }

    let known_types = ["years old", "Male", "Female", "Language", "Company Size", "Education Status", "Household Income", "Job Industry", "Marital Status", "Parental Status", "Sensitivity:", "Homeownership Status"]

    for (let p = 0; p < inference_group.length; p ++) {
      let is_known_type = false 
      for (let known of known_types) {
        if (inference_group[p].value.includes(known)) {
          is_known_type = true
          break;
        }
      }
      if (inference_group[p].type == "demographic" && (inference_group[p].value.includes("video from") != true && inference_group[p].value.includes("videos from") != true) && is_known_type == true) {

        if (Object.keys(seen_it2).includes(inference_group[p].value)) {
          if (!seen_it2[inference_group[p].value].includes(origin)) {

            let idx = 0
            for (let obj of all_demographic) {
              if (inference_group[p].value == obj.name && !obj.origin.includes(origin)) {
                let name_list = obj.origin
                name_list.push(origin)
                all_demographic[idx].origin = name_list
              }
              idx += 1

            }

          } else {
            // append to list
            let idx = 0
            for (let obj of all_demographic) {
              if (inference_group[p].value == obj.name && !obj.origin.includes(origin)) {
                let name_list = obj.origin
                name_list.push(origin)
                all_demographic[idx].origin = name_list
              }
              idx += 1

            }
            // let inner = {name: inference_group[p].value, origin: origin}
            // all_demographic.push(inner)
            // seen_it2[inference_group[p].value] = [origin]
          }
        } else {
          let inner = {name: inference_group[p].value, origin: [origin], pageId: inferencesQuery[i].pageId}
          all_demographic.push(inner)
          seen_it2[inference_group[p].value] = [origin]
        }

        // // do not add duplicates
        // if (seen_it.includes(inference_group[p].value)) {
        //   // console.log("duplicate value from multiple-google-grabs")
        // } else {
        //   let inner = {name: inference_group[p].value, origin: origin}
        //   all_demographic.push(inner)
        //   seen_it.push(inference_group[p].value)
        // }

      }


    }
    
  }

  all_demographic = all_demographic.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);

  // sort sensitivity by timestamp to show timeline (old to new) in changes 
  let index = 0
  let len = Object.keys(all_demographic).length;
  for (let obj of all_demographic) {
    if (obj.name.includes("Sensitivity") && (index + 1 != len)) {
      let curr_index = index 
      let next_index = index + 1 
      let curr_obj = all_demographic[curr_index]
      let next_obj = all_demographic[next_index]
      if (curr_obj.pageId > next_obj.pageId) {
        all_demographic[curr_index] = next_obj
        all_demographic[next_index] = curr_obj
      }
      
    }
    index+=1
  }
  let _tree_ = {name:"You Are", children: all_demographic};

  return _tree_
}

/**
 * creates tree view from google inferences data
 * specifically looks only at name and email if it exists
 *
 * @param {any} args
 * @returns {Object[]} tree to use with react-tree-graph
 */
async function getGoogleInferencesTree_nameData (args) {
  let query = ttDb.select().from(GoogleInferences)

  let all_nameData = new Array()
  let seen_it = new Array()

  const inferencesQuery = await query.exec()
  for (let i = 0; i < inferencesQuery.length; i++) {
    let inference_group = inferencesQuery[i].inferences
    for (let p = 0; p < inference_group.length; p ++) {
      
      if (inference_group[p].type == "my_name" || inference_group[p].type == "my_email") {

        // do not add duplicates
        if (seen_it.includes(inference_group[p].value)) {
          // console.log("duplicate value from multiple-google-grabs")
        } else {
          let temp = new Object()
          temp[inference_group[p].type] = inference_group[p].value
          // let inner = {title: inference_group[p].value}
          all_nameData.push(temp)
          seen_it.push(inference_group[p].value)
        }

      }
    }
    
  }

  let _tree_ = {name:"Contact Information", children: all_nameData};

  return _tree_
}




/**
 * creates tree view from google inferences data
 * specifically looks only at interests
 *
 * @param {any} args
 * @returns {Object[]} tree to use with react-tree-graph
 */
async function getGoogleInferencesTree_interests (args) {


  //https://codereview.stackexchange.com/q/219418
  function createTree(arr, topItem = "Top") {
    const node = (name, parent = null) => ({
      name,
      parent,
      children: []
    });
    const addNode = (parent, child) => {
      parent.children.push(child);

      return child;
    };
    const findNamedNode = (name, parent) => {
      for (const child of parent.children) {
        if (child.name === name) {
          return child
        }
        const found = findNamedNode(name, child);
        if (found) {
          return found
        }
      }
    };

    const top = node(topItem);
    let current;

    for (const children of arr) {
      current = top;
      for (const name of children) {
        const found = findNamedNode(name, current);
        current = found ? found : addNode(current, node(name, current.name));
      }
    }

    return top;
  }


  let query = ttDb.select().from(GoogleInferences)

  let all_interest = new Array()
  let seen_it = new Array()
  let at_depth = {}
  let total_counts = 0

  const inferencesQuery = await query.exec()
  for (let i = 0; i < inferencesQuery.length; i++) {
    let inference_group = inferencesQuery[i].inferences
    for (let p = 0; p < inference_group.length; p ++) {
      if (inference_group[p].type == "interest") {
        // let inner = {name: inference_group[p].value}
        // all_interest.push(inner)

        if (seen_it.includes(inference_group[p].value)) {
          // console.log("duplicate value from multiple-google-grabs")
        } else {
          const splitter = inference_group[p].value.split("/");
          let depth = splitter.length - 1
          if (depth in at_depth) {
            let curr = at_depth[depth]
            if (!curr.includes(inference_group[p].value)) {
              curr.push(inference_group[p].value)
              at_depth[depth] = curr
            }
          } else {
            at_depth[depth] = [inference_group[p].value]
          }
          all_interest.push(splitter.splice(1,splitter.length))
          total_counts += 1
          seen_it.push(inference_group[p].value)
        }
 
      }

      if (inference_group[p].type == "interest - company") {

        // if (seen_it.includes(inference_group[p].value)) {
        //   console.log("duplicate value from multiple-google-grabs")
        // } else {
        //   all_interest.push(["These Companies", inference_group[p].value])
        //   seen_it.push(inference_group[p].value)
        // }

        let company_value = "/These Companies" + "/" + inference_group[p].value

        if (seen_it.includes(company_value)) {
          // console.log("duplicate value from multiple-google-grabs")
        } else {
          const splitter = company_value.split("/");
          let depth = splitter.length - 1
          if (depth in at_depth) {
            let curr = at_depth[depth]
            if (!curr.includes(company_value)) {
              curr.push(company_value)
              at_depth[depth] = curr
            }
          } else {
            at_depth[depth] = [company_value]
          }
          all_interest.push(splitter.splice(1,splitter.length))
          total_counts += 1
          seen_it.push(company_value)
        }

      }

      // demographic video patch
      if ((inference_group[p].value.includes("video from")|| inference_group[p].value.includes("videos from")) && inference_group[p].type == 'demographic') {
        let company_value = "/These Videos" + "/" + inference_group[p].value

        if (seen_it.includes(company_value)) {
          // console.log("duplicate value from multiple-google-grabs")
        } else {
          const splitter = company_value.split("/");
          let depth = splitter.length - 1
          if (depth in at_depth) {
            let curr = at_depth[depth]
            if (!curr.includes(company_value)) {
              curr.push(company_value)
              at_depth[depth] = curr
            }
          } else {
            at_depth[depth] = [company_value]
          }
          all_interest.push(splitter.splice(1,splitter.length))
          total_counts += 1
          seen_it.push(company_value)
        }
      }


    }
    
  }

  return {tree: createTree(all_interest, 'You Like'), depths: at_depth, total_counts: total_counts}
}




/**
 * returns matching interests from google to arg
 *
 * @param {any} args
 * @returns {Object[]} tree to use with react-tree-graph
 */
async function getGoogleInferences_byInference (args) {

  if (!args.word) {
    throw new Error('Insufficient args provided for query (getGoogleInferences_byInference)')
  } 
  let word_to_match = args.word

  let query = ttDb.select().from(GoogleInferences)

  let all_interest = new Array()
  let seen_it = new Array()
  let to_ret = []

  const inferencesQuery = await query.exec()
  for (let i = 0; i < inferencesQuery.length; i++) {
    let inference_group = inferencesQuery[i].inferences
    for (let p = 0; p < inference_group.length; p ++) {
      
      if (inference_group[p].type == "interest") {
        // let inner = {name: inference_group[p].value}
        // all_interest.push(inner)

        if (seen_it.includes(inference_group[p].value)) {
          // console.log("duplicate value from multiple-google-grabs")
        } else {
          const splitter = inference_group[p].value.split("/");

          // specific matching
          if (inference_group[p].value.split("/")[inference_group[p].value.split("/").length-1].includes(word_to_match)) {
            if (!seen_it.includes(inference_group[p].value)) {
              to_ret.push(inference_group[p].value)
            }
            seen_it.push(inference_group[p].value)
          }
          // aggressive matching
          // for (let level of splitter) {
          //   if (level.includes(word_to_match)) {
          //     if (!seen_it.includes(inference_group[p].value)) {
          //       to_ret.push(inference_group[p].value)
          //     }
          //     seen_it.push(inference_group[p].value)
          //   }
          // }
        }
        
      }
    }
    
  }

  return to_ret
}



/* ====================== */
/*   IP Addresses         */
/* ====================== */

/**
 * returns all IP address information
 *
 * @param {any} args
 * @returns {Object[]} IP objects
 */
async function getAllIP_info(args) {

  let query = ttDb.select().from(IPAddresses)

  const IPsQuery = await query.exec()

  return IPsQuery
}

/**
 * returns set of IP addresses assocaited with user
 *
 * @param {any} args
 * @returns {Object[]} list of observed IPs
 */
async function getAllIPs(args) {

  let query = ttDb.select().from(IPAddresses)

  let seen_it = new Array()
  let to_ret = new Array()

  const IPsQuery = await query.exec()
  for (let i = 0; i < IPsQuery.length; i++) {
    if (seen_it.includes(IPsQuery[i].ip)) {
    } else {
      const ip = IPsQuery[i].ip;
      seen_it.push(ip)
      to_ret.push(ip)
    }
  }
  return to_ret
}


/* ========= */

const QUERIES = {
  getAllData,
  PageIdDataStructure_revisedHeatmap_version2, /* profile page, heatmap of week overview engagement */
  getDomains, // used in dashboard
  getDomainsByInference, // inference detail page
  getDomainsByTracker, // tracker detail page
  getDomainsByTrackerCount, // sites overview page
  getDomainsNoTrackers, // sites overview page
  getPagesByDomain, // domain detail page
  getPagesByEmptySearchHabits, /* profile page, attempts to pre-compute mondovo matching */
  getSearchPages, // return search pages
  getTopicPages, // return pages matching topics
  getTopicSearchPages, // return search pages matching topics
  getTopicsOfInterest, /* profile page, bursty search habits */
  getInferences, // inference overview page
  getInferencesByDomain, // sites detail page
  getInferencesByTime,
  getInferencesByTracker, // used in dashboard
  getInferenceCount, // inference overview page
  getInferencesDomainsToSend, // this is to send data to server containing pageIds and inferences and domain names
  getInferencesDomainsToSend_v2, /* revision to include new data (ads, google inferences) */
  getInferencesDomainsToSend_v3, /* fixing bug identified in v2 */
  getInferencesMostSensitive_version3, /* profile page, pie chart of interests and time per interest */
  getInferencesMostSensitive_bubbles_version2, /* profile page, bubbleChart of sensitive website visits */
  getInferencesMostSensitive_bubbles_text, /* profile page, bubbleChart below allWords */
  getNumberOfDomains, // used in dashboard
  getNumberOfInferences, // used in popup, dashboard
  getNumberOfPages, // used in popup, dashboard
  getNumberOfTrackers, // used in popup, dashboard
  getPagesByTime, // activity overview page
  getPagesByTime_bedtime, /* profile page, bedtime chart */
  getPagesByInference, // inference detail page
  getPagesByTracker, // tracker detail page
  getPageVisitCountByTracker, // used in popup
  getPagesWithSearchHabits, /* profile page, used to get search habits data from pages */
  getPagesTitlesOnlyUniqueWithSearchHabits, /* profile page, used as shortcut optimization for substring matching large mondovo against titles */
  getTimestamps, // used in dashboard
  getTrackers, // used in dasboard
  getTrackersByDomain,
  getTrackersByInference,
  getTrackersByTime, // creepy trackers by time page
  getTrackersByPageId, /* instrumentation, aggregate statistics */
  getAdDOMs_version2, /* profile page, DOMs to render for adView */
  getAdDOMs_bars, /* profile page, bar chart of ad categories */
  getAdDOMs_overview, /* profile page, stats on ads served */
  getAdsByPageId, /* instrumentation, aggregate statistics */
  getAllGoogleInferences, /* profile page, data from google adsSettings page */
  getGoogleInferences_forStorage, /* revision to include new data (ads, google inferences) */
  getGoogleInferences_overview, /* profile page, stats on google adsSettings page */
  getGoogleInferencesTree_demographic, /* profile page, demographics from google adsSettings */
  getGoogleInferencesTree_interests, /* profile page, parsed out interests from google adsSettings */
  getGoogleInferencesTree_nameData, /* profile page, name data from google adsSettings */
  getAllIPs, /* profile page, IP addresses associated with user */
  getAllIP_info, /* profile page, IP info all */

  // valid_google_demographics, /* profile page, checking on data else spinner should be given (((optimize))) */

  // unused
  getInferencesGender, // used in featureTeaser
  getInferencesMostSensitive, // used in featureTeaser
  getInferencesMostSensitive_version2, // used in featureTeaser
  getInferencesMostSensitive_version4, // used in featureTeaser
  getInferencesMostSensitive_bubbles, // used in featureTeaser
  getNumber_andNames_OfTrackers_perPage, // used in featureTeaser
  getNumberOfAds, // used in featureTeaser
  getNumberOfPages_perTitle, // used in featureTeaser
  getTimesOfPages_perTitle, // used in featureTeaser
  getPagesByTime_bedtime_version2, // used in featureTeaser // set to tester
  getAllAds, // used in featureTeaser
  getAdURLs, // used in featureTeaser
  getAdDOMs, // used in featureTeaser
  getAdExplanationCounts, // used in featureTeaser
  getAdDomainsInformation, // used in featureTeaser
  getGoogleInferencesDifferences, // used in featureTeaser
  getGoogleInferences_byInference, // used in featureTeaser
  getAdMatch, // used in featureTeaser
  getAllTitles, // used in featureTeaser
  PageIdDataStructure, // used in featureTeaser
  PageIdDataStructure_revisedHeatmap, // used in featureTeaser

  lightbeam
}

/**
 * executes a query given query name as string and arguments object
 *
 * @param  {string} queryName - query name
 * @param  {Object} args - query arguments
 * @returns {any} result of query
 */
export default async function makeQuery (queryName, args) {
  if (!ttDb) {
    // try to connect to database again
    ttDb = await primaryDbPromise

    // if that also fails throw an error
    if (!ttDb) {
      throw new Error('database not initialized')
    }
  }

  if (!QUERIES[queryName]) {
    throw new Error('Query ' + queryName + ' does not exist' + '... and these are your arguments ' + JSON.stringify(args))
  }
  return (QUERIES[queryName])(args)
}
