import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions/concepts'
import _ from 'underscore'
import { Link } from 'react-router'
import Modal from '../modal/modal.jsx'

const Concept = React.createClass({
  createNew: function () {
    this.props.dispatch(actions.toggleNewConceptModal())
  },

  submitNewConcept: function () {
    var newConcept = {name: this.refs.newConceptName.value}
    this.props.dispatch(actions.submitNewConcept(newConcept))
    this.refs.newConceptName.value = ""
    // this.props.dispatch(actions.toggleNewConceptModal())
  },

  renderConcepts: function () {
    const {data} = this.props.concepts;
    const keys = _.keys(data);
    return keys.map((key) => {
      //console.log(key, data, data[key])
      return (<li><Link to={'/admin/concepts/' + key} activeClassName="is-active">{data[key].name}</Link></li>)
    })
  },

  renderModal: function () {
    var stateSpecificClass = this.props.concepts.submittingnew ? 'is-loading' : '';
    if (this.props.concepts.newConceptModalOpen) {
        return (
          <Modal close={this.createNew}>
            <div className="box">
              <h4 className="title">Add New Concept</h4>
                <p className="control">
                  <label className="label">Name</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Text input"
                    ref="newConceptName"
                  />
              </p>
              <p className="control">
                <button className={"button is-primary " + stateSpecificClass} onClick={this.submitNewConcept}>Submit</button>
              </p>
            </div>
          </Modal>
        )
      }
  },

  render: function (){
    console.log("this.props.concepts", this.props.concepts)
    return (
      <section className="section">
        <div className="container">
          <h1 className="title"><button className="button is-primary" onClick={this.createNew}>Create New concept</button></h1>
          { this.renderModal() }
              <aside className="menu">
                <p className="menu-label">
                  Concepts
                </p>
                <ul className="menu-list">
                  {this.renderConcepts()}
                </ul>
              </aside>
        </div>
      </section>
    )
  }
})

function select(state) {
  return {
    concepts: state.concepts,
    routing: state.routing
  }
}

export default connect(select)(Concept)
