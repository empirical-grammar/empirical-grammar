import rootRef from '../firebase';
import { ActionTypes } from './actionTypes'
const sessionsRef = rootRef.child('proofreaderSessions')
import { ConceptResultObject, WordObject } from '../interfaces/proofreaderActivities'

export const updateSessionOnFirebase = (sessionID: string, passage: Array<Array<WordObject>>|undefined, callback: Function) => {
  return (dispatch: Function) => {
    sessionsRef.child(`${sessionID}/passage`).set(
      passage,
      () => {
        dispatch(setSessionReducerToSavedSession(sessionID))
        if (callback) {
          callback()
        }
      }
    )
  }
}

export const updateConceptResultsOnFirebase = (sessionID: string|null, activityUID: string, conceptResults: ConceptResultObject[]) => {
  const sessionObj = { conceptResults, activityUID, anonymous: !sessionID }
  if (sessionID) {
    sessionsRef.child(sessionID).set(sessionObj)
    return sessionID
  } else {
    const anonymousSession = sessionsRef.push(sessionObj)
    return anonymousSession.key
  }
}

export const setSessionReducerToSavedSession = (sessionID: string, initialLoad?: boolean) => {
  return (dispatch: Function) => {
    sessionsRef.child(sessionID).once('value', (snapshot: any) => {
      const session = snapshot.val()
      if (session && !session.error) {
        if (session.conceptResults && initialLoad) {
          window.location.href = `${process.env.QUILL_GRAMMAR_URL}/play/sw?proofreaderSessionId=${sessionID}`
        } else {
          dispatch(setSessionReducer(session.passage))
        }
      }
    })
  }
}

export const setSessionReducer = (passage: string) => {
  return (dispatch: Function) => {
    dispatch({ type: ActionTypes.SET_FIREBASE_PASSAGE, passage})
  }
}

export const setPassage = (passage: Array<Array<WordObject>>) => {
  return (dispatch: Function) => {
    dispatch({ type: ActionTypes.SET_PASSAGE, passage})
  }
}

export const removeSession = (sessionId: string) => {
  sessionsRef.child(sessionId).remove()
}
