'use strict'

 import React from 'react'
 import _ from 'underscore'
 import ListFilterOption from './list_filter_option'


 export default  React.createClass({
  propTypes: {
    options: React.PropTypes.array.isRequired,
    select: React.PropTypes.func.isRequired,
    userLoggedIn: React.PropTypes.bool
  },

  sortViews: function (views) {
    var order = ['All', 'Elementary', 'Middle', 'High', 'University', 'ELL', 'Themed'];
    return _.compact(_.map(order, function(option) {
      return _.findWhere(views, {name: option});
    }));
  },

  generateViews: function () {
    var allOption = {
      id: null,
      name: 'All'
    };
    var options = this.props.options ? [allOption].concat(this.props.options) : [allOption];
    var sortedOptions = this.sortViews(options);
    var arr =_.map(sortedOptions, this.generateView, this);
    return arr;
  },

  getKey: function (option) {
    return option.id;
  },

  isSelected: function (option) {
    return (this.props.selectedId === option.id);
  },

  generateView: function (option) {
    return <ListFilterOption
                    userLoggedIn={this.props.userLoggedIn}
                    key={this.getKey(option)}
                    data={option}
                    isSelected={this.isSelected(option)}
                    select={this.props.select} />
  },

  renderForLoggedInUser: function () {
   return (
       <div className='list-filter-options-container'>
         <div className='list-filter-options'>
            {this.generateViews()}
         </div>
     </div>
    );
  },

  renderForNotLoggedInUser: function () {
    return (
      <div key='not-logged-in' className="about-subtabs tab-subnavigation-wrapper">
        <div className="container">
          <ul>
            <li>
              {this.generateViews(this.props.userLoggedIn)}
            </li>
          </ul>
        </div>
      </div>
    )

  },



  render: function () {
    return (
      this.props.userLoggedIn ? this.renderForLoggedInUser() : this.renderForNotLoggedInUser()
    );
  }
})
