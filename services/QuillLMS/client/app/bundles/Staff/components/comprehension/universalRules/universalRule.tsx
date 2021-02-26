import * as React from "react";
import { Link } from 'react-router-dom';
import { queryCache, useQuery } from 'react-query';
import stripHtml from "string-strip-html";

import Navigation from '../navigation'
import RuleForm from '../configureRules/ruleForm';
import SubmissionModal from '../shared/submissionModal';
import { buildErrorMessage } from '../../../helpers/comprehension';
import { updateRule, deleteRule, fetchRule } from '../../../utils/comprehension/ruleAPIs';
import { RuleInterface } from '../../../interfaces/comprehensionInterfaces';
import { DataTable, Error, Modal, Spinner } from '../../../../Shared/index';

const UniversalRule = ({ history, location, match }) => {
  const { params } = match;
  const { ruleId } = params;
  const [showDeleteRuleModal, setShowDeleteRuleModal] = React.useState<boolean>(false);
  const [showEditRuleModal, setShowEditRuleModal] = React.useState<boolean>(false);
  const [showSubmissionModal, setShowSubmissionModal] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<object>({});

  // cache rule data
  const { data: ruleData } = useQuery({
    queryKey: [`rule-${ruleId}`, ruleId],
    queryFn: fetchRule
  });

  const toggleShowEditRuleModal = () => {
    setShowEditRuleModal(!showEditRuleModal);
  }

  const toggleShowDeleteRuleModal = () => {
    setShowDeleteRuleModal(!showDeleteRuleModal);
  }

  const toggleSubmissionModal = () => {
    setShowSubmissionModal(!showSubmissionModal);
  }

  function handleAttributesFields(feedbacks) {
    return feedbacks.map((feedback, i) => {
      const { text } = feedback;
      return {
        label: `Feedback ${i + 1}`,
        value: stripHtml(text)
      }
    });
  }

  const ruleRows = ({ rule }) => {
    if(!rule) {
      return [];
    }
    // format for DataTable to display labels on left side and values on right
    const { feedbacks, name, rule_type, description, suborder, } = rule;
    const attributesFields = handleAttributesFields(feedbacks);
    const firstFields = [
      {
        label: 'Type',
        value: rule_type
      },
      {
        label: 'Name',
        value: name
      },
      {
        label: 'Description',
        value: description && stripHtml(description)
      },
      {
        label: 'Order',
        value: suborder
      },
    ];
    const fields = firstFields.concat(attributesFields);
    return fields.map((field, i) => {
      const { label, value } = field
      return {
        id: `${label}-${i}`,
        field: label,
        value
      }
    });
  }

  const handleSubmitRule = ({rule}: {rule: RuleInterface}) => {
    updateRule(ruleId, rule).then((response) => {
      const { error } = response;
      if(error) {
        let updatedErrors = errors;
        updatedErrors['update error'] = error;
        setErrors(updatedErrors);
      }
      // update rule caches to display newly updated rule
      queryCache.refetchQueries(`rule-${ruleId}`);
      queryCache.refetchQueries('universal-rules');
    });

    toggleShowEditRuleModal();
    toggleSubmissionModal();
  }

  const handleDeleteRule = () => {
    deleteRule(ruleId).then((response) => {
      const { error } = response;
      if(error) {
        let updatedErrors = errors;
        updatedErrors['delete error'] = error;
        setErrors(updatedErrors);
      }
      toggleShowDeleteRuleModal();

      if(Object.keys(errors).length) {
        toggleSubmissionModal();
      } else {
        queryCache.refetchQueries('universal-rules').then(() => {
          history.push({
            pathname: '/universal-rules',
            state: {
              ruleDeleted: true,
              ruleId: ruleId
            }
          });
        })
      }
    });
  }

  const renderRuleForm = () => {
    return(
      <Modal>
        <RuleForm
          closeModal={toggleShowEditRuleModal}
          isUniversal={true}
          rule={ruleData && ruleData.rule}
          submitRule={handleSubmitRule}
        />
      </Modal>
    );
  }

  const renderDeleteRuleModal = () => {
    return(
      <Modal>
        <div className="delete-rule-container">
          <p className="delete-rule-text">Are you sure that you want to delete this rule?</p>
          <div className="delete-rule-button-container">
            <button className="quill-button fun primary contained" id="delete-rule-button" onClick={handleDeleteRule} type="button">
              Delete
            </button>
            <button className="quill-button fun primary contained" id="close-rule-modal-button" onClick={toggleShowDeleteRuleModal} type="button">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  const renderSubmissionModal = () => {
    let message = 'Rule successfully updated!';
    if(Object.keys(errors).length) {
      message = buildErrorMessage(errors);
    }
    return <SubmissionModal close={toggleSubmissionModal} message={message} />;
  }

  // The header labels felt redundant so passing empty strings and hiding header display
  const dataTableFields = [
    { name: "", attribute:"field", width: "180px" },
    { name: "", attribute:"value", width: "600px" }
  ];

  if(!ruleData) {
    return(
      <React.Fragment>
        <Navigation location={location} match={match} />
        <div className="loading-spinner-container">
          <Spinner />
        </div>
      </React.Fragment>
    );
  }

  if(ruleData.error) {
    return(
      <div className="error-container">
        <Error error={`${ruleData.error}`} />
      </div>
    );
  }

  return(
    <React.Fragment>
      <Navigation location={location} match={match} />
      <div className="universal-rule-container">
        {showDeleteRuleModal && renderDeleteRuleModal()}
        {showEditRuleModal && renderRuleForm()}
        {showSubmissionModal && renderSubmissionModal()}
        <div className="header-container">
          <h2>Universal Rule</h2>
          <Link to={{ pathname: "/universal-rules", state: 'returned-to-index' }}>← Return to Universal Rules Index</Link>
        </div>
        <DataTable
          className="universal-rule-table"
          headers={dataTableFields}
          rows={ruleRows(ruleData)}
        />
        <div className="button-container">
          <button className="quill-button fun primary contained" id="edit-rule-button" onClick={toggleShowEditRuleModal} type="button">
            Configure
          </button>
          <button className="quill-button fun primary contained" id="delete-rule-button" onClick={toggleShowDeleteRuleModal} type="button">
            Delete
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

export default UniversalRule;
