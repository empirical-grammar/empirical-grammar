import React from 'react';
import moment from 'moment';
import pluralize from 'pluralize';

export default class extends React.Component {
  getModalContent = () => {
    const { subscription } = this.props
    const { account_type, expiration, start_date } = subscription
    const startD = moment(start_date);
    const endD = moment(expiration);
    const duration = endD.diff(startD, 'days');
    if (account_type === 'Premium Credit') {
      return <p key="subscription-p">You have redeemed your {duration} {pluralize('day', duration)} of Quill Premium Credit. Your Teacher Premium is valid until <strong>{moment(endD).format('MMMM Do, YYYY')}</strong>. You can view your subscription information or purchase a Teacher or a School Premium at any point on your subscription page.</p>;
    }
    return this.paymentCopy(startD, endD, duration);
  };

  paymentCopy = (startD, endD) => {
    const { subscriptionType} = this.props
    return (
      <span>
        We have received your payment. You will receive an email shortly with your receipt. Your {subscriptionType} Premium is valid until <strong>{moment(endD).format('MMMM Do, YYYY')}</strong>. Your subscription will auto-renew {moment(endD).format('MMMM Do, YYYY')}. You can review your subscription information and modify your renewal settings on the subscription page.
      </span>
    );
  };

  handleKeyPress = (e) => {
    const { hideModal } = this.props
    if(e.key === "Enter") {
      hideModal()
    }
  }

  render() {
    const { hideModal, show, subscription } = this.props
    if (!subscription || !show) {
      // this will never show with no subscription, but is on the page (with display none)
      return <span />;
    }
    const content = this.getModalContent();
    const { account_type } = subscription
    return (
      <div className="premium-confirmation">
        <div className="modal-background" />
        <div className="modal-content">
          <img alt="close-modal" className="pull-right modal-button-close" onClick={hideModal} onKeyPress={this.handleKeyPress} src={`${process.env.CDN_URL}/images/shared/close_x.svg`} />
          <h1>Congratulations!</h1>
          <h2 id="subscription-type">You have a {account_type} Subscription</h2>
          {content}
          <a className="q-button button cta-button bg-orange text-white view-premium-reports" href="/teachers/progress_reports/activities_scores_by_classroom" id="view-premium-reports-button">View Premium Reports</a>
        </div>
      </div>
    )
  }
}
