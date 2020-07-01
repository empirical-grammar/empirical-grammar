export interface ActivityRouteProps { 
  activityId: string 
}

export interface ActivityRuleSetInterface {
  id?: number,
	name: string,
  feedback: string,
  rules?: RegexRuleInterface[],
  prompts?: ActivityRuleSetPrompt[],
  prompt_ids?: number[]
}

export interface ActivityInterface {
  id?: string,
  title: string,
  // flag: string,
  scored_level: string,
  target_level: number,
  passages?: PassagesInterface[],
  prompts?: PromptInterface[],
  passage_attributes?: PassagesInterface[],
  prompt_attributes?: PromptInterface[]
}

export interface PromptInterface {
  id?: number,
  conjunction: string,
  text: string,
  max_attempts: number,
  max_attempts_feedback: string
}

export interface RegexRuleInterface {
  id?: number,
  regex_text: string,
  case_sensitive: boolean
}

export interface FlagInterface {
  label: string,
  value: {}
}

export interface ActivityRuleSetPrompt {
  id?: number,
  conjunction: string
}

export interface TurkSessionInterface {
  id: number
  activity_id: number, 
  expires_at: string,
  expired: boolean
}

export interface PassagesInterface {
  id?: number,
  text: string
}
