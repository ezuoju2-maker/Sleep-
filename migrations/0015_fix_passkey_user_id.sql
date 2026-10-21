
-- 允许 user_id 为空，因为 Passkey 登录时用户还未认证
CREATE TABLE IF NOT EXISTS passkey_challenges_v2 (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  challenge TEXT NOT NULL,
  expires_at DATETIME NOT NULL
);
DROP TABLE IF EXISTS passkey_challenges;
ALTER TABLE passkey_challenges_v2 RENAME TO passkey_challenges;
