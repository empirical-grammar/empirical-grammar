import _ from 'underscore';

// Ported from EC.ActivitySearchSort
import PropTypes from 'prop-types';

import React from 'react'

export default React.createClass({
  propTypes: {
    isCurrentSort: PropTypes.bool.isRequired,
    displayName: PropTypes.string.isRequired,
    displayClass: PropTypes.string,
    sortDirection: PropTypes.string.isRequired,
    sortHandler: PropTypes.func.isRequired // Handle sorting of columns
  },

  arrowClass: function() {
    return this.props.sortDirection === 'desc' ? 'fas fa-caret-down table-header-arrow' : 'fas fa-caret-up table-header-arrow';
  },

  clickSort: function() {
    if (_.isEmpty(this.props.displayName)) {
      return;
    }
    var newDirection;
    if (this.props.isCurrentSort) {
    // Toggle the sort direction if it has already been selected.
      newDirection = (this.props.sortDirection === 'asc') ? 'desc' : 'asc';
    }else {
    // Sort should be ascending by default.
      newDirection = 'asc';
    }

    this.props.sortHandler(newDirection);
  },

  render: function() {
    var arrow,
        className = 'sorter';
    if (this.props.isCurrentSort && !_.isEmpty(this.props.displayName)) {
      arrow = <i className={this.arrowClass()} />;
    }
    if (this.props.displayClass) {
      className += ' ' + this.props.displayClass;
    }
    if (this.props.isCurrentSort) {
      className += ' current';
    }
    return (
      <th className={className} onClick={this.clickSort}>
        <span className="table-header-text">{this.props.displayName}</span>
        {arrow}
      </th>
    );
  }
});
