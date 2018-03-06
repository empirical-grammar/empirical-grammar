import React from 'react';
import _ from 'underscore';
import AdminsTeachers from 'bundles/admin_dashboard/components/admins_teachers';
import PremiumFeatures from 'bundles/admin_dashboard/components/premium_features';
import CreateNewAccounts from 'bundles/admin_dashboard/components/create_new_accounts';
import LoadingSpinner from 'bundles/HelloWorld/components/shared/loading_indicator';
import QuestionsAndAnswers from 'bundles/HelloWorld/containers/QuestionsAndAnswers';
import pluralize from 'pluralize';
import request from 'request';
import getAuthToken from 'bundles/HelloWorld/components/modules/get_auth_token';

export default React.createClass({
  propTypes: {
    route: React.PropTypes.shape({
      adminId: React.PropTypes.number.isRequired,
    }),
  },

  getInitialState() {
    return {
      loading: true,
      model: {
        teachers: [],
      },
      newTeacher: {
        first_name: null,
        last_name: null,
        email: null,
      },
    };
  },

  componentDidMount() {
    this.getData()
  },

  getData() {
    $.ajax({
      url: `/admins/${this.props.route.adminId}`,
      success: this.receiveData,
    });
  },

  receiveData(data) {
    this.setState({ model: data, loading: false, });
  },

  addTeacherAccount(data) {
    const that = this
    that.setState({message: '', error: ''})
    data.authenticity_token = getAuthToken()
    request.post(`${process.env.DEFAULT_URL}/admins/${that.props.id}/teachers`, {
      json: data
    },
    (e, r, response) => {
      if (response.error) {
        that.setState({error: response.error})
      } else if (r.statusCode === 200){
        that.setState({message: response.message}, () => that.getData())
      } else {
        console.log(response)
      }
    })
  },

  render() {
    if (!this.state.loading) {
      return (
        <div >
          <div className="sub-container">
            <PremiumFeatures/>
            <AdminsTeachers
              isValid={!!this.state.model.valid_subscription}
              data={this.state.model.teachers}
            />
            <CreateNewAccounts
              schools={this.state.model.schools}
              addTeacherAccount={this.addTeacherAccount}
              error={this.state.error}
              message={this.state.message}
            />
            <QuestionsAndAnswers
              questionsAndAnswersFile='admin'
              supportLink="https://support.quill.org/quill-premium"
            />
          </div>
        </div>
      );
    }
    return <LoadingSpinner />;
  },
});
