import FillInBlankQuestions from 'components/fillInBlank/fillInBlankQuestions.jsx';

export default {
  path: 'fill-in-the-blanks',
  indexRoute: {
    component: FillInBlankQuestions,
  },
  getChildRoutes: (partialNextState, cb) => {
    Promise.all([
      import(/* webpackChunkName: "fill-in-the-blanks" */'./fillInTheBlank.js')
    ])
    .then(modules => cb(null, modules.map(module => module.default)))
    // to do, use Sentry to capture error
    // .catch(err => console.error('Dynamic page loading failed', err));
  },

};
