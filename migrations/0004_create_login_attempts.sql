CREATE TABLE IF NOT EXISTS login_attempts (
  email TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 0,
  locked_until DATETIME
);
