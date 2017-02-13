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
  }
}

class InvalidValue extends ExtendableError {
  constructor(code) {
    super('Invalid value');
    this.code = code;
  }
}

class RecordDoesNotExist extends ExtendableError {
  constructor(code) {
    super('Record does not exist');
    this.code = code;
  }
}

let Code = {
  UNKNOWN: 0,
  INVALID_USERNAME_FORMAT: 1,
  INVALID_PASSWORD_FORMAT: 2,
  USER_NOT_FOUND: 3,
  SESSION_NOT_FOUND: 4,
  INVALID_PASSWORD: 5
};

module.exports.InvalidFormat = InvalidFormat;
module.exports.InvalidValue = InvalidValue;
module.exports.RecordDoesNotExist = RecordDoesNotExist;
module.exports.Code = Code;
