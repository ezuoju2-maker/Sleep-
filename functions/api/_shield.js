// 风控引擎：硬阻断只保留零误杀信号（蜜罐 + 无头浏览器），
// 时间/交互/指纹降级为审计统计，避免误杀密码管理器自动填充用户和快速提交用户。
export function evaluateShield(shieldData) {
  if (!shieldData) return { pass: false, reason: "missing_shield_data" };

  const { timeSpent, interactions, isHoneypotFilled } = shieldData;

  if (isHoneypotFilled) return { pass: false, reason: "honeypot_triggered" };

  const signals = [];
  if (typeof timeSpent === "number" && timeSpent < 1) signals.push("fast_submit");
  if (typeof interactions === "number" && interactions < 3) signals.push("low_interaction");

  return { pass: true, signals };
}
