import * as React from "react";
import Select from 'react-select';
import { Concept } from '../interfaces/interfaces'

interface ConceptColumnProps {
  concepts: Array<Concept>;
  selectConcept: Function;
  unselectConcept(any): void;
  selectedConcept: { levelNumber?: Number, conceptID?: Number},
  levelNumber: Number;
}

interface ConceptColumnState {
  sortField: string;
  sortOrder: string;
}

export default class ConceptColumn extends React.Component<ConceptColumnProps, ConceptColumnState> {
  constructor(props) {
    super(props)

    this.state = {
      sortField: 'name',
      sortOrder: 'asc'
    }

    this.changeSort = this.changeSort.bind(this)
  }

  changeSort(e) {
    this.setState({ sortField: e.value })
  }

  sortNumerically(data) {
    return data.sort((a, b) => a[this.state.sortField] - b[this.state.sortField])
  }

  sortAlphabetically(data) {
    return data.sort((a, b) => {
      const aSort = a[this.state.sortField] ? a[this.state.sortField] : ''
      const bSort = b[this.state.sortField] ? b[this.state.sortField] : ''
      return aSort.localeCompare(bSort)
    })
  }

  selectConcept(e, conceptID, levelNumber) {
    if (e.target.classList.value.includes('concept-list-item')) {
      this.props.selectConcept(conceptID, levelNumber)
    }
  }

  renderConceptList() {
    const { concepts, levelNumber, selectedConcept } = this.props
    const { sortField, sortOrder } = this.state
    let sortedData
    if (sortField === 'name') {
      sortedData = this.sortAlphabetically(concepts)
    } else {
      sortedData = this.sortNumerically(concepts)
    }
    if (sortOrder === 'desc') {
      sortedData = sortedData.reverse()
    }
    const conceptItems = sortedData.map(c => {
      let selected = ''
      let removeSelectionIcon = <span />
      if (selectedConcept.conceptID === c.id) {
        selected = 'selected'
        removeSelectionIcon = <div onClick={this.props.unselectConcept}><i className="fas fa-times" /></div>
      }
      return <div onClick={(e) => this.selectConcept(e, c.id, levelNumber)} className={`concept-list-item ${selected}`}>{c.name}{removeSelectionIcon}</div>
    })
    return <div className="concept-list">{conceptItems}</div>
  }

  renderSorter() {
    const options = [{ value: 'name', label: 'Sort by A-Z'}, { value: 'createdAt', label: 'Date Created'}]
    const value = options.find(o => o.value === this.state.sortField)
    return <Select
      onChange={this.changeSort}
      value={value}
      options={options}
      isClearable={false}
      isSearchable={false}
      className="sort-select"
    />
  }

  render() {
    return <div className="concept-column">
      <div className="concept-column-head">
        <p>Level {this.props.levelNumber}</p>
        {this.renderSorter()}
      </div>
      {this.renderConceptList()}
    </div>
  }
}
