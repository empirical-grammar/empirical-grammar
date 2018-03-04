import React from 'react';
import PleaseLoginModal from '../please_login_modal.jsx';
import Stripe from '../../modules/stripe/charge.js';

export default React.createClass({

    // TODO: make route for free trial that depends on if they are signed in or not, add stripe integration to free trial

  charge() {
    if (!this.props.userIsEligibleForNewSubscription) {
      alert('You have an active subscription and cannot buy premium now. If your subscription is a school subscription, you may buy Premium when it expires. If your subscription is a teacher one, please turn on recurring payments and we will renew it automatically when your subscription ends.');
    } else {
      new Stripe(8000, '$80 per Year - Teacher Premium');
    }
  },

  getInitialState() {
    return {
      isUserSignedIn: ($('#user-logged-in').data().signedIn === true),
    };
  },

  beginTrial() {
    if (!this.state.isUserSignedIn === true) {
      alert('You must be logged in to begin a free trial.');
    } else if (!this.props.userIsEligibleForTrial) {
      alert('Our records show that you have already had a subscription and are therefor not eligible for a free trial.');
    } else {
      $.post('/subscriptions', {
        subscription: {
          account_limit: 1000,
          account_type: 'Teacher Trial',
          authenticity_token: $('meta[name=csrf-token]').attr('content'),
        },
      }).success(() => {
        window.location.assign('/teachers/classrooms/scorebook');
      });
    }
  },

  pleaseLoginModal() {
    $(this.refs.pleaseLoginModal).modal();
  },

  purchaseButton() {
    if (this.state.isUserSignedIn === true) {
      return <button type="button" id="purchase-btn" data-toggle="modal" onClick={this.charge} className="btn btn-default mini-btn blue">Buy Now</button>;
    }
    return <button type="button" id="purchase-btn" onClick={() => alert('You must be logged in to purchase Quill Premium.')} className="btn btn-default mini-btn blue">Buy Now</button>;
  },

  render() {
    return (
      <div className="pricing-mini">
        <header className="pricing-mini-header blue">
          <div className="img-holder">
            <img src={`${process.env.CDN_URL}/images/shared/teacher_premium_icon.png`} alt="teacher_premium_icon" />
          </div>

          <h4>Teacher Premium</h4>
        </header>
        <section className="pricing-info">
          <div className="premium-rates">
            <h3>$80</h3>
            <h4>per year</h4>
          </div>
          <ul className="text-left">
            <li>Everything in Basic</li>
            <li>Reports on concept mastery and Common Core Standards</li>
            <li>Download and print reports</li>
            <li>Priority Support</li>
          </ul>
        </section>
        <div className="row">
          {this.purchaseButton()}
          <button type="button" className="btn btn-default mini-btn empty-blue" onClick={this.beginTrial}>Free Trial</button>
          <PleaseLoginModal ref="pleaseLoginModal" />
        </div>
      </div>
    );
  },
});
