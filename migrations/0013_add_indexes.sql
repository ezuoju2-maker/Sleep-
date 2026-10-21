-- 为会话查询增加索引
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 为安全日志查询增加索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id, id);

-- 为 Passkey 查询增加索引
CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON passkeys(user_id);
