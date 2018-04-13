const r = require('rethinkdb');
const io = require('socket.io')();
const fetch = require('node-fetch');

let currentConnections = {};

function subscribeToClassroomLessonSession({
  connection,
  client,
  classroomLessonSessionId
}) {
  r.table('classroom_lesson_sessions')
  .get(classroomLessonSessionId)
  .changes({ includeInitial: true })
  .run(connection, (err, cursor) => {
    cursor.each((err, document) => {
      let session = document.new_val;
      client.emit(`classroomLessonSession:${session.id}`, session)
    });
  });
}

function createPreviewSession({ connection, previewSessionData }) {
  r.table('classroom_lesson_sessions')
  .insert(previewSessionData)
  .run(connection)
}

function subscribeToCurrentSlide({
  connection,
  client,
  classroomActivityId
}) {
  r.table('classroom_lesson_sessions')
  .get(classroomActivityId)
  .getField('current_slide')
  .run(connection)
  .then((currentSlide) => {
    client.emit(`currentSlide:${classroomActivityId}`, currentSlide)
  });
}

function updateClassroomLessonSession({ connection, session }) {
  r.table('classroom_lesson_sessions')
  .insert(session, { conflict: 'update' })
  .run(connection);
}

function createOrUpdateClassroomLessonSession({
  connection,
  classroomActivityId
}) {
  const url = process.env.EMPIRICAL_BASE_URL +
    '/api/v1/classroom_activities/' +
    classroomActivityId +
    '/classroom_teacher_and_coteacher_ids'

  r.table('classroom_lesson_sessions')
  .get(classroomActivityId)
  .run(connection)
  .then((session) => {
    fetch(url, {
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
      response ? session.teacher_ids = response.teacher_ids : undefined;
      session.current_slide = session && session.current_slide ? session.current_slide : 0;
      session.startTime = session && session.startTime ? session.startTime : new Date();
      session.id = session && session.id ? session.id : classroomActivityId;

      r.table('classroom_lesson_sessions')
      .insert(session, { conflict: 'replace' })
      .run(connection)
    });
  });
}

function teacherConnected({
  classroomActivityId,
  connection,
  client,
}) {
  let session = { id: classroomActivityId, absentTeacherState: false };
  currentConnections[client.id].role = 'teacher';
  currentConnections[client.id].classroomActivityId = classroomActivityId;

  updateClassroomLessonSession({
    connection,
    session,
  });
}

function disconnect({
  client,
  connection,
}) {
  if (currentConnections[client.id].role === 'teacher') {
    let session = {
      id: currentConnections[client.id].classroomActivityId,
      absentTeacherState: true
    };

    updateClassroomLessonSession({
      connection,
      session,
    });
  }

  if (currentConnections[client.id].role === 'student') {
    let session = {
      id: currentConnections[client.id].classroomActivityId,
      presence: {}
    };
    session['presence'][currentConnections[client.id].studentId] = false

    updateClassroomLessonSession({
      connection,
      session,
    });
  }

  delete currentConnections[client.id];
}

function registerPresence({
  connection,
  classroomActivityId,
  studentId,
  client,
}) {
  let session = { id: classroomActivityId, presence: {} }
  currentConnections[client.id].role = 'student';
  currentConnections[client.id].studentId = studentId;
  currentConnections[client.id].classroomActivityId = classroomActivityId;
  session.presence[studentId] = true;

  updateClassroomLessonSession({
    session,
    connection,
  });
}

function setSlideStartTime({
  classroomActivityId,
  questionId,
  connection,
}) {
  let session = { id: classroomActivityId, timestamps: {} };

  r.table('classroom_lesson_sessions')
  .get(classroomActivityId)('submissions')(questionId.toString())
  .changes({ includeInitial: true })
  .run(connection)
  .catch(() => {
    session['timestamps'][questionId.toString()] = new Date();
    updateClassroomLessonSession({
      session,
      connection,
    });
  });
}

function addStudent({
  connection,
  client,
  classroomActivityId,
  studentName,
}) {
  const nameRef = studentName.replace(/\s/g, '').toLowerCase()

  r.table('classroom_lesson_sessions')
  .get(classroomActivityId)
  .update((classroomActivity) => {
    let students = {};

    if (!classroomActivity.students) {
      students = { students: {} };
    } else {
      students = { students: classroomActivity['students'] };
    }
    students['students'][nameRef] = studentName;
    return students;
  })
  .run(connection)
  .then(() => {
    client.emit(`studentAdded:${classroomActivityId}`, studentName, nameRef)
  });
}

r.connect({
  host: 'localhost',
  port: 28015,
  db: 'quill_lessons'
}).then((connection) => {
  io.on('connection', (client) => {
    currentConnections[client.id] = { socket: client, role: null };

    client.on('teacherConnected', (classroomActivityId) => {
      teacherConnected({
        connection,
        classroomActivityId,
        client,
      })
    });

    client.on('disconnect', () => {
      disconnect({
        connection,
        client,
      })
    });

    client.on('subscribeToClassroomLessonSession', (classroomLessonSessionId) => {
      subscribeToClassroomLessonSession({
        connection,
        client,
        classroomLessonSessionId,
      });
    });

    client.on('createPreviewSession', (previewSessionData) => {
      createPreviewSession({
        connection,
        previewSessionData,
      });
    });

    client.on('subscribeToCurrentSlide', (classroomActivityId) => {
      subscribeToCurrentSlide({
        connection,
        client,
        classroomActivityId
      });
    });

    client.on('updateClassroomLessonSession', (session) => {
      updateClassroomLessonSession({
        session,
        connection
      });
    });

    client.on('createOrUpdateClassroomLessonSession', (classroomActivityId) => {
      createOrUpdateClassroomLessonSession({
        connection,
        classroomActivityId
      });
    });

    client.on('setSlideStartTime', (classroomActivityId, questionId) => {
      setSlideStartTime({
        connection,
        classroomActivityId,
        questionId,
      });
    });

    client.on('registerPresence', (classroomActivityId, studentId) => {
      registerPresence({
        connection,
        client,
        classroomActivityId,
        studentId,
      })
    });

    client.on('addStudent', (classroomActivityId, studentName) => {
      addStudent({
        connection,
        client,
        classroomActivityId,
        studentName,
      });
    });
  });
});

io.listen(8000);
console.log('listening on port ', 8000);
