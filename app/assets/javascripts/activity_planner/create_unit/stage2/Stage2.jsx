"use strict";
EC.Stage2 = React.createClass({

  getInitialState: function() {
    return {
      classroomsAndTheirStudents: [],
      buttonDisabled: false,
      prematureAssignAttempted: false
    };
  },

  finish: function () {
    if ((!this.state.buttonDisabled) && this.props.areAnyStudentsSelected) {
      this.setState({buttonDisabled: true});
      this.props.finish();
    } else if (!this.state.buttonDisabled) {
      this.setState({prematureAssignAttempted: true});
    }
  },

  determineAssignButtonClass: function () {
    if ((!this.state.buttonDisabled) && this.props.areAnyStudentsSelected) {
      return "button-green";
    } else {
      return "button-grey";
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
      return "Assign";
    } else {
      return "Assigning...";
    }
  },

  render: function() {
    var classroomList = this.props.classrooms.map(function(entry) {
      return <EC.Classroom classroom={entry.classroom}
                           students={entry.students}
                           allSelected={entry.allSelected}
                           toggleClassroomSelection={this.props.toggleClassroomSelection}
                           toggleStudentSelection={this.props.toggleStudentSelection} />;
    }, this);

    var dueDateList = this.props.selectedActivities.map(function(activity) {
      return <EC.ActivityDueDate activity={activity}
                                 key={activity.id}
                                 dueDate={this.props.dueDates[activity.id]}
                                 toggleActivitySelection={this.props.toggleActivitySelection}
                                 assignActivityDueDate={this.props.assignActivityDueDate}/>;
    }, this);

    return (
      <span>
        <section className="select-students">
          <h1 className="section-header">Select Students</h1>
          {classroomList}
        </section>
        <section className="assign-dates">
          <h1 className="section-header">
            Assign Dates for {this.props.unitName} (optional)
          </h1>
          <table className="table activity-table">
            <tbody>
              {dueDateList}
            </tbody>
          </table>
          <div className="error-message-and-button">
            <div className={this.determineErrorMessageClass()}>{this.props.errorMessage}</div>
            <button ref="button" id='assign' className={this.determineAssignButtonClass() + " pull-right"} id="assign" onClick={this.finish}>{this.determineButtonText()}</button>
          </div>
        </section>
      </span>
    );
  }
});
