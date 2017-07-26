import React from 'react';
import $ from 'jquery';
import LoadingSpinner from '../../shared/loading_indicator.jsx';
import _ from 'underscore';
import Pusher from 'pusher-js';
import RecommendationsTableCell from './recommendations_table_cell';

export default React.createClass({

  getInitialState() {
    return {
      loading: true,
      recommendations: [],
      previouslyAssignedRecommendations: [],
      selections: [],
      students: [],
      assigning: false,
      assigned: false,
    };
  },

  componentDidMount() {
    this.getRecommendationData(this.props.params.classroomId, this.props.params.activityId);
    this.getPreviouslyAssignedRecommendationData(this.props.params.classroomId, this.props.params.activityId);
  },

  componentWillReceiveProps(nextProps) {
    this.setState({
      loading: true,
      assigning: false,
      assigned: false,
    });
    this.getRecommendationData(nextProps.params.classroomId, nextProps.params.activityId);
    this.getPreviouslyAssignedRecommendationData(nextProps.params.classroomId, nextProps.params.activityId);
  },

  getRecommendationData(classroomId, activityId) {
    const that = this;
    $.get(`/teachers/progress_reports/recommendations_for_classroom/${classroomId}/activity/${activityId}`, (data) => {
      that.setState({
        recommendations: JSON.parse(JSON.stringify(data.recommendations)),
        students: data.students,
        loading: false,
      }, that.getPreviouslyAssignedRecommendationData(classroomId, activityId));
    });
  },

  getPreviouslyAssignedRecommendationData(classroomId, activityId) {
    const that = this;
    $.get(`/teachers/progress_reports/previously_assigned_recommendations/${classroomId}/activity/${activityId}`, ((data) => {
      that.setState({
        previouslyAssignedRecommendations: data.previouslyAssignedRecommendations,
      }, that.setSelections(data.previouslyAssignedRecommendations));
    }));
  },

  setSelections(previouslyAssignedRecommendations) {
    const selections = this.state.recommendations.map((recommendation, i) => {
      const prevAssigned = previouslyAssignedRecommendations[i];
      const allAssignedStudents = _.uniq(recommendation.students.concat(prevAssigned.students));
      return {
        activity_pack_id: recommendation.activity_pack_id,
        name: recommendation.name,
        students: allAssignedStudents,
      };
    });
    this.setState({ selections, });
  },

  studentWasAssigned(student, previouslyAssignedRecommendation) {
    if (previouslyAssignedRecommendation && previouslyAssignedRecommendation.students) {
      return previouslyAssignedRecommendation.students.includes(student.id);
    }
  },

  studentIsSelected(student, selection) {
    if (student && selection && selection.students && selection.students.length) {
      return selection.students.includes(student.id);
    }
  },

  studentIsRecommended(student, recommendation) {
    return (_.indexOf(recommendation.students, student.id) != -1);
  },

  toggleSelected(student, index) {
    const selections = [...this.state.selections];
    if (this.studentIsSelected(student, selections[index])) {
      selections[index].students = _.reject(selections[index].students, stud => stud === student.id);
    } else {
      selections[index].students.push(student.id);
    }
    this.setState({ selections, });
  },

  assignSelectedPacks() {
    this.setState({ assigning: true, }, () => {
      const classroomId = this.props.params.classroomId;
      let selections = this.state.selections.map(activityPack => ({
        id: activityPack.activity_pack_id,
        classrooms: [
          {
            id: classroomId,
            student_ids: activityPack.students,
          }
        ],
      }));
      selections = { selections, };
      $.ajax({
		  	type: 'POST',
		  	url: '/teachers/progress_reports/assign_selected_packs/',
		  	dataType: 'json',
		  	contentType: 'application/json',
		  	data: JSON.stringify(selections),
      })
			.done(() => { this.initializePusher(); })
			.fail(() => {
  alert('We had trouble processing your request. Please check your network connection and try again.');
  this.setState({ assigning: false, });
});
    });
  },

  initializePusher() {
    if (process.env.NODE_ENV === 'development') {
      Pusher.logToConsole = true;
    }
    const params = this.props.params;
    const pusher = new Pusher(process.env.PUSHER_KEY, { encrypted: true, });
    const channel = pusher.subscribe(this.props.params.classroomId);
    const that = this;
    channel.bind('recommendations-assigned', (data) => {
      that.getPreviouslyAssignedRecommendationData(params.classroomId, params.activityId);
      that.setState({ assigning: false, assigned: true, });
    });
  },

  renderExplanation() {
    return (
      <div className="recommendations-explanation-container">
        <p className="recommendations-explanation">
					Based on the results of the diagnostic, we created a personalized learning plan for each student.
					<br />Customize your learning plan by selecting the activity packs you would like to assign.
				</p>
      </div>
    );
  },

  renderTopBar() {
    return (
      <div className="recommendations-top-bar">
        <div className="recommendations-key">
          <div className="recommendations-key-icon" />
          <p>Recommended Activity Packs</p>
          <div className="assigned-recommendations-key-icon"><i className="fa fa-check-circle" /></div>
          <span className="assigned-activity-pack-text">
            <p>Assigned Activity Packs</p>
            <p>Assigned activities will not be assigned again.</p>
          </span>
        </div>
        {this.renderAssignButton()}
      </div>
    );
  },

  renderAssignButton() {
    if (this.state.assigning) {
      return (
        <div className="recommendations-assign-button">
          <span>Assigning...</span>
        </div>
      );
    } else if (this.state.assigned) {
      return (
        <div className="recommendations-assign-button">
          <span>Assigned</span>
        </div>
      );
    }
    return (
      <div className="recommendations-assign-button" onClick={this.assignSelectedPacks}>
        <span>Assign Activity Packs</span>
      </div>
    );
  },

  renderTableHeader() {
    return (
      <div className="recommendations-table-header">
        <div className="recommendations-table-header-name">Name</div>
        {this.renderActivityPackHeaderItems()}
      </div>
    );
  },

  renderActivityPackHeaderItems() {
    return this.state.recommendations.map(recommendation => (
      <div className="recommendations-table-header-item" key={recommendation.activity_pack_id}>
        <p>{recommendation.name}</p>
        <a href={`/activities/packs/${recommendation.activity_pack_id}`} target="_blank">View Pack</a>
      </div>
			));
  },

  renderTableRows() {
    return this.state.students.map(student => this.renderTableRow(student));
  },

  renderTableRow(student) {
    return (
      <div className="recommendations-table-row" key={student.id}>
        <div className="recommendations-table-row-name">{student.name}</div>
        {this.renderActivityPackRowItems(student)}
      </div>
    );
  },

  renderActivityPackRowItems(student) {
    return this.state.recommendations.map((recommendation, i) => {
      let checkboxOnClick;
      const selection = this.state.selections[i];
      const previouslyAssignedRecommendation = this.state.previouslyAssignedRecommendations[i];
      const previouslyAssigned = this.studentWasAssigned(student, previouslyAssignedRecommendation)
				? ' previously-assigned '
				: '';
      const recommended = this.studentIsRecommended(student, recommendation)
				? ' recommended '
				: '';
      const selected = this.studentIsSelected(student, selection)
				? ' selected '
				: '';

      return (
        <RecommendationsTableCell
          key={recommendation.activity_pack_id}
          previouslyAssigned={previouslyAssigned}
          recommended={recommended}
          selected={selected}
          recommendation={recommendation}
          checkboxOnClick={this.toggleSelected.bind(null, student, i)}
        />
      );
    });
  },

  renderBottomBar() {
    return (
      <div className="recommendations-bottom-bar">
        {this.renderAssignButton()}
      </div>
    );
  },

  render() {
    if (this.state.loading) {
      return <LoadingSpinner />;
    }
    return (
      <div>
        {this.renderExplanation()}
        <div className="recommendations-container">
          {this.renderTopBar()}
          {this.renderTableHeader()}
          <div className="recommendations-table-row-wrapper">
            {this.renderTableRows()}
          </div>
          {this.renderBottomBar()}
        </div>
      </div>
    );
  },

});
