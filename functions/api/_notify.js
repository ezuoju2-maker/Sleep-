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
