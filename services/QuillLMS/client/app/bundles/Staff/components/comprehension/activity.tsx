import * as React from "react";
import { NavLink, Redirect, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';
import ActivitySettings from './configureSettings/activitySettings';
import RuleSets from './configureRegex/ruleSets';
import RuleSet from './configureRegex/ruleSet';
import { ActivityRouteProps } from '../../interfaces/comprehensionInterfaces';

const Activity: React.FC<RouteComponentProps<ActivityRouteProps>> = ({ match }) => {
  const { params } = match;
  const { activityId } = params;
  return(
    <div className="activity-container">
      <div className="tabs-container">
        <NavLink activeClassName="is-active" to={`/activities/${activityId}/settings`}>
          <div className="tab-option">
            Configure Settings
          </div>
        </NavLink>
        <NavLink activeClassName="is-active" to={`/activities/${activityId}/mechanical-turk`}>
          <div className="tab-option">
            Gather Responses
          </div>
        </NavLink>
        <NavLink activeClassName="is-active" to={`/activities/${activityId}/labeling`}>
          <div className="tab-option">
            Label Responses
          </div>
        </NavLink>
        <NavLink activeClassName="is-active" to={`/activities/${activityId}/feedback`}>
          <div className="tab-option">
            Configure Feedback
          </div>
        </NavLink>
        <NavLink activeClassName="is-active" to={`/activities/${activityId}/topic-model`}>
          <div className="tab-option">
            Train Models
          </div>
        </NavLink>
        <NavLink activeClassName="is-active" to={`/activities/${activityId}/rulesets`}>
          <div className="tab-option">
            Configure RegEx
          </div>
        </NavLink>
      </div>
      <Switch>
        <Redirect exact from='/activities/:activityId' to='/activities/:activityId/settings' />
        <Route component={ActivitySettings} path='/activities/:activityId/settings' />
<<<<<<< HEAD
=======
        <Route component={RuleSet} path='/activities/:activityId/rulesets/:regexId' />
>>>>>>> 2cefd93296c048018da60e10425af34e1f0fe49a
        <Route component={RuleSets} path='/activities/:activityId/rulesets' />
      </Switch>
    </div>
  );
}
export default withRouter(Activity)
