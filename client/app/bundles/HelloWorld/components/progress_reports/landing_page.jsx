import React from 'react'
import GenericMini from '../shared/generic_mini.jsx'

export default React.createClass({

	getDefaultProps: function(){
		{flag: null}
	},

	miniList: function() {
		return [
			{
				title: 'Visual Overview',
				href: '/teachers/classrooms/scorebook',
				img: '/images/visual_overview.svg',
				bodyText: 'Quickly see which activities your students have completed with color coded icons that show level of proficiency.',
				flag: null
			}, {
				title: 'Activity Analysis',
				href: '/teachers/progress_reports/diagnostic_reports#/activity_packs',
				img: '/images/activity_analysis.svg',
				bodyText: 'See how students responded to each question and get a clear analysis of the skills they demonstrated.',
				flag: 'beta'
			}, {
				title: 'Diagnostic',
				href: '/teachers/progress_reports/diagnostic_report',
				img: '/images/diagnostic.svg',
				bodyText: 'View the results of the diagnostic, and get a personalized learning plan with recommended activities.',
				flag: 'beta'
			}, {
				title: 'List Overview',
				premium: true,
				href: '/teachers/progress_reports/activity_sessions',
				img: '/images/list_overview.svg',
				bodyText: 'Get the big picture of how your students are performing with the list view. Easily download the reports as a CSV.',
				flag: null
			}, {
				title: 'Concepts',
				premium: true,
				href: '/teachers/progress_reports/concepts/students',
				img: '/images/concepts.svg',
				bodyText: 'View an overall summary of how each of your students is performing on all of the  grammar concepts.',
				flag: null
			}, {
				title: 'Common Core Standards',
				premium: true,
				href: '/teachers/progress_reports/standards/classrooms',
				img: '/images/common_core.svg',
				bodyText: 'Following the Common Core? Check this view to see how your students are performing on specific standards.',
				flag: null
			}
		]
	},

	miniBuilder: function(mini) {
		const premium = mini.premium ?  <h4 className='premium'>Premium<i className="fa fa-star" aria-hidden="true"></i></h4> : null
		return (
			<GenericMini key={mini.title}>
				<a href={mini.href}>
					<h3>{mini.title}</h3>
					{premium}
					<div className="img-wrapper">
						<img src={mini.img}/>
					</div>
					<p>{mini.bodyText}</p>
				</a>
			</GenericMini>
		)
	},

	minis: function() {
		let minisArr = [];
		this.miniList().forEach((mini) => {
			debugger;
			// if the flag isn't mini or beta we always want to display it
			if (['beta','alpha'].indexOf(mini.flag) ===  -1) {
				minisArr.push(this.miniBuilder(mini))
			// if the flag is beta only show to beta/alpha users
		} else if (mini.flag === 'beta' && this.props.flag === ('beta' || 'alpha')) {
				minisArr.push(this.miniBuilder(mini))
			// if the flag is alpha, only show to alpha users
			} else if (mini.flag === 'alpha' && this.props.flag === 'alpha') {
				minisArr.push(this.miniBuilder(mini))
			}
		})
		return minisArr;
	},

	render: function() {
		return (
			<div className="progress-reports-landing-page">
				<div className="generic-mini-container">
					<h1>Choose which type of report you’d like to see:</h1>
					<div className='generic-minis'>{this.minis()}</div>
				</div>
			</div>
		);
	}
})
