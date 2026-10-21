-- email / uid 有 UNIQUE 约束的隐式索引，显式索引冗余
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_uid;
-- idx_audit_user_id (user_id) 与 idx_audit_logs_user_id (user_id, id) 重复
DROP INDEX IF EXISTS idx_audit_user_id;
