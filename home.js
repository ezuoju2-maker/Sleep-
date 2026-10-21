const api = (path, options = {}) => fetch(path, options);

async function init() {
  const res = await api('/api/me');
  const data = await res.json();
  if (!data.success) return window.location.href = '/';
  document.getElementById('userUid').textContent = data.user.uid;
  
  document.getElementById('btnLogout').onclick = async () => {
    await api('/api/logout', { method: 'POST' });
    window.location.replace('/');
  };

  document.getElementById('btnAuditLog').onclick = async () => {
    document.getElementById('auditModal').style.display = 'flex';
    const r = await api('/api/audit-logs'); const d = await r.json();
    document.getElementById('auditList').innerHTML = (d.logs || []).map(l => `<div>${l.action} - ${l.ip}</div>`).join('') || '暂无';
  };

  document.getElementById('btnSessions').onclick = async () => {
    document.getElementById('sessionsModal').style.display = 'flex';
    const r = await api('/api/sessions'); const d = await r.json();
    document.getElementById('sessionsList').innerHTML = (d.sessions || []).map(s => `<div>${s.ip} (${s.isCurrent ? '当前' : '其他'})</div>`).join('');
  };
  document.getElementById('btnRevokeOthers').onclick = async () => {
    await api('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'revoke_others' }) });
    alert('已下线其他设备');
  };

  document.getElementById('btnChangePwd').onclick = () => document.getElementById('sudoModal').style.display = 'flex';
  document.getElementById('btnSubmitSudo').onclick = async () => {
    const r = await api('/api/verify-sudo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: document.getElementById('sudoPassword').value }) });
    const d = await r.json();
    if (d.success) {
      window._sudo = d.sudo_token;
      document.getElementById('sudoModal').style.display = 'none';
      document.getElementById('changePwdModal').style.display = 'flex';
    } else alert(d.error);
  };
  document.getElementById('btnSubmitChange').onclick = async () => {
    const r = await api('/api/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldPassword: document.getElementById('oldPwd').value, newPassword: document.getElementById('newPwdChange').value, sudo_token: window._sudo }) });
    const d = await r.json();
    if (d.success) { alert('修改成功'); window.location.replace('/'); } else alert(d.error);
  };

  document.getElementById('btnAddPasskey').onclick = async () => {
    try {
      const r1 = await api('/api/passkey/register-options', { method: 'POST' });
      const { options, challengeId } = await r1.json();
      const credential = await window.SimpleWebAuthnBrowser.startRegistration({ optionsJSON: options });
      const r2 = await api('/api/passkey/register-verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeId, credential }) });
      const d = await r2.json();
      alert(d.success ? '绑定成功' : d.error);
    } catch(e) { alert('取消'); }
  };
}
window.addEventListener('DOMContentLoaded', init);
