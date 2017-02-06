'use strict'

 import React from 'react'
 import Classroom from './classroom'
 import ActivityDueDate from './activity_due_date'
 import ClassroomsWithStudents  from './ClassroomsWithStudents.jsx'
 import AssigningIndicator from '../../../shared/assigning_indicator'

 export default  React.createClass({

  getInitialState: function() {
    return {
      classroomsAndTheirStudents: [],
      buttonDisabled: false,
      prematureAssignAttempted: false
    };
  },

  finish: function () {
    if ((!this.state.buttonDisabled) && this.props.areAnyStudentsSelected) {
      // this.setState({buttonDisabled: true});
      this.props.finish();
    } else if (!this.state.buttonDisabled) {
      this.setState({prematureAssignAttempted: true});
    }
  },

  determineAssignButtonClass: function () {
    if ((!this.state.buttonDisabled) && this.props.areAnyStudentsSelected) {
      return 'button-green';
    } else {
      return 'button-grey';
    }
  },

  determineErrorMessageClass: function () {
    if (this.state.prematureAssignAttempted) {
      return 'error-message visible-error-message';
    } else {
      return 'error-message hidden-error-message';
    }
  },

  determineButtonText: function () {
    if (!this.state.buttonDisabled) {
      return <span>Assign</span>;
    } else {
      return <span>Assigning... <AssigningIndicator /></span>;
    }
  },

  dueDate: function(activityId){
    if (this.props.dueDates && this.props.dueDates[activityId]) {
      return this.props.dueDates[activityId];
    }
  },



  render: function() {
    var classroomList;
    if (this.props.classrooms) {
      let that = this;
      classroomList = this.props.classrooms.map((el)=> {
        return <Classroom    key = {el.classroom.id}
                             classroom={el.classroom}
                             students={el.students}
                             allSelected={el.allSelected}
                             toggleClassroomSelection={that.props.toggleClassroomSelection}
                             toggleStudentSelection={that.props.toggleStudentSelection} />;

      })
    } else {
      classroomList = []
    }

    var dueDateList = this.props.selectedActivities.map(function(activity) {
      return <ActivityDueDate activity={activity}
                                 key={activity.id}
                                 dueDate={this.dueDate()}
                                 toggleActivitySelection={this.props.toggleActivitySelection}
                                 assignActivityDueDate={this.props.assignActivityDueDate}/>;
    }, this);

    return (
      <span>
        <section className='select-students'>
          <h1 className='section-header'>Select Students</h1>
          {classroomList}
        </section>
        <section className='assign-dates'>
          <h1 className='section-header'>
            Assign Dates for {this.props.unitName} (optional)
          </h1>
          <table className='table activity-table'>
            <tbody>
              {dueDateList}
            </tbody>
          </table>
          <div className='error-message-and-button'>
            <div className={this.determineErrorMessageClass()}>{this.props.errorMessage}</div>
            <button ref='button' id='assign' className={this.determineAssignButtonClass() + ' pull-right'} onClick={this.finish}>{this.determineButtonText()} </button>
          </div>
        </section>
      </span>
    );
  }
});
