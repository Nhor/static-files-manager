define(require => {
  let React = require('react');

  class Home extends React.Component {

    /**
     * Render component.
     * @returns {Object} Component DOM representation.
     */
    render() {
      return (
        <div className="home-wrapper"></div>
      );
    }
  }

  return Home;
});
