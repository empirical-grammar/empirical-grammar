"use strict";
$(function () {
	var ele = $('#scorebook');
	if (ele.length > 0) {
		React.render(React.createElement(EC.Scorebook), ele[0]);
	}
});

EC.Scorebook = React.createClass({
	mixins: [EC.TableFilterMixin],

	getInitialState: function () {
		this.modules = {
			scrollify: new EC.modules.scrollify()
		};
		return {
			units: [],
			classrooms: [],
			selectedUnit: {name: 'All Units', value: ''},
			selectedClassroom: {name: 'All Classrooms', value: ''},
			classroomFilters: [],
			unitFilters: [],
			beginDate: null,
			endDate: null,
			currentPage: 0,
			loading: false,
			is_last_page: false,
			noLoadHasEverOccurredYet: true
		}
	},

	componentDidMount: function () {
		this.fetchData();
		this.modules.scrollify.scrollify('#page-content-wrapper', this);
	},

	fetchData: function () {
		var newCurrentPage = this.state.currentPage + 1;
		this.setState({loading: true, currentPage: newCurrentPage})
		$.ajax({
			url: 'scores',
			data: {
				current_page: newCurrentPage,
				classroom_id: this.state.selectedClassroom.value,
				unit_id: this.state.selectedUnit.value,
				begin_date: this.state.beginDate,
				end_date: this.state.endDate,
				no_load_has_ever_occurred_yet: this.state.noLoadHasEverOccurredYet
			},
			success: this.displayData
		});
	},

	displayData: function (data) {

		if (data.was_classroom_selected_in_controller) {
			this.setState({selectedClassroom: data.selected_classroom});
		}
		this.setState({
			classroomFilters: this.getFilterOptions(data.classrooms, 'name', 'id', 'All Classrooms'),
			unitFilters: this.getFilterOptions(data.units, 'name', 'id', 'All Units'),
			is_last_page: data.is_last_page,
			noLoadHasEverOccurredYet: false
		});
		if (this.state.currentPage == 1) {
			this.setState({scores: data.scores});
		} else {
			var y1 = this.state.scores;
			var new_scores = [];
			_.forEach(data.scores, function (score) {
				var user_id = score.user.id;
				var y2 = _.find(y1, function (ele) {
					return ele.user.id == user_id;
				});
				if (y2 == undefined) {
					new_scores.push(score);
				} else {
					y1 = _.map(y1, function (ele) {
						if (ele == y2) {
							ele.results = ele.results.concat(score.results);
							ele.results = _.uniq(ele.results, function(w1) {
								return w1.id;
							});
						}
						var w1 = ele;
						return w1;
					});
				}
			})
			var all_scores = y1.concat(new_scores)
			this.setState({scores: all_scores});
		}
		this.setState({loading: false});
	},

	selectUnit: function (option) {
		this.setState({currentPage: 0, selectedUnit: option}, this.fetchData);
	},

	selectClassroom: function (option) {
		this.setState({currentPage: 0, selectedClassroom: option}, this.fetchData);
	},
	selectDates: function (val1, val2) {
		this.setState({currentPage: 0, beginDate: val1, endDate: val2}, this.fetchData);
	},
	render: function() {
		var scores = _.map(this.state.scores, function (data) {
			return <EC.StudentScores key={data.user.id} data={data} />
		});
		if (this.state.loading) {
			var loadingIndicator = <EC.LoadingIndicator />;
		} else {
			var loadingIndicator = null;
		}
		return (
			<span>
				<div className="tab-subnavigation-wrapper">
	                <div className="container">
	                  <ul>
	                    <li><a href="" className="active">Student View</a></li>
	                  </ul>
	                </div>
	            </div>
	            <div className="container">
		            <section className="section-content-wrapper">
				            <EC.ScorebookFilters
				            	selectedClassroom = {this.state.selectedClassroom}
				            	classroomFilters = {this.state.classroomFilters}
				            	selectClassroom  = {this.selectClassroom}

				            	selectedUnit = {this.state.selectedUnit}
				            	unitFilters = {this.state.unitFilters}
				            	selectUnit  = {this.selectUnit}

				            	selectDates = {this.selectDates}/>
				            <EC.ScoreLegend />
				            <EC.AppLegend />
			        </section>
		        </div>
		        {scores}
		        {loadingIndicator}
			</span>
		);
	}
});