import * as d3 from 'd3';
import moment from 'moment';

/**
 * @param {Array} data
 * @param {Number} days
 * @param {Nubmer} hours
 * @returns {Array} data
 */
const backfillWeekDay = (data, days = 7, hours = 24) => {
  const backfilled = { ...data };

  d3.range(days).map(day => {
    if (!backfilled[day]) backfilled[day] = {};

    d3.range(hours).map(hour => {
      if (!backfilled[day][hour]) {
        backfilled[day][hour] = {
          total: 0,
        };
      }
    });
  });

  return backfilled;
};

/**
 * @param {Array} data
 * @returns {Array} data
 */
const flattenWeekDay = (data) => {
  const grid = [];
  for (const day in data) {
    for (const hour in data[day]) {
      grid.push({
        ...data[day][hour],
        day,
        hour
      });
    }
  }

  return grid;
};

/**
 * @param {Array} data
 * @param {String} key
 * @param {String} format
 * @returns {Array} data
 */
const nestByDay = (data, key = 'date', format = 'YYYY-MM-DD') =>
  d3.nest()
    .key(d => moment.utc(d[key]).format(format))
    .rollup(group => {
      return {
        total: group.length
      };
    })
    .entries(data)
    .sort((a, b) => d3.ascending(a.key, b.key));

/**
 * - Uses `UTC` for calcuation
 *
 * nest data by `day of week` and `hour` to build a grid of 7 days x 24 hours
 * containing totals with backfilled dates
 * @param {Array} data
 * @param {String} key
 * @return {Array}
 */
export const nestByWeekDayHour = (data, key = 'date') => {
  const nested = d3.nest()
    .key(d => moment.utc(d[key]).day())
    .key(d => moment.utc(d[key]).hours())
    .rollup(group => {
      return {
        byDay: nestByDay(group),
        total: group.length
      };
    })
    .object(data);

  return flattenWeekDay(backfillWeekDay(nested));
};
