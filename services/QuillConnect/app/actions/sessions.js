import rootRef from '../libs/firebase';
import { v4rootRef } from '../libs/firebase';
import _ from 'lodash';

const C = require('../constants').default;

const sessionsRef = rootRef.child('savedSessions');
const v4sessionsRef = v4rootRef.child('connectSessions');
let allQuestions = {};
let questionsInitialized = {};

export default {
  get(sessionID, cb) {
    // First attempt to get the new normalized session object for this ID
    v4sessionsRef.child(sessionID).once('value', (snapshot) => {
      if (snapshot.exists()) {
        const v4session = denormalizeSession(snapshot.val());
        handleSessionSnapshot(v4session, cb);
      } else {
        // If we can't find a new style session, look for an old one
        sessionsRef.child(sessionID).once('value', (snapshot) => {
          if (snapshot.exists()) {
            const v2session = snapshot.val();
            handleSessionSnapshot(v2session, cb);
          }
        });
      }
    });
  },

  update(sessionID, session) {
    const cleanSession = _.pickBy(session);
    const cleanedSession = JSON.parse(JSON.stringify(cleanSession));
    delete_null_properties(cleanedSession, true);

    // During our rollout, we want to limit the number of people this
    // could impact if things go wrong.  So we're only going to apply
    // this new process to a small percentage of sessions.  This does
    // mean that a single user could get a mix of session types in the
    // same day, but since sessions will be invisible if they work,
    // that shouldn't matter.

    // This is the whole number percentage of users who will be assigned
    // to the new session type.
    const percentAssigned = 1;
    if (sessionID && simpleHash(sessionID) % 100 < percentAssigned) {
      const normalizedSession = normalizeSession(cleanedSession)
      // Let's start including an updated time on our sessions
      normalizedSession.updatedAt = new Date().getTime();
      v4sessionsRef.child(sessionID).set(normalizedSession);
    } else {
      sessionsRef.child(sessionID).set(cleanedSession);
    }
  },

  delete(sessionID) {
    // During rollout, let's not delete old sessions so that we can roll back
    //sessionsRef.child(sessionID).remove();
    v4sessionsRef.child(sessionID).remove();
  },

  populateQuestions(questionType, questions, forceRefresh) {
    if (questionsInitialized[questionType] && !forceRefresh) return;

    Object.keys(questions).forEach((uid) => {
      allQuestions[uid] = {
        question: Object.assign(questions[uid], {key: uid}),
        type: questionType,
      }
    })
    questionsInitialized[questionType] = true;
  }

};

function simpleHash(str) {
  // NOTE: This entire function is lifted from the "string-hash" module
  // on NPM, but I didn't want to add a new dependency for temporary code
  // so I simply re-implemented it here.
  // Source: https://github.com/darkskyapp/string-hash/blob/master/index.js
  var hash = 5381,
      i    = str.length;

  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0;
}

function denormalizeSession(session) {
  // If someone has answered no questions, this key will be missing
  if (session.answeredQuestions) {
    session.answeredQuestions.forEach((value, index, answeredQuestions) => {
      answeredQuestions[index] = denormalizeQuestion(value);
    });
  }
  session.questionSet.forEach((value, index, questionSet) => {
    questionSet[index] = denormalizeQuestion(value);
  });
  // If all questions are answered, we won't have this key
  if (session.unansweredQuestions) {
    session.unansweredQuestions.forEach((value, index, unansweredQuestions) => {
      unansweredQuestions[index] = denormalizeQuestion(value);
    });
  }
  if (session.currentQuestion) {
    session.currentQuestion = denormalizeQuestion(session.currentQuestion);
  }
  return session
}

function denormalizeQuestion(question) {
  // Questions stored on the session object have a different shape
  // if they have any attempt data attached to them
  const questionUid = question.attempts ? question.question : question;
  // We need to make sure that the 'question' part of the
  // question object is a clean copy so that we can modify
  // it without changing the cached question object
  const denormalizedQuestion = JSON.parse(JSON.stringify(allQuestions[questionUid].question))
  const questionType = allQuestions[questionUid].type;
  if (question.attempts) {
    denormalizedQuestion.attempts = question.attempts;
  }
  return {
    question: denormalizedQuestion,
    type: questionType,
  }
}

function normalizeSession(session) {
  // Deep copy so that we return a clean object
  let sessionCopy = JSON.parse(JSON.stringify(session));
  sessionCopy.questionSet = sessionCopy.questionSet.map(normalizeQuestion);
  // If someone has answered all the questions, key will be missing
  if (sessionCopy.unansweredQuestions) {
    sessionCopy.unansweredQuestions = sessionCopy.unansweredQuestions.map(normalizeQuestion);
  }
  if (sessionCopy.currentQuestion) {
    sessionCopy.currentQuestion = normalizeQuestion(sessionCopy.currentQuestion);
  }
  // If someone has not answered any questions, this key will be missing
  if (sessionCopy.answeredQuestions) {
    sessionCopy.answeredQuestions = sessionCopy.answeredQuestions.map(normalizeQuestion);
  }
  return sessionCopy
}

function normalizeQuestion(question) {
  if (!question.question.attempts) return question.question.key;
  return {
    question: question.question.key,
    attempts: question.question.attempts,
  }
}

function handleSessionSnapshot(session, callback) {
  if (session.currentQuestion) {
    if (session.currentQuestion.question) {
      session.currentQuestion.question.attempts = session.currentQuestion.question.attempts || [];
    } else {
      session.currentQuestion.data.attempts = session.currentQuestion.data.attempts || [];
    }
  }
  session.unansweredQuestions ? true : session.unansweredQuestions = [];
  callback(session);
}

function delete_null_properties(test, recurse) {
  for (const i in test) {
    if (test[i] === null) {
      delete test[i];
    } else if (recurse && typeof test[i] === 'object') {
      delete_null_properties(test[i], recurse);
    }
  }
}

export {
  denormalizeSession,
  normalizeSession,
  allQuestions,
}
