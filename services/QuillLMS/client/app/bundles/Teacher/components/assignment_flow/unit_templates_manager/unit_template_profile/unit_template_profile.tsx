import React from 'react';
import _ from 'underscore';
import LoadingIndicator from '../../../shared/loading_indicator';
import ScrollToTop from '../../../shared/scroll_to_top';
import UnitTemplateProfileDescription from './unit_template_profile_description';
import UnitTemplateProfileAssignButton from './unit_template_profile_assign_button';
import UnitTemplateProfileShareButtons from './unit_template_profile_share_buttons';
import UnitTemplateProfileStandards from './unit_template_profile_standards';
import UnitTemplateProfileActivityTable from './unit_template_profile_activity_table';
import AssignmentFlowNavigation from '../../assignment_flow_navigation.tsx'
import {
  UNIT_TEMPLATE_NAME,
  ACTIVITY_IDS_ARRAY,
  UNIT_TEMPLATE_ID,
  UNIT_NAME,
} from '../../localStorageKeyConstants.ts'
import { requestGet } from '../../../../../../modules/request/index.js';
import Activity from '../../../../../interfaces/activity';
import UnitTemplateProfile from '../../../../../interfaces/unitTemplateProfile';
import { RouteComponentProps } from 'react-router-dom';

interface UnitTemplateProfileState {
  data: UnitTemplateProfile,
  loading: boolean,
  referralCode: string
}

export default class UnitTemplateProfile extends React.Component<RouteComponentProps, UnitTemplateProfileState> {
  state = {
    data: null,
    loading: true,
    referralCode: ''
  }

  componentDidMount() {
    const { params } = this.props;
    const { activityPackId } = params;
    this.getProfileInfo(activityPackId);
  }

  componentWillReceiveProps(nextProps: RouteComponentProps) {
    const { location } = this.props;
    const { params } = nextProps;
    const { activityPackId } = params;
    if (!_.isEqual(location, nextProps.location)) {
      this.setState({ loading: true, });
      this.getProfileInfo(activityPackId);
    }
  }

  getProfileInfo = (id: string) => {
    requestGet(`/teachers/unit_templates/profile_info?id=${id}`, (response: { data: UnitTemplateProfile, referral_code: string }) => {
      this.displayUnit(response)
    })
  }

  displayUnit = (response: { data: UnitTemplateProfile, referral_code: string }) => {
    const { data, referral_code } = response;
    this.setState({
      data,
      referralCode: referral_code,
      loading: false
    })
  }

  indexLink = () => {
    const { data } = this.state;
    const { non_authenticated } = data;
    return non_authenticated
      ? '/activities/packs'
      : '/assign/featured-activity-packs';
  }

  socialShareUrl = (referralCode: string) => {
    return `${window.location}${referralCode ? '?referral_code=' + referralCode : ''}`
  }

  socialText = (name: string, referralCode: string) => {
    return `Check out the '${name}' activity pack I just assigned on Quill.org! ${this.socialShareUrl(referralCode)}`
  }

  getMetaText = (name: string) => {
    return `Check out the '${name}' activity pack I just assigned on Quill.org!`;
  }

  handleGoToEditStudents = () => {
    const { router } = this.props;
    const { data } = this.state;
    const { name, id, activities, } = data
    const activityIdsArray = activities.map((act: Activity) => act.id).toString()
    window.localStorage.setItem(UNIT_TEMPLATE_NAME, name)
    window.localStorage.setItem(UNIT_NAME, name)
    window.localStorage.setItem(ACTIVITY_IDS_ARRAY, activityIdsArray)
    window.localStorage.setItem(UNIT_TEMPLATE_ID, id)
    router.push(`/assign/select-classes?unit_template_id=${id}`)
  }

  renderAssignButton = () => {
    return <button className="quill-button contained primary medium" onClick={this.handleGoToEditStudents} type="submit">Select pack</button>
  }

  render() {
    const { data, loading, referralCode} = this.state
    if (loading) {
      return <LoadingIndicator />
    } else {     
      let navigation: any
      const { name, id, non_authenticated, flag } = data
      if (!non_authenticated) {
        navigation = (<AssignmentFlowNavigation
          button={this.renderAssignButton()}
          unitTemplateId={id}
          unitTemplateName={name}
        />)
      }
      if (document.querySelector("meta[name='og:description']")) {
        document.querySelector("meta[name='og:description']").content = this.getMetaText(name);
      }
      return (
        <div className="unit-template-profile">
          <ScrollToTop  />
          {navigation}
          <div className="unit-template-profile-container">
            <h1>Activity Pack: {name}</h1>
            <UnitTemplateProfileActivityTable data={data}  />
            <div className="first-content-section flex-row space-between first-content-section">
              <div className="description">
                <UnitTemplateProfileDescription data={data}  />
              </div>
              <div className="assign-buttons-and-standards">
                <UnitTemplateProfileAssignButton data={data}  />
                <UnitTemplateProfileStandards data={data}  />
                {flag !== 'private' && <UnitTemplateProfileShareButtons data={data} text={this.socialText(name, referralCode)} url={this.socialShareUrl(referralCode)} />}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}