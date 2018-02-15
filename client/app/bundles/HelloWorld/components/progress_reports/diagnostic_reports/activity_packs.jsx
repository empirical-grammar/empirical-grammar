import React from 'react'
import request from 'request';
import Units from '../../lesson_planner/manage_units/activities_units.jsx'
import LoadingSpinner from '../../shared/loading_indicator.jsx'
import EmptyProgressReport from '../../shared/EmptyProgressReport.jsx'
import ItemDropdown from '../../general_components/dropdown_selectors/item_dropdown';
import getParameterByName from '../../modules/get_parameter_by_name';
import parseUnits from '../../modules/parseUnits'

'use strict'

export default React.createClass({

	getInitialState: function() {
		return {
			allUnits: [],
			units: [],
			loaded: false,
			selectedClassroomId: getParameterByName('classroom_id'),
		}
	},

	componentWillMount() {
		document.getElementsByClassName('diagnostic-tab')[0].classList.remove('active');
		document.getElementsByClassName('activity-analysis-tab')[0].classList.add('active');
	},

	componentDidMount: function() {
		this.getClassrooms();
		request.get({
			url: `${process.env.DEFAULT_URL}/teachers/units`,
			data: { report: true }
		}, (error, httpStatus, body) => {
			if(error) {
				alert('Unable to download your reports at this time.');
			} else {
				this.setAllUnits(JSON.parse(body));
			}
		});
		window.onpopstate = () => {
			this.setState({ loaded: false, selectedClassroomId: getParameterByName('classroom_id') });
			this.getUnitsForCurrentClass();
		};
	},

	getClassrooms() {
		request.get(`${process.env.DEFAULT_URL}/teachers/classrooms/classrooms_i_teach`, (error, httpStatus, body) => {
			const classrooms = JSON.parse(body).classrooms;
			if(classrooms.length > 0) {
				this.setState({ classrooms }, () => this.getUnits());
			} else {
				this.setState({ empty: true, loaded: true, });
			}
  	});
	},

	getUnits() {
		request.get(`${process.env.DEFAULT_URL}/teachers/units`, (error, httpStatus, body) => {
			this.setAllUnits(JSON.parse(body));
		});
	},

	getUnitsForCurrentClass() {
		if(this.state.selectedClassroomId) {
			const selectedClassroom = this.state.classrooms.find(c => c.id === Number(this.state.selectedClassroomId));
			const unitsInCurrentClassroom = this.state.allUnits.filter(unit=>unit.classrooms.find(classroom=>selectedClassroom.name === classroom.name))
			this.setState({ units: unitsInCurrentClassroom, loaded: true });
		} else {
			this.setState({ units: this.state.allUnits, loaded: true })
		}
	},

	setAllUnits(data) {
		this.setState({ allUnits: parseUnits(data)}, this.getUnitsForCurrentClass);
	},

	switchClassrooms(classroom) {
		const path = '/teachers/progress_reports/diagnostic_reports/#/activity_packs'
   	window.history.pushState({}, '', classroom.id ? `${path}?classroom_id=${classroom.id}` : path);
 		this.setState({ selectedClassroomId: classroom.id, }, () => this.getUnitsForCurrentClass());
  },

	stateBasedComponent: function() {
		if(!this.state.loaded) {
			return <LoadingSpinner />;
		}

		let content;

		const allClassroomsClassroom = { name: 'All Classrooms' }
		const classrooms = [allClassroomsClassroom].concat(this.state.classrooms);
		const classroomWithSelectedId = classrooms.find(classroom => classroom.id === Number(this.state.selectedClassroomId));
		const selectedClassroom = classroomWithSelectedId ? classroomWithSelectedId : allClassroomsClassroom;

		if(this.state.units.length === 0 && this.state.selectedClassroomId) {
			content = (
				<EmptyProgressReport
					missing='activitiesForSelectedClassroom'
					onButtonClick={() => {
						this.setState({ selectedClassroomId: null, loaded: false });
						this.getUnitsForCurrentClass();
					}}
				/>
			);
		} else if(this.state.units.length === 0) {
			content = <EmptyProgressReport missing='activities' />
		} else {
			content = <Units report={Boolean(true)} activityReport={Boolean(true)} data={this.state.units}/>
		}

		return (
			<div className='activity-analysis'>
				<h1>Activity Analysis</h1>
				<p>Open an activity analysis to view students' responses, the overall results on each question, and the concepts students need to practice.</p>
				<div className="classroom-selector">
					<p>Select a classroom:</p>
					<ItemDropdown
						items={classrooms}
						callback={this.switchClassrooms}
						selectedItem={selectedClassroom}
					/>
				</div>
				{content}
			</div>
		)
	},

	render: function() {
		return (
			<div className="container manage-units">
				{this.stateBasedComponent()}
			</div>
		);

	}

});
