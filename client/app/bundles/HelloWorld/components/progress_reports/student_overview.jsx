import React from 'react'
import request from 'request'
import CSVDownloadForProgressReport from './csv_download_for_progress_report.jsx'
import getParameterByName from '../modules/get_parameter_by_name'
import LoadingSpinner from '../shared/loading_indicator.jsx'
import StudentOveriewTable from './student_overview_table.jsx'
import moment from 'moment'
import notLessonsOrDiagnostic from '../../../../modules/activity_classifications.js'

export default class extends React.Component {

	constructor(){
		super()
    this.state = {
      loading: true,
      errors: false,
    }
		this.calculateCountAndAverage = this.calculateCountAndAverage.bind(this)
	}

  componentDidMount(){
    const that = this;
		const classroomId = getParameterByName('classroom_id', window.location.href)
		const studentId = getParameterByName('student_id', window.location.href)
    request.get({
      url: `${process.env.DEFAULT_URL}/api/v1/progress_reports/student_overview_data/${studentId}/${classroomId}`,
    },
    (e, r, body) => {
      const data = JSON.parse(body)
      that.setState({loading: false, errors: body.errors, studentData: data.student_data, reportData: data.report_data, classroomName: data.classroom_name});
    });
  }

	grayAndYellowStat(grayContent,yellowContent, optionalClassName){
		return (<td className={optionalClassName}>
			<div className='gray-text'>{grayContent}</div>
			<div className='yellow-text'>{yellowContent}</div>
		</td>)
	}

	calculateCountAndAverage(){
		let count = 0;
		let cumulativeScore = 0;
		let countForAverage = 0;
		let average;
		this.state.reportData.forEach((row) => {
			if (row.percentage) {
				count += 1;
				if (notLessonsOrDiagnostic(row.activity_classification_id)) {
					cumulativeScore += parseFloat(row.percentage);
					countForAverage += 1;
				}
			}
		})
		if (countForAverage > 0) {
			average = Math.round((cumulativeScore / countForAverage) * 100) + '%'
		}
		return {count, average}
	}

	studentOverviewSection(){
		let countAndAverage, lastActive, downloadReportOrLoadingIndicator
		if (this.state.reportData) {
			countAndAverage = this.calculateCountAndAverage()
			downloadReportOrLoadingIndicator = <CSVDownloadForProgressReport data={this.state.reportData}/>
		} else {
			downloadReportOrLoadingIndicator = <LoadingSpinner/>
		}
		if (this.state.studentData.last_active) {
			lastActive = moment(this.state.studentData.last_active).format("MM/DD/YYYY")
		}
		return (
		 <table className='overview-header-table'>
			 <tbody>
				 <tr className='top'>
					 <td className='student-name'>
						 {this.state.studentData.name}
					 </td>
					 {this.grayAndYellowStat('Class', this.state.classroomName)}
					 <td className='csv-link'>
						 {downloadReportOrLoadingIndicator}
					 </td>
				 </tr>
				 <tr className='bottom'>
					 {this.grayAndYellowStat('Overall Score:', countAndAverage.average || '--')}
					 {this.grayAndYellowStat('Activities Completed:', countAndAverage.count || '--')}
					 {this.grayAndYellowStat('Last Active:', lastActive || '--', 'last-active' )}
				 </tr>
			 </tbody>
		</table>)
	}

	render() {
    let errors
    if (this.state.errors) {
      errors = <div className='errors'>{this.state.errors}</div>
    }
    if (this.state.loading) {
      return <LoadingSpinner/>
    }
    return (
    <div id='student-overview'>
			<a href="/teachers/progress_reports/activities_scores_by_classroom" className='navigate-back'><img src="https://assets.quill.org/images/icons/chevron-dark-green.svg" alt=""/>Back to Activity Scores</a>
			{this.studentOverviewSection()}
			<StudentOveriewTable reportData={this.state.reportData} studentId={this.state.studentData.id} calculateCountAndAverage={this.calculateCountAndAverage}/>
    </div>
  	)}

}
