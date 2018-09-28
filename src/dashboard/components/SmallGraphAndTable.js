import React from 'react'
import ReactTable from 'react-table'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'
import ToggleGroup from '@instructure/ui-toggle-details/lib/components/ToggleGroup'
import View from '@instructure/ui-layout/lib/components/View'
import { lighten } from '@instructure/ui-themeable/lib/utils/color'

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

export default function SmallGraphAndTable ({ name, data, c1Header, urlStem, description, color }) {
  const lower = name.toLowerCase()
  const graphData = data.reverse().slice(-10).map(d => ({
    y: d['name'],
    x: d['count']
  }))
  return (
    <View>
      <Heading level='h2'>{name}</Heading>
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

  render () {
    let { data, hovered } = this.state
    const { yTitle, color } = this.props
    data = data.map(d => ({
      ...d,
      color: (hovered && d.y === hovered.y) ? 1 : 0
    }))
    return (
      <FlexibleWidthXYPlot
        yType={'ordinal'}
        height={400}
        margin={{left: 150, bottom: 80}}
        colorDomain={[0, 1]}
        colorRange={[this.color, this.secondaryColor]}
        onMouseLeave={() => this.setState({hovered: null})}
      >
        <HorizontalGridLines />
        <VerticalGridLines />
        <YAxis />
        <XAxis
          position='middle'
          height={200}
          tickLabelAngle={0}
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
            this.setState({selectedTracker: datapoint})
          }}
        />
        <CustomAxisLabel xAxis title='Pages' />
        <CustomAxisLabel yAxis title={yTitle} />
      </FlexibleWidthXYPlot>
    )
  }
}

const SmallTable = ({ data, c1Header, c2Header, c2Accessor, urlStem }) => {
  return (
    <ReactTable
      data={data}
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
