import React, { useState } from "react";
import ReactTable from "react-table";
import ReactDOM from "react-dom";

import Button from "@instructure/ui-buttons/lib/components/Button";
import Heading from "@instructure/ui-elements/lib/components/Heading";
import Link from "@instructure/ui-elements/lib/components/Link";
import Text from "@instructure/ui-elements/lib/components/Text";

import logging from "./dashboardLogging";
import TTPanel from "./components/TTPanel";
import Options from "../options/OptionsUI";

import Grid from "@instructure/ui-layout/lib/components/Grid";
import GridRow from "@instructure/ui-layout/lib/components/Grid/GridRow";
import GridCol from "@instructure/ui-layout/lib/components/Grid/GridCol";
import IconInfo from "@instructure/ui-icons/lib/Solid/IconInfo";

import RadioInput from "@instructure/ui-forms/lib/components/RadioInput";
import RadioInputGroup from "@instructure/ui-forms/lib/components/RadioInputGroup";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Iframe from "react-iframe";
import * as moment from "moment";

import _ from "lodash";

import { InView } from "react-intersection-observer";


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
  DropButton,
  Grommet,
  InfiniteScroll,
  Menu,
  RadioButtonGroup,
  Stack,
  Footer,
  Anchor,
} from "grommet";
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
  Clear,
  Cli,
  CircleInformation,
  CircleQuestion,
  Compliance,
  ContactInfo,
  Domain,
  Google,
  History,
  Hide,
  Info,
  Magic,
  Money,
  More,
  MapLocation,
  Navigate,
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
} from "grommet-icons";
import { grommet } from "grommet/themes";
import { Grid as Grid_grommet } from "grommet";
import { Text as Text_grommet } from "grommet";
import { List as List_grommet } from "grommet";
import { Image as Image_grommet } from "grommet";
import { Spinner as Spinner_grommet } from "grommet";
import { Carousel as Carousel_grommet } from "grommet";
import { Button as Button_grommet } from "grommet";
import { Link as Link_grommet } from "grommet-icons";

import Spinner from "@instructure/ui-elements/lib/components/Spinner";
import * as d3 from "d3";

import Rainbow from "rainbowvis.js";


const millisecondsInDay = 86400000;
const millisecondsInHour = 3600000;

import HcMore from "highcharts/highcharts-more.js";
HcMore(Highcharts);
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import drilldown from "highcharts/modules/drilldown.js";
import wordcloud from "highcharts/modules/wordcloud.js";
drilldown(Highcharts);
wordcloud(Highcharts);
const borderRadius = require("highcharts-border-radius");

import ReactECharts from "echarts-for-react";

import Profile from "./video_profile_1.mp4";
import ReactPlayer from "react-player";

// helper functions

function add(accumulator, a) {
  return accumulator + a;
}

// make popup for scraping goolge ad inferences
function getGoogleInferences() {
  chrome.windows.create(
    { url: "https://adssettings.google.com/", type: "popup" },
    function (window) {}
  );
}

// timing
// credit to https://codesandbox.io/s/milliseconds-to-human-readable-text-with-momentjs-in-react-0pgmq?file=/src/index.js
const oneSecondInMillis = 1000;
const oneMinuteInMillis = 60000;
const oneHourInMillis = 3.6e6;
const oneDayInMillis = 8.64e7;
const oneMonthMillis = 2.628e9;
const oneYearInMillis = 3.154e10; //3.154e10;
const createTime = (millis) => new moment.duration(millis);

const millisToReadable = (millis) => {
  let result = "";

  if (typeof millis !== "number") return "0 ms";

  let time = createTime(millis);

  let years = Math.floor(time.asYears());
  millis = millis - years * oneYearInMillis;
  time = createTime(millis);

  let months = Math.floor(time.asMonths());
  millis = millis - months * oneMonthMillis;
  time = createTime(millis);

  let days = Math.floor(time.asDays());
  millis = millis - days * oneDayInMillis;
  time = createTime(millis);

  let hours = Math.floor(time.asHours());
  millis = millis - hours * oneHourInMillis;
  time = createTime(millis);

  let minutes = Math.floor(time.asMinutes());
  millis = millis - minutes * oneMinuteInMillis;
  time = createTime(millis);

  let seconds = Math.floor(time.asSeconds());
  millis = millis - seconds * oneSecondInMillis;
  time = new moment.duration(millis);

  let milliseconds = Math.floor(time.asMilliseconds());

  if (years > 0) {
    if (years > 1) {
      result += ` ${years} years`;
    } else {
      result += ` ${years} year`;
    }
  }
  if (years > 0 || months > 0) {
    if (months > 1) {
      result += ` ${months} months`;
    } else {
      result += ` ${months} month`;
    }
  }
  if (years > 0 || months > 0 || days > 0) {
    if (days > 1) {
      result += ` ${days} days`;
    } else {
      result += ` ${days} day`;
    }
  }
  if (years > 0 || months > 0 || days > 0 || hours > 0) {
    if (hours > 1) {
      result += ` ${hours} hours`;
    } else {
      result += ` ${hours} hour`;
    }
  }
  if (years > 0 || months > 0 || days > 0 || hours > 0 || minutes > 0) {
    if (minutes > 1) {
      result += ` ${minutes} minutes`;
    } else {
      result += ` ${minutes} minute`;
    }
  }
  if (
    years > 0 ||
    months > 0 ||
    days > 0 ||
    hours > 0 ||
    minutes > 0 ||
    seconds > 0
  ) {
    if (seconds > 1) {
      result += ` ${seconds} seconds`;
    } else {
      result += ` ${seconds} second`;
    }
  }
  // we don't really need to see ms
  // result += ` ${milliseconds} ms`;

  return result;
};

const store_state_global = (data) => {
  let numEntries = data ? data.length : 0;
  if (numEntries != 0) {
    localStorage.setItem("viewing", "doit");
    return "success";
  } else {
    return "failure";
  }
};

/*
  keepit
*/
const video_explain = () => {
  return (
    <ReactPlayer
      playing={true}
      loop={true}
      url={[{ src: Profile, type: "video/webm" }]}
      width="100%"
      height="100%"
    />
  );
};

/*
  keepit
*/
const sensitive_bubbles_v2 = (data) => {
  let numEntries = data ? data.length : 0;
  let data_is_there = data ? data["outer"].length : 0;
  let data_deep_check = data ? data["outer"].data : 0;
  if (numEntries == 0 || data_is_there == 0 || data_deep_check == 0) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );
  } else {
    // fix some settings if not enough data
    let container_size = Math.max(data["outer"].length * 50, 500);
    let margin_top = null;
    let margin_bottom = null;
    if (data["outer"].length <= 2) {
      margin_top = 150;
      margin_bottom = 150;
    }

    const options = {
      title: {
        useHTML: true,
        text: "", //text: `Trackers learn your <i>potentially</i> sensitive interests`
      },
      subtitle: {
        useHTML: true,
        style: {
          font: '16px Verdana, sans-serif',
          color: 'lightgray'
        },
        text:
          document.ontouchstart === undefined
            ? "<i>click on an inner circle to see how a tracker views it</i>"
            : "<i>tap on an inner circle to see how a tracker views it</i>",
      },
      legend: {
        enabled: true,
        layout: "vertical",
        verticalAlign: 'top',
        labelFormatter: function () {
          return this.name;
        },
        borderWidth: 0,
      },
      chart: {
        height: container_size,
        marginTop: margin_top,
        marginBottom: margin_bottom,
        type: "packedbubble",
        // height: "70%"
        // events: {
        //   load: function() {
        //       var allSeries = this.series,
        //           noBreakSpace = String.fromCharCode(0xA0),
        //           WordCloudSeries = Highcharts.seriesTypes.wordcloud,
        //           data, options, point, series, spacing, wordSpaces;
        //       for (var i = 0, ie = allSeries.length; i < ie; ++i) {
        //           series = allSeries[i];
        //           if (!(series instanceof WordCloudSeries)) continue;
        //           options = series.options;
        //           wordSpaces = (options.wordSpaces || 0);
        //           if (!wordSpaces) continue;
        //           data = options.data;
        //           spacing = '';
        //           while (wordSpaces--) spacing += noBreakSpace;
        //           for (var j = 0, je = data.length; j < je; ++j) {
        //               point = data[j];
        //               point.name = spacing + point.name + spacing;
        //           }
        //           series.setData(data);
        //       }
        //   }
        // },
      },
      // tooltip: {
      //     useHTML: true,
      //     pointFormat: '<b>{point.name}</b> <br/><br/> <b>Trackers</b>:<br/>{point.tracker_info}'
      // },

      tooltip: {
        useHTML: true,
        outside: true,
        position: "bottom",
        confine: true,
        formatter: function () {
          // return '<b>'+ this.point.name +'</b>: '+ this.point.y ;

          var serie = this.series;
          //NOTE: may cause efficiency issue when we got lots of points, data in series
          //should be change from [x, y] to {"x": x, "y": y, "index": index}
          var index = this.series.data.indexOf(this.point);
          var this_entry = serie.options.data[index];
          // var title = Object.values(this_entry[2])
          // var domain = Object.values(this_entry[3])
          // var inference = Object.values(this_entry[4])
          // var ret = '<b>' + String(moment(this.x).format("dddd, MMMM Do YYYY, h:mm:ss a")) + '</b>' + '<br/>'
          // ret += '<br/>'
          // ret += "Late night interest: " + inference + '<br/>'
          // ret += "Webpage: " + title + '<br/>'
          // ret += "Website: " + domain + '<br/>'
          let ret = "";
          let seen_it = [];
          if (this_entry.title) {
            ret +=
              "<b>" +
              '<span style="color:' +
              this.point.color +
              '">' +
              String(
                this.series.name.split("/")[
                  this.series.name.split("/").length - 1
                ]
              ) +
              "</span>" +
              "  Webpages Visited" +
              "</b>";
            ret += "<ul>";
            for (let title of this_entry.title) {
              if (!seen_it.includes(title)) {
                ret += "<li>" + title + "</li>";
                seen_it.push(title);
              }
            }
            ret += "</ul>";
          } else {
            // ret += JSON.stringify(this_entry)
            // if (this_entry.name !== "non-sensitive") {
            //   ret += String(this_entry.y.toFixed(0)) + "%" + " of your activity relates to this potentially sensitive topic " + "<b>" + this_entry.name + "</b>"
            // }
            // else {
            //   ret += String(this_entry.y.toFixed(0)) + "%" + " of your activity is " + this_entry.name
            // }
            ret += "<b>" + this_entry.name + "</b>";
          }

          let seen_it_trackers = [];
          if (this_entry.tracker_info[0].length != 0) {
            ret += "<b>" + "Trackers Found" + "</b><br/>";
            for (let trackers of this_entry.tracker_info) {
              for (let t of trackers) {
                if (!seen_it_trackers.includes(t)) {
                  ret += t + ", ";
                  seen_it_trackers.push(t);
                }
              }
            }
            ret = ret.slice(0, ret.length - 2); // remove comma plus space at end
          } else {
            ret += "<b>" + "No trackers found!" + "</b>";
          }

          return ret;
        },
      },

      credits: {
        enabled: false,
      },
      plotOptions: {
        packedbubble: {
          minSize: "20%",
          maxSize: "80%",
          zMin: 0,
          zMax: 1000,
          layoutAlgorithm: {
            gravitationalConstant: 0.05,
            splitSeries: true,
            seriesInteraction: false,
            dragBetweenSeries: false,
            parentNodeLimit: true,
            enableSimulation: false,
          },
          dataLabels: {
            enabled: true,
            format: "{point.name}",
            // filter: {
            //     property: 'y',
            //     operator: '>',
            //     value: 250
            // },
            style: {
              color: "black",
              textOutline: "none",
              fontWeight: "normal",
            },
          },
        },
      },
      series: data.outer,
      drilldown: {
        series: data.inner,
      },
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
  }
};

/*
  keepit
*/
const sensitive_info_pie = (slice, data) => {

  let numEntries = data ? data.length : 0;
  let actual_data = data ? data['all '].outer_all.length : 0;
  if (numEntries == 0 || actual_data == 0) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );
  } else {
    let data_to_render;
    if (slice == "today ") {
      data_to_render = data['today '];
    }
    if (slice == "last week ") {
      data_to_render = data['last week '];
    }
    if (slice == "last month ") {
      data_to_render = data['last month '];
    }
    if (slice == "all ") {
      data_to_render = data['all '];
    }

    var pieColors = (function () {
      var colors = [],
        base = Highcharts.getOptions().colors[0],
        i;

      for (i = 0; i < 10; i += 1) {
        // Start out with a darkened base color (negative brighten), and end
        // up with a much brighter color
        colors.push(
          Highcharts.color(base)
            .brighten((i - 3) / 7)
            .get()
        );
      }
      return colors;
    })();

    var adjustingLabels = false;

    function adjustLabelsRotation(chart) {
      if (chart.chartWidth < 2000 && chart.chartWidth > 700) {
        chart.xAxis[0].update({
          labels: {
            rotation: -30,
          },
        });
      } else if (chart.chartWidth < 700 && chart.chartWidth > 500) {
        chart.xAxis[0].update({
          labels: {
            rotation: -45,
          },
        });
      } else if (chart.chartWidth < 500) {
        chart.xAxis[0].update({
          labels: {
            rotation: -60,
          },
        });
      } else {
        chart.xAxis[0].update({
          labels: {
            rotation: 0,
          },
        });
      }
    }

    const options = {
      exporting: {
        enabled: true,
      },
      // title: {
      //     useHTML: true,
      //     text: `<span style="font-size:30px">Sensitive Online Activity</span><br>`,

      // },
      title: {
        useHTML: true,
        text: "", // text: `Trackers learn how you spend your time`,
      },
      // subtitle: {
      //     useHTML: true,
      //     text: `<span style="font-size:20px">😂 Oof that's a little personal, but thanks for sharing it with trackers anyways 😂</span><br/>`,
      // },
      // subtitle: {
      //   style: {
      //     font: '16px Verdana, sans-serif',
      //     color: 'lightgray'
      //   },
      //   text:
      //     document.ontouchstart === undefined
      //       ? "click on a slice for a breakdown"
      //       : "pinch the chart to zoom in",
      // },
      chart: {
        // zoomType: "xy",
        marginTop: 50,
        height: 500,
        events: {
          load: function () {
            adjustLabelsRotation(this);
          },
          redraw: function () {
            if (!adjustingLabels) {
              adjustingLabels = true;
              adjustLabelsRotation(this);
              adjustingLabels = false;
            }
          },
        },
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        type: "category",
        // textOverflow: 'none'
        // labels: {
        //     rotation: 30
        // }
        // labels: {
        //     rotation: [30]
        // },
        // align: 'right',
        // style: {
        //     fontSize: '13px',
        //     fontFamily: 'Verdana, sans-serif'
        // }
      },
      yAxis: {
        title: {
          text: null,
        },
        labels: {
          formatter: function () {
            return millisToReadable(this.value);
          },
        },
      },
      legend: {
        enabled: true,
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          // dataLabels: {
          //     enabled: true,
          //     format: '{point.y:.1f}%'
          // }
          animation: {
            duration: 0,
          },
        },
        pie: {
          allowPointSelect: true,
          // colors: pieColors,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            format: "<b>{point.name}</b>: {point.percentage:.1f} %",
          },
        },
      },

      // tooltip: {
      //     headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      //     pointFormat: '<span style="color:{point.color}">{point.name}</span>'
      // },
      tooltip: {
        useHTML: true,
        outside: true,
        position: "bottom",
        confine: true,
        formatter: function () {
          // return '<b>'+ this.point.name +'</b>: '+ this.point.y ;

          var serie = this.series;
          //NOTE: may cause efficiency issue when we got lots of points, data in series
          //should be change from [x, y] to {"x": x, "y": y, "index": index}
          var index = this.series.data.indexOf(this.point);
          var this_entry = serie.options.data[index];
          // var title = Object.values(this_entry[2])
          // var domain = Object.values(this_entry[3])
          // var inference = Object.values(this_entry[4])
          // var ret = '<b>' + String(moment(this.x).format("dddd, MMMM Do YYYY, h:mm:ss a")) + '</b>' + '<br/>'
          // ret += '<br/>'
          // ret += "Late night interest: " + inference + '<br/>'
          // ret += "Webpage: " + title + '<br/>'
          // ret += "Website: " + domain + '<br/>'
          let ret = "";
          let seen_it = [];
          if (this_entry.title) {
            ret += "<b>" + "Webpages Visited" + "</b>";
            ret += "<ul>";
            for (let title of this_entry.title) {
              if (!seen_it.includes(title)) {
                ret += "<li>" + title + "</li>";
                seen_it.push(title);
              }
            }
            ret += "</ul>";
          } else {
            // ret += JSON.stringify(this_entry)
            // if (this_entry.name !== "non-sensitive") {
            //   ret += String(this_entry.y.toFixed(0)) + "%" + " of your activity relates to this potentially sensitive topic " + "<b>" + this_entry.name + "</b>"
            // }
            // else {
            //   ret += String(this_entry.y.toFixed(0)) + "%" + " of your activity is " + this_entry.name
            // }
            ret += "<b>" + this_entry.name + "</b>";
          }
          return ret;
        },
      },
      // tooltip: {
      //     headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      //     pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
      // },
      series: [
        {
          name: "Online Engagement",
          type: "pie",
          colorByPoint: true,
          data: data_to_render.outer_all,
        },
      ],
      drilldown: {
        series: data_to_render.last_layer,
      },
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
  }
};

/*
  keepit
*/
const visual_activity = (data) => {
  let numEntries = data ? data.length : 0;
  if (numEntries == 0) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );
  } else {
    Highcharts.setOptions({
      global: {
        /**
         * Use moment-timezone.js to return the timezone offset for individual
         * timestamps, used in the X axis labels and the tooltip header.
         */
        getTimezoneOffset: function (timestamp) {
          let d = new Date();
          let timezoneOffset = d.getTimezoneOffset();

          return timezoneOffset;
        },
      },
    });

    let chart_type = "areaspline";
    for (let obj of data) {
      let entry = obj["data"];
      if (entry.length == 1) {
        chart_type = "column";
      }
    }

    var adjustingLabels = false;

    function adjustLabelsRotation(chart) {
      if (chart.chartWidth < 2000 && chart.chartWidth > 700) {
        chart.xAxis[0].update({
          labels: {
            rotation: -30,
          },
        });
      } else if (chart.chartWidth < 700 && chart.chartWidth > 500) {
        chart.xAxis[0].update({
          labels: {
            rotation: -45,
          },
        });
      } else if (chart.chartWidth < 500) {
        chart.xAxis[0].update({
          labels: {
            rotation: -60,
          },
        });
      } else {
        chart.xAxis[0].update({
          labels: {
            rotation: 0,
          },
        });
      }
    }

    var days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    var myDateFormat = "%d/%m/%Y";

    const options = {
      title: {
        text: "", // text: `Trackers learn when you are (or are not) looking for something in particular`
      },
      // subtitle: {
      //   text:
      //     document.ontouchstart === undefined
      //       ? "Click and drag in the plot area to zoom in"
      //       : "Pinch the chart to zoom in",
      // },
      chart: {
        type: chart_type,
        zoomType: "xy",
        events: {
          load: function () {
            adjustLabelsRotation(this);
          },
          redraw: function () {
            if (!adjustingLabels) {
              adjustingLabels = true;
              adjustLabelsRotation(this);
              adjustingLabels = false;
            }
          },
        },
      },
      credits: {
        enabled: false,
      },
      yAxis: {
        title: {
          text: null,
        },
        labels: {
          formatter: function () {
            return millisToReadable(this.value);
          },
        },
      },
      xAxis: {
        title: {
          text: "Date",
        },
        type: "datetime",
        title: {
          enabled: true,
          text: "Days",
        },
        tickInterval: 60 * 60 * 1000 * 24,
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true,
        // Use the date format in the
        // labels property of the chart
        labels: {
          formatter: function () {
            return Highcharts.dateFormat("%b - %d (%a)", this.value);
          },
        },
      },

      plotOptions: {
        series: {
          marker: {
            enabled: false,
          },
          animation: {
            duration: 0,
          },
        },
      },

      // tooltip: {
      //     headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      //     pointFormat: '<span style="color:{point.color}">{point.name}</span>'
      // },
      tooltip: {
        useHTML: true,
        outside: true,
        position: "bottom",
        confine: true,
        formatter: function () {
          // return '<b>'+ this.point.name +'</b>: '+ this.point.y ;

          var serie = this.series;
          //NOTE: may cause efficiency issue when we got lots of points, data in series
          //should be change from [x, y] to {"x": x, "y": y, "index": index}
          var index = this.series.data.indexOf(this.point);
          var this_entry = serie.options.data[index];
          var title = Object.values(this_entry[7]);
          // var domain = Object.values(this_entry[3])
          // var inference = Object.values(this_entry[4])
          // var ret = '<b>' + String(moment(this.x).format("dddd, MMMM Do YYYY, h:mm:ss a")) + '</b>' + '<br/>'
          // ret += '<br/>'
          // ret += "Late night interest: " + inference + '<br/>'
          // ret += "Webpage: " + title + '<br/>'
          // ret += "Website: " + domain + '<br/>'
          let ret = "";
          let seen_it = [];
          if (title) {
            ret +=
              "<b>" +
              '<span style="color:' +
              this.point.color +
              '">' +
              this.series.name +
              "</span>" +
              "  Webpages Visited" +
              "</b>";
            ret += "<ul>";
            for (let t of title) {
              if (!seen_it.includes(t)) {
                ret += "<li>" + t + "</li>";
                seen_it.push(t);
              }
            }
            ret += "</ul>";
          } else {
            // ret += JSON.stringify(this_entry)
            // if (this_entry.name !== "non-sensitive") {
            //   ret += String(this_entry.y.toFixed(0)) + "%" + " of your activity relates to this potentially sensitive topic " + "<b>" + this_entry.name + "</b>"
            // }
            // else {
            //   ret += String(this_entry.y.toFixed(0)) + "%" + " of your activity is " + this_entry.name
            // }
            ret += "<b>" + serie + "</b>";
          }
          return ret;
        },
      },
      // tooltip: {
      //     headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      //     pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
      // },
      series: data,
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
  }
};

/*
  keepit
*/
const heatMap_newer = (slice, allData) => {
  let numEntries = allData ? Object.keys(allData).length : 0;
  let numInAll_day = allData ? allData.day.length : 0;
  let numInAll_week = allData ? allData.week.length : 0;
  let numInAll_month = allData ? allData.month.length : 0;
  let numInAll_all = allData ? allData.all.length : 0;

  let choice;
  if (slice == "today") {
    choice = numInAll_day;
  }
  if (slice == "last week") {
    choice = numInAll_week;
  }
  if (slice == "last month") {
    choice = numInAll_month;
  }
  if (slice == "all") {
    choice = numInAll_all;
  }

  if (numEntries === 0 || choice === 0) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );

    //
  } else {

    // for each slice
    // bin the date to hour
    // // <day of week> <hour> <value> <tooltip>

    let data_to_render;
    if (slice == "today") {
      data_to_render = allData.day;
    }
    if (slice == "last week") {
      data_to_render = allData.week;
    }
    if (slice == "last month") {
      data_to_render = allData.month;
    }
    if (slice == "all") {
      data_to_render = allData.all;
    }

    // get top time in this slice
    let tops = [];
    let all_times = [];
    let top_time = 0;
    let all_activity_in_slice = new Object();
    for (let slice of data_to_render) {
      if (slice[2] > top_time) {
        if (!all_times.includes(slice[2])) {
          all_times.push(slice[2]);
        }
        top_time = slice[2];
      }
      for (let activity of slice[3].grouped_interests) {
        if (activity[0] in all_activity_in_slice) {
          let current = all_activity_in_slice[activity[0]];
          all_activity_in_slice[activity[0]] = current + activity[1];
        } else {
          all_activity_in_slice[activity[0]] = activity[1];
        }
      }
    }

    let custom_bins = new Array();
    var histGenerator = d3
      .histogram()
      .domain([0, top_time]) // Set the domain to cover the entire intervall [0;]
      .thresholds(7); // number of thresholds
    var bins = histGenerator(all_times);
    var rainbow = new Rainbow();
    rainbow.setNumberRange(1, bins.length);
    rainbow.setSpectrum("yellow", "red");

    let count = 0;
    for (let bin of bins) {
      let min = bin.x0;
      let max = bin.x1;
      var hexColour = rainbow.colourAt(count);
      let entry;
      if (count == 0) {
        entry = { min: min, max: max, color: "#" + hexColour, label: "0" };
      } else if (count == bins.length - 1) {
        entry = {
          min: min,
          max: max,
          color: "#" + hexColour,
          label: millisToReadable(max),
        };
      } else {
        entry = { min: min, max: max, color: "#" + hexColour, label: " " };
      }
      custom_bins.push(entry);
      count += 1;
    }

    // <div className="App">
    //   <Heatmap
    //     data={data_to_render}

    //     valueColumn="count"
    //     dateColumn="date"
    //     popup={
    //       (heatmap) => (
    //         <div>
    //         {heatmap.data.value ? (
    //           <div>
    //             <Card>
    //               <CardHeader title="Time Tracked" />
    //               <CardContent>
    //                 <b>Overall Time Tracked</b>: {fancyTimeFormat(heatmap.data.value)}
    //                 <br/>
    //                 <b>No. Webpages</b>: {JSON.stringify(heatmap.data.minutes.map(r => r.data).filter(r => r.count > 0).map(entry => entry.total_webpage_count).reduce(add,0))}
    //                 <br/>
    //                 <b>Breakdown</b> (top 10): <br/>
    //                 <Divider />
    //                 {heatmap.data.minutes.map(r => r.data).filter(r => r.count > 0).map(entry => (entry.interest_overview.length == 0) ? ( [0] ) : (entry.interest_overview)).reduce(set_combine, new Object(), 0 , 0 ).map(item => <ul><li> {item[0]} : {fancyTimeFormat(item[1])} </li></ul>)      }
    //                 <Divider />
    //               </CardContent>
    //             </Card>
    //           </div>
    //         ) : (
    //           null
    //         )}
    //         </div>
    //       )
    //     }

    //   />
    // </div>

    const hours = [
      "12a",
      "1a",
      "2a",
      "3a",
      "4a",
      "5a",
      "6a",
      "7a",
      "8a",
      "9a",
      "10a",
      "11a",
      "12p",
      "1p",
      "2p",
      "3p",
      "4p",
      "5p",
      "6p",
      "7p",
      "8p",
      "9p",
      "10p",
      "11p",
    ];
    // prettier-ignore
    const days = [
    'Saturday', 'Friday', 'Thursday',
    'Wednesday', 'Tuesday', 'Monday', 'Sunday'
];
    let number_to_display = {
      6: "Sunday",
      5: "Monday",
      4: "Tuesday",
      3: "Wednesday",
      2: "Thursday",
      1: "Friday",
      0: "Saturday",
    };
    let number_to_display_times = {
      0: " at dawn",
      1: " at dawn",
      2: " at dawn",
      3: " at dawn",
      4: " at dawn",
      5: " early mornings",
      6: " early mornings",
      7: " in the mornings",
      8: " in the mornings",
      9: " mid-morning",
      10: " mid-morning",
      11: " mid-morning",
      12: " at noon",
      13: " early afternoon",
      14: " mid afternoon",
      15: " mid afternoon",
      16: " late afternoon",
      17: " around dinnertime",
      18: " around dinnertime",
      19: " in the evening",
      20: " in the evenings",
      21: " in the late evening",
      22: " late at night",
      23: " late at night",
      24: " at midnight",
    };
    // prettier-ignore
    // const this_data = [[0, 0, 50, {"this": "- that"}], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2], [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1], [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0], [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]]

    const this_data = data_to_render
    .map(function (item) {
    return [item[1], item[0], item[2] || '-', item[3] || "-", item[2] || '-',];
});

    const option = {
      // title: {
      //   top: 0,
      //   fontStyle: "normal",
      //   fontWeight: "lighter",
      //   left: "center",
      //   // text: `Trackers learn when you spend your time`,
      //   // subtext: `Hover over a time-slice for more information`,
      // },
      // tooltip: {
      //   position: 'bottom',
      //   confine: true,
      //   formatter: function (params) {

      //   return `${params.seriesName}<hr>
      //           <b>Total Time</b>: ${millisToReadable(params.data[2])}<br/>
      //           <b>Total Webpages</b>: ${JSON.stringify(params.data[3].webpage_count)}<br/>
      //           <b>Interests</b>: ${params.data[3].grouped_interests.map(n=>"<br/>- " + n[0] + ": " + String(millisToReadable(n[1]) ))   }`;
      //   }

      // },

      tooltip: {
        position: "bottom",
        confine: true,
        formatter: function (params) {
          // return `${  JSON.stringify(params.data)  }`;
          // }
          return `${
            "<b>" +
            number_to_display[params.data[1]] +
            number_to_display_times[params.data[0]] +
            "</b>"
          }
            ${
              "<ul>" +
              params.data[3].grouped_interests
                .map(
                  (n) =>
                    "<li>" +
                    n[0] +
                    ": " +
                    String(millisToReadable(n[1])).replaceAll(",", "") +
                    "</li>"
                )
                .join("") +
              "</ul>"
            }`;
        },
      },

      grid: {
        height: "50%",
        top: "20%",
      },
      xAxis: {
        type: "category",
        data: hours,
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: "category",
        data: days,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: 0,
        max: top_time,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "5%",
      },
      series: [
        {
          name: "Targeting Times",
          type: "heatmap",
          data: this_data,
          label: {
            show: false,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };

    return <ReactECharts option={option} />;
  }
};

/*
  keepit
*/
const heatMap_newer_radial = (slice, allData) => {
  let numEntries = allData ? Object.keys(allData).length : 0;
  let numInAll_day = allData ? allData.day.length : 0;
  let numInAll_week = allData ? allData.week.length : 0;
  let numInAll_month = allData ? allData.month.length : 0;
  let numInAll_all = allData ? allData.all.length : 0;

  let choice;
  if (slice == "today") {
    choice = numInAll_day;
  }
  if (slice == "last week") {
    choice = numInAll_week;
  }
  if (slice == "last month") {
    choice = numInAll_month;
  }
  if (slice == "all") {
    choice = numInAll_all;
  }

  if (numEntries === 0 || choice === 0) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );

    //
  } else {
    // the allData object has time slices built in

    // for each slice
    // bin the date to hour
    // // <day of week> <hour> <value> <tooltip>

    let data_to_render;
    if (slice == "today") {
      data_to_render = allData.day;
    }
    if (slice == "last week") {
      data_to_render = allData.week;
    }
    if (slice == "last month") {
      data_to_render = allData.month;
    }
    if (slice == "all") {
      data_to_render = allData.all;
    }


    // get top time in this slice
    // get custom bins from this slice
    let tops = [];
    let all_times = [];
    let top_time = 0;
    let all_activity_in_slice = new Object();
    for (let slice of data_to_render) {
      if (slice[2] > top_time) {
        if (!all_times.includes(slice[2])) {
          all_times.push(slice[2]);
        }
        top_time = slice[2];
      }
      for (let activity of slice[3].grouped_interests) {

        if (activity[0] in all_activity_in_slice) {
          let current = all_activity_in_slice[activity[0]];
          all_activity_in_slice[activity[0]] = current + activity[1];
        } else {
          all_activity_in_slice[activity[0]] = activity[1];
        }
      }
    }
    let custom_bins = new Array();
    var histGenerator = d3
      .histogram()
      .domain([0, top_time]) // Set the domain to cover the entire intervall [0;]
      .thresholds(3); // number of thresholds; this will create 19+1 bins
    var bins = histGenerator(all_times);
    var rainbow = new Rainbow();
    rainbow.setNumberRange(1, bins.length);
    rainbow.setSpectrum("#efecec", "#861657");

    let count = 0;
    for (let bin of bins) {
      let min = bin.x0;
      let max = bin.x1;
      var hexColour = rainbow.colourAt(count);
      let entry;
      if (count == 0) {
        entry = { min: min, max: max, color: "#" + hexColour, label: "0" };
      } else if (count == bins.length - 1) {
        entry = {
          min: min,
          max: max,
          color: "#" + hexColour,
          label: millisToReadable(max),
        };
      } else {
        entry = { min: min, max: max, color: "#" + hexColour, label: " " };
      }
      custom_bins.push(entry);
      count += 1;
    }

    const this_data = data_to_render
    .map(function (item) {
    return [item[1], item[0], item[2] || '-', item[3] || "-", item[2] || '-',];
});


    // prettier-ignore
    const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];
    // prettier-ignore
    const days = ['Saturday', 'Friday', 'Thursday', 'Wednesday', 'Tuesday', 'Monday', 'Sunday'];
    let number_to_display = {
      6: "Sunday",
      5: "Monday",
      4: "Tuesday",
      3: "Wednesday",
      2: "Thursday",
      1: "Friday",
      0: "Saturday",
    };
    let number_to_display_times = {
      0: " at dawn",
      1: " at dawn",
      2: " at dawn",
      3: " at dawn",
      4: " at dawn",
      5: " early mornings",
      6: " early mornings",
      7: " in the mornings",
      8: " in the mornings",
      9: " mid-morning",
      10: " mid-morning",
      11: " mid-morning",
      12: " at noon",
      13: " early afternoon",
      14: " mid afternoon",
      15: " mid afternoon",
      16: " late afternoon",
      17: " around dinnertime",
      18: " around dinnertime",
      19: " in the evening",
      20: " in the evenings",
      21: " in the late evening",
      22: " late at night",
      23: " late at night",
      24: " at midnight",
    };
    // prettier-ignore
    // const data = [[0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2], [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1], [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0], [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]];
    // const maxValue = data.reduce(function (max, item) {
    //   return Math.max(max, item[2]);
    // }, -Infinity);
    const option = {
  // legend: {
  //   data: ['Punch Card']
  // },
  polar: {},
  tooltip: {
    position: 'bottom',
    confine: true,
    formatter: function (params) {

    return `${"<b>" + number_to_display[params.data[0]] + number_to_display_times[params.data[1]] + "</b>"}
            ${params.data[3].grouped_interests.map(n=>"<br/>- " + n[0] + ": " + String(millisToReadable(n[1]) ))   }`;
    }
    
  },
  visualMap: {
    type: 'piecewise', //continous piecewise
    min: 0,
    max: top_time,
    top: 'middle',
    dimension: 2,
    calculable: false,
    pieces: custom_bins,
  },
  angleAxis: {
    type: 'category',
    data: hours,
    boundaryGap: true,
    splitLine: {
      show: true,
      lineStyle: {
        color: '#ddd',
        type: 'dashed'
      }
    },
    axisLine: {
      show: false
    }
  },
  radiusAxis: {
    type: "category",
    data:days,
    axisLabel: {
      interval: 0,
      rotate: 0 // 30 If the label names are too long you can manage this by rotating the label.
    },
    z: 100
  },
  series: [
    {
      name: 'Targeting Times',
      type: 'custom',
      coordinateSystem: 'polar',
      itemStyle: {
        color: '#d14a61'
      },
      renderItem: function (params, api) {
        var values = [api.value(0), api.value(1)];
        var coord = api.coord(values);
        var size = api.size([1, 1], values);
        return {
          type: 'sector',
          shape: {
            cx: params.coordSys.cx,
            cy: params.coordSys.cy,
            r0: coord[2] - size[0] / 2,
            r: coord[2] + size[0] / 2,
            startAngle: -(coord[3] + size[1] / 2),
            endAngle: -(coord[3] - size[1] / 2)
          },
          style: api.style({
            fill: api.visual('color')
          })
        };
      },
      data: data_to_render
    }
  ]
};

    return <ReactECharts option={option} />;
  }
};

/*
  keepit
*/
const heatMap_overview = (slice, allData) => {
  let numEntries = allData ? Object.keys(allData).length : 0;

  if (numEntries !== 0) {
    if (allData.all.length == 0) {
      return (
        <p>Trackers get hungry too, visit some websites and feed them data!</p>
      );
    } else {
      // the allData object has time slices built in
      // for each slice
      // bin the date to hour
      // // <day of week> <hour> <value> <tooltip>

      let data_to_render;
      if (slice == "today") {
        data_to_render = allData.day;
      }
      if (slice == "last week") {
        data_to_render = allData.week;
      }
      if (slice == "last month") {
        data_to_render = allData.month;
      }
      if (slice == "all") {
        data_to_render = allData.all;
      }


      // get top time in this slice
      let tops = [];
      let top_activity = "";
      let all_activity_in_slice = new Object();
      for (let slice of data_to_render) {
        // if (slice[2] > top_time) {
        //   top_time = slice[2]
        // }
        for (let activity of slice[3].grouped_interests) {
          // console.log(activity)

          if (activity[0] in all_activity_in_slice) {
            let current = all_activity_in_slice[activity[0]];
            all_activity_in_slice[activity[0]] = current + activity[1];
          } else {
            all_activity_in_slice[activity[0]] = activity[1];
          }
        }
      }
      let arr = Object.values(all_activity_in_slice);
      let min = Math.min(...arr);
      let max = Math.max(...arr);
      let top_interest_revised;
      for (let key of Object.keys(all_activity_in_slice)) {
        if (all_activity_in_slice[key] == max) {
          top_interest_revised = key;
        }
      }
      // let top_interest = Object.keys(all_activity_in_slice)[0];
      let top_time = millisToReadable(
        all_activity_in_slice[top_interest_revised]
      );

      try {
        // let info = data_to_render.map(entry => entry.interest_overview).reduce(set_combine, new Object(), 0 , 0 )
        // let top = info[Object.keys(info)[0]];
        // let top_interest = top[0]
        // let top_time = msToTime(top[1])

        return (
          <p>
            Top-Time Interest: <b>{top_interest_revised}</b>
            <br />
            Engagement: <b>{top_time}</b>
          </p>
        );
      } catch (e) {
        return (
          <p>
            Top-Time Interest: --pending--
            <br />
            Engagement: --pending--
          </p>
        );
      }
    }
  }
};

/*
  keepit
*/
const googleAdsSettings3_deepest = (data) => {
  let numEntries = data ? data.length : 0;
  let dataLength = data ? data["tree"]["children"].length : 0;

  if (numEntries === 0 || dataLength == 0) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );
  } else {
    const height_size = dataLength * 150;

    let last = Object.keys(data["depths"]).map((i) => Number(i));
    let deepest = Math.max(...last);
    let deepest_interest = data["depths"][String(deepest)];

    return (
      <List_grommet
        primaryKey={(item) => (
          <Text_grommet key={item} size="15px">
            {item}
          </Text_grommet>
        )}
        data={deepest_interest.map((entry) => entry.split("/")[deepest])}
      />
    );
  }
};

/*
  keepit
*/
const ads_overview_breakDown = (data) => {
  let numEntries = data ? data.length : 0;
  let dataLength = data ? Object.values(data["breakdown"]).length != 0 : 0;

  if (numEntries === 0 || dataLength == 0) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );
  } else {
    var result = Object.entries(data["breakdown"]);
    let to_render = [];
    for (let entry of result) {
      to_render.push({ category: entry[0], count: entry[1] });
    }
    let at_most = 10;
    to_render = to_render
      .sort((a, b) => (a.count > b.count ? 1 : -1))
      .reverse();
    to_render = to_render.slice(0, at_most);

    return (
      <List_grommet
        primaryKey={(item) => (
          <Text_grommet size="13px">{item.category}</Text_grommet>
        )}
        secondaryKey={(item) => (
          <Text_grommet size="11px">{item.count}</Text_grommet>
        )}
        data={to_render}
      />
    );
  }
};

/*
  keepit
*/
const googleAdsSettings3_deepest_totals = (data) => {
  let numEntries = data ? data.length : 0;
  let dataLength = data ? data["tree"]["children"].length : 0;

  if (numEntries === 0 || dataLength == 0) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );
  } else {
    // const height_size = dataLength * 150


    return (
      <Box
        direction="column"
        alignSelf="center"
        align="center"
        pad={{ bottom: "xsmall" }}
      >
        <Text_grommet size="100px" weight="bold">
          {data["total_counts"]}
        </Text_grommet>
        <br />
        <Text_grommet
          pad="medium"
          align="center"
          color="dark-3"
          margin="medium"
          size="small"
        >
          Total count of interests (excluding demographics)
        </Text_grommet>
      </Box>
    );
  }
};

/*
  keepit
*/
const ads_overview_totalCount_count = (data) => {
  let numEntries = data ? data.length : 0;
  let dataLength = data ? Object.values(data.breakdown).length != 0 : 0;

  if (numEntries === 0 || dataLength == 0) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );
  } else {
    // const height_size = dataLength * 150


    return (
      <Box
        direction="column"
        alignSelf="center"
        align="center"
        pad={{ bottom: "xsmall" }}
      >
        <Text_grommet size="100px" weight="bold">
          {data["totals"]}
        </Text_grommet>
        <br />
        <Text_grommet
          pad="medium"
          align="center"
          color="dark-3"
          margin="medium"
          size="small"
        >
          Total count of ads targeted to you
        </Text_grommet>
      </Box>
    );
  }
};

/*
  keepit
*/
const ads_overview_totalCount_cost = (data) => {
  let numEntries = data ? data.length : 0;
  let dataLength = data ? Object.values(data.breakdown).length != 0 : 0;

  if (numEntries === 0 || dataLength == 0) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );
  } else {


    return (
      <Box alignSelf="center" align="center">
        <Stack anchor="top-right">
          <Box
            alignSelf="center"
            align="center"
            border={{ color: "accent-1", size: "medium" }}
            round="medium"
            pad="small"
            margin="medium"
            gap="small"
            width={{ max: "medium" }}
            responsive={true}
          >
            <Text_grommet size="5xl" weight="bold">
              {"$" + (data["totals"] * .63).toFixed(2)}
            </Text_grommet>
          </Box>
          <br />
          <Tip
            plain
            content={
              <Box
                background="light-1"
                round="medium"
                pad="small"
                margin="small"
                gap="small"
                width={{ max: "medium" }}
                responsive={false}
              >
                {" "}
                <Text_grommet weight="bold" color="status-error">
                  Estimated Cost
                </Text_grommet>{" "}
                <Text_grommet size="small">
                  {" "}
                  Advertisers pay to serve you ads. It can cost an advertiser 
                  as much as $6.73 per click for a a single ad. This pricing is
                  dependent on many factors, including the type of ad being served, 
                  whether the ad is served within a website or on google search results, 
                  and the adavertisers' rating. Here, we
                  assume the low-end cost of displaying an advertisement ($0.63)
                  multiplied by the number of ads you've been served.{" "}
                </Text_grommet>{" "}
              </Box>
            }
            dropProps={{ align: { top: "bottom" } }}
          >
            <CircleInformation color="light-5" size="45px" />
          </Tip>
        </Stack>
      </Box>
    );
  }
};

/*
  keepit
*/
const googleAdsSettings3_deepest_bars = (data, depth) => {
  let numEntries = data ? data.length : 0;
  let dataLength = data ? depth["tree"]["children"].length : 0;

  if (numEntries === 0 || dataLength == 0) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );
  } else {
    let max_y = 0;
    let min_y = 1000000;
    for (let obj of data) {
      let this_max_y = obj.data.reduce((a, b) => (a.y > b.y ? a : b)).y;
      let this_min_y = obj.data.reduce((a, b) => (a.y < b.y ? a : b)).y;
      if (this_max_y > max_y) {
        max_y = this_max_y;
      }
      if (this_min_y < min_y) {
        min_y = this_min_y;
      }
    }

    let last = Object.keys(depth["depths"]).map((i) => Number(i));
    let deepest = Math.max(...last);
    let deepest_length = depth["depths"][String(deepest)].length;

    const options = {
      chart: {
        type: "column",
        zoomType: "xy",
        backgroundColor: "rgba(0,0,0,0)",
        // width: Math.max(((deepest_length * 200) - (deepest_length * 100) * .10), 500),
        // height: Math.max(((deepest_length * 100) - (deepest_length * 100) * .40), 200),
        // events: {
        //   load: function () {
        //     this.reflow()
        //   },
        //   // redraw: function () {
        //   //   this.reflow()
        //   // }
        // }
        events: {
          // load() {
          //   setTimeout(this.reflow.bind(this), 0);
          // },
        },
        // marginBottom: 50
      },
      // responsive: {
      //     rules: [{
      //         condition: {
      //             maxWidth: 450
      //         },
      //         // Make the labels less space demanding on mobile
      //         // chartOptions: {
      //         //     xAxis: {
      //         //         labels: {
      //         //             formatter: function () {
      //         //                 return this.value.charAt(0);
      //         //             }
      //         //         }
      //         //     },
      //         //     yAxis: {
      //         //         labels: {
      //         //             align: 'left',
      //         //             x: 0,
      //         //             y: -2
      //         //         },
      //         //         title: {
      //         //             text: ''
      //         //         }
      //         //     }
      //         // }
      //     }]
      // },
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          borderRadius: 5,
          groupPadding: 0,
          pointPadding: 0.1,
          borderWidth: 0,
          animation: {
            duration: 0,
          },
        },
        column: {
          grouping: false,
          pointPlacement: null,
          // events: {
          //   legendItemClick: function() {
          //     if (!this.visible) {
          //       this.chart.xAxis[0].update({
          //         breaks: []
          //       });
          //     } else {
          //       this.chart.xAxis[0].update({
          //         breaks: [{
          //           from: this.xData[0] - 0.5,
          //           to: this.xData[0] + 0.5,
          //           breakSize: 0
          //         }]
          //       });
          //     }
          //   }
          // }
        },
      },
      xAxis: {
        labels: {
          enabled: true,
        },
        visible: false,
      },
      yAxis: {
        title: {
          enabled: false,
        },
        min: parseInt(min_y - min_y * 0.2),
        // visible: false,
        gridLineColor: "#ffffff",
        lineColor: "#ffffff",
        plotLines: [
          {
            color: "#FF0000",
            width: 2,
            value: max_y,
            label: {
              text: String(max_y),
              align: "right",
              rotation: 0,
              // y: 3
            },
          },
        ],
      },
      tooltip: {
        style: {
          pointerEvents: "auto",
        },
        useHTML: true,
        outside: true,
        position: "bottom",
        confine: true,
        formatter: function () {
          // return '<b>'+ this.point.name +'</b>: '+ this.point.y ;

          var serie = this.series;
          //NOTE: may cause efficiency issue when we got lots of points, data in series
          //should be change from [x, y] to {"x": x, "y": y, "index": index}
          var index = this.series.data.indexOf(this.point);
          var this_entry = serie.options.data[index];
          // var title = Object.values(this_entry[2])
          // var domain = Object.values(this_entry[3])
          // var inference = Object.values(this_entry[4])
          // var ret = '<b>' + String(moment(this.x).format("dddd, MMMM Do YYYY, h:mm:ss a")) + '</b>' + '<br/>'
          // ret += '<br/>'
          // ret += "Late night interest: " + inference + '<br/>'
          // ret += "Webpage: " + title + '<br/>'
          // ret += "Website: " + domain + '<br/>'

          // let ret = JSON.stringify(this_entry)
          let ret = String(
            moment(this_entry.date).format("dddd, MMMM Do, hh:mm a")
          );
          ret += "</br></br><b>" + this_entry.y + " Interests </b>";
          if (this_entry["diff"].length != 0) {
            ret +=
              "<br/><br/>" +
              "New:" +
              "<br/>" +
              this_entry.diff.map(
                (entry) =>
                  entry.value.split("/")[entry.value.split("/").length - 1]
              );
          }

          return ret;

          // const tooltip_style = {
          //     overflow: 'visible !important',
          //     position: 'relative',
          //     zIndex: '50',
          //     border: '2px solid rgb(0, 108, 169)',
          //     borderRadius: '5px',
          //     backgroundColor: '#ffffff',
          //     padding: '5px',
          //     fontSize: '9pt',

          //   };
        },
      },

      legend: {
        enabled: true,
      },
      title: {
        style: {
          display: "none",
        },
      },
      series: data,
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
  }
};

/*
  keepit
*/
const googleAdsSettings3_deepest_bars2 = (data, depth) => {
  let numEntries = data ? data.length : 0;
  let dataLength = data ? depth["tree"]["children"].length : 0;

  if (numEntries === 0 || dataLength == 0) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );
  } else {


    const options = {
      exporting: {
        enabled: true,
      },
      chart: {
        type: "area",
        zoomType: "x",
        // backgroundColor: 'rgba(0,0,0,0)',
        // width: Math.max(((deepest_length * 200) - (deepest_length * 100) * .10), 500),
        // height: Math.max(((deepest_length * 100) - (deepest_length * 100) * .40), 200),
        // events: {
        //   load: function () {
        //     this.reflow()
        //   },
        //   // redraw: function () {
        //   //   this.reflow()
        //   // }
        // }
        // events: {
        //   // load() {
        //   //   setTimeout(this.reflow.bind(this), 0);
        //   // },
        // },
        // marginBottom: 50
      },
      // responsive: {
      //     rules: [{
      //         condition: {
      //             maxWidth: 450
      //         },
      //         // Make the labels less space demanding on mobile
      //         // chartOptions: {
      //         //     xAxis: {
      //         //         labels: {
      //         //             formatter: function () {
      //         //                 return this.value.charAt(0);
      //         //             }
      //         //         }
      //         //     },
      //         //     yAxis: {
      //         //         labels: {
      //         //             align: 'left',
      //         //             x: 0,
      //         //             y: -2
      //         //         },
      //         //         title: {
      //         //             text: ''
      //         //         }
      //         //     }
      //         // }
      //     }]
      // },
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          // borderRadius: 5,
          // groupPadding: 0,
          // pointPadding: 0.1,
          // borderWidth: 0,
          animation: {
            duration: 0,
          },
        },

        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [
                1,
                Highcharts.color(Highcharts.getOptions().colors[0])
                  .setOpacity(0)
                  .get("rgba"),
              ],
            ],
          },
          marker: {
            radius: 2,
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1,
            },
          },
          threshold: null,
        },

        // column: {
        //   grouping: false,
        //   pointPlacement: null,
        //   // events: {
        //   //   legendItemClick: function() {
        //   //     if (!this.visible) {
        //   //       this.chart.xAxis[0].update({
        //   //         breaks: []
        //   //       });
        //   //     } else {
        //   //       this.chart.xAxis[0].update({
        //   //         breaks: [{
        //   //           from: this.xData[0] - 0.5,
        //   //           to: this.xData[0] + 0.5,
        //   //           breakSize: 0
        //   //         }]
        //   //       });
        //   //     }
        //   //   }
        //   // }
        // },
      },
      xAxis: {
        labels: {
          enabled: true,
        },
        visible: false,
      },
      yAxis: {
        // title: {
        //   enabled: false
        // },
        title: {
          text: "Number of Interests",
        },
        tickInterval: 1,
        // min: parseInt(min_y - (min_y * .20)),
        // // visible: false,
        // // gridLineColor: '#ffffff',
        // // lineColor: '#ffffff',
        // plotLines: [{
        //     color: '#FF0000',
        //     width: 2,
        //     value: max_y,
        //     label: {
        //       text: String(max_y),
        //       align: 'right',
        //       rotation: 0,
        //       // y: 3
        //     }
        // }]
      },
      tooltip: {
        style: {
          pointerEvents: "auto",
        },
        crosshairs: true,
        useHTML: true,
        outside: true,
        position: "bottom",
        confine: true,
        formatter: function () {
          // return '<b>'+ this.point.name +'</b>: '+ this.point.y ;

          var serie = this.series;
          //NOTE: may cause efficiency issue when we got lots of points, data in series
          //should be change from [x, y] to {"x": x, "y": y, "index": index}
          var index = this.series.data.indexOf(this.point);
          var this_entry = serie.options.data[index];
          // var title = Object.values(this_entry[2])
          // var domain = Object.values(this_entry[3])
          // var inference = Object.values(this_entry[4])
          // var ret = '<b>' + String(moment(this.x).format("dddd, MMMM Do YYYY, h:mm:ss a")) + '</b>' + '<br/>'
          // ret += '<br/>'
          // ret += "Late night interest: " + inference + '<br/>'
          // ret += "Webpage: " + title + '<br/>'
          // ret += "Website: " + domain + '<br/>'

          // let ret = JSON.stringify(this_entry)
          let ret = String(
            moment(this_entry.date).format("dddd, MMMM Do, hh:mm a")
          ); //entry.value.split("/")[entry.value.split("/").length-1]
          ret += "</br></br><b>" + this_entry.y + " Interests </b>";
          if (this_entry["diff"].length != 0) {
            ret += "<br/><br/>" + "<b>New:</b>" + "<br/>";
            for (let interest of this_entry.diff) {
              if (interest.type == "interest - company") {
                ret += "This company: " + interest.value + ", ";
              } else {
                ret +=
                  interest.value.split("/")[
                    interest.value.split("/").length - 1
                  ] + ", ";
              }
            }
            ret = ret.slice(0, ret.length - 2); // remove comma plus space at end

            if (this_entry["pages_visited"].length != 0) {
              ret +=
                "<br/><br/>" +
                "<b>Pages visited around this time:</b>" +
                "<br/>" +
                "<ul>" +
                this_entry.pages_visited
                  .map((entry) => "<li>" + entry + "</li>")
                  .join("") +
                "</ul>";
            }
          }

          return ret;

          // // const tooltip_style = {
          // //     overflow: 'visible !important',
          // //     position: 'relative',
          // //     zIndex: '50',
          // //     border: '2px solid rgb(0, 108, 169)',
          // //     borderRadius: '5px',
          // //     backgroundColor: '#ffffff',
          // //     padding: '5px',
          // //     fontSize: '9pt',

          // //   };
        },
      },

      legend: {
        enabled: true,
      },
      title: {
        style: {
          display: "none",
        },
      },
      series: data,
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
  }
};

/*
  keepit
*/
const googleAdsSettings3 = (data) => {
  let numEntries = data ? data.length : 0;
  let dataLength = data ? data["tree"]["children"].length : 0;

  if (numEntries === 0 || dataLength == 0) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );
  } else {
    const height_size = dataLength * 150;

    const optionsss = {
      title: {
        text: "",
      },
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",

        // formatter: function (params) {

        //   return `${params.seriesName}<br />
        //           ${params.name}: ${params.data.value} (${params.percent}%)<br />
        //           ${params.data.name1}: ${params.data.value1}`;
        // }
      },

      series: [
        {
          type: "tree",

          data: [data["tree"]],

          top: "1%",
          left: "7%",
          bottom: "1%",
          right: "20%",

          initialTreeDepth: 3,

          symbolSize: 9,

          label: {
            position: "left",
            verticalAlign: "middle",
            align: "right",
            fontSize: 12,
          },

          leaves: {
            label: {
              position: "right",
              verticalAlign: "middle",
              align: "left",
            },
          },

          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750,
        },
      ],
    };

    return <ReactECharts option={optionsss} style={{ height: height_size }} />;
  }
};

/*
  keepit
*/
const bedTimes_version2 = (data) => {
  let numEntries = data ? data.length : 0;
  if (numEntries == 0) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );
  } else {

    // if time less than 5AM, add 24 hours to it
    // https://jsfiddle.net/BlackLabel/5e6sfcuq/
    const thisssssdata = [
      [1634099380052, new Date(1634099380052).getHours() + 24],
      [1634174749441, new Date(1634174749441).getHours()],
      [1634099381052, new Date(1634099381052).getHours() + 24],
      [1634175669188, new Date(1634175669188).getHours()],
      [1634177482596, new Date(1634177482596).getHours()],
      [1634178241669, new Date(1634178241669).getHours()],
      [1634180550522, new Date(1634180550522).getHours()],
      [1634257349212, new Date(1634257349212).getHours()],
      [1634263982732, new Date(1634263982732).getHours()],
      [1634270485815, new Date(1634270485815).getHours() + 24],
      [
        1634270485815,
        24,
        {
          title: "Speed Concept | Trek Bikes",
        },
        {
          domain: "trekbikes.com",
        },
      ],
    ];

    ///////////////////////////////////////////////////////////////
    // https://jsfiddle.net/BlackLabel/5e6sfcuq/
    //////////////////////////////////////////////////////////////

    var adjustingLabels = false;

    function adjustLabelsRotation(chart) {
      if (chart.chartWidth < 2000 && chart.chartWidth > 700) {
        chart.xAxis[0].update({
          labels: {
            rotation: -30,
          },
        });
      } else if (chart.chartWidth < 700 && chart.chartWidth > 500) {
        chart.xAxis[0].update({
          labels: {
            rotation: -45,
          },
        });
      } else if (chart.chartWidth < 500) {
        chart.xAxis[0].update({
          labels: {
            rotation: -60,
          },
        });
      } else {
        chart.xAxis[0].update({
          labels: {
            rotation: 0,
          },
        });
      }
    }

    // parse all data and if a fifth index exists then it is a peak time and we need to log the averages
    let peak_inferences = [];
    let average_of_peaks;
    let average_pretty_print;
    let engagement_str;
    for (let time_entry of data) {
      let peak_time;
      try {
        peak_time = time_entry[5]["peak"];
        peak_inferences.push(time_entry[4]["inference"]);
      } catch (e) {
        peak_time = "undefined";
      }
      if (peak_time !== "undefined") {
        average_of_peaks = time_entry[5]["peak"];
        let minutes = String(average_of_peaks).split(".")[1];
        let actual_minutes = parseInt(
          String((parseFloat(minutes) * 100 + 1) % 60).slice(0.2)
        );
        // let actual_minutes = String(((minutes/10) * 60)).slice(0, 2)
        if (actual_minutes < 10) {
          actual_minutes = "0" + actual_minutes;
        }
        let hours = String(average_of_peaks).split(".")[0];
        if (parseInt(hours) % 24 <= 5 && parseInt(hours) % 24 > 0) {
          average_pretty_print =
            String(parseInt(hours) % 24) + ":" + String(actual_minutes) + " AM";
        } else {
          average_pretty_print =
            String(hours - 12) + ":" + String(actual_minutes) + " PM";
        }
        average_of_peaks = parseFloat(hours + "." + (actual_minutes / 60) * 10);
      }
    }

    if (peak_inferences.length != 0) {
      let inference_counts = _.countBy(peak_inferences, (inference) => {
        return inference;
      });
      let sorted = _.fromPairs(
        _.sortBy(_.toPairs(inference_counts), 1).reverse()
      );
      let top_activity = Object.keys(sorted)[0];
      let engagement = Object.values(sorted)[0];
      let engagement_saying = "";
      if (engagement > 1) {
        engagement_saying = "times";
      } else {
        engagement_saying = "time";
      }
      engagement_str =
        '<p style="font-size: 20;"> Go-To Late-Night Interest: <strong>' +
        top_activity +
        "</strong> (<em>happened " +
        engagement +
        " " +
        engagement_saying +
        "</em>)</p>";
    } else {
      let engagement_str = "";
    }

    Highcharts.setOptions({
      global: {
        /**
         * Use moment-timezone.js to return the timezone offset for individual
         * timestamps, used in the X axis labels and the tooltip header.
         */
        getTimezoneOffset: function (timestamp) {
          let d = new Date();
          let timezoneOffset = d.getTimezoneOffset();

          return timezoneOffset;
        },
      },
    });

    var days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const options = {
      chart: {
        zoomType: "xy",
        events: {
          load: function () {
            adjustLabelsRotation(this);
          },
          redraw: function () {
            if (!adjustingLabels) {
              adjustingLabels = true;
              adjustLabelsRotation(this);
              adjustingLabels = false;
            }
          },
        },
      },
      credits: {
        enabled: false,
      },
      title: {
        text: "", //text: 'Trackers learn when you go to sleep at night'
      },
      subtitle: {
        text:
          document.ontouchstart === undefined
            ? "Click and drag in the plot area to zoom in"
            : "Pinch the chart to zoom in",
      },
      xAxis: {
        type: "datetime",
        tickInterval: 60 * 60 * 1000 * 24, // if problems in more-than-week stack-up happen, then it starts here
        labels: {
          formatter() {
            // let day = new Date(this.value).getDay();

            // return days[day]
            // return JSON.stringify(this.value)
            return Highcharts.dateFormat("%b - %d (%a)", this.value);
          },
        },
        title: {
          enabled: true,
          margin: 60,
          text: engagement_str,
        },
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true,
        // type: 'datetime',
        // title: {
        //   enabled: true,
        //   text: 'Days'
        // },
        // startOnTick: true,
        // endOnTick: true,
        // showLastLabel: true,
        // // Use the date format in the
        // // labels property of the chart
        // labels:{
        //   formatter:function(){
        //     return Highcharts.dateFormat('%b - %d (%a)',this.value);
        //   }
        // }
      },
      // caption: {
      //     text: engagement_str
      // },
      yAxis: {
        title: {
          text: "Time of the Day",
        },
        // type:'datetime',
        // minorTickInterval: 7 * 24 * 3600 * 1000,
        // minorTickPosition:'outside',
        // minorTickLength:10,
        // minorTickWidth: 1,
        // minorGridLineWidth: 0,
        min: 18, // 6PM
        max: 29, // midnight + 5 = 5AM
        // tickAmount: 6,
        tickInterval: 1,
        // tickPositions: [18, 18.1, 18.2, 18.3, 18.4, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
        labels: {
          formatter() {
            let output;
            if (this.value <= 24) {
              output = String(this.value - 12) + "PM";
            } else {
              if (this.value == "25") {
                output = "1AM";
              }
              if (this.value == "26") {
                output = "2AM";
              }
              if (this.value == "27") {
                output = "3AM";
              }
              if (this.value == "28") {
                output = "4AM";
              }
              if (this.value == "29") {
                output = "5AM";
              }
            }
            return output;
          },
        },
        plotLines: [
          {
            color: "red",
            value: average_of_peaks, // Insert your average here
            width: "1.5",
            zIndex: 4, // To not get stuck below the regular plot lines or series
            label: {
              text:
                "<p style='color:red'>Late Night<br/>Average <br/>(" +
                average_pretty_print +
                ")</p>",
              align: "top",
              x: -10,
            },
          },
        ],
        // plotBands: [{ // nice area
        //           from: 19,
        //           to: 21,
        //           color: 'rgba(178, 239, 155, 0.2)',
        //           label: {
        //               text: `Good job, you're boring`,
        //               style: {
        //                   color: '#FFFFF',
        //                   fontSize: 13,

        //               }
        //           },
        //           zIndex: 3,
        //       }, { // Light breeze
        //           from: 21,
        //           to: 25,
        //           color: 'rgba(229, 79, 109, 0.2)',
        //           label: {
        //               text: 'Too late!',
        //               style: {
        //                   color: '#FFFFF',
        //                   fontSize: 13,

        //               }
        //           },
        //           zIndex: 3,
        //       }, { // Gentle breeze
        //           from: 25,
        //           to: 29,
        //           color: 'rgba(229, 79, 109, 0.6)',
        //           label: {
        //               text: 'Insanity',
        //               style: {
        //                   color: '#FFFFF',
        //                   fontSize: 13,

        //               }
        //           },
        //           zIndex: 3,
        //       }],
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        series: {
          marker: {
            enabled: true,
            radius: 7,
          },
          animation: {
            duration: 0,
          },
        },
        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [
                1,
                Highcharts.color(Highcharts.getOptions().colors[0])
                  .setOpacity(0)
                  .get("rgba"),
              ],
            ],
          },
          marker: {
            radius: 2,
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1,
            },
          },
          threshold: null,
        },
      },

      tooltip: {
        formatter: function () {
          //return ( moment(this.x).format("dddd, MMMM Do YYYY, h:mm:ss a") + '<br/>' + point)
          var serie = this.series;
          //NOTE: may cause efficiency issue when we got lots of points, data in series
          //should be change from [x, y] to {"x": x, "y": y, "index": index}
          var index = this.series.data.indexOf(this.point);
          var this_entry = serie.options.data[index];
          var title = Object.values(this_entry[2]);
          var domain = Object.values(this_entry[3]);
          var inference = Object.values(this_entry[4]);
          var ret =
            "<b>" +
            String(moment(this.x).format("dddd, MMMM Do YYYY, h:mm:ss a")) +
            "</b>" +
            "<br/>";
          ret += "<br/>";
          ret += "Late night interest: " + inference + "<br/>";
          // ret += "Webpage: " + title + '<br/>'
          // ret += "Website: " + domain + '<br/>'
          return ret;
        },
      },

      series: [
        {
          type: "areaspline",
          name: "Bedtime",
          zoneAxis: "y",
          zones: [
            { value: 18.0, color: "#14db49" },
            { value: 18.055276381909547, color: "#14db44" },
            { value: 18.110552763819097, color: "#14da40" },
            { value: 18.165829145728644, color: "#14da3b" },
            { value: 18.22110552763819, color: "#14da36" },
            { value: 18.276381909547737, color: "#14da32" },
            { value: 18.331658291457288, color: "#14d92d" },
            { value: 18.386934673366834, color: "#13d928" },
            { value: 18.44221105527638, color: "#13d924" },
            { value: 18.49748743718593, color: "#13d91f" },
            { value: 18.55276381909548, color: "#13d81b" },
            { value: 18.608040201005025, color: "#13d816" },
            { value: 18.66331658291457, color: "#15d813" },
            { value: 18.718592964824122, color: "#19d713" },
            { value: 18.77386934673367, color: "#1ed713" },
            { value: 18.829145728643216, color: "#22d713" },
            { value: 18.884422110552762, color: "#26d713" },
            { value: 18.939698492462313, color: "#2bd613" },
            { value: 18.99497487437186, color: "#2fd613" },
            { value: 19.050251256281406, color: "#33d613" },
            { value: 19.105527638190956, color: "#38d512" },
            { value: 19.160804020100503, color: "#3cd512" },
            { value: 19.21608040201005, color: "#40d512" },
            { value: 19.271356783919597, color: "#45d512" },
            { value: 19.326633165829147, color: "#49d412" },
            { value: 19.381909547738694, color: "#4dd412" },
            { value: 19.43718592964824, color: "#52d412" },
            { value: 19.492462311557787, color: "#56d412" },
            { value: 19.547738693467338, color: "#5ad312" },
            { value: 19.603015075376884, color: "#5fd312" },
            { value: 19.65829145728643, color: "#63d312" },
            { value: 19.71356783919598, color: "#67d212" },
            { value: 19.768844221105528, color: "#6bd212" },
            { value: 19.824120603015075, color: "#70d212" },
            { value: 19.87939698492462, color: "#74d211" },
            { value: 19.934673366834172, color: "#78d111" },
            { value: 19.98994974874372, color: "#7cd111" },
            { value: 20.045226130653266, color: "#80d111" },
            { value: 20.100502512562812, color: "#85d011" },
            { value: 20.155778894472363, color: "#89d011" },
            { value: 20.21105527638191, color: "#8dd011" },
            { value: 20.266331658291456, color: "#91d011" },
            { value: 20.321608040201006, color: "#95cf11" },
            { value: 20.376884422110553, color: "#99cf11" },
            { value: 20.4321608040201, color: "#9ecf11" },
            { value: 20.48743718592965, color: "#a2ce11" },
            { value: 20.542713567839197, color: "#a6ce11" },
            { value: 20.597989949748744, color: "#aace11" },
            { value: 20.65326633165829, color: "#aece10" },
            { value: 20.70854271356784, color: "#b2cd10" },
            { value: 20.763819095477388, color: "#b6cd10" },
            { value: 20.819095477386934, color: "#bacd10" },
            { value: 20.87437185929648, color: "#becc10" },
            { value: 20.92964824120603, color: "#c2cc10" },
            { value: 20.984924623115578, color: "#c6cc10" },
            { value: 21.040201005025125, color: "#cacc10" },
            { value: 21.095477386934675, color: "#cbc810" },
            { value: 21.150753768844222, color: "#cbc410" },
            { value: 21.20603015075377, color: "#cbbf10" },
            { value: 21.261306532663315, color: "#cabb10" },
            { value: 21.316582914572866, color: "#cab610" },
            { value: 21.371859296482413, color: "#cab210" },
            { value: 21.42713567839196, color: "#caad0f" },
            { value: 21.482412060301506, color: "#c9a90f" },
            { value: 21.537688442211056, color: "#c9a40f" },
            { value: 21.592964824120603, color: "#c9a00f" },
            { value: 21.64824120603015, color: "#c89b0f" },
            { value: 21.7035175879397, color: "#c8970f" },
            { value: 21.758793969849247, color: "#c8920f" },
            { value: 21.814070351758794, color: "#c88e0f" },
            { value: 21.86934673366834, color: "#c7890f" },
            { value: 21.92462311557789, color: "#c7850f" },
            { value: 21.979899497487438, color: "#c7810f" },
            { value: 22.035175879396984, color: "#c67c0f" },
            { value: 22.09045226130653, color: "#c6780f" },
            { value: 22.14572864321608, color: "#c6730f" },
            { value: 22.201005025125628, color: "#c66f0f" },
            { value: 22.256281407035175, color: "#c56b0e" },
            { value: 22.311557788944725, color: "#c5660e" },
            { value: 22.366834170854272, color: "#c5620e" },
            { value: 22.42211055276382, color: "#c45e0e" },
            { value: 22.47738693467337, color: "#c4590e" },
            { value: 22.532663316582916, color: "#c4550e" },
            { value: 22.587939698492463, color: "#c4510e" },
            { value: 22.64321608040201, color: "#c34c0e" },
            { value: 22.698492462311556, color: "#c3480e" },
            { value: 22.753768844221106, color: "#c3440e" },
            { value: 22.809045226130653, color: "#c23f0e" },
            { value: 22.8643216080402, color: "#c23b0e" },
            { value: 22.91959798994975, color: "#c2370e" },
            { value: 22.974874371859297, color: "#c2330e" },
            { value: 23.030150753768844, color: "#c12e0e" },
            { value: 23.085427135678394, color: "#c12a0d" },
            { value: 23.14070351758794, color: "#c1260d" },
            { value: 23.195979899497488, color: "#c0220d" },
            { value: 23.251256281407034, color: "#c01e0d" },
            { value: 23.30653266331658, color: "#c0190d" },
            { value: 23.36180904522613, color: "#c0150d" },
            { value: 23.417085427135678, color: "#bf110d" },
            { value: 23.472361809045225, color: "#bf0d0d" },
            { value: 23.527638190954775, color: "#bf0d0d" },
            { value: 23.582914572864322, color: "#bc0e0e" },
            { value: 23.63819095477387, color: "#b90e0e" },
            { value: 23.69346733668342, color: "#b70f0f" },
            { value: 23.748743718592966, color: "#b41010" },
            { value: 23.804020100502512, color: "#b11111" },
            { value: 23.859296482412063, color: "#ae1111" },
            { value: 23.91457286432161, color: "#ac1212" },
            { value: 23.969849246231156, color: "#a91313" },
            { value: 24.025125628140703, color: "#a61313" },
            { value: 24.08040201005025, color: "#a41414" },
            { value: 24.1356783919598, color: "#a11414" },
            { value: 24.190954773869347, color: "#9e1515" },
            { value: 24.246231155778894, color: "#9c1515" },
            { value: 24.301507537688444, color: "#991616" },
            { value: 24.35678391959799, color: "#971616" },
            { value: 24.412060301507537, color: "#941717" },
            { value: 24.467336683417088, color: "#921717" },
            { value: 24.522613065326635, color: "#8f1818" },
            { value: 24.57788944723618, color: "#8d1818" },
            { value: 24.633165829145728, color: "#8a1919" },
            { value: 24.688442211055275, color: "#881919" },
            { value: 24.743718592964825, color: "#851919" },
            { value: 24.798994974874372, color: "#831a1a" },
            { value: 24.85427135678392, color: "#801a1a" },
            { value: 24.90954773869347, color: "#7e1b1b" },
            { value: 24.964824120603016, color: "#7c1b1b" },
            { value: 25.020100502512562, color: "#791b1b" },
            { value: 25.075376884422113, color: "#771b1b" },
            { value: 25.13065326633166, color: "#751c1c" },
            { value: 25.185929648241206, color: "#721c1c" },
            { value: 25.241206030150753, color: "#701c1c" },
            { value: 25.2964824120603, color: "#6e1c1c" },
            { value: 25.35175879396985, color: "#6c1c1c" },
            { value: 25.407035175879397, color: "#691d1d" },
            { value: 25.462311557788944, color: "#671d1d" },
            { value: 25.517587939698494, color: "#651d1d" },
            { value: 25.57286432160804, color: "#631d1d" },
            { value: 25.628140703517587, color: "#611d1d" },
            { value: 25.683417085427138, color: "#5f1d1d" },
            { value: 25.738693467336685, color: "#5c1d1d" },
            { value: 25.79396984924623, color: "#5a1d1d" },
            { value: 25.84924623115578, color: "#581d1d" },
            { value: 25.90452261306533, color: "#561d1d" },
            { value: 25.959798994974875, color: "#541d1d" },
            { value: 26.015075376884422, color: "#521d1d" },
            { value: 26.07035175879397, color: "#501d1d" },
            { value: 26.12562814070352, color: "#4e1d1d" },
            { value: 26.180904522613066, color: "#4c1d1d" },
            { value: 26.236180904522612, color: "#4a1d1d" },
            { value: 26.291457286432163, color: "#481d1d" },
            { value: 26.34673366834171, color: "#461d1d" },
            { value: 26.402010050251256, color: "#441c1c" },
            { value: 26.457286432160807, color: "#431c1c" },
            { value: 26.51256281407035, color: "#411c1c" },
            { value: 26.5678391959799, color: "#3f1c1c" },
            { value: 26.62311557788945, color: "#3d1c1c" },
            { value: 26.678391959798994, color: "#3b1b1b" },
            { value: 26.733668341708544, color: "#3a1b1b" },
            { value: 26.78894472361809, color: "#381b1b" },
            { value: 26.844221105527637, color: "#361a1a" },
            { value: 26.899497487437188, color: "#341a1a" },
            { value: 26.954773869346734, color: "#331a1a" },
            { value: 27.01005025125628, color: "#311919" },
            { value: 27.06532663316583, color: "#2f1919" },
            { value: 27.12060301507538, color: "#2e1919" },
            { value: 27.175879396984925, color: "#2c1818" },
            { value: 27.231155778894475, color: "#2a1818" },
            { value: 27.28643216080402, color: "#291717" },
            { value: 27.34170854271357, color: "#271717" },
            { value: 27.396984924623116, color: "#261616" },
            { value: 27.452261306532662, color: "#241616" },
            { value: 27.507537688442213, color: "#221515" },
            { value: 27.56281407035176, color: "#211515" },
            { value: 27.618090452261306, color: "#1f1414" },
            { value: 27.673366834170857, color: "#1e1313" },
            { value: 27.728643216080403, color: "#1d1313" },
            { value: 27.78391959798995, color: "#1b1212" },
            { value: 27.8391959798995, color: "#1a1212" },
            { value: 27.894472361809044, color: "#181111" },
            { value: 27.949748743718594, color: "#171010" },
            { value: 28.00502512562814, color: "#151010" },
            { value: 28.060301507537687, color: "#140f0f" },
            { value: 28.115577889447238, color: "#130e0e" },
            { value: 28.170854271356784, color: "#110d0d" },
            { value: 28.22613065326633, color: "#100d0d" },
            { value: 28.28140703517588, color: "#0f0c0c" },
            { value: 28.33668341708543, color: "#0e0b0b" },
            { value: 28.391959798994975, color: "#0c0a0a" },
            { value: 28.447236180904525, color: "#0b0909" },
            { value: 28.50251256281407, color: "#0a0909" },
            { value: 28.55778894472362, color: "#090808" },
            { value: 28.613065326633166, color: "#080707" },
            { value: 28.668341708542712, color: "#070606" },
            { value: 28.723618090452263, color: "#050505" },
            { value: 28.77889447236181, color: "#040404" },
            { value: 28.834170854271356, color: "#030303" },
            { value: 28.889447236180906, color: "#020202" },
            { value: 28.944723618090453, color: "#010101" },
            { value: 29.0, color: "black" },
          ],
          data: data,
        },
      ],
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
  }
};

/*
  keepit
*/
const demographics_version2 = (demograhpics, contact) => {
  let demo_dataLength = demograhpics ? demograhpics["children"].length : 0;
  let contact_numEntries = contact ? contact.length : 0;
  let contact_dataLength = contact ? contact["children"].length : 0;

  if (
    demo_dataLength == 0 ||
    contact_numEntries == 0 ||
    contact_dataLength == 0
  ) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );
  } else {
    //////////////////////
    //////////////////////
    // header
    //////////////////////
    //////////////////////

    ////////////// names
    let my_name = contact["children"].filter((entry) => entry.my_name);
    let render_names = my_name.map(function (item) {
      return item.my_name;
    });
    let check_duplicates = render_names.map((entry) => entry.toLowerCase());
    check_duplicates = [...new Set(check_duplicates)];
    let render_names_string = "";
    let names_length = check_duplicates.length;
    check_duplicates.forEach(function (item, index) {
      if (index !== names_length - 1) {
        render_names_string += item + " or ";
      } else {
        render_names_string += item;
      }
    });

    ////////////// emails
    let my_emails = contact["children"].filter((entry) => entry.my_email);
    let render_emails = my_emails.map(function (item) {
      return item.my_email;
    });
    let email_mapping = new Object();
    let count = 1;
    for (let email of render_emails) {
      email_mapping[email] = count;
      count += 1;
    }
    let render_emails_string = "";
    let emails_length = render_emails.length;
    let tester = [];
    render_emails.forEach(function (item, index) {
      if (index !== emails_length - 1) {
        tester.push(item);
        if (emails_length > 1) {
          render_emails_string +=
            item + "(*" + email_mapping[item] + ")" + " & ";
        } else {
          render_emails_string += item + " & ";
        }
      } else {
        tester.push(item);
        if (emails_length > 1) {
          render_emails_string += item + "(*" + email_mapping[item] + ")";
        } else {
          render_emails_string += item;
        }
      }
    });

    // let blocks = demographics['children']
    // get the matrix
    // make sure we end on 3 to keep a grid
    let size;
    if (demo_dataLength % 3 == 0) {
      size = demo_dataLength;
    } else if (demo_dataLength % 2 == 0) {
      size = demo_dataLength + 2;
    } else if (demo_dataLength % 1 == 0) {
      size = demo_dataLength + 1;
    }
    let myArr = new Int16Array(size).map((curr, index) => (curr = index + 1));
    let myMatrix = myArr.reduce(
      (rows, key, index) =>
        (index % 3 == 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) &&
        rows,
      []
    );
    let grid_string_array = [];
    let header = { name: "head", start: [0, 0], end: [2, 0] };
    grid_string_array.push(header);
    let grid_fitting = [];
    grid_fitting.push("flex");
    let total_count = 1;
    let row_count = 1;
    for (let row of myMatrix) {
      let column_count = 0;
      for (let column of row) {
        let entry = {
          name: "box-" + String(total_count),
          start: [column_count, row_count],
          end: [column_count, row_count],
        };
        grid_string_array.push(entry);
        column_count += 1;
        total_count += 1;
      }
      row_count += 1;
      grid_fitting.push("medium");
    }
    let render_string = "";
    let entry;

    let grid_entries = [];

    let counter = 1;
    for (let entry of demograhpics["children"]) {
      let value = entry.name;
      let source = entry.origin;

      //////////////////////////////////////////////////////////////////////////////////////////////////////////// check tooltip direction
      let slide_direction;
      let animation_direction;
      if (counter % 3 == 0) {
        slide_direction = { right: "left" }; // slide to the left
        animation_direction = "slideLeft";
      } else if (counter % 2 == 0) {
        slide_direction = { left: "right" }; // slide to the right
        animation_direction = "slideRight";
      } else {
        slide_direction = { left: "right" }; // slide to the right
        animation_direction = "slideRight";
      }


      //////////////////////////////////////////////////////////////////////////////////////////////////////////// multiple emails check
      let icon_add_in;
      if (emails_length > 1) {
        // need to include icon
        icon_add_in = (
          <Tip
            plain
            content={
              <Box
                pad="small"
                gap="small"
                width={{ max: "large" }}
                round="small"
                background="background-front"
                animation="slideRight"
                responsive={false}
              >
                <Text weight="bold">Attribute Associated With</Text>
                <Text size="small">
                  <ul>
                    {source.map((entry) => (
                      <li> {entry} </li>
                    ))}
                  </ul>
                </Text>
              </Box>
            }
            dropProps={{ align: { left: "right" } }}
          >
            <Box background="brand" pad={{ horizontal: "xsmall" }} round>
              <Text_grommet size="xxsmall">
                {source.map((email) => "*" + email_mapping[email])}
              </Text_grommet>
            </Box>
          </Tip>
        );
      } else {
        icon_add_in = "";
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////// meter age
      if (value.includes(" years old")) {
        let age = value.split("years old")[0];
        let start;
        let high;
        if (age.toLowerCase().includes("unknown")) {
          start = 0;
          high = 0;
        } else if (age.toLowerCase().includes("+")) {
          high = age.split("+")[0];
        } else {
          start = age.split("-")[0];
          high = age.split("-")[1];
        }

        let entry = (
          <Box
            gridArea={"box-" + String(counter)}
            background="light-1"
            round="medium"
          >
            <Stack anchor="bottom-right" alignSelf="center">
              <Meter
                background="light-3"
                round
                margin={{ top: "100px" }}
                alignSelf="center"
                size="xsmall"
                type="circle"
                values={[
                  {
                    value: high,
                    label: "Young Adult",
                  },
                ]}
                aria-label="meter"
              />
              {icon_add_in}
            </Stack>
            <br />

            <Text_grommet alignSelf="center"> {age} </Text_grommet>
            <Text_grommet alignSelf="center" size="xsmall">
              {" "}
              Age{" "}
            </Text_grommet>

            <Box alignSelf="center" height="large">
              <Tip
                plain
                content={
                  <Box
                    pad="small"
                    gap="small"
                    width={{ max: "large" }}
                    round="small"
                    background="background-front"
                    animation={animation_direction}
                    responsive={false}
                  >
                    <Text_grommet weight="bold">
                      Google thinks you are
                    </Text_grommet>
                    <Text_grommet color="accent-2" size="small">
                      {age}
                    </Text_grommet>
                    <Text_grommet size="small" weight="bold">
                      Options for age targeting include
                    </Text_grommet>
                    <List_grommet
                      primaryKey={(item) => (
                        <Text_grommet key={item} size="12px">
                          {item}
                        </Text_grommet>
                      )}
                      data={[
                        "18-24",
                        "25-34",
                        "35-44",
                        "45-54",
                        "55-64",
                        "65 or more",
                        "Unknown",
                      ]}
                    />
                  </Box>
                }
                dropProps={{ align: slide_direction }}
              >
                <CircleInformation color="light-4" size="medium" />
              </Tip>
            </Box>
          </Box>
        );
        grid_entries.push(entry);
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////// icon language
      else if (value.includes("Language:")) {
        let language = value.split("Language: ")[1];

        let entry = (
          <Box
            gridArea={"box-" + String(counter)}
            background="light-1"
            round="medium"
          >
            <Stack
              anchor="bottom-right"
              alignSelf="center"
              margin={{ top: "100px" }}
            >
              <Globe size="xlarge" />
              {icon_add_in}
            </Stack>

            <br />
            <Text_grommet alignSelf="center"> {language} </Text_grommet>
            <Text_grommet alignSelf="center" size="xsmall">
              {" "}
              Language{" "}
            </Text_grommet>
          </Box>
        );

        grid_entries.push(entry);
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////// meter company size
      else if (value.includes("Company Size:")) {
        let company = value.split("Company Size: ")[1];
        let num;
        if (company.toLowerCase().includes("small")) {
          num = 10;
        } else if (company.toLowerCase().includes("medium")) {
          num = 50;
        } else if (company.toLowerCase().includes("very large")) {
          num = 100;
        } else if (company.toLowerCase().includes("large")) {
          num = 80;
        } else {
          num = 0;
        }

        let entry = (
          <Box
            gridArea={"box-" + String(counter)}
            background="light-1"
            round="medium"
          >
            <Stack anchor="bottom-right" alignSelf="center">
              <Meter
                background="light-3"
                round
                margin={{ top: "100px" }}
                alignSelf="center"
                size="xsmall"
                type="circle"
                values={[
                  {
                    value: num,
                    label: "Employer Size",
                  },
                ]}
                aria-label="meter"
              />
              {icon_add_in}
            </Stack>
            <br />
            <Text_grommet alignSelf="center"> {company} </Text_grommet>
            <Text_grommet alignSelf="center" size="xsmall">
              {" "}
              Employer Size{" "}
            </Text_grommet>

            <Box alignSelf="center" height="large">
              <Tip
                plain
                content={
                  <Box
                    pad="small"
                    gap="small"
                    width={{ max: "large" }}
                    round="small"
                    background="background-front"
                    animation={animation_direction}
                    responsive={false}
                  >
                    <Text_grommet weight="bold">
                      Google thinks you work at a
                    </Text_grommet>
                    <Text_grommet color="accent-2" size="small">
                      {company}
                    </Text_grommet>
                    <Text_grommet size="small" weight="bold">
                      Options for company size targeting include
                    </Text_grommet>
                    <List_grommet
                      primaryKey={(item) => (
                        <Text_grommet key={item} size="12px">
                          {item}
                        </Text_grommet>
                      )}
                      data={[
                        "Small Employer (1-249 Employees)",
                        "Midsize Employer (250-999 Employees)",
                        "Large Employer (1k-10k Employees)",
                        "Very Large Employer (10k+ Employees)",
                      ]}
                    />
                  </Box>
                }
                dropProps={{ align: slide_direction }}
              >
                <CircleInformation color="light-4" size="medium" />
              </Tip>
            </Box>
          </Box>
        );

        grid_entries.push(entry);
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////// meter education
      else if (value.includes("Education Status:")) {
        let education = value.split("Education Status: ")[1];
        let num;
        if (education.toLowerCase().includes("advanced degree")) {
          num = 100;
        } else if (education.toLowerCase().includes("bachelor's degree")) {
          num = 80;
        } else if (education.toLowerCase().includes("college")) {
          num = 60;
        } else if (education.toLowerCase().includes("high school")) {
          num = 20;
        } else {
          num = 0;
        }

        let entry = (
          <Box
            gridArea={"box-" + String(counter)}
            background="light-1"
            round="medium"
          >
            <Stack anchor="bottom-right" alignSelf="center">
              <Meter
                background="light-3"
                round
                margin={{ top: "100px" }}
                alignSelf="center"
                size="xsmall"
                type="circle"
                values={[
                  {
                    value: num,
                    label: "Education",
                  },
                ]}
                aria-label="meter"
              />
              {icon_add_in}
            </Stack>
            <br />
            <Text_grommet alignSelf="center"> {education} </Text_grommet>
            <Text_grommet alignSelf="center" size="xsmall">
              {" "}
              Education Status{" "}
            </Text_grommet>

            <Box alignSelf="center" height="large">
              <Tip
                plain
                content={
                  <Box
                    pad="small"
                    gap="small"
                    width={{ max: "large" }}
                    round="small"
                    background="background-front"
                    animation={animation_direction}
                    responsive={false}
                  >
                    <Text_grommet weight="bold">
                      Google thinks your highest level of education is
                    </Text_grommet>
                    <Text_grommet color="accent-2" size="small">
                      {education}
                    </Text_grommet>
                    <Text_grommet size="small" weight="bold">
                      Options for education level targeting include
                    </Text_grommet>
                    <List_grommet
                      primaryKey={(item) => (
                        <Text_grommet key={item} size="12px">
                          {item}
                        </Text_grommet>
                      )}
                      data={[
                        "High School Graduate",
                        "Bachelor’s Degree",
                        "Advanced Degree",
                      ]}
                    />
                  </Box>
                }
                dropProps={{ align: slide_direction }}
              >
                <CircleInformation color="light-4" size="medium" />
              </Tip>
            </Box>
          </Box>
        );

        grid_entries.push(entry);
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////// icon homeowner
      else if (value.includes("Homeownership Status:")) {
        let homeowner = value.split("Homeownership Status: ")[1];

        let is_not = false;
        if (homeowner.toLowerCase().includes("not")) {
          is_not = true;
        }
        let unknown = false;
        if (homeowner.toLowerCase().includes("unknown")) {
          unknown = true;
        }

        let entry;
        if (is_not == false && unknown == false) {
          entry = (
            <Box
              gridArea={"box-" + String(counter)}
              background="light-1"
              round="medium"
            >
              <Stack
                anchor="bottom-right"
                alignSelf="center"
                margin={{ top: "100px" }}
              >
                <Home size="xlarge" />
                {icon_add_in}
              </Stack>

              <br />
              <Text_grommet alignSelf="center"> {homeowner} </Text_grommet>
              <Text_grommet alignSelf="center" size="xsmall">
                {" "}
                Homeownership Status{" "}
              </Text_grommet>

              <Box alignSelf="center" height="large">
                <Tip
                  plain
                  content={
                    <Box
                      pad="small"
                      gap="small"
                      width={{ max: "large" }}
                      round="small"
                      background="background-front"
                      animation={animation_direction}
                      responsive={false}
                    >
                      <Text_grommet weight="bold">
                        Google thinks you are a
                      </Text_grommet>
                      <Text_grommet color="accent-2" size="small">
                        {homeowner.split("s")[0]}
                      </Text_grommet>
                      <Text_grommet size="small" weight="bold">
                        Options for homeownership status targeting include
                      </Text_grommet>
                      <List_grommet
                        primaryKey={(item) => (
                          <Text_grommet key={item} size="12px">
                            {item}
                          </Text_grommet>
                        )}
                        data={["Homeowner", "Renter", "Unknown"]}
                      />
                    </Box>
                  }
                  dropProps={{ align: slide_direction }}
                >
                  <CircleInformation color="light-4" size="medium" />
                </Tip>
              </Box>
            </Box>
          );
        } else if (is_not == true && unknown == false) {
          entry = (
            <Box
              gridArea={"box-" + String(counter)}
              background="light-1"
              round="medium"
            >
              <Stack anchor="bottom-right" alignSelf="center">
                <Box align="center" margin={{ top: "100px" }}>
                  <Stack anchor="center">
                    <Home size="xlarge" />
                    <Close color="red" size="xlarge" />
                  </Stack>
                </Box>
                {icon_add_in}
              </Stack>

              <br />
              <Text_grommet alignSelf="center"> {homeowner} </Text_grommet>
              <Text_grommet alignSelf="center" size="xsmall">
                {" "}
                Homeownership Status{" "}
              </Text_grommet>

              <Box alignSelf="center" height="large">
                <Tip
                  plain
                  content={
                    <Box
                      pad="small"
                      gap="small"
                      width={{ max: "large" }}
                      round="small"
                      background="background-front"
                      animation={animation_direction}
                      responsive={false}
                    >
                      <Text_grommet weight="bold">
                        Google thinks you are a
                      </Text_grommet>
                      <Text_grommet color="accent-2" size="small">
                        {homeowner.split("s")[0]}
                      </Text_grommet>
                      <Text_grommet size="small" weight="bold">
                        Options for homeownership status targeting include
                      </Text_grommet>
                      <List_grommet
                        primaryKey={(item) => (
                          <Text_grommet key={item} size="12px">
                            {item}
                          </Text_grommet>
                        )}
                        data={["Homeowner", "Renter", "Unknown"]}
                      />
                    </Box>
                  }
                  dropProps={{ align: slide_direction }}
                >
                  <CircleInformation color="light-4" size="medium" />
                </Tip>
              </Box>
            </Box>
          );
        }

        if (unknown == true) {
          entry = (
            <Box
              gridArea={"box-" + String(counter)}
              background="light-1"
              round="medium"
            >
              <Stack
                anchor="bottom-right"
                alignSelf="center"
                margin={{ top: "100px" }}
              >
                <Home size="xlarge" />
                {icon_add_in}
              </Stack>

              <br />
              <Text_grommet alignSelf="center"> {homeowner} </Text_grommet>
              <Text_grommet alignSelf="center" size="xsmall">
                {" "}
                Homeownership Status{" "}
              </Text_grommet>

              <Box alignSelf="center" height="large">
                <Tip
                  plain
                  content={
                    <Box
                      pad="small"
                      gap="small"
                      width={{ max: "large" }}
                      round="small"
                      background="background-front"
                      animation={animation_direction}
                      responsive={false}
                    >
                      <Text_grommet weight="bold">
                        Google is unsure about your homeownership status
                      </Text_grommet>
                      <Text_grommet color="accent-2" size="small">
                        {homeowner}
                      </Text_grommet>
                      <Text_grommet size="small" weight="bold">
                        Options for homeownership status targeting include
                      </Text_grommet>
                      <List_grommet
                        primaryKey={(item) => (
                          <Text_grommet key={item} size="12px">
                            {item}
                          </Text_grommet>
                        )}
                        data={["Homeowner", "Renter", "Unknown"]}
                      />
                    </Box>
                  }
                  dropProps={{ align: slide_direction }}
                >
                  <CircleInformation color="light-4" size="medium" />
                </Tip>
              </Box>
            </Box>
          );
        }

        grid_entries.push(entry);
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////// icon household income
      else if (value.includes("Household Income:")) {
        let household = value.split("Household Income: ")[1];

        let entry = (
          <Box
            gridArea={"box-" + String(counter)}
            background="light-1"
            round="medium"
          >
            <Stack
              anchor="bottom-right"
              alignSelf="center"
              margin={{ top: "100px" }}
            >
              <Money size="xlarge" />
              {icon_add_in}
            </Stack>

            <br />
            <Text_grommet alignSelf="center"> {household} </Text_grommet>
            <Text_grommet alignSelf="center" size="xsmall">
              {" "}
              Household Income{" "}
            </Text_grommet>

            <Box alignSelf="center" height="large">
              <Tip
                plain
                content={
                  <Box
                    pad="small"
                    gap="small"
                    width={{ max: "large" }}
                    round="small"
                    background="background-front"
                    animation={animation_direction}
                    responsive={false}
                  >
                    <Text_grommet weight="bold">
                      Google thinks your income level is
                    </Text_grommet>
                    <Text_grommet color="accent-2" size="small">
                      {household}
                    </Text_grommet>
                    <Text_grommet size="small" weight="bold">
                      Options for income level targeting include
                    </Text_grommet>
                    <List_grommet
                      primaryKey={(item) => (
                        <Text_grommet key={item} size="12px">
                          {item}
                        </Text_grommet>
                      )}
                      data={[
                        "Top 10%",
                        "11-20%",
                        "21-30%",
                        "31-40%",
                        "41-50%",
                        "Lower 50%",
                        "Unknown",
                      ]}
                    />
                  </Box>
                }
                dropProps={{ align: slide_direction }}
              >
                <CircleInformation color="light-4" size="medium" />
              </Tip>
            </Box>
          </Box>
        );

        grid_entries.push(entry);
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////// icon job industry
      else if (value.includes("Job Industry:")) {
        let job = value.split("Job Industry: ")[1];

        let icon_to_use = <Compliance size="xlarge" />;
        if (job.toLowerCase().includes("construction")) {
          icon_to_use = <UserWorker size="xlarge" />;
        }
        if (job.toLowerCase().includes("education")) {
          icon_to_use = <Book size="xlarge" />;
        }
        if (job.toLowerCase().includes("financial")) {
          icon_to_use = <Atm size="xlarge" />;
        }
        if (job.toLowerCase().includes("healthcare")) {
          icon_to_use = <AidOption size="xlarge" />;
        }
        if (job.toLowerCase().includes("hospitality")) {
          icon_to_use = <Cafeteria size="xlarge" />;
        }
        if (job.toLowerCase().includes("manufacturing")) {
          icon_to_use = <Configure size="xlarge" />;
        }
        if (job.toLowerCase().includes("real estate")) {
          icon_to_use = <MapLocation size="xlarge" />;
        }
        if (job.toLowerCase().includes("technology")) {
          icon_to_use = <Cli size="xlarge" />;
        }

        let entry = (
          <Box
            gridArea={"box-" + String(counter)}
            background="light-1"
            round="medium"
          >
            <Stack
              anchor="bottom-right"
              alignSelf="center"
              margin={{ top: "100px" }}
            >
              {icon_to_use}
              {icon_add_in}
            </Stack>

            <br />
            <Text_grommet alignSelf="center"> {job} </Text_grommet>
            <Text_grommet alignSelf="center" size="xsmall">
              {" "}
              Job Industry{" "}
            </Text_grommet>

            <Box alignSelf="center" height="large">
              <Tip
                plain
                content={
                  <Box
                    pad="small"
                    gap="small"
                    width={{ max: "large" }}
                    round="small"
                    background="background-front"
                    animation={animation_direction}
                    responsive={false}
                  >
                    <Text_grommet weight="bold">
                      Google thinks your job industry is
                    </Text_grommet>
                    <Text_grommet color="accent-2" size="small">
                      {job}
                    </Text_grommet>
                    <Text_grommet size="small" weight="bold">
                      Options for job industry include
                    </Text_grommet>
                    <List_grommet
                      primaryKey={(item) => (
                        <Text_grommet key={item} size="12px">
                          {item}
                        </Text_grommet>
                      )}
                      data={[
                        "Construction",
                        "Education",
                        "Financial",
                        "Healthcare",
                        "Hospitality",
                        "Manufacturing",
                        "Real Estate",
                        "Technology",
                        "Unknown",
                      ]}
                    />
                  </Box>
                }
                dropProps={{ align: slide_direction }}
              >
                <CircleInformation color="light-4" size="medium" />
              </Tip>
            </Box>
          </Box>
        );

        grid_entries.push(entry);
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////// icon gender
      else if (value.includes("Male")) {
        let entry = (
          <Box
            gridArea={"box-" + String(counter)}
            background="light-1"
            round="medium"
          >
            <Stack
              anchor="bottom-right"
              alignSelf="center"
              margin={{ top: "100px" }}
            >
              <User size="xlarge" />
              {icon_add_in}
            </Stack>

            <br />
            <Text_grommet alignSelf="center"> Male </Text_grommet>
            <Text_grommet alignSelf="center" size="xsmall">
              {" "}
              Gender{" "}
            </Text_grommet>

            <Box alignSelf="center" height="large">
              <Tip
                plain
                content={
                  <Box
                    pad="small"
                    gap="small"
                    width={{ max: "large" }}
                    round="small"
                    background="background-front"
                    animation={animation_direction}
                    responsive={false}
                  >
                    <Text_grommet weight="bold">
                      Google thinks your gender is
                    </Text_grommet>
                    <Text_grommet color="accent-2" size="small">
                      Male
                    </Text_grommet>
                    <Text_grommet size="small" weight="bold">
                      Options for gender include
                    </Text_grommet>
                    <List_grommet
                      primaryKey={(item) => (
                        <Text_grommet key={item} size="12px">
                          {item}
                        </Text_grommet>
                      )}
                      data={["Male", "Female", "Unknown"]}
                    />
                  </Box>
                }
                dropProps={{ align: slide_direction }}
              >
                <CircleInformation color="light-4" size="medium" />
              </Tip>
            </Box>
          </Box>
        );

        grid_entries.push(entry);
      }
      //////////////////////////////////////////////////////////////////////////////////////////////////////////// icon gender
      else if (value.includes("Female")) {
        let entry = (
          <Box
            gridArea={"box-" + String(counter)}
            background="light-1"
            round="medium"
          >
            <Stack
              anchor="bottom-right"
              alignSelf="center"
              margin={{ top: "100px" }}
            >
              <UserFemale size="xlarge" />
              {icon_add_in}
            </Stack>

            <br />
            <Text_grommet alignSelf="center"> Female </Text_grommet>
            <Text_grommet alignSelf="center" size="xsmall">
              {" "}
              Gender{" "}
            </Text_grommet>

            <Box alignSelf="center" height="large">
              <Tip
                plain
                content={
                  <Box
                    pad="small"
                    gap="small"
                    width={{ max: "large" }}
                    round="small"
                    background="background-front"
                    animation={animation_direction}
                    responsive={false}
                  >
                    <Text_grommet weight="bold">
                      Google thinks your gender is
                    </Text_grommet>
                    <Text_grommet color="accent-2" size="small">
                      Female
                    </Text_grommet>
                    <Text_grommet size="small" weight="bold">
                      Options for gender include
                    </Text_grommet>
                    <List_grommet
                      primaryKey={(item) => (
                        <Text_grommet key={item} size="12px">
                          {item}
                        </Text_grommet>
                      )}
                      data={["Male", "Female", "Unknown"]}
                    />
                  </Box>
                }
                dropProps={{ align: slide_direction }}
              >
                <CircleInformation color="light-4" size="medium" />
              </Tip>
            </Box>
          </Box>
        );

        grid_entries.push(entry);
      }
      //////////////////////////////////////////////////////////////////////////////////////////////////////////// icon gender
      else if (value.includes("Unknown")) {
        let entry = (
          <Box
            gridArea={"box-" + String(counter)}
            background="light-1"
            round="medium"
          >
            <Stack
              anchor="bottom-right"
              alignSelf="center"
              margin={{ top: "100px" }}
            >
              <Help size="xlarge" />
              {icon_add_in}
            </Stack>

            <br />
            <Text_grommet alignSelf="center"> Unknown </Text_grommet>
            <Text_grommet alignSelf="center" size="xsmall">
              {" "}
              Gender{" "}
            </Text_grommet>

            <Box alignSelf="center" height="large">
              <Tip
                plain
                content={
                  <Box
                    pad="small"
                    gap="small"
                    width={{ max: "large" }}
                    round="small"
                    background="background-front"
                    animation={animation_direction}
                    responsive={false}
                  >
                    <Text_grommet weight="bold">
                      Google thinks your gender is
                    </Text_grommet>
                    <Text_grommet color="accent-2" size="small">
                      Unknown
                    </Text_grommet>
                    <Text_grommet size="small" weight="bold">
                      Options for gender include
                    </Text_grommet>
                    <List_grommet
                      primaryKey={(item) => (
                        <Text_grommet key={item} size="12px">
                          {item}
                        </Text_grommet>
                      )}
                      data={["Male", "Female", "Unknown"]}
                    />
                  </Box>
                }
                dropProps={{ align: slide_direction }}
              >
                <CircleInformation color="light-4" size="medium" />
              </Tip>
            </Box>
          </Box>
        );

        grid_entries.push(entry);
      }
      //////////////////////////////////////////////////////////////////////////////////////////////////////////// icon marital status
      else if (value.includes("Marital Status:")) {
        let marital = value.split("Marital Status: ")[1];

        let is_not = false;
        let unknown = false;
        if (marital.toLowerCase().includes("not")) {
          is_not = true;
        }
        if (marital.toLowerCase().includes("unknown")) {
          unknown = true;
        }

        let entry;
        if (is_not == false && unknown == false) {
          entry = (
            <Box
              gridArea={"box-" + String(counter)}
              background="light-1"
              round="medium"
            >
              <Stack
                anchor="bottom-right"
                alignSelf="center"
                margin={{ top: "100px" }}
              >
                <Favorite size="xlarge" />
                {icon_add_in}
              </Stack>

              <br />
              <Text_grommet alignSelf="center"> {marital} </Text_grommet>
              <Text_grommet alignSelf="center" size="xsmall">
                {" "}
                Marital Status{" "}
              </Text_grommet>

              <Box alignSelf="center" height="large">
                <Tip
                  plain
                  content={
                    <Box
                      pad="small"
                      gap="small"
                      width={{ max: "large" }}
                      round="small"
                      background="background-front"
                      animation={animation_direction}
                      responsive={false}
                    >
                      <Text_grommet weight="bold">
                        Google thinks your marital status is
                      </Text_grommet>
                      <Text_grommet color="accent-2" size="small">
                        {marital}
                      </Text_grommet>
                      <Text_grommet size="small" weight="bold">
                        Options for marital status include
                      </Text_grommet>
                      <List_grommet
                        primaryKey={(item) => (
                          <Text_grommet key={item} size="12px">
                            {item}
                          </Text_grommet>
                        )}
                        data={["Single", "In a Relationship", "Married"]}
                      />
                    </Box>
                  }
                  dropProps={{ align: slide_direction }}
                >
                  <CircleInformation color="light-4" size="medium" />
                </Tip>
              </Box>
            </Box>
          );
        } else if (is_not == true && unknown == false) {
          entry = (
            <Box
              gridArea={"box-" + String(counter)}
              background="light-1"
              round="medium"
            >
              <Stack anchor="bottom-right" alignSelf="center">
                <Box align="center" margin={{ top: "100px" }}>
                  <Stack anchor="center">
                    <Favorite size="xlarge" />
                    <Close color="red" size="xlarge" />
                  </Stack>
                </Box>
                {icon_add_in}
              </Stack>

              <br />
              <Text_grommet alignSelf="center"> {marital} </Text_grommet>
              <Text_grommet alignSelf="center" size="xsmall">
                {" "}
                Marital Status{" "}
              </Text_grommet>

              <Box alignSelf="center" height="large">
                <Tip
                  plain
                  content={
                    <Box
                      pad="small"
                      gap="small"
                      width={{ max: "large" }}
                      round="small"
                      background="background-front"
                      animation={animation_direction}
                      responsive={false}
                    >
                      <Text_grommet weight="bold">
                        Google thinks your marital status is
                      </Text_grommet>
                      <Text_grommet color="accent-2" size="small">
                        {marital}
                      </Text_grommet>
                      <Text_grommet size="small" weight="bold">
                        Options for marital status include
                      </Text_grommet>
                      <List_grommet
                        primaryKey={(item) => (
                          <Text_grommet key={item} size="12px">
                            {item}
                          </Text_grommet>
                        )}
                        data={["Single", "In a Relationship", "Married"]}
                      />
                    </Box>
                  }
                  dropProps={{ align: slide_direction }}
                >
                  <CircleInformation color="light-4" size="medium" />
                </Tip>
              </Box>
            </Box>
          );
        } else {
          entry = (
            <Box
              gridArea={"box-" + String(counter)}
              background="light-1"
              round="medium"
            >
              <Stack
                anchor="bottom-right"
                alignSelf="center"
                margin={{ top: "100px" }}
              >
                <Help size="xlarge" />
                {icon_add_in}
              </Stack>

              <br />
              <Text_grommet alignSelf="center"> {marital} </Text_grommet>
              <Text_grommet alignSelf="center" size="xsmall">
                {" "}
                Marital Status{" "}
              </Text_grommet>

              <Box alignSelf="center" height="large">
                <Tip
                  plain
                  content={
                    <Box
                      pad="small"
                      gap="small"
                      width={{ max: "large" }}
                      round="small"
                      background="background-front"
                      animation={animation_direction}
                      responsive={false}
                    >
                      <Text_grommet weight="bold">
                        Google thinks your marital status is
                      </Text_grommet>
                      <Text_grommet color="accent-2" size="small">
                        {marital}
                      </Text_grommet>
                      <Text_grommet size="small" weight="bold">
                        Options for marital status include
                      </Text_grommet>
                      <List_grommet
                        primaryKey={(item) => (
                          <Text_grommet key={item} size="12px">
                            {item}
                          </Text_grommet>
                        )}
                        data={["Single", "In a Relationship", "Married"]}
                      />
                    </Box>
                  }
                  dropProps={{ align: slide_direction }}
                >
                  <CircleInformation color="light-4" size="medium" />
                </Tip>
              </Box>
            </Box>
          );
        }

        grid_entries.push(entry);
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////// icon parental status
      else if (value.includes("Parental Status:")) {
        let parental = value.split("Parental Status: ")[1];

        let is_not = false;
        if (parental.toLowerCase().includes("not")) {
          is_not = true;
        }
        let unknown = false;
        if (parental.toLowerCase().includes("unknown")) {
          unknown = true;
        }

        let entry;
        if (is_not == false && unknown == false) {
          entry = (
            <Box
              gridArea={"box-" + String(counter)}
              background="light-1"
              round="medium"
            >
              <Stack
                anchor="bottom-right"
                alignSelf="center"
                margin={{ top: "100px" }}
              >
                <Baby size="xlarge" />
                {icon_add_in}
              </Stack>

              <br />
              <Text_grommet alignSelf="center"> {parental} </Text_grommet>
              <Text_grommet alignSelf="center" size="xsmall">
                {" "}
                Parental Status{" "}
              </Text_grommet>

              <Box alignSelf="center" height="large">
                <Tip
                  plain
                  content={
                    <Box
                      pad="small"
                      gap="small"
                      width={{ max: "large" }}
                      round="small"
                      background="background-front"
                      animation={animation_direction}
                      responsive={false}
                    >
                      <Text_grommet weight="bold">
                        Google thinks your parental status is
                      </Text_grommet>
                      <Text_grommet color="accent-2" size="small">
                        {parental}
                      </Text_grommet>
                      <Text_grommet size="small" weight="bold">
                        Options for parental status include
                      </Text_grommet>
                      <List_grommet
                        primaryKey={(item) => (
                          <Text_grommet key={item} size="12px">
                            {item}
                          </Text_grommet>
                        )}
                        data={[
                          "Not a parent",
                          "Parents of Infants (0-1 years)",
                          "Parents of Toddlers (1-3 years)",
                          "Parents of Preschoolers (4-5 years)",
                          "Parents of Grade-Schoolers (6-12 years)",
                          "Parents of Teens (13-17 years)",
                        ]}
                      />
                    </Box>
                  }
                  dropProps={{ align: slide_direction }}
                >
                  <CircleInformation color="light-4" size="medium" />
                </Tip>
              </Box>
            </Box>
          );
        } else if (is_not == true && unknown == false) {
          entry = (
            <Box
              gridArea={"box-" + String(counter)}
              background="light-1"
              round="medium"
            >
              <Stack anchor="bottom-right" alignSelf="center">
                <Box align="center" margin={{ top: "100px" }}>
                  <Stack anchor="center">
                    <Baby size="xlarge" />
                    <Close color="red" size="xlarge" />
                  </Stack>
                </Box>
                {icon_add_in}
              </Stack>

              <br />
              <Text_grommet alignSelf="center"> {parental} </Text_grommet>
              <Text_grommet alignSelf="center" size="xsmall">
                {" "}
                Parental Status{" "}
              </Text_grommet>

              <Box alignSelf="center" height="large">
                <Tip
                  plain
                  content={
                    <Box
                      pad="small"
                      gap="small"
                      width={{ max: "large" }}
                      round="small"
                      background="background-front"
                      animation={animation_direction}
                      responsive={false}
                    >
                      <Text_grommet weight="bold">
                        Google thinks your parental status is
                      </Text_grommet>
                      <Text_grommet color="accent-2" size="small">
                        {parental}
                      </Text_grommet>
                      <Text_grommet size="small" weight="bold">
                        Options for parental status include
                      </Text_grommet>
                      <List_grommet
                        primaryKey={(item) => (
                          <Text_grommet key={item} size="12px">
                            {item}
                          </Text_grommet>
                        )}
                        data={[
                          "Not a parent",
                          "Parents of Infants (0-1 years)",
                          "Parents of Toddlers (1-3 years)",
                          "Parents of Preschoolers (4-5 years)",
                          "Parents of Grade-Schoolers (6-12 years)",
                          "Parents of Teens (13-17 years)",
                        ]}
                      />
                    </Box>
                  }
                  dropProps={{ align: slide_direction }}
                >
                  <CircleInformation color="light-4" size="medium" />
                </Tip>
              </Box>
            </Box>
          );
        } else {
          entry = (
            <Box
              gridArea={"box-" + String(counter)}
              background="light-1"
              round="medium"
            >
              <Stack
                anchor="bottom-right"
                alignSelf="center"
                margin={{ top: "100px" }}
              >
                <Help size="xlarge" />
                {icon_add_in}
              </Stack>

              <br />
              <Text_grommet alignSelf="center"> {parental} </Text_grommet>
              <Text_grommet alignSelf="center" size="xsmall">
                {" "}
                Parental Status{" "}
              </Text_grommet>

              <Box alignSelf="center" height="large">
                <Tip
                  plain
                  content={
                    <Box
                      pad="small"
                      gap="small"
                      width={{ max: "large" }}
                      round="small"
                      background="background-front"
                      animation={animation_direction}
                      responsive={false}
                    >
                      <Text_grommet weight="bold">
                        Google thinks your parental status is
                      </Text_grommet>
                      <Text_grommet color="accent-2" size="small">
                        {parental}
                      </Text_grommet>
                      <Text_grommet size="small" weight="bold">
                        Options for parental status include
                      </Text_grommet>
                      <List_grommet
                        primaryKey={(item) => (
                          <Text_grommet key={item} size="12px">
                            {item}
                          </Text_grommet>
                        )}
                        data={[
                          "Not a parent",
                          "Parents of Infants (0-1 years)",
                          "Parents of Toddlers (1-3 years)",
                          "Parents of Preschoolers (4-5 years)",
                          "Parents of Grade-Schoolers (6-12 years)",
                          "Parents of Teens (13-17 years)",
                        ]}
                      />
                    </Box>
                  }
                  dropProps={{ align: slide_direction }}
                >
                  <CircleInformation color="light-4" size="medium" />
                </Tip>
              </Box>
            </Box>
          );
        }

        grid_entries.push(entry);
      } else {
        let entry = (
          <Box
            gridArea={"box-" + String(counter)}
            background="light-1"
            round="medium"
          >
            <Stack
              anchor="bottom-right"
              alignSelf="center"
              margin={{ top: "100px" }}
            >
              <Help size="xlarge" />
              {icon_add_in}
            </Stack>

            <br />
            <Text_grommet alignSelf="center"> {value} </Text_grommet>
          </Box>
        );

        grid_entries.push(entry);
      }

      counter += 1;
    }
    // for (let obj of demograhpics['children']) {

    // }

    // https://www.wordstream.com/blog/ws/2018/10/31/detailed-demographics
    // https://support.google.com/google-ads/answer/2580383?hl=en

    // [

    //   { name: 'head', start: [0, 0], end: [2, 0] },
    //   { name: 'side2', start: [0, 1], end: [0, 1] },
    //   { name: 'side3', start: [1, 1], end: [1, 1] },
    //   { name: 'side4', start: [2, 1], end: [2, 1] },
    //   { name: 'side5', start: [0, 2], end: [0, 2] },
    //   { name: 'side6', start: [1, 2], end: [1, 2] },
    //   { name: 'side7', start: [2, 2], end: [2, 2] },
    // ]

    return (
      <Grid_grommet
        areas={grid_string_array}
        columns={["flex", "flex", "flex"]}
        rows={grid_fitting}
        gap="small"
      >
        <Box gridArea="head" background="light-1" round="large">
          <Text_grommet
            alignSelf="start"
            color="status-error"
            size="30px"
            weight="bolder"
            margin={{ top: "20px", left: "40px" }}
          >
            {render_names_string}
          </Text_grommet>

          <br />

          <Text_grommet
            alignSelf="start"
            color="dark-4"
            margin={{ left: "40px", bottom: "20px" }}
          >
            Email: {render_emails_string}
          </Text_grommet>
        </Box>

        {grid_entries}
      </Grid_grommet>
    );
  }
};

/*
  keepit
*/
const advertiser_ads_version2 = (
  type,
  data_all,
  current_slide,
  slide_updater
) => {
  let numEntries = data_all ? data_all.length : 0;
  let isEmpty = Object.keys(data_all).length == 0;
  if (numEntries === 0 || isEmpty) {
    return (
      <Box align="center" pad="large">
        {" "}
        <Spinner_grommet
          border={[
            { side: "all", color: "transparent", size: "medium" },
            { side: "horizontal", color: "brand", size: "medium" },
          ]}
        />{" "}
      </Box>
    );
  } else {
    let data;
    data = data_all[type];

    const frame_style = {
      width: "100%",
      height: "40em",
    };

    const carousel_style = {
      height: "100%",
      position: "relative",
    };

    const CarouselChild = ({ children }) => {
      return (
        <Box fill pad={{ horizontal: "medium", bottom: "large" }}>
          <Box style={{ zIndex: 100 }}>{children}</Box>
        </Box>
      );
    };

    const highlighted_domain_style = {
      color: "lightblue",
      fontWeight: "bold",
      textDecoration: "underline",
    };
    const highlighted_inference_style = {
      color: "lightred",
      fontWeight: "bold",
    };
    const list_style = { textAlign: "left" };

    let explanations_grid = [];

    for (let this_entry of data) {
      let you_were_visiting;
      let this_dom;
      let ad_category;
      let ad_category_matches_other_pages;
      let ad_category_matches_google_interests;
      let ad_domain_raw;
      let ad_domain_mod;
      let ad_explanation;
      let ad_domain_exactly_seen_in_history;
      let ad_domain_fuzzy_seen_in_history;

      let mapping = {};

      let count_of_all = 0;

      if (this_entry.you_were_visiting != "") {
        you_were_visiting = this_entry.you_were_visiting;
      }
      if (this_entry.dom != "") {
        this_dom = this_entry.dom;
      }
      if (this_entry.ad_category != "none") {
        ad_category = this_entry.ad_category;
        count_of_all += 1;
        mapping["ad_category"] = count_of_all;
      }
      if (this_entry.ad_category_matches_other_pages.length != 0) {
        ad_category_matches_other_pages =
          this_entry.ad_category_matches_other_pages;
        count_of_all += 1;
        mapping["ad_category_matches_other_pages"] = count_of_all;
      }
      if (this_entry.ad_category_matches_google_interests.length != 0) {
        ad_category_matches_google_interests =
          this_entry.ad_category_matches_google_interests;
        count_of_all += 1;
        mapping["ad_category_matches_google_interests"] = count_of_all;
      }
      if (this_entry.ad_domain_raw != "") {
        ad_domain_raw = this_entry.ad_domain_raw;
      }
      if (this_entry.ad_domain_mod != "") {
        ad_domain_mod = this_entry.ad_domain_mod;
        count_of_all += 1;
        mapping["ad_domain_mod"] = count_of_all;
      }
      if (this_entry.ad_explanation != null) {
        if (this_entry.ad_explanation[0] != "none provided by advertiser") {
          ad_explanation = this_entry.ad_explanation;
          count_of_all += 1;
          mapping["ad_explanation"] = count_of_all;
        }
      }
      if (this_entry.ad_domain_exactly_seen_in_history.length != 0) {
        ad_domain_exactly_seen_in_history =
          this_entry.ad_domain_exactly_seen_in_history;
        count_of_all += 1;
        mapping["ad_domain_exactly_seen_in_history"] = count_of_all;
      }
      if (this_entry.ad_domain_fuzzy_seen_in_history.length != 0) {
        ad_domain_fuzzy_seen_in_history =
          this_entry.ad_domain_fuzzy_seen_in_history;
        // count_of_all += 1
        // mapping['ad_domain_fuzzy_seen_in_history'] = count_of_all + 1
      }


      // let blocks = demographics['children']
      // get the matrix
      // make sure we end on 3 to keep a grid
      // this can be hardCoded, the max is 6
      let size;
      if (count_of_all == 1) {
        size = count_of_all + 2;
      }
      if (count_of_all == 2) {
        size = count_of_all + 1;
      }
      if (count_of_all == 3) {
        size = count_of_all + 0;
      }
      if (count_of_all == 4) {
        size = count_of_all + 2;
      }
      if (count_of_all == 5) {
        size = count_of_all + 1;
      }
      if (count_of_all == 6) {
        size = count_of_all + 0;
      }

      let myArr = new Int16Array(size).map((curr, index) => (curr = index + 1));

      let myMatrix = myArr.reduce(
        (rows, key, index) =>
          (index % 3 == 0
            ? rows.push([key])
            : rows[rows.length - 1].push(key)) && rows,
        []
      );

      let grid_string_array = [];
      let header = { name: "head", start: [0, 0], end: [2, 0] };
      grid_string_array.push(header);
      let grid_fitting = [];
      grid_fitting.push("xsmall");
      let total_count = 1;
      let row_count = 1;
      for (let row of myMatrix) {
        let column_count = 0;
        for (let column of row) {
          let entry = {
            name: "box-" + String(total_count),
            start: [column_count, row_count],
            end: [column_count, row_count],
          };
          grid_string_array.push(entry);
          column_count += 1;
          total_count += 1;
        }
        grid_fitting.push("flex");

        row_count += 1;
      }
      let render_string = "";

      let grid_entries = [];
      let at_most = 3;

      //////////////////////////////////////////////////////////////////////////////////////////////////////////// ad cat
      if (this_entry.ad_category != "none") {
        let entry = (
          <Box
            gridArea={"box-" + String(mapping["ad_category"])}
            background="light-6"
            round="medium"
          >
            <Box alignSelf="center" margin={{ top: "20px" }}>
              <ContactInfo color="black" size="medium" />
            </Box>
            <Text_grommet alignSelf="center" size="medium">
              {" "}
              The Ad's Category
            </Text_grommet>
            <List_grommet
              primaryKey={(item) => (
                <Text_grommet key={item} size="11px">
                  {item}
                </Text_grommet>
              )}
              data={[this_entry.ad_category]}
            />
            <br />
          </Box>
        );

        grid_entries.push(entry);
      }
      //////////////////////////////////////////////////////////////////////////////////////////////////////////// ad domain short
      if (this_entry.ad_domain_mod != "") {
        let entry = (
          <Box
            gridArea={"box-" + String(mapping["ad_domain_mod"])}
            background="light-6"
            round="medium"
          >
            <Box alignSelf="center" margin={{ top: "20px" }}>
              <Domain color="black" size="medium" />
            </Box>
            <Text_grommet alignSelf="center" size="medium">
              {" "}
              The Ad's Owner
            </Text_grommet>
            <List_grommet
              primaryKey={(item) => (
                <Text_grommet key={item} size="11px">
                  {item}
                </Text_grommet>
              )}
              data={[this_entry.ad_domain_mod]}
            />
            <br />
          </Box>
        );
        grid_entries.push(entry);
      }
      //////////////////////////////////////////////////////////////////////////////////////////////////////////// google interest matches
      if (this_entry.ad_category_matches_google_interests.length != 0) {
        let seen_it = [];
        for (let h of this_entry.ad_category_matches_google_interests) {
          if (!seen_it.includes(h)) {
            seen_it.push(h);
          }
        }
        let keepers = seen_it.slice(0, at_most);

        let entry = (
          <Box
            gridArea={
              "box-" + String(mapping["ad_category_matches_google_interests"])
            }
            background="light-6"
            round="medium"
          >
            <Box alignSelf="center" margin={{ top: "20px" }}>
              <Google color="black" size="medium" />
            </Box>
            <Text_grommet alignSelf="center" size="medium">
              {" "}
              Google says you're interested in
            </Text_grommet>
            <List_grommet
              primaryKey={(item) => (
                <Text_grommet key={item} size="11px">
                  {item}
                </Text_grommet>
              )}
              data={keepers}
            />
            <br />
            <Text_grommet alignSelf="center" color="dark-4" size="medium">
              {" "}
              (top 3)
            </Text_grommet>
          </Box>
        );
        grid_entries.push(entry);
      }
      //////////////////////////////////////////////////////////////////////////////////////////////////////////// interest history matches
      if (this_entry.ad_category_matches_other_pages.length != 0) {
        let keepers = null;
        let seen_it = [];
        for (let t of this_entry.ad_category_matches_other_pages) {
          if (!seen_it.includes(t.title)) {
            seen_it.push(t.title);
          }
        }
        keepers = seen_it.slice(0, at_most);

        let entry = (
          <Box
            gridArea={
              "box-" + String(mapping["ad_category_matches_other_pages"])
            }
            background="light-6"
            round="medium"
          >
            <Box alignSelf="center" margin={{ top: "20px" }}>
              <History color="black" size="medium" />
            </Box>
            <Text_grommet alignSelf="center" size="medium">
              {" "}
              Similar interests in history
            </Text_grommet>
            <List_grommet
              primaryKey={(item) => (
                <Text_grommet key={item} size="11px">
                  {item}
                </Text_grommet>
              )}
              data={keepers}
            />
            <br />
            <Text_grommet alignSelf="center" color="dark-4" size="medium">
              {" "}
              (top 3)
            </Text_grommet>
          </Box>
        );
        grid_entries.push(entry);
      }
      //////////////////////////////////////////////////////////////////////////////////////////////////////////// history matches
      if (this_entry.ad_domain_exactly_seen_in_history.length != 0) {

        let keepers = null;
        let seen_it = [];
        for (let t of this_entry.ad_domain_exactly_seen_in_history) {
          if (!seen_it.includes(t.title)) {
            seen_it.push(t.title);
          }
        }
        keepers = seen_it.slice(0, at_most);

        let entry = (
          <Box
            gridArea={
              "box-" + String(mapping["ad_domain_exactly_seen_in_history"])
            }
            background="light-6"
            round="medium"
          >
            <Box alignSelf="center" margin={{ top: "20px" }}>
              <History color="black" size="medium" />
            </Box>
            <Text_grommet alignSelf="center" size="medium">
              {" "}
              Similar webpage visits
            </Text_grommet>
            <List_grommet
              primaryKey={(item) => (
                <Text_grommet key={item} size="11px">
                  {item}
                </Text_grommet>
              )}
              data={keepers}
            />
            <br />
            <Text_grommet alignSelf="center" color="dark-4" size="medium">
              {" "}
              (top 3)
            </Text_grommet>
          </Box>
        );
        grid_entries.push(entry);
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////// provided explanation

      if (this_entry.ad_explanation != null) {
        if (this_entry.ad_explanation[0] != "none provided by advertiser") {
          let seen_it = [];
          for (let e of this_entry.ad_explanation) {
            if (!seen_it.includes(e)) {
              seen_it.push(e);
            }
          }
          let keepers = seen_it.slice(0, 3);

          let entry = (
            <Box
              gridArea={"box-" + String(mapping["ad_explanation"])}
              background="light-6"
              round="medium"
            >
              <Box alignSelf="center" margin={{ top: "20px" }}>
                <Info color="black" size="medium" />
              </Box>
              <Text_grommet alignSelf="center" size="medium">
                {" "}
                Provided ad explanation
              </Text_grommet>
              <List_grommet
                primaryKey={(item) => (
                  <Text_grommet key={item} size="11px">
                    {item}
                  </Text_grommet>
                )}
                data={keepers}
              />
              <br />
              <Text_grommet alignSelf="center" color="dark-4" size="medium">
                {" "}
                (top 3)
              </Text_grommet>
            </Box>
          );
          grid_entries.push(entry);
        }
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////// header
      let grid_entry = (
        <Box>
          <Grid_grommet
            areas={grid_string_array}
            columns={["flex", "flex", "flex"]}
            rows={grid_fitting}
            gap="xsmall"
          >
            <Box
              gridArea="head"
              gap="xsmall"
              background="none"
              pad="xsmall"
              margin="xsmall"
              round="large"
            >
              <Text_grommet
                alignSelf="center"
                color="status-error"
                size="30px"
                weight="bolder"
                // margin={{top: "20px", left: "40px"}}
              >
                {this_entry.you_were_visiting}
              </Text_grommet>
              <Text_grommet color="dark-4" size="13px" alignSelf="center">
                {" "}
                visited by you (
                {String(
                  moment(this_entry.on).format("dddd, MMMM Do YYYY, h:mm:ss a")
                )}
                ){" "}
              </Text_grommet>
            </Box>

            {grid_entries}
          </Grid_grommet>
          <Box
            flex={true}
            full={true}
            align="center"
            alignSelf="center"
            background="none"
            round="medium"
            pad="medium"
            full={true}
            margin="xsmall"
            gap="xsmall"
            width="xxlarge"
          >
            {
              <iframe
                srcDoc={this_entry.dom}
                style={frame_style}
                frameBorder="0"
              />
            }
          </Box>
        </Box>
      );

      explanations_grid.push(
        <Box
          round="small"
          pad="medium"
          border={{ color: "light-3", size: "small" }}
        >
          {" "}
          {grid_entry}{" "}
        </Box>
      );
    }

    return (
      <Grommet>
        <Box align="center" direction="column" pad="small">
          <Box margin="medium">
            <Text_grommet>
              {current_slide + 1 <= 1 && (
                <Button_grommet disabled={true} label="previous" />
              )}
              {current_slide + 1 != 1 && (
                <Button_grommet
                  label="previous"
                  onClick={() => slide_updater(current_slide - 1)}
                />
              )}
              <Text_grommet>
                {" "}
                {current_slide + 1} (of {data.length}){" "}
              </Text_grommet>
              {current_slide + 1 != data.length && (
                <Button_grommet
                  label="next"
                  onClick={() => slide_updater(current_slide + 1)}
                />
              )}
              {current_slide + 1 >= data.length && (
                <Button_grommet disabled={true} label="next" />
              )}
            </Text_grommet>
          </Box>

          <Carousel_grommet
            initialChild={0}
            controls={false}
            fill={true}
            activeChild={current_slide}
            onChild={slide_updater}
          >
            {explanations_grid}
          </Carousel_grommet>
        </Box>
      </Grommet>
    );
  }
};

export class ProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      graphCount: "all",
      pieCount: "all ",
      ad_type: "",
      carousel_slide_count: 0,
      allData: [],
    };
    // this.logLoad = this.logLoad.bind(this);
    this.updateGraphCount = this.updateGraphCount.bind(this);
    this.updatePieCount = this.updatePieCount.bind(this);
    this.updateAd_type = this.updateAd_type.bind(this);
    this.updateCarousel_slide_count = this.updateCarousel_slide_count.bind(this);
  }

  async getData () {
    const background = await browser.runtime.getBackgroundPage()

    const google_demographics = background.queryDatabase('getGoogleInferencesTree_demographic', {})
    const google_contactInfo = background.queryDatabase('getGoogleInferencesTree_nameData', {})
    const google_interests = background.queryDatabase('getGoogleInferencesTree_interests', {})
    const google_interests_bars = background.queryDatabase('getGoogleInferences_overview', {})
    const allGoogleInferences = background.queryDatabase('getAllGoogleInferences', {})
    const heat_map_newer_newer = background.queryDatabase('PageIdDataStructure_revisedHeatmap_version2', {})
    const allAdDOMs = background.queryDatabase('getAdDOMs_version2', {})
    const adDOM_overview = background.queryDatabase('getAdDOMs_overview', {})
    const getTopicsOfInterest = background.queryDatabase('getTopicsOfInterest', {}) 
    const sensitive_info_v3 = background.queryDatabase('getInferencesMostSensitive_version3', {})
    const sensitive_info_bubbles_v2 = background.queryDatabase('getInferencesMostSensitive_bubbles_version2', {})
    const bedtime_v2 = background.queryDatabase('getPagesByTime_bedtime', {})

    google_demographics.then(n => this.setState({google_demographics: n}))
    google_contactInfo.then(n => this.setState({google_contactInfo: n}))
    google_interests.then(n => this.setState({google_interests: n}))
    google_interests_bars.then(n => this.setState({google_interests_bars: n}))
    heat_map_newer_newer.then(n => this.setState({heat_map_newer_newer: n}))
    getTopicsOfInterest.then(n => this.setState({getTopicsOfInterest: n}))
    sensitive_info_bubbles_v2.then(n => this.setState({sensitive_info_bubbles_v2: n}))
    bedtime_v2.then(n => this.setState({bedtime_v2: n}))
    adDOM_overview.then(n => this.setState({adDOM_overview: n}))

    sensitive_info_v3.then(n => {
      this.setState({
        sensitive_info_v3: n, 
        pieCount: 'all ',
      })
    })


    allAdDOMs.then(n => {
      // this.setState({heat_map: best}) 
      this.setState({
        allAdDOMs: n,
        ad_type: Object.keys(n)[0],
        carousel_slide_count: this.state.carousel_slide_count,
      })

    })


    this.setState({
      // allData: heat_map_newer_newer,
      graphCount: this.state.graphCount,
      pieCount: this.state.pieCount,
      updateAd_type: this.state.updateAd_type,
      updateCarousel_slide_count: this.state.updateCarousel_slide_count,
    })

  }

  async componentDidMount () {

    let d = this.getData()

    // let activityType = 'load dashboard good actors page'
    // logging.logLoad(activityType, {})

    const background = await browser.runtime.getBackgroundPage()
    let tempDate = new Date(Date.now() - (7 * millisecondsInDay)) // start a full week ago?
    let startDate = new Date(tempDate.getFullYear(),
      tempDate.getMonth(), tempDate.getDate())
    let args = {afterDate: startDate.getTime()}
    const weektimestamps = background.queryDatabase('getTimestamps', args)
    // let activityType = 'load dashboard Creepy Vis page'
    // logging.logLoad(activityType, {})
    weektimestamps.then(ts => {
      const times = ts.map(x => (
        (new Date(x.id))
      ))
      this.setState({
        weektimestamps: times
      })
    })


    import(/* webpackChunkName: "vendors/lodash" */'lodash')
      .then(_ => {
        this.setState({ _: _ })
      })
      let recent = this.state.recent

      let pages = []
      if (recent) {
        for (let i = 0; i < recent.length; i++) {
          let value = await background.hashit_salt(domains[i]['Pages']['domain'])
          pages.push(value)
        }
      }
      let activityType2 = 'load dashboard Sites page'
      let sendDict = {'numDomainsShown': pages.length}
      logging.logLoad(activityType2, sendDict)


  }


  updateGraphCount (event) {
    const num = event.target.value

    this.setState({
      // allData: this.state.allData,
      graphCount: num,
    })
  }

  updateAd_type (event) {
    const new_type = event.target.value

    this.setState({
      ad_type: new_type,
      carousel_slide_count: 0,
    })
  }

  updateCarousel_slide_count (event) {
    this.setState({
      carousel_slide_count: event,
    })
  }

  updatePieCount (event) {
    const new_type = event.target.value

    this.setState({
      pieCount: new_type,
    })
  }




  render () {

    const {   
            bedtime_v2, 
            adDOM_overview, 
            google_contactInfo, 
            getTopicsOfInterest, 
            sensitive_info_v3, 
            sensitive_info_bubbles_v2, 
            google_demographics, 
            graphCount, ad_type, 
            carousel_slide_count, 
            google_interests, 
            google_interests_bars, 
            allAdDOMs, 
            heat_map_newer_newer
          } = this.state




    return (
      <Grid>

        <GridRow>
          <GridCol>
            <Box background='white' round='small' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>
              {video_explain()}

              {/*
              <InView>
                {({ inView, ref, entry }) => (
                  <div ref={ref}>
                    <h2>{`Header inside viewport ${inView}.`}</h2>
                    {console.log("video")}
                    {console.log(entry)}
                    {store_state_global('hi')}
                  </div>
                )}
              </InView>
              */}

            </Box>
          </GridCol>
        </GridRow>
        


        {google_interests != null &&  google_interests['tree']['children'].length == 0 && 
        <GridRow>
          <GridCol>
            <Stack anchor="top-right">
            <Box background='accent-4' round='large' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>
              <Box alignSelf="center" align="center" background='none' round='medium' pad="xxsmall" margin="xxsmall" gap="xxsmall" width={{ max: 'xlarge' }} responsive={true}> 
              <Alert size="large" />
              <Text_grommet alignSelf='center' > No adsSettings data. Try clicking on the button on the right and then come back!</Text_grommet>
              </Box>
            </Box>
            <Box>
            <Tip content="adssettings.google.com" dropProps={{ align:  { bottom: "top" } }}>
            <Button_grommet alignSelf='center' hoverIndicator={true} color="white" primary icon={<Google color="plain" size="medium" />} label="" href='https://adssettings.google.com/' onClick={() => {  }}  />
            {/*<Text_grommet alignSelf='center' > Google adsSettings information not found. Try importing it by clicking the icon</Text_grommet>*/}
            </Tip>
            </Box>
            </Stack>
          </GridCol>
        </GridRow>
        }
        

        {heat_map_newer_newer != null && Object.keys(heat_map_newer_newer.all).length == 0 &&
        <GridRow>
          <GridCol>
            <Stack anchor="top-right">
            <Box background='accent-4' round='large' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>
              <Box alignSelf="center" align="center" background='none' round='medium' pad="xxsmall" margin="xxsmall" gap="xxsmall" width={{ max: 'xlarge' }} responsive={true}> 
              <Alert size="large" />
              <Text_grommet alignSelf='center' > No website data. Try clicking the button on the right and then come back!</Text_grommet>
              </Box>
            </Box>
            <Box>
            <Tip content="petsmart.com" dropProps={{ align:  { bottom: "top" } }}>
            <Button_grommet alignSelf='center' hoverIndicator={true} color="white" primary icon={<Magic size="medium" />} label="" href='https://www.petsmart.com' onClick={() => {  }}  />
            </Tip>
            </Box>
            </Stack>

          </GridCol>
        </GridRow>
        }

        {google_demographics != null && google_contactInfo != null &&  google_demographics['children'].length != 0 && google_contactInfo['children'].length != 0 &&
        <GridRow>
          <GridCol>
            <Stack anchor="top-right">
            <Box background='white' round='small' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>


              <Box alignSelf="center" align="center">
              <Stack anchor="top-right">
                <Box alignSelf="center" align="center" background='dark-2' round='medium' pad="small" margin="medium" gap="small" width={{ max: 'medium' }} responsive={true}> 
                <Text_grommet color="white">Your Demographics</Text_grommet>
                </Box>
                <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">Demographics</Text_grommet> <Text_grommet size="small"> These attributes relate to <b> who you are</b>. As you browse the web, Google captures information like your age rage, gender, income level, and many others. </Text_grommet> </Box> } dropProps={{ align:  { top: "bottom" } }}>
                <CircleInformation color='light-3' size="45px" />
                </Tip>
              </Stack>
              </Box>


              <GridCol >
                {demographics_version2(this.state.google_demographics, this.state.google_contactInfo)}
                
                {/*
                <InView>
                  {({ inView, ref, entry }) => (
                    <div ref={ref}>
                      <h2>{`Header inside viewport ${inView}.`}</h2>
                      {console.log("demographics")}
                      {console.log(entry)}
                    </div>
                  )}
                </InView>
                */}

              </GridCol>
            </Box>
            <Box>
            <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">This information comes from Google</Text_grommet> <Text_grommet size="small"> Google learns these things about you as you browse the web. </Text_grommet> </Box> } dropProps={{ align:  { right: "left" } }}>
              <Google color="plain" size="large" />
            </Tip>
            </Box>
            </Stack>
          </GridCol>
        </GridRow>
        }



        {google_interests != null && google_interests['tree']['children'].length != 0 &&
        <GridRow>
          <GridCol>
            <Stack anchor="top-right">
            <Box background='white' round='small' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>


              <Box alignSelf="center" align="center">
              <Stack anchor="top-right">
                <Box alignSelf="center" align="center" background='dark-2' round='medium' pad="small" margin="medium" gap="small" width={{ max: 'medium' }} responsive={true}> 
                <Text_grommet color="white">Your inferred interests</Text_grommet> 
                </Box>
                <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">Interests</Text_grommet> <Text_grommet size="small"> These attributes relate to <b>what you like</b>. As you browse the web, Google captures information related to your interests (e.g., competitive video gaming, greeting cards, horror films, and many others). </Text_grommet> </Box> } dropProps={{ align:  { top: "bottom" } }}>
                <CircleInformation color='light-3' size="45px" />
                </Tip>
              </Stack>
              </Box>


              <Grid_grommet
                rows={['flex', 'flex']}
                columns={['flex', 'flex', ]}
                gap="small"
                areas={[
                  { name: 'nav', start: [0, 0], end: [0, 1] },
                  { name: 'main', start: [1, 0], end: [1, 1] },
                ]}
              >

              
              <Box gridArea="main" align="center" background='light-2' round='medium' pad="xsmall" full={true} margin="xsmall" gap="xsmall" width={{ max: 'xxlarge' }} responsive={true}> 
              <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">Visits to Google Ads Settings, showing update frequency of your interests</Text_grommet> <Text_grommet size="small"> Each visit to googleadssettings.com will be displayed here, associated with the number of interests found on that page. </Text_grommet> </Box> } dropProps={{ align:  { right: "left" } }}>
              <Text_grommet alignSelf="center"> Total Number of Interests</Text_grommet>
              </Tip>
              <br/>
              <Box>
              {/*{googleAdsSettings3_deepest_bars(this.state.google_interests_bars, this.state.google_interests)}*/}
              {googleAdsSettings3_deepest_totals(this.state.google_interests)}
              </Box>
              </Box>


              <Box gridArea="nav" align="center" background='light-2' round='medium' pad="xsmall" full={true} margin="xsmall" gap="xsmall" width={{ max: 'xxlarge' }} responsive={true}> 
              <Text_grommet alignSelf="center"> Most Specific Interests </Text_grommet>
              <br/>
              {googleAdsSettings3_deepest(this.state.google_interests)}
              </Box>

              </Grid_grommet>

              <GridCol >
                {googleAdsSettings3(this.state.google_interests)}
              </GridCol>
            </Box>
            <Box>
            <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">This information comes from Google</Text_grommet> <Text_grommet size="small"> Google learns these things about you as you browse the web. </Text_grommet> </Box> } dropProps={{ align:  { right: "left" } }}>
              <Google color="plain" size="large" />
            </Tip>
            </Box>
            </Stack>
          </GridCol>
        </GridRow>
        }




        {google_interests_bars != null && google_interests != null && google_interests['tree']['children'].length != 0 && 
        <GridRow>
          <GridCol>
            <Stack anchor="top-right">
            <Box background='white' round='small' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>

              <Box alignSelf="center" align="center">
              <Stack anchor="top-right">
                <Box alignSelf="center" align="center" background='dark-2' round='medium' pad="small" margin="medium" gap="small" width={{ max: 'medium' }} responsive={true}> 
                <Text_grommet color="white">Your interests over time</Text_grommet> 
                </Box>
                <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">Google's Watching</Text_grommet> <Text_grommet size="small"> As you browse the web, Google updates your "profile" of interests, adding and subtracting the things you are currently interested in. These interest include demographic details (e.g., your name, age, and gender) and interest details (e.g., puppies or butterflies). The count includes all types of interests together.</Text_grommet> </Box> } dropProps={{ align:  { top: "bottom" } }}>
                <CircleInformation color='light-3' size="45px" />
                </Tip>
              </Stack>
              </Box>

              <GridCol >
                {googleAdsSettings3_deepest_bars2(this.state.google_interests_bars, this.state.google_interests)}
              </GridCol>
            </Box>
            <Box>
            <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">This information comes from Google</Text_grommet> <Text_grommet size="small"> Google learns these things about you as you browse the web. </Text_grommet> </Box> } dropProps={{ align:  { right: "left" } }}>
              <Google color="plain" size="large" />
            </Tip>
            </Box>
            </Stack>
          </GridCol>
        </GridRow>
        }



        {heat_map_newer_newer != null && Object.keys(heat_map_newer_newer.all).length != 0 && 
        <GridRow>
          <GridCol>
            <Stack anchor="top-right">
            <Box background='white' round='small' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>

              <Box alignSelf="center" align="center">
              <Stack anchor="top-right">
                <Box alignSelf="center" align="center" background='dark-2' round='medium' pad="small" margin="medium" gap="small" width={{ max: 'medium' }} responsive={true}> 
                <Text_grommet color="white"> When you're engaged </Text_grommet> 
                </Box>
                <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">Online engagement</Text_grommet> <Text_grommet size="small"> Trackers learn when you're most active online.</Text_grommet> </Box> } dropProps={{ align:  { top: "bottom" } }}>
                <CircleInformation color='light-3' size="45px" />
                </Tip>
              </Stack>
              </Box>

              <GridCol>
                {heatMap_newer(this.state.graphCount, this.state.heat_map_newer_newer)}
              </GridCol>


              <Grid_grommet
                rows={['xxsmall', 'xxsmall']}
                columns={['flex', 'flex', ]}
                gap="small"
                areas={[
                  { name: 'nav', start: [0, 0], end: [0, 1] },
                  { name: 'main', start: [1, 0], end: [1, 1] },
                ]}
              >

              <Box gridArea="main" align="center" background='light-2' round='medium' pad="xsmall" full={true} margin="xsmall" gap="xsmall" width={{ max: 'xxlarge' }} responsive={true}> 
              <Text_grommet alignSelf="center"> Slice Notes </Text_grommet>
              {heatMap_overview(this.state.graphCount, this.state.heat_map_newer_newer)}
              </Box>

              <Box gridArea="nav" align="center" background='light-2' round='medium' pad="xsmall" full={false} margin="xsmall" gap="xsmall" width={{ max: 'xxlarge' }} responsive={true}> 
              <Text_grommet alignSelf="center"> Time Slice</Text_grommet>
              <Text_grommet size='12px'> 
              <RadioButtonGroup background='none' align='center' alignContent='start' alignSelf='center' direction='row' pad='xmall' margin='xsmall' flex overflow='scroll' name="slice" options={['all', 'last month', 'last week', 'today']} value={this.state.graphCount} onChange={this.updateGraphCount} />
              </Text_grommet>
              </Box>

              </Grid_grommet>
            </Box>
            <Box>
            <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">This information comes from Trackers</Text_grommet> <Text_grommet size="small"> Trackers learns these things about you as you browse the web. Thanks for sharing!</Text_grommet> </Box> } dropProps={{ align:  { right: "left" } }}>
              <View color="status-critical" size="large" />
            </Tip>
            </Box>
            </Stack>
          </GridCol>
        </GridRow>
        }

        {sensitive_info_v3 != null && sensitive_info_v3['all '].outer_all.length != 0 && 
        <GridRow>
          <GridCol>
            <Stack anchor="top-right">
            <Box background='white' round='small' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>


              <Box alignSelf="center" align="center">
              <Stack anchor="top-right">
                <Box alignSelf="center" align="center" background='dark-2' round='medium' pad="small" margin="medium" gap="small" width={{ max: 'medium' }} responsive={true}> 
                <Text_grommet color="white"> How you spend your time</Text_grommet> 
                </Box>
                <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">Online engagement</Text_grommet> <Text_grommet size="small"> Trackers learn what you most often do when online. Click on a slice for a breakdown.</Text_grommet> </Box> } dropProps={{ align:  { top: "bottom" } }}>
                <CircleInformation color='light-3' size="45px" />
                </Tip>
              </Stack>
              </Box>

              <GridCol>
                {sensitive_info_pie(this.state.pieCount, this.state.sensitive_info_v3)}
              </GridCol>

              <Box align="center" background='light-2' round='medium' pad="xsmall" full={false} margin="xsmall" gap="xsmall" width={{ max: 'xxlarge' }} responsive={true}> 
              <Text_grommet alignSelf="center"> Time Slice </Text_grommet>
              <Text_grommet size='12px'> 
              <RadioButtonGroup background='none' align='center' alignContent='start' alignSelf='center' direction='row' pad='xmall' margin='xsmall' flex overflow='scroll' name="slice" options={['all ', 'last month ', 'last week ', 'today ']} value={this.state.pieCount} onChange={this.updatePieCount} />
              </Text_grommet>
              </Box>

            </Box>
            <Box>
            <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">This information comes from Trackers</Text_grommet> <Text_grommet size="small"> Trackers learns these things about you as you browse the web. Thanks for sharing!</Text_grommet> </Box> } dropProps={{ align:  { right: "left" } }}>
              <View color="status-critical" size="large" />
            </Tip>
            </Box>
            </Stack>
          </GridCol>
        </GridRow>
        }

        {bedtime_v2 != null && bedtime_v2.length != 0 && 
        <GridRow>
          <GridCol>
            <Stack anchor="top-right">
            <Box background='white' round='small' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>


              <Box alignSelf="center" align="center">
              <Stack anchor="top-right">
                <Box alignSelf="center" align="center" background='dark-2' round='medium' pad="small" margin="medium" gap="small" width={{ max: 'medium' }} responsive={true}> 
                <Text_grommet color="white"> When you go to sleep</Text_grommet> 
                </Box> 
                <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">Online engagement</Text_grommet> <Text_grommet size="small"> Trackers can make assumptions about when you go to bed based on your periods of latest online engagement. Trackers also know what you're doing during these times.</Text_grommet> </Box> } dropProps={{ align:  { bottom: "top" } }}>
                <CircleInformation color='light-3' size="45px" />
                </Tip>
              </Stack>
              </Box>

              <GridCol >
                {bedTimes_version2(this.state.bedtime_v2)}
              </GridCol>
            </Box>
            <Box>
            <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">This information comes from Trackers</Text_grommet> <Text_grommet size="small"> Trackers learns these things about you as you browse the web. Thanks for sharing!</Text_grommet> </Box> } dropProps={{ align:  { right: "left" } }}>
              <View color="status-critical" size="large" />
            </Tip>
            </Box>
            </Stack>
          </GridCol>
        </GridRow>
        }

        {getTopicsOfInterest != null && getTopicsOfInterest.length != 0 && 
        <GridRow>
          <GridCol>
            <Stack anchor="top-right">
            <Box background='white' round='small' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>


              <Box alignSelf="center" align="center">
              <Stack anchor="top-right">
                <Box alignSelf="center" align="center" background='dark-2' round='medium' pad="small" margin="medium" gap="small" width={{ max: 'medium' }} responsive={true}> 
                <Text_grommet color="white">Your search habits</Text_grommet> 
                </Box>
                <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">Online engagement</Text_grommet> <Text_grommet size="small"> Trackers are able to look for popular search topics, like relationships and dating or diet. <br/><br/> Click and drag on a timeslice for zoom.</Text_grommet> </Box> } dropProps={{ align:  { top: "bottom" } }}>
                <CircleInformation color='light-3' size="45px" />
                </Tip>
              </Stack>
              </Box>

            <GridRow>
              <GridCol>
                  {visual_activity(getTopicsOfInterest)}
              </GridCol>
            </GridRow>
            </Box>
            <Box>
            <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">This information comes from Trackers</Text_grommet> <Text_grommet size="small"> Trackers learns these things about you as you browse the web. Thanks for sharing!</Text_grommet> </Box> } dropProps={{ align:  { right: "left" } }}>
              <View color="status-critical" size="large" />
            </Tip>
            </Box>
            </Stack>
          </GridCol>
        </GridRow>
        }

        {sensitive_info_bubbles_v2 != null && sensitive_info_bubbles_v2['outer'].length != 0 && 
        <GridRow>
          <GridCol>
            <Stack anchor="top-right">
            <Box background='white' round='small' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>


              <Box alignSelf="center" align="center">
              <Stack anchor="top-right">
                <Box alignSelf="center" align="center" background='dark-2' round='medium' pad="small" margin="medium" gap="small" width={{ max: 'medium' }} responsive={true}> 
                <Text_grommet color="white">Possible sensitive interests</Text_grommet>
                </Box>
                <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">Online engagement</Text_grommet> <Text_grommet size="small"> Trackers may group your interests by sensitive, learning what interests you have that might be uncomfortable, embarassing, or unique.</Text_grommet> </Box> } dropProps={{ align:  { top: "bottom" } }}>
                <CircleInformation color='light-3' size="45px" />
                </Tip>
              </Stack>
              </Box>

              {sensitive_bubbles_v2(sensitive_info_bubbles_v2)}
            </Box>
            <Box>
            <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">This information comes from Trackers</Text_grommet> <Text_grommet size="small"> Trackers learns these things about you as you browse the web. Thanks for sharing!</Text_grommet> </Box> } dropProps={{ align:  { right: "left" } }}>
              <View color="status-critical" size="large" />
            </Tip>
            </Box>
            </Stack>
          </GridCol>
        </GridRow>
        }
        
        {adDOM_overview != null && Object.values(adDOM_overview.breakdown).length != 0 &&
        <GridRow>
          <GridCol>
            <Stack anchor="top-right">
            <Box background='white' round='small' pad="small" margin="small" gap="small" width={{ max: 'xxlarge' }} responsive={true}>


              <Box alignSelf="center" align="center">
              <Stack anchor="top-right">
                <Box alignSelf="center" align="center" background='dark-2' round='medium' pad="small" margin="medium" gap="small" width={{ max: 'medium' }} responsive={true}> 
                <Text_grommet color="white">Ads you've been served (overview)</Text_grommet> 
                </Box> 
                <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">Advertisements</Text_grommet> <Text_grommet size="small"> Advertisers attempt to serve you ads you are interested in, using your profile to learn how to target you.</Text_grommet> </Box> } dropProps={{ align:  { top: "bottom" } }}>
                <CircleInformation color='light-3' size="45px" />
                </Tip>
              </Stack>
              </Box>

              <Grid_grommet
                rows={['flex', 'flex']}
                columns={['flex', 'flex', ]}
                gap="small"
                areas={[
                  { name: 'nav', start: [0, 0], end: [0, 1] },
                  { name: 'main1', start: [1, 0], end: [1, 0] },
                  { name: 'main2', start: [1, 1], end: [1, 1] },
                ]}
              >


              <Box gridArea="nav" align="center" background='light-2' round='medium' pad="xsmall" full={true} margin="xsmall" gap="xsmall" width={{ max: 'xxlarge' }} responsive={true}> 
              <Text_grommet alignSelf="center"> Ad Categories (Top 10) </Text_grommet>
              <br/>
              {ads_overview_breakDown(this.state.adDOM_overview)}
              </Box>
              
              <Box gridArea="main1" align="center" background='light-2' round='medium' pad="xsmall" full={true} margin="xsmall" gap="xsmall" width={{ max: 'xxlarge' }} responsive={true}> 
              <Text_grommet align='center' alignContent='center' alignSelf="center"> Ads Served</Text_grommet>
              <Box>
              {/*{googleAdsSettings3_deepest_bars(this.state.google_interests_bars, this.state.google_interests)}*/}
              {ads_overview_totalCount_count(this.state.adDOM_overview)}
              </Box>
              </Box>

              <Box gridArea="main2" align="center" background='light-2' round='medium' pad="xsmall" full={true} margin="xsmall" gap="xsmall" width={{ max: 'xxlarge' }} responsive={true}> 
              <Text_grommet align='center' alignContent='center' alignSelf="center"> Estimated Ad Serving Costs</Text_grommet>
              <Box>
              {/*{googleAdsSettings3_deepest_bars(this.state.google_interests_bars, this.state.google_interests)}*/}
              {ads_overview_totalCount_cost(this.state.adDOM_overview)}
              </Box>
              </Box>




              </Grid_grommet>

            </Box>
            <Box>
            <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">This information comes from Google</Text_grommet> <Text_grommet size="small"> Google learns these things about you as you browse the web. </Text_grommet> </Box> } dropProps={{ align:  { right: "left" } }}>
              <Google color="plain" size="large" />
            </Tip>
            </Box>
            </Stack>
          </GridCol>
        </GridRow>
        }




        {/* do a radio selector like for slices of time except as all, health, adult, and other sensitive options if they exist  */}
        {/*<Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">Online engagement</Text_grommet> <Text_grommet size="small"> Trackers may group your interests by sensitive, learning what interests you have that might be uncomfortable, embarassing, or unique.</Text_grommet> </Box> } dropProps={{ align:  { bottom: "top" } }}>*/}
        {allAdDOMs != null && Object.keys(allAdDOMs).length != 0 && 
        <GridRow>
          <GridCol>
            <Stack anchor="top-right">

            <Box background='white' round='small' pad="small" margin="xsmall" gap="xsmall" width={{ max: 'xxlarge' }} responsive={true}>

              <Box alignSelf="center" align="center">
              <Stack anchor="top-right">
                <Box alignSelf="center" align="center" background='dark-2' round='medium' pad="small" margin="medium" gap="small" width={{ max: 'medium' }} responsive={true}> 
                <Text_grommet color="white">Ads you've been served (breakdown)</Text_grommet> 
                </Box>
                <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">Advertisements</Text_grommet> <Text_grommet size="small"> After learning your interests, trackers sell that information to ad providers, who pay to target you specifically. The following ads show the ways you've been targeted, providing additional information about why you may have seen this ad. <br/><br/> Scroll to the right to see more ad categories.</Text_grommet> </Box> } dropProps={{ align:   { top: "bottom" } }}>
                <CircleInformation color='light-3' size="45px" />
                </Tip>
              </Stack>
              </Box>

              <Box background='light-2' round='medium' pad="xsmall" full={false} margin="xsmall" gap="xsmall" width={{ max: 'xxlarge' }} responsive={true}> 
              <Text_grommet alignSelf="center"> Ad category</Text_grommet>
              <Text_grommet size='12px'> 
              <RadioButtonGroup background='none' direction='row' pad='xmall' margin='xsmall' flex overflow='scroll' name="slice" options={Object.keys(allAdDOMs)} value={this.state.ad_type} onChange={this.updateAd_type} />
              </Text_grommet>
              </Box>



              {advertiser_ads_version2(this.state.ad_type, allAdDOMs, this.state.carousel_slide_count, this.updateCarousel_slide_count)}



            </Box>
            <Box>
            <Tip plain content={  <Box background='light-1' round='medium' pad="small" margin="small" gap="small" width={{ max: 'medium' }} responsive={false} > <Text_grommet weight="bold" color="status-error">This information comes from Trackers</Text_grommet> <Text_grommet size="small"> Trackers learns these things about you as you browse the web. Thanks for sharing!</Text_grommet> </Box> } dropProps={{ align:  { right: "left" } }}>
              <View color="status-critical" size="large" />
            </Tip>
            </Box>
            </Stack>
          </GridCol>
        </GridRow>
        }



      </Grid>
    );
  }
}

export default ProfilePage;

