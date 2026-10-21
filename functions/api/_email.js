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
