// TODO: update to reflect the accurate option values

export const flagOptions = [
  {
    label: 'alpha',
    value: 'alpha'
  },
  {
    label: 'beta',
    value: 'beta'
  },
  {
    label: 'production',
    value: 'production'
  },
  {
    label: 'archived',
    value: 'archived'
  },
];

export const courseOptions = [
  {
    label: 'Word Generation',
    value: 'Word Generation'
  }
];

export const readingLevelOptions = [
  {
    label: '4th',
    value: 4
  },
  {
    label: '5th',
    value: 5
  },
  {
    label: '6th',
    value: 6
  },
  {
    label: '7th',
    value: 7
  },
  {
    label: '8th',
    value: 8
  },
  {
    label: '9th',
    value: 9
  },
  {
    label: '10th',
    value: 10
  },
  {
    label: '11th',
    value: 11
  },
  {
    label: '12th',
    value: 12
  },
];

export const BECAUSE = 'because';
export const BUT = 'but';
export const SO = 'so';
export const promptStems = [BECAUSE, BUT, SO];
export const DEFAULT_MAX_ATTEMPTS = 5;

export const blankActivity = { 
  title: '', 
  // flag:'',
  scored_level: '',
  target_level: null,
  passage_attributes: [{ text: '' }],
  prompt_attributes: [
    {
      conjunction: 'because',
      text: '',
      max_attempts: 5,
      max_attempts_feedback: 'try again.'
    },
    {
      conjunction: 'but',
      text: '',
      max_attempts: 5,
      max_attempts_feedback: 'try again.'
    },
    {
      conjunction: 'so',
      text: '',
      max_attempts: 5,
      max_attempts_feedback: 'try again.'
    }
  ]
}

export const blankRuleSet = {
	name: '',
  feedback: '',
  priority: null,
	rules: [], 
  prompts: []
}

export const TITLE = 'Title';
export const SCORED_READING_LEVEL = 'Scored reading level';
export const TARGET_READING_LEVEL = 'Target reading level';
export const MAX_ATTEMPTS_FEEDBACK = 'Max attempts feedback';
export const PASSAGE = 'Passage';
export const BECAUSE_STEM = 'Because stem';
export const BUT_STEM = 'But stem';
export const SO_STEM = 'So stem';

export const activityFormKeys = [
  TITLE,
  SCORED_READING_LEVEL,
  TARGET_READING_LEVEL,
  MAX_ATTEMPTS_FEEDBACK,
  PASSAGE,
  BECAUSE_STEM,
  BUT_STEM,
  SO_STEM
];

export const MINIMUM_READING_LEVEL = 4;
export const MAXIMUM_READING_LEVEL = 12;
