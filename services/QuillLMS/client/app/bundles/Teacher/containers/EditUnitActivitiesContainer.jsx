import React from 'react'
import UnitStage1 from '../components/assignment_flow/create_unit/select_activities_container.jsx'
import request from 'request'
import getAuthToken from '../components/modules/get_auth_token';

export default class extends React.Component {
  state = {selectedActivities: new Set()};

  toggleActivitySelection = (activity) => {
    // TODO: this should just take an id as a param -- the reason that it is not
    // is because the original toggleActivitySelection fn is expecting an entire activity
    // object and we don't want to break the original yet
    const newState = Object.assign({},this.state);
    const activities = newState.selectedActivities
    activities.has(activity) ? activities.delete(activity) : activities.add(activity)
    this.setState(newState)
  };

  getActivityIds = () => {
    const ids = [];
    this.state.selectedActivities.forEach((act)=>ids.push({id: act.id, due_date: null}));
    return ids
  };

  updateActivities = () => {
    const that = this;
    request.put({
      url: `${process.env.DEFAULT_URL}/teachers/units/${that.props.params.unitId}/update_activities`,
      json: {
        authenticity_token: getAuthToken(),
        data: { activities_data: that.getActivityIds(), }
      }
    }, (error, httpStatus, body) => {
      if (body.errors) {
        this.setState({ errors: body.errors, loading: false, })
      } else {
        window.location = '/teachers/classrooms/lesson_planner'
      }
    })
  };

  render() {
    return (
      <div>
        <div className='container lesson_planner_main edit-assigned-activities-container'>
          <UnitStage1
            editing={Boolean(true)}
            errorMessage={this.state.errors}
            hideNameTheUnit={Boolean(true)}
            selectedActivities={[...this.state.selectedActivities]}
            toggleActivitySelection={this.toggleActivitySelection}
            unitName={this.props.params.unitName}
            updateActivities={this.updateActivities}
          />
        </div>
      </div>
      )
  }
}
