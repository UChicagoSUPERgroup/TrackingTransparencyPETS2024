import React from 'react'
import ReactTable from 'react-table'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'
import View from '@instructure/ui-layout/lib/components/View'
import ToggleGroup from '@instructure/ui-toggle-details/lib/components/ToggleGroup'

import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  VerticalBarSeries
} from 'react-vis'

import CustomAxisLabel from './CustomAxisLabel'

export default function SmallGraphAndTable ({ name, data, c1Header, c1Accessor, urlStem, description }) {
  const lower = name.toLowerCase()
  const graphData = data.slice(0,10).map(d => ({
    x: d[c1Accessor],
    y: d['count']
  }))

  return (
    <div>
      <Heading level='h2' margin='0 0 medium 0'>{name}</Heading>
      <Text>{description}</Text>
      <View as='div' margin='medium 0 small 0'>
        <SmallGraph
          data={graphData}
          xTitle={c1Header}
        />
      </View>
      <ToggleGroup
        summary={'See all ' + lower}
        toggleLabel={'Toggle to see table for ' + lower}
        variant='filled'
        margin='medium 0 0 0'
      >
        <SmallTable
          data={data}
          name={name}
          c1Header={c1Header}
          c1Accessor={c1Accessor}
          c2Header='Pages'
          c2Accessor='count'
          urlStem={urlStem}
        />
      </ToggleGroup>
    </div>
  )
}

const SmallGraph = ({ data, xTitle }) => {
  return (
    <FlexibleWidthXYPlot
      xType={'ordinal'}
      height={200}
      margin={{left: 50, bottom: 100}}
    >
      <HorizontalGridLines />
      <VerticalGridLines />
      <XAxis
        tickLabelAngle={-20}
      />
      <YAxis
        position='middle'
        height={200}
        tickLabelAngle={0}
      />
      
      <CustomAxisLabel title={'Pages'}/>
      <CustomAxisLabel title={xTitle} xAxis yShift={2}/>
      <VerticalBarSeries data={data} color="#8F3931"/>
    </FlexibleWidthXYPlot>
  )

}

const SmallTable = ({ data, c1Header, c1Accessor, c2Header, c2Accessor, urlStem }) => {
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: c1Header,
          accessor: c1Accessor,
          Cell: row => (
            <div key={row.value}>
              <Link className={c1Accessor + 'TableLinkTrackersPage'} href={urlStem + row.value}>
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
  );
}


