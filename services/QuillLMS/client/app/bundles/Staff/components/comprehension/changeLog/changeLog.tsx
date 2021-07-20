import * as React from "react";
import * as _ from 'underscore';
import { RouteComponentProps } from 'react-router-dom'
import { useQuery } from 'react-query';
import { firstBy } from "thenby";
import ReactTable from 'react-table';
import qs from 'qs';
import * as _ from 'lodash'
import DateTimePicker from 'react-datetime-picker';

import { sort } from '../../../../../modules/sortingMethods.js';
import { fetchChangeLog } from '../../../utils/comprehension/activityAPIs';
import { DropdownInput, Spinner, } from '../../../../Shared/index';

interface ChangeLogProps {

}

const ChangeLog = ({ history, match }) => {
  const { params } = match;
  const { activityId, } = params;
  const SESSION_INDEX=1;
  const initialStartDateString = window.sessionStorage.getItem(`${SESSION_INDEX}startDate`) || '';
  const initialEndDateString = window.sessionStorage.getItem(`${SESSION_INDEX}endDate`) || '';
  const initialStartDate = initialStartDateString ? new Date(initialStartDateString) : null;
  const initialEndDate = initialEndDateString ? new Date(initialEndDateString) : null;

  const [searchInput, setSearchInput] = React.useState<string>('');
  const [prompt, setPrompt] = React.useState<string>('all');
  const [rule, setRule] = React.useState<string>('all');
  const [startDate, onStartDateChange] = React.useState<Date>(initialStartDate);
  const [endDate, onEndDateChange] = React.useState<Date>(initialEndDate);

  // get cached activity data to pass to rule
  const { data: changeLogData, status: status } = useQuery({
    queryKey: [`activity-${activityId}`, activityId],
    queryFn: fetchChangeLog
  });

  function handleSearch(e) {
    setSearchInput(e.target.value)
  }

  function handlePromptChange(e) {
    console.log("prompt changed")
    setPrompt(e.target.value)
  }

  function handleRuleChange(e) {
    setRule(e.target.value)
  }

  const promptDropdown = (
    <div style={{width: '150px', padding: '10px'}}>
      <p className="control" >
        <span className="select">
          <select defaultValue='all' onChange={handlePromptChange}>
            <option value="all">All Prompts</option>
            <option value="because">because</option>
            <option value="but">but</option>
            <option value="so">so</option>
          </select>
        </span>
      </p>
    </div>
  )

  const formattedRows = changeLogData && changeLogData.changeLogs && changeLogData.changeLogs.map(log => {
    const {
      action,
      changed_record_id,
      updated_local_time,
      previous_value,
      new_value,
      record_type_display_name,
      user,
      explanation,
      conjunction,
      name,
      changed_attribute
    } = log;

    const changedRecord = `${record_type_display_name} - ${changed_record_id}`
    const actionLink = explanation && JSON.parse(explanation).url
    const prompt = explanation && JSON.parse(explanation).conjunction

    return {
      action: action,
      changedRecord: changedRecord,
      previousValue: previous_value,
      newValue: new_value,
      author: user,
      dateTime: updated_local_time,
      actionLink: actionLink,
      prompt: prompt,
      conjunction: conjunction,
      name: name,
      changedAttribute: changed_attribute
    }
  })

  const filteredRows = formattedRows && formattedRows.filter(value => {
    return (value.action.toLowerCase().includes(searchInput.toLowerCase()) ||
    (value.previousValue && value.previousValue.toLowerCase().includes(searchInput.toLowerCase())) ||
    (value.newValue && value.newValue.toLowerCase().includes(searchInput.toLowerCase())))
  }).filter(value => {
    return prompt === 'all' || value.conjunction === prompt
  }).filter(value => {
    return rule === 'all' || value.name === rule
  }).filter(value => {
    if (startDate == null && endDate == null) return true
    if (startDate == null) return Date.parse(value.dateTime) <= Date.parse(endDate.toString())
    if (endDate == null) return Date.parse(startDate.toString()) <= Date.parse(value.dateTime)
    return Date.parse(startDate.toString()) <= Date.parse(value.dateTime) && Date.parse(value.dateTime) <= Date.parse(endDate.toString())
  })

  const dataTableFields = [
    {
      Header: 'Date/Time',
      accessor: "dateTime",
      key: "dateTime",
      sortMethod: sort,
      width: 160,
    },
    {
      Header: 'Action',
      accessor: "action",
      sortMethod: sort,
      width: 160,
      Cell: cell => (<a href={cell.original.actionLink} rel="noopener noreferrer" target="_blank">{cell.original.action}</a>)
    },
    {
      Header: 'Rule/Model Name',
      accessor: "name",
      key: "name",
      sortMethod: sort,
      width: 160,
    },
    {
      Header: 'Prompt',
      accessor: "conjunction",
      key: "conjunction",
      sortMethod: sort,
      width: 160,
    },
    {
      Header: 'Changed Attribute',
      accessor: "changedAttribute",
      key: "changedAttribute",
      sortMethod: sort,
      width: 160,
    },
    {
      Header: 'Previous Value',
      accessor: "previousValue",
      key: "previousValue",
      sortMethod: sort,
      width: 200,
    },
    {
      Header: 'New Value',
      accessor: "newValue",
      key: "newValue",
      sortMethod: sort,
      width: 200,
    },
    {
      Header: 'Author',
      accessor: "author",
      key: "author",
      sortMethod: sort,
      width: 160,
    }
  ];

  if (status === 'loading' || !formattedRows) {
    return <Spinner />
  }

  function ruleDropdown() {
    const rules = _.uniq(formattedRows.filter(a => a.name != null).map((a)=>a.name))
    const ruleOptions = rules.map((currentValue, i) => {
      return <option key={currentValue} value={currentValue}>{currentValue}</option>
    })
    return (
      <div style={{width: '150px', padding: '10px'}}>
        <p className="control">
          <span className="select">
            <select defaultValue='all' onChange={handleRuleChange} style={{maxWidth: '300px'}}>
              <option value="all">All Rules</option>
              {ruleOptions}
            </select>
          </span>
        </p>
      </div>
    )
  }

  return(
    <div className="activity-stats-container">
      <h1>Change Log</h1>
      <div style={{backgroundColor: 'lightgray', borderRadius: '10px'}}>
        <div style={{display: 'flex', position: 'relative', width: '1000px'}}>
          <div style={{float: 'left', display: 'flex'}}>
            {promptDropdown}
            {ruleDropdown()}
          </div>
          <input
            aria-label="Search by action or value"
            className="search-box"
            name="searchInput"
            onChange={handleSearch}
            placeholder="Search by action or value"
            style={{width: '500px', margin: '10px', position: 'absolute', right: '10px'}}
            value={searchInput || ""}
          />
        </div>
        <div style={{display: 'flex', marginLeft: '10px', paddingBottom: '20px'}}>
          <p className="date-picker-label">Start Date:</p>
            <DateTimePicker
              ampm={false}
              format='y-MM-dd HH:mm'
              onChange={onStartDateChange}
              value={startDate}
          />
          <p className="date-picker-label">End Date (optional):</p>
            <DateTimePicker
              ampm={false}
              format='y-MM-dd HH:mm'
              onChange={onEndDateChange}
              value={endDate}
            />
        </div>
      </div>
      <br />
      {formattedRows && (<ReactTable
        className="activity-stats-table"
        columns={dataTableFields}
        data={filteredRows || []}
        defaultPageSize={filteredRows.length}
        defaultSorted={[{id: 'dateTime', desc: true}]}
        showPagination={false}
      />)}
    </div>
  );

}

export default ChangeLog
