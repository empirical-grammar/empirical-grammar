import React from 'react';
import _ from 'underscore';
import NotificationFeed from './notifications/container';
import OverviewMini from './overview_mini';
import PremiumMini from './premium_mini';
import TeacherGuide from '../teacher_guide/teacher_guide';
import NewTools from './new_tools_mini.jsx';
import PremiumPromo from './premium_promo.jsx';
import LessonsList from './lessons_list.jsx';
import DiagnosticMini from './diagnostic_mini.jsx';

export default class ClassOverview extends React.Component {
  constructor(props) {
    super(props)

    this.state = { displayTeacherGuide: true, };
  }

  hideTeacherGuide = () => {
    this.setState({ displayTeacherGuide: false, });
  };

  showTeacherGuide = () => {
    this.setState({ displayTeacherGuide: true, });
  };

  overviewMinis = () => {
    const minis = _.map(this.props.data, (overviewObj) => {
      if (overviewObj.results && overviewObj.results !== 'insufficient data') {
        return <OverviewMini key={overviewObj.header} overviewObj={overviewObj} />;
      }
    });
    return _.compact(minis);
  };

  teacherGuide = () => {
    if (this.state.displayTeacherGuide) {
      return <TeacherGuide dashboardMini hideTeacherGuide={this.hideTeacherGuide} isDisplayed={false} key="teacher-guide-displayed" />;
    }
  };

  hasPremium = () => {
    if (this.props.premium === 'locked') {
      return <PremiumPromo key="promo" />;
    } else if ((this.props.premium === 'none') || (this.props.premium === null)) {
      return <PremiumMini />;
    }
  };

  lessonsList = () => {
    return <LessonsList />;
  };

  diagnosticMini = () => {
    return <DiagnosticMini />;
  };

  render() {
    return (
      <div className="row">
        {this.teacherGuide()}
        {this.diagnosticMini()}
        {this.lessonsList()}
        {this.hasPremium()}
        {this.overviewMinis()}
        <NotificationFeed notifications={this.props.notifications} />
      </div>
    );
  }
}
