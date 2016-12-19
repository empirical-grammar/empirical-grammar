'use strict'

 import React from 'react'
 import FilterOption from './filter_option'
 import _ from 'underscore'
 import $ from 'jquery'
 import naturalCmp from 'underscore.string/naturalCmp'
 import FilterButton from './filter_button.jsx'

 export default  React.createClass({

	selectFilterOption: function (optionId) {
		this.props.selectFilterOption(this.props.data.field, optionId);
	},
	clearFilterOptionSelection: function () {
		this.props.selectFilterOption(this.props.data.field, null);
	},


	getDisplayedFilterOptions: function() {
		var visibleOptions, isThereASelection, clearSelection;
		isThereASelection = !!this.props.data.selected;

		// Sort the options alphanumerically.
		this.props.data.options.sort(function(a, b) {
			// This is kind of a hack, but all of the filter's options have a 'name' property.
			return naturalCmp(a.name, b.name);
		});


		if (isThereASelection) {
			visibleOptions = _.reject(this.props.data.options, {id: this.props.data.selected}, this);
		} else {
			visibleOptions = this.props.data.options;
		}

    var that = this;
    var field = this.props.data.field;
		visibleOptions = _.map(visibleOptions, function (option) {
      if (field === 'activity_classification') {
        return (<FilterButton key={option.name} selectFilterOption={that.selectFilterOption} data={option}/>);
      }
			return (
				<FilterOption key={option.name} selectFilterOption={that.selectFilterOption} data={option} />
			);
		}, this);

		if (isThereASelection && field !== 'activity_classification') {
			clearSelection = (
				<li onClick={this.clearFilterOptionSelection}>
					<span className='filter_option all'>
						{'All ' + this.props.data.alias + 's '}
					</span>
				</li>
			);
			visibleOptions.unshift(clearSelection);
		}
		return visibleOptions;
	},

	getFilterHeader: function() {
		if (this.props.data.selected) {
			return this.getSelectedOption().name;
		} else {
			return 'Filter by ' + this.props.data.alias;
		}
	},

	getSelectedOption: function() {
		return _.find(this.props.data.options, {id: this.props.data.selected}, this);
	},

	render: function () {
		// Several cases here:
		// Nothing is selected. 'Filter by X' displays. All other options can be selected.
		// An option is selected. Option name displays. Options now include 'All X'. All options displayed.
    let filterIsButtons = this.props.data.field === 'activity_classification'
    if (filterIsButtons) {
      return (
        <div className='activity-filter button-row'>
          {this.getDisplayedFilterOptions()}
          {this.props.children}
        </div>
      );
    }

		return (
			<div className="no-pl">
				<div className="button-select activity-filter-button">

					<button type="button" className="select-mixin select-gray button-select button-select-wrapper" data-toggle="dropdown">
						{this.getFilterHeader()}
						<i className="fa fa-caret-down"></i>
					</button>

					<ul className="dropdown-menu" role="menu">
						{this.getDisplayedFilterOptions()}
					</ul>

				</div>
			</div>
		);
	}
});
