import * as React from "react";
import { EditorState, ContentState } from 'draft-js';

import PromptsForm from './promptsForm';

// import { flagOptions } from '../../../../../constants/comprehension'
import { validateForm, buildActivity, buildBlankPrompt, promptsByConjunction, getActivityPrompt, getActivityPromptSetter, renderIDorUID } from '../../../helpers/comprehension';
import {
  BECAUSE,
  BUT,
  SO,
  activityFormKeys,
  TITLE,
  NAME,
  SCORED_READING_LEVEL,
  TARGET_READING_LEVEL,
  MAX_ATTEMPTS_FEEDBACK,
  PASSAGE,
  IMAGE_LINK,
  IMAGE_ALT_TEXT,
  PARENT_ACTIVITY_ID
} from '../../../../../constants/comprehension';
import { ActivityInterface, PromptInterface, PassagesInterface, InputEvent } from '../../../interfaces/comprehensionInterfaces';
import { Input, TextEditor, } from '../../../../Shared/index'

interface ActivityFormProps {
  activity: ActivityInterface,
  closeModal: (event: React.MouseEvent) => void,
  submitActivity: (activity: object) => void
}

const ActivityForm = ({ activity, closeModal, submitActivity }: ActivityFormProps) => {

  const { parent_activity_id, passages, prompts, scored_level, target_level, title, name, } = activity;
  // const formattedFlag = flag ? { label: flag, value: flag } : flagOptions[0];
  const formattedScoredLevel = scored_level || '';
  const formattedTargetLevel = target_level ? target_level.toString() : '';
  const formattedPassage = passages && passages.length ? passages : [{ text: ''}];
  let formattedMaxFeedback;
  if(prompts && prompts[0] && prompts[0].max_attempts_feedback) {
    formattedMaxFeedback = prompts[0].max_attempts_feedback
  } else {
    formattedMaxFeedback = 'Nice effort! You worked hard to make your sentence stronger.';
  }
  const formattedPrompts = promptsByConjunction(prompts);
  const becausePrompt = formattedPrompts && formattedPrompts[BECAUSE] ? formattedPrompts[BECAUSE] : buildBlankPrompt(BECAUSE);
  const butPrompt = formattedPrompts && formattedPrompts[BUT] ? formattedPrompts[BUT] : buildBlankPrompt(BUT);
  const soPrompt = formattedPrompts && formattedPrompts[SO] ? formattedPrompts[SO] : buildBlankPrompt(SO);

  const [activityTitle, setActivityTitle] = React.useState<string>(title || '');
  const [activityName, setActivityName] = React.useState<string>(name || '');
  // const [activityFlag, setActivityFlag] = React.useState<FlagInterface>(formattedFlag);
  const [activityScoredReadingLevel, setActivityScoredReadingLevel] = React.useState<string>(formattedScoredLevel);
  const [activityTargetReadingLevel, setActivityTargetReadingLevel] = React.useState<string>(formattedTargetLevel);
  const [activityPassages, setActivityPassages] = React.useState<PassagesInterface[]>(formattedPassage);
  const [activityMaxFeedback, setActivityMaxFeedback] = React.useState<string>(formattedMaxFeedback)
  const [activityBecausePrompt, setActivityBecausePrompt] = React.useState<PromptInterface>(becausePrompt);
  const [activityButPrompt, setActivityButPrompt] = React.useState<PromptInterface>(butPrompt);
  const [activitySoPrompt, setActivitySoPrompt] = React.useState<PromptInterface>(soPrompt);
  const [errors, setErrors] = React.useState<{}>({});

  function handleSetActivityTitle(e: InputEvent){ setActivityTitle(e.target.value) };

  function handleSetActivityName(e: InputEvent){ setActivityName(e.target.value) };

  // const handleSetActivityFlag = (flag: FlagInterface) => { setActivityFlag(flag) };

  function handleSetActivityMaxFeedback(text: string){ setActivityMaxFeedback(text) };

  function handleSetActivityScoredReadingLevel(e: InputEvent){ setActivityScoredReadingLevel(e.target.value) };

  function handleSetActivityTargetReadingLevel(e: InputEvent){ setActivityTargetReadingLevel(e.target.value) };

  function handleSetImageLink(e: InputEvent){ handleSetActivityPassages('image_link', e.target.value) };

  function handleSetImageAltText(e: InputEvent){ handleSetActivityPassages('image_alt_text', e.target.value) };

  function handleSetPassageText(text: string) { handleSetActivityPassages('text', text)}

  function handleSetActivityPassages(key, value){
    const updatedPassages = [...activityPassages];
    updatedPassages[0][key] = value;
    setActivityPassages(updatedPassages)
   };

  function handleSetPrompt (e: InputEvent, conjunction: string) {
    const prompt = getActivityPrompt({ activityBecausePrompt, activityButPrompt, activitySoPrompt, conjunction });
    const updatePrompt = getActivityPromptSetter({ setActivityBecausePrompt, setActivityButPrompt, setActivitySoPrompt, conjunction});
    if(prompt && updatePrompt) {
      prompt.text = e.target.value;
      updatePrompt(prompt);
    }
  }

  function handleSubmitActivity(){
    const activityObject = buildActivity({
      activityName,
      activityTitle,
      activityScoredReadingLevel,
      activityTargetReadingLevel,
      activityParentActivityId: parent_activity_id,
      activityPassages,
      activityMaxFeedback,
      activityBecausePrompt,
      activityButPrompt,
      activitySoPrompt
    });
    const state = [
      activityTitle,
      activityName,
      activityScoredReadingLevel,
      activityTargetReadingLevel,
      activityPassages[0].text,
      activityMaxFeedback,
      activityBecausePrompt.text,
      activityButPrompt.text,
      activitySoPrompt.text,
      activityPassages[0].image_link,
      activityPassages[0].image_alt_text
    ];
    const validationErrors = validateForm(activityFormKeys, state);
    if(validationErrors && Object.keys(validationErrors).length !== 0) {
      setErrors(validationErrors);
    } else {
      submitActivity(activityObject);
    }
  }

  const errorsPresent = !!Object.keys(errors).length;
  const passageLabelStyle = activityPassages[0].text.length  && activityPassages[0].text !== '<br/>' ? 'has-text' : '';
  const maxAttemptStyle = activityMaxFeedback.length && activityMaxFeedback !== '<br/>' ? 'has-text' : '';
  return(
    <div className="activity-form-container">
      <div className="close-button-container">
        <button className="quill-button fun primary contained" id="activity-close-button" onClick={closeModal} type="button">x</button>
      </div>
      <form className="activity-form">
        <Input
          className="name-input"
          error={errors[NAME]}
          handleChange={handleSetActivityName}
          label="Activity Name"
          value={activityName}
        />
        <Input
          className="title-input"
          error={errors[TITLE]}
          handleChange={handleSetActivityTitle}
          label="Passage Title"
          value={activityTitle}
        />
        {/* <DropdownInput
          className="flag-input"
          handleChange={handleSetActivityFlag}
          isSearchable={true}
          label="Development Stage"
          options={flagOptions}
          value={activityFlag}
        /> */}
        <Input
          className="scored-reading-level-input"
          error={errors[SCORED_READING_LEVEL]}
          handleChange={handleSetActivityScoredReadingLevel}
          label="Scored Reading Level"
          value={activityScoredReadingLevel}
        />
        <Input
          className="target-reading-level-input"
          error={errors[TARGET_READING_LEVEL]}
          handleChange={handleSetActivityTargetReadingLevel}
          label="Target Reading Level"
          value={activityTargetReadingLevel}
        />
        {parent_activity_id && renderIDorUID(parent_activity_id, PARENT_ACTIVITY_ID)}
        <Input
          className="image-link-input"
          error={errors[IMAGE_LINK]}
          handleChange={handleSetImageLink}
          label="Image Link"
          value={activityPassages[0].image_link}
        />
        <Input
          className="image-alt-text-input"
          error={errors[IMAGE_ALT_TEXT]}
          handleChange={handleSetImageAltText}
          label="Image Alt Text"
          value={activityPassages[0].image_alt_text}
        />
        <p className={`text-editor-label ${passageLabelStyle}`}>Passage</p>
        <TextEditor
          ContentState={ContentState}
          EditorState={EditorState}
          handleTextChange={handleSetPassageText}
          key="passage-description"
          text={activityPassages[0].text}
        />
        {errors[PASSAGE] && <p className="error-message">{errors[PASSAGE]}</p>}
        <p className={`text-editor-label ${maxAttemptStyle}`}>Max Attempts Feedback</p>
        <TextEditor
          ContentState={ContentState}
          EditorState={EditorState}
          handleTextChange={handleSetActivityMaxFeedback}
          key="max-attempt-feedback"
          text={activityMaxFeedback}
        />
        {errors[MAX_ATTEMPTS_FEEDBACK] && <p className="error-message">{errors[MAX_ATTEMPTS_FEEDBACK]}</p>}
        <PromptsForm
          activityBecausePrompt={activityBecausePrompt}
          activityButPrompt={activityButPrompt}
          activitySoPrompt={activitySoPrompt}
          errors={errors}
          handleSetPrompt={handleSetPrompt}
        />
        <div className="submit-button-container">
          {errorsPresent && <div className="error-message-container">
            <p className="all-errors-message">Please check that all fields have been completed correctly.</p>
          </div>}
          <button className="quill-button fun primary contained" id="activity-submit-button" onClick={handleSubmitActivity} type="submit">
            Submit
          </button>
          <button className="quill-button fun primary contained" id="activity-cancel-button" onClick={closeModal} type="button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ActivityForm;
