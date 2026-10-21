# Sleep 平台 · 后续演进

## 已知架构取舍（现状）

| 项 | 现状 | 未来 |
|----|------|------|
| PBKDF2 50k 迭代 | 免费计划 10ms CPU 上限 | 付费计划可 600k |
| Passkey 走 esm.sh | CSP 允许该域 | 自托管到 vendor/ |
| 自研风控盾 | 降级为统计 + 蜜罐硬阻断 | 接 Turnstile 主防线 |
| 反枚举 | 注册接口保留明确 409（UX 优先）；忘记密码为中性响应 | 有滥用投诉再收紧 |
| 邮箱验证 | 已移除，注册即视为已验证（接受伪造邮箱注册的取舍） | 有滥用投诉再评估 |

## P2 剩余工程债（非阻断）

- 线上 users 表与 migrations/0001 存在 schema 漂移（缺 session_version，0001 之后补过 email_verified），后续以 0001 为准重建或逐列补齐

- sessions.js 移除 token_hash 下发（经核实已核销）
- timingSafeEqual 统一到 _crypto.js

## 部署后 1 周

- Sentry 接入
- UptimeRobot 探活
- Cloudflare Web Analytics

## 上线后 1-2 个月

### 安全
1. Turnstile 主防线（替换自研盾）
2. __Host- Cookie 存量会话迁移
3. PBKDF2 升级 600k（需升级 Workers Paid）
4. GitHub OAuth 二次绑定流程

### 功能
5. 密码强度条
6. audit-logs 分页
7. 登录通知邮件

### 供应链
8. @simplewebauthn/browser 自托管

## 长期

- 2FA TOTP
- 账号注销 / 数据导出（GDPR）
- 双 pepper 轮换
- audit_logs R2 冷备
- Playwright E2E
