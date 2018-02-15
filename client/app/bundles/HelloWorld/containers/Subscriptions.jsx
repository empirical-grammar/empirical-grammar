import React from 'react';
import request from 'request';
import _ from 'lodash';
import moment from 'moment';
import pluralize from 'pluralize';
import SubscriptionStatus from '../components/subscriptions/subscription_status';
import PaymentModal from '../components/subscriptions/select_credit_card_modal';
import CurrentSubscription from '../components/subscriptions/current_subscription';
import PremiumConfirmationModal from '../components/subscriptions/premium_confirmation_modal';
import getAuthToken from '../components/modules/get_auth_token';

export default class extends React.Component {

  constructor(props) {
    super(props);
    const availableAndEarnedCredits = this.availableAndEarnedCredits();
    this.state = {
      subscriptions: this.props.subscriptions,
      subscriptionStatus: this.props.subscriptionStatus,
      availableCredits: availableAndEarnedCredits.available,
      earnedCredits: availableAndEarnedCredits.earned,
      showPremiumConfirmationModal: true,
      showPurchaseModal: false,
      purchaserNameOrEmail: this.purchaserNameOrEmail(),
    };
    this.redeemPremiumCredits = this.redeemPremiumCredits.bind(this);
    this.showPremiumConfirmationModal = this.showPremiumConfirmationModal.bind(this);
    this.showPaymentModal = this.showPaymentModal.bind(this);
    this.hidePremiumConfirmationModal = this.hidePremiumConfirmationModal.bind(this);
    this.hidePaymentModal = this.hidePaymentModal.bind(this);
    this.updateSubscriptionStatus = this.updateSubscriptionStatus.bind(this);
    this.updateCard = this.updateCard.bind(this);
  }

  updateSubscriptionStatus(subscription) {
    this.setState({ subscriptionStatus: subscription, showPremiumConfirmationModal: true, showPurchaseModal: false, });
  }

  subscriptionHistoryRows() {
    const rows = [];
    this.state.subscriptions.forEach((sub) => {
      const startD = moment(sub.start_date);
      const endD = moment(sub.expiration);
      const duration = endD.diff(startD, 'months');
      const matchingTransaction = this.props.premiumCredits.find(transaction => (transaction.source_id === sub.id && transaction.source_type === 'Subscription' && transaction.amount > 0));
      if (matchingTransaction) {
        const amountCredited = matchingTransaction.amount > 6
          ? Math.round(matchingTransaction.amount / 7)
          : 1;
        rows.push(
          <tr key={`${matchingTransaction.id}-credit-subscription-table`} className="subscription-row text-center">
            <td colSpan="5">
              Your school purchased School Premium during your subscription, so we credited your account with {`${amountCredited} ${pluralize('week', amountCredited)}`} of Teacher Premium.
            </td>
          </tr>
        );
      }
      rows.push(
        <tr key={`${sub.id}-subscription-table`}>
          <td>{moment(sub.created_at).format('MMMM Do, YYYY')}</td>
          <td>{sub.account_type}</td>
          <td>{this.paymentContent(sub)}</td>
          <td>{`${duration} ${pluralize('month', duration)}`}</td>
          <td>{`${startD.format('MM/DD/YY')} - ${endD.format('MM/DD/YY')}`}</td>
        </tr>
      );
    });
    return rows;
  }

  paymentContent(subscription) {
    const currentUserId = document.getElementById('current-user-id').getAttribute('content');
    if (subscription.contact_user_id === Number(currentUserId)) {
      if (subscription.payment_amount) {
        return `$${subscription.payment_amount / 100}`;
      } else if (subscription.payment_method === 'Premium Credit') {
        return subscription.payment_method;
      }
    }
    return '--';
  }

  subscriptionHistory() {
    const subscriptionHistoryRows = this.subscriptionHistoryRows();
    let content;
    if (subscriptionHistoryRows.length > 0) {
      content = (
        <table>
          <tbody>
            <tr>
              <th>Purchase Date</th>
              <th>Subscription</th>
              <th>Payment</th>
              <th>Length</th>
              <th>Start & End Date</th>
            </tr>
            {subscriptionHistoryRows}
          </tbody>
        </table>);
    } else {
      content = (
        <div className="empty-state flex-row justify-content">
          <h3>You have not yet started a Quill Premium Subscription</h3>
          <span>Purchase Quill Premium or apply credits to get access to Premium reports.</span>
        </div>
      );
    }
    return (
      <section className="subscription-history">
        <h2>Premium Subscription History</h2>
        {content}
      </section>
    );
  }

  availableAndEarnedCredits() {
    let earned = 0;
    let spent = 0;
    this.props.premiumCredits.forEach((c) => {
      if (c.amount > 0) {
        earned += c.amount;
      } else {
        spent -= c.amount;
      }
    });
    return { earned, available: earned - spent, };
  }

  purchaserNameOrEmail() {
    const sub = (this.state && this.state.subscriptionStatus) || this.props.subscriptionStatus;
    if (!sub.contact_user_id) {
      this.setState({ purchaserNameOrEmail: sub.user_email ? sub.user_email : 'Not Recorded', });
    }
    return this.getPurchaserName();
  }

  getPurchaserName() {
    const that = this;
    const idPath = 'subscriptionStatus.id';
    const subId = _.get(that.state, idPath) || _.get(that.props, idPath);
    request.get({
      url: `${process.env.DEFAULT_URL}/subscriptions/${subId}/purchaser_name`,
    },
    (e, r, body) => {
      that.setState({ purchaserNameOrEmail: JSON.parse(body).name, });
    });
  }

  purchasePremiumButton() {
    return <button type="button" id="purchase-btn" data-toggle="modal" onClick={this.purchasePremiu} className="q-button button cta-button bg-orange text-white">Update Card</button>;
  }

  premiumCreditsTable() {
    const creditRows = this.props.premiumCredits.map((credit) => {
      // if it is less than one week, we round up to 1
      const amountCredited = credit.amount > 6
        ? Math.round(credit.amount / 7)
        : 1;
      return (
        <tr key={`credit-${credit.id}-premium-credit-table`}>
          <td className="date-received">{moment(credit.created_at).format('MMMM Do, YYYY')}</td>
          <td className="amount-credited">{`${amountCredited} ${pluralize('week', amountCredited)}`}</td>
          <td className="action">{credit.action || 'Lorem ipsum dolor sit amet, consectetur adipisicing elit!'}</td>
        </tr>
      );
    });
    return (
      <table className="premium-credits-table">
        <tbody>
          <tr>
            <th>Date Received</th>
            <th>Amount Credited</th>
            <th>Action</th>
          </tr>
          {creditRows}
        </tbody>
      </table>
    );
  }

  currentSubscription(newSub) {
    if (!this.state.subscriptionStatus || this.state.subscriptionStatus.expired) {
      return newSub;
    }
    return this.state.subscriptionStatus;
  }

  redeemPremiumCredits() {
    request.put({
      url: `${process.env.DEFAULT_URL}/credit_transactions/redeem_credits_for_premium`,
      json: {
        authenticity_token: getAuthToken(),
      },
    }, (error, httpStatus, body) => {
      if (body.error) {
        alert(body.error);
      } else {
        this.setState({
          subscriptions: [body.subscription].concat(this.state.subscriptions),
          subscriptionStatus: this.currentSubscription(body.subscription),
          availableCredits: 0,
          showPremiumConfirmationModal: true,
        });
      }
    });
  }

  availableCredits() {
    let button;
    if (this.state.availableCredits > 0) {
      button = <button onClick={this.redeemPremiumCredits} className="q-button cta-button bg-orange has-credit">Redeem Premium Credits</button>;
    } else {
      button = <a href="/" className="q-button button cta-button bg-orange">Earn Premium Credits</a>;
    }
    const monthsOfCredit = Math.round((this.state.availableCredits / 30.42) * 10) / 10;
    const whiteIfNoCredit = monthsOfCredit === 0 ? 'no-credits' : null;
    return (
      <div className={`${whiteIfNoCredit} available-credit flex-row vertically-centered space-between`}>
        <div className="credit-quantity">
          You have <span>{`${monthsOfCredit} ${pluralize('month', monthsOfCredit)} `}</span> of Teacher Premium Credit available.
        </div>
        {button}
      </div>
    );
  }

  premiumCredits() {
    if (!this.props.premiumCredits || this.props.premiumCredits < 1) {
      return this.availableCredits();
    }
    const monthsOfCredit = Math.round(((this.state.earnedCredits / 30.42) * 10) / 10);
    return (
      <section>
        <div className="flex-row space-between">
          <h2>Quill Teacher Premium Credits</h2>
          <a className="green-link" href="">How to earn more Premium credit</a>
        </div>
        {this.availableCredits()}
        {this.premiumCreditsTable()}
        <span className="total-premium-credits"><span className="total-header">Total Premium Credits Earned:</span> {`${monthsOfCredit} ${pluralize('month', monthsOfCredit)}`}</span>
      </section>
    );
  }

  updateCard() {
    this.showPaymentModal();
  }

  showPremiumConfirmationModal() {
    this.setState({ showPremiumConfirmationModal: true, });
  }

  hidePremiumConfirmationModal() {
    this.setState({ showPremiumConfirmationModal: false, });
  }

  showPaymentModal() {
    this.setState({ showPaymentModal: true, });
  }

  hidePaymentModal() {
    this.setState({ showPaymentModal: false, });
  }

  render() {
    return (
      <div>
        <SubscriptionStatus key={`${_.get(this.state.subscriptionStatus, 'subscriptionStatus.id')}-subscription-status-id`} subscriptionStatus={this.state.subscriptionStatus} trialSubscriptionTypes={this.props.trialSubscriptionTypes} schoolSubscriptionTypes={this.props.schoolSubscriptionTypes} />
        <CurrentSubscription
          purchaserNameOrEmail={this.state.purchaserNameOrEmail}
          subscriptionStatus={this.state.subscriptionStatus}
          lastFour={this.props.lastFour}
        />
        {this.subscriptionHistory()}
        {this.premiumCredits()}
        <section className="refund-policy">
          <h2>Refund Policy</h2>
          <p>
            If you purchase a Teacher Premium subscription, and then your school purchases a School Premium subscription, you will be refunded the remainder of your Teacher Premium as Quill Premium Credit. You can redeem your Premium Credit anytime you do not currently have an active subscription, and you will be resubscribed to Quill Premium for the amount of time you have in credit. If you would like to receive a full refund there is a grace period of 5 days from the day of the renewal.
          </p>
        </section>
        <PremiumConfirmationModal show={this.state.showPremiumConfirmationModal} hideModal={this.hidePremiumConfirmationModal} subscription={this.state.subscriptionStatus} />
        <PaymentModal show={this.state.showPaymentModal} hideModal={this.hidePaymentModal} lastFour={this.props.lastFour} updateSubscriptionStatus={this.updateSubscriptionStatus} />

      </div>
    );
  }
}
