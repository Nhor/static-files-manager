define(require => {
  let React = require('react');

  class Login extends React.Component {

    /**
     * Render component.
     * @returns {Object} Component DOM representation.
     */
    render() {
      return (
        <div className="login-wrapper"></div>
      );
    }
  }

  return Login;
});
