import React from 'react'
import ReactTable from 'react-table'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'
import ToggleGroup from '@instructure/ui-toggle-details/lib/components/ToggleGroup'
import View from '@instructure/ui-layout/lib/components/View'
import { lighten } from '@instructure/ui-themeable/lib/utils/color'

import { axisStyle } from '../../colors'

import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  HorizontalBarSeries,
  Hint
} from 'react-vis'

import CustomAxisLabel from './CustomAxisLabel'

export default function SmallGraphAndTable ({ name, data, c1Header, urlStem, description, color, pageType, title }) {
  const lower = c1Header.toLowerCase()
  const graphData = data.reverse().slice(-10).map(d => ({
    y: d['name'],
    x: d['count']
  }))

  var head, text
  switch (pageType) {
    case "tracker":
      head = <Heading level='h2'>On which sites did <em>{title}</em> track you?</Heading>
      text = <Text><br/>{title} may have been tracking you on <strong>{data.length} sites</strong>. <em>Click on a bar to learn more.</em></Text>
      break
    case "site":
      head = <Heading level='h2'>Which trackers tracked you on <em>{title}</em>?</Heading>
      text = <Text><br/>On {title}, you may have been tracked by <strong>{data.length} trackers</strong>. <em>Click on a bar to learn more.</em></Text>
      break
    case "inference":
      if (c1Header=="Sites") {
        head = <Heading level='h2'>Which sites were about <em>{title}</em>?</Heading>
        text = <Text><br/>You visited <strong>{data.length} sites</strong> that may have been about {title}, which trackers may have guessed is an interest if yours. <em>Click on a bar to learn more.</em></Text>
      } else if (c1Header=="Trackers"){
        head = <Heading level='h2'>Which trackers might think you are interested in <em>{title}</em>?</Heading>
        text = <Text><br/><strong>{data.length} trackers</strong> may have guessed that you are interested in {title}. <em>Click on a bar to learn more.</em></Text>
      }
      break
  }

  maybeSmallGraph() {

    
  }

  return (
    <View>
      {head}
      {text}
      {/* {maybeSmallGraph()} */}
      <View as='div' margin='medium 0 small 0'>
        <SmallGraph
          data={graphData}
          yTitle={c1Header}
          color={color}
        />
      </View>
      <ToggleGroup
        summary={'See all ' + data.length + ' ' + lower}
        toggleLabel={'Toggle to see table for ' + lower}
        margin='medium 0 0 0'
        border={false}
      >
        <SmallTable
          data={data}
          name={name}
          c1Header={c1Header}
          c1Accessor='name'
          c2Header='Pages'
          c2Accessor='count'
          urlStem={urlStem}
        />
      </ToggleGroup>
    </View>
  )
}

class SmallGraph extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data: props.data
    }
    this.color = props.color
    this.secondaryColor = lighten(props.color, 10)
  }

  formatTick (d) {
    if (Number.isInteger(d)) {
      return d.toString()
    } else {
      return ''
    }
  }

  render () {
    let { data, hovered } = this.state
    if (data.length === 0) return null // quick crash fix
    const { yTitle } = this.props
    data = data.map(d => ({
      ...d,
      color: (hovered && d.y === hovered.y) ? 1 : 0
    }))
    const lower = yTitle.toLowerCase()
    let height
    switch (data.length) {
      case 0:
        height = 0
        break
      case 1:
        height = 150
        break
      case 2:
        height = 200
        break
      case 3:
        height = 250
        break
      case 4:
        height = 300
        break
      case 5:
        height = 350
        break
      default:
        height = 400
    }
    return (
      <FlexibleWidthXYPlot
        yType={'ordinal'}
        height={height}
        margin={{left: 150, bottom: 80}}
        colorDomain={[0, 1]}
        colorRange={[this.color, this.secondaryColor]}
        onMouseLeave={() => this.setState({hovered: null})}
      >
        <HorizontalGridLines />
        <VerticalGridLines />
        <YAxis
          style={axisStyle}
        />
        <XAxis
          title='Pages'
          height={200}
          tickLabelAngle={0}
          tickFormat={this.formatTick}
          style={axisStyle}
        />
        {hovered && <Hint
          value={hovered}>
          <div className='rv-hint__content'>
            <strong>{hovered.y}</strong><br />{hovered.x} {hovered.x === 1 ? 'page' : 'pages'}
          </div>
        </Hint>}
        <HorizontalBarSeries
          data={data}
          onValueMouseOver={(datapoint) => {
            this.setState({hovered: datapoint})
          }}
          onValueClick={(datapoint) => {
            // this.setState({selectedTracker: datapoint})
            window.location.href = '#/'+lower+'/'+hovered.y
          }}
        />
        <CustomAxisLabel yAxis title={yTitle} />
        <CustomAxisLabel xAxis title='Pages' />
      </FlexibleWidthXYPlot>
    )
  }
}

const SmallTable = ({ data, c1Header, c2Header, c2Accessor, urlStem }) => {
  return (
    <ReactTable
      data={data.reverse()}
      columns={[
        {Header: c1Header,
          accessor: 'name',
          Cell: row => (
            <div key={row.value}>
              <Link className={c1Header + 'TableLinkTrackersPage'} href={urlStem + row.value}>
                {row.value}
              </Link>
            </div>)
        },
        {Header: c2Header,
          accessor: c2Accessor}
      ]}
      pageSize={Math.min(10, Math.max(data.length, 3))}
      showPageSizeOptions={false}
      className='-striped -highlight'
    />
  )
}
