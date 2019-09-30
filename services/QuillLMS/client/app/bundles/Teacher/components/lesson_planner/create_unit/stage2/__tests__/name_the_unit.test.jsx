import React from 'react'
import { shallow } from 'enzyme'

import NameTheUnit from '../name_the_unit.jsx'

describe('NameTheUnit component', () => {

  it('should render', () => {
    const wrapper = shallow(
      <NameTheUnit
        nameError={null}
        unitName=''
        updateUnitName={() => {}}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
