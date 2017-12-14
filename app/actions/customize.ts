declare function require(name:string);
import rootRef, { firebase } from '../libs/firebase';
const editionsRef = rootRef.child('lessons_editions');
const classroomLessonsRef = rootRef.child('classroom_lessons');
import C from '../constants';
import * as CustomizeIntf from '../interfaces/customize'

export function getCurrentUserFromLMS() {
  return function(dispatch) {
    fetch(`${process.env.EMPIRICAL_BASE_URL}/api/v1/users`, {
      method: "GET",
      mode: "cors",
      credentials: 'include',
    }).then(response => {
      if (!response.ok) {
        console.log(response.statusText)
      } else {
        return response.json()
      }
    }).then(response => {
      if (response && response.user) {
        dispatch(setUserId(response.user.id))
      }
    })
  }
}

export function getEditionsByUser(user_id:Number) {
  return function (dispatch, getState) {
    editionsRef.on('value', (snapshot) => {
      dispatch(filterForUserEditions(user_id, snapshot.val()))
    });
  };
}

export function startListeningToEditions() {
  return function (dispatch, getState) {
    editionsRef.on('value', (snapshot) => {
      dispatch(setEditions(snapshot.val()))
    });
  };
}

export function createNewEdition(editionUID:string|null, lessonUID:string, user_id:Number|string, callback?:any, name?:string) {
  let newEditionData, newEdition;
  if (editionUID) {
    newEditionData = {lesson_id: lessonUID, edition_id: editionUID, user_id: user_id, name: name}
    newEdition = editionsRef.push(newEditionData)
      editionsRef.child(`${editionUID}/data`).once('value', snapshot => {
      editionsRef.child(`${newEdition.key}/data`).set(snapshot.val())
    })
  } else {
    newEditionData = {lesson_id: lessonUID, user_id: user_id, name: name}
    newEdition = editionsRef.push(newEditionData)
      classroomLessonsRef.child(lessonUID).once('value', snapshot => {
      editionsRef.child(`${newEdition.key}/data`).set(snapshot.val())
    })
  }
  if (callback) {
    callback(lessonUID, newEdition.key)
  } else {
    return newEdition.key
  }
}

export function saveEditionName(editionUID:string, name:string) {
  editionsRef.child(`${editionUID}/name`).set(name)
}

export function archiveEdition(editionUID:string) {
  const flagRef = editionsRef.child(`${editionUID}/flags`)
  flagRef.once('value', (snapshot) => {
    if (!snapshot.val()) {
      flagRef.set(['archived'])
    } else {
      const newFlags = snapshot.val().push('archived')
      flagRef.set(newFlags)
    }
  })
}

export function setWorkingEdition(edition:CustomizeIntf.Edition) {
  return { type: C.SET_WORKING_EDITION, edition };
}

export function setIncompleteQuestions(incompleteQuestions:Array<number>|never) {
  return { type: C.SET_INCOMPLETE_QUESTIONS, incompleteQuestions };
}

export function publishEdition(editionUID:string, edition:CustomizeIntf.Edition, callback?:Function) {
  return function(dispatch) {
    dispatch(setIncompleteQuestions([]))
    edition.last_published_at = firebase.database.ServerValue.TIMESTAMP
    editionsRef.child(editionUID).set(edition)
    sendPublishEditionEventToLMS()
    if (callback) {
      callback()
    }

  }
}

function filterForUserEditions(userId:Number, editions:CustomizeIntf.Editions) {
  return function (dispatch, getState) {
    if (editions && Object.keys(editions).length > 0) {
      const userEditions = {}
      const editionIds = Object.keys(editions)
      editionIds.forEach(id => {
        const edition = editions[id]
        if (edition.user_id === userId && (!edition.flags || edition.flags.indexOf('archived') === -1)) {
          userEditions[id] = edition
        }
      })
      if (Object.keys(userEditions).length > 0) {
        dispatch(setEditions(userEditions))
      }
    }
  }
}

function setUserId(id:Number) {
  return { type: C.SET_USER_ID, id };
}

function setEditions(editions:CustomizeIntf.Editions) {
  return { type: C.SET_EDITIONS, editions };
}

function sendPublishEditionEventToLMS() {
  fetch(`${process.env.EMPIRICAL_BASE_URL}/api/v1/published_edition`, {
    method: "POST",
    mode: "cors",
    credentials: 'include',
  })
}
