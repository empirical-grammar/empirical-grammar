import React from 'react';
import QuoteRequestModal from '../quote_request_modal.jsx';

const SchoolPricingMini = ({
  showPurchaseModal,
  userBelongsToSchoolThatHasPaid,
  userIsSignedIn,
  userHasSchool,
  userIsEligibleForNewSubscription,
}) => {
  let onClickEvent = showPurchaseModal;
  let savingsCopy = 'Get 50% off for the first year!';
  if (userBelongsToSchoolThatHasPaid) {
    savingsCopy = 'Renew Now And Receive 50% Off!';
  }
  if (!userIsSignedIn) {
    onClickEvent = () => alert('You must be logged in to activate Premium.');
  } else if (!userHasSchool) {
    onClickEvent = () => alert('You must add a school before buying School Premium. You can do so by visiting Quill.org/teachers/my_account');
  } else if (!userIsEligibleForNewSubscription) {
    onClickEvent = () => alert('You have an active subscription and cannot buy premium now. You may buy a new Premium subscription when your current subscription expires.');
  }
  return (
    <div className="pricing-mini">
      <div className="promo-tab">{savingsCopy}</div>
      <div className="placeholder-div">
        <div className="promo-tab">{savingsCopy}</div>
      </div>
      <header className="pricing-mini-header purple">
        <div className="img-holder">
          <img alt="teacher_premium_icon" src={`${process.env.CDN_URL}/images/shared/school_premium_icon.png`} />
        </div>
        <h4>School Premium</h4>
      </header>
      <section className="pricing-info">
        <div className="premium-rates">
          <h3>
            <span>
              $1800
            </span>
          </h3>
          <h4>per year</h4>
        </div>
        <ul>
          <li>Everything in Teacher Premium</li>
          <li>Dedicated representative to ensure a successful onboarding experience</li>
          <li>Professional Development Sessions</li>
          <li>Administrator dashboard for school-<br />
        wide reports
          </li>
        </ul>
      </section>
      <button className="btn btn-default mini-btn purple" onClick={onClickEvent} type="button">Purchase</button>
      <a href="https://quill-partnerships.youcanbook.me/" rel="noopener noreferrer" target="_blank"><button className="btn btn-default mini-btn empty-purple" type="button">Schedule Demo</button></a>
    </div>
  );
}

export default SchoolPricingMini
