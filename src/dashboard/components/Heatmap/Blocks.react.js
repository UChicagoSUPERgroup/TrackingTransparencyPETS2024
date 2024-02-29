import React from 'react';
import Block from './Block.react';
import moment from 'moment';

const formatDate = (date, format = 'MMM DD') => moment(date).format(format);

const Tooltip = ({
  children,
  className = 'pa1'
}) =>
  <div className={className}>{children}</div>;

const DateItem = ({
  date,
  total,
  className = 'flex items-center justify-between mv1'
}) =>
  <li className={className}>
    <div className="mr3">{formatDate(date)}</div>
    <div>{total}</div>
  </li>;

const DateBreakDown = ({
  byDay,
  total
}) =>
  <Tooltip>
    <ul>
      {byDay.map(({ key, value }) =>
        <DateItem key={key} date={key} total={value.total} />
      )}
    </ul>

    <div className="mv1 bt b--gray1 tr pt2">
      Total: {total.toLocaleString()}
    </div>
  </Tooltip>;

const buildTooltip = ({
  byDay,
  total
}) =>  {
  if (!total) return undefined;

  if (byDay.length === 1) {
    return <Tooltip>Total: {total.toLocaleString()}</Tooltip>;
  }

  return <DateBreakDown byDay={byDay} total={total} />;
};

/**
 * day of week - yAxis
 * hour of day - xAxis
 *
 *  [ ] [ ] [ ]...
 *  [ ] [ ] [ ]...
 *  [ ] [ ] [ ]...
 */
const Blocks = ({
  data,
  size,
  colorScale,
  onViewAll,
  ...props
}) =>
  <g {...props} >
    {data.map(({ day, hour, total, byDay }, index) => (
      <Block
        key={`${day}_${hour}`}
        x={Number(hour) === 0 ? 23 * size : (Number(hour) - 1) * size}
        y={(day) * size}
        size={size}
        index={index}
        tooltip={buildTooltip({ total, byDay })}
        color={total === 0 ? '#FFF' : colorScale(total)} />
    ))}
  </g>;

export default Blocks;