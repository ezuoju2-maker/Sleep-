-- 存量用户 email 统一小写化（P1-09 配套）
UPDATE users SET email = LOWER(TRIM(email)) WHERE email != LOWER(TRIM(email));
