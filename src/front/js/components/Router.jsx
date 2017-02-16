define(require => {
  let React = require('react');
  let ReactDOM = require('reactDom');
  let ReactRouter = require('reactRouter');
  let Home = require('./Home');

  return ReactDOM.render(
    (
      <ReactRouter.Router history={ReactRouter.browserHistory}>
        <ReactRouter.Route path="/" component={Home} />
      </ReactRouter.Router>
    ),
    document.body
  );
});
