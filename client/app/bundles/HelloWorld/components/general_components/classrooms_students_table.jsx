import React from 'react'


export default React.createClass({
  propTypes: {
    students: React.PropTypes.array.isRequired
  },

  thead: function() {
    return(<thead>
      <tr>
        <th>
          First Name
        </th>
        <th>
          Last Name
        </th>
        <th>
          Username
        </th>
      </tr>
    </thead>);
  },

  studentsIntoRows: function(){
  return this.props.students.map(student=>{
    return (<tr key={student.user_id} className="user" id={`user_${student.user_id}`}>
      {this.individualStudentToRow(student)}
    </tr>)
    })
  },

  individualStudentToRow: function(student){
    const splitName = student.name.split(' ')
    const firstName = splitName[0];
    const lastName = splitName.slice(1).join(' ');
    return (
      [
      <td key={`first_name${student.user_id}`} className="first_name">
        {firstName}
      </td>,
      <td key={`last_name${student.user_id}`} className="last_name">
        {lastName}
      </td>,
      <td key={`user_name${student.user_id}`} className="user_name">
        {student.username}
      </td>]
  )
  },

  render: function() {
    return (
      <table className="table students">
        {this.thead()}
        <tbody>
          {this.studentsIntoRows()}
        </tbody>
      </table>
    )
   }
 });
