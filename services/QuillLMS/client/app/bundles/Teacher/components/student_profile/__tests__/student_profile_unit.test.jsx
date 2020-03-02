import React from 'react';
import { mount } from 'enzyme';

import StudentProfileUnit from '../student_profile_unit';
import { DataTable } from 'quill-component-library/dist/componentLibrary'

import { categorizedActivities } from './test_data'

describe('StudentProfileUnit component', () => {

  it('should render', () => {
    const wrapper = mount(
      <StudentProfileUnit
        data={categorizedActivities}
        unitName="Unit"
      />
    );
    expect(wrapper.find('.unit-name').text()).toBe('Unit');
  });

  it('should render a data table for both complete activities and incomplete activities', () => {
    const wrapper = mount(
      <StudentProfileUnit
        data={categorizedActivities}
        unitName="Unit"
      />
    );
    expect(wrapper.find(DataTable).length).toBe(Object.keys(categorizedActivities).length);
  })
});
