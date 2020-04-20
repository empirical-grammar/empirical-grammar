import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import questionActions from '../../actions/questions';
import sentenceFragmentActions from '../../actions/sentenceFragments';
import {
  hashToCollection,
  SortableList
} from 'quill-component-library/dist/componentLibrary';

export class FocusPointsContainer extends Component {
  constructor() {
    super();

    const questionType = window.location.href.includes('sentence-fragments') ? 'sentenceFragments' : 'questions'
    const questionTypeLink = questionType === 'sentenceFragments' ? 'sentence-fragments' : 'questions'
    const actionFile = questionType === 'sentenceFragments' ? sentenceFragmentActions : questionActions

    this.state = { fpOrderedIds: null, questionType, actionFile, questionTypeLink };
  }

  getFocusPoints = () => {
    return this.getQuestion().focusPoints;
  }

  getQuestion = () => {
    return this.props[this.state.questionType].data[this.props.params.questionID];
  }

  deleteConceptResult = (conceptResultKey, focusPointKey) => {
    if (confirm('⚠️ Are you sure you want to delete this? 😱')) {
      const data = this.getFocusPoints()[focusPointKey];
      delete data.conceptResults[conceptResultKey];
      this.props.dispatch(this.state.actionFile.submitEditedFocusPoint(this.props.params.questionID, data, focusPointKey));
    }
  }

  deleteFocusPoint = focusPointID => {
    if (confirm('⚠️ Are you sure you want to delete this? 😱')) {
      this.props.dispatch(this.state.actionFile.deleteFocusPoint(this.props.params.questionID, focusPointID));
    }
  };

  fPsortedByOrder = () => {
    if (this.state.fpOrderedIds) {
      const focusPoints = hashToCollection(this.getFocusPoints())
      return this.state.fpOrderedIds.map(id => focusPoints.find(fp => fp.key === id))
    } else {
      return hashToCollection(this.getFocusPoints()).sort((a, b) => a.order - b.order);
    }
  }

  sortCallback = sortInfo => {
    const fpOrderedIds = sortInfo.data.items.map(item => item.key);
    this.setState({ fpOrderedIds, });
  };

  updatefpOrder = () => {
    if (this.state.fpOrderedIds) {
      const focusPoints = this.getFocusPoints();
      const newFp = {};
      this.state.fpOrderedIds.forEach((id, index) => {
        const fp = Object.assign({}, focusPoints[id]);
        fp.order = index + 1;
        newFp[id] = fp;
      });
      this.props.dispatch(this.state.actionFile.submitBatchEditedFocusPoint(this.props.params.questionID, newFp));
      alert('saved!');
    } else {
      alert('no changes to focus points have been made');
    }
  };

  renderConceptResults = (concepts, focusPointKey) => {
    if (concepts) {
      const components = _.mapObject(concepts, (val, key) => (
        <p className="control sub-title is-6" key={`${val.name}`}>{val.name}
          {val.correct ? <span className="tag is-small is-success" style={{ marginLeft: 5, }}>Correct</span>
          : <span className="tag is-small is-danger" style={{ marginLeft: 5, }}>Incorrect</span> }
          <span className="tag is-small is-warning" onClick={() => this.deleteConceptResult(key, focusPointKey)} style={{ cursor: 'pointer', marginLeft: 5, }}>Delete</span>
        </p>
        )
      );
      return _.values(components);
    }
  }

  renderFocusPointsList = () => {
    const components = this.fPsortedByOrder().map((fp) => {
      if (fp.text) {
        return (
          <div className="card is-fullwidth has-bottom-margin" key={fp.key}>
            <header className="card-header">
              <p className="card-header-title" style={{ display: 'inline-block', }}>
                {this.renderTagsForFocusPoint(fp.text)}
              </p>
              <p className="card-header-icon">
                {fp.order}
              </p>
            </header>
            <div className="card-content">
              <p className="control title is-4" dangerouslySetInnerHTML={{ __html: '<strong>Feedback</strong>: ' + fp.feedback, }} />
              {this.renderConceptResults(fp.conceptResults, fp.key)}
            </div>
            <footer className="card-footer">
              <a className="card-footer-item" href={`/#/admin/${this.state.questionTypeLink}/${this.props.params.questionID}/focus-points/${fp.key}/edit`}>Edit</a>
              <a className="card-footer-item" onClick={() => this.deleteFocusPoint(fp.key)}>Delete</a>
            </footer>
          </div>
        );
      }
    });
    return <SortableList data={_.values(components)} key={_.values(components).length} sortCallback={this.sortCallback} />;
  }

  renderTagsForFocusPoint = (focusPointString) => {
    return focusPointString.split('|||').map((fp, index) => (<span className="tag is-medium is-light" key={`fp${index}`} style={{ margin: '3px', }}>{fp}</span>));
  }

  renderfPButton = () => {
    return (
      this.state.fpOrderedIds ? <button className="button is-outlined is-primary" onClick={this.updatefpOrder} style={{ float: 'right', }}>Save FP Order</button> : null
    );
  }

  render() {
    return (
      <div>
        <div className="has-top-margin">
          <h1 className="title is-3" style={{ display: 'inline-block', }}>Focus Points</h1>
          <a className="button is-outlined is-primary" href={`/#/admin/${this.state.questionTypeLink}/${this.props.params.questionID}/focus-points/new`} style={{ float: 'right', }}>Add Focus Point</a>
          {this.renderfPButton()}
        </div>
        {this.renderFocusPointsList()}
        {this.props.children}
      </div>
    );
  }
}

function select(props) {
  let mapState
  if (window.location.href.includes('sentence-fragments')) {
    mapState = {
      sentenceFragments: props.sentenceFragments
    };
  } else {
    mapState = {
      questions: props.questions
    };
  }
  return mapState
}

export default connect(select)(FocusPointsContainer);
