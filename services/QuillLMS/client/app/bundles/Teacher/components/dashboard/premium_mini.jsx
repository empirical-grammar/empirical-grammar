import React from 'react';
import { requestPost } from '../../../../modules/request/index.js';

export default React.createClass({

  beginTrial() {
    requestPost('/subscriptions', { subscription: { account_type: 'Teacher Trial', }, }, () => {
      window.location.assign('/teachers/progress_reports/activities_scores_by_classroom')
    })
  },

  miniBuilder() {
    return (
      <div className="premium-container ">
        <h4>Try Premium for Free</h4>
        <button className="btn btn-orange" onClick={this.beginTrial} type="button">Get Premium Free for 30 days</button>
        <p className="credit-card">No credit card required.</p>
        <p>Unlock your Premium trial to save time grading and gain actionable insights.</p>
        <a href="https://support.quill.org/quill-premium" target="_blank">Learn more about Premium</a>
      </div>
    );
  },

  render() {
    return (
      <div className={'mini_container results-overview-mini-container col-md-4 col-sm-5 text-center'}>
        <div className="mini_content">
          {this.miniBuilder()}
        </div>
      </div>);
  },
});
