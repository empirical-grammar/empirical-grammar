import React from 'react';
import request from 'request'
import { SegmentAnalytics, Events } from '../../../../../modules/analytics';
import getAuthToken from '../../modules/get_auth_token';
import { Card } from 'quill-component-library/dist/componentLibrary'

const homeSchoolSrc = `${process.env.CDN_URL}/images/onboarding/home-building.svg`
const internationalSrc = `${process.env.CDN_URL}/images/onboarding/globe.svg`
const higherEdSrc = `${process.env.CDN_URL}/images/onboarding/school-campus.svg`
const otherSrc = `${process.env.CDN_URL}/images/onboarding/business-building.svg`

class SelectUSNonK12 extends React.Component {
  componentDidMount() {
    document.title = 'Quill.org | Teacher Sign Up | School Type'
  }

  handleClickHomeSchool = () => this.selectSchool('home school')

  handleClickInternational = () => this.selectSchool('international')

  handleClickOther = () => this.selectSchool('other')

  handleClickUSHigherEd = () => this.selectSchool('us higher ed')

  selectSchool(idOrType) {
    SegmentAnalytics.track(Events.CLICK_CHOOSE_SCHOOL_TYPE, {schoolType: idOrType});
    request({
      url: `${process.env.DEFAULT_URL}/select_school`,
      json: {
        school_id_or_type: idOrType,
        authenticity_token: getAuthToken(),
      },
      method: 'PUT',
    },
    (err, httpResponse, body) => {
      if (httpResponse.statusCode === 200) {
        window.location = '/profile'
      } else {
        // to do, use Sentry to capture error
      }
    });
  }

  render() {
    return (
      <div className="container account-form select-non-k12">
        <h1>Where do you teach?</h1>
        <div className="quill-cards">
          <Card
            header="Home school"
            imgAlt="home"
            imgSrc={homeSchoolSrc}
            onClick={this.handleClickHomeSchool}
            text="Tip: many home school teachers begin by assigning our Starter&nbsp;Diagnostic."
          />
          <Card
            header="International institution"
            imgAlt="globe"
            imgSrc={internationalSrc}
            onClick={this.handleClickInternational}
            text="Tip: many international teachers begin by assigning our ELL&nbsp;Diagnostic."
          />
          <Card
            header="U.S. higher education institution"
            imgAlt="college campus"
            imgSrc={higherEdSrc}
            onClick={this.handleClickUSHigherEd}
            text="Tip: many of our higher education educators begin by assigning our Quill Connect sentence combining&nbsp;activities."
          />
          <Card
            header="Other"
            imgAlt="office building"
            imgSrc={otherSrc}
            onClick={this.handleClickOther}
            text="Tip: many non-traditional educators and learners begin by assigning our featured activity packs."
          />
        </div>
      </div>
    )
  }
}

export default SelectUSNonK12
