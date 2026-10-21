# Sleep 平台 · 最终交付

- commit: `71406eb`（工作区未提交改动 93 项）
- time:   2026-10-21 19:29:24
- files:  86

## 一、文件清单

- .github/workflows/ci.yml
- .gitignore
- OPERATIONS.md
- ROADMAP.md
- _headers
- app.js
- cron-worker/index.js
- cron-worker/wrangler.toml
- eslint.config.mjs
- functions/_middleware.js
- functions/api/_audit.js
- functions/api/_constants.js
- functions/api/_crypto.js
- functions/api/_csrf.js
- functions/api/_disposable.js
- functions/api/_email.js
- functions/api/_errors.js
- functions/api/_hibp.js
- functions/api/_http.js
- functions/api/_notify.js
- functions/api/_password.js
- functions/api/_ratelimit.js
- functions/api/_session.js
- functions/api/_shield.js
- functions/api/_threatintel.js
- functions/api/_token.js
- functions/api/audit-logs.js
- functions/api/change-password.js
- functions/api/forgot.js
- functions/api/github-callback.js
- functions/api/github-login.js
- functions/api/login.js
- functions/api/logout.js
- functions/api/me.js
- functions/api/passkey/login-options.js
- functions/api/passkey/login-verify.js
- functions/api/passkey/register-options.js
- functions/api/passkey/register-verify.js
- functions/api/register.js
- functions/api/reset.js
- functions/api/sessions.js
- functions/api/verify-sudo.js
- help.html
- index.html
- manifest.json
- migrations/0001_create_users.sql
- migrations/0002_create_sessions.sql
- migrations/0003_add_email_verification.sql
- migrations/0004_create_login_attempts.sql
- migrations/0005_create_password_resets.sql
- migrations/0006_create_passkeys.sql
- migrations/0007_create_passkey_challenges.sql
- migrations/0008_create_audit_logs.sql
- migrations/0009_add_session_details.sql
- migrations/0010_add_username.sql
- migrations/0011_add_reset_used_at.sql
- migrations/0012_rebuild_login_attempts.sql
- migrations/0013_add_indexes.sql
- migrations/0014_create_device_fingerprints.sql
- migrations/0015_fix_passkey_user_id.sql
- migrations/0016_add_missing_indexes.sql
- migrations/0017_add_token_indexes.sql
- migrations/0018_add_github_id.sql
- migrations/0019_create_email_logs.sql
- migrations/0020_drop_redundant_indexes.sql
- migrations/0021_add_last_seen_at.sql
- migrations/0022_lowercase_emails.sql
- migrations/0023_rate_limits.sql
- migrations/0024_drop_email_verification.sql
- migrations/0025_normalize_login_attempts.sql
- migrations/0026_add_email_verified.sql
- package-lock.json
- package.json
- passkey.js
- privacy.html
- static/legal.css
- style.css
- sw.js
- terms.html
- test/csrf.test.js
- test/password-hash.test.js
- test/password-policy.test.js
- test/ratelimit.test.js
- test/routes-smoke.test.js
- test/time-safety.test.js
- wrangler.toml

## 二、源码

### .github/workflows/ci.yml

``````
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci --no-audit --no-fund
      - name: Lint
        run: npm run lint
      - name: JS syntax
        run: |
          FAIL=0
          for f in $(find functions cron-worker test -name '*.js' -type f); do
            node --check "$f" || { echo "FAIL $f"; FAIL=1; }
          done
          exit $FAIL
      - name: Unit tests
        run: npm test

``````

### .gitignore

``````
node_modules/
.wrangler/
.env
.env.*
.dev.vars
*.log
.DS_Store
*.bak*
*.original
KNOWN_ISSUES.txt

``````

### OPERATIONS.md

``````
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

``````

### ROADMAP.md

``````
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

- sessions.js 移除 token_hash 下发
- device_fingerprints 死表清理
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

``````

### _headers

``````
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-Permitted-Cross-Domain-Policies: none
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' https://esm.sh; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests

/
  Link: </style.css>; rel=preload; as=style, </app.js>; rel=preload; as=script

/index.html
  Cache-Control: public, max-age=0, must-revalidate

/style.css
  Cache-Control: public, max-age=0, must-revalidate

/app.js
  Cache-Control: public, max-age=0, must-revalidate

/passkey.js
  Cache-Control: public, max-age=0, must-revalidate

/sw.js
  Cache-Control: public, max-age=0, must-revalidate
  Service-Worker-Allowed: /

/logo.png
  Cache-Control: public, max-age=0, must-revalidate

/manifest.json
  Cache-Control: public, max-age=86400

/verify.css
  Cache-Control: public, max-age=0, must-revalidate

/icon-192.png
  Cache-Control: public, max-age=31536000, immutable

/icon-512.png
  Cache-Control: public, max-age=31536000, immutable

/icon-maskable.png
  Cache-Control: public, max-age=31536000, immutable

/apple-touch-icon.png
  Cache-Control: public, max-age=31536000, immutable

/terms.html
  Cache-Control: public, max-age=0, must-revalidate

/privacy.html
  Cache-Control: public, max-age=0, must-revalidate

/help.html
  Cache-Control: public, max-age=0, must-revalidate

/static/*
  Cache-Control: public, max-age=31536000, immutable

``````

### app.js

``````
async function requestApi(path, options = {}, timeoutMs) {
  const isPasskey = typeof path === "string" && path.includes("/api/passkey/");
  const tmo = timeoutMs || (isPasskey ? 15000 : 10000);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), tmo);
  try {
    return await fetch(path, { ...options, signal: ctrl.signal });
  } catch (err) {
    if (err && err.name === "AbortError") {
      throw new Error("请求超时，请检查网络后重试");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

let _sudoToken = null;
const ERROR_CLEAR_TIMEOUT = 3000;


let shieldStartTime = Date.now();
let shieldInteractions = 0;
['mousemove', 'touchmove', 'keydown', 'click'].forEach(evt => document.addEventListener(evt, () => shieldInteractions++, { passive: true }));
function generateFingerprint() {
  const parts = [];
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('fp', 2, 2);
    ctx.strokeStyle = 'rgba(102,204,0,0.7)';
    ctx.arc(50, 25, 20, 0, Math.PI * 2);
    ctx.stroke();
    parts.push(canvas.toDataURL());
  } catch { }
  parts.push(navigator.hardwareConcurrency ?? '?');
  parts.push(navigator.platform ?? '?');
  parts.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  parts.push(Intl.DateTimeFormat().resolvedOptions().timeZone ?? '?');
  let hash = 0;
  const raw = parts.join('|');
  for (let i = 0; i < raw.length; i += 1) hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  return `fp_${(hash >>> 0).toString(36)}`;
}
const deviceFingerprint = generateFingerprint();
function getShieldData(isReg) {
  const hp = document.getElementById(isReg ? 'shield_hp_reg' : 'shield_hp');
  return { timeSpent: Math.floor((Date.now() - shieldStartTime) / 1000), interactions: shieldInteractions, isHoneypotFilled: hp ? hp.value !== "" : false, fingerprint: deviceFingerprint, isHeadless: navigator.webdriver || /HeadlessChrome|Puppeteer|Selenium/.test(navigator.userAgent) };
}
const cardContainer = document.getElementById('cardContainer');
function triggerShake() { cardContainer.classList.remove('shake'); void cardContainer.offsetWidth; cardContainer.classList.add('shake'); }
function showToast(msg) {
  const t = document.createElement('div');
  t.setAttribute('role', 'status');
  t.setAttribute('aria-live', 'polite');
  t.setAttribute('aria-atomic', 'true');
  t.style.cssText = 'position:fixed;bottom:20%;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;z-index:999;transition:opacity 0.3s;';
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
}
function showError(input, tip, msg) { if(input){input.classList.add('error');input.setAttribute('aria-invalid','true');} if(tip){tip.textContent=msg;tip.hidden=false;tip.classList.add('error-text');} }
function clearError(input, tip, def="") { if(input){input.classList.remove('error');input.setAttribute('aria-invalid','false');} if(tip){tip.classList.remove('error-text');if(def){tip.textContent=def;tip.hidden=false;}else tip.hidden=true;} }

function clearAllErrors() {
  clearError(document.getElementById('loginUser'), document.getElementById('tipLoginUser'));
  clearError(document.getElementById('loginPwd'), document.getElementById('tipLoginPwd'));
  clearError(document.getElementById('regUser'), document.getElementById('tipUser'), "支持 4-20 位字母、数字或下划线");
  clearError(document.getElementById('regEmail'), document.getElementById('tipEmail'), "用于登录、找回密码及接收重要通知");
  clearError(document.getElementById('regPwd'), document.getElementById('tipPwd'), "长度 12-128 位，需包含大写字母、小写字母、数字、符号中的至少两种");
  clearError(document.getElementById('regPwdConfirm'), document.getElementById('tipPwdConfirm'), "请与上方设置的密码保持一致");
  document.querySelectorAll(".checkbox-group").forEach(c => c.classList.remove('error-checkbox'));
}

const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 128;

const i18nDict = {
  "zh-CN": {
    welcome: "欢迎回来",
    regTitle: "创建账号",
    subLogin: "登录以继续访问 Sleep 平台",
    subReg: "加入 Sleep 平台，开启你的专属空间",
    login: "登录",
    register: "注册",
    btnLogin: "登 录",
    btnRegister: "注 册",
    remember: "记住我",
    forgot: "忘记密码?",
    userWelcome: "欢迎回来！",
    uid: "专属 ID:",
    btnAudit: "查看账号安全日志",
    btnSessions: "管理登录设备",
    btnChangePwd: "修改登录密码",
    btnAddPasskey: "开启面容 / 指纹登录",
    btnLogout: "退出登录",
    modalForgotTitle: "找回密码",
    modalForgotDesc: "输入注册时的邮箱，我们将发送重置链接。",
    btnCancel: "取消",
    btnSendEmail: "发送邮件",
    modalResetTitle: "设置新密码",
    btnConfirmChange: "确认修改",
    modalChangePwdTitle: "修改密码",
    modalSessionsTitle: "登录设备管理",
    btnRevokeOthers: "下线所有其他设备",
    modalAuditTitle: "账号安全日志",
    modalSudoTitle: "安全验证",
    modalSudoDesc: "为了您的账号安全，请再次输入登录密码。",
    btnVerify: "验证",
    divider: "或使用以下方式",
    agreePrefix: "我已阅读并同意",
    terms: "《服务条款》",
    and: "和",
    privacy: "《隐私政策》",
    footerPrivacy: "隐私政策",
    footerTerms: "用户协议",
    footerHelp: "帮助中心",
    tipLoginUser: "账号格式错误",
    tipLoginPwd: "密码不能为空",
    tipUser: "支持 4-20 位字母、数字或下划线",
    tipEmail: "用于登录、找回密码及接收重要通知",
    tipPwd: "长度 12-128 位，需包含大写字母、小写字母、数字、符号中的至少两种",
    tipPwdConfirm: "请与上方设置的密码保持一致",
    phLoginUser: "请输入用户名或邮箱",
    phLoginPwd: "请输入密码",
    phRegUser: "请设置用户名 (4-20位)",
    phRegEmail: "请输入邮箱地址",
    phRegPwd: "设置密码",
    phRegPwdConfirm: "再次确认密码",
    phOldPwd: "输入当前密码",
    phNewPwd: "输入新密码 (12-128位)"
  },
  "en": {
    welcome: "Welcome Back",
    regTitle: "Create Account",
    subLogin: "Sign in to continue to Sleep",
    subReg: "Join Sleep and open your space",
    login: "Login",
    register: "Register",
    btnLogin: "Login",
    btnRegister: "Register",
    remember: "Remember me",
    forgot: "Forgot password?",
    userWelcome: "Welcome back!",
    uid: "UID:",
    btnAudit: "Audit Logs",
    btnSessions: "Manage Devices",
    btnChangePwd: "Change Password",
    btnAddPasskey: "Enable Passkey",
    btnLogout: "Logout",
    modalForgotTitle: "Reset Password",
    modalForgotDesc: "Enter your registered email to receive a reset link.",
    btnCancel: "Cancel",
    btnSendEmail: "Send Email",
    modalResetTitle: "Set New Password",
    btnConfirmChange: "Confirm",
    modalChangePwdTitle: "Change Password",
    modalSessionsTitle: "Device Management",
    btnRevokeOthers: "Logout Other Devices",
    modalAuditTitle: "Audit Logs",
    modalSudoTitle: "Security Check",
    modalSudoDesc: "Please enter your password to verify.",
    btnVerify: "Verify",
    divider: "Or continue with",
    agreePrefix: "I have read and agree to the",
    terms: "Terms of Service",
    and: "and",
    privacy: "Privacy Policy",
    footerPrivacy: "Privacy",
    footerTerms: "Terms",
    footerHelp: "Help",
    tipLoginUser: "Invalid account format",
    tipLoginPwd: "Password cannot be empty",
    tipUser: "4-20 letters, numbers or underscores",
    tipEmail: "Used for login, password recovery and notifications",
    tipPwd: "12-128 chars, at least two of: uppercase, lowercase, digits, symbols",
    tipPwdConfirm: "Must match the password above",
    phLoginUser: "Username or email",
    phLoginPwd: "Password",
    phRegUser: "Username (4-20 chars)",
    phRegEmail: "Email address",
    phRegPwd: "Set password",
    phRegPwdConfirm: "Confirm password",
    phOldPwd: "Current password",
    phNewPwd: "New password (12-128 chars)"
  }
};
let currentLang = 'zh-CN';
function applyLanguage(lang) {
  if (!i18nDict[lang]) lang = 'en';
  currentLang = lang;
  const dict = i18nDict[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] != null) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] != null) el.placeholder = dict[key];
  });

  const isReg = document.getElementById('tabRegister')?.classList.contains('active');
  const pageTitle = document.getElementById('pageTitle');
  const pageSub = document.getElementById('pageSub');
  if (pageTitle) pageTitle.textContent = isReg ? dict.regTitle : dict.welcome;
  if (pageSub) pageSub.textContent = isReg ? dict.subReg : dict.subLogin;

  document.documentElement.lang = lang;
  const flag = document.getElementById('currentFlag');
  const text = document.getElementById('currentText');
  if (flag) flag.textContent = lang === 'zh-CN' ? '🇨🇳' : '🇺🇸';
  if (text) text.textContent = lang === 'zh-CN' ? '简体中文' : 'English';

  try { localStorage.setItem('sleep_lang', lang); } catch {}
}

const langMenu = document.getElementById('langMenu');
if (langMenu) {
    langMenu.innerHTML = `
    <div class="lang-item" data-lang="zh-CN">🇨🇳 简体中文</div>
    <div class="lang-item" data-lang="en">🇺🇸 English</div>
  `;
  langMenu.querySelectorAll('.lang-item').forEach(item => {
    item.addEventListener('click', () => {
      applyLanguage(item.dataset.lang);
      langMenu.classList.remove('active');
    });
  });
}
document.getElementById('langBtn').onclick = (e) => { e.stopPropagation(); langMenu.classList.toggle('active'); };
document.addEventListener('click', (e) => { if (!e.target.closest('.lang-container')) langMenu.classList.remove('active'); });

document.querySelectorAll('.eye-wrapper').forEach(w => {
  w.onclick = (e) => { e.preventDefault(); const i = w.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password'; w.classList.toggle('show-pwd'); i.focus(); };
});
document.getElementById('tabLogin').onclick = () => { document.getElementById('tabLogin').classList.add('active'); document.getElementById('tabRegister').classList.remove('active'); document.getElementById('loginForm').classList.add('active'); document.getElementById('registerForm').classList.remove('active'); clearAllErrors(); applyLanguage(currentLang); };
document.getElementById('tabRegister').onclick = () => { document.getElementById('tabRegister').classList.add('active'); document.getElementById('tabLogin').classList.remove('active'); document.getElementById('registerForm').classList.add('active'); document.getElementById('loginForm').classList.remove('active'); clearAllErrors(); applyLanguage(currentLang); };

async function handleSubmit(e, type) {
  e.preventDefault(); clearAllErrors(); let isValid = true;
  if (type === 'login') {
    const u = document.getElementById('loginUser'), p = document.getElementById('loginPwd'), a = document.getElementById('agreeLogin');
    if (!u.value.trim()) { showError(u, document.getElementById('tipLoginUser'), "请输入账号"); isValid = false; }
    if (!p.value.trim()) { showError(p, document.getElementById('tipLoginPwd'), "请输入密码"); isValid = false; }
    if (!a.checked) { a.parentElement.classList.add('error-checkbox'); isValid = false; }
    if (!isValid) { triggerShake(); setTimeout(clearAllErrors, ERROR_CLEAR_TIMEOUT); return; }
    const btn = document.querySelector('#formLogin .btn-submit'); btn.classList.add('loading'); btn.disabled = true;
    try {
      const res = await requestApi('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify({ account: u.value.trim(), password: p.value, remember: document.getElementById('remember').checked, shield: getShieldData(false) }) });
      const data = await res.json();
      if (data.error) showError(p, document.getElementById('tipLoginPwd'), data.error); else checkStatus();
    } catch (err) { showError(p, document.getElementById('tipLoginPwd'), "网络错误"); }
    btn.classList.remove('loading'); btn.disabled = false;
  } else {
    const u = document.getElementById('regUser'), em = document.getElementById('regEmail'), p = document.getElementById('regPwd'), pc = document.getElementById('regPwdConfirm'), a = document.getElementById('agreeRegister');
    if (!u.value.trim() || !/^[a-zA-Z0-9_]{4,20}$/.test(u.value.trim())) { showError(u, document.getElementById('tipUser'), "格式不正确"); isValid = false; }
    if (!em.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) { showError(em, document.getElementById('tipEmail'), "格式不正确"); isValid = false; }
    if (p.value.length < PASSWORD_MIN_LENGTH || p.value.length > PASSWORD_MAX_LENGTH) {
      showError(p, document.getElementById('tipPwd'), `密码长度需在 ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} 位之间`); isValid = false;
    } else if ([/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/].filter(rx => rx.test(p.value)).length < 2) {
      showError(p, document.getElementById('tipPwd'), "密码需包含大写字母、小写字母、数字、符号中的至少两种"); isValid = false;
    }
    if (pc.value !== p.value) { showError(pc, document.getElementById('tipPwdConfirm'), "密码不一致"); isValid = false; }
    if (!a.checked) { a.parentElement.classList.add('error-checkbox'); isValid = false; }
    if (!isValid) { triggerShake(); setTimeout(clearAllErrors, ERROR_CLEAR_TIMEOUT); return; }
    const btn = document.querySelector('#formRegister .btn-submit'); btn.classList.add('loading'); btn.disabled = true;
    try {
      const res = await requestApi('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify({ username: u.value.trim(), email: em.value.trim(), password: p.value, shield: getShieldData(true) }) });
      const data = await res.json();
      if (data.error) {
        if (/密码/.test(data.error)) showError(p, document.getElementById('tipPwd'), data.error);
          else showError(em, document.getElementById('tipEmail'), data.error);
      } else {
        showToast("注册成功");
        document.getElementById('formRegister').reset();
        await checkStatus();
        const uidRow = document.getElementById('userUid')?.closest('p');
        if (uidRow) uidRow.style.display = 'none';
      }
    } catch (err) { showError(em, document.getElementById('tipEmail'), "网络错误"); }
    btn.classList.remove('loading'); btn.disabled = false;
  }
}
document.getElementById('formLogin').onsubmit = (e) => handleSubmit(e, 'login');
document.getElementById('formRegister').onsubmit = (e) => handleSubmit(e, 'register');

async function checkStatus() {
  try {
    const res = await requestApi('/api/me'); const data = await res.json();
    if (data.success) {
      document.getElementById('mainTabs').style.display = 'none';
      document.querySelectorAll('.form-content').forEach(el => el.classList.remove('active'));
      document.querySelector('.card-header').style.display = 'none';
      document.getElementById('userPanel').style.display = 'block';
      document.getElementById('userUid').textContent = data.user.uid;
    } else {
      document.getElementById('mainTabs').style.display = 'flex';
      document.querySelector('.card-header').style.display = 'block';
      document.getElementById('userPanel').style.display = 'none';
      document.getElementById('loginForm').classList.add('active');
    }
  } catch {}
}
document.getElementById('btnLogout').onclick = async () => { await requestApi('/api/logout', { method: 'POST' }); checkStatus(); };

document.getElementById('btnGithubLogin').onclick = () => window.location.href = '/api/github-login';
document.getElementById('linkForgot').onclick = (e) => { e.preventDefault(); document.getElementById('forgotModal').style.display = 'flex'; };
document.getElementById('btnCancelForgot').onclick = () => document.getElementById('forgotModal').style.display = 'none';
document.getElementById('btnSubmitForgot').onclick = async () => {
  const btn = document.getElementById('btnSubmitForgot');
  const tip = document.getElementById('forgotTip');
  btn.disabled = true;
  try {
    const email = document.getElementById('forgotEmail').value;
    const res = await requestApi('/api/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify({ email, shield: getShieldData(false) }) });
    const data = await res.json();
    if (data.error) {
      tip.textContent = data.error; tip.hidden = false;
    } else {
      showToast(data.message || '邮件已发送');
      document.getElementById('forgotModal').style.display = 'none';
    }
  } catch {
    tip.textContent = '网络错误，请稍后重试'; tip.hidden = false;
  }
  btn.disabled = false;
};

document.getElementById('btnAuditLog').onclick = async () => {
  document.getElementById('auditModal').style.display = 'flex';
  const res = await requestApi('/api/audit-logs'); const data = await res.json();
  const list = document.getElementById('auditList'); list.innerHTML = '';
  if (data.success && data.logs.length) {
    data.logs.forEach(l => {
      const div = document.createElement('div'); div.style.padding = '8px'; div.style.borderBottom = '1px solid #eee';
      const b = document.createElement('b'); b.textContent = l.action;
      const span = document.createElement('span'); span.textContent = ` - ${l.ip} (${l.country})`;
      div.appendChild(b); div.appendChild(span); list.appendChild(div);
    });
  } else { list.textContent = '暂无日志'; }
};
document.getElementById('btnCloseAudit').onclick = () => document.getElementById('auditModal').style.display = 'none';

document.getElementById('btnSessions').onclick = async () => {
  document.getElementById('sessionsModal').style.display = 'flex';
  const res = await requestApi('/api/sessions'); const data = await res.json();
  const list = document.getElementById('sessionsList'); list.innerHTML = '';
  if (data.success) {
    data.sessions.forEach(s => {
      const div = document.createElement('div'); div.style.padding = '8px'; div.style.borderBottom = '1px solid #eee';
      div.textContent = `${s.ip} - ${s.isCurrent ? '当前设备' : '其他设备'}`; list.appendChild(div);
    });
  } else { list.textContent = '获取失败'; }
};
document.getElementById('btnCloseSessions').onclick = () => document.getElementById('sessionsModal').style.display = 'none';

document.getElementById('btnRevokeOthers').onclick = async () => {
  const btn = document.getElementById('btnRevokeOthers');
  btn.disabled = true;
  try {
    const res = await requestApi('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ action: 'revoke_others' }),
    });
    const data = await res.json();
    if (data.error) {
      showToast(data.error);
    } else {
      showToast(data.message || '已下线其他设备');
      document.getElementById('sessionsModal').style.display = 'none';
    }
  } catch {
    showToast('网络错误，请稍后重试');
  }
  btn.disabled = false;
};

document.getElementById('btnChangePwd').onclick = () => document.getElementById('sudoModal').style.display = 'flex';
document.getElementById('btnCancelSudo').onclick = () => document.getElementById('sudoModal').style.display = 'none';
document.getElementById('btnSubmitSudo').onclick = async () => {
  const btn = document.getElementById('btnSubmitSudo');
  const tip = document.getElementById('sudoTip');
  btn.disabled = true;
  try {
    const pwd = document.getElementById('sudoPassword').value;
    const res = await requestApi('/api/verify-sudo', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify({ password: pwd }) });
    const data = await res.json();
    if (data.success) {
      _sudoToken = data.sudo_token;
      tip.hidden = true;
      document.getElementById('sudoModal').style.display = 'none';
      document.getElementById('changePwdModal').style.display = 'flex';
    } else {
      tip.textContent = data.error || '验证失败'; tip.hidden = false;
    }
  } catch {
    tip.textContent = '网络错误，请稍后重试'; tip.hidden = false;
  }
  btn.disabled = false;
};
document.getElementById('btnCancelChange').onclick = () => document.getElementById('changePwdModal').style.display = 'none';
document.getElementById('btnSubmitChange').onclick = async () => {
  const btn = document.getElementById('btnSubmitChange');
  const tip = document.getElementById('changePwdTip');
  btn.disabled = true;
  try {
    const oldPwd = document.getElementById('oldPwd').value, newPwd = document.getElementById('newPwdChange').value;
    const res = await requestApi('/api/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd, sudo_token: _sudoToken }) });
    const data = await res.json();
    if (data.error) {
      tip.textContent = data.error; tip.hidden = false;
    } else {
      showToast(data.message || '密码已修改');
      window.location.href = '/';
    }
  } catch {
    tip.textContent = '网络错误，请稍后重试'; tip.hidden = false;
  }
  btn.disabled = false;
};

const btnPasskeyLogin = document.getElementById('btnPasskeyLogin');
if (btnPasskeyLogin) {
  btnPasskeyLogin.onclick = async () => {
    try {
      const resp = await requestApi('/api/passkey/login-options', { method: 'POST' });
      const { options, challengeId } = await resp.json();
      const credential = await window.SimpleWebAuthnBrowser.startAuthentication({ optionsJSON: options });
      const verifyResp = await requestApi('/api/passkey/login-verify', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify({ challengeId, credential }) });
      const verifyData = await verifyResp.json();
      if (verifyData.success) checkStatus(); else showToast(verifyData.error);
    } catch (err) { showToast("操作已取消"); }
  };
}
document.getElementById('btnAddPasskey').onclick = async () => {
  try {
    const resp = await requestApi('/api/passkey/register-options', { method: 'POST' });
    const { options, challengeId } = await resp.json();
    const credential = await window.SimpleWebAuthnBrowser.startRegistration({ optionsJSON: options });
    const verifyResp = await requestApi('/api/passkey/register-verify', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify({ challengeId, credential }) });
    const verifyData = await verifyResp.json();
    if (verifyData.success) showToast("绑定成功"); else showToast(verifyData.error);
  } catch (err) { showToast("操作已取消"); }
};


// ===== F-01 找回密码：消费邮件链接中的 reset_token =====
(function initResetFlow() {
  const token = new URLSearchParams(location.search).get('reset_token');
  if (!token) return;
  history.replaceState(null, '', location.pathname);
  const modal = document.getElementById('resetPwdModal');
  const input = document.getElementById('newPwd');
  const tip = document.getElementById('resetTip');
  const btn = document.getElementById('btnResetPwd');
  modal.style.display = 'flex';
  input.focus();
  btn.onclick = async () => {
    const pwd = input.value;
    if (pwd.length < PASSWORD_MIN_LENGTH || pwd.length > PASSWORD_MAX_LENGTH) {
      tip.textContent = `密码长度需在 ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} 位之间`;
      tip.style.display = 'block';
      return;
    }
    btn.disabled = true;
    btn.classList.add('loading');
    try {
      const res = await requestApi('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ token, newPassword: pwd })
      });
      const data = await res.json();
      if (data.success) {
        modal.style.display = 'none';
        showToast(data.message || '密码已重置，请重新登录');
      } else {
        tip.textContent = data.error || '重置失败，链接可能已失效';
        tip.style.display = 'block';
      }
    } catch {
      tip.textContent = '网络错误，请稍后重试';
      tip.style.display = 'block';
    }
    btn.disabled = false;
    btn.classList.remove('loading');
  };
})();

// ===== F-04 注册 Service Worker =====
if ('serviceWorker' in navigator) {
  let hasController = Boolean(navigator.serviceWorker.controller);
  let refreshing = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hasController) {
      hasController = true;
      return;
    }
    if (refreshing) return;
    refreshing = true;
    location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }).catch((err) => {
      console.warn('Service Worker 注册失败:', err);
    });
  });
}

// ===== F-12 通用弹窗关闭（btnCloseModal + 遮罩 + Esc）=====
document.getElementById('btnCloseModal').onclick =
  () => { document.getElementById('textModal').style.display = 'none'; };

document.querySelectorAll('[id$="Modal"]').forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('[id$="Modal"]').forEach((m) => {
      if (m.style.display === 'flex') m.style.display = 'none';
    });
  }
});


try {
  const saved = localStorage.getItem('sleep_lang');
  applyLanguage(saved && i18nDict[saved] ? saved : 'zh-CN');
} catch {
  applyLanguage('zh-CN');
}

document.getElementById('currentYear').textContent = new Date().getFullYear();
checkStatus();

// 弹窗焦点圈禁（Tab 键不跑到背景）
(function initModalFocusTrap() {
  const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const modalIds = ['forgotModal','resetPwdModal','changePwdModal','sessionsModal','auditModal','sudoModal','textModal'];
  let lastFocused = null;

  function openModal(modal) {
    if (modal.style.display === 'flex') return;
    lastFocused = document.activeElement;
    modal.style.display = 'flex';
    const first = modal.querySelector(FOCUSABLE);
    if (first) setTimeout(() => first.focus(), 50);
  }

  function closeModal(modal) {
    modal.style.display = 'none';
    if (lastFocused) { lastFocused.focus(); lastFocused = null; }
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const active = modalIds.map(id => document.getElementById(id)).find(m => m && m.style.display === 'flex');
    if (!active) return;
    const items = Array.from(active.querySelectorAll(FOCUSABLE)).filter(el => el.offsetParent !== null);
    if (items.length === 0) { e.preventDefault(); return; }
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  document.addEventListener('keydown', trapFocus, true);

  // 监听所有弹窗 display 变化，触发焦点还原
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      if (m.attributeName === 'style' && m.target.id && modalIds.includes(m.target.id)) {
        if (m.target.style.display === 'none' && lastFocused) {
          lastFocused.focus();
          lastFocused = null;
        }
      }
    });
  });
  modalIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el, { attributes: true });
  });
})();

``````

### cron-worker/index.js

``````
function ipv4ToInt(ip) {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = parseInt(p, 10);
    if (isNaN(v) || v < 0 || v > 255) return null;
    n = (n * 256) + v;
  }
  return n;
}

function cidrToRange(cidr) {
  const [base, bitsStr] = cidr.split("/");
  const bits = bitsStr ? parseInt(bitsStr, 10) : 32;
  if (isNaN(bits) || bits < 0 || bits > 32) return null;
  const baseInt = ipv4ToInt(base);
  if (baseInt === null) return null;
  const size = Math.pow(2, 32 - bits);
  return [baseInt, baseInt + size - 1];
}

async function syncThreatIntel(env) {
  console.log("[cron] threat-intel sync start");
  const ipSet = new Set();
  const cidrSet = new Set();

  const sources = [
    { name: "IPsum", url: "https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt", parse: (t) => t.split("\n").forEach((line) => {
      const p = line.trim().split(/\s+/);
      if (p.length >= 2 && parseInt(p[1], 10) >= 3) ipSet.add(p[0]);
    }) },
    { name: "ThreatFox", url: "https://raw.githubusercontent.com/elliotwutingfeng/ThreatFox-IOC-IPs/main/ips.txt", parse: (t) => t.split("\n").forEach((line) => { if (line && !line.startsWith("#")) ipSet.add(line.trim()); }) },
    { name: "Feodo", url: "https://feodotracker.abuse.ch/downloads/ipblocklist.txt", parse: (t) => t.split("\n").forEach((line) => { if (line && !line.startsWith("#")) ipSet.add(line.trim()); }) },
    { name: "CINS", url: "https://cinsscore.com/list/ci-badguys.txt", parse: (t) => t.split("\n").forEach((line) => { if (line && !line.startsWith("#")) ipSet.add(line.trim()); }) },
    { name: "Spamhaus", url: "https://www.spamhaus.org/drop/drop.txt", parse: (t) => t.split("\n").forEach((line) => {
      if (line && !line.startsWith(";")) {
        const cidr = line.split(";")[0].trim();
        if (cidr.includes("/")) cidrSet.add(cidr);
        else if (cidr) ipSet.add(cidr);
      }
    }) },
  ];

  for (const src of sources) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(src.url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) { console.warn(`[cron] ${src.name} HTTP ${res.status}`); continue; }
      const text = await res.text();
      if (text.length < 100) { console.warn(`[cron] ${src.name} too small: ${text.length} bytes`); continue; }
      src.parse(text);
      console.log(`[cron] ${src.name} ok, total=${ipSet.size}`);
    } catch (e) {
      console.error(`[cron] ${src.name} failed: ${e.message}`);
    }
  }

  if (ipSet.size + cidrSet.size < 1000) {
    console.error(`[cron] threat-intel aborted, only ${ipSet.size + cidrSet.size} entries (guard min=1000)`);
    return;
  }

  const cidrRanges = [];
  for (const cidr of cidrSet) {
    const r = cidrToRange(cidr);
    if (r) cidrRanges.push(`${r[0]},${r[1]}`);
  }

  await env.SLEEP_KV.put("blacklist_ips", Array.from(ipSet).join("\n"));
  await env.SLEEP_KV.put("blacklist_cidrs", cidrRanges.join("\n"));
  console.log(`[cron] threat-intel written, ${ipSet.size} exact + ${cidrRanges.length} ranges`);
}

async function runRetention(env) {
  if (!env.DB) {
    console.warn("[cron] DB binding missing, skip retention");
    return;
  }
  const now = new Date().toISOString();
  const iso365d = new Date(Date.now() - 365 * 86400 * 1000).toISOString();

  try {
    const iso90d = new Date(Date.now() - 90 * 86400 * 1000).toISOString();
    const res = await env.DB.batch([
      env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now),
      env.DB.prepare("DELETE FROM passkey_challenges WHERE expires_at < ?").bind(now),
      env.DB.prepare("DELETE FROM password_resets WHERE expires_at < ?").bind(now),
      env.DB.prepare("DELETE FROM login_attempts WHERE attempts < ?1 AND locked_until IS NULL AND key NOT LIKE 'acct:%' AND key NOT LIKE 'sudo:%'").bind(5),
      env.DB.prepare("DELETE FROM audit_logs WHERE created_at < ?").bind(iso365d),
      env.DB.prepare("DELETE FROM rate_limits WHERE reset_at <= ?").bind(Date.now()),
      env.DB.prepare("DELETE FROM login_attempts WHERE locked_until IS NOT NULL AND locked_until < ?").bind(now),
      env.DB.prepare("DELETE FROM email_logs WHERE created_at < ?").bind(iso90d),
    ]);
    const counts = res.map((r) => (r.meta && r.meta.changes) || 0);
    console.log(`[cron] retention done: sessions=${counts[0]} challenges=${counts[1]} resets=${counts[2]} attempts_unlocked=${counts[3]} audit=${counts[4]} attempts_stale=${counts[5]} email_logs=${counts[6]}`);
  } catch (e) {
    console.error(`[cron] retention failed: ${e.message}`);
  }
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(syncThreatIntel(env));
    ctx.waitUntil(runRetention(env));
  },
};

``````

### cron-worker/wrangler.toml

``````
name = "sleep-cron-worker"
main = "index.js"
compatibility_date = "2026-10-01"

[[kv_namespaces]]
binding = "SLEEP_KV"
id = "9e9fa794127b4b69a03bc56ce77be5f2"

[[d1_databases]]
binding = "DB"
database_name = "sleep-db"
database_id = "0ea2ea5d-3baa-458b-9ace-f02e332f92c3"

[triggers]
crons = ["0 0 * * *"]

``````

### eslint.config.mjs

``````
import globals from "globals";

export default [
  {
    files: ["functions/**/*.js", "cron-worker/**/*.js", "test/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.builtin, ...globals.worker },
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];

``````

### functions/_middleware.js

``````
const BLOCKED_PREFIXES = ["/test/", "/migrations/", "/.github/", "/node_modules/", "/.wrangler/", "/cron-worker/"];
const BLOCKED_EXACT = new Set([
  "/wrangler.toml", "/package.json", "/package-lock.json", "/eslint.config.mjs",
  "/Sleep_final.md", "/logo.png.original", "/.assetsignore", "/.gitignore",
]);
const BLOCKED_SUFFIXES = [".md", ".sql", ".toml", ".log", ".original", ".test.js", ".yml", ".yaml"];
const ALLOWED_HTML = new Set(["/", "/index.html", "/help.html", "/privacy.html", "/terms.html"]);

function isBlocked(pathname) {
  if (BLOCKED_EXACT.has(pathname)) return true;
  if (BLOCKED_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return BLOCKED_SUFFIXES.some((suf) => pathname.endsWith(suf));
}

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Permissions-Policy": "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

const HTML_CSP = "default-src 'self'; script-src 'self' https://esm.sh; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests";

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (isBlocked(url.pathname)) {
    return new Response("Not Found", {
      status: 404,
      headers: { ...SECURITY_HEADERS, "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const response = await context.next();
  const headers = new Headers(response.headers);

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(k)) headers.set(k, v);
  }

  if (url.pathname.startsWith("/api/")) {
    headers.set("Cache-Control", "no-store");
    headers.set("Pragma", "no-cache");
  }

  const contentType = (headers.get("Content-Type") || "").toLowerCase();
  if (contentType.includes("text/html")) {
    // 未在允许列表中的 HTML 响应视为 SPA fallback，返回 404，避免未知路径一律 200。
    if (!ALLOWED_HTML.has(url.pathname)) {
      return new Response("Not Found", {
        status: 404,
        headers: { ...SECURITY_HEADERS, "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    if (!headers.has("Content-Security-Policy")) {
      headers.set("Content-Security-Policy", HTML_CSP);
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

``````

### functions/api/_audit.js

``````
export async function writeAudit(env, request, { userId, action, detail }) {
  try {
    const cf = request.cf || {};
    const finalAction = detail ? `${action}:${detail}` : action;
    await env.DB
      .prepare("INSERT INTO audit_logs (user_id, action, ip, country, user_agent) VALUES (?, ?, ?, ?, ?)")
      .bind(
        userId,
        finalAction,
        request.headers.get("cf-connecting-ip") || "unknown",
        cf.country || "Unknown",
        request.headers.get("user-agent") || "unknown"
      )
      .run();
  } catch (e) {
    console.error("Audit write failed:", e);
  }
}

``````

### functions/api/_constants.js

``````
// 免费计划单请求 CPU 上限 10ms；100k 实测约 14ms 会触发 Error 1102，50k 约 7ms。
export const PBKDF2_ITERATIONS = 50_000;

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export const SESSION_MAX_AGE_REMEMBER_SEC = 30 * 24 * 60 * 60;
export const SESSION_MAX_AGE_DEFAULT_SEC = 24 * 60 * 60;

export const LOGIN_IP_LIMIT = 20;
export const LOGIN_IP_WINDOW_SEC = 15 * 60;
export const LOGIN_ACCOUNT_FAIL_THRESHOLD = 5;
export const LOGIN_ACCOUNT_LOCK_SEC = 15 * 60;

export const REGISTER_IP_HOUR_LIMIT = 3;
export const REGISTER_IP_DAY_LIMIT = 10;

export const FORGOT_IP_DAY_LIMIT = 5;
export const FORGOT_GLOBAL_DAY_LIMIT = 200;
export const FORGOT_EMAIL_COOLDOWN_SEC = 24 * 60 * 60;

export const SUDO_TOKEN_TTL_SEC = 300;
export const MAX_SESSIONS_PER_USER = 10;

``````

### functions/api/_crypto.js

``````
import { PBKDF2_ITERATIONS as DEFAULT_ITERATIONS } from "./_constants.js";

const MIN_ITERATIONS = 10_000;
const MAX_ITERATIONS = 1_000_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

function getPepper(env) {
  if (!env.PASSWORD_PEPPER) throw new Error("Server misconfiguration: PASSWORD_PEPPER missing");
  return env.PASSWORD_PEPPER;
}

// pepper 经 HMAC 混入口令，避免拼接式构造在降档后削弱强度。
async function pepperPassword(password, pepper) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(pepper), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(password)));
}

async function digestPBKDF2(password, salt, iterations, pepper) {
  const peppered = await pepperPassword(password, pepper);
  const keyMaterial = await crypto.subtle.importKey("raw", peppered, { name: "PBKDF2" }, false, ["deriveBits"]);
  return await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, keyMaterial, 256);
}

function timingSafeEqual(a, b) {
  const len = Math.max(a.length, b.length);
  let result = a.length ^ b.length;
  for (let i = 0; i < len; i++) result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return result === 0;
}

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(str) {
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

export async function hashPassword(password, env, iterations = DEFAULT_ITERATIONS) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hashBuffer = await digestPBKDF2(password, salt, iterations, getPepper(env));
  return `pbkdf2_sha256$${iterations}$${toBase64(salt)}$${toBase64(new Uint8Array(hashBuffer))}`;
}

export async function verifyPassword(password, storedHash, env) {
  try {
    if (typeof storedHash !== "string") return false;
    const parts = storedHash.split("$");
    if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") return false;

    const iterations = Number(parts[1]);
    if (!Number.isInteger(iterations) || iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS) return false;

    const salt = fromBase64(parts[2]);
    const expected = fromBase64(parts[3]);
    if (salt.length !== SALT_BYTES || expected.length !== HASH_BYTES) return false;

    const hashBuffer = await digestPBKDF2(password, salt, iterations, getPepper(env));
    return timingSafeEqual(toBase64(new Uint8Array(hashBuffer)), parts[3]);
  } catch {
    return false;
  }
}

export async function verifyDummyHash(password, env) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  await digestPBKDF2(password, salt, DEFAULT_ITERATIONS, getPepper(env));
  return false;
}

export function hashNeedsRehash(storedHash) {
  if (typeof storedHash !== "string") return true;
  const parts = storedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") return true;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations)) return true;
  return iterations < DEFAULT_ITERATIONS;
}

``````

### functions/api/_csrf.js

``````
export function verifyRequest(request) {
  const fetchSite = request.headers.get("Sec-Fetch-Site");
  const origin = request.headers.get("Origin");

  if (fetchSite) {
    return fetchSite === "same-origin";
  }

  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

``````

### functions/api/_disposable.js

``````
import { fetchWithTimeout } from "./_http.js";

let cachedDomains = null;
let lastFetch = 0;
const CACHE_TTL = 60 * 60 * 1000;

async function loadDomains() {
  if (cachedDomains && Date.now() - lastFetch < CACHE_TTL) return cachedDomains;
  try {
    const res = await fetchWithTimeout(
      "https://disposable.github.io/disposable-email-domains/domains.json",
      { cf: { cacheTtl: 3600 } },
      5000
    );
    if (!res.ok) throw new Error("fetch failed");
    const arr = await res.json();
    if (!Array.isArray(arr)) throw new Error("invalid payload");
    cachedDomains = new Set(arr.map((d) => String(d).toLowerCase()));
    lastFetch = Date.now();
    return cachedDomains;
  } catch {
    return cachedDomains || new Set();
  }
}

export async function isDisposableEmail(email) {
  if (!email || !email.includes("@")) return true;
  const domain = email.split("@")[1].toLowerCase();
  return (await loadDomains()).has(domain);
}

``````

### functions/api/_email.js

``````
import { fetchWithTimeout } from "./_http.js";

export function isEmailConfigured(env) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) {
    return env.ENVIRONMENT === "development";
  }
  return true;
}

async function trySend(env, to, subject, html) {
  const res = await fetchWithTimeout(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: env.RESEND_FROM, to: [to], subject, html }),
    },
    5000
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && data.message) || `resend ${res.status}`);
  }
  return data.id || null;
}

export async function sendEmail(env, to, subject, html, { userId = null, type = "generic" } = {}) {
  if (!isEmailConfigured(env)) {
    return { ok: false, error: "email service not configured" };
  }

  if (!env.RESEND_API_KEY || !env.RESEND_FROM) {
    console.warn("[email] dev mode skip: no config");
    return { ok: false, error: "not configured (dev)" };
  }

  let logId = null;
  if (env.DB) {
    try {
      const r = await env.DB
        .prepare("INSERT INTO email_logs (user_id, to_email, type, status, created_at) VALUES (?, ?, ?, 'pending', ?)")
        .bind(userId, to, type, new Date().toISOString())
        .run();
      logId = r.meta ? r.meta.last_row_id : null;
    } catch (e) {
      console.error("[email] log insert failed", e);
    }
  }

  let lastErr = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const messageId = await trySend(env, to, subject, html);
      if (logId !== null && env.DB) {
        await env.DB
          .prepare("UPDATE email_logs SET status = 'sent', message_id = ? WHERE id = ?")
          .bind(messageId, logId)
          .run()
          .catch((e) => console.error("[email] log update failed", e));
      }
      return { ok: true, messageId };
    } catch (e) {
      lastErr = e;
      console.warn(`[email] attempt ${attempt} failed:`, e.message);
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (logId !== null && env.DB) {
    const msg = String((lastErr && lastErr.message) || "unknown").slice(0, 200);
    await env.DB
      .prepare("UPDATE email_logs SET status = 'failed', error = ? WHERE id = ?")
      .bind(msg, logId)
      .run()
      .catch((e) => console.error("[email] log update failed", e));
  }

  return { ok: false, error: lastErr && lastErr.message };
}

``````

### functions/api/_errors.js

``````

export function jsonError(message, status = 400, requestId = null) {
  const body = { success: false, error: message };
  if (requestId) body.requestId = requestId;
  return Response.json(body, { status });
}

export function jsonSuccess(data = {}, message = "") {
  return Response.json({ success: true, message, ...data });
}

``````

### functions/api/_hibp.js

``````

import { fetchWithTimeout } from "./_http.js";

// 密码泄露检测 (HIBP Pwned Passwords - k-匿名模型)
async function sha1(str) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export async function isPasswordBreached(password) {
  try {
    const hash = await sha1(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const res = await fetchWithTimeout(`https://api.pwnedpasswords.com/range/${prefix}`, { headers: { "User-Agent": "Sleep-App" } }, 3000);
    if (!res.ok) return false;
    
    const text = await res.text();
    for (const line of text.split("\n")) {
      const [hashSuffix, count] = line.trim().split(":");
      if (hashSuffix === suffix) return parseInt(count, 10) > 0;
    }
    return false;
  } catch { 
    return false; // 网络失败放行，不阻断用户
  }
}

``````

### functions/api/_http.js

``````
export function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

``````

### functions/api/_notify.js

``````
import { sendEmail } from "./_email.js";

function escapeHtml(s) {
  return String(s).replace(/[&<>'"]/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

export async function sendPasswordChangedNotice(env, { email, userId, request }) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const country = (request.cf && request.cf.country) || "Unknown";
  const ua = request.headers.get("user-agent") || "unknown";
  const time = new Date().toISOString();

  const html = `<div style="font-family:-apple-system,sans-serif;background:#f4f5f7;padding:40px 20px;text-align:center">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:30px;text-align:left">
<h2 style="color:#111;text-align:center;margin-bottom:16px">密码已变更</h2>
<p style="color:#444">您的 Sleep 账号密码刚刚发生变更。如果这是您本人的操作，请忽略此邮件。</p>
<table style="margin:20px 0;width:100%;border-collapse:collapse;font-size:13px;color:#666">
<tr><td style="padding:6px 0;border-bottom:1px solid #eee;width:90px">时间</td><td style="padding:6px 0;border-bottom:1px solid #eee">${escapeHtml(time)}</td></tr>
<tr><td style="padding:6px 0;border-bottom:1px solid #eee">IP</td><td style="padding:6px 0;border-bottom:1px solid #eee">${escapeHtml(ip)} (${escapeHtml(country)})</td></tr>
<tr><td style="padding:6px 0">设备</td><td style="padding:6px 0">${escapeHtml(ua.slice(0, 120))}</td></tr>
</table>
<p style="color:#e53e3e;font-weight:600">如果不是您本人操作，请立即使用「忘记密码」重置并联系管理员。</p>
</div></div>`;

  try {
    await sendEmail(env, email, "Sleep 账号密码已变更", html, { userId, type: "password_changed" });
  } catch (e) {
    console.error("[notify] password change notice failed:", e);
  }
}

``````

### functions/api/_password.js

``````
import { isPasswordBreached } from "./_hibp.js";
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from "./_constants.js";

export async function validatePassword(env, password, { checkHibp = true } = {}) {
  if (typeof password !== "string") return "密码格式不合法";
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return `密码长度需在 ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} 位之间`;
  }
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/].filter((re) => re.test(password)).length;
  if (classes < 2) return "密码需包含大写字母、小写字母、数字、符号中的至少两种";

  if (checkHibp && (await isPasswordBreached(password))) {
    return "该密码已在数据泄露中出现，请更换";
  }
  return null;
}

``````

### functions/api/_ratelimit.js

``````
export async function rateLimit(env, key, limit, windowSeconds) {
  if (!env.DB) {
    console.error(JSON.stringify({ event: "ratelimit_unavailable", key, limit, windowSeconds }));
    return { ok: false, remaining: 0, degraded: true, retryAfter: 30 };
  }
  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;
  try {
    const row = await env.DB.prepare(
      `INSERT INTO rate_limits (key, count, reset_at) VALUES (?1, 1, ?2)
       ON CONFLICT(key) DO UPDATE SET
         count    = CASE WHEN rate_limits.reset_at <= ?3 THEN 1 ELSE rate_limits.count + 1 END,
         reset_at = CASE WHEN rate_limits.reset_at <= ?3 THEN ?2 ELSE rate_limits.reset_at END
       RETURNING count, reset_at`,
    ).bind(key, resetAt, now).first();
    return { ok: row.count <= limit, remaining: Math.max(0, limit - row.count), resetAt: row.reset_at };
  } catch (err) {
    console.error(JSON.stringify({ event: "ratelimit_error", key, message: err.message }));
    return { ok: false, remaining: 0, degraded: true, retryAfter: 30 };
  }
}

``````

### functions/api/_session.js

``````
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

export async function getSessionUser(request, env, context) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)(?:__Host-)?session=([^;]+)/);
  if (!match) return null;

  const token = match[1];
  const tokenHash = await crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(token))
    .then((b) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join(""));

  const session = await env.DB
    .prepare("SELECT user_id, expires_at, last_seen_at FROM sessions WHERE token_hash = ?")
    .bind(tokenHash)
    .first();

  if (!session) return null;

  if (new Date(session.expires_at) < new Date()) {
    const cleanup = env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    if (context && context.waitUntil) context.waitUntil(cleanup);
    return null;
  }

  const now = Date.now();
  const lastSeen = session.last_seen_at ? new Date(session.last_seen_at).getTime() : 0;
  if (now - lastSeen >= TOUCH_INTERVAL_MS) {
    const touch = env.DB
      .prepare("UPDATE sessions SET last_seen_at = ? WHERE token_hash = ?")
      .bind(new Date(now).toISOString(), tokenHash)
      .run();
    if (context && context.waitUntil) context.waitUntil(touch);
  }

  return { userId: session.user_id, tokenHash };
}

``````

### functions/api/_shield.js

``````
// 风控引擎：硬阻断只保留零误杀信号（蜜罐 + 无头浏览器），
// 时间/交互/指纹降级为审计统计，避免误杀密码管理器自动填充用户和快速提交用户。
export function evaluateShield(shieldData) {
  if (!shieldData) return { pass: false, reason: "missing_shield_data" };

  const { timeSpent, interactions, isHoneypotFilled, fingerprint, isHeadless } = shieldData;

  if (isHoneypotFilled) return { pass: false, reason: "honeypot_triggered" };
  if (isHeadless) return { pass: false, reason: "headless_browser" };

  const signals = [];
  if (typeof timeSpent === "number" && timeSpent < 1) signals.push("fast_submit");
  if (typeof interactions === "number" && interactions < 3) signals.push("low_interaction");
  if (!fingerprint) signals.push("missing_fingerprint");

  return { pass: true, fingerprint: fingerprint || null, signals };
}

``````

### functions/api/_threatintel.js

``````
let cachedExact = null;
let cachedRanges = null;
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000;

function ipv4ToInt(ip) {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = parseInt(p, 10);
    if (isNaN(v) || v < 0 || v > 255) return null;
    n = (n * 256) + v;
  }
  return n;
}

function parseRanges(text) {
  if (!text) return [];
  const out = [];
  for (const line of text.split("\n")) {
    if (!line) continue;
    const [s, e] = line.split(",");
    const sn = parseInt(s, 10);
    const en = parseInt(e, 10);
    if (!isNaN(sn) && !isNaN(en)) out.push([sn, en]);
  }
  return out;
}

async function loadCache(env) {
  const [ipText, cidrText] = await Promise.all([
    env.SLEEP_KV.get("blacklist_ips"),
    env.SLEEP_KV.get("blacklist_cidrs"),
  ]);
  cachedExact = ipText ? new Set(ipText.split("\n").filter(Boolean)) : new Set();
  cachedRanges = parseRanges(cidrText);
  lastFetch = Date.now();
}

export async function isMaliciousIP(env, ip) {
  if (!ip || !env.SLEEP_KV) return false;

  if (cachedExact && cachedRanges && Date.now() - lastFetch < CACHE_TTL) {
    if (cachedExact.has(ip)) return true;
    const ipInt = ipv4ToInt(ip);
    if (ipInt !== null) {
      for (const [start, end] of cachedRanges) {
        if (ipInt >= start && ipInt <= end) return true;
      }
    }
    return false;
  }

  try {
    await loadCache(env);
    return await isMaliciousIP(env, ip);
  } catch (e) {
    console.error(JSON.stringify({ event: "threatintel_unavailable", message: String(e) }));
    return false;
  }
}

``````

### functions/api/_token.js

``````

export function generateToken() {
  const arr = new Uint8Array(32); crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashToken(token) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

``````

### functions/api/audit-logs.js

``````
import { getSessionUser } from "./_session.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "未登录" }, { status: 401 });

  const rows = await env.DB
    .prepare("SELECT action, ip, country, user_agent, created_at FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10")
    .bind(auth.userId)
    .all();

  return Response.json({ success: true, logs: rows.results });
}

``````

### functions/api/change-password.js

``````
import { verifyRequest } from "./_csrf.js";
import { getSessionUser } from "./_session.js";
import { verifyPassword, hashPassword } from "./_crypto.js";
import { writeAudit } from "./_audit.js";
import { sendPasswordChangedNotice } from "./_notify.js";
import { validatePassword } from "./_password.js";

export async function onRequestPost(context) {
  const { request, env, waitUntil } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "会话已过期" }, { status: 401 });

  try {
    const { oldPassword, newPassword, sudo_token } = await request.json();
    const sudoKey = `sudo_${sudo_token}`;
    const owner = await env.SLEEP_KV.get(sudoKey);
    if (!owner || owner !== auth.userId.toString()) {
      return Response.json({ error: "安全验证已过期" }, { status: 403 });
    }
    await env.SLEEP_KV.delete(sudoKey);

      if (!oldPassword) return Response.json({ error: "原密码不能为空" }, { status: 400 });
      const pwdErr = await validatePassword(env, newPassword, { checkHibp: true });
      if (pwdErr) return Response.json({ error: pwdErr }, { status: 400 });

    const user = await env.DB.prepare("SELECT password_hash FROM users WHERE id = ?").bind(auth.userId).first();
    if (!user) return Response.json({ error: "用户不存在" }, { status: 404 });

    const ok = await verifyPassword(oldPassword, user.password_hash, env);
    if (!ok) return Response.json({ error: "原密码不正确" }, { status: 403 });

    const newHash = await hashPassword(newPassword, env);
    await env.DB.batch([
      env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(newHash, auth.userId),
      env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(auth.userId),
      env.DB.prepare("DELETE FROM login_attempts WHERE key LIKE ?").bind(`acct:${auth.userId}:%`),
      env.DB.prepare("DELETE FROM login_attempts WHERE key LIKE ?").bind(`sudo:${auth.userId}:%`),
    ]);
    waitUntil(writeAudit(env, request, { userId: auth.userId, action: "password.changed" }));

    const u = await env.DB.prepare("SELECT email FROM users WHERE id = ?").bind(auth.userId).first();
    if (u && u.email) {
      waitUntil(sendPasswordChangedNotice(env, { email: u.email, userId: auth.userId, request }));
    }

    const secure = request.url.startsWith("https://") ? "; Secure" : "";
    const headers = new Headers({ "Content-Type": "application/json" });
    headers.append("Set-Cookie", `session=; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=0`);
    headers.append("Set-Cookie", "__Host-session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");
    return new Response(JSON.stringify({ success: true, message: "密码修改成功，请重新登录" }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Change Password Error:", err);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

``````

### functions/api/forgot.js

``````
import { verifyRequest } from "./_csrf.js";
import { evaluateShield } from "./_shield.js";
import { sendEmail, isEmailConfigured } from "./_email.js";
import { rateLimit } from "./_ratelimit.js";
import {
  FORGOT_IP_DAY_LIMIT,
  FORGOT_GLOBAL_DAY_LIMIT,
  FORGOT_EMAIL_COOLDOWN_SEC,
} from "./_constants.js";

const SAFE = {
  success: true,
  message: "如果该邮箱已注册，重置邮件已发出，请检查邮箱（包括垃圾箱）。",
};

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  const clientIP = request.headers.get("cf-connecting-ip") || "unknown";
  const safe = () => Response.json(SAFE);

  try {
    if (!isEmailConfigured(env)) {
      return Response.json({ error: "邮件服务暂不可用，请稍后再试" }, { status: 503 });
    }
    const data = await request.json();
    const email = data.email;
    if (!email) return safe();

    if (!evaluateShield(data.shield).pass) {
      return Response.json({ error: "安全验证失败，请刷新页面后重试" }, { status: 403 });
    }

    const today = new Date().toISOString().slice(0, 10);

    const ipRl = await rateLimit(env, `forgot_ip:${clientIP}:${today}`, FORGOT_IP_DAY_LIMIT, 86400);
    if (!ipRl.ok && !ipRl.degraded) return safe();

    const globalRl = await rateLimit(env, `forgot_global:${today}`, FORGOT_GLOBAL_DAY_LIMIT, 86400);
    if (!globalRl.ok && !globalRl.degraded) return safe();

    const cooldown = await env.SLEEP_KV.get(`forgot_cooldown:${email}`);
    if (cooldown) return safe();

    const user = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (!user) return safe();

    const recent = await env.DB
      .prepare("SELECT expires_at FROM password_resets WHERE user_id = ?")
      .bind(user.id)
      .first();
    if (recent && new Date(recent.expires_at).getTime() - Date.now() > 59 * 60 * 1000) {
      return safe();
    }

    await env.SLEEP_KV.put(`forgot_cooldown:${email}`, "1", { expirationTtl: FORGOT_EMAIL_COOLDOWN_SEC });

    const token = crypto.randomUUID();
    const tokenHash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(token))
      .then(b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join(""));
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await env.DB.batch([
      env.DB.prepare("DELETE FROM password_resets WHERE user_id = ?").bind(user.id),
      env.DB.prepare("INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
        .bind(tokenHash, user.id, expiresAt),
    ]);

    const origin = new URL(request.url).origin;
    const resetLink = `${origin}/?reset_token=${token}`;
    const html = `<div style="font-family:-apple-system,sans-serif;background:#f4f5f7;padding:40px 20px;text-align:center">
<div style="max-width:400px;margin:0 auto;background:#fff;border-radius:16px;padding:30px">
<h2 style="color:#111">重置密码</h2>
<p style="color:#666">请点击下方按钮设置新密码（1 小时内有效）。</p>
<a href="${resetLink}" style="display:inline-block;padding:12px 28px;background:#000;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">设置新密码</a>
</div></div>`;

    context.waitUntil(sendEmail(env, email, "重置您的 Sleep 账号密码", html, { userId: user.id, type: "forgot" }));
    return safe();
  } catch (err) {
    console.error("Forgot Error:", err);
    return safe();
  }
}

``````

### functions/api/github-callback.js

``````
import { hashPassword } from "./_crypto.js";
import { generateToken, hashToken } from "./_token.js";
import { fetchWithTimeout } from "./_http.js";

async function exchangeCode(env, code, redirectUri) {
  const res = await fetchWithTimeout("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }).toString(),
  }, 5000);
  const data = await res.json();
  if (data.error || !data.access_token) {
    return { ok: false, error: data.error || "no_token" };
  }
  return { ok: true, accessToken: data.access_token };
}

async function fetchGithubUser(accessToken) {
  const uRes = await fetchWithTimeout("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "Sleep-App" },
  }, 5000);
  const user = await uRes.json();

  const eRes = await fetchWithTimeout("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "Sleep-App" },
  }, 5000);
  const emails = await eRes.json();
  const primary = Array.isArray(emails) ? emails.find((e) => e.primary && e.verified) : null;
  const normalizedEmail = primary ? primary.email.trim().toLowerCase() : null;

  return { id: String(user.id), login: user.login || `gh_${user.id}`, email: normalizedEmail };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) return new Response("授权失败: 缺少参数", { status: 400 });

  const cookieHeader = request.headers.get("Cookie") || "";
  const nonceMatch = cookieHeader.match(/(?:^|;\s*)oauth_nonce=([^;]+)/);
  if (!nonceMatch) {
    return new Response("授权失败: 状态校验失败", { status: 403 });
  }

  const stateKey = `oauth_state:${state}`;
  const storedNonce = await env.SLEEP_KV.get(stateKey);
  if (!storedNonce || storedNonce !== nonceMatch[1]) {
    return new Response("授权失败: 状态校验失败或已过期", { status: 403 });
  }
  await env.SLEEP_KV.delete(stateKey);

  const redirectUri = env.GITHUB_REDIRECT_URI;
  if (!redirectUri) return new Response("服务未配置 GitHub OAuth", { status: 500 });

  const exchange = await exchangeCode(env, code, redirectUri);
  if (!exchange.ok) {
    return new Response(`GitHub 授权失败: ${exchange.error}`, { status: 400 });
  }

  const ghUser = await fetchGithubUser(exchange.accessToken);
  if (!ghUser.email) {
    return new Response("GitHub 账号没有已验证的主邮箱", { status: 400 });
  }

  // 1) 优先按 github_id 查找（已有绑定）
  let user = await env.DB
    .prepare("SELECT id FROM users WHERE github_id = ?")
    .bind(ghUser.id)
    .first();

  // 2) 未绑定但邮箱已存在 → 拒绝静默接管，提示手动绑定
  if (!user) {
    const byEmail = await env.DB
      .prepare("SELECT id FROM users WHERE email = ?")
      .bind(ghUser.email)
      .first();
    if (byEmail) {
      return new Response(
        "该邮箱已通过其他方式注册，请先用密码登录后在账号设置中绑定 GitHub",
        { status: 409 }
      );
    }

    // 3) 全新账号：生成 uid / 唯一 username / 随机密码
    let uid = null;
    for (let i = 0; i < 5; i += 1) {
      const cand = (crypto.getRandomValues(new Uint32Array(1))[0] % 90000000 + 10000000).toString();
      const dup = await env.DB.prepare("SELECT 1 FROM users WHERE uid = ?").bind(cand).first();
      if (!dup) { uid = cand; break; }
    }
    if (!uid) return new Response("系统繁忙，请稍后再试", { status: 503 });

    const passwordHash = await hashPassword(crypto.randomUUID(), env);

    let username = ghUser.login;
    let inserted = false;
    for (let attempt = 0; attempt < 5 && !inserted; attempt += 1) {
      try {
        await env.DB
          .prepare("INSERT INTO users (uid, username, email, password_hash, email_verified, github_id) VALUES (?, ?, ?, ?, 1, ?)")
          .bind(uid, username, ghUser.email, passwordHash, ghUser.id)
          .run();
        inserted = true;
      } catch (err) {
        if (String(err.message || "").includes("UNIQUE")) {
          username = `${ghUser.login}_gh${Math.floor(Math.random() * 10000)}`;
        } else {
          throw err;
        }
      }
    }
    if (!inserted) return new Response("创建账号失败，请稍后再试", { status: 500 });

    user = await env.DB.prepare("SELECT id FROM users WHERE github_id = ?").bind(ghUser.id).first();
  }

  // 4) 签发会话
  const sessionToken = generateToken();
  const tokenHash = await hashToken(sessionToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ua = request.headers.get("user-agent") || "unknown";

  await env.DB.batch([
    env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)")
      .bind(tokenHash, user.id, expiresAt, ip, ua),
    env.DB.prepare("INSERT INTO audit_logs (user_id, action, ip, country, user_agent) VALUES (?, 'oauth.login', ?, ?, ?)")
      .bind(user.id, ip, (request.cf && request.cf.country) || "Unknown", ua),
  ]);

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": [
        `__Host-session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`,
        "oauth_nonce=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
      ],
    },
  });
}

``````

### functions/api/github-login.js

``````
export async function onRequestGet(context) {
  const { request, env } = context;
  const clientId = env.GITHUB_CLIENT_ID;
  const redirectUri = env.GITHUB_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return new Response("服务未配置 GitHub OAuth", { status: 500 });
  }

  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();
  await env.SLEEP_KV.put(`oauth_state:${state}`, nonce, { expirationTtl: 600 });

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${state}`;

  // nonce 绑定发起授权的浏览器，回调时与 KV 中的值双向比对，防止 OAuth 登录 CSRF。
  const secure = request.url.startsWith("https://") ? "; Secure" : "";
  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl,
      "Set-Cookie": `oauth_nonce=${nonce}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
}

``````

### functions/api/login.js

``````
import { verifyRequest } from "./_csrf.js";
import { isMaliciousIP } from "./_threatintel.js";
import { evaluateShield } from "./_shield.js";
import { verifyPassword, hashPassword, verifyDummyHash, hashNeedsRehash } from "./_crypto.js";
import { rateLimit } from "./_ratelimit.js";
import { writeAudit } from "./_audit.js";
import {
  LOGIN_IP_LIMIT,
  LOGIN_IP_WINDOW_SEC,
  LOGIN_ACCOUNT_FAIL_THRESHOLD,
  LOGIN_ACCOUNT_LOCK_SEC,
  SESSION_MAX_AGE_REMEMBER_SEC,
  SESSION_MAX_AGE_DEFAULT_SEC,
  MAX_SESSIONS_PER_USER,
} from "./_constants.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  try {
    const data = await request.json();
    const { account, password, remember } = data;
    const clientIP = request.headers.get("cf-connecting-ip") || "unknown";
    const authError = () => Response.json({ error: "邮箱或密码错误" }, { status: 401 });

    if (!account || !password) return authError();
    if (clientIP !== "unknown" && await isMaliciousIP(env, clientIP)) {
      return Response.json({ error: "来源风险" }, { status: 403 });
    }
    if (!evaluateShield(data.shield).pass) return authError();

    const ipOk = await rateLimit(env, `login_ip:${clientIP}`, LOGIN_IP_LIMIT, LOGIN_IP_WINDOW_SEC);
    if (!ipOk.ok) return Response.json({ error: "尝试过于频繁，请稍后再试" }, { status: 429 });

    const isEmail = account.includes("@");
    const emailKey = isEmail ? String(account).trim().toLowerCase() : "";
    const nameKey = isEmail ? "" : String(account).trim();
    const [byEmail, byName] = await Promise.all([
      isEmail ? env.DB.prepare("SELECT id, password_hash FROM users WHERE email = ?").bind(emailKey).first() : null,
      isEmail ? null : env.DB.prepare("SELECT id, password_hash FROM users WHERE username = ?").bind(nameKey).first(),
    ]);
    const user = byEmail || byName;
    const lockKey = user ? `acct:${user.id}:${clientIP}` : `ip:${clientIP}`;

    let attempt = await env.DB
      .prepare("SELECT attempts, locked_until FROM login_attempts WHERE key = ?")
      .bind(lockKey)
      .first();
    if (attempt && attempt.locked_until && new Date(attempt.locked_until) > new Date()) {
      return Response.json({ error: "尝试过于频繁，请稍后再试" }, { status: 429 });
    }
    if (attempt && attempt.locked_until) {
      await env.DB.prepare("DELETE FROM login_attempts WHERE key = ?").bind(lockKey).run();
      attempt = null;
    }

      if (!user) {
        await verifyDummyHash(password, env);
        await env.DB
          .prepare("INSERT INTO login_attempts (key, attempts, locked_until) VALUES (?1, 1, NULL) ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1, locked_until = CASE WHEN attempts + 1 >= ?2 THEN ?3 ELSE locked_until END")
          .bind(lockKey, LOGIN_ACCOUNT_FAIL_THRESHOLD, new Date(Date.now() + LOGIN_ACCOUNT_LOCK_SEC * 1000).toISOString())
          .run();
        return authError();
      }

      const ok = await verifyPassword(password, user.password_hash, env);
      if (!ok) {
        await env.DB
          .prepare("INSERT INTO login_attempts (key, attempts, locked_until) VALUES (?1, 1, NULL) ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1, locked_until = CASE WHEN attempts + 1 >= ?2 THEN ?3 ELSE locked_until END")
          .bind(lockKey, LOGIN_ACCOUNT_FAIL_THRESHOLD, new Date(Date.now() + LOGIN_ACCOUNT_LOCK_SEC * 1000).toISOString())
          .run();
        context.waitUntil(writeAudit(env, request, { userId: user.id, action: "login.failure" }));
        return authError();
      }

    await env.DB.prepare("DELETE FROM login_attempts WHERE key = ?").bind(lockKey).run();

    if (hashNeedsRehash(user.password_hash)) {
      const newHash = await hashPassword(password, env);
      await env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(newHash, user.id).run();
    }

    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
    const tokenHash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(token))
      .then(b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join(""));
    const ttlSec = remember ? SESSION_MAX_AGE_REMEMBER_SEC : SESSION_MAX_AGE_DEFAULT_SEC;
    const expiresAt = new Date(Date.now() + ttlSec * 1000).toISOString();
    const secure = request.url.startsWith("https://") ? "; Secure" : "";

    const MAX_SESSIONS = MAX_SESSIONS_PER_USER;
    const existing = await env.DB
      .prepare("SELECT COUNT(*) AS n FROM sessions WHERE user_id = ?")
      .bind(user.id)
      .first();
    if (existing.n >= MAX_SESSIONS) {
      await env.DB
        .prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash IN (SELECT token_hash FROM sessions WHERE user_id = ? ORDER BY created_at ASC LIMIT ?)")
        .bind(user.id, user.id, existing.n - MAX_SESSIONS + 1)
        .run();
    }

    await env.DB
      .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)")
      .bind(tokenHash, user.id, expiresAt, clientIP, request.headers.get("user-agent") || "unknown")
      .run();

    context.waitUntil(writeAudit(env, request, { userId: user.id, action: "login.success" }));

    const cookieName = secure ? "__Host-session" : "session";
    const cookie = `${cookieName}=${token}; HttpOnly${secure}; SameSite=Lax; Path=/${remember ? "; Max-Age=2592000" : ""}`;
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

``````

### functions/api/logout.js

``````
import { verifyRequest } from "./_csrf.js";
import { hashToken } from "./_token.js";

function clearCookies(request) {
  const secure = request.url.startsWith("https://") ? "; Secure" : "";
  return [
    `session=; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=0`,
    `__Host-session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
  ];
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)(?:__Host-)?session=([^;]+)/);
  if (match) {
    const tokenHash = await hashToken(match[1]);
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
  }

  const headers = new Headers({ "Content-Type": "application/json" });
  for (const c of clearCookies(request)) headers.append("Set-Cookie", c);
  return new Response(JSON.stringify({ success: true, message: "登出成功" }), {
    status: 200,
    headers,
  });
}

``````

### functions/api/me.js

``````
import { getSessionUser } from "./_session.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "会话已过期，请重新登录" }, { status: 401 });

  const user = await env.DB
    .prepare("SELECT uid, email, username, email_verified, created_at FROM users WHERE id = ?")
    .bind(auth.userId)
    .first();

  if (!user) return Response.json({ error: "用户不存在" }, { status: 404 });
  return Response.json({ success: true, user });
}

``````

### functions/api/passkey/login-options.js

``````
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { verifyRequest } from "../_csrf.js";
import { rateLimit } from "../_ratelimit.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await rateLimit(env, `passkey_options_ip:${ip}`, 20, 900);
  if (!rl.ok && !rl.degraded) {
    return Response.json({ error: "尝试过于频繁，请稍后再试" }, { status: 429 });
  }

  const rpID = env.WEBAUTHN_RP_ID || new URL(request.url).hostname;
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
  });

  const challengeId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await env.DB
    .prepare("INSERT INTO passkey_challenges (id, user_id, challenge, expires_at) VALUES (?, NULL, ?, ?)")
    .bind(challengeId, options.challenge, expiresAt)
    .run();

  return Response.json({ options, challengeId });
}

``````

### functions/api/passkey/login-verify.js

``````
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { verifyRequest } from "../_csrf.js";
import { SESSION_MAX_AGE_REMEMBER_SEC } from "../_constants.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  try {
    const { challengeId, credential } = await request.json();
    if (!challengeId || !credential) {
      return Response.json({ error: "参数缺失" }, { status: 400 });
    }

    const expectedOrigin = new URL(request.url).origin;
    const expectedRPID = env.WEBAUTHN_RP_ID || new URL(request.url).hostname;

    const challengeRow = await env.DB
      .prepare("SELECT challenge FROM passkey_challenges WHERE id = ? AND expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')")
      .bind(challengeId)
      .first();
    if (!challengeRow) return Response.json({ error: "验证已过期" }, { status: 400 });

    const credentialId = credential.id;
    const passkey = await env.DB
      .prepare("SELECT user_id, public_key, counter FROM passkeys WHERE credential_id = ?")
      .bind(credentialId)
      .first();
    if (!passkey) return Response.json({ error: "未找到该设备的绑定记录" }, { status: 404 });

    const publicKey = Uint8Array.from(atob(passkey.public_key), (c) => c.charCodeAt(0));

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin,
      expectedRPID,
      credential: {
        id: credentialId,
        publicKey,
        counter: passkey.counter,
      },
    });

    if (!verification.verified) {
      return Response.json({ error: "验证失败" }, { status: 401 });
    }

    const newCounter = verification.authenticationInfo.newCounter;
    if (passkey.counter !== 0 && newCounter <= passkey.counter) {
      return Response.json({ error: "检测到凭据克隆风险" }, { status: 403 });
    }

    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, "0")).join("");
    const tokenHash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(token))
      .then((b) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join(""));
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const ua = request.headers.get("user-agent") || "unknown";
    const secure = request.url.startsWith("https://") ? "; Secure" : "";

    // 挑战消费、计数器更新、会话签发在同一事务内完成。前两条以 EXISTS 守卫，
    // 只有挑战仍有效时才写入；并发双发时第二个请求前两条均影响 0 行，最终由 DELETE 的 changes 判定。
    const alive = "expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
    const results = await env.DB.batch([
      env.DB.prepare(`INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent)
        SELECT ?1, ?2, ?3, ?4, ?5
        WHERE EXISTS (SELECT 1 FROM passkey_challenges WHERE id = ?6 AND ${alive})`)
        .bind(tokenHash, passkey.user_id, expiresAt, ip, ua, challengeId),
      env.DB.prepare(`UPDATE passkeys SET counter = ?1
        WHERE credential_id = ?2
          AND EXISTS (SELECT 1 FROM passkey_challenges WHERE id = ?3 AND ${alive})`)
        .bind(newCounter, credentialId, challengeId),
      env.DB.prepare(`DELETE FROM passkey_challenges WHERE id = ? AND ${alive}`)
        .bind(challengeId),
    ]);
    if (results[2].meta.changes !== 1) {
      return Response.json({ error: "验证已过期或已被使用" }, { status: 400 });
    }

    context.waitUntil(
      env.DB.prepare("INSERT INTO audit_logs (user_id, action, ip, country, user_agent) VALUES (?, 'passkey.login', ?, ?, ?)")
        .bind(passkey.user_id, ip, (request.cf && request.cf.country) || "Unknown", ua)
        .run()
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `${secure ? "__Host-session" : "session"}=${token}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE_REMEMBER_SEC}`,
      },
    });
  } catch (err) {
    console.error("Passkey Login Error:", err);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

``````

### functions/api/passkey/register-options.js

``````
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { verifyRequest } from "../_csrf.js";
import { getSessionUser } from "../_session.js";

const MAX_PASSKEYS_PER_USER = 10;

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "未登录" }, { status: 401 });

  const user = await env.DB.prepare("SELECT email FROM users WHERE id = ?").bind(auth.userId).first();
  if (!user) return Response.json({ error: "用户不存在" }, { status: 404 });

  const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM passkeys WHERE user_id = ?").bind(auth.userId).first();
  if (count.n >= MAX_PASSKEYS_PER_USER) {
    return Response.json({ error: `Passkey 数量已达上限（${MAX_PASSKEYS_PER_USER}）` }, { status: 400 });
  }

  const rpID = env.WEBAUTHN_RP_ID || new URL(request.url).hostname;

  const options = await generateRegistrationOptions({
    rpName: "Sleep",
    rpID,
    userID: new TextEncoder().encode(auth.userId.toString()),
    userName: user.email,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required",
    },
  });

  const challengeId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await env.DB.batch([
    env.DB.prepare("INSERT INTO passkey_challenges (id, user_id, challenge, expires_at) VALUES (?, ?, ?, ?)")
      .bind(challengeId, auth.userId, options.challenge, expiresAt),
  ]);

  return Response.json({ options, challengeId });
}

``````

### functions/api/passkey/register-verify.js

``````
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { verifyRequest } from "../_csrf.js";
import { getSessionUser } from "../_session.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "未登录" }, { status: 401 });

  try {
    const { challengeId, credential } = await request.json();
    if (!challengeId || !credential) {
      return Response.json({ error: "参数缺失" }, { status: 400 });
    }

    const row = await env.DB
      .prepare("SELECT user_id, challenge FROM passkey_challenges WHERE id = ? AND expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')")
      .bind(challengeId)
      .first();
    if (!row) return Response.json({ error: "验证已过期，请重试" }, { status: 400 });
    if (row.user_id !== auth.userId) {
      return Response.json({ error: "验证无效" }, { status: 403 });
    }

    const expectedOrigin = new URL(request.url).origin;
    const expectedRPID = env.WEBAUTHN_RP_ID || new URL(request.url).hostname;

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: row.challenge,
      expectedOrigin,
      expectedRPID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return Response.json({ error: "验证失败" }, { status: 400 });
    }

    const { credential: info } = verification.registrationInfo;
    const publicKeyB64 = btoa(String.fromCharCode(...info.publicKey));

    // 凭据写入与挑战消费在同一事务内完成。凭据写入以 EXISTS 守卫，
    // 只有挑战仍有效时才插入；任一语句失败则整体回滚，挑战保持可用供重试。
    const alive = "expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
    let results;
    try {
      results = await env.DB.batch([
        env.DB.prepare(`INSERT INTO passkeys (credential_id, user_id, public_key, counter, transports)
          SELECT ?1, ?2, ?3, ?4, ?5
          WHERE EXISTS (SELECT 1 FROM passkey_challenges WHERE id = ?6 AND ${alive})`)
          .bind(
            info.id,
            auth.userId,
            publicKeyB64,
            info.counter,
            JSON.stringify(credential.response?.transports || []),
            challengeId
          ),
        env.DB.prepare(`DELETE FROM passkey_challenges WHERE id = ? AND ${alive}`)
          .bind(challengeId),
      ]);
    } catch (err) {
      if (String(err.message || "").includes("UNIQUE")) {
        return Response.json({ error: "该设备已绑定过，请直接使用面容 / 指纹登录" }, { status: 409 });
      }
      throw err;
    }
    if (results[1].meta.changes !== 1) {
      return Response.json({ error: "验证已过期或已被使用" }, { status: 400 });
    }

    return Response.json({ success: true, message: "面容 / 指纹绑定成功" });
  } catch (err) {
    console.error("Passkey Register Verify Error:", err);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

``````

### functions/api/register.js

``````
import { verifyRequest } from "./_csrf.js";
import { isMaliciousIP } from "./_threatintel.js";
import { evaluateShield } from "./_shield.js";
import { isDisposableEmail } from "./_disposable.js";
import { hashPassword } from "./_crypto.js";
import { validatePassword } from "./_password.js";
import { rateLimit } from "./_ratelimit.js";
import { writeAudit } from "./_audit.js";
import {
  REGISTER_IP_HOUR_LIMIT,
  REGISTER_IP_DAY_LIMIT,
} from "./_constants.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  try {
    const clientIP = request.headers.get("cf-connecting-ip") || "unknown";
    if (clientIP !== "unknown" && await isMaliciousIP(env, clientIP)) {
      return Response.json({ error: "请求来源存在安全风险" }, { status: 403 });
    }

    const now = new Date();
    const hourKey = now.toISOString().slice(0, 13);
    const dayKey = now.toISOString().slice(0, 10);
    const h = await rateLimit(env, `register_ip:${clientIP}:h${hourKey}`, REGISTER_IP_HOUR_LIMIT, 3600);
    if (!h.ok && !h.degraded) return Response.json({ error: "注册请求过于频繁，请一小时后再试" }, { status: 429 });
    const d = await rateLimit(env, `register_ip:${clientIP}:d${dayKey}`, REGISTER_IP_DAY_LIMIT, 86400);
    if (!d.ok && !d.degraded) return Response.json({ error: "今日注册次数已达上限，请明天再试" }, { status: 429 });

    const data = await request.json();
    const username = String(data.username || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const password = data.password;

    if (!evaluateShield(data.shield).pass) {
      return Response.json({ error: "安全验证失败，请刷新后重试" }, { status: 403 });
    }
    if (!username || !/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
      return Response.json({ error: "用户名不合法" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "邮箱不合法" }, { status: 400 });
    }

    const pwdErr = await validatePassword(env, password);
    if (pwdErr) return Response.json({ error: pwdErr }, { status: 400 });

    if (await isDisposableEmail(email)) {
      return Response.json({ error: "请使用真实邮箱" }, { status: 400 });
    }

    const existing = await env.DB
      .prepare("SELECT id FROM users WHERE email = ?")
      .bind(email)
      .first();
    if (existing) {
      return Response.json({ error: "该邮箱已注册，请直接登录" }, { status: 409 });
    }
    const nameDup = await env.DB
      .prepare("SELECT id FROM users WHERE username = ?")
      .bind(username)
      .first();
    if (nameDup) {
      return Response.json({ error: "用户名已被占用，请换一个" }, { status: 409 });
    }

    let uid = null;
    for (let i = 0; i < 5; i += 1) {
      const cand = (crypto.getRandomValues(new Uint32Array(1))[0] % 90000000 + 10000000).toString();
      const dup = await env.DB.prepare("SELECT 1 FROM users WHERE uid = ?").bind(cand).first();
      if (!dup) { uid = cand; break; }
    }
    if (!uid) return Response.json({ error: "系统繁忙，请稍后再试" }, { status: 503 });

    const passwordHash = await hashPassword(password, env);

    let userId;
    try {
      const result = await env.DB
        .prepare("INSERT INTO users (uid, username, email, password_hash, email_verified) VALUES (?, ?, ?, ?, 1)")
        .bind(uid, username, email, passwordHash)
        .run();
      userId = result.meta.last_row_id;
    } catch (err) {
      if (String(err.message || "").includes("UNIQUE")) {
        return Response.json({ error: "邮箱或用户名已被占用" }, { status: 409 });
      }
      throw err;
    }
    if (!userId) throw new Error("insert user did not return id");

    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
    const sessionTokenHash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(sessionToken))
      .then(b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join(""));
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const secure = request.url.startsWith("https://") ? "; Secure" : "";
    const cookieName = secure ? "__Host-session" : "session";

    await env.DB
      .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)")
      .bind(sessionTokenHash, userId, sessionExpiresAt, clientIP, request.headers.get("user-agent") || "unknown")
      .run();

    context.waitUntil(writeAudit(env, request, { userId, action: "register.success" }));

    const cookie = `${cookieName}=${sessionToken}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=2592000`;
    return new Response(JSON.stringify({
      success: true,
      user: { uid, username, email }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
    });
  } catch (err) {
    console.error("Register Error:", err);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

``````

### functions/api/reset.js

``````
import { verifyRequest } from "./_csrf.js";
import { hashPassword } from "./_crypto.js";
import { sendPasswordChangedNotice } from "./_notify.js";
import { validatePassword } from "./_password.js";
import { rateLimit } from "./_ratelimit.js";
import { writeAudit } from "./_audit.js";

const RESET_IP_LIMIT = 5;
const RESET_IP_WINDOW_SEC = 15 * 60;

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  try {
    const clientIP = request.headers.get("cf-connecting-ip") || "unknown";
    const rl = await rateLimit(env, `reset_ip:${clientIP}`, RESET_IP_LIMIT, RESET_IP_WINDOW_SEC);
    if (!rl.ok) return Response.json({ error: "尝试过于频繁，请稍后再试" }, { status: 429 });

    const { token, newPassword } = await request.json();
    if (!token || !newPassword) {
      return Response.json({ error: "参数错误" }, { status: 400 });
    }

    const pwdErr = await validatePassword(env, newPassword, { checkHibp: true });
    if (pwdErr) return Response.json({ error: pwdErr }, { status: 400 });

    const tokenHash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(token))
      .then(b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join(""));

    const preview = await env.DB
      .prepare("SELECT user_id, expires_at FROM password_resets WHERE token_hash = ? AND used_at IS NULL")
      .bind(tokenHash)
      .first();
    if (!preview) {
      return Response.json({ error: "重置链接已失效或已被使用" }, { status: 400 });
    }
    const nowIso = new Date().toISOString();
    if (new Date(preview.expires_at).toISOString() <= nowIso) {
      return Response.json({ error: "重置链接已过期" }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword, env);
    const userId = preview.user_id;

    // 令牌消费、改密、撤销会话、清锁键在同一事务内完成。后续语句以 EXISTS 守卫，
    // 只有本事务确实消费了令牌（used_at = nowIso）才生效，避免并发双发时密码被二次改写。
    const guard = "EXISTS (SELECT 1 FROM password_resets WHERE token_hash = ? AND used_at = ?)";
    const results = await env.DB.batch([
      env.DB.prepare("UPDATE password_resets SET used_at = ? WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?")
        .bind(nowIso, tokenHash, nowIso),
      env.DB.prepare(`UPDATE users SET password_hash = ? WHERE id = ? AND ${guard}`)
        .bind(newHash, userId, tokenHash, nowIso),
      env.DB.prepare(`DELETE FROM sessions WHERE user_id = ? AND ${guard}`)
        .bind(userId, tokenHash, nowIso),
      env.DB.prepare(`DELETE FROM login_attempts WHERE key LIKE ? AND ${guard}`)
        .bind(`acct:${userId}:%`, tokenHash, nowIso),
      env.DB.prepare(`DELETE FROM login_attempts WHERE key LIKE ? AND ${guard}`)
        .bind(`sudo:${userId}:%`, tokenHash, nowIso),
    ]);
    if (results[0].meta.changes !== 1) {
      return Response.json({ error: "重置链接已失效、过期或已被使用" }, { status: 400 });
    }

    context.waitUntil(writeAudit(env, request, { userId, action: "password.reset" }));

    const u = await env.DB.prepare("SELECT email FROM users WHERE id = ?").bind(userId).first();
    if (u && u.email) {
      context.waitUntil(sendPasswordChangedNotice(env, { email: u.email, userId, request }));
    }

    return Response.json({ success: true, message: "密码修改成功，请重新登录" });
  } catch (err) {
    console.error("Reset Error:", err);
    return Response.json({ error: "服务开小差" }, { status: 500 });
  }
}

``````

### functions/api/sessions.js

``````
import { getSessionUser } from "./_session.js";

import { verifyRequest } from "./_csrf.js";
export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "未登录" }, { status: 401 });

  const rows = await env.DB
    .prepare("SELECT token_hash, ip, user_agent, created_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC")
    .bind(auth.userId)
    .all();

  const sessions = rows.results.map(s => ({
    ip: s.ip,
    user_agent: s.user_agent,
    created_at: s.created_at,
    isCurrent: s.token_hash === auth.tokenHash,
  }));

  return Response.json({ success: true, sessions });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });
  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "未登录" }, { status: 401 });

  const { action } = await request.json();
  if (action === "revoke_others") {
    await env.DB
      .prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?")
      .bind(auth.userId, auth.tokenHash)
      .run();
    return Response.json({ success: true, message: "已下线所有其他设备" });
  }
  return Response.json({ error: "未知操作" }, { status: 400 });
}

``````

### functions/api/verify-sudo.js

``````
import { verifyRequest } from "./_csrf.js";
import { SUDO_TOKEN_TTL_SEC, LOGIN_ACCOUNT_FAIL_THRESHOLD, LOGIN_ACCOUNT_LOCK_SEC } from "./_constants.js";
import { getSessionUser } from "./_session.js";
import { verifyPassword } from "./_crypto.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "未登录" }, { status: 401 });

  try {
    const { password } = await request.json();
    const clientIP = request.headers.get("cf-connecting-ip") || "unknown";
    const lockKey = `sudo:${auth.userId}:${clientIP}`;
    const attempt = await env.DB.prepare("SELECT attempts, locked_until FROM login_attempts WHERE key = ?").bind(lockKey).first();

    if (attempt && attempt.locked_until && new Date(attempt.locked_until) > new Date()) {
      return Response.json({ error: "密码错误次数过多，请稍后再试" }, { status: 429 });
    }
    if (attempt && attempt.locked_until) {
      await env.DB.prepare("DELETE FROM login_attempts WHERE key = ?").bind(lockKey).run();
    }

    const user = await env.DB.prepare("SELECT password_hash FROM users WHERE id = ?").bind(auth.userId).first();
    if (!user) return Response.json({ error: "用户不存在" }, { status: 404 });

    const ok = await verifyPassword(password, user.password_hash, env);
    if (!ok) {
      await env.DB
        .prepare("INSERT INTO login_attempts (key, attempts, locked_until) VALUES (?1, 1, NULL) ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1, locked_until = CASE WHEN attempts + 1 >= ?2 THEN ?3 ELSE locked_until END")
        .bind(lockKey, LOGIN_ACCOUNT_FAIL_THRESHOLD, new Date(Date.now() + LOGIN_ACCOUNT_LOCK_SEC * 1000).toISOString())
        .run();
      return Response.json({ error: "密码不正确" }, { status: 403 });
    }

    await env.DB.prepare("DELETE FROM login_attempts WHERE key = ?").bind(lockKey).run();

    const sudoToken = crypto.randomUUID();
    await env.SLEEP_KV.put(`sudo_${sudoToken}`, auth.userId.toString(), { expirationTtl: SUDO_TOKEN_TTL_SEC });

    return Response.json({ success: true, sudo_token: sudoToken });
  } catch (err) {
    console.error("Verify Sudo Error:", err);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

``````

### help.html

``````
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>帮助中心 - Sleep</title>
<link rel="stylesheet" href="/static/legal.css">
</head>
<body>
<article>
<h1>帮助中心</h1>

<h2>如何开启面容 / 指纹登录？</h2>
<p>登录后在用户面板点击「开启面容 / 指纹登录」，按浏览器提示完成绑定。绑定后下次登录无需输入密码。</p>

<h2>忘记密码怎么办？</h2>
<p>点击登录页下方的「忘记密码」，输入注册邮箱接收重置链接。链接 1 小时内有效，每个邮箱 24 小时内仅可请求一次。</p>

<h2>为什么登录会被锁定？</h2>
<p>连续 5 次密码错误后账号将被锁定 15 分钟，用于防止暴力破解。请稍后再试，或使用「忘记密码」重置。</p>

<h2>如何下线其他设备？</h2>
<p>登录后在用户面板点击「管理登录设备」，可以看到所有活跃会话，并一键下线除当前设备外的所有会话。</p>

<h2>我的密码安全吗？</h2>
<p>您的密码使用 PBKDF2-SHA256 加盐哈希存储，服务器不保存明文。同时系统会在注册和改密时检查密码是否曾出现在公开数据泄露库中。</p>

<p class="back"><a href="/">← 返回 Sleep</a></p>
</article>
</body>
</html>

``````

### index.html

``````
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Sleep</title>
<script type="module" src="/passkey.js"></script>
<link rel="stylesheet" href="./style.css">
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#fcfdff">
</head>
<body>
  <div class="blob b-top-left"></div>
  <div class="blob b-top-right"></div>
  <div class="blob b-bottom"></div>
  <div class="blob b-light"></div>

  <header class="header">
    <div class="brand">
      <div class="logo-img"></div>
      <span class="brand-name">𝚂𝚕𝚎𝚎𝚙.</span>
    </div>
    <div class="lang-container">
      <div class="lang-btn" id="langBtn">
        <span id="currentFlag">🇨🇳</span>
        <span id="currentText">简体中文</span>
      </div>
      <div class="lang-menu" id="langMenu"></div>
    </div>
  </header>

  <div class="scroll-wrapper" id="scrollWrapper">
    <div class="login-card" id="cardContainer">
      
      <div class="card-header">
        <h1 id="pageTitle" data-i18n="welcome">欢迎回来</h1>
        <p id="pageSub" data-i18n="subLogin">登录以继续访问 Sleep 平台</p>
      </div>

      <div class="tabs" id="mainTabs">
        <div class="tab active" id="tabLogin" data-i18n="login">登录</div>
        <div class="tab" id="tabRegister" data-i18n="register">注册</div>
      </div>

      <div id="userPanel" style="display: none; text-align: center; padding: 20px 0;">
        <div style="width: 60px; height: 60px; background: #e8defa; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 24px;">👋</div>
        <h2 style="font-size: 20px; color: #111; margin-bottom: 8px;" data-i18n="userWelcome">欢迎回来！</h2>
        <p style="font-size: 13px; color: #888; margin-bottom: 24px;"><span data-i18n="uid">专属 ID:</span> <span id="userUid" style="font-weight: bold; color: #111;"></span></p>
        
        <button type="button" class="btn-submit" id="btnAuditLog" style="background: #f4f5f7; color: #111; margin-bottom: 10px;" data-i18n="btnAudit">查看账号安全日志</button>
        <button type="button" class="btn-submit" id="btnSessions" style="background: #f4f5f7; color: #111; margin-bottom: 10px;" data-i18n="btnSessions">管理登录设备</button>
        <button type="button" class="btn-submit" id="btnChangePwd" style="background: #f4f5f7; color: #111; margin-bottom: 10px;" data-i18n="btnChangePwd">修改登录密码</button>
        <button type="button" class="btn-submit" id="btnAddPasskey" style="background: #000; color: #fff; margin-bottom: 10px;" data-i18n="btnAddPasskey">开启面容 / 指纹登录</button>
        <button type="button" class="btn-submit" id="btnLogout" style="background: #eee; color: #111; margin-bottom: 0;" data-i18n="btnLogout">退出登录</button>
      </div>

      <div class="form-content active" id="loginForm">
        <form id="formLogin" novalidate>
<input type="text" id="shield_hp" name="shield_hp" style="display:none !important;" tabindex="-1" autocomplete="off">
          <div class="input-container">
            <div class="input-group">
              <input type="text" id="loginUser" placeholder="请输入用户名或邮箱" data-i18n-placeholder="phLoginUser" autocomplete="username webauthn" aria-describedby="tipLoginUser">
            </div>
            <div class="input-tips" id="tipLoginUser" hidden role="alert" aria-live="polite" data-i18n="tipLoginUser">账号格式错误</div>
          </div>
          <div class="input-container">
            <div class="input-group">
              <input type="password" id="loginPwd" class="pwd-input" placeholder="请输入密码" data-i18n-placeholder="phLoginPwd" autocomplete="current-password" aria-describedby="tipLoginPwd">
              <button type="button" class="eye-wrapper" aria-label="显示或隐藏密码"><svg class="eye-icon" viewBox="0 0 24 24"><path class="eye-open" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle class="eye-open" cx="12" cy="12" r="3"/><line class="eye-slash" x1="3" y1="3" x2="21" y2="21"/></svg></button>
            </div>
            <div class="input-tips" id="tipLoginPwd" hidden role="alert" aria-live="polite" data-i18n="tipLoginPwd">密码不能为空</div>
          </div>
          <div class="checkbox-group">
            <input type="checkbox" id="agreeLogin">
            <label for="agreeLogin"><span data-i18n="agreePrefix">我已阅读并同意</span> <a href="/terms.html" data-i18n="terms">《服务条款》</a> <span data-i18n="and">和</span> <a href="/privacy.html" data-i18n="privacy">《隐私政策》</a></label>
          </div>
          <button type="submit" class="btn-submit" data-i18n="btnLogin">登 录</button>
          
          <div class="form-actions" style="margin-top: 14px;">
            <div class="checkbox-group">
              <input type="checkbox" id="remember">
              <label for="remember" data-i18n="remember">记住我</label>
            </div>
            <a href="#" id="linkForgot" data-i18n="forgot">忘记密码?</a>
          </div>
        </form>
      </div>

      <div class="form-content" id="registerForm">
        <form id="formRegister" novalidate>
<input type="text" id="shield_hp_reg" name="shield_hp_reg" style="display:none !important;" tabindex="-1" autocomplete="off">
          <div class="input-container">
            <div class="input-group">
              <input type="text" id="regUser" placeholder="请设置用户名 (4-20位)" data-i18n-placeholder="phRegUser" autocomplete="username" aria-describedby="tipUser">
            </div>
            <div class="input-tips" id="tipUser" role="alert" aria-live="polite" data-i18n="tipUser">支持 4-20 位字母、数字或下划线</div>
          </div>
          <div class="input-container">
            <div class="input-group">
              <input type="email" id="regEmail" placeholder="请输入邮箱地址" data-i18n-placeholder="phRegEmail" autocomplete="email" aria-describedby="tipEmail">
            </div>
            <div class="input-tips" id="tipEmail" role="alert" aria-live="polite" data-i18n="tipEmail">用于登录、找回密码及接收重要通知</div>
          </div>
          <div class="input-container">
            <div class="input-group">
              <input type="password" id="regPwd" class="pwd-input" placeholder="设置密码" data-i18n-placeholder="phRegPwd" autocomplete="new-password" aria-describedby="tipPwd">
              <button type="button" class="eye-wrapper" aria-label="显示或隐藏密码"><svg class="eye-icon" viewBox="0 0 24 24"><path class="eye-open" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle class="eye-open" cx="12" cy="12" r="3"/><line class="eye-slash" x1="3" y1="3" x2="21" y2="21"/></svg></button>
            </div>
            <div class="input-tips" id="tipPwd" role="alert" aria-live="polite" data-i18n="tipPwd">长度 12-128 位，需包含大写字母、小写字母、数字、符号中的至少两种</div>
          </div>
          <div class="input-container">
            <div class="input-group">
              <input type="password" id="regPwdConfirm" class="pwd-input" placeholder="再次确认密码" data-i18n-placeholder="phRegPwdConfirm" autocomplete="new-password" aria-describedby="tipPwdConfirm">
              <button type="button" class="eye-wrapper" aria-label="显示或隐藏密码"><svg class="eye-icon" viewBox="0 0 24 24"><path class="eye-open" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle class="eye-open" cx="12" cy="12" r="3"/><line class="eye-slash" x1="3" y1="3" x2="21" y2="21"/></svg></button>
            </div>
            <div class="input-tips" id="tipPwdConfirm" role="alert" aria-live="polite" data-i18n="tipPwdConfirm">请与上方设置的密码保持一致</div>
          </div>
          <div class="checkbox-group" style="margin-top: 4px;">
            <input type="checkbox" id="agreeRegister">
            <label for="agreeRegister"><span data-i18n="agreePrefix">我已阅读并同意</span> <a href="/terms.html" data-i18n="terms">《服务条款》</a> <span data-i18n="and">和</span> <a href="/privacy.html" data-i18n="privacy">《隐私政策》</a></label>
          </div>
          <button type="submit" class="btn-submit" style="margin-bottom: 8px;" data-i18n="btnRegister">注 册</button>
        </form>
      </div>

      <div class="divider" data-i18n="divider">或使用以下方式</div>
      <div class="social-login">
        <button type="button" class="social-btn" id="btnGithubLogin">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
          GitHub
        </button>
        <button type="button" class="social-btn" id="btnPasskeyLogin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="3" /><path d="M12 12h8" /><path d="M18 12v3" /><path d="M16 15h2" /></svg>
          Passkey
        </button>
      </div>

      <div class="footer-text" style="line-height: 1.6; margin-top: 10px;">
        <div style="margin-bottom: 6px;">© <span id="currentYear">2026</span> Sleep. All rights reserved.</div>
        <div>
          <a href="/privacy.html" data-i18n="footerPrivacy">隐私政策</a> · 
          <a href="/terms.html" data-i18n="footerTerms">用户协议</a> · 
          <a href="/help.html" data-i18n="footerHelp">帮助中心</a>
        </div>
      </div>
    </div>
  </div>
  

  <div id="forgotModal" role="dialog" aria-modal="true" aria-labelledby="modalForgotTitle" class="modal-backdrop modal-z-100">
    <div class="modal-card">
      <h2 class="modal-title-sm" data-i18n="modalForgotTitle" id="modalForgotTitle">找回密码</h2>
      <p style="font-size: 12px; color: #888; margin-bottom: 16px;" data-i18n="modalForgotDesc">输入注册时的邮箱，我们将发送重置链接。</p>
      <div class="input-group" style="margin-bottom: 16px;"><input type="email" id="forgotEmail" placeholder="请输入邮箱地址" class="modal-input-pad"></div>
      <div id="forgotTip" class="modal-tip" hidden></div>
      <div class="modal-actions">
        <button type="button" id="btnCancelForgot" class="modal-btn-cancel" data-i18n="btnCancel">取消</button>
        <button type="button" id="btnSubmitForgot" class="modal-btn-primary" data-i18n="btnSendEmail">发送邮件</button>
      </div>
    </div>
  </div>

  <div id="resetPwdModal" role="dialog" aria-modal="true" aria-labelledby="modalResetTitle" class="modal-backdrop modal-z-200">
    <div class="modal-card">
      <h2 class="modal-title-sm" data-i18n="modalResetTitle" id="modalResetTitle">设置新密码</h2>
      <div class="input-group" style="margin-bottom: 16px;"><input type="password" id="newPwd" placeholder="输入新密码 (12-128位)" autocomplete="new-password" class="modal-input-pad"></div>
      <div id="resetTip" class="modal-tip" hidden></div>
      <button type="button" id="btnResetPwd" style="width: 100%; height: 40px; background: #000; border: none; border-radius: 10px; font-weight: 600; color: #fff; cursor: pointer;" data-i18n="btnConfirmChange">确认修改</button>
    </div>
  </div>

  <div id="changePwdModal" role="dialog" aria-modal="true" aria-labelledby="modalChangePwdTitle" class="modal-backdrop modal-z-200">
    <div class="modal-card">
      <h2 style="font-size: 18px; margin-bottom: 16px; color: #111;" data-i18n="modalChangePwdTitle" id="modalChangePwdTitle">修改密码</h2>
      <div class="input-group" style="margin-bottom: 12px;"><input type="password" id="oldPwd" placeholder="输入当前密码" data-i18n-placeholder="phOldPwd" autocomplete="current-password" class="modal-input-pad"></div>
      <div class="input-group" style="margin-bottom: 16px;"><input type="password" id="newPwdChange" placeholder="输入新密码 (12-128位)" data-i18n-placeholder="phNewPwd" autocomplete="new-password" class="modal-input-pad"></div>
      <div id="changePwdTip" class="modal-tip" hidden></div>
      <div class="modal-actions">
        <button type="button" id="btnCancelChange" class="modal-btn-cancel" data-i18n="btnCancel">取消</button>
        <button type="button" id="btnSubmitChange" class="modal-btn-primary" data-i18n="btnConfirmChange">确认修改</button>
      </div>
    </div>
  </div>

  <div id="sessionsModal" role="dialog" aria-modal="true" aria-labelledby="modalSessionsTitle" class="modal-backdrop modal-z-200">
    <div class="modal-card modal-card-lg">
      <div class="modal-header">
        <h2 class="modal-title" data-i18n="modalSessionsTitle" id="modalSessionsTitle">登录设备管理</h2>
        <button type="button" id="btnCloseSessions" aria-label="关闭" class="modal-close-btn">×</button>
      </div>
      <div id="sessionsList" style="overflow-y: auto; font-size: 13px; color: #666; flex: 1; margin-bottom: 16px;"></div>
      <button type="button" id="btnRevokeOthers" style="width: 100%; height: 40px; background: #e53e3e; border: none; border-radius: 10px; font-weight: 600; color: #fff; cursor: pointer;" data-i18n="btnRevokeOthers">下线所有其他设备</button>
    </div>
  </div>

  <div id="auditModal" role="dialog" aria-modal="true" aria-labelledby="modalAuditTitle" class="modal-backdrop modal-z-200">
    <div class="modal-card modal-card-lg">
      <div class="modal-header">
        <h2 class="modal-title" data-i18n="modalAuditTitle" id="modalAuditTitle">账号安全日志</h2>
        <button type="button" id="btnCloseAudit" aria-label="关闭" class="modal-close-btn">×</button>
      </div>
      <div id="auditList" style="overflow-y: auto; font-size: 13px; color: #666; line-height: 1.6; padding-right: 8px;"></div>
    </div>
  </div>

  <div id="sudoModal" role="dialog" aria-modal="true" aria-labelledby="modalSudoTitle" class="modal-backdrop modal-z-300">
    <div class="modal-card">
      <h2 class="modal-title-sm" data-i18n="modalSudoTitle" id="modalSudoTitle">安全验证</h2>
      <p style="font-size: 12px; color: #888; margin-bottom: 16px;" data-i18n="modalSudoDesc">为了您的账号安全，请再次输入登录密码。</p>
      <div class="input-group" style="margin-bottom: 16px;"><input type="password" id="sudoPassword" placeholder="输入当前密码" data-i18n-placeholder="phOldPwd" class="modal-input-pad"></div>
      <div id="sudoTip" class="modal-tip" hidden></div>
      <div class="modal-actions">
        <button type="button" id="btnCancelSudo" class="modal-btn-cancel" data-i18n="btnCancel">取消</button>
        <button type="button" id="btnSubmitSudo" class="modal-btn-primary" data-i18n="btnVerify">验证</button>
      </div>
    </div>
  </div>

  <div id="textModal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" class="modal-backdrop modal-z-200 modal-bg-soft">
    <div class="modal-card modal-card-md">
      <div class="modal-header">
        <h2 id="modalTitle" class="modal-title">标题</h2>
        <button type="button" id="btnCloseModal" aria-label="关闭" class="modal-close-btn">×</button>
      </div>
      <div id="modalContent" style="font-size: 13px; color: #666; line-height: 1.6; overflow-y: auto; padding-right: 8px;"></div>
    </div>
  </div>

  <script src="./app.js"></script>
</body>
</html>

``````

### manifest.json

``````
{
  "name": "Sleep - 极致安全平台",
  "short_name": "Sleep",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fcfdff",
  "theme_color": "#fcfdff",
  "id": "/",
  "scope": "/",
  "categories": ["security", "utilities"],
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" },
    { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png", "purpose": "any" }
  ]
}

``````

### migrations/0001_create_users.sql

``````
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified INTEGER DEFAULT 0,
  session_version INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);

``````

### migrations/0002_create_sessions.sql

``````
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

``````

### migrations/0003_add_email_verification.sql

``````
ALTER TABLE users ADD COLUMN email_verification_token TEXT;
ALTER TABLE users ADD COLUMN email_verification_expires DATETIME;

``````

### migrations/0004_create_login_attempts.sql

``````
CREATE TABLE IF NOT EXISTS login_attempts (
  email TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 0,
  locked_until DATETIME
);

``````

### migrations/0005_create_password_resets.sql

``````
CREATE TABLE IF NOT EXISTS password_resets (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

``````

### migrations/0006_create_passkeys.sql

``````
CREATE TABLE IF NOT EXISTS passkeys (
  credential_id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  transports TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

``````

### migrations/0007_create_passkey_challenges.sql

``````
CREATE TABLE IF NOT EXISTS passkey_challenges (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  challenge TEXT NOT NULL,
  expires_at DATETIME NOT NULL
);

``````

### migrations/0008_create_audit_logs.sql

``````

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  ip TEXT,
  country TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);

``````

### migrations/0009_add_session_details.sql

``````

ALTER TABLE sessions ADD COLUMN ip TEXT;
ALTER TABLE sessions ADD COLUMN user_agent TEXT;
ALTER TABLE sessions ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

``````

### migrations/0010_add_username.sql

``````
ALTER TABLE users ADD COLUMN username TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;

``````

### migrations/0011_add_reset_used_at.sql

``````
ALTER TABLE password_resets ADD COLUMN used_at DATETIME;

``````

### migrations/0012_rebuild_login_attempts.sql

``````
DROP TABLE IF EXISTS login_attempts;
CREATE TABLE login_attempts (
  key TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 0,
  locked_until DATETIME
);

``````

### migrations/0013_add_indexes.sql

``````
-- 为会话查询增加索引
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 为安全日志查询增加索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id, id);

-- 为 Passkey 查询增加索引
CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON passkeys(user_id);

``````

### migrations/0014_create_device_fingerprints.sql

``````

CREATE TABLE IF NOT EXISTS device_fingerprints (
  fingerprint TEXT PRIMARY KEY,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  action_count INTEGER DEFAULT 0
);

``````

### migrations/0015_fix_passkey_user_id.sql

``````

-- 允许 user_id 为空，因为 Passkey 登录时用户还未认证
CREATE TABLE IF NOT EXISTS passkey_challenges_v2 (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  challenge TEXT NOT NULL,
  expires_at DATETIME NOT NULL
);
DROP TABLE IF EXISTS passkey_challenges;
ALTER TABLE passkey_challenges_v2 RENAME TO passkey_challenges;

``````

### migrations/0016_add_missing_indexes.sql

``````
-- 补全业务查询高频字段的索引
-- password_resets: forgot.js / reset.js 按 user_id 查询和清理
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
-- passkey_challenges: 每次 options 调用都按 expires_at 清理过期挑战
CREATE INDEX IF NOT EXISTS idx_passkey_challenges_expires_at ON passkey_challenges(expires_at);

``````

### migrations/0017_add_token_indexes.sql

``````
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires ON sessions(user_id, expires_at);

``````

### migrations/0018_add_github_id.sql

``````
ALTER TABLE users ADD COLUMN github_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id) WHERE github_id IS NOT NULL;

``````

### migrations/0019_create_email_logs.sql

``````
CREATE TABLE IF NOT EXISTS email_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  to_email TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  message_id TEXT,
  created_at DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

``````

### migrations/0020_drop_redundant_indexes.sql

``````
-- email / uid 有 UNIQUE 约束的隐式索引，显式索引冗余
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_uid;
-- idx_audit_user_id (user_id) 与 idx_audit_logs_user_id (user_id, id) 重复
DROP INDEX IF EXISTS idx_audit_user_id;

``````

### migrations/0021_add_last_seen_at.sql

``````
ALTER TABLE sessions ADD COLUMN last_seen_at DATETIME;
CREATE INDEX IF NOT EXISTS idx_sessions_last_seen ON sessions(last_seen_at);

``````

### migrations/0022_lowercase_emails.sql

``````
-- 存量用户 email 统一小写化（P1-09 配套）
UPDATE users SET email = LOWER(TRIM(email)) WHERE email != LOWER(TRIM(email));

``````

### migrations/0023_rate_limits.sql

``````
CREATE TABLE IF NOT EXISTS rate_limits (
  key        TEXT PRIMARY KEY,
  count      INTEGER NOT NULL,
  reset_at   INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

``````

### migrations/0024_drop_email_verification.sql

``````
DROP INDEX IF EXISTS idx_users_email_verification_token;
ALTER TABLE users DROP COLUMN email_verification_token;
ALTER TABLE users DROP COLUMN email_verification_expires;

``````

### migrations/0025_normalize_login_attempts.sql

``````
-- 历史数据把 locked_until 写成 SQLite 空格格式，与 ISO 字符串比较永远不成立，
-- 导致过期锁永不被清理。统一为 ISO，并删除已过期行。
UPDATE login_attempts
SET locked_until = strftime('%Y-%m-%dT%H:%M:%fZ', replace(locked_until, ' ', 'T'))
WHERE locked_until IS NOT NULL AND locked_until NOT LIKE '%T%';

DELETE FROM login_attempts
WHERE locked_until IS NOT NULL AND locked_until < strftime('%Y-%m-%dT%H:%M:%fZ', 'now');

``````

### migrations/0026_add_email_verified.sql

``````
-- 线上 users 表建于 0001 之前的手工建表，缺少 email_verified 列，
-- 而 register / github-callback / me 均依赖该列。补列并保持与 0001 定义一致。
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;

``````

### package-lock.json

``````
{
  "name": "sleep",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "sleep",
      "version": "1.0.0",
      "license": "ISC",
      "dependencies": {
        "@noble/hashes": "^2.4.0",
        "@simplewebauthn/server": "^14.0.3"
      },
      "devDependencies": {
        "eslint": "^9.39.5",
        "globals": "^17.13.0"
      }
    },
    "node_modules/@eslint-community/eslint-utils": {
      "version": "4.10.1",
      "resolved": "https://registry.npmjs.org/@eslint-community/eslint-utils/-/eslint-utils-4.10.1.tgz",
      "integrity": "sha512-cuadcxVFE8sDK6iWJbs8Sn0av2Nrh2QSGQhVlBW9AaAHqHwjWsZHT8LJ4hFGPh7ASBV2deFdM7H/DPjulmh8rg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "eslint-visitor-keys": "^3.4.3"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      },
      "peerDependencies": {
        "eslint": "^6.0.0 || ^7.0.0 || >=8.0.0"
      }
    },
    "node_modules/@eslint-community/eslint-utils/node_modules/eslint-visitor-keys": {
      "version": "3.4.3",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-3.4.3.tgz",
      "integrity": "sha512-wpc+LXeiyiisxPlEkUzU6svyS1frIO3Mgxj1fdy7Pm8Ygzguax2N3Fa/D/ag1WqbOprdI+uY6wMUl8/a2G+iag==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@eslint-community/regexpp": {
      "version": "4.12.2",
      "resolved": "https://registry.npmjs.org/@eslint-community/regexpp/-/regexpp-4.12.2.tgz",
      "integrity": "sha512-EriSTlt5OC9/7SXkRSCAhfSxxoSUgBm33OH+IkwbdpgoqsSsUg7y3uh+IICI/Qg4BBWr3U2i39RpmycbxMq4ew==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^12.0.0 || ^14.0.0 || >=16.0.0"
      }
    },
    "node_modules/@eslint/config-array": {
      "version": "0.21.2",
      "resolved": "https://registry.npmjs.org/@eslint/config-array/-/config-array-0.21.2.tgz",
      "integrity": "sha512-nJl2KGTlrf9GjLimgIru+V/mzgSK0ABCDQRvxw5BjURL7WfH5uoWmizbH7QB6MmnMBd8cIC9uceWnezL1VZWWw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@eslint/object-schema": "^2.1.7",
        "debug": "^4.3.1",
        "minimatch": "^3.1.5"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/config-helpers": {
      "version": "0.4.2",
      "resolved": "https://registry.npmjs.org/@eslint/config-helpers/-/config-helpers-0.4.2.tgz",
      "integrity": "sha512-gBrxN88gOIf3R7ja5K9slwNayVcZgK6SOUORm2uBzTeIEfeVaIhOpCtTox3P6R7o2jLFwLFTLnC7kU/RGcYEgw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@eslint/core": "^0.17.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/core": {
      "version": "0.17.0",
      "resolved": "https://registry.npmjs.org/@eslint/core/-/core-0.17.0.tgz",
      "integrity": "sha512-yL/sLrpmtDaFEiUj1osRP4TI2MDz1AddJL+jZ7KSqvBuliN4xqYY54IfdN8qD8Toa6g1iloph1fxQNkjOxrrpQ==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@types/json-schema": "^7.0.15"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/eslintrc": {
      "version": "3.3.7",
      "resolved": "https://registry.npmjs.org/@eslint/eslintrc/-/eslintrc-3.3.7.tgz",
      "integrity": "sha512-F42g89Qd5oAWtp0k0nnSrjziAKza7w8SVT4mStc18LZMaRb4J1HQAHLCalEtDCxrTuksx7NU9qsmeLwpOfPqWw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ajv": "^6.14.0",
        "debug": "^4.3.2",
        "espree": "^10.0.1",
        "globals": "^14.0.0",
        "ignore": "^5.2.0",
        "import-fresh": "^3.2.1",
        "js-yaml": "^4.3.2",
        "minimatch": "^3.1.5",
        "strip-json-comments": "^3.1.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@eslint/eslintrc/node_modules/globals": {
      "version": "14.0.0",
      "resolved": "https://registry.npmjs.org/globals/-/globals-14.0.0.tgz",
      "integrity": "sha512-oahGvuMGQlPw/ivIYBjVSrWAfWLBeku5tpPE2fOPLi+WHffIWbuh2tCjhyQhTBPMf5E9jDEH4FOmTYgYwbKwtQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/@eslint/js": {
      "version": "9.39.5",
      "resolved": "https://registry.npmjs.org/@eslint/js/-/js-9.39.5.tgz",
      "integrity": "sha512-QywQuszQh77pIXCsq998c8hbhSTI/azTty1Z6N53dmAudKHhy573j3yvRLsX2BSp8YpLtoCEG8E9DJe+8zUh4A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://eslint.org/donate"
      }
    },
    "node_modules/@eslint/object-schema": {
      "version": "2.1.7",
      "resolved": "https://registry.npmjs.org/@eslint/object-schema/-/object-schema-2.1.7.tgz",
      "integrity": "sha512-VtAOaymWVfZcmZbp6E2mympDIHvyjXs/12LqWYjVw6qjrfF+VK+fyG33kChz3nnK+SU5/NeHOqrTEHS8sXO3OA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/plugin-kit": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/@eslint/plugin-kit/-/plugin-kit-0.4.1.tgz",
      "integrity": "sha512-43/qtrDUokr7LJqoF2c3+RInu/t4zfrpYdoSDfYyhg52rwLV6TnOvdG4fXm7IkSB3wErkcmJS9iEhjVtOSEjjA==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@eslint/core": "^0.17.0",
        "levn": "^0.4.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@hexagon/base64": {
      "version": "1.1.28",
      "resolved": "https://registry.npmjs.org/@hexagon/base64/-/base64-1.1.28.tgz",
      "integrity": "sha512-lhqDEAvWixy3bZ+UOYbPwUbBkwBq5C1LAJ/xPC8Oi+lL54oyakv/npbA0aU2hgCsx/1NUd4IBvV03+aUBWxerw==",
      "license": "MIT"
    },
    "node_modules/@humanfs/core": {
      "version": "0.19.2",
      "resolved": "https://registry.npmjs.org/@humanfs/core/-/core-0.19.2.tgz",
      "integrity": "sha512-UhXNm+CFMWcbChXywFwkmhqjs3PRCmcSa/hfBgLIb7oQ5HNb1wS0icWsGtSAUNgefHeI+eBrA8I1fxmbHsGdvA==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@humanfs/types": "^0.15.0"
      },
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanfs/node": {
      "version": "0.16.8",
      "resolved": "https://registry.npmjs.org/@humanfs/node/-/node-0.16.8.tgz",
      "integrity": "sha512-gE1eQNZ3R++kTzFUpdGlpmy8kDZD/MLyHqDwqjkVQI0JMdI1D51sy1H958PNXYkM2rAac7e5/CnIKZrHtPh3BQ==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@humanfs/core": "^0.19.2",
        "@humanfs/types": "^0.15.0",
        "@humanwhocodes/retry": "^0.4.0"
      },
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanfs/types": {
      "version": "0.15.0",
      "resolved": "https://registry.npmjs.org/@humanfs/types/-/types-0.15.0.tgz",
      "integrity": "sha512-ZZ1w0aoQkwuUuC7Yf+7sdeaNfqQiiLcSRbfI08oAxqLtpXQr9AIVX7Ay7HLDuiLYAaFPu8oBYNq/QIi9URHJ3Q==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanwhocodes/module-importer": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/module-importer/-/module-importer-1.0.1.tgz",
      "integrity": "sha512-bxveV4V8v5Yb4ncFTT3rPSgZBOpCkjfK0y4oVVVJwIuDVBRMDXrPyXRL988i5ap9m9bnyEEjWfm5WkBmtffLfA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=12.22"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@humanwhocodes/retry": {
      "version": "0.4.3",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/retry/-/retry-0.4.3.tgz",
      "integrity": "sha512-bV0Tgo9K4hfPCek+aMAn81RppFKv2ySDQeMoSZuvTASywNTnVJCArCZE2FWqpvIatKu7VMRLWlR1EazvVhDyhQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18.18"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@levischuck/tiny-cbor": {
      "version": "0.2.11",
      "resolved": "https://registry.npmjs.org/@levischuck/tiny-cbor/-/tiny-cbor-0.2.11.tgz",
      "integrity": "sha512-llBRm4dT4Z89aRsm6u2oEZ8tfwL/2l6BwpZ7JcyieouniDECM5AqNgr/y08zalEIvW3RSK4upYyybDcmjXqAow==",
      "license": "MIT"
    },
    "node_modules/@noble/hashes": {
      "version": "2.4.0",
      "resolved": "https://registry.npmjs.org/@noble/hashes/-/hashes-2.4.0.tgz",
      "integrity": "sha512-X5XaVWZIBCT7HHZGm5I7ZQXDwLG+bGXuSrMQAW+7Zvl87h1kmc1ZB1VSRJcpUfoUrGQp4Fkoxm5kZ+Ms+aW+eA==",
      "license": "MIT",
      "engines": {
        "node": ">= 20.19.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@peculiar/asn1-android": {
      "version": "2.11.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-android/-/asn1-android-2.11.0.tgz",
      "integrity": "sha512-llW/qjavL+tOxt5i9whUv4wsbsLpUwI6k/DrvKsdA/H7A/TB/6CosMFgvei28fcJ8ncD0c5lig1oBBlo4KGMCw==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.11.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-asym-key": {
      "version": "2.11.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-asym-key/-/asn1-asym-key-2.11.0.tgz",
      "integrity": "sha512-r2957WdSZle/Zt4t9og7OMQYXNJ9/3ANXVtFwLCDJuHORlBZ4AFmDt1Qee0CzyTbHQg4ZZApBGEz5/6cFsyCRg==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-pkcs8": "^2.11.0",
        "@peculiar/asn1-schema": "^2.11.0",
        "@peculiar/asn1-x509": "^2.11.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-cms": {
      "version": "2.11.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-cms/-/asn1-cms-2.11.0.tgz",
      "integrity": "sha512-SlAiDoT/Cd8qaNmbTt78gqyaEvu2fQd6ML6KWJkdjXGrgDKnHHrusVkfQUelkfinL2p665IIADb0JBixtT8W1g==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.11.0",
        "@peculiar/asn1-x509": "^2.11.0",
        "@peculiar/asn1-x509-attr": "^2.11.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-csr": {
      "version": "2.11.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-csr/-/asn1-csr-2.11.0.tgz",
      "integrity": "sha512-M/ED0yJ05qMK+UADPKnIa8vhAeewOJALSxTAZB7RQ/batRHhIJZkwznCcWAbFO5saHJ1yEQ+m4lncEcG9RnQSg==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.11.0",
        "@peculiar/asn1-x509": "^2.11.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-ecc": {
      "version": "2.11.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-ecc/-/asn1-ecc-2.11.0.tgz",
      "integrity": "sha512-jj1alGEKev7/un+cI+exyVK9m31lmP7cCBMCZuCb0wkFQH2zmKmJzNiG4wqXFNzlcP8timHLnzf3lV3OxBpb/Q==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.11.0",
        "@peculiar/asn1-x509": "^2.11.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-pfx": {
      "version": "2.11.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-pfx/-/asn1-pfx-2.11.0.tgz",
      "integrity": "sha512-ykSAWRu8KkmzU8LRpk9ZQC3zuLmBEtoSMjIv9XHVamD5W7amqreV5wttKqnvtjWOzzSJQxA/HVT8/tHwpEEGSQ==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-cms": "^2.11.0",
        "@peculiar/asn1-pkcs8": "^2.11.0",
        "@peculiar/asn1-rsa": "^2.11.0",
        "@peculiar/asn1-schema": "^2.11.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-pkcs8": {
      "version": "2.11.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-pkcs8/-/asn1-pkcs8-2.11.0.tgz",
      "integrity": "sha512-lragjkjQGnQ5luxC+sxoAfAO/jBiQ7hOEGlDKJUk7MC5zY3AzjB2DU0GyPUH1Sswdv10t7DurY0zylOYMLb88w==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.11.0",
        "@peculiar/asn1-x509": "^2.11.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-pkcs9": {
      "version": "2.11.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-pkcs9/-/asn1-pkcs9-2.11.0.tgz",
      "integrity": "sha512-gDdFjpqV0weJjgNUvueUVf4D8uVbpq+VbG0TsxLAY2QGljAkJyL9qwQ7avol9j0jaYSJ7Ey7v7RZp0M3GTcQSA==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-cms": "^2.11.0",
        "@peculiar/asn1-pfx": "^2.11.0",
        "@peculiar/asn1-pkcs8": "^2.11.0",
        "@peculiar/asn1-schema": "^2.11.0",
        "@peculiar/asn1-x509": "^2.11.0",
        "@peculiar/asn1-x509-attr": "^2.11.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-rsa": {
      "version": "2.11.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-rsa/-/asn1-rsa-2.11.0.tgz",
      "integrity": "sha512-S2sBJmbfI09Kzdt9cEhE6pDNjHpVTkURs+811+PxS8AvsTLxC4woMNRhxHYaIbClkkNfAVt0tZxJdINVfUmzuA==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.11.0",
        "@peculiar/asn1-x509": "^2.11.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-schema": {
      "version": "2.11.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-schema/-/asn1-schema-2.11.0.tgz",
      "integrity": "sha512-8xh4avo53/vXO6UEv9yaoJ83hY581geaLTygf61NPIXP5AeIZCPjJhpTaYU23IZkG+NpLN/C9FYzWp7hphIT9A==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/utils": "^2.0.2",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-x509": {
      "version": "2.11.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-x509/-/asn1-x509-2.11.0.tgz",
      "integrity": "sha512-J1sHAwGNlk+8J+FeR1eLVc6Gq0T9f9ITc3HWyPYgJraoW6U8AJuQiWVJ3SCEpltfTdpOY7fHdHT5oKAsbK/jww==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.11.0",
        "@peculiar/utils": "^2.0.2",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-x509-attr": {
      "version": "2.11.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-x509-attr/-/asn1-x509-attr-2.11.0.tgz",
      "integrity": "sha512-Fgvnd9REmLxEj/4cbDP54dNUNUXkzUksXLqEHqs1mHBuSRjSTCUSPM/WQIZYSvrdG7ND9CX1AQtPoIBekhgQSA==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-schema": "^2.11.0",
        "@peculiar/asn1-x509": "^2.11.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/asn1-x509-post-quantum": {
      "version": "2.11.0",
      "resolved": "https://registry.npmjs.org/@peculiar/asn1-x509-post-quantum/-/asn1-x509-post-quantum-2.11.0.tgz",
      "integrity": "sha512-K6EnquTX3xJ2G+uLPFH0jVkh7W8y6eTzoCxvSoXAj0sWS5uvVB2PEvpBPdzY4+ytaedUM3x9ZVgX0AZKb316ew==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-asym-key": "^2.11.0",
        "@peculiar/asn1-schema": "^2.11.0",
        "@peculiar/asn1-x509": "^2.11.0",
        "asn1js": "^3.0.10",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@peculiar/utils": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/@peculiar/utils/-/utils-2.0.3.tgz",
      "integrity": "sha512-+oL3HPFRIZ1St2K50lWCXiioIgSoxzz7R1J3uF6neO2yl1sgmpgY6XXJH4BdpoDkMWznQTeYF6oWNDZLCdQ4eQ==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.8.1"
      }
    },
    "node_modules/@peculiar/x509": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/@peculiar/x509/-/x509-2.2.0.tgz",
      "integrity": "sha512-adpW58ySPQMOUPv8pTKT3RIyCFqfUFt8X05ukPdtkQToXDVr8dMtxuenik1yx8tNFTbpApWsM/Hi5SzlIx48+Q==",
      "license": "MIT",
      "dependencies": {
        "@peculiar/asn1-cms": "^2.11.0",
        "@peculiar/asn1-csr": "^2.11.0",
        "@peculiar/asn1-ecc": "^2.11.0",
        "@peculiar/asn1-pkcs9": "^2.11.0",
        "@peculiar/asn1-rsa": "^2.11.0",
        "@peculiar/asn1-schema": "^2.11.0",
        "@peculiar/asn1-x509": "^2.11.0",
        "@peculiar/asn1-x509-post-quantum": "^2.11.0",
        "pvtsutils": "^1.3.6",
        "tslib": "^2.8.1",
        "tsyringe": "^4.10.0"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@simplewebauthn/server": {
      "version": "14.0.3",
      "resolved": "https://registry.npmjs.org/@simplewebauthn/server/-/server-14.0.3.tgz",
      "integrity": "sha512-D39/0fiDiYmGV+nraY9s63D1Ho2AX/waMLy22/9gUadTUuvbAnstfb4bpbHYbwZuV5ZLDYN1SmzDKuiHzKAA4Q==",
      "license": "MIT",
      "dependencies": {
        "@hexagon/base64": "^1.1.27",
        "@levischuck/tiny-cbor": "^0.2.2",
        "@peculiar/asn1-android": "^2.6.0",
        "@peculiar/asn1-ecc": "^2.6.1",
        "@peculiar/asn1-rsa": "^2.6.1",
        "@peculiar/asn1-schema": "^2.6.0",
        "@peculiar/asn1-x509": "^2.6.1",
        "@peculiar/asn1-x509-post-quantum": "^2.9.4",
        "@peculiar/x509": "^2.1.0",
        "reflect-metadata": "^0.2.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@types/estree": {
      "version": "1.0.9",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/json-schema": {
      "version": "7.0.15",
      "resolved": "https://registry.npmjs.org/@types/json-schema/-/json-schema-7.0.15.tgz",
      "integrity": "sha512-5+fP8P8MFNC+AyZCDxrB2pkZFPGzqQWUzpSeuuVLvm8VMcorNYavBqoFcxK8bQz4Qsbn4oUEEem4wDLfcysGHA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/acorn": {
      "version": "8.19.0",
      "resolved": "https://registry.npmjs.org/acorn/-/acorn-8.19.0.tgz",
      "integrity": "sha512-oJlA3XiRm7Cyk6qFD2Jn8ak9B7jSy0qy00ADO3+8dpT0LSjFihQYv4C02LFCSYJV3Q37xYwwRy5m+IpIiUzqWw==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "acorn": "bin/acorn"
      },
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/acorn-jsx": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/acorn-jsx/-/acorn-jsx-5.3.2.tgz",
      "integrity": "sha512-rq9s+JNhf0IChjtDXxllJ7g41oZk5SlXtp0LHwyA5cejwn7vKmKp4pPri6YEePv2PU65sAsegbXtIinmDFDXgQ==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "acorn": "^6.0.0 || ^7.0.0 || ^8.0.0"
      }
    },
    "node_modules/ajv": {
      "version": "6.15.0",
      "resolved": "https://registry.npmjs.org/ajv/-/ajv-6.15.0.tgz",
      "integrity": "sha512-fgFx7Hfoq60ytK2c7DhnF8jIvzYgOMxfugjLOSMHjLIPgenqa7S7oaagATUq99mV6IYvN2tRmC0wnTYX6iPbMw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fast-deep-equal": "^3.1.1",
        "fast-json-stable-stringify": "^2.0.0",
        "json-schema-traverse": "^0.4.1",
        "uri-js": "^4.2.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/epoberezkin"
      }
    },
    "node_modules/ansi-styles": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "color-convert": "^2.0.1"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/argparse": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/argparse/-/argparse-2.0.1.tgz",
      "integrity": "sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==",
      "dev": true,
      "license": "Python-2.0"
    },
    "node_modules/asn1js": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/asn1js/-/asn1js-3.1.0.tgz",
      "integrity": "sha512-HWYi1THkOqguCiO+vwj09ZkQFD2kKEsejYHAYCtX0D80WVdoDnvRc9IukXX/jeb0T9NRWJnRtqwdbHltnFjwXA==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "pvtsutils": "^1.3.6",
        "pvutils": "^1.2.0",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=12.0.0"
      }
    },
    "node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/brace-expansion": {
      "version": "1.1.21",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.21.tgz",
      "integrity": "sha512-9zeA+KLZNNzglF2TPKRQEDyx6Yby7daAkuy8MiPzpXPsYDWi/DRM8jmwUDxokQjYqBpv5DgPiwD4h4ZZSy1Ujw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0",
        "concat-map": "0.0.1"
      }
    },
    "node_modules/callsites": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/callsites/-/callsites-3.1.0.tgz",
      "integrity": "sha512-P8BjAsXvZS+VIDUI11hHCQEv74YT67YUi5JJFNWIqL235sBmjX4+qx9Muvls5ivyNENctx46xQLQ3aTuE7ssaQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/chalk": {
      "version": "4.1.2",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-4.1.2.tgz",
      "integrity": "sha512-oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^4.1.0",
        "supports-color": "^7.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/chalk?sponsor=1"
      }
    },
    "node_modules/color-convert": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "color-name": "~1.1.4"
      },
      "engines": {
        "node": ">=7.0.0"
      }
    },
    "node_modules/color-name": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/concat-map": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
      "integrity": "sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/cross-spawn": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
      "integrity": "sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "path-key": "^3.1.0",
        "shebang-command": "^2.0.0",
        "which": "^2.0.1"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/deep-is": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/deep-is/-/deep-is-0.1.4.tgz",
      "integrity": "sha512-oIPzksmTg4/MriiaYGO+okXDT7ztn/w3Eptv/+gSIdMdKsJo0u4CfYNFJPy+4SKMuCqGw2wxnA+URMg3t8a/bQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/escape-string-regexp": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-4.0.0.tgz",
      "integrity": "sha512-TtpcNJ3XAzx3Gq8sWRzJaVajRs0uVxA2YAkdb1jm2YkPz4G6egUFAyA3n5vtEIZefPk5Wa4UXbKuS5fKkJWdgA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/eslint": {
      "version": "9.39.5",
      "resolved": "https://registry.npmjs.org/eslint/-/eslint-9.39.5.tgz",
      "integrity": "sha512-DgZS62aPLXKlnxILS/AYCoRvHaZeXceIzlXPkkGGzJWSow1aEk0lbTlxUSlyjC8jcaKxAdOnTDz+o1JFSBsyjw==",
      "deprecated": "This version is no longer supported. Please see https://eslint.org/version-support for other options.",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@eslint-community/eslint-utils": "^4.8.0",
        "@eslint-community/regexpp": "^4.12.1",
        "@eslint/config-array": "^0.21.2",
        "@eslint/config-helpers": "^0.4.2",
        "@eslint/core": "^0.17.0",
        "@eslint/eslintrc": "^3.3.6",
        "@eslint/js": "9.39.5",
        "@eslint/plugin-kit": "^0.4.1",
        "@humanfs/node": "^0.16.6",
        "@humanwhocodes/module-importer": "^1.0.1",
        "@humanwhocodes/retry": "^0.4.2",
        "@types/estree": "^1.0.6",
        "ajv": "^6.14.0",
        "chalk": "^4.0.0",
        "cross-spawn": "^7.0.6",
        "debug": "^4.3.2",
        "escape-string-regexp": "^4.0.0",
        "eslint-scope": "^8.4.0",
        "eslint-visitor-keys": "^4.2.1",
        "espree": "^10.4.0",
        "esquery": "^1.5.0",
        "esutils": "^2.0.2",
        "fast-deep-equal": "^3.1.3",
        "file-entry-cache": "^8.0.0",
        "find-up": "^5.0.0",
        "glob-parent": "^6.0.2",
        "ignore": "^5.2.0",
        "imurmurhash": "^0.1.4",
        "is-glob": "^4.0.0",
        "json-stable-stringify-without-jsonify": "^1.0.1",
        "lodash.merge": "^4.6.2",
        "minimatch": "^3.1.5",
        "natural-compare": "^1.4.0",
        "optionator": "^0.9.3"
      },
      "bin": {
        "eslint": "bin/eslint.js"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://eslint.org/donate"
      },
      "peerDependencies": {
        "jiti": "*"
      },
      "peerDependenciesMeta": {
        "jiti": {
          "optional": true
        }
      }
    },
    "node_modules/eslint-scope": {
      "version": "8.4.0",
      "resolved": "https://registry.npmjs.org/eslint-scope/-/eslint-scope-8.4.0.tgz",
      "integrity": "sha512-sNXOfKCn74rt8RICKMvJS7XKV/Xk9kA7DyJr8mJik3S7Cwgy3qlkkmyS2uQB3jiJg6VNdZd/pDBJu0nvG2NlTg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "esrecurse": "^4.3.0",
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/eslint-visitor-keys": {
      "version": "4.2.1",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-4.2.1.tgz",
      "integrity": "sha512-Uhdk5sfqcee/9H/rCOJikYz67o0a2Tw2hGRPOG2Y1R2dg7brRe1uG0yaNQDHu+TO/uQPF/5eCapvYSmHUjt7JQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/espree": {
      "version": "10.4.0",
      "resolved": "https://registry.npmjs.org/espree/-/espree-10.4.0.tgz",
      "integrity": "sha512-j6PAQ2uUr79PZhBjP5C5fhl8e39FmRnOjsD5lGnWrFU8i2G776tBK7+nP8KuQUTTyAZUwfQqXAgrVH5MbH9CYQ==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "acorn": "^8.15.0",
        "acorn-jsx": "^5.3.2",
        "eslint-visitor-keys": "^4.2.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/esquery": {
      "version": "1.7.0",
      "resolved": "https://registry.npmjs.org/esquery/-/esquery-1.7.0.tgz",
      "integrity": "sha512-Ap6G0WQwcU/LHsvLwON1fAQX9Zp0A2Y6Y/cJBl9r/JbW90Zyg4/zbG6zzKa2OTALELarYHmKu0GhpM5EO+7T0g==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "estraverse": "^5.1.0"
      },
      "engines": {
        "node": ">=0.10"
      }
    },
    "node_modules/esrecurse": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/esrecurse/-/esrecurse-4.3.0.tgz",
      "integrity": "sha512-KmfKL3b6G+RXvP8N1vr3Tq1kL/oCFgn2NYXEtqP8/L3pKapUA4G8cFVaoF3SU323CD4XypR/ffioHmkti6/Tag==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/estraverse": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/estraverse/-/estraverse-5.3.0.tgz",
      "integrity": "sha512-MMdARuVEQziNTeJD8DgMqmhwR11BRQ/cBP+pLtYdSTnf3MIO8fFeiINEbX36ZdNlfU/7A9f3gUw49B3oQsvwBA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/esutils": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/esutils/-/esutils-2.0.3.tgz",
      "integrity": "sha512-kVscqXk4OCp68SZ0dkgEKVi6/8ij300KBWTJq32P/dYeWTSwK41WyTxalN1eRmA5Z9UU/LX9D7FWSmV9SAYx6g==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/fast-deep-equal": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",
      "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-json-stable-stringify": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz",
      "integrity": "sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-levenshtein": {
      "version": "2.0.6",
      "resolved": "https://registry.npmjs.org/fast-levenshtein/-/fast-levenshtein-2.0.6.tgz",
      "integrity": "sha512-DCXu6Ifhqcks7TZKY3Hxp3y6qphY5SJZmrWMDrKcERSOXWQdMhU9Ig/PYrzyw/ul9jOIyh0N4M0tbC5hodg8dw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/file-entry-cache": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/file-entry-cache/-/file-entry-cache-8.0.0.tgz",
      "integrity": "sha512-XXTUwCvisa5oacNGRP9SfNtYBNAMi+RPwBFmblZEF7N7swHYQS6/Zfk7SRwx4D5j3CH211YNRco1DEMNVfZCnQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "flat-cache": "^4.0.0"
      },
      "engines": {
        "node": ">=16.0.0"
      }
    },
    "node_modules/find-up": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/find-up/-/find-up-5.0.0.tgz",
      "integrity": "sha512-78/PXT1wlLLDgTzDs7sjq9hzz0vXD+zn+7wypEe4fXQxCmdmqfGsEPQxmiCSQI3ajFV91bVSsvNtrJRiW6nGng==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "locate-path": "^6.0.0",
        "path-exists": "^4.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/flat-cache": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/flat-cache/-/flat-cache-4.0.1.tgz",
      "integrity": "sha512-f7ccFPK3SXFHpx15UIGyRJ/FJQctuKZ0zVuN3frBo4HnK3cay9VEW0R6yPYFHC0AgqhukPzKjq22t5DmAyqGyw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "flatted": "^3.2.9",
        "keyv": "^4.5.4"
      },
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/flatted": {
      "version": "3.4.4",
      "resolved": "https://registry.npmjs.org/flatted/-/flatted-3.4.4.tgz",
      "integrity": "sha512-5+ybhBZANEJxaH3X5evAFatUxLfEHSr7n6kYJ+1Qd0mUqr4eu9gIf6GDbWHf8RJijHrjjO8G+la14SlL2SeS1Q==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/glob-parent": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
      "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/globals": {
      "version": "17.13.0",
      "resolved": "https://registry.npmjs.org/globals/-/globals-17.13.0.tgz",
      "integrity": "sha512-RwMTC61u7hrG3ZJMkZQOK4JLJrKS8QtoTii63EmWvFXHqycY9FObBJQCbsLxSO8kjKhWE5kV1GC+Vb1g3RI0Zg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/has-flag": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-4.0.0.tgz",
      "integrity": "sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/ignore": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/ignore/-/ignore-5.3.2.tgz",
      "integrity": "sha512-hsBTNUqQTDwkWtcdYI2i06Y/nUBEsNEDJKjWdigLvegy8kDuJAS8uRlpkkcQpyEXL0Z/pjDy5HBmMjRCJ2gq+g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/import-fresh": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/import-fresh/-/import-fresh-3.3.1.tgz",
      "integrity": "sha512-TR3KfrTZTYLPB6jUjfx6MF9WcWrHL9su5TObK4ZkYgBdWKPOFoSoQIdEuTuR82pmtxH2spWG9h6etwfr1pLBqQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "parent-module": "^1.0.0",
        "resolve-from": "^4.0.0"
      },
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/imurmurhash": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/imurmurhash/-/imurmurhash-0.1.4.tgz",
      "integrity": "sha512-JmXMZ6wuvDmLiHEml9ykzqO6lwFbof0GG4IkcGaENdCRDDmMVnny7s5HsIgHCbaq0w2MyPhDqkhTUgS2LU2PHA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.8.19"
      }
    },
    "node_modules/is-extglob": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-glob": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-extglob": "^2.1.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/isexe": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/js-yaml": {
      "version": "4.3.2",
      "resolved": "https://registry.npmjs.org/js-yaml/-/js-yaml-4.3.2.tgz",
      "integrity": "sha512-SFNOvSJ+Dgf/9An904Yx+CgSlIPCkIpao4qo51lpee25TIRejdH3rhR4EZMGoNx3/TP3O+wzWuiTFl4sqbltzA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/puzrin"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/nodeca"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "argparse": "^2.0.1"
      },
      "bin": {
        "js-yaml": "bin/js-yaml.js"
      }
    },
    "node_modules/json-buffer": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/json-buffer/-/json-buffer-3.0.1.tgz",
      "integrity": "sha512-4bV5BfR2mqfQTJm+V5tPPdf+ZpuhiIvTuAB5g8kcrXOZpTT/QwwVRWBywX1ozr6lEuPdbHxwaJlm9G6mI2sfSQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json-schema-traverse": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz",
      "integrity": "sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json-stable-stringify-without-jsonify": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/json-stable-stringify-without-jsonify/-/json-stable-stringify-without-jsonify-1.0.1.tgz",
      "integrity": "sha512-Bdboy+l7tA3OGW6FjyFHWkP5LuByj1Tk33Ljyq0axyzdk9//JSi2u3fP1QSmd1KNwq6VOKYGlAu87CisVir6Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/keyv": {
      "version": "4.5.4",
      "resolved": "https://registry.npmjs.org/keyv/-/keyv-4.5.4.tgz",
      "integrity": "sha512-oxVHkHR/EJf2CNXnWxRLW6mg7JyCCUcG0DtEGmL2ctUo1PNTin1PUil+r/+4r5MpVgC/fn1kjsx7mjSujKqIpw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "json-buffer": "3.0.1"
      }
    },
    "node_modules/levn": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/levn/-/levn-0.4.1.tgz",
      "integrity": "sha512-+bT2uH4E5LGE7h/n3evcS/sQlJXCpIp6ym8OWJ5eV6+67Dsql/LaaT7qJBAt2rzfoa/5QBGBhxDix1dMt2kQKQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "prelude-ls": "^1.2.1",
        "type-check": "~0.4.0"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/locate-path": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/locate-path/-/locate-path-6.0.0.tgz",
      "integrity": "sha512-iPZK6eYjbxRu3uB4/WZ3EsEIMJFMqAoopl3R+zuq0UjcAm/MO6KCweDgPfP3elTztoKP3KtnVHxTn2NHBSDVUw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "p-locate": "^5.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/lodash.merge": {
      "version": "4.6.2",
      "resolved": "https://registry.npmjs.org/lodash.merge/-/lodash.merge-4.6.2.tgz",
      "integrity": "sha512-0KpjqXRVvrYyCsX1swR/XTK0va6VQkQM6MNo7PqW77ByjAhoARA8EfrP1N4+KlKj8YS0ZUCtRT/YUuhyYDujIQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/minimatch": {
      "version": "3.1.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-3.1.5.tgz",
      "integrity": "sha512-VgjWUsnnT6n+NUk6eZq77zeFdpW2LWDzP6zFGrCbHXiYNul5Dzqk2HHQ5uFH2DNW5Xbp8+jVzaeNt94ssEEl4w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^1.1.7"
      },
      "engines": {
        "node": "*"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/natural-compare": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/natural-compare/-/natural-compare-1.4.0.tgz",
      "integrity": "sha512-OWND8ei3VtNC9h7V60qff3SVobHr996CTwgxubgyQYEpg290h9J0buyECNNJexkFm5sOajh5G116RYA1c8ZMSw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/optionator": {
      "version": "0.9.4",
      "resolved": "https://registry.npmjs.org/optionator/-/optionator-0.9.4.tgz",
      "integrity": "sha512-6IpQ7mKUxRcZNLIObR0hz7lxsapSSIYNZJwXPGeF0mTVqGKFIXj1DQcMoT22S3ROcLyY/rz0PWaWZ9ayWmad9g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "deep-is": "^0.1.3",
        "fast-levenshtein": "^2.0.6",
        "levn": "^0.4.1",
        "prelude-ls": "^1.2.1",
        "type-check": "^0.4.0",
        "word-wrap": "^1.2.5"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/p-limit": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-3.1.0.tgz",
      "integrity": "sha512-TYOanM3wGwNGsZN2cVTYPArw454xnXj5qmWF1bEoAc4+cU/ol7GVh7odevjp1FNHduHc3KZMcFduxU5Xc6uJRQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "yocto-queue": "^0.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/p-locate": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/p-locate/-/p-locate-5.0.0.tgz",
      "integrity": "sha512-LaNjtRWUBY++zB5nE/NwcaoMylSPk+S+ZHNB1TzdbMJMny6dynpAGt7X/tl/QYq3TIeE6nxHppbo2LGymrG5Pw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "p-limit": "^3.0.2"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/parent-module": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/parent-module/-/parent-module-1.0.1.tgz",
      "integrity": "sha512-GQ2EWRpQV8/o+Aw8YqtfZZPfNRWZYkbidE9k5rpl/hC3vtHHBfGm2Ifi6qWV+coDGkrUKZAxE3Lot5kcsRlh+g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "callsites": "^3.0.0"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/path-exists": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/path-exists/-/path-exists-4.0.0.tgz",
      "integrity": "sha512-ak9Qy5Q7jYb2Wwcey5Fpvg2KoAc/ZIhLSLOSBmRmygPsGwkVVt0fZa0qrtMz+m6tJTAHfZQ8FnmB4MG4LWy7/w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-key": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz",
      "integrity": "sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/prelude-ls": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/prelude-ls/-/prelude-ls-1.2.1.tgz",
      "integrity": "sha512-vkcDPrRZo1QZLbn5RLGPpg/WmIQ65qoWWhcGKf/b5eplkkarX0m9z8ppCat4mlOqUsWpyNuYgO3VRyrYHSzX5g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/punycode": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/pvtsutils": {
      "version": "1.3.6",
      "resolved": "https://registry.npmjs.org/pvtsutils/-/pvtsutils-1.3.6.tgz",
      "integrity": "sha512-PLgQXQ6H2FWCaeRak8vvk1GW462lMxB5s3Jm673N82zI4vqtVUPuZdffdZbPDFRoU8kAhItWFtPCWiPpp4/EDg==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.8.1"
      }
    },
    "node_modules/pvutils": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/pvutils/-/pvutils-1.2.0.tgz",
      "integrity": "sha512-BbubeCEyTuQjVMakvJQ/Sxbc93F2pwmbsxONT/ZRrwU7Ua38d8unYTwXpTVLAKJ4BDuH9IGztCjQcd/N/39Dvg==",
      "license": "MIT",
      "engines": {
        "node": ">=16.0.0"
      }
    },
    "node_modules/reflect-metadata": {
      "version": "0.2.2",
      "resolved": "https://registry.npmjs.org/reflect-metadata/-/reflect-metadata-0.2.2.tgz",
      "integrity": "sha512-urBwgfrvVP/eAyXx4hluJivBKzuEbSQs9rKWCrCkbSxNv8mxPcUZKeuoF3Uy4mJl3Lwprp6yy5/39VWigZ4K6Q==",
      "license": "Apache-2.0"
    },
    "node_modules/resolve-from": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/resolve-from/-/resolve-from-4.0.0.tgz",
      "integrity": "sha512-pb/MYmXstAkysRFx8piNI1tGFNQIFA3vkE3Gq4EuA1dF6gHp/+vgZqsCGJapvy8N3Q+4o7FwvquPJcnZ7RYy4g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/shebang-command": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz",
      "integrity": "sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "shebang-regex": "^3.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/shebang-regex": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz",
      "integrity": "sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-json-comments": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/strip-json-comments/-/strip-json-comments-3.1.1.tgz",
      "integrity": "sha512-6fPc+R4ihwqP6N/aIv2f1gMH8lOVtWQHoqC4yK6oSDVVocumAsfCqjkXnqiYMhmMwS/mEHLp7Vehlt3ql6lEig==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/supports-color": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-7.2.0.tgz",
      "integrity": "sha512-qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "has-flag": "^4.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/tsyringe": {
      "version": "4.10.0",
      "resolved": "https://registry.npmjs.org/tsyringe/-/tsyringe-4.10.0.tgz",
      "integrity": "sha512-axr3IdNuVIxnaK5XGEUFTu3YmAQ6lllgrvqfEoR16g/HGnYY/6We4oWENtAnzK6/LpJ2ur9PAb80RBt7/U4ugw==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^1.9.3"
      },
      "engines": {
        "node": ">= 6.0.0"
      }
    },
    "node_modules/tsyringe/node_modules/tslib": {
      "version": "1.14.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-1.14.1.tgz",
      "integrity": "sha512-Xni35NKzjgMrwevysHTCArtLDpPvye8zV/0E4EyYn43P7/7qvQwPh9BGkHewbMulVntbigmcT7rdX3BNo9wRJg==",
      "license": "0BSD"
    },
    "node_modules/type-check": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/type-check/-/type-check-0.4.0.tgz",
      "integrity": "sha512-XleUoc9uwGXqjWwXaUTZAmzMcFZ5858QA2vvx1Ur5xIcixXIP+8LnFDgRplU30us6teqdlskFfu+ae4K79Ooew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "prelude-ls": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/uri-js": {
      "version": "4.4.1",
      "resolved": "https://registry.npmjs.org/uri-js/-/uri-js-4.4.1.tgz",
      "integrity": "sha512-7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "punycode": "^2.1.0"
      }
    },
    "node_modules/which": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/which/-/which-2.0.2.tgz",
      "integrity": "sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "isexe": "^2.0.0"
      },
      "bin": {
        "node-which": "bin/node-which"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/word-wrap": {
      "version": "1.2.5",
      "resolved": "https://registry.npmjs.org/word-wrap/-/word-wrap-1.2.5.tgz",
      "integrity": "sha512-BN22B5eaMMI9UMtjrGd5g5eCYPpCPDUy0FJXbYsaT5zYxjFOckS53SQDE3pWkVoWpHXVb3BrYcEN4Twa55B5cA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/yocto-queue": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/yocto-queue/-/yocto-queue-0.1.0.tgz",
      "integrity": "sha512-rVksvsnNCdJ/ohGc6xgPwyN8eheCxsiLM8mxuE/t/mOVqJewPuO1miLpTHQiRgTKCLexL4MeAFVagts7HmNZ2Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    }
  }
}

``````

### package.json

``````
{
  "name": "sleep",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "node --test test/*.test.js",
    "lint": "eslint functions cron-worker test",
    "check": "npm run lint && npm test"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ezuoju2-maker/Sleep-.git"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/ezuoju2-maker/Sleep-/issues"
  },
  "homepage": "https://github.com/ezuoju2-maker/Sleep-#readme",
  "dependencies": {
    "@noble/hashes": "^2.4.0",
    "@simplewebauthn/server": "^14.0.3"
  },
  "type": "module",
  "devDependencies": {
    "eslint": "^9.39.5",
    "globals": "^17.13.0"
  }
}

``````

### passkey.js

``````
import { startRegistration, startAuthentication } from "https://esm.sh/@simplewebauthn/browser@14";
window.SimpleWebAuthnBrowser = { startRegistration, startAuthentication };

``````

### privacy.html

``````
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>隐私政策 - Sleep</title>
<link rel="stylesheet" href="/static/legal.css">
</head>
<body>
<article>
<h1>隐私政策</h1>
<p class="updated">最后更新：2026-10-21</p>

<h2>1. 数据收集</h2>
<p>我们仅收集：用户名、邮箱、密码哈希、登录 IP、User-Agent、Passkey 公钥。绝不收集您的通讯录、地理位置、照片等无关信息。</p>

<h2>2. 数据存储与安全</h2>
<p>密码使用单向不可逆的 PBKDF2-SHA256 加盐存储，即使数据库泄露，攻击者也无法还原明文密码。会话令牌、密码重置令牌均以哈希形式存储。</p>

<h2>3. 第三方服务</h2>
<p>我们使用 Resend 发送密码重置与安全通知邮件；使用 Cloudflare 提供托管、D1 数据库、KV 存储。所有第三方均不用于广告画像。</p>

<h2>4. 数据保留</h2>
<p>会话记录保留至过期；审计日志保留 365 天；过期令牌自动清理。您可随时通过「忘记密码」或联系管理员删除账号数据。</p>

<h2>5. 您的权利</h2>
<p>您有权访问、更正、导出、删除您的个人数据。如需行使这些权利，请联系我们。</p>

<h2>6. 数据出售</h2>
<p>我们绝不将您的数据出售、出租或与任何第三方分享用于商业目的。</p>

<p class="back"><a href="/">← 返回 Sleep</a></p>
</article>
</body>
</html>

``````

### static/legal.css

``````
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #fcfdff; color: #111; line-height: 1.7; padding: 20px;
}
article {
  max-width: 720px; margin: 40px auto; background: #fff;
  padding: 40px 32px; border-radius: 20px;
  box-shadow: 0 10px 30px -15px rgba(100, 130, 160, 0.15);
}
h1 { font-size: 26px; margin-bottom: 8px; }
.updated { font-size: 12px; color: #999; margin-bottom: 24px; }
h2 { font-size: 17px; margin: 24px 0 8px; color: #111; }
p { font-size: 14px; color: #444; margin-bottom: 12px; }
.back { margin-top: 32px; }
.back a { color: #4d8ee4; text-decoration: none; font-size: 14px; }

``````

### style.css

``````

  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  
  html, body {
    width: 100%; height: 100vh; height: 100dvh;
    overflow: hidden; touch-action: pan-y;
    -webkit-text-size-adjust: 100% !important;
  }

  body {
    background-color: #fcfdff; position: relative;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-touch-callout: none; -webkit-user-select: none; user-select: none;
    display: flex; flex-direction: column; align-items: center;
    padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);
  }
  
  .blob { position: fixed; border-radius: 50%; filter: blur(80px); z-index: 0; pointer-events: none; }
  .b-top-left { width: 80vw; height: 80vw; top: -10vw; left: -20vw; background: #d4e6fa; opacity: 0.7; }
  .b-top-right { width: 75vw; height: 75vw; top: -10vw; right: -20vw; background: #e8defa; opacity: 0.6; }
  .b-bottom { width: 140vw; height: 80vw; bottom: 0; left: 50%; transform: translateX(-50%); background: #b8def7; opacity: 0.85; filter: blur(90px); }
  .b-light { width: 90vw; height: 60vw; bottom: 20vh; left: 5vw; background: #ffffff; opacity: 0.8; filter: blur(70px); }

  .header { width: 100%; max-width: 390px; padding: 8px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 10; flex-shrink: 0; }
  .brand { display: flex; align-items: center; gap: 6px; color: #111; }
  .logo-img { width: 44px; height: 32px; background-image: url('logo.png'); background-size: contain; background-position: center; background-repeat: no-repeat; pointer-events: none; }
  .brand-name { font-family: "Courier New", Courier, monospace; font-weight: 900; font-size: 22px; letter-spacing: -1px; }

  .lang-container { position: relative; }
  .lang-btn { display: flex; align-items: center; gap: 4px; background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(255, 255, 255, 0.8); padding: 4px 10px; border-radius: 20px; font-size: 12px; color: #333; cursor: pointer; backdrop-filter: blur(10px); }
  .lang-menu { position: absolute; top: calc(100% + 8px); right: 0; width: 180px; max-height: 200px; overflow-y: auto; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.9); border-radius: 14px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); opacity: 0; visibility: hidden; transform: translateY(-10px); transition: all 0.25s; z-index: 20; }
  .lang-menu.active { opacity: 1; visibility: visible; transform: translateY(0); }
  .lang-menu::-webkit-scrollbar { width: 0; }
  .lang-item { padding: 8px 12px; font-size: 13px; color: #333; cursor: pointer; display: flex; gap: 6px; }

  .scroll-wrapper { flex: 1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 10px 0; }
  .scroll-wrapper::-webkit-scrollbar { display: none; }

  .login-card { position: relative; z-index: 5; width: min(92vw, 390px); background: #ffffff; border-radius: 20px; padding: 16px; box-shadow: 0 10px 30px -15px rgba(100, 130, 160, 0.15); flex-shrink: 0; transition: transform 0.1s; }

  @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
  .shake { animation: shake 0.4s ease-in-out; }

  .card-header { text-align: center; margin-bottom: 12px; }
  .card-header h1 { font-size: 20px; font-weight: 800; color: #111; margin-bottom: 2px; }
  .card-header p { font-size: 12px; color: #888; }

  .tabs { display: flex; background: #f4f5f7; border-radius: 10px; padding: 2px; margin-bottom: 12px; }
  .tab { flex: 1; text-align: center; padding: 6px 0; font-size: 13px; font-weight: 600; color: #888; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
  .tab.active { background: #fff; color: #111; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); }

  .form-content { display: none; animation: fadeIn 0.2s ease; }
  .form-content.active { display: block; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

  .input-container { margin-bottom: 8px; position: relative; }
  .input-group { position: relative; }
  .input-group input { width: 100%; height: 40px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0 40px 0 12px; font-size: 14px; color: #111; outline: none; background: #fafbfc; transition: all 0.2s; -webkit-user-select: text; user-select: text; }
  .input-group input:focus { border-color: #7fb6dd; background: #fff; }
  .input-group input::placeholder { color: #6b7280; opacity: 1; }
  .input-group input.error { border-color: #e53e3e; background: #fffafb; }

  .input-tips { font-size: 11px; color: #5f6770; margin-top: 2px; padding-left: 4px; line-height: 1.2; transition: color 0.2s; }
  .input-tips.error-text { color: #e53e3e; }

  .eye-wrapper { position: absolute; right: 0; top: 0; height: 100%; width: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 5; background: none; border: none; padding: 0; }
  .eye-icon { width: 16px; height: 16px; stroke: #a0aab5; fill: none; stroke-width: 1.8; pointer-events: none; transition: stroke 0.2s; }
  .eye-icon .eye-slash { display: none; }
  .eye-wrapper.show-pwd .eye-slash { display: block; }
  .eye-wrapper.show-pwd .eye-icon { stroke: #111; }

  .checkbox-group { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #666; margin-bottom: 12px; margin-top: 2px;}
  .checkbox-group input[type="checkbox"] { width: 14px; height: 14px; accent-color: #111; cursor: pointer; }
  .checkbox-group a { color: #4d8ee4; text-decoration: none; }
  .checkbox-group.error-checkbox label { color: #e53e3e; }
  .checkbox-group.error-checkbox input[type=checkbox] { accent-color: #e53e3e; outline: 1px solid #e53e3e; border-radius: 2px; }

  .btn-submit { width: 100%; height: 40px; background: #000; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 12px; transition: transform 0.1s, background 0.2s; }
  .btn-submit:active { transform: scale(0.98); background: #222; }

  .form-actions { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #666; margin-bottom: 12px; }
  .form-actions .checkbox-group { margin-bottom: 0; }
  .form-actions a { color: #4d8ee4; text-decoration: none; }

  .divider { display: flex; align-items: center; color: #6b7280; font-size: 11px; margin-bottom: 12px; }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #eee; }
  .divider::before { margin-right: 8px; } .divider::after { margin-left: 8px; }

  .social-login { display: flex; gap: 8px; margin-bottom: 12px; }
  .social-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; height: 40px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 13px; font-weight: 600; color: #111; cursor: pointer; }
  .social-btn svg { width: 16px; height: 16px; }

  .footer-text { text-align: center; font-size: 10px; color: #999; line-height: 1.3; }
  .footer-text a { color: #999; text-decoration: none; margin: 0 2px; }

    
/* 按钮加载动画 */
.btn-submit.loading {
  position: relative;
  color: transparent !important;
  pointer-events: none;
}
.btn-submit.loading::after {
  content: '';
  position: absolute;
  left: 50%; top: 50%;
  width: 18px; height: 18px;
  margin-left: -9px; margin-top: -9px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ================= 修复：输入框与按钮的焦点样式 ================= */
/* 输入框聚焦时，去掉系统粗边框，用我们自己设计的浅蓝边框+极软光晕 */
input:focus, input:focus-visible {
  outline: none !important;
  border-color: #7fb6dd !important;
  background: #ffffff !important;
  box-shadow: 0 0 0 3px rgba(127, 182, 221, 0.15) !important;
}

/* 按钮和链接保留无障碍焦点环，但换得更细、更柔和 */
button:focus-visible, a:focus-visible {
  outline: 2px solid #7fb6dd;
  outline-offset: 3px;
  border-radius: 4px;
}

/* ===== 弹窗组件类（F-50 内联样式清理）===== */
.modal-backdrop {
  display: none;
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  align-items: center;
  justify-content: center;
}
.modal-backdrop.modal-z-100 { z-index: 100; background: rgba(255, 255, 255, 0.7); }
.modal-backdrop.modal-z-200 { z-index: 200; }
.modal-backdrop.modal-z-300 { z-index: 300; }
.modal-backdrop.modal-bg-soft { background: rgba(255, 255, 255, 0.85); }

.modal-card {
  background: #fff;
  width: 85%;
  max-width: 340px;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
}
.modal-card-lg {
  width: 90%;
  max-width: 360px;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
}
.modal-card-md {
  width: 90%;
  max-width: 350px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.modal-title { font-size: 18px; color: #111; }
.modal-title-sm { font-size: 18px; margin-bottom: 8px; color: #111; }
.modal-tip { font-size: 11px; color: #e53e3e; margin-bottom: 12px; }
.modal-tip[hidden] { display: none; }
.modal-actions { display: flex; gap: 10px; }
.modal-btn-cancel {
  flex: 1; height: 40px;
  background: #f4f5f7; border: none; border-radius: 10px;
  font-weight: 600; color: #666; cursor: pointer;
}
.modal-btn-primary {
  flex: 1; height: 40px;
  background: #000; border: none; border-radius: 10px;
  font-weight: 600; color: #fff; cursor: pointer;
}
.modal-input-pad { padding: 0 14px; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px;
}
.modal-close-btn {
  background: none; border: none; font-size: 20px; cursor: pointer; color: #999;
}

``````

### sw.js

``````
// 发布新版本时只需要改这一处
const SW_VERSION = 'v3';
const CACHE_NAME = `sleep-cache-${SW_VERSION}`;

const PRECACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/passkey.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith('sleep-cache-') && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok && response.type === 'basic') {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok && response.type === 'basic') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    const exact = await caches.match(request);
    if (exact) return exact;
    const shell = await caches.match('/');
    if (shell) return shell;
    return new Response('离线状态，请连接网络后重试', {
      status: 503,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API 和 SW 自身不缓存
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname === '/sw.js') return;

  // 导航请求（HTML 页面）：Network-First（避免离线呈现过期登录状态）
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 静态资源：Cache-First
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 其余走默认网络
});

``````

### terms.html

``````
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>服务条款 - Sleep</title>
<link rel="stylesheet" href="/static/legal.css">
</head>
<body>
<article>
<h1>服务条款</h1>
<p class="updated">最后更新：2026-10-21</p>

<h2>1. 服务说明</h2>
<p>Sleep 是一个注重隐私与安全认证的极简平台。注册即表示您同意本条款。</p>

<h2>2. 账号安全</h2>
<p>您需对账号及密码的保密负责。我们使用 PBKDF2 工业级加密存储密码，但请勿在多个平台使用相同密码。</p>

<h2>3. 用户行为规范</h2>
<p>禁止利用本平台进行任何违反当地法律法规的活动。恶意攻击、批量注册、撞库等行为将被自动封禁。</p>

<h2>4. 服务变更与终止</h2>
<p>我们保留在合理通知后调整或终止服务的权利。如您违反本条款，我们有权立即停止服务。</p>

<h2>5. 免责声明</h2>
<p>在法律允许的最大范围内，Sleep 不对因服务中断、数据丢失等造成的间接损失承担责任。</p>

<p class="back"><a href="/">← 返回 Sleep</a></p>
</article>
</body>
</html>

``````

### test/csrf.test.js

``````
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyRequest } from '../functions/api/_csrf.js';

const URL_ = 'https://example.com/api/test';

test('Sec-Fetch-Site: same-origin 放行', () => {
  const req = new Request(URL_, { method: 'POST', headers: { 'Sec-Fetch-Site': 'same-origin' } });
  assert.equal(verifyRequest(req), true);
});

test('Sec-Fetch-Site: cross-site 拒绝', () => {
  const req = new Request(URL_, { method: 'POST', headers: { 'Sec-Fetch-Site': 'cross-site' } });
  assert.equal(verifyRequest(req), false);
});

test('Sec-Fetch-Site: none 拒绝（P0-07 回归）', () => {
  const req = new Request(URL_, { method: 'POST', headers: { 'Sec-Fetch-Site': 'none' } });
  assert.equal(verifyRequest(req), false);
});

test('无 Sec-Fetch-Site，同源 Origin 放行', () => {
  const req = new Request(URL_, { method: 'POST', headers: { 'Origin': 'https://example.com' } });
  assert.equal(verifyRequest(req), true);
});

test('无 Sec-Fetch-Site，跨源 Origin 拒绝', () => {
  const req = new Request(URL_, { method: 'POST', headers: { 'Origin': 'https://evil.com' } });
  assert.equal(verifyRequest(req), false);
});

test('无 Sec-Fetch-Site 无 Origin 拒绝', () => {
  const req = new Request(URL_, { method: 'POST' });
  assert.equal(verifyRequest(req), false);
});

``````

### test/password-hash.test.js

``````
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, verifyDummyHash, hashNeedsRehash } from '../functions/api/_crypto.js';
import { PBKDF2_ITERATIONS } from '../functions/api/_constants.js';

const env = { PASSWORD_PEPPER: 'a'.repeat(32) };

test('hashPassword 输出格式正确且迭代数符合常量', async () => {
  const hash = await hashPassword('Test1234!Abcd', env);
  assert.match(hash, /^pbkdf2_sha256\$\d+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
  assert.equal(parseInt(hash.split('$')[1], 10), PBKDF2_ITERATIONS);
});

test('verifyPassword 正确密码返回 true', async () => {
  const hash = await hashPassword('Test1234!Abcd', env);
  assert.equal(await verifyPassword('Test1234!Abcd', hash, env), true);
});

test('verifyPassword 错误密码返回 false', async () => {
  const hash = await hashPassword('Test1234!Abcd', env);
  assert.equal(await verifyPassword('wrong-password', hash, env), false);
});

test('verifyPassword 无法解析的哈希返回 false 不抛错', async () => {
  assert.equal(await verifyPassword('x', 'not-a-valid-hash', env), false);
  assert.equal(await verifyPassword('x', 'pbkdf2_sha256$bad', env), false);
  assert.equal(await verifyPassword('x', '', env), false);
});

test('verifyPassword 缺 PASSWORD_PEPPER 返回 false 不抛错', async () => {
  const hash = await hashPassword('Test1234!Abcd', env);
  assert.equal(await verifyPassword('Test1234!Abcd', hash, {}), false);
});

test('hashNeedsRehash 对低迭代返回 true', () => {
  assert.equal(hashNeedsRehash(`pbkdf2_sha256$${PBKDF2_ITERATIONS / 2}$c2FsdA==$aGFzaA==`), true);
});

test('hashNeedsRehash 对当前迭代返回 false', async () => {
  const hash = await hashPassword('Test1234!Abcd', env);
  assert.equal(hashNeedsRehash(hash), false);
});

test('verifyDummyHash 一定返回 false', async () => {
  assert.equal(await verifyDummyHash('anything', env), false);
});

test('verifyPassword 拒绝越界/非法迭代数', async () => {
  const salt = btoa(String.fromCharCode(...new Uint8Array(16)));
  const hash = btoa(String.fromCharCode(...new Uint8Array(32)));
  for (const it of ['999999999', 'NaN', '-1', '0', '9999', 'abc']) {
    assert.equal(await verifyPassword('x', `pbkdf2_sha256$${it}$${salt}$${hash}`, env), false, `iterations=${it}`);
  }
});

test('verifyPassword 拒绝非法盐长/哈希长', async () => {
  const salt16 = btoa(String.fromCharCode(...new Uint8Array(16)));
  const hash32 = btoa(String.fromCharCode(...new Uint8Array(32)));
  const shortSalt = btoa(String.fromCharCode(...new Uint8Array(8)));
  const shortHash = btoa(String.fromCharCode(...new Uint8Array(16)));
  const it = PBKDF2_ITERATIONS;
  assert.equal(await verifyPassword('x', `pbkdf2_sha256$${it}$${shortSalt}$${hash32}`, env), false);
  assert.equal(await verifyPassword('x', `pbkdf2_sha256$${it}$${salt16}$${shortHash}`, env), false);
});

test('hashNeedsRehash 对畸形输入返回 true', () => {
  for (const v of [null, undefined, '', 'garbage', 'pbkdf2_sha256$x$y$z', 'pbkdf2_sha256$NaN$a$b']) {
    assert.equal(hashNeedsRehash(v), true, `input=${String(v)}`);
  }
});

``````

### test/password-policy.test.js

``````
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePassword } from '../functions/api/_password.js';

const env = {};

test('过短密码被拒', async () => {
  assert.match(await validatePassword(env, 'abc'), /长度/);
});

test('过长密码被拒', async () => {
  assert.match(await validatePassword(env, 'A'.repeat(200)), /长度/);
});

test('仅一类字符被拒', async () => {
  assert.match(await validatePassword(env, 'aaaaaaaaaaaa'), /至少两种/);
});

test('两类字符通过（跳过 HIBP）', async () => {
  assert.equal(await validatePassword(env, 'TestTest1234', { checkHibp: false }), null);
});

test('含三类字符通过（跳过 HIBP）', async () => {
  assert.equal(await validatePassword(env, 'TestTest123!', { checkHibp: false }), null);
});

test('非字符串输入被拒', async () => {
  assert.match(await validatePassword(env, 12345, { checkHibp: false }), /不合法/);
});

test('null 输入被拒', async () => {
  assert.match(await validatePassword(env, null, { checkHibp: false }), /不合法/);
});

``````

### test/ratelimit.test.js

``````
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit } from '../functions/api/_ratelimit.js';

// 内存版 D1，只实现 _ratelimit.js 用到的两条语句。
// UPSERT 的窗口判断与计数在同一语句内完成，与真实 D1 语义一致。
function makeD1() {
  const rows = new Map();
  return {
    rows,
    prepare(sql) {
      let args = [];
      const stmt = {
        bind(...a) { args = a; return stmt; },
        async first() {
          if (!/INSERT INTO rate_limits/.test(sql)) throw new Error(`unexpected first: ${sql}`);
          const [key, resetAt, now] = args;
          const cur = rows.get(key);
          let count, reset_at;
          if (!cur || cur.reset_at <= now) {
            count = 1;
            reset_at = resetAt;
          } else {
            count = cur.count + 1;
            reset_at = cur.reset_at;
          }
          rows.set(key, { count, reset_at });
          return { count, reset_at };
        },
        async run() {
          if (!/DELETE FROM rate_limits WHERE reset_at <=/.test(sql)) throw new Error(`unexpected run: ${sql}`);
          for (const [k, v] of rows) if (v.reset_at <= args[0]) rows.delete(k);
          return { success: true };
        },
      };
      return stmt;
    },
  };
}

test('首次请求放行', async () => {
  const env = { DB: makeD1() };
  const r = await rateLimit(env, 'test:1', 5, 60);
  assert.equal(r.ok, true);
  assert.equal(r.remaining, 4);
});

test('达到上限后拒绝', async () => {
  const env = { DB: makeD1() };
  for (let i = 0; i < 5; i++) {
    const r = await rateLimit(env, 'test:2', 5, 60);
    assert.equal(r.ok, true);
  }
  const r = await rateLimit(env, 'test:2', 5, 60);
  assert.equal(r.ok, false);
  assert.equal(r.remaining, 0);
});

test('DB 缺失时 fail-closed 并标记 degraded', async () => {
  const r = await rateLimit({}, 'test:3', 5, 60);
  assert.equal(r.ok, false);
  assert.equal(r.degraded, true);
});

test('不同 key 互不影响', async () => {
  const env = { DB: makeD1() };
  for (let i = 0; i < 5; i++) await rateLimit(env, 'a', 5, 60);
  const r = await rateLimit(env, 'b', 5, 60);
  assert.equal(r.ok, true);
});

test('remaining 递减正确', async () => {
  const env = { DB: makeD1() };
  assert.equal((await rateLimit(env, 'test:4', 5, 60)).remaining, 4);
  assert.equal((await rateLimit(env, 'test:4', 5, 60)).remaining, 3);
});

test('窗口到期后计数归 1', async () => {
  const env = { DB: makeD1() };
  for (let i = 0; i < 5; i++) await rateLimit(env, 'test:5', 5, 60);
  assert.equal((await rateLimit(env, 'test:5', 5, 60)).ok, false);
  env.DB.rows.get('test:5').reset_at = Date.now() - 1;
  const r = await rateLimit(env, 'test:5', 5, 60);
  assert.equal(r.ok, true);
  assert.equal(r.remaining, 4);
});

test('50 个并发调用放行数恰为 limit', async () => {
  const env = { DB: makeD1() };
  const results = await Promise.all(Array.from({ length: 50 }, () => rateLimit(env, 'test:6', 10, 60)));
  assert.equal(results.filter(r => r.ok).length, 10);
  assert.equal(env.DB.rows.get('test:6').count, 50);
});

``````

### test/routes-smoke.test.js

``````
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('../functions/', import.meta.url).pathname;

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : (p.endsWith('.js') ? [p] : []);
  });
}

for (const file of walk(ROOT).sort()) {
  const rel = file.slice(ROOT.length);
  test(`模块可加载: ${rel}`, async () => {
    const mod = await import(pathToFileURL(file).href);
    const handlers = Object.keys(mod).filter((k) => k.startsWith('onRequest'));
    const isHelper = rel.split('/').some((seg) => seg.startsWith('_'));
    if (!isHelper) {
      assert.ok(handlers.length > 0, `${rel} 没有任何 onRequest* 导出`);
    }
  });
}

``````

### test/time-safety.test.js

``````
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('ISO 时间比较：同日过期被正确识别', () => {
  const nowIso = '2026-10-21T15:00:00.000Z';
  const expiredToday = '2026-10-21T00:00:01.000Z';
  assert.equal(new Date(expiredToday).toISOString() <= nowIso, true);
});

test('ISO 时间比较：未来时间不判定为过期', () => {
  const nowIso = '2026-10-21T15:00:00.000Z';
  const future = '2026-10-21T16:00:00.000Z';
  assert.equal(new Date(future).toISOString() <= nowIso, false);
});

test('P0-08 回归：ISO 与 SQLite CURRENT_TIMESTAMP 混用是陷阱', () => {
  const sqlite = '2026-10-21 00:00:01';
  const iso = '2026-10-21T00:00:01.000Z';
  // 字符串逐位比较：'T'(0x54) > ' '(0x20)，ISO 总是"大于"空格格式
  assert.equal(iso > sqlite, true);
  // SQLite 的 CURRENT_TIMESTAMP 无时区，Date 按本地时区解析；ISO 带 Z 按 UTC 解析。
  // 两者在非 UTC 环境下时间戳不同，因此不可混用。此处只断言字符串比较的陷阱，
  // 不断言时间戳差异，避免测试依赖运行环境的时区。
});

``````

### wrangler.toml

``````
name = "sleep"
compatibility_date = "2026-10-01"
pages_build_output_dir = "."

[[d1_databases]]
binding = "DB"
database_name = "sleep-db"
database_id = "0ea2ea5d-3baa-458b-9ace-f02e332f92c3"

[[kv_namespaces]]
binding = "SLEEP_KV"
id = "9e9fa794127b4b69a03bc56ce77be5f2"

``````

## 三、验收证据

### `_crypto.js` 导出

``````
41:export async function hashPassword(password, env, iterations = DEFAULT_ITERATIONS) {
47:export async function verifyPassword(password, storedHash, env) {
67:export async function verifyDummyHash(password, env) {
73:export function hashNeedsRehash(storedHash) {
``````

### `PBKDF2_ITERATIONS` 定义与消费点

``````
functions/api/_crypto.js:1:import { PBKDF2_ITERATIONS as DEFAULT_ITERATIONS } from "./_constants.js";
functions/api/_constants.js:2:export const PBKDF2_ITERATIONS = 50_000;
``````

### 限流无 KV 依赖

``````
(无输出)
``````

### JS 语法检查

``````
OK   cron-worker/index.js
OK   functions/_middleware.js
OK   functions/api/_audit.js
OK   functions/api/_constants.js
OK   functions/api/_crypto.js
OK   functions/api/_csrf.js
OK   functions/api/_disposable.js
OK   functions/api/_email.js
OK   functions/api/_errors.js
OK   functions/api/_hibp.js
OK   functions/api/_http.js
OK   functions/api/_notify.js
OK   functions/api/_password.js
OK   functions/api/_ratelimit.js
OK   functions/api/_session.js
OK   functions/api/_shield.js
OK   functions/api/_threatintel.js
OK   functions/api/_token.js
OK   functions/api/audit-logs.js
OK   functions/api/change-password.js
OK   functions/api/forgot.js
OK   functions/api/github-callback.js
OK   functions/api/github-login.js
OK   functions/api/login.js
OK   functions/api/logout.js
OK   functions/api/me.js
OK   functions/api/passkey/login-options.js
OK   functions/api/passkey/login-verify.js
OK   functions/api/passkey/register-options.js
OK   functions/api/passkey/register-verify.js
OK   functions/api/register.js
OK   functions/api/reset.js
OK   functions/api/sessions.js
OK   functions/api/verify-sudo.js
OK   test/csrf.test.js
OK   test/password-hash.test.js
OK   test/password-policy.test.js
OK   test/ratelimit.test.js
OK   test/routes-smoke.test.js
OK   test/time-safety.test.js

fail=0
``````

### 单元测试

``````
# tests 67
# suites 0
# pass 67
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 3631.493615
``````

## 四、部署步骤

1. 应用迁移：`npx wrangler d1 migrations apply sleep-db --remote`
2. 配置 Secrets：`PASSWORD_PEPPER`、`RESEND_API_KEY`、`GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`
3. 部署：`npx wrangler pages deploy .`
4. 验证：`curl -I https://sleeping.cc.cd/test/csrf.test.js` 应返回 404
