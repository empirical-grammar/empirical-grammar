'use strict'
import React from 'react'
export default React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired
  },

  objectiveTitle: function () {
    return [this.props.data.activity.classification.alias, "Objective"].join(' ');
  },

  getClassName: function () {
    if (this.props.data.concept_results && this.props.data.concept_results.length) {
      return 'activity-details'
    } else {
      return 'activity-details no-concept-results'
    }
  },

  dateOrNot: function () {
    if ((this.props.data.state != 'finished') && (!this.props.data.due_date)) {
      return null
    } else {
      var dateTitle, dateBody;
      if (this.props.data.state == 'finished') {
        dateTitle = 'Completed:';
        dateBody = this.props.data.completed_at;
      } else {
        dateTitle = 'Due:';
        dateBody = this.props.data.due_date;
      }
      return (
        <div className='activity-detail'>
          <span className='activity-detail-title'>
            {dateTitle}
          </span>
          <span className='activity-detail-body'>
            {dateBody}
          </span>
        </div>
      )
    }
  },

  render: function () {
    return (
      <div className={this.getClassName()}>
        <div className='activity-detail'>
          <div className='activity-detail-title objective-title'>
            {this.objectiveTitle()}
          </div>
          <div className='activity-detail-body'>
            {this.props.data.activity.description}
            <p>{this.props.data.due_date_or_completed_at_date}</p>
          </div>
        </div>
        {this.dateOrNot()}
      </div>
    );
  }
});
