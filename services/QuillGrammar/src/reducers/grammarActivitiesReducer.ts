import { Action } from "redux";
import { ActionTypes } from "../actions/actionTypes";
import { GrammarActivity } from '../interfaces/grammarActivities'

export interface GrammarActivityState {
  hasreceiveddata: boolean;
  currentActivity: GrammarActivity;
  error?: string;
}

export default (
    currentState = {hasreceiveddata: false},
    action: Action,
) => {
    switch (action.type) {
        case ActionTypes.RECEIVE_GRAMMAR_ACTIVITY_DATA:
            return Object.assign({}, currentState, { currentActivity: action.data}, {hasreceiveddata: true});
        case ActionTypes.NO_GRAMMAR_ACTIVITY_FOUND:
            return Object.assign({}, currentState, { error: 'No activity found.'})
        default:
            return currentState;
    }
};
