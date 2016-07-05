'use strict';
$(function () {
	var activityPlanner, unitTemplate;
  activityPlanner = $('#activity-planner')[0];
	if (activityPlanner) {
		var props = {
			analytics: new EC.AnalyticsWrapper()
		};
		React.render(React.createElement(EC.LessonPlanner, props), activityPlanner);
  }
});

EC.LessonPlanner = React.createClass({
	propTypes: {
		analytics: React.PropTypes.object.isRequired
	},

	// lastActivityAssigned: function () {
	// 	if (!this.state){
	// 		return null
	// 	} else {return this.state.unitTemplatesManager.model};
	// },

  blankState: function () {
    return {
      tab: 'manageUnits', // 'createUnit', 'exploreActivityPacks'
      createUnit: {
        stage: 1,
        options: {
          classrooms: []
        },
        model: {
          id: null,
          name: null,
          selectedActivities: [],
          dueDates: {}
        }
      },
      unitTemplatesManager: {
        firstAssignButtonClicked: false,
				assignSuccess: false,
        models: [],
        categories: [],
        stage: 'index', // index, profile,
        model: null,
        model_id: null,
        relatedModels: [],
        displayedModels: [],
        selectedCategoryId: null,
				lastActivityAssigned: null,
        grade: null
      }
    }
  },

	getInitialState: function () {
		this.modules = {
			fnl: new EC.modules.fnl(),
			updaterGenerator: new EC.modules.updaterGenerator(this),
			unitTemplatesServer: new EC.modules.Server('unit_template', 'unit_templates', '/teachers'),
      windowPosition: new EC.modules.WindowPosition(),
		};

    this.deepExtendState = this.modules.updaterGenerator.updater(null)
		this.updateCreateUnit = this.modules.updaterGenerator.updater('createUnit');
		this.updateCreateUnitModel = this.modules.updaterGenerator.updater('createUnit.model');
		this.updateUnitTemplatesManager = this.modules.updaterGenerator.updater('unitTemplatesManager');

    var state = this.blankState();

    var grade = ($('#activity-planner').data('grade'));
    if (grade) {
      state.unitTemplatesManager.grade = grade;
    }

    var tab = ($('#activity-planner').data('tab'));
    if (tab) {
      state.tab = tab;
    }
    //FIXME: this concern should be handled with a react-router
    var individualUnitTemplate = $('.teachers-unit-template')[0]
    if (individualUnitTemplate) {
      state.tab = 'exploreActivityPacks';
      state.unitTemplatesManager.model_id = $('.teachers-unit-template').data('id');
    }
    return state;
	},

  editUnit: function(unitId) {
    $.ajax({
      url: ['/teachers/units/', unitId, '/edit'].join(''),
      success: this.editUnitRequestSuccess
    })
  },

  editUnitRequestSuccess: function (data) {
    console.log('editUnitRequestSuccess', data)
    this.updateCreateUnitModel({id: data.id, name: data.name, dueDates: data.dueDates, selectedActivities: data.selectedActivities})
    this.updateCreateUnit({options: {classrooms: data.classrooms}})
    this.setState({tab: 'createUnit'})
  },

  assignActivityDueDate: function(activity, dueDate) {
    var dueDates = this.state.createUnit.model.dueDates;
    dueDates[activity.id] = dueDate;
    this.updateCreateUnitModel({dueDates: dueDates})
  },


  selectModel: function (ut) {
    var relatedModels = this._modelsInCategory(ut.unit_template_category.id)
    this.updateUnitTemplatesManager({stage: 'profile', model: ut, relatedModels: relatedModels})
    this.modules.windowPosition.reset();
  },

  _modelsInCategory: function (categoryId) {
    return _.where(this.state.unitTemplatesManager.models, {unit_template_category: {id: categoryId}})
  },

  _modelsInGrade: function (grade) {
    return _.reject(this.state.unitTemplatesManager.models, function (m){
      return _.indexOf(m.grades, grade)
    });
  },

  updateUnitTemplateModels: function (models) {
  	var categories =  _.chain(models)
					              .pluck('unit_template_category')
					              .uniq(_.property('id'))
					              .value();
    var newHash = {
    	models: models,
    	displayedModels: models,
    	categories: categories
    }
    var model_id = this.state.unitTemplatesManager.model_id // would be set if we arrived here from a deep link
    if (model_id) {
      newHash.model = _.findWhere(models, {id: model_id});
      newHash.stage = 'profile'
    }
    this.updateUnitTemplatesManager(newHash)
  },

  returnToIndex: function () {
  	this.updateUnitTemplatesManager({stage: 'index'})
    window.scrollTo(0, 0);
  },

  showAllGrades: function () {
    this.updateUnitTemplatesManager({grade: null});
    window.scrollTo(0, 0);
  },

  filterByGrade: function () {
    var grade  = this.state.unitTemplatesManager.grade;
    if (grade) {
      var uts = this._modelsInGrade(grade)
    } else {
      var uts = this.state.unitTemplatesManager.models;
    }
    this.updateUnitTemplatesManager({stage: 'index', displayedModels: uts});
  },

  filterByCategory: function (categoryId) {
    if (categoryId) {
      var uts = this._modelsInCategory(categoryId)
    } else {
      var uts = this.state.unitTemplatesManager.models;
    }
    this.updateUnitTemplatesManager({stage: 'index', displayedModels: uts, selectedCategoryId: categoryId});
  },

  fetchUnitTemplateModels: function () {
    this.modules.unitTemplatesServer.getModels(this.updateUnitTemplateModels);
  },

  componentDidMount: function () {
    if (this.state.tab == 'exploreActivityPacks') {
      this.fetchUnitTemplateModels();
    }
  },

	toggleTab: function (tab) {
		if (tab == 'createUnit') {
			this.props.analytics.track('click Create Unit', {});
      this.updateCreateUnit({
                              stage: 1,
                              model: {
                                name: null,
                                selectedActivities: []
                              }
                            });

      this.setState({tab: tab});
		} else if (tab == 'exploreActivityPacks') {
			this.deepExtendState({tab: tab, unitTemplatesManager: {stage: 'index', firstAssignButtonClicked: false, model_id: null, model: null}});
      this.fetchUnitTemplateModels();
		} else {
			this.setState({tab: tab});
		}
	},

	toggleStage: function (stage) {
		this.updateCreateUnit({stage: stage})
		if (!this.state.createUnit.options.classrooms.length) {
      this.fetchClassrooms();
    }
	},

  fetchClassrooms: function() {
    var that = this;
    $.ajax({
      url: '/teachers/classrooms/retrieve_classrooms_for_assigning_activities',
      context: this,
      success: function (data) {
        that.updateCreateUnit({options: {classrooms: data.classrooms_and_their_students}})
      }
    });
  },

	getInviteStudentsUrl: function() {
		return ('/teachers/classrooms/' + $(".tab-pane").data().classroomId + '/invite_students');
	},

	studentsPresent: function() {
		return $(".tab-pane").data().students;
	},

	getLastClassroomName: function() {
		return $(".tab-pane").data().classroomName;
	},

  getSelectedActivities: function () {
  	return this.state.createUnit.model.selectedActivities;
  },

  toggleActivitySelection: function (activity, true_or_false) {
    console.log('toggleActivitySelection')
    var selectedActivities = this.state.createUnit.model.selectedActivities
    console.log('current selectedActivites', selectedActivities)
    console.log('activity', activity)
		if (true_or_false) {
			this.props.analytics.track('select activity in lesson planner', {name: activity.name, id: activity.id});
		}
		var sas = this.modules.fnl.toggleById(this.getSelectedActivities(), activity);
		this.updateCreateUnitModel({selectedActivities: sas});
	},

  clickAssignButton: function () {
    this.updateUnitTemplatesManager({firstAssignButtonClicked: true});
  },

  fastAssign: function () {
    $.ajax({
      url: '/teachers/unit_templates/fast_assign',
      data: {id: this.state.unitTemplatesManager.model.id},
      type: 'POST',
      success: this.onFastAssignSuccess
    });
  },

  onFastAssignSuccess: function () {
		var lastActivity = this.state.unitTemplatesManager.model;
		this.props.analytics.track('click Create Unit', {});
		this.deepExtendState(this.blankState());
		this.updateUnitTemplatesManager({lastActivityAssigned: lastActivity});
		this.fetchClassrooms();
		this.updateUnitTemplatesManager({assignSuccess: true});
  },

	unitTemplatesAssignedActions: function() {
		return {
			studentsPresent: this.studentsPresent,
			getInviteStudentsUrl: this.getInviteStudentsUrl,
			getLastClassroomName: this.getLastClassroomName,
			unitTemplatesManagerActions: this.unitTemplatesManagerActions
		};
	},

	customAssign: function () {
		this.fetchClassrooms();
		var unitTemplate = this.state.unitTemplatesManager.model;
		var state = this.state;
		var hash = {
			tab: 'createUnit',
      unitTemplatesManager: {firstAssignButtonClicked: false},
			createUnit: {
				stage: 2,
				model: {
					name: unitTemplate.name,
					selectedActivities: unitTemplate.activities
				}
			}
		};
		this.deepExtendState(hash);
	},

	unitTemplatesManagerActions: function () {
		return {
			toggleTab: this.toggleTab,
      customAssign: this.customAssign,
      fastAssign: this.fastAssign,
			clickAssignButton: this.clickAssignButton,
			returnToIndex: this.returnToIndex,
      filterByCategory: this.filterByCategory,
      filterByGrade: this.filterByGrade,
      selectModel: this.selectModel,
      showAllGrades: this.showAllGrades
		};
	},




	render: function () {
		var tabSpecificComponents;
		if (this.state.unitTemplatesManager.assignSuccess === true)  {
			tabSpecificComponents = <EC.UnitTemplatesAssigned
																		data={this.state.unitTemplatesManager.lastActivityAssigned}
																		actions={this.unitTemplatesAssignedActions()}/>;
		} else if (this.state.tab == 'createUnit') {
			tabSpecificComponents = <EC.CreateUnit data={{createUnitData: this.state.createUnit,
																						assignSuccessData: this.state.unitTemplatesManager.model}}
																						 actions={{toggleStage: this.toggleStage,
                                                       toggleTab: this.toggleTab,
                                                       assignActivityDueDate: this.assignActivityDueDate,
                                                       update: this.updateCreateUnitModel,
                                                       toggleActivitySelection: this.toggleActivitySelection,
																										 	 assignSuccessActions: 	this.unitTemplatesAssignedActions()}}
																						 analytics={this.props.analytics}/>;
		} else if (this.state.tab == 'manageUnits') {
			tabSpecificComponents = <EC.ManageUnits actions={{toggleTab: this.toggleTab, editUnit: this.editUnit}} />;
		} else if (this.state.tab == 'exploreActivityPacks') {
			tabSpecificComponents = <EC.UnitTemplatesManager
																		data={this.state.unitTemplatesManager}
																		actions={this.unitTemplatesManagerActions()}/>;
    } else if (this.state.tab === 'assignANewActivity') {
			tabSpecificComponents = <EC.AssignANewActivity toggleTab={this.toggleTab}/>;
																}

		return (
			<span>
				<EC.UnitTabs tab={this.state.tab} toggleTab={this.toggleTab}/>
				<div id="lesson_planner" >
					{tabSpecificComponents}
				</div>
			</span>
		);

	}
});
