import React from 'react';
import PremiumPricingMinisRow from '../components/premium/premium_pricing_minis_row.jsx';
import TeacherTestimonial from '../components/premium/teacher_testimonial.jsx';
import SubscriberLogos from '../components/premium/subscriber_logos.jsx';
import DistrictPricingBox from '../components/premium/district_pricing_box.jsx';
import TeacherPremium from '../components/premium/teacher_premium.jsx';
import SchoolPremium from '../components/premium/school_premium.jsx';
import QuestionsAndAnswers from './QuestionsAndAnswers.jsx'

export default class PremiumPricingGuide extends React.Component {
  subscribers = () => {
    return (
    [{ name: 'Achievement first school logo', source: '/images/subscribers/1_achievement.png', id: 'achievement-first'},
       { name: 'KIPP: SF school logo', source: '/images/subscribers/2_kipp_sf.png', id: 'kipp-sf'},
       { name: 'KIPP: DC school logo', source: '/images/subscribers/3_kipp_dc.png', id: 'kipp-dc'},
       { name: 'KIPP: LA school logo', source: '/images/subscribers/4_kipp_la.png', id: 'kipp-la'},
       { name: 'Rocketship school logo', source: '/images/subscribers/5_kipp_rocketship.png', id: 'rocketship'},
       { name: 'Houston Independent School District logo', source: '/images/subscribers/6_houston.png', id: 'houston'},
       { name: 'Des Moines Public Schools logo', source: '/images/subscribers/7_desmoines.png', id: 'desmoines'},
       { name: 'Richmond Virginia Public Schools logo', source: '/images/subscribers/8_richmond.png', id: 'richmond'},
       { name: 'Putnam County Board of Education logo', source: '/images/subscribers/9_putnam.png', id: 'putnam'},
       { name: 'Elizabeth Public Schools logo', source: '/images/subscribers/10_elizabeth.png', id: 'elizabeth'},
       { name: 'North Thurston Public Schools logo', source: '/images/subscribers/11_thurston.png', id: 'thurston'},
       { name: 'Lead Public Schools logo', source: '/images/subscribers/12_lead.png', id: 'lead'},
       { name: 'Trinity Episcopal School logo', source: '/images/subscribers/13_trinity.png', id: 'trinity'},
       { name: 'Kuemper school logo', source: '/images/subscribers/14_kuemper.png', id: 'kuemper'},
       { name: 'Jordan School District logo', source: '/images/subscribers/15_jodan.png', id: 'jordan'},
       { name: 'Princeton Public Schools logo', source: '/images/subscribers/16_princeton.png', id: 'princeton'}]
    );
  };

  renderCovidBanner() {
    if (Date.now() >= Date.parse('7/31/2020')) { return }

    return (<div className="covid-premium-banner">
      <p>We&#39;re supporting schools impacted by closures by providing free Quill Premium access through the end of the 2019-20 school year (July 31, 2020)</p>
      <p>
        <a href="/subscriptions/activate_covid_subscription">Activate teacher premium</a> - <a href="https://forms.gle/ePA3C866hfKkN6BRA">Request free access to School and District Premium</a>
      </p>
    </div>)
  }

  render() {
    return (
      <div>
        <div className="container" id="premium-pricing-guide">
          <div className="overview text-center">
            <div className="header">
              <h1>Pricing Guide</h1>
              <p>Save time grading and gain actionable insights with Quill Premium.</p>
            </div>
            <PremiumPricingMinisRow {...this.props} />
            <DistrictPricingBox />
          </div>

          <div className="features text-center">
            <TeacherPremium />
            <SchoolPremium />
          </div>

          <SubscriberLogos subscribers={this.subscribers()} />
          <TeacherTestimonial />

          <QuestionsAndAnswers
            questionsAndAnswersFile="premium"
            supportLink="https://support.quill.org/quill-premium"
          />
        </div>
      </div>

    );
  }
}
