import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import {
  ResponseSortFields,
  ResponseToggleFields,
  QuestionBar
} from 'quill-component-library/dist/componentLibrary';
import request from 'request';

import ResponseList from './responseList.jsx';
import POSForResponsesList from './POSForResponsesList.jsx';

import filterActions from '../../actions/filters';
import QuestionMatcher from '../../libs/question';
import questionActions from '../../actions/questions';
import sentenceFragmentActions from '../../actions/sentenceFragments.ts';
import diagnosticQuestionActions from '../../actions/diagnosticQuestions';
import { getPartsOfSpeechTags } from '../../libs/partsOfSpeechTagging.js';
import respWithStatus from '../../libs/responseTools.js';
import POSMatcher from '../../libs/sentenceFragment.js';
import {
  rematchAll,
  rematchOne
} from '../../libs/grading/rematching.ts';
import DiagnosticQuestionMatcher from '../../libs/diagnosticQuestion.js';
import massEdit from '../../actions/massEdit';
import { submitResponseEdit } from '../../actions/responses';
import { hashToCollection } from '../../../Shared/index'

const C = require('../../constants').default;

const labels = C.ERROR_AUTHORS;
const qualityLabels = ['Human Optimal', 'Human Sub-Optimal', 'Algorithm Optimal', 'Algorithm Sub-Optimal', 'Unmatched'];
// ["Human Optimal", "Human Sub-Optimal", "Algorithm Optimal", "Algorithm Sub-Optimal",  "Unmatched",
                // "Focus Point Hint", "Word Error Hint", "Punctuation Hint", "Capitalization Hint", "Punctuation and Case Hint", "Whitespace Hint",
                // "Missing Word Hint", "Additional Word Hint", "Modified Word Hint", "Missing Details Hint", "Not Concise Hint", "No Hint"]
const colors = ['#81c784', '#ffb74d', '#BA68C8', '#5171A5', '#e57373'];

const responsesPerPage = 20;

class ResponseComponent extends React.Component {
  constructor(props) {
    super(props)
    let actions;
    let matcher;
    if (this.props.mode === 'sentenceFragments') {
      actions = sentenceFragmentActions;
      matcher = POSMatcher;
    } else if (this.props.mode === 'diagnosticQuestions') {
      actions = diagnosticQuestionActions;
      matcher = DiagnosticQuestionMatcher;
    } else {
      actions = questionActions;
      matcher = QuestionMatcher;
    }
    this.state = {
      percentageOfWeakResponses: 0,
      actions,
      viewingResponses: true,
      matcher,
      selectedResponses: [],
      health: {},
      gradeBreakdown: {},
    };
  }

  componentDidMount() {
    this.searchResponses();
    this.getHealth();
    this.getGradeBreakdown();
    this.props.dispatch(questionActions.initializeSubscription(this.props.questionID));
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(this.props.filters.formattedFilterData, prevProps.filters.formattedFilterData)) {
      this.searchResponses();
    } else if (this.props.states[this.props.questionID] === C.SHOULD_RELOAD_RESPONSES && prevProps.states[prevProps.questionID] !== C.SHOULD_RELOAD_RESPONSES) {
      this.props.dispatch(questionActions.clearQuestionState(this.props.questionID));
      this.searchResponses();
    }
  }

  componentWillUnmount() {
    this.props.dispatch(questionActions.removeSubscription(this.props.questionID));
    this.clearResponses();
  }

  getHealth = () => {
    request(
      {
        url: `https://cms.quill.org/questions/${this.props.questionID}/health`,
        method: 'GET',
      },
        (err, httpResponse, data) => {
          this.setState({
            health: JSON.parse(data),
          });
        }
      );
  };

  getGradeBreakdown = () => {
    request(
      {
        url: `https://cms.quill.org/questions/${this.props.questionID}/grade_breakdown`,
        method: 'GET',
      },
        (err, httpResponse, data) => {
          this.setState({
            gradeBreakdown: JSON.parse(data),
          });
        }
      );
  };

  clearResponses = () => {
    this.props.dispatch(questionActions.updateResponses({ responses: [], numberOfResponses: 0, numberOfPages: 1, responsePageNumber: 1, }));
  };

  searchResponses = () => {
    const { dispatch, questionID } = this.props;
    dispatch(questionActions.incrementRequestCount())
    dispatch(questionActions.searchResponses(questionID));
  }

  getTotalAttempts = () => {
    return this.state.health.total_number_of_attempts;
    // return _.reduce(this.props.responses, (memo, item) => memo + item.count, 0);
  };

  getResponseCount = () => {
    return this.state.health.total_number_of_responses;
  };

  removeResponseFromMassEditArray = responseKey => {
    this.props.dispatch(massEdit.removeResponseFromMassEditArray(responseKey));
  };

  expand = responseKey => {
    this.props.dispatch(filterActions.toggleExpandSingleResponse(responseKey));
  };

  updateRematchedResponse = (rid, vals) => {
    this.props.dispatch(submitResponseEdit(rid, vals, this.props.questionID));
  };

  getPercentageWeakResponses = () => {
    const { common_unmatched_responses, total_number_of_responses } = this.state.health
    return common_unmatched_responses > 0 ? (common_unmatched_responses/total_number_of_responses * 100).toFixed(2) : 0.0
  };

  getErrorsForAttempt = attempt => {
    return attempt.feedback;
  };

  generateFeedbackString = attempt => {
    const errors = this.getErrorsForAttempt(attempt);
    // // add keys for react list elements
    // var errorComponents = _.values(_.mapObject(errors, (val, key) => {
    //   if (val) {
    //     return feedbackStrings[key]
    //   }
    // }))
    return errors;
  };

  rematchResponse = rid => {
    const response = this.props.filters.responses[rid];
    const callback = this.searchResponses;
    rematchOne(response, this.props.mode, this.props.question, this.props.questionID, callback);
  };

  rematchAllResponses = () => {
    const pageNumber = 1;
    const callback = (done) => {
      if (done) {
        this.searchResponses();
        this.getHealth();
        this.getGradeBreakdown();
      }
    };
    const weak = rematchAll(this.props.mode, this.props.question, this.props.questionID, callback);
    // weak.forEach((resp, index) => {
    //   const percentage = index / weak.length * 100;
    //   console.log('Rematching: ', resp.key, percentage, '% complete');
    //   this.rematchResponse(resp.key);
    // });
  };

  responsesWithStatus = () => {
    return hashToCollection(respWithStatus(this.props.filters.responses));
  };

  responsesGroupedByStatus = () => {
    return _.groupBy(this.responsesWithStatus(), 'statusCode');
  };

  responsesByStatusCodeAndResponseCount = () => {
    return _.mapObject(this.responsesGroupedByStatus(), (val, key) => _.reduce(val, (memo, resp) => memo + (resp.count || 0), 0));
  };

  formatForQuestionBar = () => {
    // {"human_optimal":153,"human_suboptimal":140,"algo_optimal":0,"algo_suboptimal":8780,"unmatched":28820}
    const totalResponseCount = this.state.health.total_number_of_attempts;
    if (totalResponseCount == 0) {
      return [{
        value: 100,
        color: '#eeeeee',
      }];
    }
    return _.mapObject(this.state.gradeBreakdown, (val, key) => ({
      value: val / totalResponseCount * 100,
      color: colors[qualityLabels.indexOf(key)],
    }));
  };

  gatherVisibleResponses = () => {
    return this.responsesWithStatus();
  };

  getResponse = responseID => {
    return this.props.filters.responses[responseID];
  };

  getChildResponses = responseID => {
    const responses = hashToCollection(this.props.responses);
    return _.where(responses, { parentID: responseID, });
  };

  getResponsesForCurrentPage = responses => {
    return responses;
  };

  getBoundsForCurrentPage = length => {
    const startIndex = (this.props.filters.responsePageNumber - 1) * responsesPerPage;
    const endIndex = startIndex + responsesPerPage > length ? length : startIndex + responsesPerPage;
    return [startIndex, endIndex];
  };

  renderResponses = () => {
    if (this.state.viewingResponses) {
      const { questionID, selectedIncorrectSequences, selectedFocusPoints } = this.props;
      const responsesWStatus = this.responsesWithStatus();
      const responses = _.sortBy(responsesWStatus, 'sortOrder');
      return (<ResponseList
        admin={this.props.admin}
        ascending={this.props.filters.ascending}
        conceptID={this.props.question.conceptID}
        concepts={this.props.concepts}
        conceptsFeedback={this.props.conceptsFeedback}
        dispatch={this.props.dispatch}
        expand={this.expand}
        expanded={this.props.filters.expanded}
        getChildResponses={this.getChildResponses}
        getMatchingResponse={this.rematchResponse}
        getResponse={this.getResponse}
        massEdit={this.props.massEdit}
        mode={this.props.mode}
        printPathways={this.mapCountToResponse}
        question={this.props.question}
        questionID={questionID}
        responses={responses}
        selectedFocusPoints={selectedFocusPoints}
        selectedIncorrectSequences={selectedIncorrectSequences}
        showPathways
        states={this.props.states}
        toPathways={this.mapCountToToResponse}
      />);
    }
  };

  toggleResponseSort = field => {
    this.props.dispatch(filterActions.toggleResponseSort(field));
  };

  renderSortingFields = () => {
    return (<ResponseSortFields
      ascending={this.props.filters.ascending}
      sorting={this.props.filters.sorting}
      toggleResponseSort={this.toggleResponseSort}
    />);
  };

  toggleField = status => {
    this.props.dispatch(filterActions.toggleStatusField(status));
  };

  toggleExcludeMisspellings = () => {
    this.props.dispatch(filterActions.toggleExcludeMisspellings());
  };

  resetFields = () => {
    this.props.dispatch(filterActions.resetAllFields());
  };

  deselectFields = () => {
    this.props.dispatch(filterActions.deselectAllFields());
  };

  renderStatusToggleMenu = () => {
    return (
      <ResponseToggleFields
        deselectFields={this.deselectFields}
        excludeMisspellings={this.props.filters.formattedFilterData.filters.excludeMisspellings}
        labels={labels}
        qualityLabels={qualityLabels}
        resetFields={this.resetFields}
        resetPageNumber={this.resetPageNumber}
        toggleExcludeMisspellings={this.toggleExcludeMisspellings}
        toggleField={this.toggleField}
        visibleStatuses={this.props.filters.visibleStatuses}
      />
    );
  };

  collapseAllResponses = () => {
    this.props.dispatch(filterActions.collapseAllResponses());
  };

  expandAllResponses = () => {
    const responses = this.responsesWithStatus();
    const newExpandedState = this.props.filters.expanded;
    for (let i = 0; i < responses.length; i++) {
      newExpandedState[responses[i].key] = true;
    }
    this.props.dispatch(filterActions.expandAllResponses(newExpandedState));
  };

  allClosed = () => {
    const expanded = this.props.filters.expanded;
    for (const i in expanded) {
      if (expanded[i] === true) return false;
    }
    return true;
  };

  renderExpandCollapseAll = () => {
    let text,
      handleClick;

    if (this.allClosed()) {
      handleClick = this.expandAllResponses;
      text = 'Expand';
    } else {
      handleClick = this.collapseAllResponses;
      text = 'Close';
    }
    return <a className="button is-fullwidth" onClick={handleClick}>{text}</a>;
  };

  renderRematchAllButton() {
    const { filters } = this.props
    let disabled = filters.numberOfResponses > 1000
    if (this.props.admin) {
      const text = this.state.progress ? `${this.state.progress}%` : 'Rematch Responses';

      return (<button className="button is-outlined is-danger" disabled={disabled} onClick={this.rematchAllResponses} style={{ float: 'right', }} type="button">{text}</button>);
    }
  };

  renderPOSStrings = () => {
    if (!this.state.viewingResponses) {
      const posTagsList = this.getResponsesForCurrentPage(hashToCollection(this.getPOSTagsList()));
      return (
        <div>
          <POSForResponsesList posTagsList={posTagsList} />
        </div>
      );
    }
  };

  renderViewResponsesOrPOSButton = () => {
    return (
      <div className="column">
        <button
          className="button is-fullwidth is-outlined"
          onClick={() => {
            this.setState({
              viewingResponses: !this.state.viewingResponses,
            }, this.updatePageNumber(1));
          }}
        >Show {this.state.viewingResponses ? 'POS' : 'Uniques'}</button>
      </div>
    );
  };

  renderResetAllFiltersButton = () => {
    return (
      <div className="column">
        <button className="button is-fullwidth is-outlined" onClick={this.resetFields}>Select All Filters</button>
      </div>
    );
  };

  renderDeselectAllFiltersButton = () => {
    return (
      <div className="column">
        <button className="button is-fullwidth is-outlined" onClick={this.deselectFields}>Deselect All Filters</button>
      </div>
    );
  };

  getToPathwaysForResponse = rid => {
    const responseCollection = hashToCollection(this.props.pathways.data);
    const responsePathways = _.where(responseCollection, { fromResponseID: rid, });
    return responsePathways;
  };

  getUniqAndCountedToResponsePathways = rid => {
    const counted = _.countBy(this.getToPathwaysForResponse(rid), path => path.toResponseID);
    return counted;
  };

  mapCountToToResponse = rid => {
    const mapped = _.mapObject(this.getUniqAndCountedToResponsePathways(rid), (value, key) => {
      const response = this.props.responses[key];
      // response.pathCount = value
      return response;
    });
    return _.values(mapped);
  };

  // from pathways

  getFromPathwaysForResponse = rid => {
    const responseCollection = hashToCollection(this.props.pathways.data);
    const responsePathways = _.where(responseCollection, { toResponseID: rid, });
    return responsePathways;
  };

  getUniqAndCountedResponsePathways = rid => {
    const counted = _.countBy(this.getFromPathwaysForResponse(rid), path => path.fromResponseID);
    return counted;
  };

  getPOSTagsList = () => {
    const responses = this.gatherVisibleResponses();
    const responsesWithPOSTags = responses.map((response) => {
      response.posTags = getPartsOfSpeechTags(response.text.replace(/(<([^>]+)>)/ig, '').replace(/&nbsp;/ig, '')); // some text has html tags
      return response;
    });

    let posTagsList = {},
      posTagsAsString = '';
    responses.forEach((response) => {
      posTagsAsString = response.posTags ? response.posTags.join() : '';
      if (posTagsList[posTagsAsString]) {
        posTagsList[posTagsAsString].count += response.count;
        posTagsList[posTagsAsString].responses.push(response);
      } else {
        posTagsList[posTagsAsString] = {
          tags: response.posTags,
          count: response.count,
          responses: [
            response
          ],
        };
      }
    });
    return posTagsList;
  };

  handleStringFiltering = () => {
    const { dispatch, questionID } = this.props;
    const { stringFilter } = this.refs;
    const { value } = stringFilter;
    dispatch(questionActions.updateStringFilter(value, questionID));
  }

  handleSearchEnter = (e) => {
    if(e.key === "Enter") {
      this.searchResponses();
    }
  }

  getFilteredResponses = responses => {
    if (this.props.filters.stringFilter == '') {
      return responses;
    }
    const that = this;
    return _.filter(responses, response => response.text.indexOf(that.props.filters.stringFilter) >= 0);
  };

  mapCountToResponse = rid => {
    const mapped = _.mapObject(this.getUniqAndCountedResponsePathways(rid), (value, key) => {
      let response = this.props.responses[key];
      if (response) {
        response.pathCount = value;
      } else {
        response = {
          initial: true,
          pathCount: value,
          key: 'initial',
        };
      }
      return response;
    });
    return _.values(mapped);
  };

  updatePageNumber = pageNumber => {
    this.props.dispatch(questionActions.updatePageNumber(pageNumber, this.props.questionID));
  };

  incrementPageNumber = () => {
    if (this.props.filters.responsePageNumber < this.getNumberOfPages()) {
      this.updatePageNumber(this.props.filters.responsePageNumber + 1);
    }
  };

  decrementPageNumber = () => {
    if (this.props.filters.responsePageNumber !== 1) {
      this.updatePageNumber(this.props.filters.responsePageNumber - 1);
    }
  };

  getNumberOfPages = () => {
    return this.props.filters.numberOfPages;
  };

  resetPageNumber = () => {
    this.updatePageNumber(1);
  };

  renderDisplayingMessage = () => {
    let endWord,
      length;
    if (this.state.viewingResponses) {
      length = this.props.filters.numberOfResponses;
      endWord = ' responses';
    } else {
      length = hashToCollection(this.getPOSTagsList()).length;
      endWord = ' parts of speech strings';
    }
    const bounds = this.getBoundsForCurrentPage(length);
    const message = `Displaying ${bounds[0] + 1}-${bounds[1]} of ${length}${endWord}`;
    return <p className="label">{message}</p>;
  };

  renderPageNumbers = () => {
    // var array
    // if(this.state.viewingResponses) {
    //   array = this.gatherVisibleResponses()
    // } else {
    //   array = this.getPOSTagsList()
    // }

    const pageNumbers = _.range(1, this.props.filters.numberOfPages + 1);

    let pageNumberStyle = {};
    const numbersToRender = pageNumbers.map((pageNumber, i) => {
      if (this.props.filters.responsePageNumber === pageNumber) {
        pageNumberStyle = {
          backgroundColor: 'lightblue',
        };
      } else {
        pageNumberStyle = {};
      }
      return (
        <li key={i}>
          <a className="button" onClick={() => this.updatePageNumber(pageNumber)} style={pageNumberStyle}>{pageNumber}</a>
          {/* <a className="button" style={pageNumberStyle} onClick={() => { this.setState({ responsePageNumber: pageNumber, }); }}>{pageNumber}</a> */}
        </li>
      );
    });

    let nextButtonClassName = 'button pagination-extreme-button';
    if (this.props.filters.responsePageNumber === this.getNumberOfPages()) {
      nextButtonClassName += ' is-disabled';
    }
    const nextButton = <a className={nextButtonClassName} onClick={this.incrementPageNumber}>Next</a>;

    let prevButtonClassName = 'button pagination-extreme-button';
    if (this.props.filters.responsePageNumber === 1) {
      prevButtonClassName += ' is-disabled';
    }
    const prevButton = <a className={prevButtonClassName} onClick={this.decrementPageNumber}>Prev</a>;

    return (
      <div>
        <div className="response-pagination-container">
          <nav className="pagination response-pagination">
            {prevButton}
            <ul className="numbers-list">
              {numbersToRender}
            </ul>
            {nextButton}
          </nav>
        </div>
      </div>
    );
  };

  render() {
    const { filters, mode } = this.props;
    const { responses, stringFilter } = filters;
    const questionBar = responses && Object.keys(responses).length > 0
    ? <QuestionBar data={_.values(this.formatForQuestionBar())} />
    : <span />;
    const showPosOrUniqueButton = mode === 'questions' ? <span /> : this.renderViewResponsesOrPOSButton()

    return (
      <div style={{ marginTop: 0, paddingTop: 0, }}>
        {questionBar}
        {this.renderRematchAllButton()}
        <h4 className="title is-5" >
          Overview - Total Attempts: <strong>{this.getTotalAttempts()}</strong> | Unique Responses: <strong>{this.getResponseCount()}</strong> | Percentage of weak responses: <strong>{this.getPercentageWeakResponses()}%</strong>
        </h4>
        <div className="tabs is-toggle is-fullwidth">
          {this.renderStatusToggleMenu()}
        </div>
        <div className="columns">
          <div className="column">
            <div className="tabs is-toggle is-fullwidth">
              {this.renderSortingFields()}
            </div>
          </div>
          <div className="column">
            <div className="columns">
              <div className="column">
                {this.renderExpandCollapseAll()}
              </div>
              {this.renderResetAllFiltersButton()}
              {this.renderDeselectAllFiltersButton()}
              {showPosOrUniqueButton}
            </div>
          </div>
        </div>
        <div className="search-container">
          <input
            className="input"
            onChange={this.handleStringFiltering}
            onKeyPress={this.handleSearchEnter}
            placeholder="Enter a search term or /regular expression/"
            ref="stringFilter"
            type="text"
            value={stringFilter}
          />
          <button className="button is-outlined is-primary search" onClick={this.searchResponses} type="submit">Search</button>
        </div>
        {this.renderDisplayingMessage()}
        {this.renderPageNumbers()}
        {this.renderResponses()}
        {this.renderPOSStrings()}
        {this.renderPageNumbers()}
      </div>
    );
  }
}

function select(state) {
  return {
    filters: state.filters,
    pathways: state.pathways,
    conceptsFeedback: state.conceptsFeedback,
    concepts: state.concepts,
    massEdit: state.massEdit,
  };
}

export default connect(select)(ResponseComponent);
