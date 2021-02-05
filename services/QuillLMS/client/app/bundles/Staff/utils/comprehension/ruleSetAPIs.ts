import { RuleInterface } from '../../interfaces/comprehensionInterfaces';
import { handleApiError, apiFetch } from '../../helpers/comprehension';

export const fetchRules = async (key: string, activityId: string) => {
  const response = await apiFetch(`activities/${activityId}/rules`);
  const rules = await response.json();
  // rulesets.forEach((ruleset) => { ruleset.rules = ruleset.regex_rules });
  return {
    error: handleApiError('Failed to fetch rules, please refresh the page.', response),
    rules: rules
  };
}

export const fetchRuleSet = async (key: string, activityId: string, ruleSetId: string) => {
  let ruleset: RuleInterface;
  const response = await apiFetch(`activities/${activityId}/rule_sets/${ruleSetId}`);
  ruleset = await response.json();
  ruleset.rules = ruleset.regex_rules;
  return {
    error: handleApiError('Failed to fetch rule set, please refresh the page.', response),
    ruleset
  };
}

export const fetchRule = async (key: string, ruleId: string) => {
  const response = await apiFetch(`rules/${ruleId}`);
  const rule = await response.json();
  return {
    error: handleApiError('Failed to fetch rule, please refresh the page.', response),
    rule
  };
}

export const deleteRule = async (ruleId: string) => {
  const response = await apiFetch(`rules/${ruleId}`, {
    method: 'DELETE'
  });
  return { error: handleApiError('Failed to delete rule, please try again.', response)};
}

export const createRule = async (rule: RuleInterface) => {
  const response = await apiFetch(`rules`, {
    method: 'POST',
    body: JSON.stringify(rule)
  });
  const newRule = await response.json();
  return { error: handleApiError('Failed to create rule, please try again.', response), rule: newRule };
}

export const updateRule = async (ruleId: number, rule: RuleInterface) => {
  const response = await apiFetch(`rules/${ruleId}`, {
    method: 'PUT',
    body: JSON.stringify({ rule })
  });
  return { error: handleApiError('Failed to update rule, please try again.', response) };
}
