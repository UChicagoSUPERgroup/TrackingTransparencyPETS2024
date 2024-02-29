import * as d3 from 'd3';

export const getHourRange = () => {
  const range = d3.range(25);
  range.shift();
  return range;
};

/**
 * @param {Object} margin <top, left, right, bottom>
 * @param {Number} width
 * @param {Number} height
 * @returns {Object} <width, height>
 */
export const getInternalSize = ({ margin, width, height }) => ({
  width: width - margin.left - margin.right,
  height: height - margin.top - margin.bottom
});

/**
 * @param {Array} data
 * @param {String} key
 * @param {Array} range
 * @returns {d3.ScaleLinear}
 */
export const buildColorScale = (
  data,
  key = 'total',
  range = ['#FFECB3', '#E85285', '#6A1B9A']
) =>
  d3.scaleLinear()
    .domain([0, d3.max(data, d => d[key]) / 2, d3.max(data, d => d[key])])
    .range(range);


/**
 * @param {Array} data
 * @param {Number} width
 * @param {String} key
 * @returns {d3.ScaleLinear}
 */
export const buildCountScale = (data, width, key = 'total') =>
  d3.scaleLinear()
    .domain([0, d3.max(data, d => d[key])])
    .range([0, width]);


/**
 * @param {Array} data
 * @param {Number} width
 * @param {String} key
 * @returns {d3.ScaleLinear}
 */
export const buildLegendScale = (data, width, key = 'total') =>
  d3.scaleLinear()
    .range([-width / 2, width / 2])
    .domain([0, d3.max(data, d => d[key])]);