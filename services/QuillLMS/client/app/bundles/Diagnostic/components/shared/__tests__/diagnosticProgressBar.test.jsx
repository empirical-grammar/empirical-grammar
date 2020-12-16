import React from 'react';
import { shallow } from 'enzyme';

import { ProgressBar } from '../../../../Shared/index';

describe('ProgressBar component', () => {
  const wrapper = shallow(<ProgressBar percent={15} /> )

  it('renders a progress element', () => {
    expect(wrapper.find('progress')).toHaveLength(1)
  })

})
