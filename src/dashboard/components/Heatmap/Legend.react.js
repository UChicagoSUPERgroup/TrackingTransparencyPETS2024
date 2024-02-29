import React from 'react';
import * as d3 from 'd3';

const formatTick = d3.format('.1s');

const Box = ({
  gradient,
  width,
  className = 'stroke-gray1 stroke-o-60',
  height = 10
}) =>
  <rect
    className={className}
    r="5"
    x={-width / 2}
    y="10"
    width={width}
    height={height}
    style={{ fill: gradient }} />;

/*
Legend with gradient
- 3 versions depending on  max

    [==============]
    0              3

    [==============]
    0      50     100

    [==============]
    0   200   400  1k
*/
class Legend extends React.Component {
  componentDidMount () {
    this.updateAxis();
  }

  componentDidUpdate () {
    this.updateAxis();
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (
      this.didDomainChange(nextProps) ||
      this.didPositionChange(nextProps) ||
      this.didWidthChange(nextProps)
    );
  }

  didWidthChange ({ width }) {
    return width !== this.props.width;
  }

  didPositionChange ({ x, y }) {
    return x !== this.props.x ||
           y !== this.props.y;
  }

  didDomainChange ({ scale }) {
    const domain = scale.domain();

    const cur = new Set(this.props.scale.domain());
    for (let i = 0; i < domain.length; i++) {
      if (!cur.has(domain[i])) {
        return true;
      }
    }
    return false;
  }

  // custom tick values based on data from `domain`
  getTickValues () {
    const domain = this.props.scale.domain();
    const max = domain[domain.length - 1];

    if (max < 4) {
      return [0, max];
    }

    if (max < 100) {
      return [0, Math.round(max / 2), max];
    }

    return [
      0,
      Math.round(max / 3),
      Math.round(max / 3) * 2,
      max
    ];
  }

  updateAxis () {
    const { scale } = this.props;
    const tickValues = this.getTickValues();

    this.axis.call(
      d3.axisBottom()
        .tickValues(tickValues)
        .tickFormat((val, index) => {
          return index === tickValues.length - 1
            ? val.toLocaleString()
            : formatTick(val);
        })
        .scale(scale));
  }

  axisRef = node => this.axis = d3.select(node);

  render () {
    const { x, y, width, gradient } = this.props;

    return (
      <g transform={`translate(${x}, ${y})`}>
        <Box gradient={gradient} width={width} />
        <g
          className="Heatmap__Legend_axis" // I regret nothing.
          ref={this.axisRef}
          transform="translate(0, 20)" />
      </g>
    );
  }
}


export default Legend;