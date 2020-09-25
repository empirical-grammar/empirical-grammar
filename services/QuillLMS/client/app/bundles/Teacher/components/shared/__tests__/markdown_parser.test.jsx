import React from 'react';
import { shallow } from 'enzyme';
import ReactMarkdown from 'react-markdown'

import MarkdownParser from '../markdown_parser';


describe('MarkdownParser component', () => {

  it('should render <ReactMarkdown />', () => {
    const wrapper = shallow(
      <MarkdownParser markdownText="" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render <ReactMarkdown /> with source equal to markdownText prop', () => {
    const wrapper = shallow(
      <MarkdownParser markdownText="## I am an h2 tag." />
    );
    expect(wrapper.find(ReactMarkdown).props().source).toBe("## I am an h2 tag.");
  });

});
