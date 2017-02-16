const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const Error = require('./Error');

try { fs.mkdirSync(path.resolve(__dirname, '..', '..', 'tmp')); }
catch (err) { if (err.code !== 'EEXIST') throw err; }

try { fs.mkdirSync(path.resolve(__dirname, '..', '..', 'static')); }
catch (err) { if (err.code !== 'EEXIST') throw err; }

class File {

  /**
   * Upload file under given path with specified filename and extension.
   * @param {String} pathToSourceFile - Absolute path to temporarily created source file.
   * @param {String} pathname - Path to file relative to static (can be '').
   * @param {String} filename - File name.
   * @param {String} ext - File extension (can be '').
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error on failure.
   */
  static uploadFile(pathToSourceFile, pathname, filename, ext) {
    let paths = this._generateAbsoluteAndRelativePath(pathname, filename, ext);

    return this
      ._getStats(paths.absolute)
      .then(stats => {
        if (stats) throw new Error.RecordExists(Error.Code.FILE_EXISTS);
        return this._getStats(paths.directoryAbsolute);
      })
      .then(stats => stats ? undefined : this._createDirectory(paths.directoryAbsolute))
      .then(() => this._move(pathToSourceFile, paths.absolute));
  }

  /**
   * Create a new directory with making sure that it doesn't exist yet.
   * @param {String} pathname - Path to new directory relative to static.
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error on failure.
   */
  static createDirectory(pathname) {
    let absolutePath = path.resolve(__dirname, '..', '..', 'static', _.trim(pathname, '/'));
    return this
      ._getStats(absolutePath)
      .then(stats => {
        if (stats) throw new Error.RecordExists(Error.Code.DIRECTORY_EXISTS);
        return this._createDirectory(absolutePath);
      });
  }

  /**
   * Remove file or directory and all its content at given path relative to static.
   * @param {String} pathname - Path to file or directory relative to static.
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error on failure.
   */
  static removeAtRelativePath(pathname) {
    let absolutePath = path.resolve(__dirname, '..', '..', 'static', _.trim(pathname, '/'));
    return this.removeAtAbsolutePath(absolutePath);
  }

  /**
   * Remove file or directory and all its content at given absolute path.
   * @param {String} pathname - Absolute path to file or directory.
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error on failure.
   */
  static removeAtAbsolutePath(pathname) {
    return this
      ._getStats(pathname)
      .then(stats =>{
        if (!stats) throw new Error.RecordDoesNotExist(Error.Code.FILE_NOT_FOUND);
        return this._remove(pathname);
      });
  }

  /**
   * Copy source file to given destination.
   * @param {String} pathToSource - Path to the source file relative to static.
   * @param {String} pathToDestination - Destination path for the new file relative to static.
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error on failure.
   */
  static copyFile(pathToSource, pathToDestination) {
    let absSourcePath = path.resolve(__dirname, '..', '..', 'static', _.trim(pathToSource, '/'));
    let absDestinationPath = path.resolve(__dirname, '..', '..', 'static', _.trim(pathToDestination, '/'));
    let absDestinationDir = path.dirname(absDestinationPath);

    return Promise
      .all([
        this._getStats(absSourcePath),
        this._getStats(absDestinationPath),
        this._getStats(absDestinationDir),
      ])
      .then(res => {
        let sourceFileStats = res[0];
        let destinationFileStats = res[1];
        let destinationDirectoryStats = res[2];
        if (!sourceFileStats || !sourceFileStats.isFile())
          throw new Error.RecordDoesNotExist(Error.Code.FILE_NOT_FOUND);
        if (destinationFileStats)
          throw new Error.RecordExists(Error.Code.FILE_EXISTS);
        return destinationDirectoryStats
          ? undefined
          : this._createDirectory(absDestinationDir);
      })
      .then(() => new Promise((resolve, reject) => {
        let rejected = false;
        let onError = err => {
          if (rejected) return;
          rejected = true;
          reject(err);
        };

        let readStream = fs.createReadStream(absSourcePath);
        let writeStream = fs.createWriteStream(absDestinationPath);
        readStream.on('error', err => onError(err));
        writeStream.on('error', err => onError(err));
        writeStream.on('close', () => resolve());
        readStream.pipe(writeStream);
      }));
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
  static _move(pathToSource, pathToDestination) {
    return new Promise((resolve, reject) =>
      fs.rename(pathToSource, pathToDestination, err => err ? reject(err) : resolve()));
  }

  /**
   * Remove file or directory and its content at given path.
   * @param {String} pathname - Path to the file or directory.
   * @return {Promise} Resolved promise on success,
   *                   rejected promise with error on failure.
   * @private
   */
  static _remove(pathname) {
    return new Promise((resolve, reject) =>
      rimraf(pathname, err => err ? reject(err) : resolve()));
  }
}

module.exports = File;
