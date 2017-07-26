import React from 'react'
import request from 'request'
import Units from './manage_units/units'
import LoadingIndicator from '../shared/loading_indicator'
import ClassroomDropdown from '../general_components/dropdown_selectors/classroom_dropdown'

export default class ClassroomLessons extends React.Component {
  constructor(props) {
    super()

    this.state = {
      lessons: [],
      classrooms: this.getClassrooms(),
      loaded: false
    }

    this.switchClassrooms = this.switchClassrooms.bind(this)

  }

  getClassrooms() {
    request.get(`${process.env.DEFAULT_URL}/teachers/classrooms_i_teach_with_lessons`, (error, httpStatus, body) => {
      const classrooms = JSON.parse(body).classrooms
      this.setState({classrooms: classrooms, selectedClassroomId: classrooms[0].id}, () => this.getLessons())
    })
  }

  getLessons() {
    request.get({
      url: `${process.env.DEFAULT_URL}/teachers/lesson_units`,
      qs: {classroom_id: this.state.selectedClassroomId}
    }, (error, httpStatus, body) => {
      this.setState({lessons: JSON.parse(body).units, loaded: true})
    })
  }

  renderHeader() {
    return <div className="my-lessons-header">
      <h1>My Lessons</h1>
      <p>This is a list of all your assigned lessons for the selected class. You can change the selected class below.</p>
      <p><span>Note:</span> If you want to re-do a lesson with your class, re-assign the lesson then launch it.</p>
    </div>
  }

  switchClassrooms(classroom) {
    this.setState({selectedClassroomId: classroom.id}, () => this.getLessons())
  }

  render() {
    if (this.state.loaded) {
      return(
        <div id="lesson_planner">
          <div className="container my-lessons manage-units">
            {this.renderHeader()}
            <ClassroomDropdown classrooms={this.state.classrooms}
                               callback={this.switchClassrooms}
                               selectedClassroom={this.state.classrooms.find((classy) => classy.id === this.state.selectedClassroomId)}/>
            <Units
              // updateDueDate={this.updateDueDate}
              // editUnit={this.props.actions.editUnit}
              // hideClassroomActivity={this.hideClassroomActivity}
              // hideUnit={this.hideUnit}
              data={this.state.lessons}
              lesson={true}
            />
            </div>
          </div>)
    } else {
      return <LoadingIndicator />
    }
  }
}
