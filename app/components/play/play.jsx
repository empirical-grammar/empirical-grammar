import React from 'react'
import { Link } from 'react-router'

export default React.createClass({
  render: function () {
    return (
      <section className="section is-fullheight minus-nav">
        <div className="container">
          <h1 className="title">
            Choose a lesson
          </h1>
          <h2 className="subtitle">
            Combine multiple sentences into one strong one!
          </h2>
          <ul>
            <li><Link to={'/play/lesson/classroom'}>Classroom</Link></li>
          </ul>
        </div>
      </section>
    )
  }
})
