import React from 'react';
import {sortable} from 'react-sortable';
import ListItem from './listItem.jsx'

const SortableListItem = sortable(ListItem);

export default class SortableList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      draggingIndex: null,
      data: {
        items: this.props.data
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.state.data.items) {
      this.setState({data: {items: nextProps.data}})
    }
  }

  updateState = obj => {
    this.setState(obj, this.props.sortCallback(this.state));
  };

  render() {
    const listItems = this.state.data.items.map(function(item, i) {
      return (
        <SortableListItem
          draggingIndex={this.state.draggingIndex}
          items={this.state.data.items}
          key={i}
          outline="list"
          sortId={i}
          updateState={this.updateState}
        >
          {item}
        </SortableListItem>
      );
    }, this);

    return (
      <div className="list sortable-list">{listItems}</div>
    );
  }
}
