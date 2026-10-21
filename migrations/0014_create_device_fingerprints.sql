
CREATE TABLE IF NOT EXISTS device_fingerprints (
  fingerprint TEXT PRIMARY KEY,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  action_count INTEGER DEFAULT 0
);
