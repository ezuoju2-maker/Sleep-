-- 历史数据把 locked_until 写成 SQLite 空格格式，与 ISO 字符串比较永远不成立，
-- 导致过期锁永不被清理。统一为 ISO，并删除已过期行。
UPDATE login_attempts
SET locked_until = strftime('%Y-%m-%dT%H:%M:%fZ', replace(locked_until, ' ', 'T'))
WHERE locked_until IS NOT NULL AND locked_until NOT LIKE '%T%';

DELETE FROM login_attempts
WHERE locked_until IS NOT NULL AND locked_until < strftime('%Y-%m-%dT%H:%M:%fZ', 'now');
