import React from 'react';

const formatHour = (hour) => {
  if (hour < 12) return [hour, 'AM'];
  if (hour === 12) return [hour, 'PM'];

  return hour === 24 ? [12, 'AM'] : [hour - 12, 'PM'];
};

const StackedHourText = ({
  hour,
  suffix,
  x,
  y = -16,
  className = 'text-anchor-m f8'
}) =>
  <text
    className={
      hour === 12 && suffix === 'PM'
        ? `${className} b`
        : className
    }
    transform={`translate(${x}, ${y})`}>
    <tspan x="0">{hour}</tspan>
    <tspan x="0" dy="1.1em">{suffix}</tspan>
  </text>;

/*
     1   2   3   4
    Am  AM  AM  AM
*/
const Hours  = ({
  data,
  size,
  ...props
}) =>
  <g {...props}>
    {data.map((hour, index) => {
      const [hourNum, hourSuffix] = formatHour(Number(hour));
      return (
        <g key={hour} transform={`translate(${index * size}, 0)`}>
          <StackedHourText
            x={size / 2}
            hour={hourNum}
            suffix={hourSuffix} />
        </g>
      );
    })}
  </g>;

export default Hours;