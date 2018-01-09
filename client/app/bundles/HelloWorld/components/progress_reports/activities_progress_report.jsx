"use strict";
import React from 'react'
import request from 'request'
import ReactTable from 'react-table'
import moment from 'moment'
import ProgressReportFilters from './progress_report_filters.jsx'
import 'react-table/react-table.css'
import LoadingSpinner from '../shared/loading_indicator.jsx'
import TableFilterMixin from '../general_components/table/sortable_table/table_filter_mixin'

export default React.createClass({
  mixins: [TableFilterMixin],

  propTypes: {
    sourceUrl: React.PropTypes.string.isRequired,
    premiumStatus: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    return {
      loadingFilterOptions: true,
      currentPage: 0,
      csvData: [],
      currentSort: {},
      premium: false
    }
  },

  componentDidMount: function() {
    this.fetchData();
  },

  requestParams: function() {
    let params = Object.assign({},
      { page: this.state.currentPage + 1 },
      this.state.currentFilters,
      this.state.currentSort
    );

    if(this.state.filtersLoaded) {
      params = Object.assign(params, {without_filters: true});
    }

    return params;
  },

  fetchData: function() {
    this.setState({ loadingNewTableData: true });
    const that = this;
    request.get({
      url: `${process.env.DEFAULT_URL}/teachers/progress_reports/activity_sessions.json`,
      qs: this.requestParams()
    }, (e, r, body) => {
      const data = JSON.parse(body);
      let newState = {
        loadingFilterOptions: false,
        loadingNewTableData: false,
        results: data.activity_sessions,
        numPages: data.page_count,
      };

      if(!this.state.filtersLoaded) {
        newState = Object.assign(newState, {
          classroomFilters: this.getFilterOptions(data.classrooms, 'name', 'id', 'All Classes'),
          studentFilters: this.getFilterOptions(data.students, 'name', 'id', 'All Students'),
          unitFilters: this.getFilterOptions(data.units, 'name', 'id', 'All Activity Packs'),
          filtersLoaded: true
        });
      }

      that.setState(newState, () => {
        this.setState({
          selectedClassroom: this.state.selectedClassroom || this.state.classroomFilters[0],
          selectedStudent: this.state.selectedStudent || this.state.studentFilters[0],
          selectedUnit: this.state.selectedUnit || this.state.unitFilters[0]
        })
      });
    });
  },

  columnDefinitions: function() {
    // Student, Date, Activity, Score, Standard, Tool
    return [
      {
        Header: 'Student',
        accessor: 'student_id',
        resizeable: false,
        Cell: props => this.state.studentFilters.find(student => student.value == props.value).name,
        className: this.nonPremiumBlur()
      },
      {
        Header: 'Date',
        accessor: 'completed_at',
        resizeable: false,
        Cell: props => moment.unix(Number(props.value)).format('M/D/YY'),
        maxWidth: 90
      },
      {
        Header: 'Activity',
        accessor: 'activity_name',
        resizeable: false,
        Cell: props => props.value
      },
      {
        Header: 'Score',
        accessor: 'percentage',
        resizeable: false,
        Cell: props => props.value >= 0 ? `${Math.round(props.value * 100)}%` : 'Completed',
        className: this.nonPremiumBlur(),
        maxWidth: 90
      },
      {
        Header: 'Standard',
        accessor: 'standard',
        resizeable: false,
        Cell: props => props.value.split(' ')[0],
        maxWidth: 90
      },
      {
        Header: 'Tool',
        accessor: 'activity_classification_name',
        resizeable: false,
        Cell: props => props.value,
        maxWidth: 150
      }
    ];
  },

  selectClassroom: function(classroom) {
    this.setState({ selectedClassroom: classroom, });
    this.filterByField('classroom_id', classroom.value, this.onFilterChange);
  },

  selectStudent: function(student) {
    this.setState({ selectedStudent: student, });
    this.filterByField('student_id', student.value, this.onFilterChange);
  },

  selectUnit: function(unit) {
    this.setState({ selectedUnit: unit, });
    this.filterByField('unit_id', unit.value, this.onFilterChange);
  },

  onFilterChange: function() {
    this.setState({loading: true, currentPage: 0}, this.fetchData);
  },

  reactTableSortedChange: function(state, instance) {
    this.setState({
      // We want to revert to the first page if changing anything other than the page.
      currentPage: 0,
      currentSort: {
        sort_param: state[0].id,
        sort_descending: state[0].desc,
      }
    }, this.fetchData);
  },

  reactTablePageChange: function(state, instance) {
    this.setState({
      currentPage: state,
    }, this.fetchData);
  },

  tableOrEmptyMessage: function(){
    let tableOrEmptyMessage
    if (this.state.results.length) {
      tableOrEmptyMessage = <ReactTable
              loading={this.state.loadingNewTableData}
              data={this.state.results}
              columns={this.columnDefinitions()}
              showPagination={true}
              defaultSorted={[{id: 'completed_at', desc: true}]}
              showPaginationTop={false}
              showPaginationBottom={true}
              showPageSizeOptions={false}
              defaultPageSize={Math.min(this.state.results.length, 25)}
              resizable={false}
              className='progress-report'
              manual={true}
              pages={this.state.numPages}
              page={this.state.currentPage}
              onPageChange={this.reactTablePageChange}
              onSortedChange={this.reactTableSortedChange}
            />
      } else {
        tableOrEmptyMessage = <h3>No Results to Report</h3>
      }
      return (
        <div>
          <ProgressReportFilters
            classroomFilters={this.state.classroomFilters}
            studentFilters={this.state.studentFilters}
            unitFilters={this.state.unitFilters}
            selectClassroom={this.selectClassroom}
            selectedClassroom={this.state.selectedClassroom}
            selectStudent={this.selectStudent}
            selectedStudent={this.state.selectedStudent}
            selectUnit={this.selectUnit}
            selectedUnit={this.state.selectedUnit}
            filterTypes={['unit', 'classroom', 'student']}
            />
          {tableOrEmptyMessage}
        </div>
      )
  },

  renderFiltersAndTable: function() {
    if(this.state.loadingFilterOptions) {
      return <LoadingSpinner />
    }
    return (this.tableOrEmptyMessage())
  },


  nonPremiumBlur: function() {
    return this.props.premiumStatus == 'paid' ? '' : 'non-premium-blur';
  },

  downloadReport: function() {
    if(this.props.premiumStatus == 'paid') {
      return window.open('/teachers/progress_reports/activity_sessions.csv');
    }
    alert('Downloadable reports are a Premium feature. You can visit Quill.org/premium to upgrade now!');
  },

  render: function() {
    return (
      <div className='progress-reports-2018'>
        <div className='meta-overview flex-row space-between'>
          <div className='header-and-info'>
            <h1>Data Export</h1>
            <p>You can export the data as a CSV file by filtering for the classrooms, activity packs, or students you would like to export and then pressing "Download Report."</p>
          </div>
          <div className='csv-and-how-we-grade'>
            <button style={{display: 'block'}} className='btn button-green' onClick={this.downloadReport}>Download Report</button>
            <a className='how-we-grade' href="https://support.quill.org/activities-implementation/how-does-grading-work">How We Grade<i className="fa fa-long-arrow-right" /></a>
          </div>
        </div>
        {this.renderFiltersAndTable()}
      </div>
    );
  }
});
