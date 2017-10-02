'use strict'

import React from 'react'
import $ from 'jquery'
import UnitTemplateProfileShareButtons from './unit_templates_manager/unit_template_profile/unit_template_profile_share_buttons'
import LoadingIndicator from '../shared/loading_indicator'

export default  React.createClass({

  getInitialState: function() {
    return {
      loading: true,
      actions: this.unitTemplateAssignedActions,
      data: null,
      diagnosticId: ''
    }
  },

  getInviteStudentsUrl: function() {
    return ('/teachers/classrooms/invite_students');
  },

  unitTemplatesAssignedActions: function() {
    return {studentsPresent: this.props.students, getInviteStudentsUrl: this.getInviteStudentsUrl};
  },

  getDefaultProps: function() {
    // the only time we won't pass this is if they are assigning the diagnostic,
    // but actions shouldn't be undefined
    return {actions: {getInviteStudentsUrl: this.getInviteStudentsUrl}}
  },

  hideSubNavBars: function() {
    $('.unit-tabs').hide();
    $('.tab-outer-wrap').hide();
    $('.section-content-wrapper').hide();
  },


  anyClassroomsWithStudents: function(classrooms) {
    return !!classrooms.find((e) => e.students.length > 0)
  },

  componentWillMount: function() {
    const activityId = this.props.data.id;
    const that = this;
      $.ajax({
        url: '/teachers/classrooms_i_teach_with_students',
        dataType: 'json',
        success: function(data) {
          that.setState({loading: false, studentsPresent: that.anyClassroomsWithStudents(data.classrooms) });
        }
      });
      $.ajax({
        url: '/teachers/last_assigned_unit_id',
        dataType: 'json',
        success: function(data) {
          that.setState({loading: false, diagnosticId: data.id });
        }
      });
  },

  activityName: function() {
    return this.props.data.name;
  },

  data: function() {
    return {
      name: this.props.data.name,
      id: this.props.data.id
    }
  },

  teacherSpecificComponents: function() {
    this.hideSubNavBars();

    let href;
    let text;

    if (this.props.type === 'diagnostic' || this.state.studentsPresent) {
      href = `/teachers/classrooms/activity_planner#${this.state.diagnosticId}`
      text = 'View Assigned Activity Packs';
    } else {
      href = this.state.actions.getInviteStudentsUrl();
      text = 'Add Students'
    }

    return (
      <span>
            <a href={href}>
              <button onClick className="button-green add-students pull-right">
                {text} <i className="fa fa-long-arrow-right"></i>
              </button>
            </a>
      </span>
    )
  },



  render: function () {
    if(this.state.loading) {
      return(<LoadingIndicator />);
    }

    $('html,body').scrollTop(0);
    return (
      <div className='assign-success-container'>
    <div className='successBox'>
      <div className='container'>
        <div className='row' id='successBoxMessage'>
          <div className='col-md-9 successMessage'>
            <i className="fa fa-check-circle pull-left"></i> You’ve successfully assigned the <strong>{this.activityName()}</strong> Activity Pack!
          </div>
          <div className='col-md-4'>
            {this.teacherSpecificComponents()}
          </div>
        </div>
      </div>
    </div>
    <div className='sharing-container'>
      <h2>
        Share Quill With Your Colleagues
      </h2>
        <p className='nonprofit-copy'>
          We’re a nonprofit providing free literacy activities. The more people <br></br>
          that use Quill, the more free activities we can create.
        </p>
      <p className='social-copy'>
        <i>I’m using the {this.activityName()} Activity Pack from Quill.org to teach writing & grammar. quill.org/activities/packs/{this.props.data.id}</i>
      </p>
      <div className='container'>
        <UnitTemplateProfileShareButtons data={this.data()} />
      </div>
    </div>
    </div>
  );
  }
});
