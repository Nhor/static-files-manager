const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const mkdirp = require('mkdirp');
const Error = require('./Error');

try { fs.mkdirSync(path.resolve(__dirname, '..', '..', 'tmp')); }
catch (err) { if (err.code !== 'EEXIST') throw err; }

try { fs.mkdirSync(path.resolve(__dirname, '..', '..', 'static')); }
catch (err) { if (err.code !== 'EEXIST') throw err; }

class File {

  /**
   * Create file under given path with specified filename and extension.
   * @param {String} pathToSourceFile - Path to temporarily created source file.
   * @param {String} pathname - Path to file (can be '').
   * @param {String} filename - File name.
   * @param {String} ext - File extension (can be '').
   */
  static create(pathToSourceFile, pathname, filename, ext) {
    let paths = this._generateAbsoluteAndRelativePath(pathname, filename, ext);

    return this
      ._getStats(paths.absolute)
      .then(stats => {
        if (stats) throw new Error.RecordExists(Error.Code.FILE_EXISTS);
        return this._getStats(paths.directoryAbsolute);
      })
      .then(stats => stats ? undefined : this._createDirectory(paths.directoryAbsolute))
      .then(() => this._moveFile(pathToSourceFile, paths.absolute));
  }

  /**
   * Generate absolute and related path for file under given path with specified
   * filename and extension.
   * @param {String} pathname - Path to file (can be '').
   * @param {String} filename - File name.
   * @param {String} ext - File extension (can be '').
   * @return {Object} Object containing absolute and relative paths to file and directory.
   * @private
   */
  static _generateAbsoluteAndRelativePath(pathname, filename, ext) {
    let pathToAppend = _.isEmpty(pathname) ? '' : `${_.trim(pathname, '/')}/`;
    let extToAppend = _.isEmpty(ext) ? '' : `.${ext}`;
    let pathJoined = `${pathToAppend}${filename}${extToAppend}`;

    let file = path.basename(pathJoined);
    let relative = path.normalize(pathJoined);
    let absolute = path.resolve(__dirname, '..', '..', 'static', pathJoined);
    let directoryRelative = path.dirname(relative);
    let directoryAbsolute = path.dirname(absolute);

    return {
      file: file,
      relative: relative,
      absolute: absolute,
      directoryRelative: directoryRelative,
      directoryAbsolute: directoryAbsolute
    };
  }

  /**
   * Get file or directory stats.
   * @param {String} pathname - Path to file or directory.
   * @return {Promise} Resolved promise with `fs.Stats` object on success,
   *                   resolved promise with `undefined` if file or directory not found,
   *                   rejected promise with error on failure.
   * @private
   */
  static _getStats(pathname) {
    return new Promise((resolve, reject) =>
      fs.stat(pathname, (err, stats) => (err && err.code !== 'ENOENT') ? reject(err) : resolve(stats)));
  }

  /**
   * Create new directory recursively.
   * @param {String} pathname - Path to the new directory.
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error on failure.
   * @private
   */
  static _createDirectory(pathname) {
    return new Promise((resolve, reject) =>
      mkdirp(pathname, err => err ? reject(err) : resolve()));
  }

  /**
   * Move source file to given destination.
   * @param {String} pathToSource - Path to the source file.
   * @param {String} pathToDestination - Destination path for the source file.
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error on failure.
   * @private
   */
  static _moveFile(pathToSource, pathToDestination) {
    return new Promise((resolve, reject) =>
      fs.rename(pathToSource, pathToDestination, err => err ? reject(err) : resolve()));
  }
}

module.exports = File;
