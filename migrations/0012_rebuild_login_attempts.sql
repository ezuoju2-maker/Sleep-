DROP TABLE IF EXISTS login_attempts;
CREATE TABLE login_attempts (
  key TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 0,
  locked_until DATETIME
);
