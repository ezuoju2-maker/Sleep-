-- 线上 users 表建于 0001 之前的手工建表，缺少 email_verified 列，
-- 而 register / github-callback / me 均依赖该列。补列并保持与 0001 定义一致。
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
