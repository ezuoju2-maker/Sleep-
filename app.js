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
function getShieldData(isReg) {
  const hp = document.getElementById(isReg ? 'shield_hp_reg' : 'shield_hp');
  return { timeSpent: Math.floor((Date.now() - shieldStartTime) / 1000), interactions: shieldInteractions, isHoneypotFilled: hp ? hp.value !== "" : false };
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
    errNetwork: "网络错误，请稍后重试",
    noLogs: "暂无日志",
    devCurrent: "当前设备",
    devOther: "其他设备",
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
    errNetwork: "Network error, please try again",
    noLogs: "No logs",
    devCurrent: "Current device",
    devOther: "Other device",
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
      document.getElementById('userPanel').classList.add('active');
      document.getElementById('userUid').textContent = data.user.uid;
    } else {
      document.getElementById('mainTabs').style.display = 'flex';
      document.querySelector('.card-header').style.display = 'block';
      document.getElementById('userPanel').classList.remove('active');
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
    tip.textContent = dict.errNetwork; tip.hidden = false;
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
  } else { list.textContent = dict.noLogs; }
};
document.getElementById('btnCloseAudit').onclick = () => document.getElementById('auditModal').style.display = 'none';

document.getElementById('btnSessions').onclick = async () => {
  document.getElementById('sessionsModal').style.display = 'flex';
  const res = await requestApi('/api/sessions'); const data = await res.json();
  const list = document.getElementById('sessionsList'); list.innerHTML = '';
  if (data.success) {
    data.sessions.forEach(s => {
      const div = document.createElement('div'); div.style.padding = '8px'; div.style.borderBottom = '1px solid #eee';
      div.textContent = `${s.ip} - ${s.isCurrent ? dict.devCurrent : dict.devOther}`; list.appendChild(div);
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
    showToast(dict.errNetwork);
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
    tip.textContent = dict.errNetwork; tip.hidden = false;
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
    tip.textContent = dict.errNetwork; tip.hidden = false;
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


// 找回密码：消费邮件链接中的 reset_token
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
      tip.textContent = dict.errNetwork;
      tip.style.display = 'block';
    }
    btn.disabled = false;
    btn.classList.remove('loading');
  };
})();

// 注册 Service Worker
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

// 通用弹窗关闭（btnCloseModal + 遮罩 + Esc）
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
