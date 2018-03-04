import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import UpdateStripeCard from '../modules/stripe/update_card.js';
import getAuthToken from '../modules/get_auth_token';
import LoadingIndicator from '../shared/loading_indicator.jsx';
import request from 'request';

export default class extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      extantCardSelected: false,
      changeCardSelected: false,
      last4: this.props.lastFour,
    };
    this.toggleChangeCard = this.toggleChangeCard.bind(this);
    this.toggleExtantCard = this.toggleExtantCard.bind(this);
    this.updateLastFour = this.updateLastFour.bind(this);
    this.stripeCharge = this.stripeCharge.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  updateLastFour(newLastFour) {
    this.setState({ last4: newLastFour, extantCardSelected: true, changeCardSelected: false, });
  }

  toggleChangeCard() {
    this.setState({ extantCardSelected: false, changeCardSelected: !this.state.changeCardSelected, },
        () => {
          if (this.state.changeCardSelected) {
            new UpdateStripeCard(this.updateLastFour);
          }
        }
    );
  }

  toggleExtantCard() {
    this.setState({ extantCardSelected: !this.state.extantCardSelected, changeCardSelected: false, });
  }

  showBuyNowIfChargeSelection() {
    if (this.state.extantCardSelected) {
      return <button className="button q-button button-green cta-button" onClick={this.stripeCharge}>Buy Now</button>;
    }
  }

  stripeCharge() {
    const that = this;
    request.post({ url: `${process.env.DEFAULT_URL}/charges/new_${this.props.type}_premium`, form: { authenticity_token: getAuthToken(), }, }, (err, httpResponse, body) => {
      if (httpResponse.statusCode === 200) {
        that.props.updateSubscriptionStatus(JSON.parse(body).new_subscription);
      }
    });
  }

  loadingOrButtons() {
    return ([
      <button key="extant" onClick={this.toggleExtantCard} className={`extant-card ${this.state.extantCardSelected ? 'selected' : ''}`}>Credit Card ending with {this.state.last4}</button>,
      <button key="change" onClick={this.toggleChangeCard} className={this.state.extantCardSelected ? 'selected' : ''}>Use a Different Card</button>
    ]);
  }

  hideModal() {
    if (this.props.setCreditCardToFalse) {
      this.props.setCreditCardToFalse();
    }
    this.props.hideModal();
  }

  render() {
    return (
      <Modal {...this.props} show={this.props.show} onHide={this.props.hideModal} dialogClassName="select-credit-card-modal" restoreFocus>
        <Modal.Body>
          <img className="pull-right react-bootstrap-close" onClick={this.hideModal} src={`${process.env.CDN_URL}/images/shared/close_x.svg`} alt="close-modal" />
          <div className="pricing-info text-center">
            <h1>Quill {this.props.type} Premium</h1>
            <span>${this.props.price} for one-year subscription</span>
          </div>
          <h2 className="q-h2">Which credit card would you like to pay with?</h2>
          {this.loadingOrButtons()}
          {this.showBuyNowIfChargeSelection()}
        </Modal.Body>
      </Modal>
    );
  }
}
