'use strict'

import React from 'react'
import ActivitySearchFilter from './activity_search_filter'
import _ from 'underscore'
import SearchActivitiesInput from '../search_activities_input'

export default React.createClass({

    render: function() {
        let dropDowns = []
        let appFilter;
        this.props.data.forEach((filter, index) => {
          if (index < 2) {
            dropDowns.push(<ActivitySearchFilter key={filter.alias} selectFilterOption={this.props.selectFilterOption} data={filter}/>)
          } else {
            appFilter = <ActivitySearchFilter key={filter.alias} selectFilterOption={this.props.selectFilterOption} data={filter}/>
          }
        });
        const clearAll = <button key='clear-all' type='button' className="clear-filter-btn btn-danger btn" onClick={this.props.clearFilters}>Clear Filters</button>
        const dropDownFilters = <div className='activity-filter-drop-downs' key='activity-filter-drop-downs'>
          {[dropDowns, clearAll]}
        </div>



        let dropDownFiltersAndSearch = [<SearchActivitiesInput key='activity-search' updateSearchQuery={this.updateSearchQuery} />].concat(dropDownFilters);
        return (
            <div className="row activity-page-dropdown-wrapper">
                <div className='drop-down-filters-and-search'>
                  {dropDownFiltersAndSearch}
                </div>
                {appFilter}
            </div>
        );
    }
});
