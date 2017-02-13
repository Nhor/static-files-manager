CREATE TABLE session (
  id         TEXT     PRIMARY KEY,
  user_id    INTEGER  NOT NULL UNIQUE,
  created_at DATETIME DEFAULT (DATETIME('now', 'utc')),
  FOREIGN KEY(user_id) REFERENCES user(id)
);
