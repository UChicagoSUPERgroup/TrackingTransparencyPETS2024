import React, { Component } from 'react';
import './styles.css';
import Gradient from './Gradient.react';
import Blocks from './Blocks.react';
import Hours from './Hours.react';

import {
  getHourRange,
  getInternalSize,
  buildColorScale,
  buildCountScale,
} from './utils';

// baseUrl is required to reference the element use for the gradient fill
const getBaseUrl = () =>
  window.location.href.replace(window.location.hash, '');


const myProps = {
    margin : { top: 30, right: 5, bottom: 0, left: 80 },
    days : [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ],
    hours : getHourRange(),
    cellSize : 20,
    gradientId : `gradient${Date.now()}`
  }

const Border = ({
  width,
  height,
  className = 'stroke-gray2'
}) =>
  <rect
    className={className}
    pointerEvents="none"
    fill="none"
    width={width}
    height={height}/>;

const Days = ({
  data,
  size,
  ...props
}) =>
  <g {...props}>
    {data.map((weekDay, index) => (
      <text
        className={`
          text-anchor-e f7
          ${index % 2 === 0 ? 'b' : ''}`
        }
        key={weekDay}
        x="0"
        y={index * size}
        transform={`translate(-6, ${size / 1.5})`}>
        {weekDay}
      </text>
    ))}
  </g>;

/*
            1  2  3     12
           AM Am AM.....AM
Monday     [ ][ ][ ]...[ ]
Tuesday    [ ][ ][ ]...[ ]
Wednesday  [ ][ ][ ]...[ ]
Thursday   [ ][ ][ ]...[ ]
Friday     [ ][ ][ ]...[ ]

           [==============]
           0      50     100
*/
class Heatmap extends Component {
  constructor (props) {
    super(props);

    this.margin = { top: 50, right: 5, bottom: 0, left: 50 }
    this.days = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ]
    this.hours = getHourRange()
    this.cellSize = 20
    this.gradientId = `gradient${Date.now()}`

    this.state = this.stateFromProps(props);
  }


  // static defaultProps = {
  //   margin : { top: 30, right: 5, bottom: 0, left: 80 },
  //   days : [
  //     'Monday',
  //     'Tuesday',
  //     'Wednesday',
  //     'Thursday',
  //     'Friday',
  //     'Saturday',
  //     'Sunday'
  //   ],
  //   hours : getHourRange(),
  //   cellSize : 20,
  //   legend : { height: 60, width: 200 },
  //   gradientId : `gradient${Date.now()}`
  // }

  componentWillReceiveProps (props) {
    if (this.props !== props) {
      this.setState(this.stateFromProps());
    }
  }

  stateFromProps ({ data }) {

    let days = this.days 
    let hours = this.hours
    let cellSize = this.cellSize
    let margin = this.margin
    let gradientId = `gradient${Date.now()}`

    console.log(margin.left)

    const size = getInternalSize({
      margin,
      width: hours.length * cellSize + margin.left + margin.right,
      height: (days.length + 1) * cellSize + margin.top 
    });

    return {
      size,
      colorScale  : buildColorScale(data),
      countScale  : buildCountScale(data, size.width),
    };
  }

  render () {
    const { countScale, colorScale, size } =  this.state;

    console.log(this.props)

    // const {
    //   margin,
    //   data,
    //   days,
    //   hours,
    //   legend,
    //   cellSize,
    //   gradientId
    // } = this.props;

    let days = this.days 
    let hours = this.hours
    let cellSize = this.cellSize
    let margin = this.margin
    let gradientId = this.gradientId
    let data = this.props.data
    console.log(this.props.data)

    // using d3 margin convention - https://bl.ocks.org/mbostock/3019563
    const fullWidth  = size.width + margin.left + margin.right;
    const fullHeight = size.height + margin.top + margin.bottom;

    return (
      <svg width={fullWidth} height={fullHeight} >
        <defs>
          <Gradient
            id={gradientId}
            countScale={countScale}
            colorScale={colorScale}
            width={fullWidth} />
        </defs>

        <g transform={`translate(${margin.left}, ${margin.top})`} >
          <Border
            width={cellSize * hours.length}
            height={cellSize * days.length}/>

          <Days data={days} size={cellSize} />
          <Hours data={hours} size={cellSize} />

          <Blocks
            data={data}
            size={cellSize}
            colorScale={colorScale} />

        </g>
      </svg>
    );
  }
}

export default Heatmap;
