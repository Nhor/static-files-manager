CREATE TABLE user (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  username    TEXT     NOT NULL    UNIQUE,
  password    TEXT     NOT NULL,
  created_at  DATETIME DEFAULT (DATETIME('now', 'utc')),
  modified_at DATETIME DEFAULT (DATETIME('now', 'utc'))
);
