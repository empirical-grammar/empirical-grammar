import React from 'react';
import { shallow } from 'enzyme';
import { LessonForm } from '../lessonForm';
import {
  SortableList,
  TextEditor
} from 'quill-component-library/dist/componentLibrary';
import { EditorState, ContentState } from 'draft-js'
import ChooseModel from '../chooseModel.jsx'
import _ from 'underscore';
import { NameInput } from '../lessonFormComponents.tsx';

describe('LessonForm component', () => {
    const mockQuestions = [
        { key: '-KOqLeXEvMjNuE6MGOop', questionType: 'sentenceFragments' },
        { key: '-KdCgy8wt_rQiYpOURdW', questionType: 'fillInBlank' },
        { key: '-KdChHgbE9377Jgzkoci', questionType: 'fillInBlank' }
    ];
    const mockQuestionData = {
        '-KOqLeXEvMjNuE6MGOop': {
            conceptID: 'b5JpyWZYjhb94LTXGmYy7g',
            flag: 'production',
            key: '-KOqLeXEvMjNuE6MGOop',
            prompt: 'How much cheese is too much cheese?',
            title: 'Question 1'
        },
        '-KdCgy8wt_rQiYpOURdW': {
            conceptID: 'b5JpyWZYjhb94LTXGmYy7g',
            flag: 'production',
            key: '-KdCgy8wt_rQiYpOURdW',
            prompt: 'What is the best way to cultivate mass?',
            title: 'Question 2'
        },
        '-KdChHgbE9377Jgzkoci': {
            conceptID: 'b5JpyWZYjhb94LTXGmYy7g',
            flag: 'production',
            key: '-KdChHgbE9377Jgzkoci',
            prompt: 'Do jobs grow on jobbies?',
            title: 'Question 3'
        }
    };
    const mockProps = {
        currentValues: {
            flag: 'beta', 
            isELL: true, 
            landingPageHtml: '<p>Test content</p>', 
            modelConceptUID: 'QsC1lua0t41_J2em_c7kUA', 
            name: 'Awesome Diagnostic',
            questions: mockQuestions
        },
        lesson: {
            flag: 'beta', 
            isELL: true, 
            landingPageHtml: '<p>Test content</p>', 
            modelConceptUID: 'QsC1lua0t41_J2em_c7kUA', 
            name: 'Awesome Diagnostic',
            questions: mockQuestions
        },
        submit: jest.fn(),
        questions: {
            hasreceiveddata: true, 
            submittingnew: false, 
            states: {}, 
            data: mockQuestionData
        },
        concepts: {
            hasreceiveddata: true, 
            submittingnew: false, 
            states: {}, 
            data: {
                0: [{
                        id: 589,
                        name: 'Past Perfect',
                        parent_id: 572,
                        uid: 'b5JpyWZYjhb94LTXGmYy7g',
                        description: null,
                        level: 0,
                        displayName: 'Verbs | Perfect Tense | Past Perfect'
                    }]
            }
        },
        sentenceFragments: {
            hasreceiveddata: true, 
            submittingnew: false, 
            states: {}, 
            data: mockQuestionData
        },
        conceptsFeedback: {
            hasreceiveddata: true, 
            submittingnew: false, 
            states: {}, 
            data: mockQuestionData
        },
        fillInBlank: {
            hasreceiveddata: true, 
            submittingnew: false, 
            states: {}, 
            data: mockQuestionData
        },
        titleCards: {
            hasreceiveddata: true, 
            data: {}
        },
        dispatch: jest.fn()
    };
    const container = shallow(<LessonForm {...mockProps} />);
    it('renders NameInput, TextEditor and ChooseModel components, passing expected props', () => {
        const handleStateChange = container.instance().handleStateChange;
        const handleLPChange = container.instance().handleLPChange;
        const handleUpdateModelConcept = container.instance().handleUpdateModelConcept;
        const nameInput= container.find(NameInput);
        const textEditor = container.find(TextEditor);
        const chooseModel = container.find(ChooseModel);

        expect(nameInput.length).toEqual(1);
        expect(TextEditor.length).toEqual(1);
        expect(chooseModel.length).toEqual(1);
        expect(nameInput.props().name).toEqual('Awesome Diagnostic');
        expect(nameInput.props().onHandleChange).toEqual(handleStateChange);
        expect(textEditor.props().ContentState).toEqual(ContentState);
        expect(textEditor.props().EditorState).toEqual(EditorState);
        expect(textEditor.props().handleTextChange).toEqual(handleLPChange);
        expect(textEditor.props().text).toEqual('<p>Test content</p>');
        expect(chooseModel.props().conceptsFeedback).toEqual(mockProps.conceptsFeedback);
        expect(chooseModel.props().modelConceptUID).toEqual('QsC1lua0t41_J2em_c7kUA');
        expect(chooseModel.props().onUpdateModelConcept).toEqual(handleUpdateModelConcept);
    });
    it('handleSubmit calls submit() prop function passing name, questions: selectedQuestions, landingPageHtml, flag, modelConceptUID, and isELL as arguments', () => {
        const { name, selectedQuestions, landingPageHtml, flag, modelConceptUID, isELL } = container.state();
        const argument = {
            name,
            questions: selectedQuestions,
            landingPageHtml,
            flag,
            modelConceptUID,
            isELL
        };
        container.instance().handleSubmit();
        expect(mockProps.submit).toHaveBeenCalledWith(argument);
    });
    it('handleStateChange updates specific piece of state, using key and event arguments to build object to pass to setState', () => {
        const event = {
            target: {
                value: 'Even Moar Awesome Diagnostic'
            }
        };
        container.instance().handleStateChange('name', event);
        expect(container.state().name).toEqual('Even Moar Awesome Diagnostic');
    });
    it('handleChange updates selectedQuestions piece of state if question is added or deleted', () => {
        container.instance().handleChange('-KdChHgbE9212Jgzkoci');
        expect(container.state().selectedQuestions.length).toEqual(4);
        expect(container.state().selectedQuestions[3]).toEqual({ key: '-KdChHgbE9212Jgzkoci', questionType: 'questions'});
        container.instance().handleChange('-KdChHgbE9212Jgzkoci');
        expect(container.state().selectedQuestions.length).toEqual(3);
    });
    it('handleSearchChange calls handleChange, passing e.value as an argument', () => {
        const handleChange = jest.spyOn(container.instance(), 'handleChange');
        const e = { value: 'saideira'};
        container.instance().handleSearchChange(e);
        expect(handleChange).toHaveBeenCalledWith('saideira');
    });
    it('sortCallback sets selectedQuestion piece of state to reordered array of questions', () => {
        const sortInfo = {
            data: {
                draggingIndex: null,
                items: [
                    {
                        $$typeof: 'Symbol(react.element)',
                        type: 'p',
                        key: '-KdCgy8wt_rQiYpOURdW',
                        ref: null,
                        props: {
                            className: 'sortable-list-item',
                            questionType: 'fillInBlank',
                            children: []
                        }
                    },
                    {
                        $$typeof: 'Symbol(react.element)',
                        type: 'p',
                        key: '-KOqLeXEvMjNuE6MGOop',
                        ref: null,
                        props: {
                            className: 'sortable-list-item',
                            questionType: 'sentenceFragments',
                            children: []
                        }
                    },
                    {
                        $$typeof: 'Symbol(react.element)',
                        type: 'p',
                        key: '-KdChHgbE9377Jgzkoci',
                        ref: null,
                        props: {
                            className: 'sortable-list-item',
                            questionType: 'fillInBlank',
                            children: []
                        }
                    },
                ]
            }
        };
        const newOrder = [
            { key: '-KdCgy8wt_rQiYpOURdW', questionType: 'fillInBlank' },
            { key: '-KOqLeXEvMjNuE6MGOop', questionType: 'sentenceFragments' },
            { key: '-KdChHgbE9377Jgzkoci', questionType: 'fillInBlank' }
        ];
        container.instance().sortCallback(sortInfo);
        expect(container.state().selectedQuestions).toEqual(newOrder);
    });
    it('renderQuestionSelect renders a SortableList component of selectedQuestions', () => {
        const sortableList = container.find(SortableList);
        const getQuestionKey = i => sortableList.props().data[i].key;
        container.instance().renderQuestionSelect();
        expect(sortableList.length).toEqual(1);
        expect(getQuestionKey(0)).toEqual('-KdCgy8wt_rQiYpOURdW')
        expect(getQuestionKey(1)).toEqual('-KOqLeXEvMjNuE6MGOop')
        expect(getQuestionKey(2)).toEqual('-KdChHgbE9377Jgzkoci')
    });
    it('renderSearchBox renders a QuestionSelector component with question options', () => {
        const handleSearchChange = container.instance().handleSearchChange;
        const questionSelector = container.find('OnClickOutside(SelectSearch)');
        const getQuestionName = i => questionSelector.props().options[i].name;
        container.instance().renderSearchBox();
        expect(questionSelector.length).toEqual(1);
        expect(questionSelector.props().onChange).toEqual(handleSearchChange);
        expect(getQuestionName(0)).toEqual('How much cheese is too much cheese?');
        expect(getQuestionName(1)).toEqual('What is the best way to cultivate mass?');
        expect(getQuestionName(2)).toEqual('Do jobs grow on jobbies?');
    });
    it('handleSelectFlag updates the flag piece of state', () => {
        const e = {
            target: {
                value: 'alpha'
            }
        };
        container.instance().handleSelectFlag(e);
        expect(container.state().flag).toEqual('alpha');
    });
    it('handleSelectQuestionType updates the questionType piece of state', () => {
        const e = {
            target: {
                value: 'fillInBlank'
            }
        };
        container.instance().handleSelectQuestionType(e);
        expect(container.state().questionType).toEqual('fillInBlank');
    });
    it('handleLPChange updates the landingPageHtml piece of state', () => {
        const e = '<p>Updated Content</p>'
        container.instance().handleLPChange(e);
        expect(container.state().landingPageHtml).toEqual(e);
    });
    it('handleELLChange updates isELL piece of state', () => {
        container.instance().handleELLChange();
        expect(container.state().isELL).toEqual(false);
    });
    it('handleUpdateModelConcept updates modelConceptUID piece of state', () => {
        container.instance().handleUpdateModelConcept('new-id');
        expect(container.state().modelConceptUID).toEqual('new-id');
    });
});