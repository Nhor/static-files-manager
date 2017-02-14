class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

class InvalidFormat extends ExtendableError {
  constructor(code) {
    super('Invalid format');
    this.code = code;
    this.isCustom = true;
  }
}

class InvalidValue extends ExtendableError {
  constructor(code) {
    super('Invalid value');
    this.code = code;
    this.isCustom = true;
  }
}

class RecordDoesNotExist extends ExtendableError {
  constructor(code) {
    super('Record does not exist');
    this.code = code;
    this.isCustom = true;
  }
}

class RecordExists extends ExtendableError {
  constructor(code) {
    super('Record exists');
    this.code = code;
    this.isCustom = true;
  }
}

let Code = {
  UNKNOWN: 0,
  INVALID_USERNAME_FORMAT: 1,
  INVALID_PASSWORD_FORMAT: 2,
  INVALID_PATH_FORMAT: 3,
  INVALID_FILENAME_FORMAT: 4,
  INVALID_EXT_FORMAT: 5,
  INVALID_FILES_FORMAT: 6,
  USER_NOT_FOUND: 7,
  SESSION_NOT_FOUND: 8,
  INVALID_PASSWORD: 9,
  FILE_EXISTS: 10
};

module.exports.InvalidFormat = InvalidFormat;
module.exports.InvalidValue = InvalidValue;
module.exports.RecordDoesNotExist = RecordDoesNotExist;
module.exports.RecordExists = RecordExists;
module.exports.Code = Code;
