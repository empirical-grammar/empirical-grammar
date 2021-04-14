import * as React from 'react';
import { shallow } from 'enzyme';

import RuleForm from '../configureRules/ruleForm';
import RuleGenericAttributes from '../configureRules/ruleGenericAttributes';
import RuleRegexAttributes from '../configureRules/ruleRegexAttributes';
import RulePrompts from '../configureRules/rulePrompts';

jest.mock('../../../helpers/comprehension/ruleHelpers', () => ({
  getInitialRuleType: jest.fn().mockImplementation(() => {
    return { value: 'rules-based-1', label: 'Sentence Structure Regex' }
   }),
  renderErrorsContainer: jest.fn().mockImplementation(() => {
    return <strong>error!</strong>
  }),
  formatInitialFeedbacks: jest.fn().mockImplementation(() => {
    return [{
      id: 7,
      description: null,
      order: 0,
      text: 'Revise your work. Delete the phrase "it contains methane" because it repeats the first part of the sentence',
      highlights_attributes: []
    }];
  })
}));

const mockRule = {
  id: 1,
  rule_type: 'rules-based-1' ,
  name: 'remove all instances of "it contains methane"',
  universal: false,
  optimal: false,
  suborder: 0,
  state: 'active',
  concept_uid: 'a34qreadbgt6',
  prompt_ids: [1, 2],
  feedbacks: [
    {
      id: 7,
      rule_id: 1,
      text: 'Revise your work. Delete the phrase "it contains methane" because it repeats the first part of the sentence',
      description: null,
      order: 0,
      highlights: []
    }
  ],
  regex_rules: [
    { id: 1, rule_id: 1, regex_text: 'it contain(s)? methane gas', case_sensitive: false },
    { id: 2, rule_id: 1, regex_text: 'another reg(ex) line', case_sensitive: true },
    { id: 3, rule_id: 1, regex_text: 'some m?ore reg(ex', case_sensitive: false }
  ]
}

const mockProps = {
  rule: mockRule,
  activityData: {
    name: 'test',
    title: 'test',
    scored_level: '7',
    target_level: 7
  },
  activityId : '1',
  closeModal: jest.fn(),
  requestErrors: [],
  submitRule: jest.fn(),
  isUniversal: false
};

describe('RuleForm component', () => {
  let container = shallow(<RuleForm {...mockProps} />);

  it('should render RuleForm', () => {
    expect(container).toMatchSnapshot();
  });

  it('should render a RuleGenericAttributes component and other expected components', () => {
    expect(container.find(RuleGenericAttributes).length).toEqual(1);
    expect(container.find(RuleRegexAttributes).length).toEqual(1);
    expect(container.find(RulePrompts).length).toEqual(1);
  });
  it('clicking the "x" button or "close" button should call closeModal prop', () => {
    container.find('#activity-close-button').simulate('click');
    container.find('#activity-cancel-button').simulate('click');
    expect(mockProps.closeModal).toHaveBeenCalledTimes(2);
  });
  it('displays request errors if prop is present', () => {
    mockProps.requestErrors = ['feedback.text: text is too short'];
    container = shallow(<RuleForm {...mockProps} />);
    expect(container.find('strong').length).toEqual(1);
  });
});
