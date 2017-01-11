'use strict'

 import React from 'react'
 import _ from 'underscore'
 import OverviewMini from './overview_mini'
 import PremiumMini from './premium_mini'
 import TeacherGuide from '../teacher_guide/teacher_guide'
 import BetaMini from './beta_mini.jsx'

 export default React.createClass({
  propTypes: {
    data: React.PropTypes.any
  },

  getInitialState: function() {
    return {displayTeacherGuide: true};
  },

  hideTeacherGuide: function(){
    this.setState({displayTeacherGuide: false});
  },

  showTeacherGuide: function(){
    this.setState({displayTeacherGuide: true});
  },

  overviewMinis: function() {
    var minis = _.map(this.props.data, function(overviewObj){
      return <OverviewMini overviewObj={overviewObj} key={overviewObj.header}/>;
    });
    if (this.props.flag === 'beta') {
      minis.unshift(<BetaMini key='beta-mini'/>)
    }
    // if (this.state.displayTeacherGuide){
      minis.unshift(<TeacherGuide dashboardMini key='teacher-guide-displayed' hideTeacherGuide={this.hideTeacherGuide} isDisplayed={false}/>);
    // }
    return minis;
  },

  hasPremium: function() {
    if (this.props.data !== null && (this.props.premium === 'none') || (this.props.premium === null)) {
      return <PremiumMini/>;
    }
  },




  render: function() {
    return (
      <div className='row'>
        {this.overviewMinis()}
        {this.hasPremium()}
      </div>
    );
  }

});
