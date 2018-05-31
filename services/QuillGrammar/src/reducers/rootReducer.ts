import { combineReducers } from "redux";
import { IState } from "../store/configStore";
// import { todos } from "./todosReducer";
import grammarActivities from './grammarActivitiesReducer'
import session from './sessionReducer'

export const initState: IState = {
    grammarActivities: {},
    session: {}
};

export const rootReducer = combineReducers({
    grammarActivities,
    session
});
