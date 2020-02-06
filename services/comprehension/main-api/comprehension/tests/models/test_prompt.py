from unittest.mock import patch

from django.core.exceptions import ValidationError
from django.test import TestCase

from ..factories.ml_feedback import MLFeedbackFactory
from ..factories.ml_model import MLModelFactory
from ..factories.prompt import PromptFactory
from ..factories.rule_set import RuleSetFactory
from ..factories.rule import RuleFactory
from ...models.ml_model import MLModel
from ...models.prompt import Prompt
from ...models.rule_set import RuleSet
from ...utils import combine_labels


class PromptModelTest(TestCase):
    def setUp(self):
        self.prompt = PromptFactory()
        self.labels = ['Test1', 'Test2']
        combined_labels = combine_labels(self.labels)
        self.feedback = MLFeedbackFactory(combined_labels=combined_labels,
                                          prompt=self.prompt)
        self.default = MLFeedbackFactory(feedback='Default feedback',
                                         prompt=self.prompt)


class PromptValidationTest(PromptModelTest):
    def test_text_not_null(self):
        with self.assertRaises(ValidationError):
            Prompt.objects.create(max_attempts_feedback='foo',
                                  ml_model=MLModelFactory())

    def test_default_max_attempts(self):
        prompt = Prompt.objects.create(text='foo', max_attempts_feedback='bar',
                                       ml_model=MLModelFactory())
        self.assertEqual(prompt.max_attempts, 5)


class PromptFunctionTest(PromptModelTest):
    def test_max_attempts_feedback_not_null(self):
        with self.assertRaises(ValidationError):
            Prompt.objects.create(text='foo', ml_model=MLModelFactory())

    def test_get_for_labels_single_label(self):
        feedback = MLFeedbackFactory(combined_labels='Test1',
                                     prompt=self.prompt)
        retrieved_feedback = self.prompt._get_feedback_for_labels(['Test1'])
        self.assertEqual(feedback, retrieved_feedback)

    def test_get_for_labels_muiltiple_labels(self):
        retrieved_feedback = self.prompt._get_feedback_for_labels(self.labels)
        self.assertEqual(self.feedback, retrieved_feedback)

    @patch.object(Prompt, '_get_default_feedback')
    def test_get_for_labels_fallback_to_default(self, get_default_mock):
        get_default_mock.return_value = [self.default]
        self.prompt._get_feedback_for_labels(['Not', 'Used'])
        self.assertTrue(get_default_mock.called)

    def test_get_default(self):
        self.assertEqual(list(self.prompt._get_default_feedback()),
                         [self.default])


class PromptFetchAutoMLFeedbackTest(PromptModelTest):
    @patch.object(MLModel, 'request_single_label')
    def test_single_label(self, label_mock):
        feedback = MLFeedbackFactory(combined_labels='Test1',
                                     prompt=self.prompt)
        label_mock.return_value = ['Test1']
        response = self.prompt.fetch_auto_ml_feedback(None, multi_label=False)
        self.assertTrue(label_mock.called)
        self.assertEqual(feedback, response)

    @patch.object(MLModel, 'request_labels')
    def test_multi_label(self, label_mock):
        label_mock.return_value = ['Test1', 'Test2']
        response = self.prompt.fetch_auto_ml_feedback(None)
        self.assertTrue(label_mock.called)
        self.assertEqual(self.feedback, response)


@patch.object(MLModel, 'request_labels')
class PromptVariableAutoMLFeedbackTest(PromptModelTest):
    def setUp(self):
        super().setUp()
        self.feedback2 = MLFeedbackFactory(
            combined_labels=self.feedback.combined_labels,
            prompt=self.prompt,
            order=self.feedback.order + 1
        )

    def test_variable_feedback(self, label_mock):
        label_mock.return_value = ['Test1', 'Test2']
        mock_previous_feedback = [{
            'labels': self.feedback.combined_labels
        }]
        response = self.prompt.fetch_auto_ml_feedback(
            None,
            previous_feedback=mock_previous_feedback
        )
        self.assertTrue(label_mock.called)
        self.assertEqual(self.feedback2, response)

    def test_variable_feedback_wrap_around(self, label_mock):
        label_mock.return_value = ['Test1', 'Test2']
        mock_previous_feedback = [{
            'labels': self.feedback.combined_labels
        }, {
            'labels': self.feedback.combined_labels
        }]
        response = self.prompt.fetch_auto_ml_feedback(
            None,
            previous_feedback=mock_previous_feedback
        )
        self.assertTrue(label_mock.called)
        self.assertEqual(self.feedback, response)

    def test_exception_when_no_match_and_no_default(self, label_mock):
        self.default.delete()
        with self.assertRaises(Prompt.NoFeedbackOptionsToChooseFromError):
            self.prompt._choose_feedback(
                'combined_labels',
                previous_feedback=[],
                feedback_options=[])


class PromptFetchRulesBasedFeedbackTest(PromptModelTest):
    def test_first_pass(self):
        rule_set = (RuleSetFactory(
                    feedback='Test feedback',
                    pass_order=RuleSet.PASS_ORDER.FIRST,
                    prompt=self.prompt))
        RuleFactory(regex_text='^test', rule_set=rule_set)
        feedback = (self.prompt.
                    fetch_rules_based_feedback('incorrect test correct',
                                               RuleSet.PASS_ORDER.FIRST))
        self.assertFalse(feedback['optimal'])
        self.assertEqual(feedback['feedback'], 'Test feedback')

    def test_second_pass(self):
        rule_set = (RuleSetFactory(feedback='Test feedback',
                                   pass_order=RuleSet.PASS_ORDER.SECOND,
                                   prompt=self.prompt))
        RuleFactory(regex_text='^test', rule_set=rule_set)
        feedback = (self.prompt.
                    fetch_rules_based_feedback('incorrect test correct',
                                               RuleSet.PASS_ORDER.SECOND))
        self.assertFalse(feedback['optimal'])
        self.assertEqual(feedback['feedback'], 'Test feedback')

    def test_does_not_contain_regex(self):
        rule_set = (RuleSetFactory(
                    feedback='Test feedback',
                    pass_order=RuleSet.PASS_ORDER.FIRST,
                    prompt=self.prompt,
                    test_for_contains=False))
        RuleFactory(regex_text='does not contain', rule_set=rule_set)
        feedback = (self.prompt.
                    fetch_rules_based_feedback('test does not contain',
                                               RuleSet.PASS_ORDER.FIRST))
        self.assertFalse(feedback['optimal'])
        self.assertEqual(feedback['feedback'], 'Test feedback')

    def test_two_rules_in_rule_set(self):
        rule_set = (RuleSetFactory(
                    feedback='Test feedback',
                    pass_order=RuleSet.PASS_ORDER.FIRST,
                    prompt=self.prompt,
                    test_for_contains=True))

        RuleFactory(regex_text='^test', rule_set=rule_set)
        RuleFactory(regex_text='^teeest', rule_set=rule_set)

        feedback = (self.prompt.
                    fetch_rules_based_feedback('teeest test correct',
                                               RuleSet.PASS_ORDER.FIRST))
        feedback_two = (self.prompt.
                        fetch_rules_based_feedback('test test correct',
                                                   RuleSet.PASS_ORDER.FIRST))
        feedback_three = (self.prompt.
                          fetch_rules_based_feedback('teest test incorrect',
                                                     RuleSet.PASS_ORDER.FIRST))
        self.assertTrue(feedback['optimal'])
        self.assertTrue(feedback_two['optimal'])
        self.assertFalse(feedback_three['optimal'])
