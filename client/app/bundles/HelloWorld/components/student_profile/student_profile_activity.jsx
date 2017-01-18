'use strict';
import React from 'react'
import ActivityIconWithTooltip from '../general_components/activity_icon_with_tooltip.jsx'

export default React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired
  },

  renderStartButton: function () {
    let linkText
    if (!this.props.data.activity.repeatable && this.props.finished) {
      return (<p className="title-v-centered text-right">Completed</p>)
    } else if (this.props.finished) {
      linkText = 'Replay Lesson'
    } else if (this.props.data.state == 'started'){
      linkText = 'Resume Lesson'
    } else {
      linkText = 'Start Lesson'
    }
    return <a href={this.props.data.link}>{linkText}</a>
  },

  render: function () {
    return (
      <div className="line">
        <div className="row">
          <div className="col-xs-9 col-sm-10 col-xl-10 pull-left">
            <ActivityIconWithTooltip data={this.props.data} context={'studentProfile'} />
            <div className="icons-description-wrapper">
              <p className="title title-v-centered">{this.props.data.activity.name}</p>
            </div>
          </div>
          <div className="col-xs-3 col-sm-2 col-xl-2">
            {this.renderStartButton()}
          </div>
        </div>
      </div>
    );
  }
})
