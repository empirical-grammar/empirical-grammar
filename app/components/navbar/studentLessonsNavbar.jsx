import React from 'react';

export default React.createClass({
  render() {
    return (
      <header className={'nav student-nav'} style={{ height: '66px', }}>
        <nav className="student-lessons">
          <a href={`${process.env.EMPIRICAL_BASE_URL}`} >
            <img
              className="quill-logo"
              src="https://d2t498vi8pate3.cloudfront.net/assets/home-header-logo-8d37f4195730352f0055d39f7e88df602e2d67bdab1000ac5886c5a492400c9d.png"
              alt="quill-logo"
            />
          </a>
          <div className="lesson-name" key="lesson-name">Lesson Name Placeholder</div>
          <div className="teacher-name">Teacher Name - Classroom Name</div>
        </nav>
      </header>
    );
  },
});
