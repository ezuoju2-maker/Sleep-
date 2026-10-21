# Sleep 平台 · 运维与监控

## 部署后 1 周内必配

### 1. Sentry（免费 5k errors/月）
- npm install @sentry/cloudflare
- 在 functions/_middleware.js 包一层 Sentry.withSentry
- DSN: wrangler pages secret put SENTRY_DSN

### 2. UptimeRobot（免费 50 监控）
- URL: https://sleeping.cc.cd/
- 间隔: 5 分钟
- 告警: 邮件

### 3. Cloudflare Web Analytics
Pages → sleep → Analytics → Enable

### 4. securityheaders.com
部署后访问 https://securityheaders.com/?q=https://sleeping.cc.cd/ ，目标 A 级。

### 5. SSL Labs
部署后访问 https://www.ssllabs.com/ssltest/analyze.html?d=sleeping.cc.cd ，目标 A 级。

## 日志

- 实时：wrangler pages deployment tail --project-name sleep
- 关键事件：ratelimit_unavailable / threatintel_unavailable / password.changed / password.reset

## 数据库

- 用户数：npx wrangler d1 execute sleep-db --remote --command "SELECT COUNT(*) FROM users"
- D1 配额：免费 5M 读/100K 写每日

## Cron Worker

- 部署：cd cron-worker && npx wrangler deploy
- 日志：cd cron-worker && npx wrangler tail
- 每天 0 UTC（北京 8 点）
- 关注：[cron] threat-intel written, X exact + Y ranges

## 告警升级

| 事件 | 级别 | 处置 |
|------|------|------|
| 首页 5xx | P0 | tail 看日志，回滚上一版本 |
| 登录 5xx | P0 | 检查 D1/KV 配额 |
| `ratelimit_unavailable` 日志 | P0 | 检查 D1 绑定与配额；确认降级策略生效 |
| CPU 超限 / Error 1102 | P0 | 登录 5xx 突查；按 PBKDF2 档位决策处理 |
| Cron 连续 3 天无输出 | P1 | 检查 KV 配额、情报源 |
| 邮件发送失败 | P2 | 检查 RESEND_API_KEY、3000/月配额 |
