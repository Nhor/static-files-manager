define(require => {
  let React = require('react');
  let ReactRouter = require('reactRouter');
  let _ = require('lodash');
  let Authentication = require('../Authentication');

  class Login extends React.Component {

    /**
     * Handle component initialization.
     * @param {Object} props - Initial object properties.
     */
    constructor(props) {
      super(props);
      this.state = {
        username: '',
        password: '',
        errorUsername: '',
        errorUsernameShown: false,
        errorUsernameTooltipShown: false,
        errorPassword: '',
        errorPasswordShown: false,
        errorPasswordTooltipShown: false
      };
      this._onFieldInputChange = this._onFieldInputChange.bind(this);
      this._onFieldErrorMouseEnter = this._onFieldErrorMouseEnter.bind(this);
      this._onFieldErrorMouseLeave = this._onFieldErrorMouseLeave.bind(this);
      this._onLoginButtonClick = this._onLoginButtonClick.bind(this);
    }

    /**
     * Handle login field input change.
     * @param {Event} event - Event object.
     * @private
     */
    _onFieldInputChange(event) {
      let field = event.target.parentElement.getAttribute('data-field');
      let state = {};
      state[field] = event.target.value;
      state[`error${_.capitalize(field)}`] = '';
      state[`error${_.capitalize(field)}Shown`] = false;
      state[`error${_.capitalize(field)}TooltipShown`] = false;
      this.setState(state);
    }

    /**
     * Handle login field error mouse enter event.
     * @param {Event} event - Event object.
     * @private
     */
    _onFieldErrorMouseEnter(event) {
      let field = event.target.parentElement.getAttribute('data-field');
      let state = {};
      state[`error${_.capitalize(field)}TooltipShown`] = true;
      this.setState(state);
    }

    /**
     * Handle login field error mouse leave event.
     * @param {Event} event - Event object.
     * @private
     */
    _onFieldErrorMouseLeave(event) {
      let field = event.target.parentElement.getAttribute('data-field');
      let state = {};
      state[`error${_.capitalize(field)}TooltipShown`] = false;
      this.setState(state);
    }

    /**
     * Handle login button click.
     * @param {Event} event - Event object.
     * @private
     */
    _onLoginButtonClick(event) {
      event.preventDefault();
      Authentication
        .login(this.state.username, this.state.password)
        .then(() => ReactRouter.browserHistory.push('/'))
        .catch(err => {
          _.each(err.messages, error => {
            _.includes(error, 'password')
              ? this.setState({errorPassword: error, errorPasswordShown: true})
              : this.setState({errorUsername: error, errorUsernameShown: true});
          });
        });
    }

    /**
     * Render component.
     * @returns {Object} Component DOM representation.
     */
    render() {
      return (
        <div className="login-wrapper">
          <div className="login-form-aligner" />
          <form className="login-form">
            <div className="login-form-field-wrapper" data-field="username">
              <label className="login-form-field-label"
                     htmlFor="login-username">
                Username:
              </label>
              <input className="input login-form-field-input"
                     type="text"
                     value={this.state.username}
                     onChange={this._onFieldInputChange} />
              <div className={'login-form-field-error' + (this.state.errorUsernameShown ? '' : ' hidden')}
                   onMouseEnter={this._onFieldErrorMouseEnter}
                   onMouseLeave={this._onFieldErrorMouseLeave} />
              <div className={'login-form-field-error-tooltip' + (this.state.errorUsernameTooltipShown ? '' : ' hidden')}>
                {this.state.errorUsername}
              </div>
            </div>
            <div className="login-form-field-wrapper" data-field="password">
              <label className="login-form-field-label"
                     htmlFor="login-password">
                Password:
              </label>
              <input className="input login-form-field-input"
                     type="password"
                     value={this.state.password}
                     onChange={this._onFieldInputChange} />
              <div className={'login-form-field-error' + (this.state.errorPasswordShown ? '' : ' hidden')}
                   onMouseEnter={this._onFieldErrorMouseEnter}
                   onMouseLeave={this._onFieldErrorMouseLeave} />
              <div className={'login-form-field-error-tooltip' + (this.state.errorPasswordTooltipShown ? '' : ' hidden')}>
                {this.state.errorPassword}
              </div>
            </div>
            <div className="login-form-button-wrapper">
              <input className="button login-form-button"
                     value="Login"
                     type="submit"
                     onClick={this._onLoginButtonClick}/>
            </div>
          </form>
        </div>
      );
    }
  }

  return Login;
});
