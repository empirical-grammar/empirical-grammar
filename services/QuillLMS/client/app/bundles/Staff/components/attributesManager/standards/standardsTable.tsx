import * as React from 'react'
import { Table } from 'antd';
import moment from 'moment';

import RecordBox from './recordBox'
import { sortWordsThatIncludeNumbers, STANDARD, STANDARD_CATEGORY, STANDARD_LEVEL} from './shared'

import { Tooltip, momentFormatConstants } from '../../../../Shared/index'

const standardCategoryTooltipText = "Each standard is assigned a standard category. The standard category displays in a featured activity pack page as the \"concept\" for each activity. The standard category that gets displayed is determined by the standard that has been assigned to the activity.  Standard categories also display as the concepts of the pack, shown in the white box on the right of an activity pack page. Although standard categories are called \"concepts\" in a featured activity pack page, they are not the same concepts that are used to filter or order activities in the custom activity pack page."

const standardLevelTooltipText = "Standards are grouped by their grade level. The standard level displays to teachers on the Standards data report and is used as an activity attribute filter, called CCSS Grade Level, on the custom activity pack page."

function columns(selectRecord) {
  return [
    {
      title: <Tooltip tooltipText={standardLevelTooltipText} tooltipTriggerText="Standard Level" />,
      dataIndex: 'standard_level_name',
      defaultSortOrder: 'ascend',
      key: 'standardLevelName',
      render: (text, record) => (<button className="interactive-wrapper" onClick={() => selectRecord(record.standard_level_id, STANDARD_LEVEL)}>{text}</button>),
      sorter: sortWordsThatIncludeNumbers('standard_level_name')
    },
    {
      title: 'Activities',
      dataIndex: 'standard_level_activity_count',
      key: 'standardLevelActivityCount',
      sorter:  (a, b) => (a.standard_level_activity_count - b.standard_level_activity_count)
    },
    {
      title: <Tooltip tooltipText={standardCategoryTooltipText} tooltipTriggerText="Standard Category" />,
      dataIndex: 'standard_category_name',
      key: 'standardCategoryName',
      render: (text, record) => (<button className="interactive-wrapper" onClick={() => selectRecord(record.standard_category_id, STANDARD_CATEGORY)}>{text}</button>),
      sorter: sortWordsThatIncludeNumbers('standard_category_name')
    },
    {
      title: 'Activities',
      dataIndex: 'standard_category_activity_count',
      key: 'standardCategoryActivityCount',
      sorter:  (a, b) => (a.standard_category_activity_count - b.standard_category_activity_count)
    },
    {
      title: 'Standard ',
      dataIndex: 'name',
      key: 'standardName',
      render: (text, record) => (<button className="interactive-wrapper" onClick={() => selectRecord(record.id, STANDARD)}>{text}</button>),
      sorter: sortWordsThatIncludeNumbers()
    },
    {
      title: 'Activities',
      dataIndex: 'activity_count',
      key: 'standardActivityCount',
      sorter:  (a, b) => (a.activity_count - b.activity_count)
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => moment(text).format(momentFormatConstants.MONTH_DAY_YEAR),
      sorter:  (a, b) => (new Date(a.created_at) - new Date(b.created_at)),
    }
  ]
}

const StandardsTable = ({ searchValue, standardCategories, standardLevels, recordTypes, standards, }) => {
  const [selectedRecordId, setSelectedRecordId] = React.useState(null)
  const [selectedRecordType, setSelectedRecordType] = React.useState(null)

  function closeRecordBox() {
    setSelectedRecordId(null)
    setSelectedRecordType(null)
  }

  function selectRecord(id, recordType) {
    setSelectedRecordId(id)
    setSelectedRecordType(recordType)
  }

  let recordBox

  const sharedRecordBoxProps = {
    closeRecordBox,
    standardCategories: standardCategories.filter(sc => sc.visible),
    standardLevels: standardLevels.filter(sl => sl.visible),
    standards: standards.filter(s => s.visible),
    recordType: selectedRecordType
  }

  if (selectedRecordId) {
    const recordType = recordTypes.find(rt => rt.recordType === selectedRecordType)
    const recordBoxProps = {
      ...sharedRecordBoxProps,
      originalRecord: recordType.records.find(r => r.id === selectedRecordId),
      saveRecordChanges: recordType.saveChanges,
      recordTypeAttribute: recordType.attribute
    }
    recordBox = <RecordBox {...recordBoxProps} />
  }

  const records = standards.map(s => {
    const standardLevel = standardLevels.find(sl => sl.id === s.standard_level_id)
    const standardCategory = standardCategories.find(sc => sc.id === s.standard_category_id)
    s.standard_level_name = standardLevel ? standardLevel.name : null
    s.standard_level_activity_count = standardLevel ? standardLevel.activity_count : null
    s.standard_category_name = standardCategory ? standardCategory.name : null
    s.standard_category_activity_count = standardCategory ? standardCategory.activity_count : null
    return s
  })

  const filteredRecords = records.filter(r => {
    const standardLevelNameMatchesSearch = r.standard_level_name && r.standard_level_name.toLowerCase().includes(searchValue.toLowerCase())
    const standardCategoryNameMatchesSearch = r.standard_category_name && r.standard_category_name.toLowerCase().includes(searchValue.toLowerCase())
    const standardNameMatchesSearch = r.name.toLowerCase().includes(searchValue.toLowerCase())
    return r.visible === true && (standardLevelNameMatchesSearch || standardCategoryNameMatchesSearch || standardNameMatchesSearch)
  })

  return (<div className="standard-columns">
    <Table
      bordered
      className="records-table"
      columns={columns(selectRecord)}
      dataSource={filteredRecords}
      pagination={false}
      showSorterTooltip={false}
      size="middle"
    />
    <div className="record-box-container">
      {recordBox}
    </div>
  </div>)
}

export default StandardsTable