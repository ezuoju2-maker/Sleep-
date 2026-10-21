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
