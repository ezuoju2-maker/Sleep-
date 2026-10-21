// ========== 风控盾采集 ==========
let shieldStartTime = Date.now();
let shieldInteractions = 0;
document.addEventListener('mousemove', () => { shieldInteractions++; });
document.addEventListener('touchmove', () => { shieldInteractions++; });

function getShieldData() {
  const hp = document.getElementById('shield_hp');
  return {
    timeSpent: Math.floor((Date.now() - shieldStartTime) / 1000),
    interactions: shieldInteractions,
    isHoneypotFilled: hp ? hp.value !== "" : false
  };
}

// ========== 工具函数 ==========
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div'); t.id = 'toast';
    t.style.cssText = 'position:fixed;bottom:40px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:10px 20px;border-radius:20px;font-size:14px;z-index:9999;transition:opacity 0.3s;pointer-events:none;';
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity = '1';
  setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

async function api(path, options = {}) {
  const isPasskey = typeof path === "string" && path.includes("/api/passkey/");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), isPasskey ? 15000 : 10000);
  try {
    return await fetch(path, { ...options, signal: ctrl.signal });
  } catch (err) {
    if (err && err.name === "AbortError") throw new Error("请求超时");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ========== Tab 切换 ==========
document.getElementById('tabLogin').onclick = () => {
  document.getElementById('tabLogin').classList.add('active');
  document.getElementById('tabRegister').classList.remove('active');
  document.getElementById('loginForm').classList.add('active');
  document.getElementById('registerForm').classList.remove('active');
};
document.getElementById('tabRegister').onclick = () => {
  document.getElementById('tabRegister').classList.add('active');
  document.getElementById('tabLogin').classList.remove('active');
  document.getElementById('registerForm').classList.add('active');
  document.getElementById('loginForm').classList.remove('active');
};

// ========== 表单提交 ==========
document.getElementById('formLogin').onsubmit = async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true; btn.textContent = '登录中...';
  try {
    const res = await api('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({
        account: document.getElementById('loginUser').value,
        password: document.getElementById('loginPwd').value,
        shield: getShieldData()
      })
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = '/home/'; // 跳转到首页
    } else {
      showToast(data.error || '登录失败');
    }
  } catch (err) {
    showToast('网络错误');
  }
  btn.disabled = false; btn.textContent = '登录';
};

document.getElementById('formRegister').onsubmit = async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true; btn.textContent = '注册中...';
  try {
    const res = await api('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({
        username: document.getElementById('regUser').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPwd').value,
        shield: getShieldData()
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast('注册成功');
      window.location.href = '/home/'; // 跳转到首页
    } else {
      showToast(data.error || '注册失败');
    }
  } catch (err) {
    showToast('网络错误');
  }
  btn.disabled = false; btn.textContent = '注册';
};

// ========== 第三方登录 ==========
document.getElementById('btnGithubLogin').onclick = () => { window.location.href = '/api/github-login'; };

// ========== 面容 / 指纹登录 (Passkey) ==========
const btnPasskeyLogin = document.getElementById('btnPasskeyLogin');
if (btnPasskeyLogin) {
  btnPasskeyLogin.onclick = async () => {
    btnPasskeyLogin.disabled = true;
    btnPasskeyLogin.textContent = '验证中...';
    try {
      // 1. 获取挑战
      const resp = await api('/api/passkey/login-options', { method: 'POST' });
      const { options, challengeId } = await resp.json();
      if (!options) throw new Error('获取验证参数失败');

      // 2. 唤起系统面容/指纹
      const credential = await window.SimpleWebAuthnBrowser.startAuthentication({ optionsJSON: options });

      // 3. 提交验证
      const verifyRes = await api('/api/passkey/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ challengeId, credential })
      });
      const data = await verifyRes.json();
      
      if (data.success) {
        window.location.href = '/home/';
      } else {
        showToast(data.error || '验证失败');
      }
    } catch (e) {
      // 用户取消或设备不支持
      if (e.name !== 'NotAllowedError') {
        showToast('取消验证或设备不支持');
      }
    }
    btnPasskeyLogin.disabled = false;
    btnPasskeyLogin.textContent = 'Passkey';
  };
}
