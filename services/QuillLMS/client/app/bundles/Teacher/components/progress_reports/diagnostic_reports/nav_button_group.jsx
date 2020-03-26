'use strict'

import React from 'react'

require('../../../../../assets/styles/app-variables.scss')

export default class NavButtonGroup extends React.Component {
    constructor(props) {
        super(props)

        this.state = { activityWithRecommendationsIds: [] };
    }

    componentDidMount() {
      fetch(`${process.env.DEFAULT_URL}/teachers/progress_reports/activity_with_recommendations_ids`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      }).then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      }).then((response) => {
        this.setState({ activityWithRecommendationsIds: response.activityWithRecommendationsIds })
      }).catch((error) => {
        // to do, use Sentry to capture error
      })
    }

    buttonBuilder = name => {
		return () => {
			this.props.clickCallback(name.toLowerCase())
		}
	};

  buttons = () => {
		const contents = [
			{name: 'Students', words: ['student_report', 'students'], exceptions: []},
			{name: 'Questions', words:['questions']},
			{name: 'Recommendations', words: ['recommendations']}
		];
		let hash = window.location.hash
		return contents.map((navButton)=>	{
			let activeState;
			// If there is a <student_></student_>id, then the student button will visible/highlighted
			// If there is not a student_id, then we can determine our view from the block below
			if (!this.props.params.studentId) {
				let words = navButton.words;
				// if the url has button in it, we mark it as active
				for (var i = 0; i < words.length; i++) {
					if (hash.includes(words[i])) {
						activeState = 'active-true'
						break;
					}
				}
			}
			let name = navButton.name
			if (name === 'Recommendations' && this.doesNotHaveRecommendations()) {
				// don't show recommendations unless it is a diagnostic
				return
			} else {
				return <button className={`btn btn-secondary ${activeState}`} key={name} onClick={this.buttonBuilder(name)} type="button">{name}</button>
			}
		})
	};

  doesNotHaveRecommendations = () => {
		return this.state.activityWithRecommendationsIds.indexOf(Number(this.props.params.activityId)) === -1;
	};

    render() {
		return (
  <div aria-label="Basic example" className="btn-group" id='report-button-group' role="group">
    {this.buttons()}
  </div>
		);
	}
};
