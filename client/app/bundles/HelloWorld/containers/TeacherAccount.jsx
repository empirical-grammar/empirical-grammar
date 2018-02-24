import React from 'react'
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import StaticDisplaySubscription from '../components/accounts/subscriptions/static_display_subscription';
import SelectSchool from '../components/accounts/school/select_school';
import $ from 'jquery';
import LoadingSpinner from '../components/shared/loading_indicator.jsx';
import ButtonLoadingIndicator from '../components/shared/button_loading_indicator';

export default createReactClass({
  propTypes: {
    userType: PropTypes.string.isRequired,
  },

  getInitialState() {
    return ({
      id: this.props.teacherId,
      name: '',
      username: '',
      email: '',
      isSaving: false,
      selectedSchool: null,
      originalSelectedSchool: null,
      schoolOptions: [],
      schoolOptionsDoNotApply: false,
      role: 'teacher',
      password: null,
      loading: true,
      errors: {},
      subscription: {
        id: null,
        expiration: '2016-01-01',
        account_limit: null,
      },
    });
  },

  componentDidMount() {
    let data;
    $.ajax({ url: '/teachers/my_account_data', success: this.populateData, });
  },

  populateData(data) {
    let school,
      schoolData,
      originalSelectedSchoolId;
    school = data.school;
    if (school == null) {
      schoolData = null;
      originalSelectedSchoolId = null;
    } else {
      schoolData = {
        id: school.id,
        text: school.name,
        zipcode: school.zipcode,
      };
      originalSelectedSchoolId = school.id;
      this.requestSchools(school.zipcode);
			// couldnt get react to re-render the default value of zipcode based on state change so have to use the below
      $('input.zip-input').val(school.zipcode);
    }
    let subscription;
    if (data.subscription) {
      subscription = data.subscription;
    } else {
      subscription = {
        id: null,
        expiration: '2016-01-01',
        account_limit: null,
        account_type: 'none',
        subscriptionType: 'none',
      };
    }
    this.setState({
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      role: data.role,
      googleId: data.google_id,
      signedUpWithGoogle: data.signed_up_with_google,
      selectedSchool: schoolData,
      originalSelectedSchoolId,
      schoolOptionsDoNotApply: (originalSelectedSchoolId == null),
      subscription,
      loading: false,
    });
  },

  updateName(event) {
    this.setState({ name: event.target.value, });
  },

  updateUsername(event) {
    this.setState({ username: event.target.value, });
  },

  updateEmail(event) {
    this.setState({ email: event.target.value, });
  },

  clickSave() {
    this.setState({ isSaving: true, });
    const data = {
      name: this.state.name,
      authenticity_token: $('meta[name=csrf-token]').attr('content'),
      email: this.state.email,
      role: this.state.role,
      password: this.state.password,
      school_id: ((this.state.selectedSchool == null)
				? null
				: this.state.selectedSchool.id),
      original_selected_school_id: this.state.originalSelectedSchoolId,
      school_options_do_not_apply: this.state.schoolOptionsDoNotApply,
    };
    $.ajax({ type: 'PUT', data, url: '/teachers/update_my_account', success: this.uponUpdateAttempt, });
  },

  uponUpdateAttempt(data) {
    this.setState({ isSaving: false, });
    if (data.errors == null) {
			// name may have been capitalized on back-end
      data.errors = {};
      if (this.state.role === 'student') {
        window.location = '/profile';
      }
    }
    this.setState({ errors: data.errors, });
  },

  updateSchool(school) {
    this.setState({ selectedSchool: school, });
  },
  requestSchools(zip) {
    $.ajax({
      url: '/schools.json',
      data: {
        zipcode: zip,
      },
      success: this.populateSchools,
    });
  },
  populateSchools(data) {
    this.setState({ schoolOptions: data, });
  },
  attemptDeleteAccount() {
    const confirmed = confirm('Are you sure you want to delete this account?');
    if (confirmed) {
      $.ajax({
        type: 'POST',
        url: `/teachers/clear_data/${this.state.id}`,
        data: {
          id: this.props.teacherId,
        },
      }).done(() => {
        window.location.href = window.location.origin;
      });
    }
  },
  updateSchoolOptionsDoNotApply() {
    this.setState({ schoolOptionsDoNotApply: !this.state.schoolOptionsDoNotApply, }, () => this.updateSelectedSchool());
  },
  updateSelectedSchool() {
    if (this.state.schoolOptionsDoNotApply) {
      this.setState({
        selectedSchool: {
          id: 103341,
          zipcode: null,
          name: 'not listed',
        },
      });
    }
  },
  updatePassword(e) {
    this.setState({ password: e.target.value, });
  },

  updateRole(role) {
    this.setState({ role, }, this.clickSave);
  },

  saveButton() {
    return this.state.isSaving
		? <button className="save-button button-grey"><ButtonLoadingIndicator /></button>
		: <button onClick={this.clickSave} className="save-button button-green">Save Changes</button>;
  },

  renderEmail() {
    let message, inputField;
    if (this.state.googleId || this.state.signedUpWithGoogle) {
      inputField = <input className="inactive" ref="email" name="email" value={this.state.email} readOnly />
      message = this.renderGoogleClassroomWarning()
    } else {
      inputField = <input ref="email" name="email" onChange={this.updateEmail} value={this.state.email} />
    }
    return <div className="form-row email-row">
      <div className="form-label">Email</div>
      <div className="form-input">
        {inputField}
      </div>
      {message}
    </div>;
  },

  renderGoogleClassroomWarning() {
    return <div className="google-classroom-warning">
      <i className="fa fa-icon fa-lightbulb-o"/>
      <p>Your email is locked because it is connected to Google Classroom. If you need to change it, please contact us at <a href="mailto:support@quill.org">support@quill.org</a>.</p>
    </div>
  },

  renderErrors() {
    if (this.state.errors) {
      return Object.keys(this.state.errors).map((e, i) =>
        <span key={i} className="error">{e} {this.state.errors[e]}.&nbsp;</span>
      )
    }
  },

  render() {
    if (this.state.loading) {
      return <LoadingSpinner />;
    }
    const selectRole = (<div>
      <p>Are you a student and not a teacher?</p>
      <p className="switch-account-type" onClick={() => this.updateRole('student')}>Switch your account to a student account.</p>
    </div>)
    const subscription = <StaticDisplaySubscription subscription={this.state.subscription} />;

    return (
      <div className="container" id="my-account">
        <h3>My Account</h3>
        <div className="form">
          <div className="form-row">
            <div className="form-label">
  						Full Name
  					</div>
            <div className="form-input">
              <input ref="name" name="name" onChange={this.updateName} value={this.state.name} />
            </div>
          </div>

          {this.renderEmail()}


          <div className="form-row">
            <div className="form-label">
  						Password
  					</div>
            <div className="form-input">
              <input type="password"  name="password" ref="password" onChange={this.updatePassword} placeholder="Input New Password" />
            </div>
          </div>

          <SelectSchool errors={this.state.errors.school} selectedSchool={this.state.selectedSchool} schoolOptions={this.state.schoolOptions} requestSchools={this.requestSchools} updateSchool={this.updateSchool} />

          {subscription}
        </div>

        <div className="form-row">
            {this.saveButton()}
            {this.renderErrors()}
        </div>

        <div className="form-row">
          <div onClick={this.attemptDeleteAccount} className="delete-account">
						Delete Account
					</div>
        </div>
        <br/>
        {selectRole}
      </div>
    );
  },
});
