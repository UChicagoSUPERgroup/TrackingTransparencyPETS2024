import React from 'react';
import * as d3 from 'd3';

const Gradient = ({
  id,
  countScale,
  colorScale,
  width,
  stops = 10,
}) => {
  const [start, mid] = countScale.domain();
  const end = mid - start;
  const range = d3.range(stops);

  const points = range.map((d, i) =>
    i * end / (stops - 1) + start
  );

  return (
    <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
      {range.map((d, index) =>
        <stop
          key={d}
          offset={countScale(points[index]) / width}
          stopColor={colorScale(points[index])} />
      )}
    </linearGradient>
  );
};

export default Gradient;