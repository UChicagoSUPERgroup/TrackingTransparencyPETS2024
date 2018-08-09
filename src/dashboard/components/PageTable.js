import React from 'react';
import ReactTable from 'react-table';

import Link from '@instructure/ui-elements/lib/components/Link'

export default class RecentVisitsTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      title: props.title,
      data: props.data
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.data !== prevProps.data) {
      this.setState({ data: this.props.data })
    }
    if (this.props.title !== prevProps.title) {
      this.setState({ title: this.props.title })
    }
  }

  render() {
    let { data, title } = this.state

    const columns = [
      {
        Header: 'Time',
        id: 'id',
        accessor: d => (new Date(d.Pages.id).toLocaleTimeString()),
        maxWidth: 150
      }
    ]

    if (this.props.showSite) {
      columns.push({
        Header: 'Site',
        id: 'domain',
        accessor: d => d.Pages.domain,
        Cell: row => (
          <div key={row.value}>
            <Link href={'#/domains/' + row.value}>
              {row.value}
            </Link>
          </div>),
        width: 200
      })
    }

    columns.push({
      Header: 'Page',
      id: 'title',
      accessor: d => d.Pages.title
    })

    if (this.props.showInference) {
      columns.push({
        Header: 'Inference',
        id: 'infer',
        accessor: d => d.Inferences.inference,
        Cell: row => (
          <div key={row.value}>
            <Link href={'#/inferences/' + row.value}>
              {row.value}
            </Link>
          </div>)
      })
    }

    return (
      <ReactTable
        data={data}
        columns={[
          {
            Header: title,
            columns: columns
          }
        ]}
        showPageSizeOptions={false}
        pageSize={(data && (data.length >= 1)) ? 20 : 3}
        noDataText={(data && !(data.length >= 1))
          ? 'No inferred interests at this time'
          : 'Click in the scatterplot for more information'}
        className='-striped -highlight'
      />
    );
  }
}
