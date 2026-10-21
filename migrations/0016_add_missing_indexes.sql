-- 补全业务查询高频字段的索引
-- password_resets: forgot.js / reset.js 按 user_id 查询和清理
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
-- passkey_challenges: 每次 options 调用都按 expires_at 清理过期挑战
CREATE INDEX IF NOT EXISTS idx_passkey_challenges_expires_at ON passkey_challenges(expires_at);
