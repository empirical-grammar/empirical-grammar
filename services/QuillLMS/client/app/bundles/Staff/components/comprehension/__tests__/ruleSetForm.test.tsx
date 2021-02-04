import * as React from 'react';
import { shallow } from 'enzyme';

import RuleForm from '../configureRules/ruleForm';
import RegexSection from '../configureRules/regexSection';
import { Input, TextEditor, } from '../../../../Shared/index'

jest.mock('string-strip-html', () => ({
  default: jest.fn()
}))

const mockRule = {
  id: 1,
  name: 'remove all instances of "it contains methane"',
  feedback: 'Revise your work. Delete the phrase "it contains methane" because it repeats the first part of the sentence',
  rules: [
    { id: 1, regex_text: 'it contain(s)? methane gas', case_sensitive: false },
    { id: 2, regex_text: 'another reg(ex) line', case_sensitive: true },
    { id: 3, regex_text: 'some m?ore reg(ex', case_sensitive: false }
  ],
  prompts: [
    { id: 1, conjunction: 'because' },
    { id:2, conjunction: 'but' }
  ]
}
const mockProps = {
  rule: mockRule,
  activityData: {
    title: 'test',
    scored_level: '7',
    target_level: 7
  },
  closeModal: jest.fn(),
  submitRule: jest.fn()
};

describe('RuleForm component', () => {
  const container = shallow(<RuleForm {...mockProps} />);

  it('should render RuleForm', () => {
    expect(container).toMatchSnapshot();
  });

  it('should render an Input, TextEditor or checkbox component for each field', () => {
    // Input: Name (1)
    // TextEditor: Feedback (1)
    // RegexSection (1)
    expect(container.find(Input).length).toEqual(1);
    expect(container.find(TextEditor).length).toEqual(1);
    expect(container.find(RegexSection).length).toEqual(1);
  });
  it('clicking the "x" button or "close" button should call closeModal prop', () => {
    container.find('#activity-close-button').simulate('click');
    container.find('#activity-cancel-button').simulate('click');
    expect(mockProps.closeModal).toHaveBeenCalledTimes(2);
  });
  it('clicking submit button should submit activity', () => {
    container.find('#activity-submit-button').simulate('click');
    expect(mockProps.closeModal).toHaveBeenCalled();
  });
});
