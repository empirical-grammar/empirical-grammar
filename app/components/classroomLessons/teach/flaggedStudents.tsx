declare function require(name:string);

import * as React from 'react';
import {

} from '../interfaces';
const grayFlag = require('../../../img/flag_gray.svg')
const blueFlag = require('../../../img/flag_blue.svg')



// TODO: build interface for flagged students if it doesn't exist
class FlaggedStudents extends React.Component<{flaggedStudents: Object, students: Object, toggleStudentFlag: Function}> {
  constructor(props) {
    super(props);
    this.state = {
      showUnflaggedStudents: false
    }
    this.toggleShowUnflaggedStudents = this.toggleShowUnflaggedStudents.bind(this)
  }

  renderFlag(studentKey: string) {
    let flag = grayFlag
    if (this.props.flaggedStudents && this.props.flaggedStudents[studentKey]) {
      flag = blueFlag
    }
    return <img onClick={() => this.props.toggleStudentFlag(studentKey)} src={flag} />
  }

  flaggedStudentsList() {
    const students = this.props.students
    const flaggedStudents = this.props.flaggedStudents ? Object.keys(this.props.flaggedStudents) : []
    return this.renderStudentList(flaggedStudents)
  }

  unflaggedStudentsList() {
    const students = this.props.students
    const flaggedStudentIds = this.props.flaggedStudents ? Object.keys(this.props.flaggedStudents) : []
    const unflaggedStudentIds: Array<string> | null = Object.keys(students).filter((id) => flaggedStudentIds.indexOf(id) === -1)
    return this.renderStudentList(unflaggedStudentIds)
  }

  renderStudentList(studentIds: Array<string>){
    return studentIds.map((asId)=> this.renderStudentRow(asId))
  }

  toggleShowUnflaggedStudents() {
    this.setState({showUnflaggedStudents: !this.state.showUnflaggedStudents})
  }

  renderStudentRow(asId: string) {
    const studNames = this.props.students
    return (
      <li key={asId}>
      {studNames[asId]}
      {this.renderFlag(asId)}
      </li>)
  }

  render() {
    const flaggedStudents = this.props.flaggedStudents
    const studLength = flaggedStudents ? Object.keys(flaggedStudents).length : 0;
    const studSuffix = studLength === 1 ? '' : 's'
    const unflaggedStudentList = this.state.showUnflaggedStudents ? this.unflaggedStudentsList() : <span/>
    const unflaggedStudentText = this.state.showUnflaggedStudents ? 'Hide Unflagged Students' : 'Show Unflagged Students'
    return (
      <div className='flagged-student-list-container'>
        <div className='list-summary'>
          <span>
            You have flagged
            <span className="stud-count">{' ' + studLength + ' '}</span>
            student{studSuffix}.
            <span onClick={this.toggleShowUnflaggedStudents}>{unflaggedStudentText}</span>
          </span>

        </div>
        <ul>
          {this.flaggedStudentsList()}
          {unflaggedStudentList}
        </ul>
      </div>
    );
  }

}

export default FlaggedStudents;
