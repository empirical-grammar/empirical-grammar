import React from 'react'
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import {Router, Route, Link, hashHistory} from 'react-router';
import $ from 'jquery'

export default React.createClass({

	propTypes: {
		items: React.PropTypes.array.isRequired,
    callback: React.PropTypes.func
	},

	getInitialState: function() {
		return ({selectedItem: this.props.selectedItem || this.props.items[0]});
	},

	items: function() {
		return this.props.items.map((item) => {
			if (!item.id) {
        // then we don't need ids
				return (<MenuItem key={item} eventKey={item}>{item.name || item}</MenuItem>)
			}
			return <MenuItem key={item.id} eventKey={item.id}>{item.name}</MenuItem>
		})
	},

  findItemByIdOrName: function(idOrName) {
    return this.props.items.find((c) => {
			if (!c.id) {
        // then we're matching on name
				return c === idOrName
			}
			return c.id === idOrName}
		)
  },

	handleSelect: function(itemId) {
		let item = this.findItemByIdOrName(itemId)
		this.setState({selectedItem: item})
    if (this.props.callback) {
      this.props.callback(item)
    }
	},

	render: function() {
		const title = this.state.selectedItem.name || this.state.selectedItem
		return (
			<DropdownButton disabled={!this.props.items.length} bsStyle='default' title={title} id='select-item-dropdown' onSelect={this.handleSelect}>
				{this.items()}
			</DropdownButton>
		);
	}

});
