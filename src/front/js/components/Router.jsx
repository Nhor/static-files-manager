define(require => {
  let React = require('react');
  let ReactDOM = require('reactDom');
  let ReactRouter = require('reactRouter');
  let Authentication = require('../Authentication');
  let Login = require('./Login');
  let Home = require('./Home');

  let checkIfAuthenticated = (nextState, replace, callback) => {
    if (!Authentication.getSessionId()) {
      replace('/login');
      return callback();
    }
    return Authentication
      .check()
      .then(res => {
        if (!res)
          replace('/login');
        return callback();
    });
  };

  return ReactDOM.render(
    (
      <ReactRouter.Router history={ReactRouter.browserHistory}>
        <ReactRouter.Route path="/login" component={Login} />
        <ReactRouter.Route path="/" component={Home} onEnter={checkIfAuthenticated} />
      </ReactRouter.Router>
    ),
    document.body
  );
});
