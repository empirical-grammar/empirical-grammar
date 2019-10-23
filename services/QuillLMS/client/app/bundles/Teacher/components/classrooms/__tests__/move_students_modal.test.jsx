import React from 'react';
import { shallow } from 'enzyme';

import MoveStudentsModal from '../move_students_modal'

import { classroomWithStudents, classroomProps } from './test_data/test_data'

describe('MoveStudentsModal component', () => {
  const studentIds = [classroomWithStudents.students[0].id, classroomWithStudents.students[1].id]

  const wrapper = shallow(
    <MoveStudentsModal
      classroom={classroomWithStudents}
      classrooms={classroomProps}
      close={() => {}}
      onSuccess={() => {}}
      selectedStudentIds={studentIds}
    />
  );

  it('should render MoveStudentsModal', () => {
    expect(wrapper).toMatchSnapshot()
  })


})
