import * as React from 'react'
import { DataTable } from './dataTable'
// import { DataTable, defaultDataTableTimeout } from 'quill-component-library/dist/componentLibrary'

const headers1 = [
  {
    name: 'Name',
    attribute: 'name',
    width: '126px'
  },
  {
    name: 'Activities',
    attribute: 'activities',
    width: '53px'
  },
  {
    name: 'Questions',
    attribute: 'questions',
    width: '53px'
  },
  {
    name: 'Score',
    attribute: 'score',
    width: '36px'
  }
]

const headers2 = [
  {
    name: 'Name',
    attribute: 'name',
    width: '126px'
  },
  {
    name: 'Username',
    attribute: 'username',
    width: '219px'
  }
]

const rows1 = [
  {
    name: 'Maya Angelou',
    activities: 15,
    questions: 108,
    score: '97%',
    id: 1
  },
  {
    name: 'Ambrose Bierce',
    activities: 14,
    questions: 92,
    score: '82%',
    id: 2
  },
  {
    name: 'George Gordon Byron',
    activities: 16,
    questions: 116,
    score: '93%',
    id: 3
  },
  {
    name: 'Elizabeth Carter',
    activities: 8,
    questions: 78,
    score: '94%',
    id: 4
  },
  {
    name: 'Anton Chekhov',
    activities: 7,
    questions: 72,
    score: '87%',
    id: 5
  }
]

const rows2 = [
  {
    name: 'Maya Angelou',
    username: 'maya.angelou@local-writing',
    id: 1
  },
  {
    name: 'Ambrose Bierce',
    username: 'ambrose.bierce@local-writing',
    id: 2
  },
  {
    name: 'George Gordon Byron',
    username: 'georgegordon.byron@local-writing',
    id: 3
  },
  {
    name: 'Elizabeth Carter',
    username: 'elizabeth.carter@local-writing',
    id: 4
  },
  {
    name: 'Anton Chekhov',
    username: 'anton.checkhov@local-writing',
    id: 5
  }
]

class DataTables extends React.Component<any, any> {
  constructor(props) {
    super(props)

    this.state = { checkedIds: [] }

    this.checkRow = this.checkRow.bind(this)
    this.uncheckRow = this.uncheckRow.bind(this)
    this.checkAllRows = this.checkAllRows.bind(this)
    this.uncheckAllRows = this.uncheckAllRows.bind(this)
  }

  checkAllRows() {
    const newIds = rows2.map(row => row.id)
    this.setState({ checkedIds: newIds })
  }

  uncheckAllRows() {
    this.setState({ checkedIds: [] })
  }

  checkRow(id) {
    if (!this.state.checkedIds.includes(id)) {
      const newIds = this.state.checkedIds.concat(id)
      this.setState({ checkedIds: newIds })
    }
  }

  uncheckRow(id) {
    if (this.state.checkedIds.includes(id)) {
      const newIds = this.state.checkedIds.filter(checkedId => checkedId !== id)
      this.setState({ checkedIds: newIds })
    }
  }

  render() {
    const checkedRows = rows2.map(row => {
      row.checked = this.state.checkedIds.includes(row.id)
      return row
    })

    return <div id="data-tables">
      <h2 className="style-guide-h2">Data Tables</h2>
      <div className="element-container">
        <div>
          <h4 className="style-guide-h4">Data table</h4>
          <pre>
{`
const rows1 = ${JSON.stringify(rows1)}
const headers1 = ${JSON.stringify(headers1)}
<DataTable
  rows={rows1}
  headers={headers1}
/>
`}
          </pre>
          <div className="data-tables-container">
            <DataTable
              rows={rows1}
              headers={headers1}
            />
          </div>
        </div>
      </div>
      <div className="element-container">
        <div>
          <h4 className="style-guide-h4">Data table: Checkboxes</h4>
          <pre>
{`
const rows2 = ${JSON.stringify(rows2)}
const headers2 = ${JSON.stringify(headers2)}

export class DataTableWrapper {
  constructor(props) {
    super(props)

    this.state = { checkedIds: [] }

    this.checkRow = this.checkRow.bind(this)
    this.uncheckRow = this.uncheckRow.bind(this)
    this.checkAllRows = this.checkAllRows.bind(this)
    this.uncheckAllRows = this.uncheckAllRows.bind(this)
  }

  checkRow(id) {
    if (!this.state.checkedIds.includes(id)) {
      const newIds = this.state.checkedIds.concat(id)
      this.setState({ checkedIds: newIds })
    }
  }

  uncheckRow(id) {
    if (this.state.checkedIds.includes(id)) {
      const newIds = this.state.checkedIds.filter(checkedId => checkedId !== id)
      this.setState({ checkedIds: newIds })
    }
  }

  checkAllRows() {
    const newIds = rows2.map(row => row.id)
    this.setState({ checkedIds: newIds })
  }

  uncheckAllRows() {
    this.setState({ checkedIds: [] })
  }

  render() {
    const rows = rows2.map(row => {
      row.checked = this.state.checkedIds.includes(row.id)
      return row
    })
    return <DataTable
      rows={rows}
      headers={headers2}
      showCheckboxes={true}
      checkRow={this.checkRow}
      uncheckRow={this.uncheckRow}
      uncheckAllRows={this.uncheckAllRows}
      checkAllRows={this.checkAllRows}
    />
  }
}
`}
          </pre>
          <div className="data-tables-container">
            <DataTable
              rows={checkedRows}
              headers={headers2}
              showCheckboxes={true}
              checkRow={this.checkRow}
              uncheckRow={this.uncheckRow}
              uncheckAllRows={this.uncheckAllRows}
              checkAllRows={this.checkAllRows}
            />
          </div>
        </div>
      </div>
    </div>
  }

}

export default DataTables
