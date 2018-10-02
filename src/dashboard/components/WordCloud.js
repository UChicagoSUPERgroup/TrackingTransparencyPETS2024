import React from 'react'
import WordCloud from 'react-d3-cloud'
import { scalePow } from 'd3-scale'

const TTWordCloud = (props) => {
  const data = props.data || []
  const height = props.height || 400
  const width = props.width || 400
  const maxFontSize = height / 8
  let min = 0
  let max = 0
  data.forEach(item => {
    min = (item.count < min) ? item.count : min
    max = (item.count > max) ? item.count : max
  })
  const sizeScale = scalePow().domain([min, max]).range([12, height / 8])
  // const rotationScale = scalePow().domain([min, max]).range([-40, 40])
  let wcData = data.map(item => {
    const fontSize = sizeScale(item.count)
    // const rotation = rotationScale(item.count)
    return {
      text: <a href={'#/interests/' + item.name}>{item.name}</a>,
      value: fontSize
      // rotation: rotation
    }
  })
  console.log(wcData)

  return (
    <WordCloud
      data={wcData}
      height={height}
      width={width}
      font='-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
    />
  )
}

export default TTWordCloud
