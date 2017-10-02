import React from 'react';
import $ from 'jquery';
import _ from 'underscore';
import NotificationBox from '../components/shared/notification_box.jsx';
import LoadingIndicator from '../components/shared/loading_indicator.jsx';

export default React.createClass({

  propTypes: {
    role: React.PropTypes.string.isRequired,
  },

  getInitialState() {
    let basePath;
    let getClassroomsPath;
    if (this.props.role === 'teacher') {
      basePath = '/teachers/classrooms';
      getClassroomsPath = `${basePath}/archived_classroom_manager_data`;
    } else if (this.props.role === 'student') {
      basePath = '/students_classrooms';
      getClassroomsPath = `${basePath}/classroom_manager_data`;
    }
    return { loading: true, classrooms: null, basePath, getClassroomsPath, };
  },

  componentDidMount() {
    this.getClassrooms();
  },

  getClassrooms() {
    this.setState({ loading: true, },
      () => {
        $.ajax({
          url: this.state.getClassroomsPath,
          context: this,
          cache: false,
          success(data) {
            const showArchivedNotification = data.active.length === 0;
            this.setState({ classrooms: data, loading: false, showArchivedNotification, });
          },
        });
      }
    );
  },

  classAction(status, id) {
    // if loading we don't want to do anything when they click -- effectively
    // it is disabled
    if (!this.state.loading) {
      let path = status === 'Archive' ? 'hide' : 'unhide';
      path = `${this.state.basePath}/${id}/${path}`;
      if (status === 'Archive') {
        if (confirm("Are you sure you want to archive this classroom? If you choose to unarchive it at a later date, your students' activities will not be restored.")) {
          this.postClassroomChange(path)
        }
      } else {
        this.postClassroomChange(path)
      }
    }
  },

  postClassroomChange(path) {
    const that = this;
    this.setState({ loading: true, },
      () => {
        $.post(path)
        .done(
          that.getClassrooms()
        );
      });
  },

  disabledIfLoading() {
    return (this.state.loading ? 'disabled' : null);
  },

  manageClassroom(classroomId) {
    return <a className="manage-class" href={`${this.state.basePath}/${classroomId}/students`}>Edit Students</a>;
  },

  finalContents(cl, action) {
    let displayed = action;
    if (this.state.loading) {
      displayed = [<LoadingIndicator key={`button-loading-indicator-for-${cl.id}`} />, <span key={`action-for-${cl.id}`}>{action}</span>];
    }
    return (<span
      onClick={() => { this.classAction(action, cl.id); }}
      className={`flex-row vertically-centered action-container ${action.toLowerCase()} ${cl.className.replace(/ /g, '')}`}
    >
      {displayed}
    </span>);
  },

  tableRows(cl, action) {
    const manageClass = action === 'Archive' ? this.manageClassroom(cl.id) : '';
    if (this.props.role === 'teacher') {
      return (
        <tr key={cl.id}>
          <td>{cl.className}</td>
          <td>{cl.classcode}</td>
          <td className="student-count">{cl.studentCount}</td>
          <td className="created-date">{cl.createdDate}</td>
          <td>{manageClass}</td>
          <td>{this.finalContents(cl, action)}</td>
        </tr>);
    } else if (this.props.role === 'student') {
      return (
        <tr key={cl.id}>
          <td>{cl.teacherName}</td>
          <td>{cl.className}</td>
          <td>{cl.joinDate}</td>
          <td>{this.finalContents(cl, action)}</td>
        </tr>
      );
    }
  },

  tableHeaders(action) {
    let content;
    if (this.props.role === 'teacher') {
      const manageClass = action === 'Archive' ? 'Edit Students' : '';
      content =
       (<tr>
         <th>Class Name</th>
         <th>Classcode</th>
         <th className="student-count">Student Count</th>
         <th className="created-date">Date Created</th>
         <th>{manageClass}</th>
         <th />
       </tr>)
     ;
    } else if (this.props.role === 'student') {
      content =
       (<tr>
         <th>Teacher Name</th>
         <th>Class Name</th>
         <th>Date Joined</th>
         <th />
       </tr>)
     ;
    }
    return (<thead>
      {content}
    </thead>);
  },

  mapClassrooms(classrooms, status) {
    const that = this;
    const classes = _.map(classrooms, cl => (
        that.tableRows(cl, status)
      ));
    return classes;
  },

  displayClassrooms(classrooms, status) {
    return (
      <table className="table">
        {this.tableHeaders(status)}
        <tbody>
          {this.mapClassrooms(classrooms, status)}
        </tbody>
      </table>
    );
  },

  joinOrAddClass() {
    if (this.props.role === 'student') {
      return (<a href="/students_classrooms/add_classroom" className="btn button-green">Join a Class</a>);
    }
  },

  activeOrArchived(section, action) {
    const classes = this.state.classrooms[section];
    const header = <h1>{`${section.charAt(0).toUpperCase() + section.slice(1)} Classes`}</h1>;
    if (classes.length > 0) {
      return (
        // [header, this.displayClassrooms(this.state.classrooms[section], action)]
        <div>
          {header}
          {this.displayClassrooms(this.state.classrooms[section], action)}
        </div>
      );
    }
  },

  stateSpecificComponents() {
    if (this.state.classrooms !== null) {
      return (
        <div className={this.props.role}>
          {this.activeOrArchived('active', 'Archive')}
          {this.activeOrArchived('inactive', 'Unarchive')}
        </div>
      );
    }
    return <h1>loading</h1>;
  },

  archivedNotification() {
    if (this.state.showArchivedNotification) {
      return (
        <NotificationBox>
          You’ve archived all your classes! Before you can assign new activities,
          you’ll need to <span>Unarchive</span> or <span>Create</span> a new class.
        </NotificationBox>
      );
    }
  },

  optionSection() {
    return (
      <div className="archive-options-container flex-row vertically-centered space-between">
        <p>On this page, you can archive and unarchive classes and you can
          reset students’ passwords below.</p>
        <a href="/teachers/classrooms/new" className="q-button cta-button bg-white">Create a Class</a>
      </div>);
  },

  render() {
    return (
      <div id="archived_classrooms_manager">
        {this.archivedNotification()}
        {this.optionSection()}
        {this.joinOrAddClass()}
        {this.stateSpecificComponents()}
      </div>
    );
  },
});
