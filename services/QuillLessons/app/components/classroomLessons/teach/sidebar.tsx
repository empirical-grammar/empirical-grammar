declare function require(name:string);
import * as React from 'react';
import { connect } from 'react-redux';
import { getParameterByName } from '../../../libs/getParameterByName';
import {
  updateCurrentSlide,
} from '../../../actions/classroomSessions';
import CLStudentLobby from '../play/lobby';
import CLStudentStatic from '../play/static';
import CLStudentSingleAnswer from '../play/singleAnswer';
import CLStudentListBlanks from '../play/listBlanks';
import CLStudentFillInTheBlank from '../play/fillInTheBlank';
import CLStudentModelQuestion from '../play/modelQuestion';
import CLStudentMultistep from '../play/multistep';
import {
  QuestionSubmissionsList,
  ClassroomSessionId,
  ClassroomUnitId,
  ClassroomLessonSession
} from '../interfaces';
import {
  ClassroomLesson
} from '../../../interfaces/classroomLessons';
import * as CustomizeIntf from '../../../interfaces/customize'
import { Lesson, Edition } from './dataContainer';
const studentIcon = 'https://assets.quill.org/images/icons/student_icon.svg'

interface ReducerSidebarProps extends React.Props<any> {
  // classroomSessions: any,
  // customize: any,
}

interface PassedSidebarProps extends React.Props<any> {
  params: any
  lesson: Lesson
  edition: Edition
  session: ClassroomLessonSession
}

class Sidebar extends React.Component<ReducerSidebarProps & PassedSidebarProps & DispatchFromProps, any> {

  constructor(props) {
    super(props);

    const classroomUnitId: ClassroomUnitId|null = getParameterByName('classroom_unit_id')
    const activityUid = props.params.lessonID
    this.state = {
      classroomUnitId,
      classroomSessionId: classroomUnitId ? classroomUnitId.concat(activityUid) : null,
      currentSlide: null
    }
  }

  componentWillUpdate(prevProps, prevState) {
    if (!this.state.currentSlide) {
      this.scrollToSlide(this.props.session.current_slide)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.session.current_slide !== this.props.session.current_slide) {
      this.scrollToSlide(nextProps.session.current_slide)
    }
  }

  scrollToSlide(slide_id: string) {
    const el = document.getElementById(slide_id)
    const sidebar = document.getElementsByClassName("side-bar")[0];
    if (el && sidebar) {
      this.setState({
        currentSlide: el,
      })
      this.scrollToPosition(sidebar, el.offsetTop - 65, 0)
    }
  }

  // borrowed from https://stackoverflow.com/questions/12102118/scrollintoview-animation/32484034
  scrollToPosition(elem, pos, count) {
    if (count > 15) {
      return;
    }
    var y = elem.scrollTop;
    y += Math.round( ( pos - y ) * 0.3 );
    if (Math.abs(y-pos) <= 2) {
      elem.scrollTop = pos;
      return;
    }
    elem.scrollTop = y;
    setTimeout(() => {this.scrollToPosition(elem, this.state.currentSlide.offsetTop - 105, count+1)}, 40);
  }

  goToSlide(slide_id: string) {
    const classroomSessionId: ClassroomSessionId|null = this.state.classroomSessionId;
    if (classroomSessionId) {
      this.props.dispatch(updateCurrentSlide(slide_id, classroomSessionId));
    }
  }

  presentStudents() {
    const {presence} = this.props.session
    const numPresent = !!presence ?  Object.keys(presence).filter((id) => presence[id] === true ).length : 0
    return (
      <div className="present-students"><img src={studentIcon}/><span> {numPresent} Student{numPresent === 1 ? '': 's'} Viewing</span></div>
    )
  }

  render() {
    const data = this.props.session;
    const lessonData = this.props.lesson; // Replace with Apollo
    const editionData = this.props.edition;
    if (editionData && data && lessonData) {
      const questions = editionData.questions;
      const length = questions ? Number(questions.length) - 1 : 0;
      const currentSlide = data.current_slide;
      const components: JSX.Element[] = [];
      let counter = 0;
      for (const slide in questions) {
        counter += 1;
        const activeClass = currentSlide === slide ? 'active' : '';
        let thumb;
        let title = editionData.questions[slide].data.teach.title
        let titleSection = title ? <span> - {title}</span> : <span/>
        let prompt = data.prompts && data.prompts[slide] ? data.prompts[slide] : null;
        let model: string|null = data.models && data.models[slide] ? data.models[slide] : null;
        let mode: string | null = data.modes && data.modes[slide] ? data.modes[slide] : null;
        let submissions: QuestionSubmissionsList | null = data.submissions && data.submissions[slide] ? data.submissions[slide] : null;
        let selected_submissions = data.selected_submissions && data.selected_submissions[slide] ? data.selected_submissions[slide] : null;
        let selected_submission_order: Array<string>|null = data.selected_submission_order && data.selected_submission_order[slide] ? data.selected_submission_order[slide] : null;
        let props = { mode, submissions, selected_submissions, selected_submission_order};
        switch (questions[slide].type) {
          case 'CL-LB':
            thumb = (
              <CLStudentLobby data={data} title={lessonData.title}/>
            );
            break;
          case 'CL-ST':
            thumb = (
              <CLStudentStatic data={questions[slide].data} />
            );
            break;
          case 'CL-MD':
            thumb = (
              <CLStudentModelQuestion data={questions[slide].data} model={model} prompt={prompt}/>
            );
            break;
          case 'CL-SA':
            thumb = (
              <CLStudentSingleAnswer data={questions[slide].data} handleStudentSubmission={() => {}} {...props} />
            );
          break
          case 'CL-FB':
            thumb = (
              <CLStudentFillInTheBlank data={questions[slide].data} handleStudentSubmission={() => {}} {...props} />
            );
            break;
          case 'CL-FL':
            thumb = (
              <CLStudentListBlanks data={questions[slide].data} handleStudentSubmission={() => {}} {...props} />
            );
            break;
          case 'CL-EX':
            thumb = (
              <CLStudentStatic data={questions[slide].data} />
            );
            break;
          case 'CL-MS':
            thumb = (
              <CLStudentMultistep data={questions[slide].data} handleStudentSubmission={() => {}} {...props} />
            )
            break;
          default:
            thumb = questions[slide].type;
        }
        const headerText = slide === '0'
        ? <span>Title Slide{titleSection}</span>
        : <span>Slide {slide} / {length}{titleSection}</span>
        components.push((
          <div key={counter} onClick={() => this.goToSlide(slide)} id={slide}>
            <div className="sidebar-header">
            <p className={`slide-number ${activeClass}`}>{headerText}</p>
            {currentSlide === slide ? this.presentStudents() : null}
            </div>
            <div className={`slide-preview ${activeClass}`}>
              <div className="scaler">
                {thumb}
              </div>
            </div>
          </div>
        ));
      }
      return (
        <div className="side-bar">
          {components}
        </div>
      );
    }
    return (
      <div className="side-bar">
          Loading...
        </div>
    );
  }

}

function select(props) {
  return {
  };
}

function mergeProps(stateProps: Object, dispatchProps: Object, ownProps: Object) {
  return {...ownProps, ...stateProps, ...dispatchProps}
}

export interface DispatchFromProps {
  dispatch: any;
}

export default connect<ReducerSidebarProps, DispatchFromProps, PassedSidebarProps>(select, dispatch => ({dispatch}))(Sidebar);
