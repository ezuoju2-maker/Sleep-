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
