-- 存量用户 email 统一小写化
-- 注意：若存在仅大小写不同的重复邮箱会触发 UNIQUE 冲突。
-- 线上 0 用户状态下安全，未来需先查重。
UPDATE users SET email = LOWER(TRIM(email)) WHERE email != LOWER(TRIM(email));
