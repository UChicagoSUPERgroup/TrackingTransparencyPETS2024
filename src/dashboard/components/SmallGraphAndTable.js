import React from 'react'
import ReactTable from 'react-table'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'
import ToggleGroup from '@instructure/ui-toggle-details/lib/components/ToggleGroup'
import View from '@instructure/ui-layout/lib/components/View'

import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  HorizontalBarSeries
} from 'react-vis'

import CustomAxisLabel from './CustomAxisLabel'

export default function SmallGraphAndTable ({ name, data, c1Header, urlStem, description }) {
  const lower = name.toLowerCase()
  const graphData = data.slice(0, 10).map(d => ({
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
        />
      </View>
      <ToggleGroup
        summary={'See all ' + lower}
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

const SmallGraph = ({ data, yTitle }) => {
  return (
    <FlexibleWidthXYPlot
      yType={'ordinal'}
      height={400}
      margin={{left: 150, bottom: 80}}
    >
      <HorizontalGridLines />
      <VerticalGridLines />
      <YAxis />
      <XAxis
        position='middle'
        height={200}
        tickLabelAngle={0}
      />
      <HorizontalBarSeries
        data={data}
        color='#8F3931'
      />
      <CustomAxisLabel xAxis title='Pages' />
      <CustomAxisLabel yAxis title={yTitle} />
    </FlexibleWidthXYPlot>
  )
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
