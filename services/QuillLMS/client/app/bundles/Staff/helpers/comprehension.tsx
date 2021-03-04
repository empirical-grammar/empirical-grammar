import * as React from "react";
import stripHtml from "string-strip-html";

import {
  promptStems,
  DEFAULT_MAX_ATTEMPTS,
  BECAUSE,
  BUT,
  SO,
  MINIMUM_READING_LEVEL,
  MAXIMUM_READING_LEVEL,
  TARGET_READING_LEVEL,
  SCORED_READING_LEVEL
} from '../../../constants/comprehension';
import { PromptInterface } from '../interfaces/comprehensionInterfaces'

const quillCheckmark = 'https://assets.quill.org/images/icons/check-circle-small.svg';
const baseUrl = `${process.env.DEFAULT_URL}/api/v1/comprehension/`;
const fetchDefaults = require("fetch-defaults");

export const apiFetch = fetchDefaults(fetch, baseUrl, {
  headers: {
    "Accept": "application/JSON",
    "Content-Type": "application/json",
    "X-CSRF-Token": localStorage.getItem('csrfToken')
  }
})

export const getPromptsIcons = (activityData, promptIds: number[]) => {
  if(activityData && activityData.activity && activityData.activity.prompts) {
    const { activity } = activityData;
    const { prompts } = activity;
    const attachedPrompts = prompts.filter(prompt => promptIds.includes(prompt.id));
    const icons = {};
    attachedPrompts.forEach(prompt => {
      const { conjunction } = prompt;
      if(promptStems.includes(conjunction)) {
        icons[conjunction] = (<img alt="quill-circle-checkmark" src={quillCheckmark} />)
      } else {
        icons[conjunction] = (<div />);
      }
    });
    return icons;
  }
  return {};
}

export const getUniversalIcon = (universal: boolean) => {
  if(universal) {
    return (<img alt="quill-circle-checkmark" src={quillCheckmark} />)
  } else {
    return (<div />);
  }
}

export const buildBlankPrompt = (conjunction: string) => {
  return {
    conjunction: conjunction,
    text: '',
    max_attempts: DEFAULT_MAX_ATTEMPTS,
    max_attempts_feedback: '',
    plagiarism_text: '',
    plagiarism_first_feedback: '',
    plagiarism_second_feedback: ''
  }
}

export const buildActivity = ({
  activityTitle,
  activityScoredReadingLevel,
  activityTargetReadingLevel,
  activityParentActivityId,
  activityPassages,
  activityMaxFeedback,
  activityBecausePrompt,
  activityButPrompt,
  activitySoPrompt
}) => {
  // const { label } = activityFlag;
  const prompts = [activityBecausePrompt, activityButPrompt, activitySoPrompt];
  return {
    activity: {
      title: activityTitle,
      parent_activity_id: parseInt(activityParentActivityId),
      // flag: label,
      scored_level: activityScoredReadingLevel,
      target_level: parseInt(activityTargetReadingLevel),
      passages_attributes: activityPassages,
      prompts_attributes: prompts
    }
  };
}

export const formatPrompts = ({ activityData, rule, setRulePrompts }) => {
  let checkedPrompts = {};
  let formatted = {};

  // get ids of all applied prompts
  rule && rule.prompt_ids && rule.prompt_ids.forEach(id => {
    checkedPrompts[id] = true;
  });

  // use activity data to apply each prompt ID
  activityData && activityData.prompts && activityData.prompts.forEach((prompt: PromptInterface) => {
    const { conjunction, id } = prompt;
    formatted[conjunction] = {
      id,
      checked: !!checkedPrompts[id]
    };
  });

  setRulePrompts(formatted);
}

export const formatRegexRules = ({ rule, setRegexRules }) => {
  let formatted = {};
  rule && rule.regex_rules && rule.regex_rules.map((rule, i) => {
    const { case_sensitive, id, regex_text } = rule;
    const formattedRule = {
      id: id,
      case_sensitive: case_sensitive,
      regex_text: regex_text
    }
    formatted[`regex-rule-${i}`] = formattedRule;
  });
  setRegexRules(formatted);
}

export const promptsByConjunction = (prompts: PromptInterface[]) => {
  const formattedPrompts = {};
  prompts && prompts.map((prompt: PromptInterface) => formattedPrompts[prompt.conjunction] = prompt);
  return formattedPrompts;
}

export function getActivityPrompt({
  activityBecausePrompt,
  activityButPrompt,
  activitySoPrompt,
  conjunction
}) {
  let prompt;
  switch(conjunction) {
    case BECAUSE:
      prompt = {...activityBecausePrompt};
      break;
    case BUT:
      prompt = {...activityButPrompt};
      break;
    case SO:
      prompt = {...activitySoPrompt};
      break;
    default:
      prompt;
  }
  return prompt;
};

export function getActivityPromptSetter({
  setActivityBecausePrompt,
  setActivityButPrompt,
  setActivitySoPrompt,
  conjunction
}) {
  let updatePrompt;
  switch(conjunction) {
    case BECAUSE:
      updatePrompt = setActivityBecausePrompt;
      break;
    case BUT:
      updatePrompt = setActivityButPrompt;
      break;
    case SO:
      updatePrompt = setActivitySoPrompt;
      break;
    default:
      updatePrompt;
  }
  return updatePrompt;
};

export function getPromptForActivitySession(sessionData: any, index: number) {
  if(!sessionData) {
    return null;
  }
  const { prompts } = sessionData;
  return prompts[index];
}

const targetReadingLevelError = (value: string) => {
  if(!value) {
    return `${TARGET_READING_LEVEL} must be a number between 4 and 12, and cannot be blank.`
  }
  const num = parseInt(value);
  if(num < MINIMUM_READING_LEVEL || num > MAXIMUM_READING_LEVEL) {
    return `${TARGET_READING_LEVEL} must be a number between ${MINIMUM_READING_LEVEL} and ${MAXIMUM_READING_LEVEL}.`
  }
}

const scoredReadingLevelError = (value: string) => {
  if(value === '') {
    return;
  }
  const num = parseInt(value);
  if(isNaN(num) || num < 4 || num > 12) {
    return `${SCORED_READING_LEVEL} must be a number between 4 and 12, or left blank.`;
  }
}

export const validateForm = (keys: string[], state: any[]) => {
  let errors = {};
  state.map((value, i) => {
    switch(keys[i]) {
      case TARGET_READING_LEVEL:
        const targetError = targetReadingLevelError(value);
        if(targetError) {
          errors[TARGET_READING_LEVEL] = targetError;
        }
        break;
      case SCORED_READING_LEVEL:
        const scoredError = scoredReadingLevelError(value);
        if(scoredError) {
          errors[SCORED_READING_LEVEL] = scoredError
        }
        break;
      case "Stem Applied":
        const stemApplied = Object.keys(value).some(stem => value[stem].checked);
        if(!stemApplied) {
          errors[keys[i]] = 'You must select at least one stem.';
        }
        break;
      case "Concept UID":
        if(!value) {
          errors[keys[i]] = 'Concept UID cannot be blank. Default for plagiarism rules is "Kr8PdUfXnU0L7RrGpY4uqg"'
        }
        break;
      default:
        const strippedValue = value && stripHtml(value);
        if(!strippedValue || strippedValue.length === 0) {
          errors[keys[i]] = `${keys[i]} cannot be blank.`;
        }
     }
  });
  return errors;
}

// not a 2xx status
export const requestFailed = (status: number ) => Math.round(status / 100) !== 2;

export const buildErrorMessage = (errors: object) => Object.values(errors).join(', ');

export const handleApiError = (errorMessage: string, response: any) => {
  let error: string;
  const { status } = response;
  if(requestFailed(status)) {
    error = errorMessage;
  }
  return error;
}

export const getCsrfToken = () => {
  const token = document.querySelector('meta[name="csrf-token"]')
  if (token) { return token.getAttribute('content') }
};
