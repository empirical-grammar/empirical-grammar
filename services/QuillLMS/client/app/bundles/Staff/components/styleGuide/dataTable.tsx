import * as React from 'react'

export const descending = 'desc'
export const ascending = 'asc'

const indeterminateSrc = `${process.env.CDN_URL}/images/icons/indeterminate.svg`
const smallWhiteCheckSrc = `${process.env.CDN_URL}/images/shared/check-small-white.svg`
const arrowSrc = `${process.env.CDN_URL}/images/shared/arrow.svg`

interface DataTableRow {
  id: number|string;
  [key:string]: any;
}

interface DataTableHeader {
  width: string;
  name: string;
  attribute: string;
  isSortable?: boolean;
}

interface DataTableProps {
  headers: Array<DataTableHeader>;
  rows: Array<DataTableRow>;
  className?: string;
  defaultSortAttribute?: string;
  defaultSortDirection?: string;
  showCheckboxes?: boolean;
  checkRow?: (event: any) => void;
  uncheckRow?: (event: any) => void;
  uncheckAllRows?: (event: any) => void;
  checkAllRows?: (event: any) => void;
}

interface DataTableState {
  sortAttribute?: string;
  sortDirection?: string;
}

export class DataTable extends React.Component<DataTableProps, DataTableState> {
  constructor(props) {
    super(props)

    this.state = {
      sortAttribute: props.defaultSortAttribute || null,
      sortDirection: props.defaultSortDirection || descending
    }

    this.changeSortDirection = this.changeSortDirection.bind(this)
  }

  attributeAlignment(attributeName) {
    const numbersRegex = new RegExp(/^[\d#%\.\$]+$/)
    return this.props.rows.every(row => numbersRegex.test(row[attributeName])) ? 'right' : 'left'
  }

  changeSortDirection() {
    if (this.state.sortDirection === descending) {
      this.setState({ sortDirection: ascending })
    } else {
      this.setState({ sortDirection: descending })
    }
  }

  sortRows() {
    const { sortAttribute, sortDirection, } = this.state
    const { rows } = this.props
    if (sortAttribute) {
      const sortedRows = rows.sort((a, b) => a[sortAttribute] - b[sortAttribute])
      return sortDirection === descending ? sortedRows : sortedRows.reverse()
    } else {
      return rows
    }
  }

  renderHeaderCheckbox() {
    const { showCheckboxes, rows, uncheckAllRows, checkAllRows } = this.props
    if (showCheckboxes) {
      const anyChecked = rows.some(row => row.checked)
      if (anyChecked) {
        return <span className="quill-checkbox selected data-table-header">
          <img src={indeterminateSrc} alt="check" onClick={uncheckAllRows}/>
        </span>
      } else {
        return <span className="quill-checkbox unselected data-table-header" onClick={checkAllRows} />
      }
    }
  }

  renderRowCheckbox(row) {
    if (this.props.showCheckboxes) {
      if (row.checked) {
        return <span className="quill-checkbox selected data-table-row-section" onClick={() => this.props.uncheckRow(row.id)}><img src={smallWhiteCheckSrc} alt="check" /></span>
      } else {
        return <span className="quill-checkbox unselected data-table-row-section" onClick={() => this.props.checkRow(row.id)} />
      }
    }
  }

  renderHeaders() {
    const headers = this.props.headers.map(header => {
      const sortArrow = header.isSortable ? <img className={`sort-arrow ${this.state.sortDirection}`} onClick={this.changeSortDirection} src={arrowSrc} /> : null
      return <span
        className="data-table-header"
        style={{ width: `${header.width}`, textAlign: `${this.attributeAlignment(header.attribute)}`}}
        >
          {sortArrow}
          {header.name}
        </span>
    })
    return <div className="data-table-headers">{this.renderHeaderCheckbox()}{headers}</div>
  }

  renderRows() {
    const headers = this.props.headers
    const rows = this.sortRows().map(row => {
      const rowClassName = `data-table-row ${row.checked ? 'checked' : ''}`
      const rowSections = headers.map(header => (
        <span
          className="data-table-row-section"
          style={{ width: `${header.width}`, textAlign: `${this.attributeAlignment(header.attribute)}`}}
        >
          {row[header.attribute]}
        </span>
      ))
      return <div className={rowClassName}>{this.renderRowCheckbox(row)}{rowSections}</div>
    })
    return <div className="data-table-body">{rows}</div>
  }

  render() {
    return <div className={`data-table ${this.props.className}`}>
      {this.renderHeaders()}
      {this.renderRows()}
    </div>
  }

}
