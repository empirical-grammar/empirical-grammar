import React from 'react'
import { shallow } from 'enzyme'

import AssignStudents, {
  createAClassForm,
  importGoogleClassroomsModal,
  googleClassroomEmailModal,
  googleClassroomsEmptyModal
} from '../assign_students'
import ClassroomCard from '../classroom_card.tsx'
import CreateAClassInlineForm from '../create_a_class_inline_form.tsx'
import ImportGoogleClassroomsModal from '../../../../classrooms/import_google_classrooms_modal.tsx'
import GoogleClassroomEmailModal from '../../../../classrooms/google_classroom_email_modal.tsx'
import GoogleClassroomsEmptyModal from '../../../../classrooms/google_classrooms_empty_modal.tsx'


import { classroomProps, user } from './test_data/test_data'

describe('Assign students component', () => {

  it('should render', () => {
    const wrapper = shallow(
      <AssignStudents
        user={user}
        classrooms={classroomProps}
        toggleStudentSelection={() => {}}
        toggleClassroomSelection={() => {}}
        fetchClassrooms={() => {}}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })

  describe('if this.state.showFormOrModal = createAClassForm', () => {
    const wrapper = shallow(
      <AssignStudents
        user={user}
        classrooms={classroomProps}
        toggleStudentSelection={() => {}}
        toggleClassroomSelection={() => {}}
        fetchClassrooms={() => {}}
      />
    )
    wrapper.setState({ showFormOrModal: createAClassForm })

    it('should render a createAClassInlineForm component', () => {
      expect(wrapper.find(CreateAClassInlineForm).exists()).toBe(true)
    })
  })

  describe('if this.state.showFormOrModal = importGoogleClassroomsModal', () => {
    const wrapper = shallow(
      <AssignStudents
        user={user}
        classrooms={classroomProps}
        toggleStudentSelection={() => {}}
        toggleClassroomSelection={() => {}}
        fetchClassrooms={() => {}}
      />
    )
    wrapper.setState({ showFormOrModal: importGoogleClassroomsModal })

    it('should render a importGoogleClassroomsModal component', () => {
      expect(wrapper.find(ImportGoogleClassroomsModal).exists()).toBe(true)
    })
  })

  describe('if this.state.showFormOrModal = googleClassroomEmailModal', () => {
    const wrapper = shallow(
      <AssignStudents
        user={user}
        classrooms={classroomProps}
        toggleStudentSelection={() => {}}
        toggleClassroomSelection={() => {}}
        fetchClassrooms={() => {}}
      />
    )
    wrapper.setState({ showFormOrModal: googleClassroomEmailModal })

    it('should render a googleClassroomEmailModal component', () => {
      expect(wrapper.find(GoogleClassroomEmailModal).exists()).toBe(true)
    })
  })

  describe('if this.state.showFormOrModal = googleClassroomsEmptyModal', () => {
    const wrapper = shallow(
      <AssignStudents
        user={user}
        classrooms={classroomProps}
        toggleStudentSelection={() => {}}
        toggleClassroomSelection={() => {}}
        fetchClassrooms={() => {}}
      />
    )
    wrapper.setState({ showFormOrModal: googleClassroomsEmptyModal })

    it('should render a googleClassroomsEmptyModal component', () => {
      expect(wrapper.find(GoogleClassroomsEmptyModal).exists()).toBe(true)
    })
  })

  describe('if there are classrooms', () => {
    const wrapper = shallow(
      <AssignStudents
        user={user}
        classrooms={classroomProps}
        toggleStudentSelection={() => {}}
        toggleClassroomSelection={() => {}}
        fetchClassrooms={() => {}}
      />
    )

    it('should render a classroom card for each classroom', () => {
      expect(wrapper.find(ClassroomCard).length).toBe(classroomProps.length)
    })

  })

  describe('if there are no classrooms', () => {
    const wrapper = shallow(
      <AssignStudents
        user={user}
        classrooms={[]}
        toggleStudentSelection={() => {}}
        toggleClassroomSelection={() => {}}
        fetchClassrooms={() => {}}
      />
    )

    it('should render an empty state', () => {
      expect(wrapper.find('.no-active-classes').exists()).toBe(true)
    })
  })

})
