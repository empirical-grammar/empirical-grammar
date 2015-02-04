EC.Stage2 = React.createClass({
  getInitialState: function() {
    return {
      classroomsAndTheirStudents: []      
    };
  },

  componentDidMount: function() {
    this.fetchClassrooms();
  },

  fetchClassrooms: function() {
    $.ajax({
      url: '/teachers/classrooms/retrieve_classrooms_for_assigning_activities',  
      context: this,
      success: function (data) {
        this.fetchClassroomsSuccess(data);
      },  
      error: function () {
        console.log('error fetching classrooms');
      }
    });
  },

  fetchClassroomsSuccess: function(data) {
    this.setState({classroomsAndTheirStudents: data.classrooms_and_their_students});
  },

  render: function() {
    console.log(this.props);

    var classroomList = this.state.classroomsAndTheirStudents.map(function(entry) {
      return <EC.Classroom data={entry.classroom} students={entry.students} />;
    }, this);

    var dueDateList = this.props.selectedActivities.map(function(activity) {
      return <EC.ActivityDueDate activity={activity} 
                                 toggleActivitySelection={this.props.toggleActivitySelection} />;
    }, this);

    return (
      <span>
        <section className="select-students">
          <h1 className="section-header">Select Students</h1>
          {classroomList}
        </section>

        <section className="assign-dates">
          <h1 className="section-header">
            Assign Dates for Learning How to Use Nouns
          </h1>
          <table className="table">
            <tbody>
              {dueDateList}
            </tbody>
          </table>
          <button className="button-green" id="assign">Assign</button>
        </section>
      </span>
    );
  }
});