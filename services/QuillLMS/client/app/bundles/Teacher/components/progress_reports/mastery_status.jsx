'use strict';
import React from 'react'
import cutOff from '../../../../modules/proficiency_cutoffs.js'
export default React.createClass({
  propTypes: {
    score: React.PropTypes.number.isRequired
  },

  circleClass: function() {
    if (this.props.score > cutOff.proficient) {
      return 'circle proficient';
    } else {
      return 'circle not-proficient';
    }
  },

  text: function() {
    if (this.props.score > cutOff.proficient) {
      return 'Proficient';
    } else {
      return 'Not yet proficient';
    }
  },

  render: function() {
    return (
      <div>
        <div className={this.circleClass()} />
        <span>{this.text()}</span>
      </div>
    );
  }
});
