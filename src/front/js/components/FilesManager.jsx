define(require => {
  let React = require('react');
  let ReactDOM = require('reactDom');
  let _ = require('lodash');
  let Request = require('../Request');

  class DialogWindow extends React.Component {

    /**
     * Render component.
     * @returns {Object} Component DOM representation.
     */
    render() {
      return (
        <div className="files-manager-dialog-window-wrapper">
          <div className="files-manager-dialog-window-aligner" />
            <div className="files-manager-dialog-window">
              {this.props.children}
            </div>
        </div>
      );
    }
  }

  class ContentNode extends React.Component {

    /**
     * Handle component initialization.
     * @param {Object} props - Initial object properties.
     */
    constructor(props) {
      super(props);
      this.state = {};
      this._onDirectoryContentRowClick = this._onDirectoryContentRowClick.bind(this);
    }

    /**
     * Handle directory content row click.
     * @param {Event} event - Event object.
     * @private
     */
    _onDirectoryContentRowClick(event) {
      if (this.props.type === 'directory') {
        let directory;
        switch(this.props.name) {
          case '..':
            directory = _.dropRight(_.split(this.props['parent-directory'], '/')).join('/');
            break;
          default:
            directory = `${this.props['parent-directory']}/${this.props.name}`;
            break;
        }
        this.props['update-directory-function'](directory);
      } else {
        Request.getStatic(`/${this.props['parent-directory']}/${this.props.name}`);
      }
    }

    /**
     * Render component.
     * @returns {Object} Component DOM representation.
     */
    render() {
      return (
        <div className="files-manager-directory-content-row"
             onClick={this._onDirectoryContentRowClick}>
          <div className={`files-manager-directory-content-icon-${this.props.type}`} />
          <div className="files-manager-directory-content-filename">{this.props.name}</div>
        </div>
      );
    }
  }

  class FilesManager extends React.Component {

    /**
     * Handle component initialization.
     * @param {Object} props - Initial object properties.
     */
    constructor(props) {
      super(props);
      this.state = {
        currentDirectory: '.',
        currentDirectoryContent: [],
        dialogWindowShown: false
      };
      this._updateDirectoryAndItsContent = this._updateDirectoryAndItsContent.bind(this);
      this._onUploadWrapperClick = this._onUploadWrapperClick.bind(this);
      this._onCreateDirectoryWrapperClick = this._onCreateDirectoryWrapperClick.bind(this);
    }

    /**
     * Handle component initialization before render.
     */
    componentWillMount() {
      this._updateDirectoryAndItsContent(this.state.currentDirectory);
    }

    /**
     * Update component state with new directory and its content.
     * @param {String} directory - Directory name.
     * @private
     */
    _updateDirectoryAndItsContent(directory) {
      this.setState({currentDirectory: directory, currentDirectoryContent: []});
      this
        ._getDirectoryContent(directory)
        .then(directoryContent => this.setState({currentDirectoryContent: directoryContent}));
    }

    /**
     * Get directory with given name content.
     * @param {String} directory - Directory name.
     * @returns {Promise} Resolved promise with directory content on success,
     *                    rejected promise with error on failure.
     * @private
     */
    _getDirectoryContent(directory) {
      return Request
        .get(`/list/${directory}`, true)
        .then(res => _.sortBy(_.get(res, 'body.content', []), 'type'));
    }

    /**
     * Handle upload wrapper click.
     * @param {Event} event - Event object.
     * @private
     */
    _onUploadWrapperClick(event) {
      let inputElement = document.createElement('input');
      inputElement.type = 'file';
      inputElement.multiple = false;

      inputElement.onchange = () => {
        let file = _.first(inputElement.files);
        let data = {
          path: _.trimStart(this.state.currentDirectory, '.'),
          filename: _.kebabCase(_.dropRight(_.split(file.name, '.')).join('')),
          ext: _.toLower(_.last(_.split(file.name, '.'))),
          files: file
        };
        Request
          .post('/upload', true, data, Request.ContentType.multipart)
          .then(res => this._updateDirectoryAndItsContent(this.state.currentDirectory));
      };

      inputElement.click();
    }

    /**
     * Handle create directory wrapper click.
     * @param {Event} event - Event object.
     * @private
     */
    _onCreateDirectoryWrapperClick(event) {
      let inputValue = '';

      let onInputChange = e => inputValue = e.target.value;

      let onCloseButtonClick = () => this._hideDialogWindow();

      let onCreateButtonClick = () => {
        let data = {
          path: `${_.trimStart(this.state.currentDirectory, '.')}/${inputValue}`
        };
        Request
          .post('/create', true, data)
          .then(() => this._updateDirectoryAndItsContent(this.state.currentDirectory))
          .then(() => this._hideDialogWindow())
          .catch(() => this._hideDialogWindow());
      };

      this._showDialogWindow(
        <div className="files-manager-create-directory-dialog">
          <input className="input files-manager-create-directory-dialog-input"
                 type="text"
                 onChange={onInputChange}/>
          <input className="button files-manager-create-directory-dialog-button"
                 value="Create"
                 type="submit"
                 onClick={onCreateButtonClick}/>
          <input className="button files-manager-create-directory-dialog-button"
                 value="Close"
                 type="submit"
                 onClick={onCloseButtonClick}/>
        </div>
      );
    }

    /**
     * Show dialog window with given HTML content.
     * @param {Object} content - Object with HTML content.
     * @private
     */
    _showDialogWindow(content) {
      ReactDOM.render(
        <DialogWindow>{content}</DialogWindow>,
        _.first(document.getElementsByClassName('files-manager-dialog-window-container'))
      );
      this.setState({dialogWindowShown: true});
    }

    /**
     * Hide dialog window.
     * @private
     */
    _hideDialogWindow() {
      ReactDOM.unmountComponentAtNode(
        _.first(document.getElementsByClassName('files-manager-dialog-window-container'))
      );
      this.setState({dialogWindowShown: false});
    }

    /**
     * Render component.
     * @returns {Object} Component DOM representation.
     */
    render() {
      return (
        <div className="files-manager-wrapper">
          <div className="files-manager-dialog-window-container" />
          <div className="container">
            <div className="files-manager-directory-name">{`${this.state.currentDirectory}/`}</div>

            {this.state.currentDirectory !== '.'
              ? <ContentNode type='directory'
                             name='..'
                             parent-directory={this.state.currentDirectory}
                             update-directory-function={this._updateDirectoryAndItsContent} />
              : null}
            {_.map(this.state.currentDirectoryContent, file =>
              <ContentNode type={file.type}
                           name={file.name}
                           parent-directory={this.state.currentDirectory}
                           update-directory-function={this._updateDirectoryAndItsContent} />)}

            <div className="files-manager-upload-wrapper"
                 onClick={this._onUploadWrapperClick}>
              <div className="files-manager-upload-icon-upload" />
              <div className="files-manager-upload-text">Upload</div>
            </div>

            <div className="files-manager-create-directory-wrapper"
                 onClick={this._onCreateDirectoryWrapperClick}>
              <div className="files-manager-create-directory-icon-add-directory" />
              <div className="files-manager-create-directory-text">Create directory</div>
            </div>
          </div>
        </div>
      );
    }
  }

  return FilesManager;
});
