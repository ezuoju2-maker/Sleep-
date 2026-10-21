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
