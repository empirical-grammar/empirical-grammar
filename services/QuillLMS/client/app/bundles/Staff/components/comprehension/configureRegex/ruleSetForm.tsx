import * as React from "react";
import { Input, TextEditor } from 'quill-component-library/dist/componentLibrary';
import { EditorState, ContentState } from 'draft-js'
import { validateForm } from '../../../../../helpers/comprehension';
import { BECAUSE, BUT, SO } from '../../../../../constants/comprehension';
import { ActivityRuleSetInterface, PromptInterface } from '../../../interfaces/comprehensionInterfaces';
import RegexSection from './regexSection';
import useSWR from 'swr';

interface RuleSetFormProps {
  activityRuleSet: ActivityRuleSetInterface,
  closeModal: (event: React.MouseEvent) => void,
  submitRuleSet: (ruleSet: ActivityRuleSetInterface) => void
}
type InputEvent = React.ChangeEvent<HTMLInputElement>;

const RuleSetForm = ({ activityRuleSet, closeModal, submitRuleSet }: RuleSetFormProps) => {

  // get cached activity data 
  const { data } = useSWR("activity");
  const { feedback, id, name, rules } = activityRuleSet;
  const [ruleSetName, setRuleSetName] = React.useState<string>(name || '');
  const [ruleSetFeedback, setRuleSetFeedback] = React.useState<string>(feedback || '');
  const [ruleSetPrompts, setRuleSetPrompts] = React.useState<{}>({})
  const [regexRules, setRegexRules] = React.useState<{}>({})
  const [errors, setErrors] = React.useState<{}>({});

  React.useEffect(() => {  
    formatPrompts();
    formatRegexRules();
  }, []);

  const formatPrompts = () => {
    let checkedPrompts = {};
    let formatted = {};

    // get ids of all applied prompts 
    activityRuleSet && activityRuleSet.prompts && activityRuleSet.prompts.forEach(prompt => {
      const { id } = prompt;
      checkedPrompts[id] = true;
    });

    // use activity data to apply each prompt ID
    data && data.prompts && data.prompts.forEach((prompt: PromptInterface) => {
      const { conjunction, prompt_id } = prompt;
      formatted[conjunction] = {
        id: prompt_id,
        checked: !!checkedPrompts[prompt_id] 
      };
    });
    setRuleSetPrompts(formatted);
  }

  const formatRegexRules = () => {
    let formatted = {};
    rules && rules.map((rule, i) => {
      formatted[`regex-rule-${i}`] = rule;
    });
    setRegexRules(formatted);
  }

  const buildRuleSet = () => {
    const promptIds = [];
    const rules = [];
    const ruleSet = {
      id: id || null,
      name: ruleSetName,
      feedback: ruleSetFeedback,
      prompt_ids: [],
      rules: []
    };
    Object.keys(ruleSetPrompts).forEach(key => {
      ruleSetPrompts[key].checked && promptIds.push(ruleSetPrompts[key].id);
    });
    Object.keys(regexRules).forEach(key => {
      rules.push(regexRules[key]);
    });
    ruleSet.prompt_ids = promptIds;
    ruleSet.rules = rules;
    return ruleSet;
  }

  const handleSetRuleSetName = (e: InputEvent) => { setRuleSetName(e.target.value) };
  const handleSetRuleSetFeedback = (text: string) => { setRuleSetFeedback(text) };
  const handleRuleSetPromptChange = (e: InputEvent) => {
    const { target } = e;
    const { id, value } = target;
    let updatedPrompts = {...ruleSetPrompts};
    const checked = updatedPrompts[value].checked
    updatedPrompts[value] = {
      id: parseInt(id),
      checked: !checked
    };
    setRuleSetPrompts(updatedPrompts);
  };

  const handleSubmitRuleSet = () => {
    const ruleSet = buildRuleSet();
    const keys = ['Name', 'Feedback'];
    const state = [ruleSetName, ruleSetFeedback];
    // add input values of each regex rule
    Object.keys(regexRules).map((key, i) => {
      keys.push(`Regex rule ${i + 1}`);
      state.push(regexRules[key].regex_text);
    });
    const validationErrors = validateForm(keys, state);
    if(validationErrors && !!Object.keys(validationErrors).length) {
      setErrors(validationErrors);
    } else {
      submitRuleSet(ruleSet);
    }
  }

  const handleSetRegexRule = (e: InputEvent) => {
    const { target } = e;
    const { id, type, value } = target;
    let updatedRules = {...regexRules};
    if(type === 'checkbox') {
      updatedRules[value].case_sensitive = !regexRules[value].case_sensitive;
    } else {
      updatedRules[id].regex_text = value;
    }
    setRegexRules(updatedRules);
  }

  const handleAddRegexInput = () => {
    let updatedRules = {...regexRules};
    let id = Object.keys(updatedRules).length;
    const newRegexRule = { regex_text: '', case_sensitive: false };
    // increment id so exisiting rules are not overwritten
    while(updatedRules[`regex-rule-${id}`] ) {
      id += 1;
    }
    updatedRules[`regex-rule-${id}`] = newRegexRule;
    setRegexRules(updatedRules);
  }

  const handleDeleteRegexRule = (e: InputEvent) => {
    const { target } = e;
    const { value } = target;
    let updatedRules = {...regexRules};
    delete updatedRules[value];
    setRegexRules(updatedRules);
  }

  const becausePrompt = ruleSetPrompts[BECAUSE];
  const butPrompt = ruleSetPrompts[BUT];
  const soPrompt = ruleSetPrompts[SO];
  const errorsPresent = !!Object.keys(errors).length;

  return(
    <div className="ruleset-form-container">
      <div className="close-button-container">
        <button className="quill-button fun primary contained" id="activity-close-button" onClick={closeModal} type="submit">x</button>
      </div>
      <form className="ruleset-form">
        <Input
          className="name-input"
          error={errors['Name']}
          handleChange={handleSetRuleSetName}
          label="Name"
          value={ruleSetName}
        />
        <p className="form-subsection-label">Feedback</p>
        <TextEditor
          ContentState={ContentState}
          EditorState={EditorState}
          handleTextChange={handleSetRuleSetFeedback}
          key="feedback-description"
          text={ruleSetFeedback}
        />
        {errors['Feedback'] && <p className="error-message">{errors['Feedback']}</p>}
        <p className="form-subsection-label">Apply To Stems</p>
        <div className="checkboxes-container">
          <div className="checkbox-container">
            <label htmlFor={becausePrompt && becausePrompt.id} id="stem-label-1">Because</label>
            <input
              aria-labelledby="stem-label-1"
              checked={becausePrompt && becausePrompt.checked}
              id={becausePrompt && becausePrompt.id}
              name="Because"
              onChange={handleRuleSetPromptChange}
              type="checkbox"
              value="because"
            />
          </div>
          <div className="checkbox-container">
            <label htmlFor={butPrompt && butPrompt.id} id="stem-label-2">But</label>
            <input
              aria-labelledby="stem-label-2"
              checked={butPrompt && butPrompt.checked}
              id={butPrompt && butPrompt.id}
              name="But"
              onChange={handleRuleSetPromptChange}
              type="checkbox"
              value="but"
            />
          </div>
          <div className="checkbox-container">
            <label htmlFor={soPrompt && soPrompt.id} id="stem-label-3">So</label>
            <input
              aria-labelledby="stem-label-3"
              checked={soPrompt && soPrompt.checked}
              id={soPrompt && soPrompt.id}
              name="So"
              onChange={handleRuleSetPromptChange}
              type="checkbox"
              value="so"
            />
          </div>
        </div>
        <p className="form-subsection-label" id="regex-rules-label">Regex Rules</p>
        <RegexSection 
          errors={errors}
          handleAddRegexInput={handleAddRegexInput} 
          handleDeleteRegexRule={handleDeleteRegexRule} 
          handleSetRegexRule={handleSetRegexRule}
          regexRules={regexRules}
        />
        <div className="submit-button-container">
          {errorsPresent && <div className="error-message-container">
            <p className="all-errors-message">Please check that all fields have been completed correctly.</p>
          </div>}
          <button className="quill-button fun primary contained" id="activity-submit-button" onClick={handleSubmitRuleSet} type="button">
            Submit
          </button>
          <button className="quill-button fun primary contained" id="activity-cancel-button" onClick={closeModal} type="submit">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default RuleSetForm;
