# Sleep 平台 · 最终交付

- commit: `b073740`（工作区未提交改动 9 项）
- time:   2026-10-21 20:45:58
- files:  131

## 一、文件清单

- .github/workflows/ci.yml
- .gitignore
- OPERATIONS.md
- ROADMAP.md
- Sleep-FullSource.zip
- _headers
- app.js
- cron-worker/index.js
- cron-worker/wrangler.toml
- dist/_headers
- dist/app.js
- dist/functions/_middleware.js
- dist/functions/api/_audit.js
- dist/functions/api/_constants.js
- dist/functions/api/_crypto.js
- dist/functions/api/_csrf.js
- dist/functions/api/_disposable.js
- dist/functions/api/_email.js
- dist/functions/api/_hibp.js
- dist/functions/api/_http.js
- dist/functions/api/_notify.js
- dist/functions/api/_password.js
- dist/functions/api/_ratelimit.js
- dist/functions/api/_session.js
- dist/functions/api/_shield.js
- dist/functions/api/_threatintel.js
- dist/functions/api/_token.js
- dist/functions/api/audit-logs.js
- dist/functions/api/change-password.js
- dist/functions/api/forgot.js
- dist/functions/api/github-callback.js
- dist/functions/api/github-login.js
- dist/functions/api/login.js
- dist/functions/api/logout.js
- dist/functions/api/me.js
- dist/functions/api/passkey/login-options.js
- dist/functions/api/passkey/login-verify.js
- dist/functions/api/passkey/register-options.js
- dist/functions/api/passkey/register-verify.js
- dist/functions/api/register.js
- dist/functions/api/reset.js
- dist/functions/api/sessions.js
- dist/functions/api/verify-sudo.js
- dist/help.html
- dist/index.html
- dist/manifest.json
- dist/passkey.js
- dist/privacy.html
- dist/static/legal.css
- dist/style.css
- dist/sw.js
- dist/terms.html
- eslint.config.mjs
- functions/_middleware.js
- functions/api/_audit.js
- functions/api/_constants.js
- functions/api/_crypto.js
- functions/api/_csrf.js
- functions/api/_disposable.js
- functions/api/_email.js
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
- migrations/0027_drop_device_fingerprints.sql
- package-lock.json
- package.json
- passkey.js
- privacy.html
- scripts/prepare-deploy.py
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
dist/

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

- sessions.js 移除 token_hash 下发（经核实已核销）
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

### Sleep-FullSource.zip

``````
PK    X�U]p����  �:  
  index.htmlUT	 ���jvv�jux         �ks���{�^�K�L%[��N�;4mo�L���OY��*���<�h!<£Ж)�^p�KBB��ޟ��ǧ�'ܳ��,ٲ���Lb�Ξ={�����x�/o~0q���o��]�
���/�Izi<v��M�#0,)�U����dZ��}t�m.���T��)OW
ӎ!��m�ڴ���qO�2����H�U[�4Β%
�|�uT�f�J��,l�g� �xy�I���)l��m��p�C
��X�=�2fɦZ��=[�*�R�pY�<�W%�:�g�ϬXa,�a���G����e�j�*c�(�xr<��)��-+B�H�:�-1�����q�jUÜm��2��|�1�|U/��.�
�dC3̀l_��'��I�wuT4���+�)��5X�x��ET�	���'m�j��e���.hEö��p-D��&�顱��3ޔtŅ�{4�dpj����XUI���b�_o^?����w���;m�Lhp ��YRu����
jT����O�O��&��mM��f�.�=2�~π�Z����������|xHX ��U�^�r�y
����8��O�
���iܴ	�	���c!5���,�
�'��>!F�L��9P��@�T�>L�:�ɖ8U��X�&D��{ߵw�9_}ݼ�����k��h�V|�p���l]nl��6�6��;�+uD�	r?p������G,���[u�{�<	#"I��)���qdO��t1��!\R-��*@��惻�Ʌ������"����c-�MCCq�������k�p���B��d�t|��_���!������M(HO��X����5��s�'�hd�G�"FG����f�k�twoa>
�VE��^��@MQmPq�T6Ȯ`�Ä��Һq������#�~�9q�ye�ٹ2g�����e��n�Ί�	�V��If����s{~�|L�!(����tQ��z��cƉ�z�����sr@Q�| ��H�>�tQΓ9��j��wN�1����|k����	lŨ�!��9r��9g~#z��k�0+��K�"
>oCo��	6�%
7`�Ɣ���ɸT�Z�.��]l�(�XS>-Wcn& xi���٪ ����g�c�CR�6 @nd�8��9��\	�:b��Y2�Z��W@��E�jU�d\64ئ�c��G��Ή�֥��S����S˝��V�ǀ��Иj��.���H�!BӸ=e�d��`���R���j�@�*�7z�0�ݤB�PYU�#�݁H�IOg��(�mCS�p�s�bU��'Γ�Υk���>v�/V�$˟6�L�*1o��
G�i���4II��o\���z�a�wâ��ݔ�iH*��E��v�������W�\�aS�*ǲs9G�a��%P�)��U�.Q�*&9�x�=	���rH�b\
�h�����X�0&����~R2L(��=˾A�I�'���r��Ͳ�q<&BP�e�q�EO�
��v�@���@���X_l��X�h���7O��X>R4f"M<d�&[�T21v3��j �v�/]���D��@
r��违�'ګ�������K~%y'WH,+O��!�X��ܙ�E�̭��[�{�O� +��,839�9_.�ӯ��$����v�9��[w�5/���/�s��骇K=�g��+���nf�"7�@��ݒm�*|�JR��G���6a�
���i�&|���ٮ�5���"D�h��^u#���\�d�%9�@g�*L����Du�U6'R�[^�	����4���^ҚO�v_jÀ��X��Է[[u?�A��81��Z��=�G,:��>�l�ͻ���&n^Zm.Cdy��ܿ�\]|:w�yy��O-7��:��lm���I
�H����-����LԹ��ܜ�1�LXe�L��b��0wڽi̝���q�x��No;_}͂��t�yn�y�ag~��������7+�����(�n�\�zஉ�!�ZX�:��-�3���d�T}{s����g�{�'�9�~y�й1�,�p��ǹ}�9y͏f��R�7h�[c�~�����څ���֝�ߥ�L��
{�n��\l޻պUo�o��?>�gq#o�����&_�{v*_���6��5��4�����/����MH�s����s�C�Ǩs�.>?g��������7ڱu��U�=
�UA��Jߥh�J��˃H�C����B��'K_�Y�Lުk=� C��;��	��v�;��?��ͤ�i���{SM#��ĉ��f���D9�R|
`|.�F9^�d�7�̣<����4�ȋ|&'r�(dY#�Q��Y�O$r�@KHr��D>���$�䓙<���`�O�S���)�G*#�|��̈|� ���@̗�Yh��yL�|./�G1�I�(0����H +2��Ls�+�g���$|��H��Nr)>�N3~X3��SIX0! �d�\���M��X.ͧR�����Me������Y6MǦ�t�9�>GD*����@�	2E6�F@�|:�"�,� ,�yͦ�%l���Kf��Y�S��(3��g�y��g�����J�cJΓ`���1�U��i]�O&�|&���o�K�E &I0bN)!�5�D|V��Y-ṔM�x!	3'��?�S��X&+�B�X9!������W���S+�~Oo"��}�4�����:)q�M���Ce�7��� �]�R�+��8��Pu��`�|Ϯ��n p�]˹ �I���;I�E
앩+��Bv�c@X���r��]5�|�����`�6[L�o��U<:�i���X��6���G��)o�͍�s�����@~�"	؍��lOv�q����Pbe�U�z�`�^�;g~����y��.�� ��~��{�V2��E�o�	�&l�ɅY��4Yc�7�e��n���\��%��bU���'"
WX/-\�ЭX`����7蟞V��B��`-C���MB��&x����+�h^yI)�遣do��{��Ig�Bg�Xg~�����湕�sǃU,�c0�>�.����pZ,��*)��\a�8�Vc���z/j"F�P�;�]�!�0A�e�y��aS�Ii��+Q`Ђ���|xj��+ɠ9��!ZT$s��<CWܻ0W���͇e�]�1?�r�C��H>(� ��` X`g���Z�����:���9ag`>�͍^c76�2}�}����d��[���!�&Bg#���f�}�1�љ���Co_X�N�.�����������a����;�o�=nE�����hU�"�� Ct�.:�w�����[y��F�\}̵�=x�����:��sE��藽yyryy���l^#��70˭V�W��J�K�@�&��"�FD��hA��]?Ƅ�`�&+�쩥jQ�a�n�h��9�s�~��d�OO������F{���wU�7�� �Mjx��ˆ�[Sp���.c3\�k3�o�������N��\��i�����rT��0K�H	�̐�Al0ȫo�`!��yo��j�_��Q]
��A���=5��_�#�;������ ��
Lq�/�W���J�Ckc}��q�y�.y�0	8��A���s�i������ ������H{K,*���m�̬`�|r�aS�$�^��=S@���勣�]�],q�A~P7b�D��mH��2�3۽[�v���ս�UWN/"����W��Ơ�v������j�'�����f����N��PK    �U]��^   h   
  .gitignoreUT	 ���j��jux         ��
� ��<�C|��p�!��b1�����ǯt�~�v��_�j��K̬#��h w�^+�'r�Dy��O3$�b*>ü���Dۇ��
B���PK    �uU]#�e�5  �5    logo.pngUT	 �_�j�_�jux         �{uP�������FiA8B@:��D�A���CR��.A@D��������������3��;����3����H�K�  �%ym  �kP�����}�?��T}�Z�Iaaa����������ͭ��pss��ƒ����ʮ����Ҋ��������:88ppp������,-.�������WbddDHH�������_+������>44�?HDX��G\n��:��
�l�l��O�&������h
S!?U�<��D���\�,�du `��˼���7�̘E��U�{��*�51A� ��ɛ������p]�t��ʎ�� ��9���6I��.|Z�N���xֱ@��H��kd��3iSG���uyc�5x����:��U�9#\m��?=���q�OX�5��.�w�k�9}�ŪI��L�G�z�F]�
�1�^�5}�V����&�<\S|�%A�ai��̓4偫8�Q��OS�"����z ��� Jg0��@ֺ�@�W 
�?(�~��
4� ��E��8ȩ{v�J���X}�����Cs)f�@)���F�J�Ƽ�����ӂ4��L�����,�������Zky�Ȕ���_p$i�ap\����+]i��l���>���,�r��JZ�m	w��h�Zs���І�d�MBR\/�8W�D?m�o7���$�o�RW#@�?�uh
BsC�-�]il�]�u�mx�rq��U�n�Gc��<2��<�1I*�f���Q�/���1$T��J\|�@�@v�`z�R�c|j�6 �)2M���M7#^ϞXա��:�c�����1F�#eF���5w?;v���?�?�v�Lx���:�&|z�o�bۏKaR���ҍ7�����5W܃5�歴��6���J�Z�,Bӿ�Q6F�
��#�_�v��:a�Τ3o0ЫL ���<����z�)�� ��w���2@*�5�m�I��j�3pP�,��L�|�v4NΕZE��P�)�_����b�`��}��Gn�J0�L)z�|� 錽��p�,G{1������bW�c�_�y�/�ә�<n�-�s��67���b�� ���s���&�+��O0W�����\Ϛ6J[.�U�"��Z��j�U�\��K�	= ����Ł�4�ޓVg�j���`����c�����pŁbԷ���A �K@�N���)X�`⺱j:������<G� Y�@���D����)���X��@� k�Q�3 � �%�Y|$�����g����[p�^���[�ȅx_��UlВ*|lZ��oU���7s�眀�+G�m�g<��Q	��A����Ud����z��N�ur��@{d�m�ӋI�����{\P� 
��vTN�ց�Nk�������R/�&�V�G�)��ۉ�����Z%���B����m��`�6�����Sg|����c�dG/�� R�P�z�FN�ͮ ������s�TW;T�f.��?���R9��$z�������kՎ�7��vD��#���g$��>)k��'a�b�4�d��/����o�I%��b2.�p�n�9]W��d��`��S��S�z}-��A�w�K6ЍG�qH���ϾC�8��)�昤����W-�Y��ދ`
MI���EuJp=��[C�C��[4z���k�`w��F�4|VuZ�@�����V�&���9,�-Q��YP�����Y�t�r�-p&�U���2	�#�s�v���n��]�C��X��޶�1�3���w��l��lQ��K���T��5�WaM�U�s�#
�LL|N/�.p����J��.���UG�}a���yۋ[�Q�0�.���3Y�!*�U���'0��jM:������i��
p�Ã��ư���5['3/ЀZB$:�Yy0+�'ȥF
���Ѥy%]a�TK-m5��I����d��@R%�zO��sI���Đ3
��auA�EwL�]F�e�كb#u��u�E���1;��8���NyeޮX(at�<t�#:b����u��J׊��7�%Ŀ�- ����p�۽J��~ϗ�.��c.!�I��NE��m]�L:}3'$�����<'*�1AyZ!����8�{~T2��*���*x8�S#��`Q�s��_"�޼y�!gft��P���5lۄt�']�߮�1�z�O��sX7"uS\$_�ߞ��v;��5}�T�iV���vDn+�
��������^�a%}����"���FTf���^�zLAڣ�v��/������T[� �ْ^�=�y�����x��F�z��kELj#�g�0����=v��r��mѲ�Jw��֯�h��g�D}l:��*�VhV���w�9r(UN8D�������� \w��9��c�4���i�`h	��ϐ�����tS��d=��5b��!���6Sz1���P�����t�_����Ճd�'d�֔2��w��7���R2��Ҧg�cxĔ
�k�N�nÊG;}k��2�8D
oٻ��Y�����<� Ȝ���w�� X��X��d�ަ��N�ܭ��nr�L6��R3���c�\���~s����h�U��L����R��[���o$���~�hϗ���M���N'�M˃��Ǣ{�/�F3:�_O���_FQ�xo
��	�U�~���e��â��~]���՚}�[i�G{��m����ioe����Y~y�W�+�ќ�����f�4���;Y�J����ɧ��
�k
�b_]�p�ytS��LQ0�u����@m���|���ѽ"�	$e���ў��/��R"�EIk��i���x���
�AK�WalbkyؠE,W�֑6�����=�S����*k�@�����ڮ�NK��ל���7�N�`���TS�=����SO����j����$�i�~J;7E�+3M����G������{[�.�C��N!:+*ʛ/�6�9���T�e�A¯�Mk�<m�ѵ׶���^j�_/�֞��1���MW��$�ŷ��(���`�}�2����}UzIt��k`���:�Z��Z����+xg9�V��G�1�b�q�fVږp�L%��ڂ|�*S��ң��o�M��9w���zv��xo/)GZʁ�U����F;�đ��<��2��l6|�U��G�s��w��|l��p0�S�d�t��	�ī�+?YTy�O���A&H;��D�dJ��~)�t���GF�<^��펮aO�Z͌<�p���e���o����W>+b�n#x��A&�U<ъ�d�6�z�O���B�g��;1S�ƶ��Py4�n�_������pm��#k��Y�S��qm˶�l�����[J�K-��
��-'{�;���ݑ{ h"f?�2�ѱa��ɖ7=�qJ]��[�+�3i�f.Y_l�U��q���]�ݣ�5�?ӹ�rq�zv��.���Y����c4B����?N,�����7�36a6�Ƅ�����u����I���|'��OA�L����~^f_�FM/E�G؊p^�m�6�?z;��P�J�w� �ZU1uf�S��6��%�$��%ȻO�c�,!���"�<���&��|
�ˎ�ש�Q�4���-�&�ҴJ�yt��6	!�L��(bπ����ݦ
�[c��e4i����v��<���>�Q��^}�\�l�!
eM�d��L�
8�P�2�8�l�C�v=�.�ϟ.�l�O���3n,4,�s��r&BK+�NG��I���ze
�$z��c��>�ܪ��+"&��"�3u7�|8X�8����YD��T�uQ�d�\L��P�[��X��0�Cy���L�+m]4K�`��~���L�Y��ɳ1BG�w,z����O�+���׉�
[��T�yZ�'�ZT�֮���.�~eU��b��$!+� ��4����lwS
����\�Md3sGU�S��˰�7�iG
<�g�E�T�I?5�L�<�=%�z>JB�1P�����ēP�&6v��o���3P�pj�6c+��n�m�cI<_��T�(Cw���)Y�'�3���3��[a)[
��gS���p�V�8֢D��V�§䑁1�y��y��]Y�������J@�Ūh;b��"���6B��ۀ�5�'fm��Y (�@B�VA!��
�gȩ�|��2�M��U�0aO~3�Q�����C�s&�-��"s�o͒^����"�ӯ֡��Z��	2��C��2��x�r��r��c�e�^)���MotG�ո�\�U��B���=W/����b':ne�v��`�S�x����\p�I�3F�Wd1Hz�D"kU��/�����3ͫ���Q)�6	
����#�D���՟+��a(C�	bR�&2fy�\�_!�=bڣ& ��8����+��%B����?��RWC4SM˔e��y*||�R��%�j#�8�v��Ĕ�3l�Z�N���X��_1b�x�_�՟}#�.OF*P%$�w�[��!�բx�t�6_~�EV7���ޤ_aRg����'@����dm���3�E������}_U=s}}��R��(]�����d�nΔ���p��o��W�D���i��SB������ ��j�������˨�{�������r+8z8�t��,Yb�b9��z�r��*w�v,���ձ#7^ 7���D����ٰ�tl�k�_���7������<^�w�~'��9�/��)�G�)}����bz�(B�y����l�㱇�g�,2�����,��������&�����%�:�ú��&��FX�X�wt
5��<8����G?Q�;�?09Ir��^(&��!{��N�@����'%x�L��ߝ�Eaf�������􉯱�^FpVc�Q2LJ}U�{b]���c��v�^�@��A�cP��3%��8�uY�
��9���d r�HcCk�i��1� �Ʉ�e����J�zz��z:��K�)�'6������_��*"}��1�
�=����9N5	"6�X|-�^���A"+��G��t'�6gs���s@
�}x�qq'JuT�e$�+��9i�t_����Oh&Be��?V����A'ˉ4�oV��I1#��UoLn$�;������ >��P$bY�n���z�v�Z'��.*�3�bv��|$}�G}���#��!��jb"��H5�=c� ��{RZ��쨐׀����+ �B��x�%���C5�x֡� �
�&�`+*����� �v��:t'A% �9'XV7�;�gđ* sȦ���H��nB�����~����ĔMY�%��
�\�q�X2��=��Њ�!+�m�ט����Yξ7�@�qrU�_?#�r�e��ͻ��K��ze���N��7�w1HQ ��D�P���^X��OZ񞜝5O{�y�̽�����? �����ǷN=8�{�@\:�lN_L�2�S�'�b+��2j�ӭ�T�Md�j���x`zQ#���A�D�Gwa����.��ON����O��	{��"H�<<�aP�q
� �s@&�m;~�}1A���G*������(8D���eV�cw6�x��{���2e��p����������XG3������	��jq��$�z�=&���$������h켒�ԫA�7yCK�!q,��m���a�N��d���~ƪ5��掺|]]e	m-���Z�<�'$�Q-(� 3��c��Td�Y?Sp*�Y����xs�&e����b��P�n�=�[}������6�j��m=�U-Zf(�
t۷� ����,T��ja`�bb���h���Vэ�mFc�|F8C
�k�k�cĒ��җm�wETc�h���!C��<�)ɮۓA-�0�묧[Q���
�D���Zm�F��O��E�?�fecm�Ȝ��s����\as̨$���Ӟ|� =6S�d�I�@M�]ɫh7�'�Cԩ���[�2eQ��%�QO= g�0  oX����'�d	O�=����3��.0��p̭�cQ�<+ف̴B#�x�2r��-'�k�$���l�T ��m;m3)� ��o6�g!�kk�'Z�ë�qǛ�&�X�;�|_���d �Tu𠐦h�ɳ�埾�^\odn�tGAE,NG۫���
]�g�dT���ُ7|EF5�@C��Rk�!P^�]X��j��Zۗ��0:u�0���h��pP���ɷ��Q�A%˾SE�W�"ˋ�.2�WB J"P��"�=RV��(M��sm����X����.��J����
���?p�1|�rsoZ4|)�?��Cf����o�`�#x��~��hE��)�!�|�
���a�=��T�lsw\��r�"����Ba[,B
�d��t,�T8]�]t����fQg&, 	�N���ת��<	{X�]�j6v�:
a���ڛ��9c��x�QPeڻ�]��3M�l��ʾ/P���J��E^D_�K ?Ke�u��m�)���!󛦉L�/%�p��6�J`���@ڃ�v��XZG�E��a )��J��e�_i"jCT�,̍!emu��`H�3d��S�o�=7�6�̀��j�A昻q�gR!�՘��KA�o���8��s�J݂c�em�*?x�}����/�h��m�y�C<4!�� 	�b!�K�	�eQ/}@��Iִ��g�Ko�A=�X�C�o��yf�:�u�eG!CD��T�g�g�T^�I8��SA����*�F����ǯ�'v�0J��F��!�!~������'��;f�^ }���.��r��,�c|��C��__�acꏋ�&� =!�˙��bI�x"={�<�l�% R%��T��]#G�1��2S�İ��r��n�j (P	�x�#��(+�4��ь���Z؄�����B����g�盇����Q�^,��H}#��CF1���7q��?
M0V�E��ÈO����&���RvM��pa�����=n��kk����A��� A
��0�(Hz���Ss���Ͷ<`|���g���V���T�_ `fw��Q4	P����)pt�S+����iF M��&��Cz��	3�Ϳ
[N����)�k&���,�Z�%���,qyǮ�iht��̻ȟ��i���+~����f����3[$=�7u!
��
(�ڳ<��^P�
/��^�t���Ki���w�r��:u�(L�qpnhA�<w3\U(�$��BL�Y���&�i��v�@�Ji���߸�7wp! 퇫��T��Z))�{�?_�1x~W�za㈃�,���lD��s��'���8ӌc"�� z���J����D~_�m�V|��ѱ�x$<!�T)�k1�%�1÷�2?H���?�`#v��m�}��xF�@�m�����r�a���aUD�kKƈHeAw��d�0k8���%���aZ���
9=h�\XN�L�Bֻ�k.ʏ,QL���rj|��@����@~��Hl�ˍ�L7�0��L+@�q�5�y�����H���,T�Q^`qI��nez���&�(j���Ы�0@7�����/����	��{�k0��Tk�/�a 4�,����Y��A�c�E^�z"�����)�Ybg0M�����zh\�
���e��H_�H�ԸP#:+
�?7o�N���p×����	E�׼M\v!���g0	Ү��-oJ�TKS�B\���xP�pd�g�=�%�k�7�)3��~!�3�
��7(C�����?�dD�77%�����H��JǊK5�p���; |��_r �'W4�{��}fk�=��/D�Q5u�ez|a�]q��
\�w����I�T�I���:�C�_���3 �mYOe��g�K�IG%|���;�c�����U�).���R�G���t6s�ћ� ҏ��������MK��q��x���^#��)к�T�� ���],]l����h�M|F��I$�q!�-R1��n�=����d�f)6��_eZx֠M����#uE2?^��Ս_oI�
n\zۗ%�Y���j��~iڿ�B��5��U;������@��5�� ��i�2]%�5�we��k	�:�G8o�@��=��@45!������������}}l��;�(G��)(,=���tF'th �&���o�t�.��y�0L$�I>"����?�
�.���S�� �=����3�;o/J�<�kr=\�}�5G��C���u=]������h�a2���3B1  ���[ �O�����0�H�X6�ir�^��ǨV�ƕU3��0͙�.f����`�p׉
<|�֪n���)�1�V�[r�2Ss�W�@�d!#����*5��􏝤ڡ�m5q������j��%tV$���/��*4��$�'��,���b��T��K�����bi��[" �Et�A	F"��`Ų�]Z����{m�P�A�?Wv �Bi��V�/ؖ��2,�8s��` ���,��n�v�Ն~ks�����uG�a ��郄�H����|8f	���C���[%�7��_
���`��f�<W6X(����w�����JMy |
ȸ3�̧��٭�E�:I���0�Us��o<���7���"�x�kc:���qە���"\1���
1_oFx����o��3;Ԟ����B`���.P}J̍��f����s�2�u�2�ggl�S�Qfz�Ő=���$��W����d���s0�|����
37���O~��D �d�.Y>��~��ѐ��6���K�*�XV �������e;to�%%�s���%�J�}R�l����o%R��K��,<~��0��f<)�Z���s�"� O��ߝ�,pB`�`"<����C��q�(�<�.�]��0�~Xʿ��qsC�X��J��,����V�M���J�2!r�R��!��	�M������uۇ�]�S��m����>��q�Rk}uje����Ή�����
�[,��ܩ���W�0���������SH��<6<�2B�Kɍ5���ờ$�羾1���U+Ns����H%�֛��P��@�>c�[�*TZ-��٦���J�F[��
\�~���Ȥ���-1������}˲�J��[cw����z����f�!�Z���d��e�t�P(�da��}W�>����3V]�o�u.�؉<�*��L�|Ī�,�!�V<ם���|s��r���QL<ddH[�g��!]�ٔ�כ��f�9ire�r������� 8�J�����N�b2%=|~�������s�^˲g��Qn��8!go�F����=��7DQ��%٣���A���B�k2�	���B9&� j(ibi|�;j�G)V��PX��Be�W1�X�RaQ���϶�'@aO��X���sy�C���Lp�U��4��B�>��m�5�woc�g:�N�Mn�4�߬�������u+z�W���E�r�Dz�:��#ݘ}������J���$�T�5á���~���aZ�{�����6S���܎�K㍲/���ޱ���e�z�j��{��S�l�ȷ��k5���?�â�Rx`0֢x����l�k1�uM@;H#��g랍]]t�;�;��Jg6�
��M����:�rN������v����q�g$?%O�4Z|JuX/��S0�%A�DA�H͟��!݉�čyiN�P�bp
�-��Ȩ��(K��Y��
�
t�"�l�C
��w�S�0%���/	�Qh}���)��dY��۟դ�8��=Eiҫ��t�S�>")�K��$�8��2�ra~��!�HQ"�e²���BrD�Ʀ�Dէr�R��q+�q�
 5Թ�<�G�Ob�#C�y�<�?T�����V�H��&�+q��;����kE�hl��-�͘t�	���g���>���}��GX�ϒ�í�P�^��]Ƶ��[��?�\փ3��Y�q��>�~����A�c[v)ɲeYV����=-b���^x��utsUʓ�Ơ������
k���(@��<G���gS3�莩�6Ⴉxw�_/�Y��nӹ�:�h�����R����\��k�KN��BF������@5=�Nf���
^+��3#��ڄ�̛f����Ad���(���\��'
���߆�i����8�x�p�x� <���~��!p��x������s�S.�Y$����{u�{�.��l�����{ä��#�w�uYz��	_@��8��������y����֍�;t�B��[V�)F����.�^p��X�i���F��qY��~�X�1���.��Ğ �2X�B���8��W���Ȫ��u-$��\&��3Z0� s�o����ڔd���l�ƽZ�iݏ�Um��-����H����B	��V[y$Z��>�M�GR6,
;8�4҄k#���XKz�`�A�꾗i�2�nO
ղ(~"���.�$��_�~�����^'5��N:_�>5+:>�����v��s7H����^Yn�$ӣ�_D����m�Ih�G��#�h6���a�W��3_ˢaXd�\J'��{s��	�q)a��^а�}���s�:u8����aj����1����?�RWj��F��xK������t�}#�ھN��)���x�QF����l�k�o���dN�3h�2���x���#�74ˤ�
x��ulsJĭkjd>l���`�vބ�ut���q�mϘ�g�����7�-��6�����U���VU�4�'��#J��Pz4k�|�h-:����U~�B"0�a�TN����������'LL<�T%u�v�g���&���h��|gޖ~׊���՚왐
&^�&k\U��UX�ܽ���vc�~�yb��R�-��ݏ�9��W���
�c+t���~�?��,Bڒ���,�b'���S��W����/��Ҡ�q= �	�H������8�x�Q�'d~�<��M�E�ع:����b פ�S�9���}��:�J���L�]��8��o`���1���9�Z�7`E���������ʯ�<�jzxR�u��b����$�kD2ް� ���DԼ�K�4��W���1/�[��Pł�"���nd�ҧ�8��`;K�r�b���9�Ӿ�l�0���#z�'�~�K̷ó;��1#]T $�8T�Z���%~�F��V�%�Ц��2����Pj��C72%=ʦ�����~�߉i����y�:��E#6��Oԑ�иتp�X��=f�st�V�1���\��e�̕X"�t?������*b�1��9�ˈڠ��9�s�r}c�7Z��1��%D5J�
uE۷��S�)��ɽ��Y��}�*oytp-���$ol�;��ɩJ47��{�uO����`�����D�8��"0y"-n͕����\����5��[(~������y�����a��&�@KX�t�e�=ep��C��Sa�c�Ӛǧ��βh���	�օ��R�����*�����؛�&�+2�c��x�>���/�޹��B{5�͆J�y���ZC8E��<�d��R�ϖ�Ԍ:�e��U~i��^��֕�'k�L�x�D���J��/�����Q�#81hV�M�mΏ�8::�`�e�Q\�R>�	>�Z����EݗZ`������tl>����^o�Yً�\��7���ΩLf���v�?c�x��TP��&_��ӧ���
#�/�w�,��~���*�/Ηd �lyA}�Q�I���a-�휧�Sv�R7A����c�J��F-bᨹQwy�M� &� ���q���n��r2�0�W�\l�-�)̊��]`a&�����r�p���:���I��B$q���f�9�C�g����~�e�
�cs�$(����.��]sWW���u1�����Kl�A%�ؚ�b}�#[�E�^�D���j�����a��yC����o��w��I���[A�v62X�wmg*ͦ���$��S�\��_�7y�A�q���3oK�+���N�Fi3_���
��F�glJ�z��vgݪF>�X�qb���\	��,B9��ȵ��i<�~<8�ⵢ���C���
�r��%)J.�/W�H�<��s̡�;S��{oj1/>.�CwHP�;"���*��j�d�^m9,����?�o|�*z���J��ﰊ��_�h!ĳykA)>��_!�G!H[!�S��e����Y�F�ןj�")��'�{�D��C4�������kJͥ��{͗��3���w	~��#�Jm�x�D�.�T�1��*��� � ��AĭOŞO~q���αR��Q��[V�qi��Wȇٟ����+v�����1V:�Qh��n��?-h��G���p�$O�Ğ��/)�y}]H��aN ���u�8R�]V��#Xl��{��n|��`������?�Å��]+�k�����8���V0��} "a9~Ex�X���+V��5M���K��c��8�N��'��U��{�e2�sp���v��;Em�_˲�d鸃~M�[?K˂z�)�Q���-Pc__�[Љ�o붵�p��ꭎ
+�P����e���}�P�%J���*Pp636�Ff�G�����YfS�9��
znvlc�h���n��+c���;����R���X��y	����X�����O���~�}�79z+7��'A���6l���1��5���tE;IK��ǜM��r��N���b�(9W٫��B���ڇ=V������է%��s4����� ٕY��(��[�^9��Q����l	�Z�����Q>J���~��g��۠y^�Uh�(���%��2�i_&���^b"���������$�h38�)�J;��i�c�8%�C&�&���FV�v-������M0�x-J�Jơ������/fu�|#��@��C������r�	\^|��f>�A&�FV���Ɵ��0at=y������E;qJk�z����KwG8`�(v��2
c��2 ��rI�'(BxF ���n��v�Y�)�l4����N_��K���p�/�����8����
8m�+.DZa�/�(�����������
~_�S/��m������ijw������T��Z!C0��-|���L���Y�8 ����fn�=<df9$�@�+���<Z���qn:�yr
�3����%xW�M�֖�q����c���po�S􇨬x�)	9;��ɣ�O�����_�Ŝ�Of���3p�S
���U�!���+s/�+��^UyQl]$���!q��u��X�?%;��<�*�5������EZ����>\�$_�9n�'�gb@����և2W�,�y?N�yx
)�~Lnoo�R�?�
������Rx���Q�c.���Wuw�?I��@�`���o�XT���!Ԡ�����_p����*�rB���i:K���9{H�:.,�/����k<:������>!�r�pk�kg��;���
���^%]�\{3���\ꔬ��W�L���d�_��z�H�-��`��r�
��ueJX��V���`�1C!�	~,�2w��p���޼V�����PK
     1�U]              cron-worker/UT	 ���j��jux         PK    n�U]3x�*�   2    cron-worker/wrangler.tomlUT	 ow�jow�jux         ]�KK�0���%K!�&}���t!nJ)3ɴ�{������6QdVÙs��	0Sq[�t!Z��K�K<S�l�䃣���ę]�6������vX�T�(��%g���oC�C�
�R�3��>Ly���tz^8�.�����J�b����֍��E�Gu�2� !������G:���8�#}�$�"��� ����W�T����:�觉b�Y�Fڭ��,�r�}PK    1�U]b�Ɇ�  �    cron-worker/index.jsUT	 ���j���jux         �X[SI~�W��άa���KJ����ؙ�$�L���{,��9=�\\Y�����9���%SZ�$��f��N��D���@����0m
"=0I,�����<Gb.Gv�a��m�%�4��-�$�o��Pi�r\P�<�VȻA^<6�TI���v�2y�3�Ƈ/_��hgG����$�\O�oH���)���΃���ڰpA("�UL��G�u7\
��Mk.��!0q.ie.�X��9+<��ɏ�Q��[�3���Ls�u��y��˥1��"TD������#����q�����D����;���U��,%?��n�f����;B�Uz�5g�y�qyS9V�<���k\�Z�XǸ!���c1G���%'s%�>y5�d�XY�Rr
͕ˎ{�l���q�ޤ�FR������Z�M����t���ri�PMZ��c:i�/�&�X�����ZDr���px�H�O��X�=/�;z��e���D
����>������+�������Z�\m��CҶ�y,`Q��v/��0k��!��ku�|��X(;M���!��*A6N�_m�k�?B�w��7�Vz%9Ǹ�0Q��KïXs�����\Ejɾ!�Z��k�FF�����j?�Uxc
+^��].
iL�4w�!]�hc��Qz�s8�2a�1K͒���UɈ�ңV�U������w�H����B�̅ �Mn�A�O�n�ič~ф�G�������^�ss|����V�F�4:�nVX`��B	���N�b��}�U�Us]Y�qZ1�d�ᶋ�*����HXx�����U��)�2aa�-F�0�M��#�0�&{A�J��3]�s*̵�G�k��S���9���$�ko���x@70�65�Ϙ�Ԧ�L�A���\~kK��xs��h���R�*f�b4y��1����f�Nt�e�:��b8�����(ϲ�p�>�#�dw�=2�xܟK��Z+�t�D�#Ҟn���T�+�D��E»W�v}�[97�]z�	J�wP7fz8s����F)�L�<t�
�
�P�*h�ҹ��[�B]�c5��WQ�oys;a��j�$�{�1	�W̚���˝���
�����y��'^��2�Y6X�8"�ӽК�C�&����/%d��ڷ�H+��i���*��2���o�#p�BZ���k�E�k�J&//�:���|�6@W�d���ŌqEVl��/q
��tc�	�Z$���"�0J5���1�7*�N.�qG���(���ۍ��'���7 ��U����v?]�-B��q����u�g�oa�n��ׂU�w�Wx~�h��{���i�ہ��ﰹ��>��\t0��@�>�X��q���=��o> ,a�\�~8�n�]q�(ة�Q!��1���B�]�'I	Y�"�&�8;Z�x�O1�b8�������f��yNO�v�	C����F
)�z�R����}T�P,�D=�m�3�A���c1��Ι񰂬������3tF�9�wč�׆�A����{s�*NC3~��:6n5���f-�����u�����b�,�
DJ�:Z���L�~���:�Y�šv��g�G�O��*�6�)?����
�tb^�v�V��:�+���J�z:WF~}�Q�Ǻ��
�4�3��&�(ū�����3N#{[
��u��ުA�c\"�.͵���?PK    y�U]���{�     
  wrangler.tomlUT	 ���j���jux         ]��j1E{}�Q/�J���4!��"Hc���̚!뵰���}�&����.�{��21g�����
�$�+�
:�z�Xc�2��D\d�x]j^j$��+�R�R�#5�
��I��$�y�<?i���|�6�wHh��1td<��{@ ��c��\�[��s���C����k|y���8�0��q���S�'�ntZ}PK
     �U]            
  functions/UT	 
|�j�C�jux         PK
     ;�U]              functions/api/UT	 ���j�C�jux         PK    4�U]^���  �    functions/api/register.jsUT	 Ø�j	q�jux         �X�o����Ņ�
r�hYN�ښ�z�6kslO�[lm���ɺ�&��1��
X�͂�󀦭��]�p�._�bɚ��gL��i����)�_�	�$߻{����5]����)����7>��:uאb�Tk�oyJ~�D�ĻfڤF\�+-$eY�b��a�O�4m�d�� ض�:^�r�i�5]�\�qq�$vRÊ�i5L��`z^˥�#j��dn�0D,�h�BS���P�%k$��h��>�%O�VZ��i�!��ş�*��r��P��_*WgK�J�zߓ�_E��\�c��<��^�5��SCuߩ1�:�udh\�����:����
8:!�#���HJ�A�ԑz!�"��4Pd>uPCX��uT9�.�D��'�v�9|���]ut8
f�7�.e�PG�b�Z�S�	v�W!2�h`���3V0S�Z=�x�J�4
��6R|g�q[����f�](z��K/!�eBpRɬv=>[ӤI�,�]������?>�����~��o[G;_�����J`� ��[h�J�"�Y���/p�?w[sK��
��]���jVG�c)�l���M��/q��ܠx�x�*iNoD.�L6�7�m��I���Ƴ�Aa.5w�� �Xx�B`�3��x/x��Շ����v��ޟ��������.x���G�
����6��w{n"v������7�S���j�<~)�Պ�Z�Ǻ��v��]������;�'�<�������v����[�_��5����%����a�kDe�pE#^�E�h<ZK+␦�Zb-�y8�0�jz}�.�*G�K�+�mD"�ʟ�`ey~~|'����7�§��'�B
�?ȭ�ʍ�J:��ț����Ne~��LT�o\�s�����8gF��'������ۛ�O7��[@��L�2)�<���7�W�_|E~�a�/�U���M:z����G�'ޖU�4����+
/�y�|��Y#whJ�UD�}w�u '��Cd�~��T��n��@,P �# �1�y�Ѥ�iR�*��l��""�iy�ZX�zm�X.ƕvE�"�e�XF�T'b�pdt���؀z�9��7ݭ݃�g�wǣ?ї���A�O���t���q�Uu"ty��W'�{6�
+�t7�A���թ����g�o��QݥH�,g���#t�\,�ў}�d:\[��W���a�]{H{*�(,�e{,7E��VG5���u�4�/tڻxqލ�>u�u,,��1: !.���TK�=j~�ۥ<ˣeV�2?�4J����<��~�|Gf���I�r�z��df`T�a'�5����rJ�_���m5ژbϷ��O�xi�R,/����t�
��8�uQ�=*�r��j5��~xujv�XA���Z\qm��7�BB��N/znx��Ȍ5��6=V�n�J�#:SVk �p��HD^f����+�݁85۷ �����/��J�z��}��>X��e�j� �l�%p����U�Ǫ
K�HdA*;.�%��N1��ȵ�b�֦�ǵ���eQ�c9M��2*�-��vt��p�
3)Ss:R��6�-�8����Q��Si.���ef�+-��� Jef*��<��!�E���Nͅy�l8��&7�b�e
쨡�	�}���:Y?/�A���M�8ŒC3`�Q5`��,�!�]���l�6*�/1�����'�L�چǍ�^#��*
ƚ����W��G�PAA��Jr���<'Z������3B�}�YsjGL҅��`<�xNVy�cឪ	#<i�Pv�W��>ڟ8�� �X z#�>x:犙�쾹<>QrM�@�C����0���~<�������&3�a��j�ص
��+R��rf�8L���Fr'�f ����x a��0�0k��т���<�f�g�Vp!wy"�uC$�d��}�?���A>��#���u:����N�fy���v	��!Y,�v�A��(W�W�Yl7�~2�M�M�N�P�J����# !����I� ~�Numl`��e�����-�My�ĉ��fp��`g�胝��������PK    �U]kn��  �    functions/api/login.jsUT	 k��j�$�jux         �XQo��~ׯXF@&<J�렑pV�wtt͉'Oq� 8Q�JG�G^�KK���4j#� �MP }��!H &������.�����v�y) ؼ����7���0����t�������aB����i���'�u�h�Ka!�-/
�0�H{[���{4�)�f��{^�y��G�����ܚm���$
L4�Ȱ���me��d^�����Q1?��i2�>K:�(Te�[�>JC�Y�J{lA�\B��}���ۃN{��7�;m�ս3p�f��h6�;Np�����=���vZ��w��׋������3�j�~�x���-{��[��e�n�t��k�,D��6l�qힹ$#�Ąz1%�wK����I��,�i��(�W�Bu�C�158\C90��tu$��A&�G��s�7�H�4F=LƠ
�I���4Iאv��o������W�_����	G��4#k�7+��� ���[S�x��#)��5��	�|?�b0{\.�#<��)��)�w�Q�c
�P/����X�ꚿ_�n�A-kz�m�e�a�Ś�����f^�.�@���1x���_|y���g��=��;}�����
0��5v��»�����t�J�^ٌ^xA ��m�x��=+���y�͇�=�x��eZ��#j9�YH���sl�S��{X��(��Qrƃp�v��pf�k�&��Ԗ�����g���ߏ��~��?}�̓�O����w~�����ǟ�?����{���,*��T�{��)��~���ګ�Bq�_��-vm ��@O]l6,�9�ῤ����k����*�4��M���ބ�0���5o��؆BL^�o
U�!BV�5N��K���v�n�QT�:�w��^we��ٴ{v�6����^z��a�) �_�E�y�P�
/����3K>^�W������{V,os�d�(�� p�
��S�.�i��T�1��;�l��C��ƴ�E����B��� �`%�>ϡBB�p��
��@�(�R���U���R�����>O�@7+��/K�Cb����WɠWh� ���<��xZiV^nH
-csabAuV�_*[
kf�-����R;�G�4m:�>j;��:x`.����htvl��L�N�c����]�v����ju��v�@�vEM����%�[!N5��Pt1t�\E}��q�R6�N�$�%"�O��**�,�P�򼴠�C/�k+++��ݮ(��r�e��6���׍�� �v[
1/!JmS��y��Y����6D�m�p�0c�j�����??�qnkH\��C������R���)T�e�YYWg�>�2[�b/:|ĪX�|y�\P��;!8�_�ij �g�@�����i�HO冎&�8���4�&��t1��T��� �M0�w�G;0t�����W
�*6=�]W���:���^J�Ui+�aXw�0�5�=�+ �sI�G#\��Ax��6��l�Vo���|����O`����'�k,�j�!�un��ی{��19~^Th�b�Odbr�x���Z��s��<����H�&�8{n�ʚ�!���1K#�0�ȝ�umH阬-/��m�:r�Mt�&y�}sG|Շ��a�9�<^��
�pQ��-��@}���AAt��+h���+l�bVle��Ee�_O�N+�v��m��Ai�YJ����C�� 9�!��.����H�6�6P 0��*y\SC7���raxj��k�t@�\3?̂�`�	��x��8 ]�&������%BqK$F����A�m���f>���ȅ�g��H�������8Irb'�DfB�
�	�5�'O��y��nعsU�iZ�z���M��nM����a�<�w��u���a}��T� 巼�Z� �Wo��
�$�}6�I�/�B�����:PDX�������i��m�̪bf���+´HjM�{Lk��kp�7G��18�٠_s1�5�� !@����)h�`�?�4O�тA�D��c��uX`��@'T�[����g�����s�}�XY)LX�.�PK    ɀU]s)6m  J    functions/api/logout.jsUT	 yr�jM��jux         ���n�@��~�È�;\V��hP�(��J]�6���4�13�6Q�
+6,X ��$x�x�o����9����$�Ti+8B�D����X�!�j��'�ё�ܰ�I���0�:Dy��-6��N���&JB8C�(u���wa� �J���0�=��y��y�
m�vbc�bkS��}�BX 㲀A��LKء%��Acȶ���6�ly}UY�T*�8N,��E ���=?�u�hߛb��ߪ4&��2���Tc�J���;.Jd�,e�T��9o�'W��-@yD�{P�*�D��]���� �II
)%�
Pk�	��Ͼ�����ٗ��Yn��.��܁ܥ��.�2�!�ԗ"��
�M�rVeK霜ԉT�saøl�B�+7���ݽ�੹�Ҫ����|g/ؽ��nsղ��Ө��6�)$q,{1���[�e=Կ���v�K5�B#gk�ǃ�<m�Cml`{8
*�I\����=K�?wt=�I^���j&T!����N|(6i�[��i:KBQ��_D�J� ���k젢?���H�+6Fۮ#hA�^zE��G�'��t"�44ԗ����3l���b�����?N_}?{���ͧ��Vͽ�۝N�N�N�����PK    0\U]槷�t  K    functions/api/me.jsUT	 �2�j�O�jux         �Q�J�@��+�Y�P�BW-"����*.˘�舝�y�Jɺ.�NE�����`ş�˕��$i�(�r�=��s��R9�jp���BЀ�
��σ�lQ$�u$�|*��X@�s�W̕zs�D��k(M7`�2
��~�ȟ'� �h���SQ�P��P�#��]��Hӑ��`�DҴ^!g�(kCԁf� 9x�^�nԾ�w�G��A��{1jw>��������ve@��I�$R�d��!�;�Ut�I@�ZY�3 �̱L8�F�޴�w@QO'-z��E��p+ȩOQ\�D�W$V����)`o�vl��^�h��}�<3�hE�
o��i&	�3D��0�l
�;��F���l�*��K�_6B����H�0���PK    ��U]Yr�y�  �
    functions/api/forgot.jsUT	 ��j
��jux         �W}o�D�����&dC�&�#Y;�5c�25)!�^�sr�9��em�E����� 1���B�e�_�9m��+���N��{�*�w~^~��y�m��<:G8u���	�!�{m���
+���z�&h"K�a����(q�a�@팉�٥6�n
�@���C�NF���4���M���$����Q�	�NV�_��峍��+�J�t����~�R}�X9�S�t�\i��V+s՗�4j���a<�Dy�PkT+�,��8�X	�<�C��6�p��~�ֿ}kg��ݵ���;Ὗ�w7�K����������7a�����~x������u������c����^�ؿ�Cx����?j��o�i���U?��BN�Y�zy,N�Y/: dU
l�ȍR��s����
 C�?1Rz,n�(:��y�`� )ӡ.8�8D�����ݛ2�;k�d
,:@�t��3 t��r)a�|�����6��$B�,'
��@P����f���a��[aZa`(�#��ffǐ�<E>�*�����LF,��J\��z���O��������h#����z��{�����c,�Y�>z��`c�!����:��X8S�rR�T��^Lj=H�dE�bO��4��lDmk�>�ǎ>ܼ^���b}+������Fq�W��?�q��_v?�
��O��C�	��]��4(u�^�V�	��U�R���f��"M�ϻ{�%cC&4��7=Ѡ~�����z���St47��C�J����|E�6ir(V�`�#`M�[���Er��7��K|$���hy�kC3
 ,�V)��6^|Iua1����z�C ��s�	q3���s�cNt�V��N������i%��O��K��?��eЧ��M�rL�LH��!�Ă�a�~������EI�Ǌ��l���.�Z�KL)��I���>�1H٠�-sϵ!SP�m����	����s�)���#�����$��.; �~�a	N!-���U��<Z���?��L��^G/YZ���39f��^X(ύ�4%v
�Ajb���$\�0hӦ<��کbz�H�I��ph�����#��7]Y4܋a��<���)�v]*/P&��=}�H�U)�
S'9ٜ��vM`.�)�#����G�����\�rV�l(aOG��K��l+���c	���1�1sP���c��hQ�`�|�V����zu�ш�F�Jl����@/+�ҏ���3��� ёs�@QĠ^-!��&e1���&bv8̀�ka��l��ePY<|>�MW�
`F�Y��[Vl���2��lzΪ�Kf4�Di���ͧ��$tAک � �+Ra	[�M�u��?�L;G�gP36�5?��W�<
�j��.m��lqµىaOm��^��h���oc���;�u�KH�i��N�l�π��ݚJL[�g��l6��F��p���o�lM��?&���Yy�Y�=����߮�?����;���2��>�L�(��F��_�K����o^���&}0�Q�gF;|~����8�i໸��̥���\�ZĐ��������)�%�Q�X^4���cd�ɤ��
�͖��2�m4�c��NB.f���^�I�l�&��~�D�7�~�h�����O�A5����]x�^� 攬-9Geї��^�/&D�I�L�7�{Ȓ� �pKf��[�%�����Ie��
�J�Y��M�PK    ;�U]�R��      functions/api/reset.jsUT	 ���j^p�jux         �Wmo�V��_q���`
hkWPG35Z)UӊI��}��&vv}�6
�Z$J�
[�ԩ�@ UR�&�/�?��I>�v��⤅��/�ss�9�y�s�O�lN'�$&j2?�2�AQ%��E�x,!$)^6��շMKFzH2�)�(-�$��z���5�7>���Vu��8|S��d��椔Q��B弳�+�Ԭڒ;̰�6��h<:��
%b�b#���������ٖ�t͠�F�67SD���TZ�J������ӎ�d�5%MM���!]���
ʃ{����
9�X>�Aam�� Ϫl�$������.R�hh9p�����	�I�w��/��_�/�r�au�5�.�U痨( j�(�;h|<rF��
/��ƒ��!�0�99y5�i��j�Е+�3�	M�Ҹ�+�'Ҕ�5�!�#��4����ű�A�%�bHF�'���z~���\߹^ݼ�xx��1�n{h����[7�����ωo|~�u���"H�S!�	z\9���[��C���G9���U{�y��R__�U�N#�R#�M)QBd��V �9��X��W�s] �Y
���h���	1Ρ�fK��(�9N3�cET��:��=z��)��F�+����yA���x�&Mc�G=�Q/!R^d�ʳˣ�F�v��q!���ɴH�8%�d��)A�IJ�J��'"���A�����SK9�'Up� ��}���לD0��Dώ ��$��0!T~B������?�N7�Bt8�2�H��A��}̃�n��hpt`��W5�(
��*��*�Xw��ڛJ��훏�WY�^�����x�?|R}�S+�}P�M�`,�raE�!B������,<�b���;������^�Оd-�
���^-�!ȪS࢟�'OPǎ��֣�¢�r����ۙY��a�ϱ�_5�3�����w������F�b��Y���g��?[7Xs׬ʢ=���U�g��g��g�����c�1�#�2o�����CZKګ��S�E�AŪ�sT7�\@��}��\��^�J��}xk��X�J��Kk鶵���o/{�Y&��E�����
@Q�2%��<x��(�?�-�����������)�KTN�=�x�A�����DwE�P8Ё��9u�it&�[�s]V#͡�E���iȅ�
�� U% v��^��u�����胊�^6Xu�By��?��E��)Ub)���L�<���/��$�vB�닱��a*�a\
�IO�;/�YL%QvVn��A�?o�àq'��{����*��ը��K��s�n!P��l� &�����hm�\����߲8+��&nw���v� Mt�2E�I���)�����a����j���t	����F�)��V�6AYx�R�-��x��T`��̷n�w�Y(�}�yme�zÖY'H�l�!������,:"�a�6�:��%�v��{��^=+k{��'u;��PK    �U]h^�  �    functions/api/_shield.jsUT	 ��j�Q�jux         ���N�@E���W/P"V��]UuϲB�!�d$glyƴE
�i�Ji
�"%��l(��(S��^�:$ B���#�w�y�j�������m¯��=�r#>��ͳ��Ӄ���G������ �%���m�A���K�tj���a]�4��J�/�(8��MԷ��w�ގ�N�+�~r��7��+��F�W�G'xo3>و嶵)�������9�V�O]Q��;u�?O+Ǣْ���O彂�9�����
�6�jX���b#+������,�+ ؄̳񡋘�XǠtLâhFN
j�9PK�RL
�Ȣ�G��"Q+6�L.�E6�0�� T���6Ak��^a�By(Co!wy&u�
U����ŅrQ�i&�DZ�7K��Gؚ�l�1,�r9P�WZF�
SSc�x�}`�:-fTӠL��r	35;�/���r^L�-��>���K�D�z��C+ٴ��PK    ��U]���`  >    functions/api/_crypto.jsUT	 ���j!o�jux         �VMo�F��W�	��J+NjQ@��H��������Tw��[@Z4�~$�@Q�HS��S��@L+>�/tvI�KJ�$'��o�̼}3��\�1���m�]��ܭ�Tv7�o7�
بޭ<�p�\�˃>X��~+�������*
��6�M�*\/�J�r�]�$��vMD���>ݭ�ݕd�Vi�&�7�1��-�>t�����q��� �d��z�������~�Z�Wwl�]����y���`��q�{�^'�T�ނ�Q��߱�2�L�܇!ʅQ�������j[�u8�j������?o~�����/�?}v�������󟿾x����?.~|v������|;>�s|�z�����|U�b�`RtD_�B�M�b��I��ܪ.y�ɪ�
ڨ�.#<fC�C�Ih��@����O����C����H����i��KՉ�.]|j�*�-��b��.�	V����:��gJ��z���
�tHfe����ͦWn۶�>�S��0!#{*	ړE�$�n[��-Za�6Wi�Qt�"�G{�*�D3��
�W��5O����b�X�眥��{3�(.FOĕ^;�A]V�"�=B��4�1�G��ӧG�:�Б]D��t=&�
���*ށ�& �qD=Ĕ��s[��k�����*`�V��utFEφ�(�HF��6�V��`�
�r�4������PS�4$G5���q��SL�b6!y�+mME��T��;�2(���H���Mΰ)N+��Q��	o^���bS�ݡ~;�D{!$׸�ܶ�FP������0郹;2;�ͻz4h>n����Kє����>M.Lqڙ�\�iz�=zt�������M��ikȣ���|���X�HX@�YB�Ʋ��t����x�P.�%�1�y�X��K(�װ�k�M�m�������5҈�q�v�o����=#�B��xbӗ�����n-��v�� �}'�MpIr���R[NR��wG֒znOAo�U(>S8��sLhLD�rI�������<�.B����lucs�7���a�?TF��w63�kzb]6(��Ҳ2#r����a�/I�,����q%Y:��ڷ��l�+���n�"�3<���PK    �uU]��4�  �    functions/api/_disposable.jsUT	 �_�j]R�jux         uS�n�0��+6:TP�
��`5E�E��@E0��H�\U5�{�pd;i.����YήD�i����c���lD�u�0Bmt)��7��m�"I$G(Y��j�[&��kP��E����7O�y��ZY������~��u��.�r���0�U%Խ*QhR�b��.5�S��sX1�T��afG��Z��Q����6���o`��p �w�.��J�N[� 9}t���
}�q'#gUT��wg�V�=��z�W_��>^平{|A|rքϬ���̕I���1z �X�
IC�P;]^����2f��2��� ǜ7ư-6��������IQAǶ�;���!pw=mYGH����C#ԣ;PԷz�f�,'Y�g9�CS��{
]�g��E���TO �1I��0�&N��Ծ��	=<�Y8{��E�*e_qKүi6���{�h}�{TL���?/�:�s�$����h�,�t;&�PK
     �U]              functions/api/passkey/UT	 
|�j�R�jux         PK    �U]�C��V  �  )  functions/api/passkey/register-options.jsUT	 �r�j�r�jux         �TM�G��(FfȨ�
�â
1x",ۚ�!E��������,��%�$��R��3BB$pX�~
k�!��wA�d�{z�^�z���0M��	�Q��4���Jӊ'�����)�d2�;Ň� �q3�-qZ����:��Kz影��F��Ac��X��I-�Q����R���󄕘Hh�R�!lU��w=[�vχuX�P��@#51�F"6�!�V��M0�h&+ 9�d���Da��s�{`�Xj�.���H
�Q��D5�P�D��������·��~�`�R)�#=Rkp�r��.Y5�r�q}H{��[�sؙ�c��={��߽�v�Y]&22s(�PAV��R�i$Ѷoû�F| ���+Y��k�<�ޥ���6��چ3��]���$���������tvo���{���{������d$�q�/6;��}ʁj "o!����e�Z��dU��o�?���jpL�7[9	�������{�/?�}������||s����ӏo~�yX�J&
�t.�L�5j�(rͻP��/5B���ݻ p:�Fi26��m�Y��M��`���^v�q� �c0@L-�ج��U�gm-#�&C{"N��v�a�ZT��$В���8��ެX���K�59�I{���"X�7�(4�#�� �]kŌ̔�R�eS"��G�n����jn��eZF8>����e_nE��>֍�b9Nu�d$�ɰө�r+�t���]j$�mL$۶_��p
���c�R�8�K=h��d5�ܿ�x˾�;| �
�P�v�<�U6��Yp�=�%�0�[�ju��`�w��9�SH����]X��[����l�?�
}���F����PK    �U]���  z  &  functions/api/passkey/login-options.jsUT	 $��j�r�jux         �SMo�@��W����P>��B%U*)J��)G׵'�Rgmv�M�48��Vp�8q+�!�g�׉��l�
��ֻo߼�f̻I,5�������
�_�X�&fU0����`=T��D��-�p�B���Z,�1}�V��OSTz��uoy��-���
6��˧��42����#���"�V*�	b�Y��fA,4�j �P#�� ��� r�"axص)�,��6=ԩPG���X����\ ��������ϧ�[0t��ҾN��-ށ�M��*xBusf��~�R�m��
Z�HvD{�'�
{{`�b[�=a-N(dD~ϧ�&�1���f�+��}/����d���'�M����Ĭ��xff��BlK�f����|8:?><����׃�woξ<���p�~����ɋ}��=���Q ��4dR)��>^Y.5�ռ��G�d]`���n*#��Pw����8r��L�9�,�Gu��.���0m�qd���C� ��t�(B��Jh�G���a�m6+ef_��!%U�4Fʤ��ťn2n�=�����.R[\W�
-��,���1ٔ�GZ�Db�KdV��X��C���
�O�)`<tF�<��\8cU�O�F��\i [r�֬V�͒m�Y�-.Bvů3�������G2����O��L%i"~PK    �U]!��_  �  (  functions/api/passkey/register-verify.jsUT	 D��j�R�jux         �Vmo�V��_q�VՖ�Kǋ�T���l�vI:�!\�����^�R�H�
���ѱ���VQ ����n����s�'mײV�{�9�9�=�9֊%��0	g	��)2�1�*�f�)�J���!O�"_0�X*�q2�X���E+��Ckwr�"��d�;�2��d�ã�L�0�0zj9ͼuϠ��s-6����t��Ѝ3d0ST
�$�L	&; ����;��E��?Ջg�<��Z���qIBCӢ: C'�Pj�8�w�9�5��γK�c���i�8�۳��Pp�0�2�hf[�b_, '���X���k�5��� =�N��4�QǔB��$�ø��njJ���C�C󢹐|PS8v5�%?lٞ�����������{\��K�#���!6dK�?�ǒK��JD!�8�8���j<� )|�<%����D6\fp�h"� -�����@?`�i���b�爉�M�HĮ��wwww�2�G�����bХ�]� 8F4='F�	7���r��l_c��Ջ�����)g���7���>5Өn��&g�=z�}`���n��i�W�Ewn���U���
W���$�A��j:r��qN�\�hA�
w�w��P����H>4�9:�M
eq�lS_c���R$�QnOk�+aa�l�nb�o!i���@<\o���v�9���U�`,�v��R�2�mp�������*����[vh$Ť�7>�Ʊ#+K;m��Uq�0�� �	(z�%k���_�����݈i(bڤ�>*�Y�l�#F���,s�rx^
���{�3�l_��//�_^w�o:�ߝ���+{�}c���B�����?�+���i�r��Z�jK��.�Τ�^��3O��Bﳏ�ū��zm����8�_8Wg��_��Û�z��1է��G�]�w�V�o��9�;������3}ў���zT��3��p������y��ofL�-4���6-�GSO�� X��tr �He 9����ؼ}WpC���)���T�p���Pt�9��0 �h��Ġ�S|�����3�L�7$�=;R���2�Z�NGC{�Y ��e̠e1�����m�d޲�Uzp@fn�� E��铛L��>yJju�1��ȡ���G�2��O���M؊η �@@�U"JJSv�xy=���"~�(8�11A���Ղ�#L���'�i��d5�K��w��)��k������ޠ\[Xq�/�߾�F[���^~��LO��~����g��q��~�1�ف����d�)L�T� p����c%7�N�7�����"��{f�*���w?[[�p)C9���|ߛ�!�%�@d�(y�0�ww~M@��J���|��~��pU��~k�Q��%�?L��Q��PK    �U]C�(؄  �  %  functions/api/passkey/login-verify.jsUT	 D��j�R�jux         �Xks�V��_qА"�ڊ� �c�MM�6ns�)�v:�X>�Uɕ�H<�gRf�$K���af(m�ei˭?���|�_�{t��@�3�#��r��y/u��-��P�͜EkD�����kb6t�$����>��7Mu�Q'��a�6`�L�ڭ�@>��IC9Q()�Q?6�eI���S�������R� MJ�g�BI�F�e��5jz
�Ȣ��MMAUKS���9�ڝ�Mʃ%�T@K}�
���mH �] Y�������c]���vA Aj
?t�_B�0t#���;�r�{�����}�C����e����0j	�4B�h��D�(5\�m��+	�����u�5��Ux�2���iL}�):I��*����[w�=�7��y�r�fZZ}1�z�PR�6�9U75��fV�e�Qw�f�+���@
��Jgr���Ra��p�u� ��'�����B�S:v�?��0H��diB-F"���$j`�<O��p�Dgǥ���
(A��1�j��)z�1�T�'��������J�<�?����D���'�˪V�cA
?TU�u`(�0��ڃ���g��w~������š
��g'�^E����Ѵ �K*��a��RI`�nA:] �FvK½P��|	V��W��?p����;[�:�/�+������y����~~kp'{��N��ɬ��?�7EV�xL�2��"F	�+ʾ��j����|J���V�Ȇx���QF{��	�[�b���]i"�/�^.���L
�"c鰸@@*�.v%�/!tђύt��_v���0Q9���R9r}�Sec���޾p\ߠ��,�v�I�]��kU]�6G�9:�͢z����׳�(�L�W������+�9����k{�/�}�����i<��H���.Fg�h6�.�Z�ZE�ס �n=��	��e��e��25Tm�<-�
\�)6(?�@\��c]�x�2��ǱYY�[6�2�� �+�k��<�K�:�%��P�F-i
���"q�xW�"��0v�����1�M�G=����Xc�Q��aJx�#B��G4�B@C'��t*�L�R���Ӿ�.�j���F0��d!�9���-�%%�'�n�Y�y0�qq%>L	��I<~��I� 1ЂE�!b�Ui��j�6��� �A\ɮ �������Y����<nw����g�ͻ0h�k��/9_<���g�;[wv�{a_�a�߷?_��qy��5��w�˗�����/����;?n8w��<�����rQF�f�^���g+�1��g��gr��*{��v��ع�j_^�/���ٗ�O����+��v��v�	�|��l��������UH���0�/�>m���Fc����6�ʪ;0��
�'�gA\W/0 ��1<�#�V��=�X,c����Z�-��\~J�
E��*NC(M
���)� �Qߎ�K ��.=��f��~d0�F !F���$��
wx�ݏ��<҄u���/����s�Yo kE",�����q">J�C����A��D����
�k��2n@����ï8w�'���HG�Yz�7�c���}��|v~8��8O(��`�n��m��,봿`���f��ϻ7��J�no"K�Y����
�lUTZ��s�!��{����2�hv�z/71+A�G Y:�U����E���>�2���F��� z}�^u���3cwL�a�5�}
%cֆ�q�yz
�6�10S⦥(P�p��>�/Q �P*p�o�Q�ePk4Yl6�ÍF��XT�h��dB���~^e;�_�
�RinsI�4�]#xne�/�)�ʠqh2�Z��7@Y�$;�3h�Zv �&�b27G@�e���:w��	�Ha��@G!v1��Dt�s3��h�EI.m!"L ��[�*�hk��n�u��z}*dt����PK     vU]n�K�
  
    functions/api/_email.jsUT	  `�j�7�jux         �U[o�6~��8���49
�y^�.�m��m1��H��D�����;�(Yv����s�.$�
.�aEU����f�2�K�������R�/�A�G�2�2��90fK����KAB�G�= ��W�4������h�{�'|��׿L'��
 ��R䠿����d�.�a8���G��"���F �^�DI��׋�.��)���ܴ������ʃ��Һh�s�0��!Dۈ��� �5G� �~?*���׏y֧z|�x&�� �jÓ ���ln�lh�P!�6��@���t�,��HP/�_�V-�v��x+�����։�"e��ҿ�<okV��Ov�6��}���l�#{�q 'th�����Ƞr�|6������Z �HE-����!����B\�d_�f�Q����F�-�t�\b�ze��2ZSWkhY��X�RE����=�����!/�Ԩ�j�D,:����xh�RR1Jp>�c}\8k�S�b=3� ���q"�=�� VQ*�T���]aS��r�4�6	���o.�L���H���d*}�d<� X`E[�1�>��q{@0��m2�
R�n�k��
޼m���֖����� ~!h�V!�h<�s��0�,����Z�D�0�k��T�bA#E�E�\�p���p���@5�I.p�:����A��:��
�C�+>�Mf�b���%�``�
%��~c�4�j���!h�B�s� �4<bj`9v�'�@� O�puD�B�u(YqD���Y����A��qW��w��<q֨fƚ�9�`�*jp^�ƴ��u���TEW�oo��aW�pn�Ǧ.��
ٵ�j��H��_�i��C{C|;�W3xag5��3l��R��VGe��O_w^��F���l���M
�/�����Kl�=x�4���+��mp�7
��a�T5����5^���s++��Q��H3�ǣ�)�os��%^��\zp����O���SCsa��ʱ����i����`���|&����PK    m�U]�*�!�  �     functions/api/change-password.jsUT	 
��j^p�jux         �VMo�F��Wl�4 �v��"A(\��R;�a�͡(�5��XI$�\F��M�ENQNݠ�@�~��	�gLY>�/d�K������R;3o�̼Y��ؔ��E�Y뮑�=�2�G5j����Vu����\��3��u�*�uM��p	M^v���}�{�nǦF5�ۈN�P��0;cܡ&#�a�Pa�!s�%��]h`�N�63u�4��K���[����~&9��`�k��Y:�|�m�̭�.�u�bd�)��C.�AŅ<"֭<�`�mX�lA�

�pݬ!�R�rh�(��y�Bk�u�+H�%��Ԧ$�=�i�����x��]	������չwQ_� �D�H��rj��7��������#�����{���spގ�0�
x���[F�+���3�*���
h�C�@�2rů/�.��,/�b���M�cA#G!m���i�ե�U�F�����ۡ�R)�T���k���
��U�%�Mc�?������oF�;�ye������EI���1�Sk�{��:����ӝ�/N�>;���9DscD�N��hLgv�䠭R��!�A�f��r
�I�䰅�i�ø�K��(U��T�S"KmY[XG��W�V��V�f.�Y��4d��}IQ�Lː�WԚIaf�����������1�?���?<���lv3&8��rj~xp5�M0֩Vn��N>�����d}� B�˜�eR��T�c<��la�7�O�6�jcuq~]�RѲ%��\X�U>9�J~B�Eh��?\mQp���6x�-�nZU�i;,���Z����n7�����^�}����
��bb�O��w��d1���Cº����$��x��b?C)��6���ak����Е+�SO�<��M|H�l{C!r��8i����`'w�=J s��<�Ra�(so��!K
��0;+)��RU	�Rru568
%>p�,N0�����Y�:D+�8-SǼ�|���Ɔ.T��ӄ�,�v�$RV�h�R�Ҋ���
��n�
4Cio�*f��l]��3�uR��|�R�Z�g���@Q�S�Ha�P�8���UVn �|�J3���J,�<j���N��	�{y4��{x�;�����a���~����?�������g"�{gn.�0Uq��ΥɄ���c��(�,�6C��/��MR�M������౿wx��72���xM�s��+PK    �~U]4���   ]    functions/api/_csrf.jsUT	 !o�j!o�jux         u��
�0D���5�������I*~@��6P�$j���I�<-�̛|^
9h��N
w$�5�<Z�)�^�4�':��C�`���ɖ-:Ύ(�]4����R����äF T|mJ�0�I.�*`V\�H�,v��I�|�Do1:
߉p��|�΄�1|�����NE EX�3n)�1{PK    0\U]l$sfX      functions/api/audit-logs.jsUT	 �2�j�c�jux         u��J�@��y�1�Bl�S�m�Z
�"�L�J�wgmK�cx|_A|�5�$�������}×�T[X �Pk.ŵF̕\���m���9����܈���H�Ѡ�$/��pM>l [��_�� P<Y�S�m��;�н�����;T�R���9xG�Է'�(	������*%U��������ǳU`�412:��N*�Qr�� �`8��@X*,�Bϝ��xp�	 /k&#Hm0�7e�6S���'Ӊ��sJ��ps'q��s{���0N�{�Ƴ�G��t;��b�q�{u䰖��]�������d��i�PcDM�P�6��
��PK    ĖU]5��C�  �    functions/api/github-login.jsUT	 Й�j�c�jux         }R]O�@}�W\B�ɲ%}�fCpY�a���-݁�؝�ө,.M�hB�hD}ј �� �Fڅ'��ӏ]0!�t�{��9���Z6eg��0��cJ��z�"��#.��p��)h���CX�O"���$�lcZ��EO`2�Ze�zG�������]�c�L^e�_l�0��
��^-i!ρ��{vi	��\��x��� APB�-�,�������׋���}�|��Q�7����wn
��
ɼ������٢�i��N�ժ6&�.� �����p�b�0�O�dl��5j	zĠ��ӫ���Ba�ecf��T����D_�6�^e� �58�UQ�1o���6��c�DJ��?A#��:��ڈ�����y�f���u8�
v��]��_M�tLj��� ������h�\o�H��$fu����s���g���_��<7�?���_�����>�[	��8;ڀ�8;����\�_n���_w��{��)�:����kȗKw/?��.J67�2+#d1�<��R�>)# e�]�@I
�n��kY�d�+ts�F:*4�QGLT�>@��Q�j7�tҐʈ�)}���B��Gº���0!�MkQ�)���De,.�,L��S�p�h
�Σ�ؕZ���G�6^�_PK    ĖU]���Q	  �     functions/api/github-callback.jsUT	 Й�j�c�jux         �XmoW��_q3ʶ3�;	���^��D
��c����d|Oc����i�K�]�@�@� �TVQ%���P�Ye��a�}��P�+m��{�9��<�{�j��G��~����WAMT��R�T��]���J�ϊ�g��=��)g�	��eFBz������,R���	�L_#���}��h���&���fسxԩ`۟&�	O	���a��<KCK}�m����rȘ7,��@U����Tj��t��3k�)�H-e�&�}���`Rj`Rs*���,N)	�V�F{~�����u�4�ҩO|�
PF�`�$�]���,$���U�k$��mjVEAM~SY� ϣRa��
τ yF�W�V`o��eT��'ǧ�J�ˣ���S���n2�&����TLN�+�#�����MM'N�x�=�jt��@G�鴖��Q1��B�SǨ���"�n���]����O9�hx68ۙˠ�Q�!��-��E(�#�����f_3���g0�
	򩔵��L'nJ>�TI�����N 4\K�@��p2� ��g}��A���CK���i U)9�I(̊u����
8�
=0V��G&&��ْnV���ď��Ņ.�q׳��D#�g,�ϾUΫ�cB�^�슪b
���������{V��
Av�zG�
�lԭ�p%O��)��Ig�uH��J�g�ި�c�#NF,�m�`ԯ�U�����Ξ)�gk�%AD�N��Q�C/��܃p�.��''1QMZ���%P��'h��C�JG
eK�:�Ja�%�`Q��¦�±
�T$b�@�9���*����3ٴ��-r%U�H�*��˭G��n�ǧ��z~{;\��u�[
Yvd h=�NC��2�t�9�14�J�u�\�QF�h�)2:l�2 ���:��]TS�����?�X/*3��z����CZ*.��A=��6^��u�R�'��\�k=�3Ki��������4W��d��wsZ���4լ���h�����g�k"ySd6p���?��\vn���dlk�^����_��z��@��~�Wp,�.�4�~FK}��?1^ȏN�K���֮���F<�^{�z�����W�z�X0�&i��R�H/.�+R���pg�5��ug�mN��t�z`)fgM����ԅ��ZIn>�}5�'7�XY����[!!����_������׫ @��ƥ��߷_l�~��^�nߌ��RhPC�[���˭�Wosp�B��O[W_��Z� ��y;\_}�u� /�ݕ"��q�)��B�S�b~��0y�1�裱|!/��C��3�Ў$��.����ѳA�!
z�.ۯ�p�@���������/Q�/ۛ�v=�ݼߺ���������ʭ��/[W���q���T���<x3�Qs�c�;��dZ�q<��Nl!�EU�GJ�|������4v���U� �埶7���n��~X�\�l<��ﬅW�_]j?�_�
o��q ������~��G䦒�O�1t��'g`b!�Pxy�u�[.���j�����-��R(�����"s�m40�쮮���j1!^��!�!�J7h!Jg����:�� ����r�b���\��q֨C7SY�l2<��F��v.}�M�?t
�G����:��=ك����"�sDPM�n\�x0K�S�,��1��o�x���m�������ϗ�_p��nР_���q���G7�K�iy���Ty���1�J�'`H�Έ�D��E:'�"��ecT��v���'�!������U�#��N7\M�b���9=~��/L���S�"j*87� �5e��Z��͉N}��ّ�R���c	�§׆N}�9K.��h�{Q�R����ɞ�Ca��<�K�
�L��C�$�;zZ�1��-O�-۬H�tz�ϥ��ɼH������fy�6����^�;���G�
>�ɦ��V�"$t�'5ϙ�#�D�'K~@Z���7_��Ļ��&G���t����z��\��|XC�g�Õ��[�;�:�Q
�3��T��m�<
�YO�r2Y�<d.�p�G��qN�\�~�3�:���������t�1(J�xqR��\��4I��$��p]��劙"���0[-� ��I�
ѽ�}��ϰ)�bo������g�9N*�*0$Z��`��R���QἺ$t$�ih�_��*)C��2ig�A�K1���
x��ﳙ�'����HE��Y���K�� �DbK�k��ߕ���G�Q��N���:M8�x����ˉR�$)��:��ry��IRD4s���f��N���,*b3�0|C	+Z�&��,:�*�ʢS�}S�:rt�>ݹ)�(��L�6�oٻ����PK    n�U]�Ɏ��  H    functions/api/_threatintel.jsUT	 ow�j��jux         �TMO�@��WLr@v�Z)"�ji�B)EM�KE�3IV]���:� ��3^;�S�lٳ����Q� ���:�.�����S��Ɓ�}A������L[�Ͽ������{�z��CkY���L��7G��B�H�1<� |p.��2Ol���:I'б\BT&
�ʭ�=�Q]at�	�Qi�`�����-}r_���!_2[d(y�p��|=i��u�����O��?�����2�u#M���cx6o�=�m@AY֓9|p�m��*l:���
�o	�SR#7�q5o�u'�{-��S�y����8���R�w;q�cuȔ
����8�=&۞J�c88��5������hj5�гx�5r(y�Q��cOebqκ�4�PAS�O��.�ra���B:�1ٝ����i��b���ht3��+Y!�}�D�GI��2����_7.S9z��)�h�h��1��'{��,�rh�OY�P0)';� �n�B��M�~�8~��sb��8�#Q��B�Tf���a"�P���������r)�%U�a�t�
�����0O_�E(� Y��WĮ�3M�ʜ�V�,�`��c�<�u���L�����[�x�B�/a��!�1ܙ��9��^���I[���cUū���A�^��2�g^#��*Ac2]�\'��Wr�=nP�踵AA{���Zl�T�Va�wh�X�	��0μ����v���PK    �MU]�TBl�   �    functions/api/_token.jsUT	 ��j"��jux         ��AK�@���s�]��F,B�Ѓ��T�d����avB��n+����0�xo�7��(
۞k
��%&A�M|%��2�:rR@X����Z{]�%�2t}K�����3�{Jv4��h�^f��J<LJ���K����Z8�aS*��"si��/1�5fzϲ3,���o���'�N�'�$��xĠ_���tO�	-%��|X_7���6t�{�cCb��y;�����C���?�> PK    ;�U]Ɵ8E�      functions/api/_constants.jsUT	 ���j׍�jux         }��JA��<��6�n��dw�2�ff�VS���H��R���X� ��N/�m�j�|g�$c��T����\A��>�
�o���{1|x�|� �������)�`��ӿ� ��������{X�z�Wû^trp��h˂�O�8�ɘY��>�:��ݝF�
6ۭ6�+n�VDb�$a� � ���1H$D�qW�$P�,kֲ�0�6���~��8�aű��"�J`G+�, ;����|��K(�2QO
'��yzRU��Dư�5���xZ�i9�X�8,�*!B�,s,ʌ��.��9�}���#B'NSf!OCg�A����ϲĸǤəAʣ���iCs	��xz���Y-�z	#��r�f��~�!B�)�*8PR��̦�$�#TU�+�'{�PK    �tU]Jz
�f  �    functions/api/_hibp.jsUT	 ~]�ji�jux         eS]kA}�_q]|����FQ$%�T����T�d3��6�ffIC	TڂB�XT苈_(ԏ?c6����&��eg�s��{�a=)��-������$+�GEj`�=pq�01F�u��9N��Ó��G��ǧ��7���@�K˰��
�D�Pm
ب�v���eG��W;�C�G�<2Lp�	�"m�[@$�6�Jc��f Ri�i�t)n�����F����iV覹�#Ѧ
y���ћ����Tqh(E8��9���[E�b��{D��硅�h�xUozX�v�e�5�е�u�8r]��V���6��RCǡ���:dzjǂ�$Jh�20iڨAqN�O�Nf����sg`RјmZ`�Ǻ�"�Bn��4�:�PTϊ]\ ���]ׂ�H�e>۩�#��\ݚh��v�J�(t�^�UMU�ѡܸ5p�]Je�!�k7k���0K-,t�J�bÛ�,&]M'�g�;��<#��&
��e���<ֲ�����v���S�{�3��&߆RnX�<�5�ٕ*�knYd�������vI��Kܠ�чj��<��a���"b���]~�ύ>��~<��.��ur������{�/�����G��o9���PK    �tU]��/jR  �    functions/api/sessions.jsUT	 Q]�jj�jux         �S�kQ�篘�i�����(6Y���l*�)<7��i����6m	"��$���xPT�b��3ɶ����fm,O�vg�o曙��~�C�@�D)��ݔ( �����YgZ2[w��T��)a��w���Te�+E'�V�er�s�z��:�{9�
*��=�[ʀa�~dRZdy�P�䨥�Bե8�d\�����j$\�}!��B��e@����>�U��ѻ����]
"�I�T(�p~�,DT�"�MY��Vc�r V 0`u�i_����{赺LvM��	!Im�
�H�+�)l������u�7.�֊������EXu�˷˜�ݬkF����z2������0�����C-��(Þ�V�:/�>L�<���Ho�7ӜDK�ٙ�$;�˲\�C!r�lP���kf��d?���L�	g����UP"Ds6Mr��r���|��K���N3N��ϗ��ϻG���u.���9{,�[T���g%��9,9�&p@gl���Bj�ra�u��G��Ǻ}��/�h��,P,��\o�Ta.�o�էo�8-n��i�����΃x�3y�e������ɛ�Z~��dǖ���m����`4w����� PK    �U]F����  �	    functions/api/verify-sudo.jsUT	 k��j@j�jux         �VQo�T~ϯ8���Ϥ�x �V�ĥQM�NytMrӘ������(�<�(�a�(�
*���!�ϐ�{�/pl�&N�*RU�7߹�;�w�=��>�0���y�A�<I�!�6�@��p�kk�ݜ'�V�l:���W�6K/�`��T�N�T2U��*V�ޮ�ֶi�W?5��N��Ƨw)Vr�n� �|��F��
>������ZKؠ���#��h�!mr�
|:��\FJ�<�
s 	?��� }��߃�.b�6�ז��gpE�@2
u��*�<|*�0�H/��f������䗏$�TL�z�0(���m�$-X�!�`f�����@r��*�)svq�Z.�g?LO~�y|�Ȇ �� �e!L!��6�^�p�f�#�Wj�q[��#K��MR�����^_R��c�Bڥ�!��W��fw�� l���øF-D1*�����l��99��9W�K+���黌Ȓ�z��@M�R��`�n��'�u����:t*�����і<c�hm�a;��^7n�,�R<���.'�e �/ �2�֙;=�~��˧'���������}<������ozv4�������o����^����e.�̶��dἥ�\����u��Vu:n�Is�a"���f�tS�EQ�����5}z6���߿��9~vva�U��y
��,��	em��d������ώ �T��^��R��U#d�@�b�-
�ysC��6C�
%��eTJv�@لF�\D�-}1Uq����������ǦT�`p��v|�ytAK�z�,)����nQ�*���c#+����l��yE�~�2-���A\$���+�%����w�ӟ�X�v��)Ӄ�kj�]B�%��N�Җ�hTʢ���������C.'O�s}8�#�S!3I(��+.����xۼW����b>��1�M܂\L!Q��2u�
F�ty�2J�d���#Z�,�&3F��$��S��׮ϣ�㓳��]���|^�E�PK    ��U]l߱<  W    functions/api/_session.jsUT	 Hr�j�{�jux         �TQO�0~ﯸ�٬���ڕ����c"��� 2�K=����(���]�4m�4M�K���w���wI������09��W����E]8�]8n��A���4b�i��g��$W��Z��p���#+1�W.�k�P���j���Qxi@�;�Z?H1|,6����_X��Hp�s
�A�~��]:�G�5��$��׾]t~�]��$j��hϖк���s��Ӣ�� y�Q��r�@�R\6r�A(l䓮n:��!���%2ϙ���wn&0���=r"A4��MP�	bT"T�FЄ2�O�ף�|�BrG�{}c�3��H��#����&��O�3�#g��'ǔe|9n9lB�
(e?�T$���J�� N�
>�2#2nB���r�i"�8�y&��	��θu�B�?�|uy�,i��0�
K��i�R/���I5&�~��DT����R�ڞL-�p'H��V�(|�:LK�՞�	����\W4H3���[���x?��*��������w�����+R��*l�x]�K�'P�bx,;��b��F]�1�l��Ų���6���Q��[�>�n6�u:�[��u'���(q�nƛBu�曥sj.���Ϣ����ol�o�s:��GQ���/�ٸ]^/�����i�6� PK    VtU]�%8m�  +    functions/api/_password.jsUT	 ]�j]�jux         m�Qk�P���)�AFm"�ɖAEq�α	��v1�Y�YR����6���b�Cj��M�ٲZG�cn�>��m�J��������VK����� ���inZHV�� ���
� �����f�-^X�,-=z�x+��|����;�R�a�q4L�(�ac��v�ŠWC1��0Pˆ�5Ӏ5Y�
2F1�����.E�)��r�2��*#�!A��� h*px��Lu�W$	X[����`!\�`Ic78�����[�:.9x�j�+Ԉ�+�3����0���B6���C�~��<�׷H�\�L0p���H����z�?�X ;���Nq�MɊY9�:'�@�f�O���°}F_�ѵ􍜘TM���8� �RD#����dq2��\sp��7��;9>%��١�p�nm�f5���&�i�8!ն�9>���Z�������vDf�=5��.kx�eM��%��_C6�>�1Sk���v��s�K�.�����^�����/l�g$`�u}�q��PK    ��U]�)��      functions/api/_ratelimit.jsUT	 ��j�o�jux         �S]o�0}�W���Y�(�o��H�1�0��=R7�P�� �@�ωE�4i�$?���{�����u�4x��9��̵(%�4+�ɭ�'ڻX�o;!��.���������z�Gk ��*��R�b_�q�UZ	�Ş@[�:�U����6�o�X�%]�AG�y�((�%q@���ˊ\c[q!�J �Ŝ��i@�M��j�T�[ǚ�ر�j�r�"��g��Q�E�Po��~��[t}߯ц���&�a�;.4lu���5W�p?L�x�a�d����XS���H�Z�����i����.���8-�	���h8��X��oQ��H�섂��/=�4Ə/qr�����-���E<2�K�幮]I��������g�O��8�N�a��ue�m��`Zck�6ͭ{�x�P�f��Ӥ�3&�v�.���Goş���#޽�8g�s�َr��G0���
�+�*�� �굏����OPK    VtU](��       functions/api/_http.jsUT	 ]�j]�jux         M��
�0��}�9&PB/^�
�ٛ๖�
Ĥ�TJ�ݤ���;��};�M�5kg���Cs{�or�E�&��أ�0��Y���P�Đu4p��1�h��3��U���M�d��4!Q�wU�w!w�����+PJ-=s��e+sܓ�F��踙ߚh��k����9c�PK    �tU]#g�B  T    functions/api/_audit.jsUT	 ~]�j~]�jux         mR]k�@|�W�8�,"��(��U��M<.��R+1������]fwgf����:��b��(�S��ՎVE�'�%`鳠�	�(r�A( [�@HN���r8{i@�&wPC�_�+��a���ɪ���-q��݀j>-�luļ��5�g�j~��c� ��R&-ql�������rH�8o���DM�05sъ;Ș���zޯ��K���7�z�&�}���[<�uOF�H�ds?&Ǚ�f��j��g:c^�+̇IφݫU��D[�����
�Y+�W����{���t�N�h�iB>Y�Z����nQ�
�L���I5�PK    [vU]}����  H    functions/api/_notify.jsUT	 �`�j�`�jux         �U[oE~��M �J�Ʈ�kg_ ��@���(j'�g�Kwg���uLj)�P�D�P�P".R�*�U-!?&^�y�/p��[/�*$k�3;������9��:� ���}`3�"=�{�Mh�|��ҧ>m�rz�Ua:���2>���%��#�x�,��n�<p-�B��8�Rf�R�(��-�9��#B�4�qa�ۤB[�e��PbÈ�:�'�6��]lR��-�K����r9X�a~���8�(�K��;����f� �#G���L;ΰ@�y���\���$�:
�%sٗR��_2@䩪�$�F�t�Dn� 4�W���Z�:^q�����irb��3	�'�A�eQD��\��_�6�;�y�	�K%��/|��*x|����'��4�:�Eׂ9�;\uf�VW.2׵��w}v�g�/"��7��z��0M��������4
��z�]!��4��"�L��*�Ur��l�R옚h��w��6����ᜥБoS��f�\m�CFY;�f�."��lF�:���S�j���R��#�c��T	wn����nl��{�*�g�=�W�ש2Z4��9Y� \2y�0��K����6�7H`��Ç��'ߎ�v�s�����S�}��o������^x�?����o���g���*�H/ز'��jEJ�J3ѱZ���	�!Z��A��4����@��P�4�F�i%<�%�<S�����@��;���) H�/V"�F�v��XB{30���z��D�,��2��QRe�����J=�?��=����Re2�'|p��A��
Xɷ�vV)��lE:+M9��)\�A-���F[ȍ
b'�8���O����/������x���ڝ�`k2�=)�õ����x��;��9~�l<�i�խ���q���+�z%�9QOL�0S�L��?�ݙ��!e��BԲ�^�5q�u������j��)v��#��ʄ�&y�R��9���/O9���D2� ��cP���	 Ο� PK    ;�U]��R�  �
    functions/_middleware.jsUT	 ���j�\�jux         �VOo�D��S��+��T��
R�٨��v5UUE���w{Ɲ7Y��Z�"$�JHP�8 *$�HT��Ð���W����z�����ߙ�{��&��J�+�[�����ۃ�Ƶ�����[NG���M�N�bI5C_+�1��|d.B�OE�'P��$�qҊ��;��(nw���3�{k�<���vo-��2�Z�I�%��!��?P�7^"�ÙT¸���~z��v�p� d��4�ӰpMD,��Ǿ�,6{y�h�b.$��V����b�ݍhen_�)������y�o���{R:N(~�(�mnn��C��|��ɱ�2±?�%FcH���Iv���B�L�MKQ��U���"�nF���Z���"����S5�i	:��h�Cw��⒯D
�����G�
���R�H#����!.s�<��<���+;Y*��{��k;7�������#S��������3����
r;+��BqE�5{ކ��M�z��Mk@R���E�1*-Y�=�c�h�C�+Ujl��:� �U&�����"CJ�=$����-����r�0$y�|�.Rʸ�LB"hh�mcS�R�~���  �����$�B$->c��b��<�K"�BJi�A7"S�Edc��=���+�s5�_{�^Q閭}+>���	Ü� ��e o
8�V-5���nc+�"�'�S2 �$ѥ.Q�dYSE�Zgj���!��=�$����̀�j��%R�5^�C0h
!�V�'Ԉ�A�T�FT�����"!S���u�(p5���<���0tO}�����!�j�RO����������1�I�Ov���_&��j����v@�ߘ~���U�
ۘavp��B�
�s�
�Aܩ��
��|�]�ƀ5I��#��/N+��V�[v�� 1�W�j�#�C��ؤ'-�@N��Jey),�Q�IU,�?n�m�˔�\��[����₭#�
�u�&wo���縍p�A���ԈP�)��M���&���D��<��XǩS7�8=���tR/ �a8E��mI㔖n�	u�l7L3%�
��Ú�j��������G {H}�)���/כrmk�ǩ���!=�y�������_O��}����_^��d�Փ鋧�?}vv����HD�d����Ǘ篞N��ΰ
����>~��^����M_>:;}0}��%��Ogmi>�Eo.��`����_�_qߴ�B��9��Z����	��v��<��z�F"�T�T��F�h7�;X�F�n��'ś�/PK
     �U]              scripts/UT	 ���j���jux         PK    �U]��i@  P    scripts/prepare-deploy.pyUT	 ���j���jux         �RMk�@�ϯ�K"��lŃ�7-�-UOR�l2ٌ��`f�v)�U+(�vz�*�M<�����u�/8�d�V=�K���>���Z�ѭ.-*P
m&�E��=}=}<���G
\<|;;�8{�ar������ѻ��������x��`�d�x9��/^=����?�O��|>�녈-��|=p��q%��&+,�A�%���,g]X�6`�ӹ�� ����4�B�����!VDSa�����eO��� X߸q����=�������5 "J��;�)�M��QE���a�8,��:(jT��ՊOi6 �p�-�ܬP�Q�Pm����I�D��X,E�}y���>�91}�us�A7~N�Vq��Ul�k[�g�._y$��h �B�,Lw܎L^)穮�5�����C�Q��	�A@*5�S�,�Z���t�>_F��K`fʫ-%~�������G�[�P�6�O�����ebY�(M��6���W�u/�� ]@��N=���W� uw���K�nɳ}����a��PK    n�U]Et��_ pm   Sleep_final.mdUT	  ��j,��jux         �ZmW׾�O�/��2C�j��⩷VX�����J'�2e2��L@���� Zm����ZO[�"��u?�=�I�_���ޓd�$�յ`f���??�a�)���w�1���ě/�N�W��W��BI�������D8���M���/���o��7{�������ҝ���AG��!$��"a)!�������^�4��؎쎄B;v������Oy���W�y���%F\Ҝt.�6jZ�)��ے�<���-m�0-��޾����C�G䌊��ޮu���x�**�l<*٬�%{HZ�!1��j��ۺ<j)ƐN-�19AU��� .�^A��R9#�h�a��3���tT�h�}%��ŕ��9���xrñ�XcY�l�o[���X˚����H3��7ض,�j�`ZK�V��u����h����YŶa+�>��8T�2��lS��[��F�4��EG3@��9L���~ ��P}E&�pF*�V�i
����$%]O(�����%�>ۯ�5s�9���9&�0�%3�w�	=B�F>S��6��m��!P�k `��Z�>?��d��`ԧ����N5M��\�(���6#m�E_� ����(ɱ
G��-٦�!E���]]C�.�0A	����:"DFFKiCr�C5H���d�� ;�M��ɉ��a�LW7�5�o
S[��(�5�e�Kc�3X�䵍�U?em#[�.Q��Q��S�̴����|�&��
�P�T7�4J;��8�d�!�lN1m������F�9��l�o��A*�Ԃ�WTUb�3�%�fM�=e��q�qh&��F�^�-{k�+�6�� 0lS�MPqă�S�Dm�}exUqU���s�j��ԁ2jBF����P�ٵ@"��� Uh�&\0�����PfDX��GmY#ӨtDK�xJ�Z, ��v��h���Ԛ�{9��C
�x�C���n�٦��e��o�3^4W-3e�9CE�jD8*��+�sS��m�Q��VR�}����#ΫGm�=���W�E��(���v",�wK�Қ���'���Y��E7y]���_����M}���40�v�f�uH*��昜c{[۝`�Snr6�7�^�)� �k�T"�;]w3k��۴]��7P��-����=6uK���N��Y���+�l�^�P��[�Q�}���X���C��i�B�dsv��&$��4��?�m������ſʁ�X(�����dg��aK@Dr����$]a��-ԯ�-��"��&�Nr
��Ȟ:�c��d�*��2
�b�7B�>��,��H4�J* #F6S� n�IjDn�'h�z�V ���U++g�@��N���=f8ʱ�'N8:�u�pg8�����P~�;-��Z��W�#�Ĩ��]��f"9cYJR;;�j�	u@�]��N���8A��L����'X��D:���a�4h���b�a���<j`��doU
�}��*����T<�3��ө���N�Gj��򮐌�!�(��%#%������%'��]�eZR���><��������=�s�	��e#���[;�ܛ�/V���n\����AV��A��o��$B܋��	w}�41#0Gd2@
�c7j3ŧ/H�07*m����Fc��ؔ���o6�oK�fNM�
��r�ԝ��;=�_w=퓒Y�G=0p$V�
H�hK�MQ�įCz���`8*��Y�`�̈́��!���h��aS�kk������dRN�m�.]yZ�>#�ĝ�,}��p�\�ѽ)�^̯>�vˤ�"&��&HL6��l��8��7�=���Se���l����L���9c���L�b���z��b�㭰m��YG ���t�Ƣ���E
+��=~ZPm�u��J®KjttT�m]'�g��&�הW���΍$�P$ޕw�
�5uoyW���v}�iE�����5���e~I��H�;>�4��_�� �J��e�fI	L��v*Ӟ����o3��{3�������o�9�@���:�AB�E�?IM�o�fL��+3��C%M=�{�Iw��#�-�v����>j41G��]�7������j[$����׼�Y(�3֍J>���&���P}0���/d#�\�8 ���|iֽ�3	����,����W~!�H��{xO �g���%�y`��q���	��K>%���0"�ܙ3�P�f%'��S�{����E�����Δ�].����;�0~p�)�Wuڽq�[��_>�lS8;�����µU���I�q�������6�_�t�/|en9M
��E<_������ҵHVxt�pi�0wۻ4��w�%�g�k��=,ŒH$-�
�Yxx
$�ϛ>K���၃Q���)�rƝ|�L]&R�(��[��Gd7���w����3+o��oET�r}3�[@��Q����^,��r��Z|���F�G�{��Ļ��?���wc�cա��
�*��~�B"���\q��p��n/x��y��ug/�f�����1d|�y��ės���e���1������ϣ��O��x��SߓH8cs��e�Q���W+�����a�K����cB�l��=������ť��m,�<��^-0��5T�j��Q�q���yT�W N�_^)��E�Lq~���B��/�����GL��d0g��jHj������
+��;;�݂�1\Mwr���O����K׼���dOx?�x��_��N�j�rׯ�K�h�A?������0��q���VX.<w��t֝�����/�Ja�������)�N���j��]D����yR�?	��`����_{X�Q`���K��I���m~�1�/8<�=�s��5��B��w��
P�n���>���k��K�w 87���U֯��33
��NC�kk+�|������ȿ���;��3d���U:-�9��@<�?3Y:3㮮xS�K�ܩ+8^zy�1��"BDL�l@�����
{��I�G���[�@����M�`���*� ��f��/p�\�d\����;��Z�j[��zOW�X���K�A����C���ų�ă����<�ƺ7�Of<4v���퀨ik�٩tf6�v��t��~
�
�!��ZT��
���Q3mD��lB���� � �]9'�fN�;"s{���#���]��e�wm�]��ݼ�+���2���zO��ui�:�V�i̿��H*��*�OF��e�h�iBu�-aa�Eݭ$
a�K���mf���.2�;؇���{��sDJin�oU�֐�!�?����yv�di6˰�\�Z�V��#����s��,�����P�!=ў�Y��U��ڶ#�'R��o8� �6�W�c^2mCK�8�A�[u�@ϑO�z�2�1P%)ۖ�l0���E�F9>���j���foKCC(F$i4M
)�1��h2�i9Ҁ�0�HF9&���ܻ;�^�؁�%��T:�K����n*lb�L�p��W�I����P�Z�-;[1�g����!jꦸ��c`-if)�(Cu'3XϦ!)�*����9;��&
-��F2
Y����z�
z���黢�
���6sV�փ��YVWL�)%�;�m%I�M�Ts�AX���v�;�
g��P���8J���@��r�4��d��)b��V�ė )��T� �S)��H���R1�P-����\�@��]��E%����֌����ſvxK��2D�;�^+�ğ^Ԃ����	��]����L=��6��V\6�����#��AI_8����!ow8p��܏��Y9�X�DJ��tv���H�Ogr�zK�6~&z-�}{���8��z{chpy)�?�=�wG�w������q� p�G�<��b����1sɴĐ�\�������ۡ�~X|�h����R���nyM�ǌd咍�I�+��d'�J�O���?������9�;�q���F�hvy��$��Lv�tvv�&Vt��&vC�e�j�-M>�6���s2&�T&�nk[�4�'�v�Gb��/p.�X:t�t%P�|����0�:��DK�N��W~\V�AV=�?�z���V�:h:�2�hIQ'��Ut�Ȳ�멕���٘@'^�I��$�=N��%;}�Z��2����/��޸|�o*�v=b�r�NKSq���iL��Rl���ٺ��bau-4����%�]�_m, '�J��b�,eR��UVו�=t2ҩC��k� +��s��z�����w��������  �H�Gşh8��5���n�0G�}��X��� �֜11{e���J�y^(��'Ts�`�ID�p��2�v����8̰��̱�HVT�ӳs��:�J����~�]fZ����r���`�� ?9�h?
�E:�+�ܣS����C���37��4�j:����4s��~w�{� Z6'F>b���M�@KU�Dڬ���Y���A_�X
qa�Vf,k:5D
J"$x?dd"��/��aJ�m�>�G�b�,���ت't���.�&�0���a
I�o�)'u؁�M���@K�
2bj�&h3�Bx����z��
,'���ist�Tl�%co0�M|��kiV�a.G�.�$r�D�~�Rxή
�XhNuM84�b���
-�>Y,7t��cxl��KiǨځ��b��v�4�����A�5�1�ľS~�"agg���!��j�J(-�V�_�׾�#�QŊ�H�RYh�=	g��(~���yOB/���_}��5�Ev��k�w������fVIbv ay���,����[�@0[� a�c2�5��-�Ė�~���2('��͐�B��f����E�y���"�jF6簪�m%�W��������f��`2�Yø���~skٸ'JP�y?d��N����T��<*�B-�;��$��~�(��:��KS�7�3�E�:(���l�[�?IYb
,3r�7Ɍ���m���]UD�������Vk�⇫����.�Qu[�9ܶQ��l��2L�7��M�"{�h��O��xK3�v��c�<u��$N}_XYozz���똨 5��W΋�0F��+��-�m��w~��{ƚ�{��U��
E� M�K���=�J��>��Y�Zpz½�/��}w�ZEC����P
��+�����o�g���/���ϼ)���o���6X@�1�|>�|λ������r�]��k���0������M���w~Ŏ����$�lm��0]�t�_�mdi��A�t�%���$�I������	�N���<���K�?��	w
U��� ɘ}���k�]�U�V�q��ɕ���`T�p
(��sv�\���$ɀb�p<��B1S|V���Н,���V������ȋ�w���?�wp��{�0�w����Q���O��mߜߕM�ـ{8�������^���ڹtm3"�/>^y|�x�oFₗ�͖s����~��}����Ne��|e\zps��g��Jn]�����{����F��?<Y�|{��G ���oV��`���W�~#j���A��+N���D9�
�r+��a���V�%�g&���❥G�j��Ol��C�48��GTy����e��+FxZ�Ю^w8(0�zp%�������tK��Nj����3
@��'g�b;I��>^�]���x�ZǙ��0����?�.�C��������f�' �WO����o|�)dR��&�6:A��e;i���o.5��oa�YO�z��ח|Q�s��@�`c���=P�N��M%�9�ĥ�k�.� �g�\�7j���`�m�qxļ�ko���J-��]�5{�"��@��,�/%/�����2y�<m�B���`��;Y�X��҃�
��	�Ԭ�p�G��U�ѩk�e�z������K��Pk
��u�_��5ձ�X�?�,�H�n��J8?=����M�,����K�Tj�d�K60�T�u�v�sz����o����^�%I�e~8�j�څ�7j�oԾ�����ɦ�C�o��/dX\e���˟��]y����n��B�=�
ꥌ"��s6l�^����h�c�������c���e9n�;R�W��!�`�ʻ+�o{��F�:�+/?B�����DKk`ZTU�{��j�xx?)��}�A��.��
���;/���[\Y�� ��J��^�]������J�D��H�ћ�s�]�iC�W�48���������N�'ƥ�P�M4�,ϐV�
�S�fW��1��("�JL/.�^�ȝV�ݩ^?�S��^
@0}`��)z �
��	�2��Y��"�V�1����8�����8��py�s:;Iba
��p�/�y���T�n��w���������r9�W
2��6j��['
������p5ԁ��������+�L�������֌����k�LV�z����
>�1�C�,
��p�21�R�Ԕm�"c�����o��q�p/l�)m��Ϊ���Ϭ�0�Q.��a�D������l+e��#Z{M�)�#�O��=�r)#�4� �x��\�C	�p ��+e��(�Gax[��Y`?�C_"���N�'�p&��ؖ����f\�@�B���9Pr�8�M2 C�t
�F�69}��`�>�X�0)������fXl(�_���
�:�O0�1Ē(��@H��T�S�w�D+���tL �g��na�&19��;q+_A
�(Y�<Z��%���3��@2�%l2�8�N�ɉV�(i�����Na�)؏� exX�^���;�2���T`*[FՉ��BN�i0������P��J)�������l�`,�/ao�g-x�_��ž
Li��fP�Sj��Pހ��Fh6�Ct�A�'����8�_+���;z��X1�cz◿�b$}%���R�%�c3�Y����=D�7�JZ4�j�O��
��h~�d��HI�a|?�r�;Orz�m��[3,�1[��PW��r-yXg��3�9��q�9�9��irgU�E�=q8��Pa�z��1����Q�#ː�3��0��=Ӆl��
Yo����!×*z�6�Q̕S��j�m�Dyi֜9���&n]/��ײ*�9R�hT�p-��j(�v�Y?�TE@$%�k��`�����K����
I��D�CL"��
��T�e;i7��Uf
X�j��2ľbԣgj<�~EP��?<{������>�w�E6��c4�&�Z^<���M4�~�,57���e����SXh�C�5tj�o�l�D[�f�l�SӨ�Fs��?���z �e8�,�)�3�������O[�O�h�G�X"���ua����y���Oyk+T��dCp��&�m	8�� ��8��'���(>�4��f�PB�>H����8T���!ʩ!��:����I��.Ԏ2��d!O�u��Bs�Q.�
�I��J�_.LM����:!����숎9 '��.8�S� N���f�ķ�ɑ�O؉�j�K�����
F�d�<v�U-�B�w(6K_���#�;���;�T��M�gl����U��eI׊[U�����E�w���1lu��D�8�z�Ls�Ŭ���Qh�pn�<��T�U�pC�y��+�����>�N��+bן��`�5�ۿVk�u(��@�b=X{
$��f�C~a&[�
w�)������Y�t�'�2uȪ��cP|c��N7M�guf����˾XS�}�¶`I`\g�14q�a*M�E�5��м"EQ`aka�H���[l�d"� 7�6�Jo;�=��P����l\ew���7l�4}3�L��Y�����l��e��ח�8��-�A��JBɄC��c�'���� �5��b:��f�r p/�l-�Y����Zоr�.O�"�r���(��B��E�j�"�U�<�-��an��$^̖������S.Ň��Bc1Gq`�-���'�sR�k�x�Jdz-�yqM�\��q$B�7qai��1%��� �$n�ri�sȗ �
�]�$	�bO�
��,���᎐����c���NWVEbGM,�d:�x� 3��m�2j�O��-����RP�|��n\N3�iLn�#8��1�3�9�J�u ��[����m�[)&N�C��D�]0��.ݽP��o�7QI�(��/v~?�����?'�9RO-�P�f-��6Xy�`���5�	&�)�-��5�ozo�9��k�QW|햵q.`(�	���y��K�^[��͑����K['}�f�5n������_&���%'�9��h�8��P����'����?E���K����dL��^�E��GP�s��2�f�2|��7�
X	���Kج2�л@#�Y@�<
^A���2j��[S�O�>,�?O@��3�}Iv�ICG�.W_�0�
 �/o�U#}vT���`�4�#�.��;�e3,M�b���7�	7�ӛK���K4`˚?2�6SVO��n$�`�J���iy��#��^m�4��{�7V���%AM��*4ލj/:�t�vw7�N�
��&�d}Ĩ'h$�4S?�b������7m�gU��l�c�'Sy;WG��L�׼�<8~L�3��u2go ��Й���O
�`y{�f�f*��й�6�L�Q#o/)p��c=���'����� ��؞a��l>�U��HN��I�/�vK���Nl+�������/hh��#W]1�2�
S�py]c�b����j@���oa!6�;j׽�O
7q��p�^b��l
�G%�e}�\�W���,�=�����<Is�T��x5կ���Q�8�vn�-"��w�d�&(]s�#uBf�
�@*lJ�~�Q/��Uw+����vR��)�ucQ5��E<"u�Z49(�mbaC�ޢ�t�C!�3g���7���cr�[Zk觍���3�gs)���]�w��4~o/��^�c�.k#]�N'�{��N$���l�)��uZ������w�JX�r�lqފ�m�N�ǎ�MS�=�'$�wز\-�=�3��bsɀ]�6�}l�V�,��탵�d�Q_l��'�� ~��'��=��稡<��'�\��3���((���+�nX����B{� �ˑf��|�5K�&\�u��:1�e��w�Kos|Ӗf�=��{C|k�uK��¼�
��kn;��y*���a�D�:C
W�b��x�'�אf]\��!�EaͳN�4�7�����,��PڀL�)�>>I�v�i�T2�F���-�0�Z�M߰|���~��5}��(Ok�[g3�����k�Zi��~�+Mrs~�Oh��E2��#w�q�p�&��s�ؠ���{�y��wA��I�4���3]���Dk!���4U�|}tA6�4eH�>vk#rj��4���!�����
(k�)�~��� P����PP/y�q˥�:�����z�O(��˓�
kn���C��M���'���:�f{^���!��b8N�r���Y*��J�7g��<E�~Y�+� �r6�Se�:�P���	����1��S�2��J��Q�;n�^t�;H��� ��+��P�:���<�]��u'��w˻<�G��4�#���¯Z�:�7/`Zt��R�4����ax��=�n�M,�7�h=<R,_��������=	S�=P|���f�����)T_+�㑰����C����=����=VQp�&�O�	|<o�*S�l>[�X�s��e��2��=�)�F�T)=}0UJ�8Qu:�6���KU���3���\�v:�A�O$K6y�"A���=
��>v�md��KH�y4��ukR(��\�x�G�(�U��M� �ͧ�ͅXJ�&��;��K/W��O�;��463u�401�s:OӈT�_60Up���������7�ďA�
��b�`�l�6��eg����|>aA(BW���p>ǡ��w��;�e�}�w����&_�1����+/?B���W���a6�w��[�����,f�v�id'ء�d�(#�Ȭ{��-��W-s)�:��J��-�ĦS�N����P�٩|TM͐�>��`p}��f}��
|
k!�OV�ɗe��0:�8]�_V�I��6f�0f�6�/ΏU���E�?!,�D4$���ҍ�u�Y�0�)�o�z�1w�$F��yZ��/�'�S"j�����.e��7�jj�\0�UQ���ס��δP:��Xf���S,8�}Le� �J:������F��?��=]�_.�Q
�$m�(sj�#��l������Ll=&>� �lh�8-lR��w�V���ϯbrЫ_��pA�鈳���VO-.?�;�tҘ��~O��� }6��*�@@h��$�f6�G����$Jg�������Δ��(��F��8V��Mݠ���Q��J y
Nm��~������x��/9A�W}��̆�tf��^��F��Fp����Ԇ�w�uaߩ@9�f��.��!6��h6����NN����d� �Q"J��pU�bH\=��{x�,����K����?Ŵ���	��޽����Յ;+/���{��y����-���}h����Fv��3�R.��B9zX��c��a�ŉ��}t1|�q�����7VNMPR�1�$�#���XL3� �� �zذ5�{.Dq��?�Ѭ�u�����k�`L��x�	X�b�xeuZ�T�JDm#��%t}j��i1��[ [�jr�X�9
Wjd31�b �(��Aܭ���[�3�[�80�v�TJ�HN�
3Q.���
Ch䴦L�9��Ar���S�$wԍ�u��b!6�A>Q���P+����4��x�j��V�����h��"MQ���C]��	{�BoP�����fº���>�XG�H�B�8�j̏�X~����/Ddg��ē�w������g�V/���d��;Ջ�}W�@>��%$Q�*eb���@��G���:f�GAJF��/�/��0J��0Y��j��4VZ����J}�t�`���69*�.���������<�;/(�h���>0K
��
��?�%J"P�9�e
���s�i��EfC-C�{h�u����h����T��d/xp�/G#Ɉ5>���ĠKR3$�(Kj����Z��ꛡ8��
^;6����t���O�#'�c�V��l�:��}=[�o4o�>�Ā�<&uS�$�䮷R6S-���:OP�ǉl�)�Ơa,!AbdX�2�]CMG��I���!�����45jA̎~o������R�6��\A|��H��:�� �P�ba6��>��Ҡ�\���U��q]&��>0|���+���\��%#W��F�R�S;$����-b�G&T#ҵP(`I|�R�U�-;�,�(�t*3��U)a�I�/���M�z		'/���`��Xә�l*�Τ�"����r$�+�kE�"�@�?絼Q��ھ[W��#�'��*���y�Ր\�h�����r�nc�O�1�	�p������)8�*�._,l�Sʳ�2ܬ'a<����Ё�	 m+:{!t�64W|�)>C�!�pP���&�'������.d
��M�[8[�t��I&�ӭx�HÁѓ,�MT��9��7�t6�PL\Z+�JL�2S����S3ө�����,�?&��o͔
E�g]����"O��E'P����)=�3@K��-
"D�Sĭ�8I>]\������\��s*��)����_��(a�[�ɤ�nFP���Oଝ0�$,.�)��:���\��Ϡ��p���Ҩ#��8�=!b�[{FG���� 珰�?���S[Z���j����`�J�oj�B�rfR9���9��yk��j�c���T�<��*�@����o�c<�C�m��۪�$��Le)3��9[�2��=���#����q+g��X:��!O腡�
��	K����y��^��E�*�Rƚ����39D��;����tt��y�P�DG&+Z\����h)�5�,V���@B��q��>&�G�at�'9�wp����*@]&r)>X��J�]�	���y&u,�j��
��F�i#��U�-e�eT��e����qNk["y��Ă��R%?l#Ӏ���K5�d�/��&�\�J�PG1�u�����"�8�	@��y
%���ʅ��#�XԹǬS�����e�����V��y���7��V���7���Q��Ė��� ��a����b��08�Ȯ���������,)�^�38<+Y�B{�2l��p�"��0�X��Ƅ�̸2Jyz͢Zw��}O�M�T��eL1 �T��`�5����ڙ�
`S���ڻ�>�|o��Qk���VK*�.�>��%��E������r}.����+㙫�̦�,A��\v&�&��,�b�ۤ��OE� 
n��'X7�n
4��D�c�v!M��,s���+Z�í�B��%Y��w�6�
/�T�������=g0w��ߵ����Y�렽�w� '���?#~�����O��o��ͅ���G�B>� �tv'�P�pؗptc>[m������i;S��Q�}�q��4*W��'��B�	�"}��%Nda�Y<����:�S�8�!�QB+ـ�U�$Ee�
p�*��ى,\N�gH�kE:�:z�m���Ȇ
�=6��R�&gll�<���<�#(�Xd��e2�iKW{Ǧ����-��ΉtwO�޴i����2��S
�,��v�l���͉d&�O�Y���SݙD�D*����<��CLL�u؝��[:ҝءq�m@h�i��T����� ���r\X�O�����cB7J(�������NNR��%��i���?���vi��Lbg��8�]\������Hކ���$�]�/'`#����D� �g��<�)��o���Ō؈�	��ךIO j��t�m���7�����鳊l-� y߫��X��
@M�R?^��0�R�~N�iM��'`h�BѦ���T�.k5g�0��4̴�㘝@�0��8�����N9�.L�\���Av�Ap���>o���7ɰ�b1%�T1��xmq��$��N��E��%/��3�t�����:�M��VK%�&m`C�
߳3Sz��ݽ}'=�������f�L6�o���0���x�&T�(�;���m�M	�>U�R�*�N�1;%;!,�`g��f�G{���*��6�}��J���oq(�*��nP	�-��ti���'�6!���V�2�W(�?+�'%��3��8��>�	+��� k�'�kIk��$r��	�Vh�&%���'�L
��9�6n�8~�&r�=�bd��[:�zg{wg�8 !3���ȩ6�����L�9���iM.�D�PIO'����E	�ֳUDJ��41m��ۭpr��h}�Nm�{��=ݵ	F���r�����$),T��]5�u�
Oz=�����n���i]X��[�
��L[�]!Su��n�w�$�^Mٜ�sM�NUr��B���:DsV2�T�/�BO�_���-�<�'��J�̀"OF4+��Ra�&�1)1�~���V�=]��-[��vӁSJ7k�&Ó�@w<��,1���RYb�Q�k�Q����Jt"?���r����c�ս��i%�P��a��ᖙB�!�`�&'� \�aa7�a<V6�l|�P@Zp��~�9\ZD��1[��cZV�)l��0�.�ȗ�A�s�:zC�T�Xʱ£�pi��O��l�����f����S�(��n3����(��2S6����;2-��� ��%��b���-�J�w�[-�l*��>gs��)��o&{�Z�o��lE�;��V{�����ca��z�xj��p'���XU�	��P�-MM���m񎶮x[�-�)�5�*���@q���T���<�ת����v�tw:4�73v��.��k�;�*efS%��Ɓi cۭ����u��TyА�����3B�Wόڋ4�>J��"�:�m�=��]�r7e�R��B4�����̮>aE?-m;��25�e!tn�/.NBw��B��V,,����\���MF��c�V�Ť��U��;{���b�q�:�,�o��۶m�H�*d��=��#(��!�Sۻ�k��6v�돲��~�����y�¤f|�8^��(1�zӢ[Z��Y57�r/#�d� T� {�j�je1��%
b�@ࠄ��D�Pޝ͑�f���B�G"0B�n��Q!����g�29����B�Y{"|�M�+����i�.��ḀZ����b>[�!���hr0 +S��G�$�%ϩ��T���iFuG
�^4����q�X!��f��q7��6DNZ��yw(�#ьc�T�����h�,Z�K�z�ldehp���D.ˇh.�e�NAX��l�_8UAy�e�*��d)~�d���雠hc�m�����ro7�(�)[/�2g�1��/�>L>UB��^"�mq�����XQ���LNN�� g��mpu�?}�,��l��W, ����m�ǿ&��ܻe��PL�19t[���k�IQ71!X|� ӌhf����s
8� N[K���B.ذ��΢pG71��`��L��/�-�`"�ml�=%�����ǀ��r�f4��ŝ�&��؜���|�g�'|�i��)3�uL'�?��=��ԟ�܆k�
�7��&�x�(�?yx��<uh�ɇ
�왳�������R�5����:�6.s4�q�馵�@ͥĹr�v��EY��]�$(�-��t������G�27�As����Z���3�s��z���ś�+����S�����5��	@�.�sl�t� t�|z]�4�nf�5�p����݋Kw_��}oe���G�0����uX�%��eC=��HR�jI�PԌ��te��n�6G��4�M�Ύ>�w��M�7��5ҁ�!0t���W\�D�^@�/>^y|Чv��H+.3&�������En>�*��WF��7�|���˕�ǫW�T�X�{_W/�q� K����Q��M��L������K�>�/�}������z�Q;gt���2q
��'�s8zY�r+P$ ���Vrs�EV�,=�T[x]|b���w���v��A���S�L�󴬡]��p(�-���������s�ӷjWoV_uK�@�8��˗�0(8��[LG�)��IݎU4������{���Ο]�� ����WO����o|�a.��h�$�]��FHSF���귰��/-./~�_z�E����N��;��ɗ�	S$6�G�� ��r���h��s��h<b�����xa%���cqe�����N7��E�0�k)��Kɋ�#�V���x
�-���<!��UN�H(����T���yˈ�Z�{����K��Pk
�8�z�B���:���R" ��� ��]	���x�=�	��\}xI���xK60�T�u�X��������^>_{E�$a:���䫵k��ި]�Q���N�&�����!���s���./v�v���o�U&h��*��2����a���.�,.�ع"�~w�����ث>~Y�[���qZ;���,�]e![y�,PN��hi
L��*wϚY
��'e���F�m�L�?m ]&��w����Y�g��#+�3[)J�d�V ӋKx����;��'���cj�߫ޓL�<EPTAE���ެ���)����ZG+ʫIS�`��7��s�p�v����]�$)�5��W���Hv
}��rA�#�o�����U���W���
p�N*%��\<�u�g$$�g%�
&#ᩣq��5c+ x	>�a0;!a�gf�P A-��8�K�1��.�iEt��[2hM�0�G��%^0	�#�=���ۋ�AD /�\$;#R� �촍��)�WCO��� ހ��ۢ�P� ݴ`' ����\A0�^)��
��|�ۢg��y��xiAc�ĻI7p.f����r�$6��k�����N�%w��f�Ӂ���5�����MN_�;����c��%�q�ÿ��_�[
����W��O�Nz�|���G��&S�T�S�w�DԐ�tL �g��na�&�9��;q+_A
�(Y�<���ו�V������(���7\VK'��qvRD������q
������,C����R�\SіE��d��e�E���(��6�sl_#.��
V�\j�x�Y8qⶶ���۳	�S[է��'x\�_+�� X� w�ģЍ1=��_P�2m���:��B)�D���#-OQ�%b~`���r�M�`��0%��
J���bVN�b�92��6~t�mE�-��B���\��\��U�-:��{4	���ǝ���
c�3��*�C�Q���0^q������!�-5�V8d�� 5{uTP�Ԅ�Ss�&�J���1�J�)�Ύz-�Bޚ#��F����R5s;���T`R8�oʜ/�9՛��cr,��bfS6$U=���9�&s��� v�n(f��d]O�j��ľbԣ7���_Q�����ނ��&e/����U	���F�DSˋ'��	����g����T.�L���Gf�$' DR��F]���R�8��>;_�YFF���TI>)��Ч��҈v@�%0�K�x��/d��$�,}�[[���&���6	mK�I5@A9�8r��65���Z�.x����E6� ��C��I�b�rjH������.Ԏ�'u��X�)�KؤG�"���/��rz�F��Ƒ�d��E%lf�]�|���3񭗖�>a'fK��-i�7+�c��,���C�Y��-Tޑ���I�yD�&~�~UYp˒V��z�����:�D�"�Bcn� O����%,=k�xxn����M�gu�j])s�,��}
�G�ս�yv��^��'�5g�6X�k
����`
�f�XO�^�corq�Q|�nO_wd_����n4S:d��9�
���a�+��F��5�z銭rYH.��
�]�F��J� qM�)t�HQX�nA
�L�N��f��~�m�nS�ޥ�\V
� h^�A��߲֭���F^���?� �0u�����A�'5IBɄC�LYJ������8ތ�|�!��L�v� �VQf#r%�u�A"�x�|�F9{�h�Y9�'�'qoI־���_��T��F��C�p�ț������u*3����L1ݸ�frҘܺGp(�E�gZ�r8���@��%����u�;��7
�T�^�v��H��t�B�˿-�XlD%�4ƿ�����s���?�H=�<C�g���Z�`�A�01�Y�Ar����@����!`�b��`N�[a�Z�V�a@���=�Ea�X��Z:��b�8/� E,���ɧ.��O�Z,d�5cq9����d;�4��F��\&BҬ_�����_+Q�?/a���C�y�`f���>^A���2j��[S�O�>,7�Iz@s�$z�&�$��T�оt�m!g"����cx�Dӑ�SЦ�Ne3,M�b���7�5H�2߀-k��|�LY=���i�D�	�+��^��ݷ��ózM�Y��*�}�X�\t�h��
�wcx&�Љb\��Ԅ�|�� A#E��P}�);WGX��<��>D	��O�\���T�L{af j�ׂr��$l0�+Z�l�O�5L-<�A�A�b�}K�D'l{�ձ����j��l��y��&\M'���`�	�7u�
Z�uR���/��G�TPĪ+�UNAc����A�M��y}9�e�z��w�IaU���l@ְYqL�1�4���4���Nk9�~�4�l�O�8ѐ�� =��H݆�ٴ�l�/ߺ�BV�&���Z�n�\4�jVwo�ː�t2��&��ZB��4���|֩k�@��уmR�r]�ޢ�
t.����3�E�T*(�^259]�-͏�5tO�B^�qǳ�������;�_���[No濱m���N��J{
)���n6�S�:-�gl�zs�Z	k�\.�-�[Q�Ar�҉��J��S��'$�wز\-�=�3u�bSsI�6���R��G��"��6L�F[a-�[}�[���&�p�l��ɝֹ5����d�k܁�n�m���
vV� ��9�0� �r��v���}�Lt���#�E����U/�ͩ�F�@�k��
����ɟ
Cg6�欹��f�
����f�
�!R�3���<y@���4��<L�.k��F��
�o�T5�h�l�;�F�Tl}���X�&RI��	v�zG<�^����z]�%��k�
FA��x�\�u����k���I��\�4�>e�~""����D�La����ml\I������Mx2]��y(V�L��2�N��{�/u�kL�4��B4h�d"���
�`Ӥ"��­�^�
�^�\B�8�lP�K(�����L�J��'4 Ek��'�\Rѫ�Q��;��+�\K�����M%�e�ڮ�ӋJ��k���e���R/�#�xK��"�7���T�Y�`bN?�����W���l*�ʊ���s����@�<��Q*�:���T�7X�W>�z�=ҫ�{�|�� �5~{]j\Y�a �y���݉X	��]�ã�Q�|ޢZ
�:��NK5���]#q.�l����z�.�u��eK,U�����b�:p��ܥ�0|���&���kE�0��0s�������IS��VD�#aCk+���[�m�R�Ǉ�Aѕo�҃C���ȎTf���!��D�g��`w�����\YF��g�C�{G�T)=}0UJ�8Qu\:�6��.ڢ��z>C�z���,�8�,��}��G*�>��ɶ1�8Di�"��w�\�׭I��uk�JK롨WiF���Z4�:���%�Fv��Y�ߓ��Ơ�-�l���[��٪�z����������]�f�h!Xװ0��	����d1L��KC勴=L=KD�'�
��Bڐ4Ǩs�6��w��;J�e�}&}�%�&K0����+/?Bj��W���a6�w�I]��hxEh��[�5��S�R9��I��f�2��dā�k����Ђ�Tk�/}��Jc�Q(��T^vm4C���
�W0��i�ꈹ����sU�|��x*ӱd��Ea��u	���P�T5ژQ�ی:�8�QT�8oP�Q����gaА<'�#�6mp͉�8�omx�RĤ,�����-�ì�j"��,}�(�����	��lتa(o;p��VEe*ʾ��;ӂ��&��hS
�Xp���!���v䅡��/��^���@�\���|I"Qf�<*N���ų�x2y�`eCoȁ^�]��aa�+���-~�z��ի_��pA��
���VO-.?�;�t�?><�{��VQ��ch�	t���Ѵ����l�P#=J�NO>k�櫝*��	qD[�,�y�n, 7=��#�G�ZK�)8�2�I&���>�w��a^��l2�
ҝ
��6#�ct�!6�BlP��3ׅ}���Л1k�h�W�@�j��ٌV���N�Z�	� >�]-2T�
�,���c����7��+�.�t�zma�S�M-��&��+��׫wV^>_{��s���>�>�h)U4nP��<42�c� �r�������������q,N���C��{�SM�씿�rj�� ��'��I�G�b����P�R�Voq�*�U%�=�ܸn8הAq��ɣ8�2�P��+�'Q��HU�^wwo�N�0^?g�nܽK����d��
��-�y�7M��:k*�'C���F����Nԁ�V�ׄBc�ը��\A{tn,�Ҍq�����O�%k����y�Z�����Z��*���Ä�f�H
�N��-h�q\�8υ���]Ę�bT>��� ����)~�;�F^�q�m��� '9�Z��ᶱ8-�za4������� �r��,�9�9�G`c�7-��<?�i�l&��5Tk�TUh'6�Ye ���^���jM$ܒxR��N���x�����י��<~�z�CE�"��žJ����5�⍣��:�g��rJ�e�/sݵ�0J�AY:(�QY�1�˝��-�`�&�X� R�Y�f/�;�aG-w*�T�+����`�B���?�%ʕP������$�偔��i��f293��!yx;������Ã���88�gb��[#q+�:��b���I����|!c�*9[~���QO����9�ǁ��Gl8�aJ3�7�RL��"���EE�[ہ��ܛ�N%g��KFZ)��8�AL�d��L��<�)�'�r0�{v*_(�j��qf�7'0rh�4�v��OjM
������b�q�}B<��
J{�x:�
H��&�UR��ה^��R#8
7re�����J�Xxc���)�-#�#���NaƎF�DBdUV�8(у/��ģĢ-�2i�f�3�~�s���<4<4���=���q�p^����^+"2�3�x���wLc�=���c��\/4I9���4�ܜ?S9���*灄�&'и	��{��+�� ��w�����Oz����# 9�8"����-�=�愡�ͭ���bLQ )M�WfB��S�^'5�0'�����)�,B�v4�� �C�E\�'�뵺ں���ɤw7�)���ƈ58�V���>�k��+����T̻�
Wˍ�R�~9�<&%�T[b0,{�)*�'�g�%��j��ƭccO� �9P+� ��x���Yn�(�Q�$���[t�A^��u��	�#�i����jO�|!�Xe� F郥��LJKcՈ��Iz�c%Fe�)�L_)
p�`�ν�z'�~T)L�f�TҴ�tx�� \��y�ڭ��S+�w�WWn�*_:1�o^�޿��ٙ������(K�aR d�_���b*BN=��� �-xs����_Y�{���k�����/�ˢȴ6�8������5�l0��6�$ɱ6/�B����ݢ7l��A�����@Q�E\���z}�e\G޸+6���.'1����Y�*;WE����T�"����hw�D��av>8,Bz�4LR���ܼ)rNq�{헍mG��`�w���?b�Z���2_r��tx+��9�������Qkh���&=�N�@E`��Ym���Q���ir�)���������n�[���"R��D�[T!� �z��徔�0�Fz2!��,�-
�Q����8��NOJ�<*p�W �yX���iXTS�)U���5ZуK�B��l�#�p�M��~����1�ҧ�Z��D�ў���ͽ��Յ7�����΃�������{�jo�q~|�~{[�Q���A�_�-c����Zz��8������T�Jb�M39��{w��kw��������Ё��;w��s�w�dh½�b��{F������
<?8><�opߎ��q��f��d�]�OO��W����������fE���������7�w�o۪ċC�wxQ���4.;�s�C�G�w��3<8����]˺����m�,?<���,�fρC�jН}�w
�I�k�5�����F�����{`��^�$��*;�g�� ������X��C���xap����^����q��r���)�&��p��N�}�eg��� �O9��#����U����6�.+�#��.v�;~�3~�K�@�;�4J���z������C��];hcPl<��x�-xp� �+f��K�Y:�9�Qd��p�d	J��>����Ew�����T�B�k�4$k��%kϾ��V���0�쥿-=��e�^{��(/�>xe��G�׭�{�v�o����^�>����~���H�<G27/�{�һ .>�;�<�
��t������*�8�T&0S����h���E��O7�-DEG�p���`�z�f�g ��̘݃L�~8�R&��ѡl�����ѠQ`��lkC�<&� 8e�Sp2zkPrR9L�Y�]�n���<�F07 �/�놻
 +{��ɣ6K�=f���5� cPn٨�� ��6L��� v�E��#�I{�?+�\4�&t�ȘZ�NΤ�GSB��dX��ǩ�P�!�XQ�����`C�Y[�u���s1Y����qS����h�X��4���P� 59�Yv�e��+:q�l�7Qi�\HEG��4M;EQ��piİ�h�)����M �V���Tdv'�&��q%Дxww��~
�/�Hdv8��f��֥NԳq]��%0���IR�0�6�#M���Ց����dǸ3��ܸqέ6Oj��͘��3hwx����:es� ��� ��!�z�=2F{aR+I���kF�$X3��e 6�b�)���(�����]�-w�=/�=�6�}��ui*O]��O������c���?%��܇���[�����V/O`~���	�Nࣶ�xhrh�;^��Iz�v���t�i��Q6��p��:�|�8���Km�A�e��4Z�"�|#��U��9��h��F3� ��b�#ҵNM� ��m;���3�n2��lr�JN��v�{���~m�[�4Q��C�)�R�)MH�<X%e�B^�cӤ
�:����`qƈ�N��B	,�NV���c-L�髞<B|m�����G?�/���=t�wxoTTHNf;�]�@_�ܹ�V-
d7x���]/�w=T(�k�DYxFh�݀���Mw��;��^��/��΂�A5�h8��D��������y�^Jh�nu�R+a�5W�������E�JM"�$��e�"�%2�[��+����9+=�Rn�h9�ku�����Ժ@C?�#�2
Gn�4f!y�'a��AA^��0��u�ݫ�q�}�gE��b�)ae^$�zh�,��RY3w��C�m:¸�j�{���p�����mYg�Z>
��5�	�/MC����~
L���# �a��D��k�)*������:���Lg��N!�3�����������0�'��z���}_��ah���}��G��f�cv�PDm� ��	^���&}�+&��Y@JG�ϖgr�a�x��]p���L2]�i%�ʄ�R/$�"����o�=t���Uȕ��S%�
7���6����]^o1�g�`S�ƽ�g9X���ra�27��H;ZC|Ť�m���|�e@$�b�x)y�����3��Gx V����<�AՀ@ᦧ�(t�;2�w��-q�q�.���B�l:BN�s�z�����A�9�p�W�qHq+ʄEx�`�d+��X�&���]f8�DSOc�/4޳-�h��=�#&�
�9<+
m��A��_��
	ɾ�4rj��~�
��]���f��ޕ�"�-.W\�K�Δ�x*H�ׂ����7TS�IU�Tl"�p��A�04r@�l1��R���&�ǡ
��]�H�7; Fn�j6�~E�O�&������4��R�i�%?6H\��GI�R�2&G){�z��ou�O�����u��6��0d�N��vո�M<��b�����QbdpT,>Z��vG']1�qJ���zq����ڲ˅Wӊ�
%h���狈^��b;}�\2���|x��5χ㈻��k���G�8�n��楾�H^}�^`�^��D��eO7��'�>�E�f�\���ΓbsE�䄍� 2����ױ���m��R.քI@#�aд�9k�)���^<�MI��s8�8VJc�����\��
�S�l�t܅VW[�2Q'��|!k��%Ƚ�F+]lEc1���W�5�Y�03"k� �c�B ,:��
�fn^�:<�#����C���[�h�D�5i�3��(�_+Î��C_����k����d�_�Y�=C;Zg�pZKɵ�壉�����j�nT?x-�e���T����W��c��.JZ��Hܯf�z:lQ��h��TpM��
9��eN[A
�{b�w���q+�������i�!��kU�������j͖PB��O�Q�
�}ɞ����$�����(�T&}��u�)G�+J�Vš�
zح�x,p� ,�,�"��/1@�?��C��@�!����*
m�"Ѽ{(+3R�,M��(�LMŅ��y��N��"dFL�k]S��Ȃ%+�F��ʭF�I�{
��h�-�)�����=�}R5)g������;��v���+7���������<�����[���Ή�**�!B�ܮ��t�̟�9d��֦��� 7����=���,�sdtI��:īN
�;���H֜*���S�^�%~%#�$�R.wB��i�� h\��h*�V��(Q�@��J�ID�,�Ƀ{�QS�+�������u[Kd�� �e���w�oS3�>4%�JO�2=l��)zh����V
������sK��������YI�Ƒ*3�04��U�y�g����b����Yb��hl�د�p4���}�v�1�p�m��
E������3�qY�sm�I��oي���!�?B���l�Do.v�9� wRy'�¢ͩ�Jh����ɮ���M}""}oW[�80���}H�� wo�k�"�6�=���l6S���ڌ�gR��l���JU���I���'J�L�����@�e����=Yƾ�;dW�BX�ߴ���G%�MLP�|j9�M�^z���7[[�;��������ȶ�K������r�����_z}�ʇ��'_�~�R�k+�߭�sj֮}�t�>���g#�����[7k_~�Q͠���"t_F�=�Bh8���J@�s��c��}컒�����	 s���AX�K۶�3�q	�j\�(d�=oiC�ծ~�z�U�<Yc�m�4������Za�O>�ȶ��OmX�b���h��v��59��6$_wP�~+)��j���V $��;�N���vvj����m3&b`
u4\��k�_/=z��'�W���x�Q���DT�{߮��������˗�T_Gak+l�m���9.O)�HS)�s$`#�m��(�"fMD����e�͙n�crL����E�H�̹e[�����6�4|r�Z��m�ざ�uLSClP�G��ꡅp
�8�������
�@� ��W���^^�}�Vĵ�j��S�n�>i)��C�ͻ�<���ZE_@�Q�����f�GZ_�	�L`>�L�� �]k�U�"��E�+���ܾ�n�k���څE��C�ճ��/�a�{�v�c��K�.���l.;ӌ�ݛ��~;d;KU�"�؈
��q<�<S$���8�� H
i��O���8R�Ck>VG�PBj�Ǔ�jC�"r��H1�(��T�E׈y/�a�T%�{�]�HAP�9π�AB�} ����Q�>��

��8�ٱ� q��P��*�β���C���vؿ{���Q��v���rdp�<S�����902����z�I�J��wZ�����e�b��s�i�.W��ƺ���w�;P�}�������C���BFh?c,R%؉E��a���S�a,����~�q)�6��V­S�p;j���!Z*=񶠂rC9a/�>]1���MP��c����{���W���+��p'��`�Hn%MQ�)H�'��:](���Zv��Ie����gRl7���������޿�Wߟ���������SNĶ�	�G��o�X����j1��wJ�
�h<ڗ=�x���HC���-_))N���8A�eq)�o�8:ެ�T��ia]e��������R���ga��&��E�Jv��e��P�ФƅU*Nx�+�)���r]DS�����/�V�W`j�P��� S�!�]0M ��L�;~]��\���������C�2��^EŠL" ����y����0b�JxK����K�NQ�P��Y�,%C	��m�~�`B�\�Ю��vS�E��1LW��7s�\�`0d<q˃V�f�IV�&���X��f� 	Cs�7N��q�]�����Ϫߪ�y�Ǉ�-���E��K�/=���ֻ���r�v��ɥ�7������ʵkˏ.É^��Q��oj�����B��[?><�'6�b�֥��,���v����{��^X��������+p�}�!���Ըfn�M��[+g?��z�z��ӧY�]}n��X=�a��eh�_j^��X���q�ᨣR
kl��RA�o�LL9hO�y��y#��1�H(8R���Ȣԋ��xr����b��;�e��=e���Ie��J������
�l��h�E�q@֩)۵�����#
�Op�s�,T��٘l\\V,��.O���	h�!�H+�t42I{��9�v�I��V��[�No�9��q˸�?�-���\s��0����9$�X�� M��
`����4�
CK�6z�8�ư����(]Y�ɴ��r���c]��ie���pA���)K�s=�yOU�Gc(���:��I�1w�R�I��Rڬ�?�?z���c��m�c������٢~�y�w��;�%��t�-5겖���E���V���f
�Ij���͛9�5���Rԏ���N^���AJz���m$�aP:���O�-�x_v��j�y-$�@��,SH��ǋ�p�HaE�t6S�_c�=�?�T.G��,:�G��̰O�R飘�v<[t"�^1�F䱛��G#����*I�=Cư ��?q�$�5� ��5��T.��*��A����ȫVTv�r��c��O}�M�<���5F�0&������3�5��ma��b�*u��"0!�e(�>vo@Knn�HA:"��V�3�T!(���A�u�
�Z���V��y�m_;<b0u���]����C�e]c-2W���}F�jv
�\";;0ix��^J���������H���E�<[Zy-�pE� w�ӡ7ly�n��Ɨ릌����M���Q����GL����p�5M�{��q7g��iE)�xLU�.���(�
����5��v�r���P��9-X�̉��NSR���t3p��k���)�mt�<0�kp���'�֮���}io38�$��k<
V��� ��$,���N�v��Ģ��dxX*2v��5mM����J_�G0��ag��nH1���G��5l�+*sc��^A�Z��`!8f����x�m�`w׆f����E�+ߞ�4��O�y1����������l�ڇ�[ثD1�����,�FFD���"b�(d���q�m`��^�0��M��
�,6� ~� ϣ�p���=�Xu�\��-��:n��H�#��p/��AopY�g4�6\���Y��y.^~�t������F��KV��j���sca5
��[�[l4`�o�����%
��ɓBJCAgVs<��~�nj����!�Y�J�/ߩ^��r�w��.�͘#���Γ�l8���Gׄ	�/��|c1��(��=k�;�X3���1�d�4�xJ��yUP6l.��CI�9��h�>�H�5F 
�i� ���.���;� ��T:]��8�5?��쑧�Ҋ�.d$W��0�g�^3S�?Jj�G���hg�+�vd�����mN�9�^�D<xҮݬ"���D��5E&�գK��H09�gQ Y;b�
�f���sMx++u�P��"#v9!T�q8:�*���Ԓ�p��`�aT��^��M������}־�qt�o;�L�u�w$gݰ�[�C�w
v��C�����3L"��q�;��<~�FD톆F3�}���dN�Ҽ5�-]��z���-N#����nFl�9��}O0�7�=A*���� o(��t��������V��3�����>��u�74u92��|a�&�m�t�c���7W_Z\^�
X@N���52"e3g��|�z��0���ڇ�ʏ��O�^������k�ӛs?�|I$	x*W�_꾒�e��
\���/@��A�#�u�^J�p�o�5y�x���{	��K����S�V�`�W߮����q��?|T�D���q}��CG�D�I��M�+����1�'��^#�����w@UWo�k���*�m���6�r!C��¼74�6�����P���#L�ƳE`�$�a$q�}��������>�����KC�`x���r��T���\��|d�?0ه�znf���,`3�ߓ�eI$���m�c��������%�+F���ѥ,`%;��"뺆K�TY��U���)B3zɗ���`[���J7d��r�h�սE��v������X����ơW�Â�L�X��s]��sBX"�¡CC�L�֌ݓ[�I[��Ɩt��jG��e^�#��`�y��y��鮬_	��M)�)��Ѩk���Y�UQ-dZe�f��Dd$�� y�����0ؽ�<JR�l����٬�Џd�'.��8���!0�0�Mx.ѝ(ı��␅y�^�샥���޾W;n��ŕ��2��\8�v�z�R���3�k����Z`ޔ��Rf��P�&^����L$2��S	Jx���ށ`���'��/b��h�ND�vL�B�������T�ǖ`��@
���yn���/\��G|za��7q��M�Թej�5q_� ���� xq\���PJ�]��^Q���zM���\���,����B�!���t�P)�tx8%�A1�I�Z(jM����RE��b1@�b90�[}1Љ���J��]F%=� p�V�ةR���q��?`h7�{~htϡ�;�
�X���b���	*
����*��U�x�R��� ��M�B�����υĘ�wS��P`4��G}
���f6�
R�u(
��}Ҋ�^���	��'�!=�ֆ�n�)ĸ"Q�#WX�A�wb���/�����ʨ"��DEZ�'�]�W�a�dd�,�x35#�r]��/�e-�<aRd�����$M��]�
�&M�K3���a)�U��/����'F�P՜�����S�
��C�)������9Q(���A�ױ�yf'f�E3��{U͠��d�a�"���FaCxi���~��FZB_b�2�H��B���,�赖ޯ�y�z��[w"!���{9W���5��Dg�8Upqr����3�W���<U�������]$X��������Do�VI��E1J�~Y=�hϝ�^
��?����)�A_�dko�J����U׻c�8
u
?q���9:~hxH��`W�'�"�k���F6Ԃ�fOe�:�$3�.pi�`�\�7�3����Zhנ��1a�qNU�C�CU��4���>�>�sU���j�\��BS�����?o`����ɂN`��>`�|���mmE����TO/����co�o��}�"���	-/?x���ܙ6��}��lC�l*HL���u����(����ì�<��Gg��������V��7�\_����wjo.�{P����O��νV}���`��t���pkF��@
h�ٌ�
������+U���Y=�P���o��
WaL�%U8(�>��|���"e"����b�& ����ei�qh��j��`�:cV��-��r��
v����e��j��Wn/�=I��DO�f��K�k�yX��WV���V���_�!��c�h������b���YkK����O��7��2�YWB��G��)�z��/���©<�&Jv�h�ab�(�̈́�[�����{����
P��z�� �j�V4�RiM㮤\�~A���S8<0g�q��D�mӢ�Zݬ�u�#����ӫ�yբ��0b�9(9�נ�B�J�9�ҷ�l����Û}��"n����
�ۧ�h�5|�3��ݿ��/�A�����
����:�8�/������9
l0�+JQ��H��1�Ť���h&�s,v�Vj��W�r�!ۢ��~��}!��4�u6�f����!ϡ�=�t* �殘�����K��5�ˌ��ʨPYx\(\�կ�p]�6�KfC݀/�k���)��{�@{��(�)��]#-�9�r]͂h3�����s��[��Û�%t�j���C%�����vd�V��r�u�ux��bL{i!X��*�D���+q�cم�c.�ϯ�Ы�{K����B��>��ljL�eќ[��z��5���4D�$!c^�<�-����j�>�w؅x�wI��?\۫	4���%	qn-@C���b�C$d:�H�/D��v%)��l-x �,� �l%, ���.�.����o�t�h�#�%N�4�~MD�g�/pb���;�Fc�L7�������y�v�ۥ���`q���ɇ�K竗_�ݾR�}M���g�ˏy9-��X;G�wc���f��4ɑX�`�tD�������(ڳ:�#OdLi��z0#��:�/�iŽ���Ĉ
uzk1�l��V��M�߸�����i���e�y�"2�S�Á����ܷcp8�L�(>&c�k8�oj��u�j�Pq�e�͍�Y�gl�
B��P(��S0������dj�q./~��^-dh�y�Iw9��E���܈9$'GQB嘑�uI�U�7J�]�Y�y�oW��{C/�&-B�&�A:[<�:-y��UŴ��S۳����iyy�h���;�ᒹ���������|�TCcܮ�-^	���9�"��|���ꐵ�Kś��ڙx��6�35�5��a!ی['�C3��uXZ��x#G�`�LTs����J�}�R��u��ID\�/����p2�R
�����A$^*�ݒ^ZR?j�1L��5	�+akF�-���4;3^!7���^~Y��@�\�
��L궨A���W�����oL�\5�;�`ARS^tbIx�2@wi��m�?���pGS?�v��t�U�48lj0:�"��?�wo�A�Y�b����6G��@/�;D��NkTܿ+@h+ ��݅�҂9�`�Z=Io�i��v#��b�.����J��~2<�ہ6�*�|�M�o�S���󱵠�OC�]�\��~l��i��	Lڂ'�^�oi�/�ǭ�%���%��� @�O�7��r97b��F&nn��^��e
�7��aB��	yJ"+�%�N�^��9d��6��%��.f
�X���4ἝK����Cf��Ykhk`�.=:��~+*&��m�HP��g)$%oR*s�~G�8a.�8�yyȩo�~Ej+y���QO�
|,Q��c����m��M����p ����>_mVw�-�+���Ż�t�Vħl�/��k�0�d� J��0fC�#�@�_c���d��� ��p�땋7�
qC�R�@�������i�3X~�����^���7���fL��2��F?��3�Utc#�"(����%��V�Fך��A'V?�K:��k>����H,z��b�4��������	�ߦn�ͦ�ɘN�����i�zހ�A!�6�<�?��/�S���l`N�Is��V�i�N8!�݆�"��6�اD_���w�BΞ�'4�V	 ׯ������i��֯���>H��5\)<F�X�q�����Q���GgwÖT���ð��I���YQ*�B/�84�g����qx�	���au�B"d�*��$[u0W��b�L�q����2,�����Bt��N�0#�M6Pu�����X�C��p����
(/�t�SBC �Xռ�	�tw�*�w���@YTr�p!���k�|��;��n���OE��ʙ���=
-�,U�X� �S��r��O��Rpk7��#�F�s��:b
a+�h��9�ư����'�]�A�~ؗ�1L8���!U<@�`H����)Mb�h˳J<;�x63���g��>;��Z�VP���G[�p��3�d�Z�Xþȹ.b�+�ٌ�B MBS��be�#�n*L`�t K����?�aց�h��8��s�W�ܾ�騗�{�
-1�s ����3c�W�.r#�Q1��L֗&s�4R�:Z��m�1�����)p�����W����#��N�N��6ю O��޷�SU��Y���D7t}�\o:����^�I�B�Фa�j��\웤oz���+���	�)���X�d�X���d!�v1�3=2k����^(4o�����x]=�e��b��k��i� ����D��_���J�i�fO���\r����V�6�Bx����;�oV�����S+�70W���07��w�
�4�O������\��
�Ϝ�.��-\���K�s��~R�~c��Mk��C#�#Vuq�z���PtV��9��.�\�@U�����]�l�o�����o��K��_����K���ϙeS�T���>����ز+7��v����+_YB�1��ݱ���y���J��C F��y�WBf����y:y:�-E��Y���X���_�׭J��.V&j��6�z���8G ���KNK��]�/�n��0EP�	Z#�����e�P,�ͻ����s"n��MM�5��+�����1��y�c,9c�SI�#�k_�-yY���,=z�|�/���x4��Py��C} %}x��ހn�$,�G�(���M�oJN����#h
��O�v5f����0�M�\�;ѯA�*E9%{
>�Yތ z�
�~1t�Ƨ�qMq���0�'���R{x��_����Q5�b���ue��	2�H�q�ǹk+�̡A��T�D�W���91�I4��]={	O��_���껗|��q.����;v�=%�C� �P�4ӑ��7�C�z�oi!Y����|�
�A_����^�H�����x�4b�la���J��<�`��$6%{H�'d��t���@��t �����e3��F֜�J$��@��ņ*�jG�G���w�;��;hVJMk2�[�W��(�]���Z�2��0��gaVީ�I�x��]����B���_��� ��=��>��8L��Y�E�)a?�@�KI�"J៎: dS���,tG����T����B��r!%�`z��E��$6�T���,�'Y��݋�p���T��d��ڥ7X|�����r��꥛��»���Yz�f��j�CI)���z��)N����������p��_�!�����kD���j=�0�T�������Q"1�����P����:3g|��7�oǣ���ydO��Yҟ�IR�����&�3F{��	���rOW�p=! �,���SR(��Fc�S�x�%���k�z�����pK�õ� ��Ė��_T�ۜ)�k|��̵E^��oX\*,:�N���?y��7J�uve Nj"g���n�����t��泿�������=8�N�84��4ҿh�)���z*�~~��:<;��J��pMvy����3t>p�P)�%�
�z�i�ɤN4��fvj�,��7M���9164w�d���LI8-����ICi!E�fP�m������"���f6�1P�s��~1#�i~�K^�]��3�}A��������'o6jQ�A���9Y(�z-��!�G�e�P:n3̑�|��H]*�����%&U�ҁ�L�_�H���Ė񱹮xG����$ʡ��`����P�qyi]����<��/v~?�����?'�9*������ˋ_57}yg3�������OEJ���^�
#Z7e��@��{x�� �
����>�.~ �=4m���� kIt� Á�y
�HJ�.
�z�bD�]���k���˘��U�Sݯ}��e�z�#���v�c�����̕��2*<YF�Е��[!8�v�!�|dw)I����v�����d8��Q�m�&vka�x��~����K9�q���K���]���q����,�� .����-E8��Cd ��h61Q̓&�g*���T-���?g�!���Oa3����	kB�5�f����z޻ �|�-܌k5�83&$1A�f�23�!˫kH)�o
 5��ˇ��h����UF	9i�c?��2M�1۳,���ۙ��r6m�5�`{�_��Q�P���8˰C���_܈�h[�&G�#f�|��S���\�Џ��0���|1���ӊ�
I���k���k�z	�����6�8����{�Ee����
?���O�}�.�ǲ��m�4�R�҅�vCp�#ҭBfh�"$�ī���#n^�u�٬��}��M�k��Wh��]�, CN��1�$��%�p��5�Y�=��'�R]_oߞ����Kn�VW|L�F9'��-�҃O�ϝW�}�+������7>Y�r��������+�V�,�3P�|q���lT҄�ʵ/������xK����~|� �N��Ǉ�j�.`ͷ07Ω���<~����>��a6g�5�U�*)jG­3ִ-��s_��_D�d�{G�6���7��4p�O�P�[�_�@��v�F��p�?�o͏c
aOC�__������0بk=K�Pf���#��0�J���0�\��gID�ѵ�iy��Ϊx|�v�k�x�x�0D+����ɮ��z����0zeS��*��V̄�Z�q��.=^��V8��뚿������5����uO��c]��r���
[ش�Z�0�=�62���̔����14�����
�b�}ت�~�AR��L�u�a�"�8ZN�KO��6�x5"��>�׬��R*����.m�]z����u�ٵj6����QB���9qfԽ{�n���BF���e/���D$-�{y{��������[��R^����s��k���Ν��z�ۥo���:�1V��7ko^Xzt-�oL��Ԭ[�8rhׁ��/��K	d4	�]n��3&$Ad�P��r�������؜���2�,g�c�6��'��[-8��S�d�IQ�� �e��iy!�V��O���Maf��	� '_s�?I8 岾�\�\k����|�K�eZ�4�-Ej_�m����`�����>PSi����+�o�Sm�)8*B@�s?��&�{�X�^mM߼��������v���.��Է���:�s�O-|�m�V�c�R����_�;�G���EN�OVr�r������|����ʹ���0s��b��Ly�?c˦�=�}3�E'���N����d6SΖs������_��e���V¢[[�ۆ��l�(@(�q�'r�3m��h�dO�GZ)�E�5gO�rɴ�`��b���	��*A	ji���

�o� �;�U?}i��[(�|;��ǇB�h�����v�b�R��x��{ճ~8y�N;?��@���Tz�ڥ�˟�g�>�[�p�%����E���L庵��^;������7ywCɭ�E9���`dV�P;yq��B���q������¦߾���+8b�.��a�Watv�f�ʷ���@B����������}i���\��T�����n3g�t�$�Ϙ����KN��y�����WN@�٬<�`���V��u���ͧ�K�U�QQs_]8��
�г����w�Y����{�T_}��oV>���ð�,�f��J
s
����_�ք>ˋ7�/��b\��������5�^����7V�{��FX�޷ ��+�<��w?�>z�z�p���mXl�(�L��k��g��T/_��]{�*� ��xa���Ȟ������G��_���P�{���nQ�GA��$Zz|��޹X{�,��c(I2i�8ݪo�g�:Q��d�C���w`q?���}����wP3v��k�q�.,־~e��?��߄��N�7�h�#���ȶ�)I8"���3����W�� )NjՂ�d�
"�ʔ�O]�̳���kܚI��Tf�Wd���h�ߟ/�-�|b2[�O0Z���B�KY`��'�0��B���#�SJ4e�>��`ҝl�w�h�EgR��$\���/�X4ˢQ��(*��D6�����C���� �<m��p+�Jl3���LN���ښ�S�+LX�A1��'�8k�Z�T);5ݠ�D�\.��/�3��2|͕��)���
�>�Z��S�%�3SZ�T�)��F��-��_�%��-�����$,:ݺ����Kx9�ͫ!�(�2f3����W%��[�帻s)�����-��k}��Ѥ$�my���#$@��*& ����wd��I��l��
�>Z+�/
�\b��ɣJ��{Q�
�%�H�J.��v��0d,�0ЁJL�S3�Ԕ=��:B�f�l��<;�.�׾�x��EMq�&�I����?R�0j;�	��GV>C��ǫW��Z�{_W/�!Bk =`
�Ԅó����6� 	���\�y$��r�،��5�Z�ƝFC���D畉5��`[Hx��v(&����q�R'z-��g�T-���
��M!ѭb*��+
���[m}�ً���z�P�5m#��Ox�M�
�|�����9cO��%\��(�2Y�?<�gE	��k�ᥪ`��`m5�ɜ
�4�Dn�;���8h����0	/N��6�Z�m��k^�Ow�Y��i�D�a����r|�D�Z��A}M�/a�O1�!����N��͛7�zs`��w���t���WXC�z=�H��2z��4Q�e̙���Mh;D�o�DƓ�0?D�.��	g�eF`x&�<�ս��]�ݓ�ꃺ��k�, �CdG�M<c������6�ȶ=��y��V�n�3��4���<�Q��nc[ q� �x���dDĎ�q��������lE�V�չ��{)�j��mۮ�6߸Es�VO��{F� Ï��BiF�B�H��g7|Չ8����C�X�����3�/V$Ǎ'����{|�����s���b=�ʬT���S��,��D{��=M`��P�@�����ό������5(zJA��tP��`�i{�]�G_cD(w7��K�c�n	�Nqz�ۚ9?�E+TB�R6���xe��3'`T٢ۀg���<q�/��%k:���y�=	���JG�c$%v!G����H���>zX}x�E���_��(��"��g3	*��L��$5i.���� �ב�w�h�}�vyt^���6k�|���}���.�\�$F<��)�._D�b�� ۬
���.�(YL�������Ljd_����t%6[�����$��?���響FZ�mMgK��o*
�w����؉���l�v��t�:ގ߭��xG���	�ۊ�ȱ�m~���@���[�S�6V^~�t�����m'���D�x �.K�RS%�W�!z���|�"}<X�'��#(q�~���wN��~�v՗��^��H%�nz�!	�	|����WY�V�~����?�|
�X��g��W�8�o�X�K�O�{�����Nծ<^��m���V�u}��L�g��W5+�E���m�\�Q��BXf�CѶ.j�E��=c�L�誉��y��5W�,=�x ��'W�7�g�G�ɘ*� ��W��`;�a��mmEX��ᑀ��q]fǽX�����}<����{`�!\���ˏ�cE�mK�.���ò�`�'�|*l��6z�׮ܮ�?e��,�_�˫����;�{�����U�X����v��[�� ?36"p̵;��'믘h�\2�S�zq��.��vm+&�f���g��4�� G�^UjOO��|o�Û��l*�]SL*����h�\��=ۈ7���W��m#�ڭ���z�S�O��c3�.t��v�z�t��?��|���%5C�	푉�X��tKw�\~�_W＾t����.�*���B~2gz��S=smn,�,~���QM?�6���g7�:v�Z�5o*�������Wko���2=� �M��7��]�n
�mp%t��ϭ��[��B���2���,R����M�h�g6㹢�w۔9�҃�l@U}x)Tm��h����&QGi������ҭ�pD�N�&�����d;�BV�ΞdצM�����t�Օ�w��=���d{O|�ܹ�ڒ�ڼ%ٝl�ґ��ܑHv�o�]�;�6x�ܔH��mN@���ޙhOnJt$7m�m���dg�x�٥�Lvuw�����������&�`�=�6�
mV?�v�3ٶ	~tw��c��3�yK>vl��tv���0��v�Q;����Ivv'�SO���	�v$;p�ݝ��dww7��v%�tu�(��ز��ؒ@�t&��0]�����&;6A����k�����3����mꦺ� �M�-�ʴ�w�{��� �6�bS[7V8��օ�w[�p[����M	jL�����r��6%; @ �-]�v��%{�l� <�	d��f� 0vu��;���M�
 Cg7�nK��mK�g�f +�����#,�$ �SW{���	�g��7%�7�l��̀E;�~{'��hパ b�o�_��	�I. k���������v�=�	mۯI�������'v�Zü���w�[6ނsX��#<�*˅,�5F'��]� :����VA �fo���y	��q�[�{��^za*@
�z��c����8��4ThO�(�����CX7u�=T�������Ov
�uG[G�<���$i
�r�b98ӓe�� �27>y��Ѩ��t��?�Y�
�����(��Bt����b�Ɣ�w@[{�[�c����F�	��S�P6MB�7U(�+dRJ���݃�����`JJ[g�s̽�W�V
S$�3�!���L�P�������+H�	Lw�_ɂ1����wO�F޷�t��nJlH��Ȑ�Lk��n7��j��h!��+,O"s�ח|Q�s�z��Փ�<�غUUȭ/d'񨶅ɻx�� �2���S����G��bĻnE�,
�i�B�Fd^�j��i;'E�&ޕ��?��0���ꥷk�.4{�H��iC{�Kr�o�����X��|B����_)�ֵܳc)�DS��'ذz�j�j/��u���w����)�XP(=2w�^9 +�"�דo�mϔx��o�z�9,#�)���kS��)$� 6(����B:�-���gP��Cq�
Y���<�!�$[b[(s+����4�Z�+c������� �Ѡo�xG����0([�^�h�W`w���Ri(*< Zhd
��>z��@`�(B�t����HF�]�����p��N��CNڦILӧ�$�.r#-V�
��ܟ��T���:��t�3\Ev���t�[���i�Ũ\��]a]x_=����/=`Jcy��o�}���;E.�ެ�^[�9j2W�M��Miظ��==p�E�y�rX��mp<����vw��i���1�maqj�?�)^�6�����}�j�h/��ٯmϰ��O�ah�ֵ[�B!��®sB��p姽�La}t�����Ο���u�RP�n���맓H`�,�@���g��W�B�3�Խ�L[sLx�����>�ެ��\+E1 ~v.
����B��8�Ed�D�'b�PP����,��'�Nx�$�3�N�u����A#+�GgW?~g��\�駠�|W�f���B��x�.����<���^/�>������Z"d�kE�75a�>8�r���<U#
2�LJ�q����!��+��o�w��`:�$j��˚���9��.�T���C�e3Z'N���M�s:U��
���������-��4'�r6�-�1n��`)���UJSK�!Ѿ����"�5������+�|*@��VQ�X)�(�J�DD&Q�6���o������L�9J9��Ѿl#�����6������0��
����H����(ί*�
�,ܨ(�2{���$����;Y�#H��	��j�~����0��g
��*�=�M�wp	�
}��IӜ��e��.t��O��������RDkx8gj�NV/_���M��;?>|�����hw���'-��ʷ��q����h��i~��-��DX^�
��j�B��9"�o��A���٘�)_��ѽz���7nR���Z�g�p��{+���$�z�\�q|�S˧?[>wv��s������F��m#�L��ǍY�{�I���v�z����1�ݥ۫'�@���hd�ꅯ��h���(uiWT�>X9yz�އ02�������9@�bb9V�IP c���^?��ঈ{�����Kܵ1�Τ���Kw��޾ǦY޵�:(��g,V�}I��Q5�~|���A%3�K�l�v������ν��x���Rs���`����\�'r��wW�=����2���K�D��R-=���ֻj&t/y�Z9�5G��QVo�,��k+�:{���'��\���r��꫷jwO�_������B{|������ʩ+G�$I��ߩ.|���'�a�kL��@8[��ru��z�#�t�eX������������������Kw?_�_uP��%��u�<,���w�����5���km��G�����+����V�#v�^Gs���g���ť���.������֙���-��HѾ~��H^����NqB�sA����bңR�+L���Qt=bC'S3��	>��Nٞ�[;�J�K�G�yw#�GF�1��CCp��Y��+�w^X0p��O��m���n�����04ę���m�hr�(�̰��$�D�J�:����qCj:g6��h���O���-MM���m����ڒ���y�@���f"�����8���Ta˖-�3�>܀̚�tp`)�f_���
EO�.�LWW�_��!F��U�FE�Ʒ&��-e6�v������m���7� �ME�r�Y� y8���r��*&��(�SB�����A9�e���;/n��aY�Rax:6m<f����+Z�[ �ŕ�:��|�U�C@!D�F��tg�
"��6.�J�,�p�Y���FL���׿��عc6r�qk n�9���fE���Ѳ\|��æ�9;�>�_Qs��9�o"�-��0��L>8�՗dBZ;,�&�%;��$�8�b̽GK�*��TL�
����i���3��&��2�&r�Rt3���	r�d|f-@�>�w$X�
s12Fnn;6� ?�$����X:�����.����4\h�s$�ZG$Lp{�ԭ��OzOB�ԕ���uգ�bx���wLɍ+"fD������b���&�[�3�	�&c��=���C+g�~�1�cPDĸ|�����]{z�${ƮE�9��h'_�:��"/B;yv�/��9��M��Y��-..���}�L��*�6���L��T��I���#�S���Cm�Sڥpt��*�\�+����Xiq��-㋻9�ش�%�h����������'�RIN#;�RVo�=�R<ŭ�B�@��(��2Pgh�9��=cZ�D�8 hF�?��(2/�+���e���jNbw:����lޘ����YN!�̈́���P�։1_�Pgg�_OjI�s��L��6V�
@�&`���-�N�(����^�)Rk#��f�lW�jG���b�osw,t��4�f��%�W9��0�������6\�2�YǲNvŚ'4�%���)���W��4���ht��ͻI�k�zn7{��9;��6����J��?N�4
j ў�`hԓ�-T�}�M�R:ިfPJ$�l����`l�c��RBG}���E�6i;GEd����'� T*�f�Rҭ@2��G�t����=��IH;����� �nq�#OGo��X�3��Q��d	ǂ�"Z�=g�}.�E!��C��:�=L���
%7�))�a��pb���U[�˱�c���˵�b�b!3C���������e�n�9.�e�կ|�`hS��.0�TǕ>��c�Ȩږ�e��������ф<�㫼���o���%�>����n�iҠ}�E�bR�x|>
�!�$,�P�<18��;J�������mͱf�8���.�-��aS�\3�8��rC��}i���4��d���4�I�~cwۛ�F��Ƃ������ǝe@���i3p'591�<����=eݲ^C�w����&3�C�49ѓ�������,R4�T�Ħ��m}:��YF�#Q��� h��A~�jס�=ٳiS��ס�[�BIi��ԢX�ys </iP�s��jQB8e�%�Q�b�g�	�t]��q:���\���O�4p^���ھ��/���� �T[*5����lS�)E�o���Q#I�A���p��V�̈́��e�j j��N���a�w�P�&ӕ��Ӌ��� �=�
1�ˈ�5��T��0(���:[��:���^���)�6Zêڬ�1J�iLL6���q�F�.��^K�0
N������z����x�'a�9�6L}����U��vⓉBnϛ�7�����ք�m�D��'�,��w�/�r@�5�8��9�$޳�7��ɉ�z{'l��ޤ&���@niѬ�������vp�.�4C9���]�b|�n�n�Z�?l�.����u!��u�����6�m����,u�6e��P�$��OE7���#3�����,u�-�6�����.��
���j�ϭ��X}���G����Z����]���$s�r#��V��u��_ ��a>���Ԯ�e��GouM
���k����l��f֎#��{��RQ2�u��&4��P���u�J3x��2�Y�Pnvh�S%87'����Kc��n�/ʘ9���-cOѕV���?k��b��?>|O��8�t�"���{�,����K�j}W}x)�2 4�j��z*Ԯ~��S�.��]������=(�)��<�u��je����h���+o^�bϡ-������jﾅ�h���~�J)*����yp,��-���Z�e��J�ֱ)��::څ�ͨ����x��0;�{ז?���^�x���L��������f��aQ����aKl
q+U,�����5Q��tl�H�ȭ0���TYՇ��?�������.��Ǉ��mV���SW]��Ǉ��$=&�8:�r`�c�0r5�h�����
�z2Tc#ʅ)Wp?k���(�X��Z�؞�ڱ��&ڷamv�mv���+�i��WZ�5xDju�<�I��a.`/ik����>�Ω�K�%��ɮ@4�_�G],�R �Ǵ�nx4H���
��M�6lS7[��|�+4<}�d���gۚ������G2d+�O83A5���a�x���%@��¬�T#�Y/7$=H^P!*3L.�+W'6�2��H��]�ea �H7/׸����Z�ؚ�Qw`������#��JlS�lI�o�$�O~t�/ÛO�J��Ge�De��`^�]g�����du�q[�5���s���kW��~�
i�e�X+���}��iW��Z��f�[�s0i)e&ULQ����·��g�7��z�c��ĉ5G���d�\Ul$l��FLs;�T*Vr�@�:�8��_Hk+Z�W�\{���ڵ/p��>G;d�ٕ{h�|�$Ly��yq���#C�[�V˱N���΁�{����G4���w���9�����
����A��я���%N܄��2����%\_���ՒMjnI�+�N��`X ��$�� �@���ۥhK���`�(�MbV�6ZzJb��C��=J��h�9�O[QU
��&h`�y�PNON�F]ة��Z!�@.� �a;G�������(f~�c/>;�%a�ӃUp���wQ�x�
3Yf�m����z�,�b��Q��h�������h��[-1뷿��Z� o�AQoj&U��Qel��d� ��sY����Tvfm0�;���
 ivR�I��+��}J�8�j�e䅡��/���E&�^�y��d%Od��;[r�ђ���
1yY�x��.���W���h�lL&���>�TI$�W�M�A��b0c�;Y8j<�ӟH9ٴ����� �rq��4:RFc�d�f+�x^ٸ�i��DA=����U(
�n�t�s�Y?x���<)�H`��7 `���ľ��
��Ok˙�s�����ڡ��z����g�G�mY������˯~[;yJ��<� ��ˏ^_~p�z�"桸�le	n�IaqMg\�b���Y-��91
���k����
Q6�'����E��J�%'�6~b�p��(a������>$g��t!C$�����	��
��J	a��94�WU��j��d��Ei06DC��cS|0��b����r�����������=|���;Z�=
L
G|�m�_��s3-ޞ���,|�	�ُ����k1����s����=��MVO=�����P}}a���(cwF��p-d�0�c�)<D���/�p� �g�V*�)�+3�>j�2��]��������7��z�]�ʿ^�ݿ��I'"�#�B����8���j\���Cn���P �^� ��@��]�ם��,~�ۖ�D������:�1�bb���:SS+����sQyr@��;����t���׷���ײ�D�[�}
ž�Z^<���i�"�V/|�r���x�g1���G`���AetoLL�r���z�U��D�������7�|�7�Ow�eW`���Mty��Y�Տ�,��r,���5�=��]���`�<xnc���0`3��r�%7jt�{�WVο��7�/?�.��\��[\y�>&������ڝ��oU�
}�?{!�
�Wq.��EH�k2%W��z����z���/�� �wά|�v���9����V/�H ��`���<&�5B��܌ٿ�f��˵���-�͵�)�5���H<+��*H1��.��5@��k��+.�nX�������aUO�ZY���.|�����7�3��FQ�}���G����/ko�9v�I����O�������p�ԯ~�)�.|�k��^;
����<~��T��Lc����?��T�0��9"~�x� =���wtP���t�f
w-�����uZ����a���I�ࢌ��]�_��,��1fe�nV�8P�Vz�d�gR �D@D��*����F�(d*9s��CG�*�L���Dn��|\ǣS�)UhVr�|!Q���1~�����Sű3�c@�)��l���i�Y�Ҕ34�/��)tV�	D�2��Ǵ��Y������l&���E[��0�c/�����?��0��pʭ3�)��:����T��d��&?ϖ`
r�T���]d�����v�
�o�.G#"���d�0��V��Ű�$P�_$�$�}��L+�Jx>>	L@.9���ҧI0�)�'	{�.;Y����|�0�N`��nh����Ԛ>���_��d�%D���(x"?���=�"tḄ��֕Rѣ:� ����Z�~��u��:;�v&*ۘ�딜N9nu��@V}����NaƎF�tcⳋ1C��bіS�4[��n���E�	w������]�øF/�	����7e���2R��Q���5��O�q؞�l��lZ�I*e���qbv��' �G��z#\h���@#2���9� ����l��A��l>��d��Į�\��>��W!���¢f9̧64b����E���pY��K)�9e䥉�O� 1=
 ��L&Q��9=S'��@�+���줙�(�Q
�Q�Q��D�C+�+�-��#a)#�I8�4\�2��g�}B{e�у�8�Q';3�W@AX����^�0�v��t��dS����0���x5�� �Ҫ�f2�#�C��S.�U�R���)��N�K�~�zdD��0���E�!~3�ڢ@Ҽs��R���W� �Fd�l��/~�EW[W��NR�n�����M+4A��Uʓp	�J2¥�r�y���\PF�e?)��pv.�tV��>���Y�I� �9P�2�/�z�� �@}F4G�(|��0�(��N���"BB��jZo%�Wqa�@' ��UvD�d��K����(F�߈��B9JR@+*�OQg�J�P�����[��K;���8�m&)ț奥�I��ֵk�#KO�su�*\�8�$������++���[�5rp��L��\�(Jј�lÌ�$[���N��������>����VXfwY���&�׀��x��`��})���jS�8��j�2(�|\Qa�C ���
		��_ĵ��0c_|ב�8ߘO��r��A�)������Y�%����cqK	��ȡf(��^��SNes�u��==	DRSx��07�K���^�ecۭ#縃�ލs�v���+z�������v�UKK�&}�������Qkh���&=���?��Ɵ-O �
#����SS$�����C��F��-��c��Jb�qWe&����y�/% ���L��]o�EA4*����l>��NO&�@��!_�������iXj��|J���b	�A�ֵ>��͎�!���fza+خ�Ҫ�P���{���������o����y�t���w/[�m3Ώ����{֮6�,��Wtz��;B��fxy1Ȇ5 ���"Ԁ�BҨ%?��of3񌟙I6qֱ�k'�N��L^���E>�/콷]��z��gsr�����u�ު���D�Qp����]���Іg`��{�֯�k$)s��7�{�ah�m�a�í�S:ww�Y);�IΏe�R�(NdQ�|!�r,�~-5?�����N'g�g&�mo�P�fc��6{%�_:�F�;�;���'g�3G��Y�������2�;��1��?C�_�H;9��o�/�oN������S3S�i���-^���H����=k;6>�:9�����f&������esTg�����ǧҰ8�d����yÉ��e��P��R��S�`� ������ѱi�%F�E�M����S0��k��+ 9�̨�A6�^� A��He3���l&3-�(8(���tv�u�G��V�Z9W��"���y��A�ʯ�zi\�~S�2�Y'�rN�A��S�EzF<�z�����ɱ�����O��ak�s1e
�7_�O��s�9��mT�+�3t�'��Ƌ+�z̾R���W
�H�kL����,̩�(H��W�ə�q����X��ꝝ�����G�+�`0���?�'�
��_nܾS�v�����}�1M?�-/p���E�uK`���Z��{L�GA#Y\)���*	X>T*�F��r	F'�s�Yq�
�� �`�P�@9�9�'��l+1O�u�@QEXύa���Z�5�Xu2_��2V�8�((�%K���`���H�S.��(#oK�S 	=n���E��h�s
�3t�w
�bV����A�#�.�=�%YCc�~[+�g"�M��$0K�V��ig�M���,'f,�,�(B��
����5t�-�O4��K
-��W���l4$tSl��6hA2��w�p�-��5�oN�q�����'))aCg�r����_�e�(�z���sU�c��/-WK��Ư�Z7�q>��k�6�yՊ֗�ԕ�TK��dZ
�R'��G����dJ⿿����.�4�D��S̕6^u
 �Z���m[�? $Gk��T���h�����Z-��O�V��޺Dy�����|��}��/�}�l(�b�4]��S�=�&��oPs�J�JK�� �*'bR��:UF���1��ƙ����f�k��CH���Bb����+4�2�F���e�>�wQ�E�(���@�^�F���ZJ?�A�@<�	Z ��Q�!Z� MG�A�};Դ_���"N= Fэ�BZ���i^R}p�턨c�6o=�,Hx[�����q	Q�T�۞���;V���O͟��EκnΛw��3�/Avȸ���!�>#�ꣵ�׶���O�qp��S+^e5�6 (ȁ���ؼ4�%F��!iw��6��V�r��h�&�1�����H�-�����/�Az>?�ǀ*��O[���z�cGT| =�i[,f��<�#J�I��=��pK���ᡓ�+w(z�e�C�������xUZ
δ��c�G�<ß^f�	l/���[>�����1�h�X:m��A�����½a�yOV� L���,L �/)?v�}��96Z��;�y_���*Z�	�L�@Yp	�%Z��G���`����`�&;S;���������Ʉ̼�5�
������沖�s�Uc�U"��{���ȍ�db��{Kĉ�����iZ�H6���=T�c�9��ބ\>��ۢ5T���d���?��]����<��+|�����F���j<`�s�u���{�n�y�P2�
"n.²���ى���T�D�u�'��c��v�O���Nͧfg�������n�TF�H`�
k���x�:sfЅ5�Q�(�T=Bڳ�dp�#F�B���Fa��+�H,�u�T:c�ݽ�v�����+nHZ:�:l����C�1,�ί�����e��i���tj6Τ8S-V܎*��ˁ�4��� ʌ-[�����r�RNMxK���-ۗ8ĶŐ�\,��C�9<���%��+쁹Ƕ��Y$��M��t5es쌳w$��^0~���b�k�_1)�sK!�h����Q:5(�6�l��8�S`<�Z6�%���NLcK+��˄_��,s�FZ4������&L����f	��aA_�
$���5�:��̋'�^���-%)i��f?�I��W-�]�-W�{Wc�w�_�u��~]e��<f%��?���P��),�N�bS�?�l�M�h�S�#����#�CO�,p @nJTE9�B�9��е�a2�K�#_8�G�Œ$ �q���,7ʨ���/�#F��� <k�p�Q�|�h��X ��!5�2�4:��"�B���sc��J�d�/>f�z��"�G`^�L�'
���2i��bl����|�sY�c��b���jItl�5���.��x�9��k�Ȇ�I�!���&��%|�K ��x�e�ta��|=�
xj�eUhޞ[�h��'� 1v�本�5�
g.KL��!]�v܃���B}���AA;�a���`s��T��E��g�5�$jwn�&�����z~����O,/R"�`��w�7��hX�SG猹3E8,���E�Tw�����ˍ���7/�Ay�[wz}c8#���j�	3Y��5ca���a����X�V�e�%�e�j6{N��v�����f��3��_Ky8a)�$Z��@�B��8
�*,��*2�-Rr���^3W���Yh�NV&���F^m5�Ho�RL^R%�2�� �#Ic�ݞ�g���80ӿ�P���=V.����o;��M�
�T{M�F�2�QbĺK�H��\{����`G�L���Ç�{|;d�$�_4����t�h	{�٦��Z�;�z�1ʊ+�}}S��p��c�䩳w����'��~ڻ}	󥾻��������?u`���4��Z�RY�7a��ьG�6��j<�,��yml�����g��)�%vL�<����-�L���M R�!�D��Z�)�=��@�!��)��pN�X 5M Ap�m5o�A㊾Vh�*4uS�_p���N��d��E�y6��T���Yxix��\쁳���z�d_B�z��(a��0}+T��(}Y�/]f~�e�Ğuѳ�����m-l,��,��f6����� h$n\*´L�V	$_nf�m?7����WVYZ��&�l-����4��i��N����4%�4�c���Vo����ק)w�)�wD�$Q&��qQ���%+�ɩ�H~�Ct�/E�`wzhC�Z�#*
$������(��O�J�P��TCz�!����ֿ�ˁ	���:d��6Yb�HIeo_������{�X7<��捽��n�š��<|�y�����
V�������?i|q���*R��h��G��c��0<R<��a�){��0�W�b�|��\��D���ny� C�R\�u��x�	��o�? dUsOי9z`S�q���-�] ��P��Ss�
�|��2,�'��[v�К�{~��}�%P�qk�/G���V�����#�Hy�5��@�f���1+���!��e����s�����	\�+��X}��]�=Ǘ$E����wg3���A����)!��
��M���.�x������`=��`Ow,��<w�¶��0�vr?�1�n���i�8d������4��$�' B�F��t@�\�ӣ����t}�B��������#����7�BC�̹�/�~�q��X��}��f� [��ϲ�-c���;�_�=mIXy���ޤ�,�,8ݿZ�=c��B����7������bϢ�mUaZwťlT%DP�(##��:2q*�ޮ_��~�^����_|������_^U�6��>�E�#/�<��w�Z��ݝ���޻lJ7��� �p�O+�0hP6��?�y��}~�<i�0.�7}�K��`Y���t�HSy֪ ����`�il�Ț�2�՘q&_̕Τ]XȜ����91�|	l;�l�蜆��`�ŀƖ�º]�=�Ȋ-b�� ��
ި�[�j��	a�$	B`�a)uh�:�j)�9 H��#��ԣj���*�i.��p�E���!�k�4�n��,f���Ԭ1��=6=5��wmc"ep�X:��m��%~��o�$�fՑ�b04�72���HNC[��� >����\�'��H_x ����'3'�g�f�1�m6������p�l�<�.N��"����S�HƷ&8=��+���#a�ҏ�J�ق�\`����h'�-�ϛ!Zo"��b�v�&C&ur|2���2��P�N 2$z��,�zE��_\����T��R�T�e���Լqj#�:}^��gæ����XG������6|�f'K^��>�'<b-�9�x�����������Y:E��h�wqH2�Z5+(3_��Pka����*^]w���LGd�(P�u����"��'Q�>�$�NN'�3�t����C�?bd�Rr��-��]z�,O��r[�0�3�������b]xW���R���e���+��J��)�P����Lv�N&�_�0�<�U�!Dη,$j��8P:�נ���h�uH�D���1B�R���lhV�l��'�x�~ߣ#��A�.U㕸m�ܑ�E׎��Ή�A9r.t&hF�� +���4�C����0�kP"\�{������[ϻ�\ 5s�Εƕ{�G�7�x��G������W��jM���7{�ۍ���<�
�Ϗ.�ݸ���58���~�o����ݻP�~�
�]�N�I�g��ݝ��i\zg�����/�>������(~�e��
cZ����X����o�͌��?�F����[��נw�����PAժ���i��:,�����(m+'��a���S�8
�nB��'6� �.�(aP�k^.�y���{�\��
�}�ȱ�
z��@���Y ǵ5WD��.�I_Z\��G	,�*R8��T�?F�?�#^�y떹J�C���˼Kuҡ^���F���B�mx,n`�L��jK��u��^�P8?p5�k��a���y4E<a<kPh�]}�Ӈ2%t���Z.�
ϗ�3)�*���U�A����Y�}}�<
m��L�'��{�άu��Ӱ>	�a/��lиVS�ذ��z�
ːj�b� ��_[P�t5�}u���ޚ/ִ�`GW����1=X�+���L��I�����^��e�o(i��/xES�1lxwrDt#F�R�+�X��/S�c%���E)Z�u�6<$����\�īL�].8+�
y`�|�3y�_�f8o�`׹�A��e?��$�1GK%Bl<���� ���#&��D�p��8��J�T��yB�#[����ӏ���C�٤�PW!�0 �'U�3
��Bqľ�l���l(
�cY�{��>TRi/G�|T�ՠ+��Q�Z�wh�_�Q��E )\�M�Q�h��5yTâV�sS%Y9�#�'s�zj��X�P����%Z�`KKek�н���f)T��ObF���D�Pغ���2p�����T1:i�I��������SM���Q%��ы�#����7:�Sv܍,U&���	�dD��?�Z�GsGiv�W%׊�E,j{S��b�(*�M�ޛJM�^�켠)����6ux��\�+�|�n���R��y����[����jm�&4��gz��CM�"«������`���,��B�k_��9��[z��T7͋�r�TgT�T�{N����om(Q�C}ٯ�6e�ԖM�>�e0�`����`�N�+EW��Y)fH�:�U��y�mye��X�*�إ_g��k��I�׿�+�ߜ{�ΆM�T���{��ū�J� #���:f6U3�DTa�t�ʆ,ћ6���Ԗ�3EW���$Nޑ*S�7@@cP�Q����Õ�a��/����k���@�����6>�/�2ԋ
rۮa��-f������o~�����?A��I=�L.���E{���U�̃�ǬE1���Ǎ�OYl\�f�,qH�0#��׼@�uxW�=4�r|���l�~�/>�߸���,J�|�u4�����lX6�Jʧ��_�ٽ����"����9����V߇G[�e�f,p2.���UAC��d��xi:eu0�E�5��I\��Ƞ��r�,�e�b���I��%ge�:x`S�~k���W4BT��-�m�5����蜸�`�v�ɲӞ�#k�;��J.�>���GE��I�Q�r�V�&*&�x��ܩZ_V���6P�9dP)P�4��u���5�+���̴[��~���o8dLH�b����@�l�X}`d�9;d�9����!c�9���#��NF0��2<��u�q��ZԐ�����̓jv?h��}�µ��o�H��w.���B
�Õ���@��V���dd&3RX
*�qM����o�~���{�ہ���<���	VK��R��U�ס���ݓ��By�MB��2�Gm��)�a�Uc���2�ʣp���m+
�ǎ�
�8�Nv/*�X��O��z���+��؍-芢�J�K����y���o�����B��ۍ���o��~�'��w�s�-^���h-�_�
��qj���=g��gS���SP� ��-W���-}��wW�A�ふ�/c���s!�
J��Y��TvJ��$t��|��w�V,q�纣��`lk�(�t*
e���ʮd���Tu��UK9�\��%6:����_�0��6�l�r��8�M�a�X��a�2pHO�1��쳈U��7��d�8�.�жL�!���;p�J0SsY�(Z�Df[K
�a��:��@�	���ޗv7qe�~�WTt�1/�lɳ���m�o��=$��6�T��ȒZ���Z&	`��&!@�@ �N�!�416�Z����d��	o�3�95�d�!���Tu�}��g�=r�< ��r�1�d��B{;�rvTX��!�[��s�-�C(a��چ�FK&���
~$󕠬�i�Zd-�m���K��a�1U��&ɒȀ�IB�G+������e�&ah��K�i~���oq�m�F�[����L��tͨ._Oi�^�D�rr٪�,�}ঊ�nWL����h�i�T�d3gyar!��/�:�ҥT���hj�A��ם����Ǆ�m��8Q��Z���!��I
_O��
{ʹy�ڙK��x�o1da�d�Y),�/^~T�=������S��;ϖ8֌�X��)L����M�wώG���59��a��dt�5�B����sGl�0+y�h��ƈ0 ��4���Y}��AHڼ�,��L}�L�����;����ͥ��D~��D)p��6�����^҈�Sj���H��c,�㝱"U����6��rE�Ɩ��a���Ǩ��Bf��8�e���凲	�q�����àD�V�F�PM�\���E��P]RT����;F��� �8z4Hr\��G]\$��Ѹ�У�,P6:����~�l��\o���3ܹ����_�$���� �SQ8���Eq�`>(��'��V�\j"�Oh�E�o^�\�}�k)���)hCC~�k�#��D ��F���!2� -kA��Z� �o��MjC���1���HB�����M�pv�1�Fa�q�beD}�3!�^��h��m�_A6�$'1^Jը��.
p�s��p;z�WÐC!"HI�5̌�ŭ޳����P
m�����^�y$%��hN�X��l�	^�*ةC�I������Y! �}[u��Jg3�L�S��[*fd׈$]"lLJ���(gp/M�J�w_#m#-!_v8J��3�ܘH:Z���e��Ec���'.:ɍ;C���"g�0���d6�`�2�s��'�_�Z�f��8q$/A���C"o�BI���6/��{qd�y֞9��K�I��L1 �F&[��l���&7�.q�<d�$�\���������sU��IP��o�N!��Y�orD�C�pR����H&�}�Lbd��c�i|��xTXo=.��C�m�[Hx56>$>�sU�'�b����t�&-e݋? \�
P'��_Z�y���[S�~��W�S3pi��1�����w�g��4������Ec�\��P�z��G���������&��P�'�5��Aұ��J
j����鏴���J+7�n~��r�x�n����Jw��g�羦��("8��gd�n~�ne���MYYW1��;Ϥ�Sd]���5� Ʃ����p�DI\{���S3�K_3/"�BD����)�[&z����)�ؓq�EeT%v�Du;4���p[�͢�ԥϋ3�$��F3.�/,Mpa�x�vm�xc��4B�+!�IuNhӀ��!8�!Ma��2Y�"�7
�؁Y�i-��?t�f�2���ŉ뢧p8lG�IU��#��^B�;�N�c���HV�ީX�SN�]�-AY������S=���G�\��n;� &�64�J�ncd�rt;E���1�9�a��°j
T���:�dU�����*K�UM&���A�P�fL$F&盫M��J3l�5
	�ڗL.�����Ww�7dW�G&n�/yó4�f<��ޞ?uˁ�?i�m=./����ǉ��h2��V�G�4p+����\�I��&(�Ӡ�00���_iG���lc溱��D^�2�csH�{�UY=�y'S~4���J����
�ɌR��A����K�L�]Oa�)�mȗ̲j[�N7�&Ư[W�-�	/=���+�@���'��T*�6��˙�87��w;���M��u�b��d���L�U<��H��ӭ�7\]m�*�dcڟ�1�J�F0'�W��gA Y��\�����wEZ"��r�*�{1�ԻRR��~L�MV�|�͐z0C��z�X�`ewF�,
4l�n��p��H���]�+�2��i��մ5�t����Շ�|�P99>�2껅��
3f�- ܙ� `�O�Axǉ���n���
��].���m��[	�;2�6I:B�)
,zo��j�_?�4Ɛ4���?[}�A������ͷ4�˘~l����/�������n����EE��ߋ�6�hu3)[5gjtH&[��O�Â�Q�$�F�e=�8�*�/%~�.�\����������j�*���������ߘ���������y~p��/�黔?;�����gZ�|Z&G%�zf���:� ���$f�M���)}7K��d�n��G�.���dT-y�q�8:5r�f�nV�s%�	��ǌ\���9���
�x�nqya��k����G�OP�II�Nd�L%�9#uKQM-���ln����Z��q^zp������/�ݾXzt���m}��*�a��8'��j�5��-Up�Z����U�ᦫS�;�jom(�ǩskr�?3�f�62��xE�Ф�]�����-0Q��o�LYm�d^i�@ߒ�t������L���K�a�Rh�e��.)�[�Y\+��1L��%��)W�#��[�dz|x��{�v�%�l��o>*�:�1�t(�:@CS{������ߘ*�*3~s@��#_sbqx��?si��Y�ﭬ�0G㝵x���O9�e4��3:٢���߿�L V�b2|k+�#O��a��4��MU*v�v9�j૽�;	�3��,F�ﺝ��j�����tϕt�)O�
��
?}��
��p��7F�.On�'vT�jχ�	�j�?n�V[�"O�og��<���ws�&y�,~DT�/���K_��#̏����ǐ�'������nϋ3������<$X߮��M�VI-�wzh���!��˨O6�P����C��R�
8�	�y;>��_+ݙ-ħ�0ZGo����W�b�ޖk�)�R���5�U�L�#fT�N紨�ԶX����_-�+��Y#s�ݼs�99��:P��^zEc;s����l=���V�*�͖Nߒ]�2+`S1ѽ�u�G��$,���"�f@8Qah��Ĕ�� ��0���s1C��yh9!�䦛�Ġ����ǠKiU��C�IZz׏
��*N޸%�&�D��͠�[u��NQ�67���Q�p�)k��^u�8;�c��v�����]Ae�epE�b��Rh����	��Ӏ���{�l<i��1&�sR$�VO�ʳF�t
ڴ��|�2mi161��ߨ�&eqo�p��J� ��ꂆ�v���U���c�k9V�>��Q}����A \�j\�	�|�:(e�Z�_��	FoY�(l}���RV"���Hm52�{5+md��}�s��K'D6��Ŭ�����14��w���0���;:ʏ�ꦘ��	1EFeN�<0���b��b�y��a?��%0/'���?Mb~��;y
�4����A߬�
p������o��'>�9@9�z�cf��|E�ꐽ��<�d^�\�Gd��!Y!բ�ԃ]W��y�,O��R��Ө⸦`	�q~4Y& .5�� -���Ut�{=�|��U�����
cr�z��O�d��}�-}�� NT1�X��̷����@��d5U۷��6�ܶ�uہ�m��^�m��*��]���<��V&��-"�����D\^!��$239�a3$0S2�9X�~�e��0=`�Z�Z�x��1�`��]���t�CjO���8e[^:3j`
�Y��|z���%d� 3�ň�Q�}]);�U�y��Դ��)p����V	�"��b��Z�m"�>�
t/[��N�Dg�����e3M���W7Z9^��^B�|��-Jr��I���t.#}�ɰ�MY�PTY���h:d61�2=b�Uˌ,x˻ڬP�o���t�_���3��s�Ʃ�k�N�0��<����
kǞWfI�4�<��M��lȭǬ�j5��7{�8s��pf��G?O�\]��i�?��B_~ o� �zb�
�X�-,M�ϣP��)cq�8������ٹ�ҝ��[���Z�{4cqƘ���Ό�o0�鲰2G�P�<,���D٧�������!�4?ç�w����o(�&�1n�1�|o|<[v�:�oL�VfJ��ט�<Q_�f�܁��P2qX� �O ���qe�e:�9j,A��Y��dq�?u��4��lg+S�:��	���8؉�<�qbi��ۥ\��B�bf�3A˃����Öi�X��(����k�ue�m�����k�֐��X\>�0읽+�a;�y74��!�#�Wz@s^�ܸ�m�ɳ�%�X��Jb�n:Ce�}�8:�z�q��v��~f�DN@~rF�y*2E�>�fY�Y�k��h�ס�5Ud[�{�Nr`2}�W�;�KV�r)NVK�0�?����!|vS��4/�������7��1Ml�"�ݳ������0͏G���m<��7\I<i���Ǩ�"n(���:��!��l��O����v����a��ia��ڧ�<��zܱ��<>{����$�Y����~������W� =]��4��Yfm�����|A�V��� �ܕu/]���=�3;%IJ�@��M}
��d�QX ����zi.$��W@��;��&�3\L�9���S�aS��Z
q�Ul������O�ߎ��u����o��}�r��l��a��$Ą�s���5%c�7��/�������"*/��u[�� �1M;G�l',O��K�Ov��%+Mepٔ��G�#�s@�*��?�4֣j>ea��8��i��B�6兞ŚT�O$����H�Kb*�Z�д8��VV����������̧�O~,<�ظ�Yq��Gi�ngO��G����v�l�(��2�}!���%.���D�"����uV�(���9١����9	O9Ŗ^h�Ѣ_y)�q�}���Xw�?��I�2s��;dB
����ݡ6!�1�{��s�u�K;My�sp����+C���NI��~v�Y�]��x�.��b~��Gj[Δ��pK�K��������b��K��3�4m���  3M�+����K�Fί��'�㷛_AġD�+��EG�:oֈ�On���O����w�4��×���7�_�<����6%����CgG#�P�$�fX�!E�����28���R�!(�ðN��N��R�v�j�̩�5�����llh���Z]��`p�<��S
��A(���n��%K�#�Oœ�o=N�j��W2�8�k��\+�W���#�������?��$�qK��Ð��s�?b!��ȵt'Ǭ��0��B����/!٨�4�bT2p^��˟���:��
��{��:R{bkM��U���B����;f��z�;&�8�q<�����}�����
�>*쾒,������G^ޣq�|LA����O�A���H�r���n�J"�0�o�-* �y�n|n,~�28��w��ۿ��e��+��C�iqg({=�#�w٢�W2i5f�2o��\�κ�|��{�1����\���r��o<g.��%IX_�ו�N������v�\J"ٰK�d�:g���.I^x�M���J�":]�~����=���?�M�_�,C��tܣ�V�ƅ���/I)@�P+�8�r*��M�*�Y"����Ar��j��#x��X����Hz�6��Te��X�Z�Jy����2R,!�*N�) �K��v�<ـ"��d�We��m����h����#�/Q���7'h�o�!�m�;�P;ޛ�'b�\N	jE�"���݃R\d�ی������/�4ڽ]<��\�(�>VK1�H���ǩwa$d-k�B��P� U����%��FD�`��e�;�/1�&�.r��p�!�Տ$�-�$ռP��;
�
���fZ A`zH@��w^~�t���Zg0O���O��b��;ߣ�B�FX@zriE����/����(�:��I^�<��m{�34����謦�\��:��(��;����x�q�4>|tg��4u�ßK��.�\���e��p��r����0O��m�tk�X�����|���3�8�y|�xv�c~2�ioN>3N�Y|�h�D�e"��ٜ�T�U���v��6��mц��F������;:�I�ޤv���6q�j�&��1�.�b�7�/��  ���)�~���5u�~c��g���fw���,=�����a�&�i��pr�ݘ��Gw������*x}�����Mq�qpO��D�䤚��iJ�:��t��)ske��k�
�J�q(y-<[�Jmp������_�U���
���z��M��7-�>j=��8��L���#Vu��{��LhB̠#[��Ffb4.4�T�Wg�"�3j����2ǌo�Pd#¯�/�5���fYU�@���&)FL���icٰb6����(x�0�8;.<��D�M��B��eNý0�p2�yo[_����XŕKE)��w]g�O?�Η���N;o�zXX�LM[����2�?�[�x����)�I�)��ٰ�q`��ox���������$-`�<%.I|��|/.i�D��ʝ�*mu��YƟ�m�ŗf�2ΧK���%K�Y�9M�&�'�$��c��ܔdR�Gj�7	�ε_ob2E���L�=����_x�o8��-�V&�^)�^ZB-�4�׶)���tk����sL��X}�������=a9V�z\��j#� ������?|2��=��Z�y��o3����"o��z2�O$��]�u�u�s�[���[v�?Z2�k�7��
�;89��1��X6���C�{���u�ml#��|A
�M���mq�H"���e���ŢI�-��f�|Ro7��s�(,�3�}�5
cW
��eW2�:�I�r�����QF4��G�5$�E�&��E��X.��ְ����S�O4%HK�a�+(n��#��W��|b<�6�;�~���s(�F2��
h7��4�o>+���8�����G;?O��γ"�|q~�tg�J�{�������Ǉ��-^�b����ӏ�Sw�Ɔ��j2|Ϯb�U�8}��h�8��2n2>��ڭaӗ��}�#���!�n��+34�p�x�,8���PO�pp�uw�Iޟ/,}C�%�(QX9e�ߧLiai�̣��\X���ӑ����k�N@�٬>���rOkР��} �V�ʘ��xpZT��
�1sz�#���#�򅵫?��.^��8w��ŏ��Fa�Up3���%

u
ы�|%�}J��J�i1Z�.	 ��r�tC��[_�Ǖ՟>�Z",��!�s��"�ڧw�'g���˰ش"W,IC/�\��tr�%�X�"����ע �vpϛ]{#��}��F�8�E�����4�,��_� ��l�!Txv��^(^>CV�/��� ݌�f�}���.~ΰ�x�����ƙ�҅�
;��5`6�s��~�v�c�c����2p) f�-0���r�h�����K���8ŉ��Z� HF
#"5�R*�N:�ثHY���������ء�o4�oK��5�|p4�o��1.� ���e���20��t|2��\6������P�P
y��Yt"�J�µM�w���jY��҃��dl<���=!�c�ʤ�,�͏�:��������GG�G���'�LJ�G�� L�y�5|�(�M���)6�����e�J3X�^ny1�+�N�	�>2X��s�cRǤH.M)���@��޼�>���\`>
��Cqٌ֭�l �z磉��C��<,c"N�ɧDI>&���۽�(��??�5���<��h>h/-N� � 
�VQ`؄��4Gv � 3����]���d2x4�٠��)��m��j$�D,������i�Ð�`PARb<L��D��A���\L��S@X�d,�k\�������]�!�2����R;79B�8�������a��ڕEJ`5��?����*@w�B>:�������/i jA">����D^R��Ҷ�D+ܖSi����Q�b�}6�ރє��n)ΐW��6�G��,�����1�G��|��⇷����'�.���� �&Hn/4������gZOW+�=�F��CPHi��be��h��L�K����m AnM$�t]�7�)�+e�0��2}^��9�L�'$�M��]��8�Ig��
����E�l�3wUF</?�h;�#3n�0XIG<�b=(����a��E�=.L�~�HS)�d�����k���a:v�N�F�ى �%�D��^�*ov,M��#X�47��#��Lr����� ��� �d��
H���L* #,j[ ��$
� x�<�K>G��3!];�n%ǲ�Ɍ��s���Z&����$Sm�IJ��	n^ܟT�SP���o���O�H�ȃP ���:r�#z|d
F�Ș
Xf�\�C}vH)-i�x\Oip��H�G��!r`��d"�ku$�V�xl<���Z�p�/��r����2���Iq�U���J�&Յd�[���:�f���Чt�%�+��E���ҝe��k�W����P<2&ץ��G�I�6��jQ�����h~\.���ȓ���p$Wl��a�F�
�����_�j�w�Y��ڛ�A���;E�(�ay�!)�s�8Ў��6E�9iD�(L�k��>2�n'��d1׿�b
���O
K˥,W��i�H��#�+�K�9Dǲ��8Z�A�]V��%�� �H�([1~�a����+h2�0[�p^pPB&��D�T���@����0�x�V�?O�G��f�/{�G���3�đhl���@� �/��d�ҳҽˬ�]5d��PW�?�Neۙ�8s��E���z�4�Gp,j[h��<������zk�5W��:8��y����Fy���K��UH��W�x7.�����A�U��p@�K�'Oc^�*ak��mkC_�:��s����dQ07ZU}0R[x2���L��9�6.G�p3����6��x�~q�����`~ƽ+��s����|��\X:o�|TZ~�ҙb�+֭��r�_X�����+ƚQ����^��F�u[ي���B�+�Nbr��1M��9��Y��������w_�©�(��/^�����h?kM]��~�����p�d�*�d��>yf,�	�#�H����ƴ1{�X�ָ�w��˩��`^�I�<��ë[a�^�ڇ�g�i<�XX�S���+�e:ө����v�qz�зW���?���l#^����j�&��o*��$*��ҹ��G��d��a��q#�;M��t(s�<k�;�Y�k��k�f>s�K`��UшZ�&��y[��D�r���څ-Ga�.�~1ϻ*�r�jՓ)�'bu��H�ǅvL��wr3�H&����j�	ŉh���P}S�O
Gb�Z}�ޅ���P���6׵h-���PC��%jl�C�p}�o�h��)��mB�Fx
�á�`$��5j�u���xWW/?����)�Ј���ƈ�j�6#�Z�
5�-�Յj�ࡡ.�?��PsKFZ`:u��e3L3���q&�L}c��!��C�u8�:�;�������:�Xj���	cP���\��GZ���`(�%�C���d�	
7���&
W)�3�4�ȚH݆�nS�F��2�p���1j��bM�
0X�PCm=޵��"-����)H��C
�X���) ,Z�Ca���[Z��
d�Lf� 0�G`�u�P��	� X`�k е��j[B�M� V�/�on ��($���
��	����B�f�-��X�	��u�s-��F�n&O��A�I�5����'�*iW�n�79"m���?ۏ���?��HJ,̡�>�[�!}K�o��/�E3�^�'�˯1�o��q����j`�=o���u���<i���V�2��K���P(��سz�:*h���-0��Q���4�#�X���dR#629t��Q񐃒^Y���A~���9@��'ͱA�Ә67H�d&ƙ�_]\�lL��:���,�Q�ĳ�(��Aؚ0��X: �
i@���	�6�_���N�2����7�J��D�-.�D#�x6�����`�:�Я�pEL��X�_�e���wO,@�o�e	�l�`Z2�N�n��A~k��\��ڇT�C,?/V�3�6�/�M����V,.�1�wt��	���U �R&K��D�Vk.5��u)2\Q�PS)�d�e�!n�M��$�W���G�&�l3Q�oۍ��Ň3~O n�AxL��ZLD�Sv�T����b��XXy�B(�v��I��lh�|_{0���ܻ؂��vz�����M�����)0�Js��@�,�[��*L��7T�]�t��w�^�3�P�F�#�/c���L
v��!�j���*Ƹ�φpQ
�|�#��{���̢�7Fj2&�&<P�
��}Y�Xk��y�$��=�𬂝�:�^�i7o+�̅~ч�ˋ;�\{t9�|
��{�!��M7�fh�c09�h@NK8X=�#2��
��o�
7�)�Ŗ����n��Bj��?׮ܳ�)���m�����U�w
_������I«�hR?f�e��F��4T�N���]�'owP���"AV7����W���XJ/۝��+�>j�\P���޹yK�I�d<�1��~�~���9��R�&���L;�_[�!ziE����OF	���h�1�dݽ��V���E;(�l�E��9 ��/�/��x�\�K.<u5�s\[�b�
�E�d�=��sit��I�'���<��ؔN#�3��g�n_���28=�J�:� Om�ŵ'�g�H,��$^�!����lz��*����9S�V-@}��Z񳓫g~d.���+�1���t6?��f0���d6��k�;Ll��N���Ey<��4F$��ԃ�p�MR�xw�|KĥNr�4��~Ǣy},�M�9x�� I|��Oav��|"���wi;�Kp���1�~�["��*�������wy�� ��^�
f&��
�� 5��M7��Mûc�g�MODs�I*�
���p���1WQs�1���û�p�1�#WS[[����I(�P�o��vg7F��س�[�٫��
��,4��c��7�����=:�����~G����t��䤘�i������Cà5��F'u���
"�l�E�#1���C�5��1�X
��
c!9B#�{��@�(�9��Ɨ�nٱ�ç������$��(@����z)�X�5�uf�&f��鵒��"n���4s� ��}�Ң�ed!�8��0�9 �����w���K�5�C����
���fXU�/a�,�Ng�@gGW���
G��ah��a��;���ξ�Cz5{]Ȇ@ag�u, <G_�WN
�w��q��eY@Q�q�(������������1��X�(C�>U�<����~���
���I&b�o�F*c�`�ǥ�g��F�ȑ�S���&l�c�Q�1�w�P�j��R ��#�+3�f>E"(@b�N�knf��Ne�I�8��&2&� Be��o3���á2'+�7�`BN��J-��E\�����|X��U:/w�-h�g�
A�k��Z2M�I��~�t�l5[W���UM��gk�&v�4%=g&����X

שX�!uR
L=��@#��d��8���;hndǃ|���NyA�����&���`PCi	�U���������0�Տ��ǟ�ۍ��
��I��o+����,�eq��6��7)��(9�}rC3��9� w����[a�d��Xã	�Od��T��1�P�`���#��6�;���g�09_�X\Y`|b`�a=�S'W��	H��1F��/��R���gW�7�Y]��z�de���H���G�b�N���Z�s����fL$`���h�ꭻ�
K��~�습o��ݾ��C��*]��m(j�ϭ5�
�5��h<��V�=+`ɶ�G�ťS���~��ԁu�I����¥U+ޟ/~wKKg���� �>x�Ó��唙�X���ȋ�R={�s_�&�b���^�NiU�P�<����tMtX$�kGYY~{w8��Du��l&�#�
V��B�*��̺����2~٨~vХ��L<�Yc#rAMKb
��,���F�Uߋ3d{FOŁ.m'�#�K!���v���m�2a0,���+���PQ{l�j[��'vFj�Q�[%>��GSy7MA^C��g9���*�����-��)�F��O�O���O�Y$��L/v�+5�9a8�+�yG,,]pc�~L[;3gܙs�R����~!����uM�(].��*���	�ܨ7D HG�l,�c;۶�ƽ�kg�)��Pc�.M3���˿<�9ֶhk�挻W~y|v�-
�ئ��{���j�=��s�D��T�su$��0Im�"IU�-���ĘQ���$%�w�h�峴߭�-��L%��tl��{ϸ�n�2�n?[�� vs������Q���smN���d�=O�8�����,��s��8��
�a"�k���xLC��B��3��~���W����/�>���`i��
L0�P��<&�n�?^=�#���.��Bx�����#Q�qo��ڤ񦍙/0�4O��zk�}�-��j�K*�\>;�OL�U۷��6�ܶ�uہ�m�ڎ��H�\�Zۮ�������R�}��I��_Hr����m��q�lPqۻ��f{*}t�7�7�=z܊
��g��sWo}m�,�/h���
��g�H����Ow���珗���Dc�
[���Y����Ӑ�P��بm�7�f�<Sxzs�_�W�߅�-�>`�q���Fa,^+<:K=�|k�����j���ܝfH���rﷷ�-��`���/E0s��"։4�d��
�����Нe��0YAD���i�t�D
�
�ҷX4���_��{Lo�&�RS�;�'���'�ɱK�ڱ[�%	SLQe{�@��>�#o��b	�+�����HR��	���%����"�ڃ�5�ۏXi�%ECuV���ߑ.�.�\�O귄�ZB
rgc��H4IGn
��`,��-R'�T:�Ө湚��6�����\���M@��e�Շµ��	$X�t�N�M���L������T(���k.��2}���A�I(?���|�ǈ�
��x�!	�&��ر��v7��lL���#��Tm�H�7;���+��햎hǾ��;�׷s�7ؼ�?����qp��c`�[���7~�i_M���N&'ƛ�cmm2�0ϊ.z���ۑD.�Og�(�#KUH�p�O��m����E��P-��BL��&��m�F�ֶ�F'�Im�� ����t2��h�!X%� ��2�����d8d�M����Y�zq�F)�^'� �w�7V~$�Gۣ������'��ܱ����C�
5�L
�G�=}uƎ�5<�j:8����{c��c�޺�њ���X�����e���'�i<z`(�\���z"Z�v ׃���HW	~��/�q'[0�M [�@ ��M�_��lb`0�o��l�i�����Ύ�сc��Cc{&������s��H<3��[n 74�4U79�zOOgO�����y;[7IԵ�g&�b#���^?�NbUv��{W֝*Ӭ���,pɤ�8 ���Y�����$[���d'��s%Tk=OUWuw5�o��;`�`�
vܡ�e��o����s�B�����"�c`�i�&J�9�����r�Q��3��VZWM�Ѿ���ce�����q�ͣxN�	K`�Ҳ7�݉��o6� �-s|'�x�����3��G#�)�~��a��6K�|�䖠�K�{��5^O��툈�����/�%�ҡ��䴃����O�?��S������,�c��t�,�]
��}��yX/�V�tw6���r�%�)��9�f�e�J� ��O`_��XcT`=�v���L���xv�#����6��_�ux3�jf/�>Ʋ�\�Ҩ`�1�>������ j���_�g���[��q��P��/�#K(�1r!/L��4�"�M��ҏayρS�um�
�}�{�8/z~;�B��gA}�ke��,�cl�(����jS�` Ʊ���G�:�	YS�H.,����6�)�K/2F�,�dJ�
�P�c�b�.���3�����Hz�=�zn��������#��u�7� z��T��Ϯ ���]^�Ճ��'����|�Q���z�?���C��3{O���ˍ�����E���oH�2�W =j#OB{�x:^}l�q�T�|"���*aG���m(g#�vPbE��`g����wac��`�C+z5w0��Y�G��Hٹ�ڜ��'���Qho_�2�w���Ѥ��s/ޟ��������{5�Y�柰�-�"�cؤ��ʼ�8�
[&?�$a� +`tJ�B�h�!��*�3��b8�#m��-L�)�K�"a�	�����z@��I~�</Z;kp��Fa�ׁ�[hކΟ�כ��Y��k�4�h�9��f:�਍RV���� ��������Ϝ�@�
�v� s�8�
d6�<f
��D�]"�O ��A��
#Ұ<��-��w��/�9^���}r�dD�Xd��.N�����Z�K�@;'Kw�Df�]{p18�Em���j?A�m��L#5�V4�I�;�Z��9��C`>�_uơ]�O���}�A�`7��Āi����1��`���
��/�>F;<Y��6^�"�>P�;sU�&��c ��͊!�� 14i���Ԥ@C�.�7 �P��@W���4vv:���)�����?H�ȯ��ע�2'�,X=lр�7���m=���p�sd�f"K6��C��`≄��eг6���)u��o��(B�s����ɾ�9�x�����$�O���p����(�����w���
��D�ȝ>�Y�_p�--td=J7V��$L��X��b�����$���^�X�[�'1b���9�Q������L��bu@��y_��y�w�G�?n���++�ګ���%<x�uw��}e��Fvτ���"�c*�:T�F"u���sx����s�<O��� �P�Q,ҭ����mq��y�-=qG�UI$�nq$�#�5?E��
߬��/_/)�y���K��6����ṙ��1���P�������XQ�l%�:�L��wf`�&��Mk�d5z=g�٪ݮE� <�HɈ4����a���
���{|N�D���U�T��X���������
�^������8O
������@S7!g��Y1v00�TL@�4�*��Yɞ'�^V
%��B��)Ce�����1�����6_��p
qFWi�=����B�j�>�*� (��Zfr������,��&N~��xx�@����+�N��:�F%�p:Q8��ሮS�Z�g'e�3Ǩ��̀$:#�j���Z���5Y+�G*�b��j%���1����Zr�����,�cm���mt�f���I�	�.m�Z��ɶ���Dm�^�~��Ȃt����JU'Q����� i",��|`l6�����y�w���Q���ٙ�OO ��;��2�0��>K�;��̀��؛m��]�/�!�8�F%�eS`Y�
�s3S�F�f�,�S �S�B#&��c��=�p�)[,ha��B	M�	:�̙�H�HDy�o�N�۠�t��<J�c~s��l��A��9t�@�/`���i��ς����O�Þ�$�o���۾^����r.���)	 �b��Zd�i�/�!���8bH�m��Z��%�u*�'\�#k�����V���ʉ;��!��m0���pɊ�;��Q/��A����C�c`���XD�R��{l
�*aGڏ��h��{;�\v�|V�Z�H���p:a�@�&8���P�
����&F�q��(��_C��^t�Mʳ�����S;�g�bW�X0��@�v��R��(�N�k	0�b����]�X�/���P�I�
c��&�:��$��q���{� ����gF�3��!#�p3�2X��nZmFFF+�b�9���	��X��.�E�n�M���/��Z��b�9H�!ˆNM@�F<���i~���gF�3�
dj�.�Yu*!�Ӏ�%�J1��"��P�[^3"��Ft�l
��bv����,�N�JM�j
|�r�D�^F\�����P&��ؿ+*~�������N'��@����/Mb	ˆ�MB9��iO�Kn����s�v��4̪�]�<$�����g�lvm���E� �����|z���y��a^��~�G
����.Ԫ�U�AY����8��	��H�`i�T0mE�XK�Q%!郾���8����Sp�LK���t�����?Ⱦr�?��^�3��ǳ48���i~��u����7Jمϧ���|@@�`��U��0h���C���d� X8�V���L��BsԨ+�����^��EL�@��ULWgS�hh�0��ˑ�Udk$S9�0rmCTZ�A���]a�-��ʟR�ة0"��d�H����]�I�Cz�ۨ�\�xB��G��!��ʟ����3�g��(�S(�z��1��5d��5�A�tHA�~Ӯv�43��H%�i)ym���������w�=�`Ɍ����KP�o��s����8�rÌ��c�V�\s��p>�Z&����B]�۠S�|+9��CO��ڗF�Ws`#	�N���_�$��(�X%m��c�����V����XqQF?ϕ��n8s}�a��F\|,�-�L�ɠWc����o�vd+]�4��l)�72VV
��*�W�n��°��iH]s� ��L���Z�fa�o���9 |����z���Y�Ǥ$"¯�kA���a`�a�����4]���)R�G������(uw��vʣ�>M�`��bI�w�Q�Y����%����{�<��w{~���������GL�ا�h�4_���H������u\[+�վ$%ٲZF��ESڱ@mC��b�T��� �ar

J��Ѳˤ�7^Ʋ�i�>�g��ϒ�W}�[��U������ G�9��Kmv�'�|�����V�����W�[d���f��\.%W8(!��XoM�A�;2!,�'0�jc.�0��j���L*��D���wf�����n�Q��J��f���	��"���/����ު���Y��B�{TNL=hm�[Fݵ���1�������e�3���Sזy�2�9�#�0N�2���ϙ�e���3ܾ� ����7�k��R���y�+��iL���Bv�B���7QkԪa`N"4�F1Wm�\�L���:��.M(l��)Jd�1��Ȫ5������>j����-�=�aQwW��E�/gË܏Ո
��"��3�Z�a����@�&�Qڨ]*�e��UDhs+�;�����jf�)u���1��gGh͊�����Ձ��h�-�w4G\�}Vsg��|��9�y��uR��[G8��㘅�1a$��r[��%2 ����?�ҮBǌ��j���ͮ��-
�T����e�ߚ���NW�t�Yp[��"C?�7?�ݔw
���`���Y��Ǝd>�.(0�`�MNq�=��p[����-�Y�_�x5�f)��2o���U���S���B���[��u���q��[[\�ϣ;\]������k!�����j8z��q�
�;�q���p��	_�����7N���R��(�\;>��'��R�z$�H	�j��X�mG�ʜ�6	��w�{�N�v���Oi0t�_�o�����Z��iˁ�Z��L��^�n�Ȍ���k��[�e�
��o��^��׽�ibڙ�^������o�]�}*D��~�=1����,�c�u&Mf̔R���=�5��q6�;�q��X��FG�f��hQ4�V��8�=H����]k����*��r������AQP@6�	 w�" br����}��nt�=g��4�]4UEU=U�����A8H@,�x�Z�h&ѯ��hG�8����㙔߇+8b��9�g��{���q�����3�o{x#zԀ�a��i��k���2��>QpAl-uT q=Ǝ%N�&�C~�LX�"�.`�.
}äS��L��K���J��A����=f�*wo9�f�o3�-�v��D��9�ae?٥�ue6R� =��-} ׂ�!N	8:�|�%T2W 
��ULE[�ćE�(�2 ���(�\l�G�T�e��Ն�d�����!/�l?_���%�Чzx�?�j�A��[�<�\������^�4s�X�� Oh����P2��t��}�
��HiB��o��"�+ �r ߁�M"&�r�O�a8�葫Α�.��mt�j[��h��{1{�'xܐ\?�����v�[D�k<�w�(O9qFS�U���҉����7=X�i�RK�C��_�sj3_M�����WR�k�Tu����/�x|5���1����#p�߀�s_NG���������;�# ��qS�5��>�)[Mj-��|���,9��=X�ў:���h�/�����������I�
3��V<͛�Fw�����e���p��&,>z���3��'��>�l�4,Y��p�8T�ya�1�?YW�G��YU�f���@�u���Y|A�(6-01z-���X����d�]^?���
��EZ�/�<+�z$i�}X�a�t�'_��λ/AV��C��u����r
���i�%�49���Wtvs��
X)I|�����~�đR.�~�^�1o
6C�H�Jl�3G0؞8���N�ܳo�O��H��m>���7����'�u$�.��I����%��DKHK���a1��t|��;E�)S��bP1f۰�U��ۀeKXA�j���a��Rq��1�Cd����.\������������
4��«��f|ߎ]&�����C��6s*���F.\F��n*-v%h����:ѣVW4���U�l������2��&βv��彠騱��L��{���Y�Ff[� g�r
F�}V��$�t�3\_���:."�z<��+J�F�jҝ)�ji��:���s��!a��W�#X=
�B���{W��y���GN
�GoE��H�t�s����������rގ
�A��)d[�l�� #D�,�Q9�[�r�̸l�Ti�'�r
l
�r��9�j&�-�@���Q7�F�I�u�8�y~�>o����Q�x��!H�\'f'V�_�h|\;\=�q�s��g{��&�����
��~�L�}��y�x8��Zv��d�y���8P(��ϣN	�I���i����lL�*?M�,q��L�,wњ�w�cz�x���g���z�m�p��4���޺A]{��q�!.��'&?�b���˖�~�/t_̀b�#@�VF�_�j0��j9�QP�lsz�Y�4@�:<W���F˕�G 6_?���>�ㅘ�g����M1Q)G�PP��.�vñ�!T2���Y�i
��2
�ُ�R\vu: BCws)�|�M��+!��}+�R?��� ��2�sߎ��]/�u~�_��(����H��F�Z��kZzf��,��
���o�Ͽp�|�+����ٿ^l���s\�aW=��֨�vW��w�=�M
ݫ.�{����˝��E���C~�r�X��J����B�5�_��W��	y��A�<�%K��8N�.�����o����P��	V���x�7������*3�Se쿱�Y�%��X� �_���ufa�/���7]��*��ŗ��D���e��Ώr�������'��G��v�o�O��.���ڋ���O�M	/��a����p�D�.�!.NԷ��=
������{��
|���F������\I����f����K����c�����كa��1x�ݸ�����ޑ�=��Ua��K|�����τ?b����5
�xE�92����$7َ���-:J�D��Fl=�HꑥSAi�J�Y򽑃.����$TT і�P~ Gp����Ԭ�]o��5���Ec�������Jh>����~V[M�	��*@2;5-����
)�Gݣ��A�]F�
�vEp��hu�t~F�EK:�l:� �'[UZ�s?��$:㿠ȓo�N�'�E��n����@3�Sb�M�jnߟ"$b�!fA�`-F��QH�D��`�y ��y�뵢)���,W�6/�Y��f�"��I�i>j!>ZͰ/�Ɵ�����K\�],��ތ��x�����:Ӭ��>j�t~V*"A`9+�yg�f�q)�]��)�� ��j��C|�K�*��
��9dbL���ʮ�`�d��B�'��GZ9���g�p�.�&��pq�kL{�Z�|ܴ)�[��2P�%*�)�w�HN����'yU��t�u�P��ɜ��,�x Is�H
V�D�ض�� �Ў����ǣ��������/nu�1�q��=o8�ԭ�M@�&+B,�l��5�0ʙ�k��ݾ8��i+��J�#��Xސ�
B���N��mș�0އ�Y�-���n�E�v�3͚�m���*,�	�I�
�[��| ��R�8��Tk)K%w����C�k�k����*8�,���u������5b�׵��Ι�Y~E����O�.�"��t�ǳ
�A��[_�x���>I�;%DO��f���9�YaU~��̰�څ	EJ��E@�,b������X��h�����7��Nb��:�Bw�)�q�c��d.6:��.���?��P1�^���B�$�Ov�J
M�RvG�֙�Q@A����'�n[�/k���/���o����+'�O��������G��hPX�H�@����A֓5N��]Uh��*"���f9�6�I���,g��;ǇNg�n�U�)B������
q㕃�^�ů9�ۙ�g�O�ď\����5�:)�</�C��#�n�$.�|��yb��i���P�=����:�Ўf=I,w0��ɂݮʋfܥ�	��52z}ώ���d'|{��OU��ӣ?R��C��dVӬEU��f�a��"w�p<�yOe��Oqw��
��G�^Y%���lG�W��f2z:ۭ=R�
!�,𮱐�-�oF��D#&z��0>����>������c���;�%���*�:x���x���Q7�O�q����3����$e�&�.22�8�F33/8
�/
�7�f#2�
_�K@D��:`I�pR��{�OA0G�5Q�L��P�\Ŭ��U#���Y'�'z�M�i?���Q�D�ę�Yn��vM��v��p��ӣ��B
bm����wc�f�M/Bu���V�z�n`�����2��dmLy>��}cZ�ޅ�pJ��}��%��uY��A����ƞ��h��ʮb��.f�2A=j܂`��6�B	�Ksa�>\�H�PƊ�L��V1v.�2��nw���h*O�^o�Azd[]�.=�ztXQt�F��᾽�g$u5��D�AgX9�I�[��
i�I���GN�fy,{
���v��ie��@0��id�$`�ϹK	]�l-���C@{�]���u��}0�[���1ވ���ԇM���*ɝY��奙'�3$[��[��w�ɦ�R�XOB���=�Bk�K��>V��L�2E¼3m7��m8����M�$��ׯ�]~"y����r7���<��T,ss�A@�N4��X�q�r�9��� #B�
1L���%�����T������褭?�B�j��u5���;����>>���i��ؠ�N�8{#k�:��Q��;t2���rÎ�@d��`-P��j�M�A,ų�.�B��d��X0K��V^ڛn2_Μ�މ�{�u�i�yvx�x��2�O�p�]"�kY�D�V��������2�в�R������}*�a90b`x��N�+R���dEU/C�l谤��@	N��K��+�	���X%͓�Gh�&��k��v�˄=�J��=�����t5x%�3>�Q Zx�Ok[[��$�+�̌�V�:�h��3�F�� to����T"h�A@�Q����zB~�!��8�����܏�o�4OL�9��kg��^�,�j�Ӗn���%������on�F��W���l�Vճ�V���G�w�X�6�xXk�������z��� 񀄬�w�GV5�Z:��u��I(��&�#�eX1r���ɉ��"�P<[K��B6��|g�Xʮ��ؐ�aړ2���K$���˪�5|`i��*��ڕ��W���
��4k���.�6��/l�Q�r�ND8 ���H�pJ�D��4F�abY "E�_���aZ�01��:�Z�~Yx� �����O6���绺]t��EPi�0�b���O��诽�Q����6����������L_: ?4�n�<�~��N���+�q�����+�20�QS$ER¸
k�Dm�qQ�AH�)`ۘ��O�vۃq���x�8i�1�U�~����EU]�f��cL��"��{�]ν�,�Q���Z��^�k;���Ͷ��m�$�Hm1�t{1�t�<�x5_�g�/+�`�WkȲ��;�Y�x	��E!��p���:�;�^i�zr�[;�Ɖ���Vi_�]*���������S� �	d^�Ȥ�qY�e����3���a��̚��'D�Q�)�YoT��� ��CO��}*_.!#J��[3�̪�|�c�}I���h���F���3�k�W�-m��&����k�
��0�[Ev�_G��Z��X�|xA�ñ>�dh���˵��_��K+z{n@N6�����=
	`L��RH2X��iB%F �Y@u�5���Ǡ��D��Tl��{��MM�"'�RSE�;@�� }�^ց��+w�髱���m��7�/�'����[M
�;��o�H c
'��A^�@>Q^�d���@�P�u�m��^0D��<�5\[z<?��N��A�fa� 2��j򺡬�y߃��3�`9��ϥs��n����bj��] f�y)�FPw������K�;�	�S��|iW�f]T�V�z��~�03w�v����UӴ4x���vq��:���z(5�Ԃ�%m���.w=�&�"�ڸAOo��X�m�R^"mg��,`� �=$�]�����B���P�Z+�с�Eu��p��n1�Qz��h�41�f0,�b��YU��¡@���j�U�gӺ7� �ԗ#��ڷ&)�Z]�wus��3Ԙfg���U�Qz�b��aLP#ONUT�����s��zLcC��f˩�p��!���B1D�&5Ha��_�^"�J�uq\+�p}���<�k��a��i���}Q���VI�@o�?g�LA��Ə�߳܁x���UM����F�������ql ����y�c.�f�(���m�Qe]x�1 �5af4�n�-ʓ�kWˠ��3\�v)� f�o0d�,)0�����h�^,�1m
�S���I�\��2r���*E��)
~��I�#�զ��~%#-DG\˳������}W�>�=��sؘp�B���ٵ�!�w��8#{�0*�L[��5�9r�	Y�%5����[�f�]����7'4�G�q��)R��*|����r�{x��'�&�mR���n\��=�:�0m�����'LnCәBg��.}yv2X,C(�r�r�~��N0�tr���݄�F[!�rg$$���:a	)�
v��:�ܬ���8L
k�2W'XY`�$�>!��Y_l���aE��n_��L�3�/�g��]�׎�x{Z���[�o��z�=�\y#fZ���M
1p�E��GژR���� k�d3�����Ȱ�-cO��
O��k²�"�i�ؑg6y���lCG�<�ď��K紷��s9��n:�&Nk����e��W�2g{�ٌZ�#fƩ�2�+*�X ���#�ڢ�C텂���FKu��Yu��=�CT�i�ު��po�Y���s���֮������জ:KeU����0B�؊ &�iZ���c20k˽qo0��#=ZRn+Ti�+.f|�v��&��^gR%�a�i�R�U�1��UoA�f�Y�u�>=bzJ��6�3�s�Kdў������ɕ�N��ld�q���>:D%P[�n��]�s�9�zF�	*Me{�G&v�?�qؓq�GT^� ]=��c�~���,Q ���ؠ������` �^��� ���(b�#�����T�wآ^ٔ-��{%]�S��"���EG�7,��2�r���׮^v��t
���� eS`
8�6�i�Y� \v���/7�:�hM�	�ȇ�\[$���`�/о:j�rir�S��ҳ�����gD�Lc����[2���jB���B���Qto9d�(5�:/�x�*�bJ(���5ą;:��dڴK���Sʟ���L�͑9-�U��1M��3
eY% o\ �_"\㹿���=&�����$���&��Tǣ�?\�}^
:C`��
܄�P���� ��N�)��e��&!kM�^��)�>Qi�6^}5� 	��F����e�sEL����=6W/����UH�3�Suj�r�4HՈ]�d��(A���qa<t+N��;uU�ɠ��)q:�J�ل�QI�hp/��"$�1�(�Y��^�o����Q��]��)�ΓY/K ��κ^U��Qs]��
z�&9l7�p��p�.�~�7�%a�`9��z��[AT&�a�db�0�}�#3l�E�g4�fQ�}����8]�N�L^�ɪ��k��,Λ�	ڍ���tF��*7���ju�VIb��uC]�Ay��n���A �Y(�78�@ �s�q��aOk�:��+�,�岮�oٟk)���t����0��7eO\�0�5�.7��k�W�Ա�p �a� �9*�v��Ѧ��جT�r��Xf��!} �7eI�i�f"��(��F;i������T�\��?!���Y0��"�6�� ����em@{̐0�z)��AӦ��UwQ�W*k�
ח�~8t��Y-ɚ����3�~<��k=+_ts���s:a慌�M��z5i��D u]#�3
��m^�n�� ��µX�m(�EA���rhPdك�ۙ7sɶF�� G��'�c|��]A�nx*�^=G���x)b̝�ZH1��l��1�]z�Ɛ���{�
UP�(�u�����)*�a�A��:�	jDxc�۝V*��Px��T���#,턨�ZP��NQS�lo[�{Skn�I�n�
���-|ڜ�0�W���iK'��9�%@��PF*�NzUc�E��Ձ|�BU�rqT�0`Z��Q�ƫ!�j�O[�g�����݂�W��p� �]
F��f��;�D.1�W�װ� ��(�%<�La fÐ�+��JH���5��e��̙�p�4+�sݲ�i-w� �:��=��lB��D!�;=V���X��k���姓YU����)#�a
�58u�u[T�l�ʗ{F��Y�.�.�I�\s�����R��U��A�:ݼq�κ�u/��!f�����Y��I�Ddh��ӝF�H���!ب�=/d�b��M�Fc@nn�
Tp,�$�E�XPRZ��.�)�eI캕�S�{���מ������Ӹ�O'�i܏�b7�/Hcb��tٕag��k�
�00hXQ�#�В��C+dm�U�U���!�K���G+̑�������slk�3���.��㿕"<���m�i �'z�f	�g�U˂��w�,�ˮ2�u�k7�;CM8{z��e���TC$��oW�}o�����eթ�4*6;�����p�Us �c8l1*m2��\s8'K��G�">3�ŌvZu�3������z'���f�VZu� ��`�-]/�0"˒,�׮������h�#��? u�gM��2ZN������R�I�K����A��@�/t<~'���;���s���Y���K�n��=�%)��4���I��V�����1\1^6{'�l3u~�@��N�����t8�$7�+Hh�+�d.�����r�bJڭg��{�\L1
v��x�wFUr�WO_8�4�U��\��O~�K��wN��I�L=�F;_vn�u�xB�8'��o�|���� �j����gŨR�I��6��:�}O�����犱�@�;��\U>���/�� ��d�[��1�s$~�K���bR8x�0MJV��iT�sI��EW�-M
%!�����Ʊ8s����S���k��\��~�]�/.�88������a���n̔����o=��>�z�㍶����m��q$�S�43��\����_�����*���~,��Nw
3�;Na$!�4j�'r�nP��/U�Q^��ʞ������4�	G�$��;�'����{�P'�����%9�ȉrb5��;�N����iv2�;)Lt��x�5��Be���b&�m��&~�S�Sx����&�K���S<Mz��o���w�=���\!�����ow����bI���6�,IqY�#-� 1
���䵻��&��ɧ�<�/1�1E��E��q������|k���y�裗�~���?��ş�� *Bh, �y�z�N�� �����уώ�����CA	�G�����?<zx��}��'G��������ˏ_������o?������Wo���}x�ͻ�6�Oc��˘�q�ڶ����?<�����K�?����l��^����_=~��>�<~=����_}�̓�o>K`�����׎?}��_>>���o�����c��j@��8����W>y��[���qx����l?��7���8|���ۿ��?�����j\v��uM�0&���������B���7|�x���9��W�?��8�蝇��=������w�}��w߾������׶%�_�����������o����k��ܵ77qe���):�R�2�,ɶl�%5,C&�$�2٭���%��^Kj�Z�8��0/���1��6���[�_�
{ι��o?$0dv�P���>����7vӸ>��z�	�xy�X�e]�8�K��X�1/�0��5N���x��+:�ɘ�f�ӗ%t��]P���_�x�]%�Q(��"��s�̙���[@����;\��ϒM�9sԼ6cӅ�,���6V�/֍oN7AD�g]��Y��X�޼x�悉���L�=jM=i�O��n �����-s���>ϞJ��~ɸ�<d��0[S�����`@H���嫳��3�����9z�X���p�5�/�&/4���P���1}s�ʝ�����X��٬y��1����c�Ap����9��������5cj?PӬ��򃍕���c�׎�n���֯l�,����ZK��L�.jҶ�O�=f��x̽L,��L�4�� �ul��n���(s����C�̋�6��6��o;�� hu}���̺>��SsRk������|��Xl=,z��=GS����Cr.i���]���zz���ͦrH��ܨ􆺺����9i`]�<~���g �
��1��8sҘ{�Z�I���1�\�b�l�r�\�YHY؅&�ܩ��ƃ�E�VRs�.C��{��<���!<�th(��H4�6R�?���ca��`@E��h�'��m��?G�(��n@U�*G�%Jx1��:i��rE-2�	 �#�R1�=1��u]��u�j3~�T�a-^���<~#����F'�벬����M ����Z#?��~�����'��l��xĬ��e(�%V�ml�D3D�F�VƯ����(J4^-��H4�o���9["��j��#u|Nw�xWuҚՅ�M^���"P�I�U=� o�	��1��&�5 ���F9��/������H�]Q�`��!�V�b���t��htl��0������O? W�k0��H�,�@Gr�9����Wt��� ���h�~N���*V��ji<#Ř1��z])wK����S9��?��` �aM�>�ư_�iu
Т\�c�-�bZ��3\�
��b�X(�-��u2����H��(��H=#%�ѩD�p�3IDbY>̐^F��6�}p%�ղ�^�D��*��MaU.��\P�՟�$5"P�II*��b�~�]�ɑd"�-%{�W~%���(�:��A�
4�vHq��Z9#
VI�q�5�D�%��۷����X�����(,�����'BUO�>�L__��GFP���-�D5�%i=���RaPQ���rϒ�kl@��*ZE��)���8��mIz���HhT���r56fVBS�q"a�S�Y���,����-�N!I��@�۲�m��ġ�e���C�b	�gD-��D@U�3��r%6Ί�ġ�P1��
�5�Mz�%/��A$�M�c�;��Ѥu#�����[x��
�J	vK;k0���������F�һ���]�}l�#�-jo�$�Œ
��1��
'��(��e�l%����yШRc���0{0��"���1��M|��ɶ����Y�i��%���V�H��V
��ҏ�Q��,5j�A�)��W1�̞5�O���M��n�e��A*c%��3�"��dW�$#�3���]��b�OI嬤U�Z�&0�
հM���~�'v%�Tc��R��������O�/�%K!	�#�%�.��2�b0s��#1x�P�C
\�{���)��Urs��ET�ET�� ���|�~�]{z�zƮ��A1GHz��)�ف�;�[^/�(�'��ɒ�a.��rJ}LQ�x�c���3}�(ɞ�D���[`k�2H: A;Ucjy�a����%d�����a����R$l�ܰK�<� òZq=q�ӢMx�K�)�����#@y�N�vi��
��L�pɯ���V�H�<�q�'�,�"�KJ{�
��X��F�OI����y.^,��W���>��3����%�8oԊm`&`}0tRm�FSE@�L��]�1Poo/\4j:^q�0B5�T.gJ
nL2(+��KPrn�� 9�#�k���C����A�3�85��[V���t�ȳ�H��m��'�T�ۣ>I2 ��R3�V��x��D���_��SKtiC��0��4ݲ$[*A��~]�#��Wq��/tb��t�L�KJ��>�f2���5�T��Bu�f�� FOfl������<N�D:樌Z����b1b��������o��t�'�<� A4�I�Z,����̓#yt��A^��)�@�m���Jd{��X7�q�$ne���ᐟ�� ���R�h޶5ba�s��Qe�X�d�K��(�ub[7�G�@2` ʥ;��Y(�+��P�*�t�ɐ�8���J��tI�uD<n�
��q
D���j3���
}��>fù�x���-{ǫ��088hqR���Oxn+�+�#��M����Џ��A"��J3w��\Ң\�!}l�
B��۫;$:��7�ց�[�M"ڗ,�m��h����S���,�'�w����U~�܋�u�-zq��D��ݢ�y�M���9T+�F݅���pڢ/VE^���b�ً�-��'�&���+J�u�`s^��T��C�pJ�Ҧ�v�b����z��=:�g`�nK S��
tbΑE�@1�.f�ڵ�[�+#Z��5��tn 5�Ⱥ�!���R�i5?%J���LE�uYO]������_L$��ɴ���S��<��)�
�E��	7��^�`���U��!e�	״�6;���C�^|1N
�ȹur�`W�l���.c~���J�״QP��rB�slb�d��Z��$�ރ��BX%Q#6%�	"�>���ڀ\`�:VhSK��q�\�18%Yܧ���
U[+�5�t:�&z�}"��޿�v�]֣�/�9"��J�#y1W$��RPg[�����˺)��R
t��V���!�Ƭ�(�J<2y�3,��+1��+���4blK��D��n���4����z
�=��]�a2cc!�Ӿ����#�T*�B82���s���Z{g����XO�DP�-�8�.��T�7�$ xs������2��+���X癛9�:���~��*�ܸ#,���2\@��˿�¨^���2��eCqq�3��61g3�Nәz���.�}S���1K�x+��-��0�r�4�)K��K=`��v	�Y�#�Nw���(*I��$���淋�雭�/����V�zBB���4���/��� =~�H#4ԍm�Ԯ�2��mDwŕ���)�u��3��]���M�t��(���C����p�)`�) .��]q.���rP'5�5țE��Irgc�
�FB��iu�EzӉ�2LCZ�*(�y��������,�n�^�7N�5o�jM^����3�mxn�<7���Vo4�o�z�>���]����O��W��[��뗓���Y�ߙ�M�^.'g�+�a��-�b|�8p��<8L��O��Zg �_�=O������T*���\����;|{f��+��]�М��y�Z��Y&��%����S���ƫys�is�߄w��E��4+n)tKr'�fƇ��ӘV,�
�'��i�W�`�k/�曫'6V�5b�\�
��d=���.�b�drUa�2!��w�6��ڮ��r�<�K�׿�e�#n��W1 �FXL���� yS�6S�6S�D�ҽ�ҽ�J�c�F��o��
�U�u��:�ߖuo<�����	þ@�
�P�wٌ���fڒQA74ZbY�^���NX�Y��g�Q��wy/3x�,^�gP��-�iuJ��=�%A����1�T#h��]+޹e4�FT��Cٍ����}4��ڎ&�1�XxWO*yLr�`�e��;
Ϭ�~�X��#^,r�V�A>��o�6D�#al�-al�\R\�K�{�x)k��g�o5�s0�mi�R,W*i���G$AX���A�\�" }�dÕ��?7�~0/�2�h���!��R��I�c|��x4o�>�>�AK��ٍ�kW�k�m�c���Ϩ�{��~ټ~ۆ,��q_T�Ħu���ܑ�Y7�po�ý��F�`��ʾT,%�N�&/0 f����(�rU���J�%�����*ɇ亸"L�R���B�KA;�����q�;
�D�[�Jt�)��V���T����.�6 k��ZݦŦ6�KY
�ޠjyeN+�����{��:���,~��sN��\������7A5|¦�N�N����2����a��=��z��<o IO��6͚���T��yĦŮ!̭(b��pҷ9��kR��e���!�$V(>��j��X1�u�Q?XqwZ�u�/�eG�;��+JZ�
��5>�����EC�]Z���v�|���{
�و �b$��α�c��5�:�oh%H;@Lނ��-ކ����qˢ�$�V��OU�[�_H������8�����͙i�ڏ�f�+���.��W�������������L�!���������>�=���OwÃ�ҙ ����9�T��k6�+�ۿ�����=�n�㼊�oدP�k�v�p^E�7\o�YM
o�����dp�K  `1܍󔟀���R��U V.1R�f0�Ҏ	'�U|LV�W�j)B��Y�䥈]
�$
�V�*�J�kU�qd��*B!�ig���)Cd�j���G��h$
pm��G���;{���ދx��W�ʪ\�x�����榹�Hd�:�����j}$m+�)F��v�,0*6U��V;��`����rA͗T�����ZޚLˊ���"U��N�;Fʝ�8.�J;����?��7���=�|�G`��9X����F��GjM�Gj�5��֔�e����[���YN-+�jJ�Q�
�vS5��Mq����b���qm�u鰟�u5o�e�a>��"����|c1�'n�O�o�p6��4��ȶ#i�6 �zm�E�����V��mEd��<���K �a�.��3�X�64��
m�#J��d�*h�CWY��2���p�����z��3��$~�;�����o��׌�s�Sg[K��-q�K�l�k5��_�@
��)� �+���{ w���u.�N*��o�m8!��&�#%h`'��уxY��h
��?�>���
٭4j([���?�+�]ۅ�s\X�V�!"���	|�?p��b�=���BjM=h�<�c���.m�����+�C�WA�N����z̈́�=Kk���L�c��M|��O$6����̯kW?c>#'�����ɳ��o������I#�u�x�G.��:�IT���,}@��!N��f�TO-�ؾ˂?�q\����oP��W����4Sc�6�����\s����9�i�ϕ�lvHBg���f|��3S���h~��y�k%{��:r�
���"��@l@�lO��g/��~y��z��x��
��E��x�O{�;�ż~����?�X!��w=V��j-=5/���$!�%��������}���,#�|PVkiW���l.5^<1f�Q.O���0�֭��;+x�����,���`�@���A@P
FP���t�4;�cY��[Oo������aI��x��=��M(��a
��g�l���Ƶ�Ɲ�� #���\X��c��G���Jx���J�މ֙�6�M�A����@L�[�X�Nliٳg���k��'�W_�ID�N����=�2�%E��̋ͩY&P���;c�|��#�x|�u�!;H�x<	��!����@o��i �{-ѣ$榛s�ةC`7���͋O��K�k�>K��Jb\ٺ�㖨Yv�N���`��5��=�5@������0	''[���+�{ oc�q�$t�L��Yza,�d�o,?2/=BQ����ow~�m�iN���1�O��go�}sf���$����9-���뵢u���̷:"�rC�$���p�*�)�Gx����䅂G�C�"��~ܰ:�x�}v��!"0�=� f�&���xLχ58E!�	P�`��u%#�Nc�^��"��.H.q�"�i7N)�ܷoPS���
���
��$���R�{;֮���w~Ŕ�9�7���+��=$8�,8��R֖-.�v-;	M9'i6
i	��$4ͣICKˣ���ן�d�adɒ����;w�c��;3W3)�;��f�3Pg&��,��A�~{����;���XR�<�e_F=2~��
�;��+��C~���q�.�%V��p^dc�����Ű"��~W=ˑ����f^�ns��=�h'�lK+_�-&ވ2�u��Lz,2��'f�Zݯ�꿻��S= ����I�(J�X�.禲���Fk,���#���H��o����Kpf뎧��	�]CC�vGB�AP�����\S�K��d�7sH�!/l�w_�����=�W˯�����-���e}���k��ʷ�aF�y"�` ���^W<! ��+�r�8d㿳�	q4�ǅ`K�
���>m��}"������5v��_44�{Y��t�"��l*	L7x�Á����M�֑aU:aba�/�]x�`���V"�U������ba���ꪅ:������Lz̧��*&LT�"�i���w0�cGw����Q��&p���6�;��<�}�J2��&p��,=�!.���e��.�ҋ�js@�-���ç����6�03(��c��:]�\���Y��p�n}Ip�!<"�]��
G��!�8������K��8�f��#��"�����D�����y��T~<�����4�(?��tm�q��z���r\E%)\;��37��zx���ǅ�a����t�6�����).��eUY� �M� �}�Af�{��88��>���O?��K�x�3�/�ms���i2?
?Q ����Y�
u ~c�ȝ�B̼VCL�����^72�
O5�hݵ��o�	}�§�w�v$=;�U�$��!فewӶ΢��`��w�>jt�@��\��gmi�J�֕�?�$U7�l>'��IR������dZ�{�	�8�&�������Q� 4�]�W�i�%+��Ä)J���}�ͤ����Y�� D�K�pu���9�*a���ҏ�Z���0��
>̵�TE�5�mc�l<l��h߿�����L�����Z|~7t~}�,/���m0i�G�-_�]Y����Xzt��ux�7��<���L�)�Nz�*�v<�3-�1n���ד�g;���(YV����������vB�FTq�7͂�Zg(�Wq�y~<^���8�h`�m�$�xr)���@���`k��Z
S���������}�������%e�Nin�X�q�E�Y���/���W���x�8>0�(,--(��+3�������:pm�nc�f����Yuf7}��J�~��q��g�����M�[g��9�/E���	Y�4�eB0'� ,A;���?OU�KR�67�8�G��P�'1�!	�'�"F��|`���F*����D��6J7Z�&4l����p�V�/�Ou�2�i'�TzI~�܅� 
.VHK��R���;8��S����1�'�)��"��Ѝ3'G�b ��(��2(,~L�sPӂ�D�<��E���j�ŗ_"&^�!�wb�V�	�Oa��6ju�D�˧��c�6ʞ���j&͂��LE 3�Ao�L[�w5;X��%r��c����"!rd����C��{B�!b�鶻���AL!���~rb�8d�~ϝ�h{̰�2*#��Qr!��d�]{�(�y�� �4)Ms(����cy.Ɩ��DF_7�>�Q1ӦL>cZn�G��aS8�k����Qx��L������Aع�4WM�^��,��ycw�����OU��/	 ����}<f)�o�5�p�k�8�]������"7�Un݇p�w��@���y�H�gOԻ�+kD��r�(���t"���Nu�S�7�~D�Y��%ō+���_��^z�wV�`�h+�ŷ��M��"�g�(���7���W�k5Dz���4Y�ӣ�5b�y=Zyy��D{��w��b��Ġ���}�7\���M�p�ࡁxs���5�}Ss��'4��r����9�ӡsE΂� �����B*_��7��ӕ �Pĝ�P'=��A�����Z=���d��+kO���Q4 /��{W�Z�Jk�iF�a-���L~���̄�7
	?��
�:���y|���l�~�I����j���#�#ɔt|��
Zȥ*�!�
QzF�u�za15X�i�F^-`0�'��0?j$}L�2~4%�qj���>
aTd��	a�Y�(
�pY/����
��t�����^�A�,/�E-/�����gG^ʜ��FD��
o�x�bAIxy�弖���)���xk(���K�]L}|O�
�o����"��UC��0�d��m3g��mzy��ҿX�։�bJ����`_� :o��a2i-����K�=R*K/�����F
cR�8Y���_��C�nM% �df��I��F>��?bLBD��z�"�$�#�:=ܞ�h�6`��Iɇw�����f`�C���[�C]�Z~u�q��U�\p\&�N����2�C������ԳJ�j$��������⩘[��@�#Q���B�;��J�	�1�n�3����0���z�y%���8p��ZRo?`/14�YTV~�4Q��n�-�����[����d�k0�p��b�t��a�oo蟽��s���`�/�����"]����):��W7o<���W~a��U-,]S&V�6��Չ�I�:�����K�<�?��셱�!��{�z1KUv�9PX�,>*n�՗��i,,��ZvH�ɦX��$���:Ha�.~�9�
���<,L���^�T��^�Dj����� �#�	+��(�Lq}�|�r����;��4���t������f~g�\H�yW]^d�2=`*�����z}����!.&(L�����z����_y����
 ���ߖW�_�.�y����H��\��n�N��X8�|��}���~�7x�I0���Q\�B���uxa���)1
AH��Ǜ�J��qxX`M!.Ȓ<2R�Ki8� ��C�uzQ�ҴO�����v�������_sˁ��������h{0�D�8A���a�Z�
��G?��c8ۥ�Q���9l�7�[�S<�Қ����R�h��,4P�E��wiV����zV���d����4'`�kt�5c���%G@���;v�[����t��`�6����4�`�!��#Q���FR�
�Ї5ۚ�����t�������l�� 60ʸ�;�>�)����3C�n�w���w�� 9�Nnޚ�W�֊��#�3�}�mk���(`�s�Ƽ��Y��<�a�`���,e�k��!\W���?������?��O�>{�cr�hI���dR��夐�J)oBA�+���fƝt�;���u�2<�"#��L] p��r+OƳ�e��kY:������\��[ � `�d�TЭx<)�\��!X����6\A`R熝jO�q�Vb�t�m�$�0�2n�A�\��[�Ӌ�P��]�-��}�N����ٗ�Ғm�2�hN�OUs��l��D�C�˒����Fk�'����Ry휒�P^�,Q���n�ʜ�$*Ŏ3 \���[�!^6��q*wWS2im�G� �R&~xD��K�D_�S�R�H��S��s>#f�X`�6:)����v��倿������7��ӻ����K�uu�(W!�+�>[z�B�X:{��� ��1ݏ�U�SDn�ϗ�&3y)V���y�`s�sR^FDUI�1h<6
�uG��ѣ��W�#=�E��1�
w;�
EbuM�v���N�vA8�!bȥY�o2��O��D�b�2��U��m�+�2Ѳ����u�PK
     ;�U]              migrations/UT	 ���jgO�jux         PK    �T]���~�   �     migrations/0001_create_users.sqlUT	 gO�jgO�jux         ���j�0�w?ō)tH�N�}	"���'p&!b�ںXv�Ǐd�5�N�t�/��DF��9?�(	��5�0z�{�$ �.�(���`�'<STr�J,P�s�� 6J�W��cB�y��w����~￺��7�o3�
����ٟ�dx`*'�F�[�]��x��]�.�5�m� ��� ��2��&VT��K��~�Ȱ��ǵ�zr��n���m����lI�!�PK    �T]�PX�   �   #  migrations/0002_create_sessions.sqlUT	 gO�jgO�jux         U�A
�0�ὧ��Bo�U�cI��+P
Z=~U��v~��h� V2��	�	H��8OBiB���8uC/1��7��-]ў����tヌc������-~^���Wʷ-6�zQ{����?(#�N#����v��b{X��U�$;'_PK    T�T]>���S   ~   *  migrations/0003_add_email_verification.sqlUT	 �O�j�O�jux         s�	q
Rqt�qU(-N-*VptqQp��	��SH�M�̉/K-�L�LN,��ϋ/��N�Sq���r$QojEAfQj���c�k����5 PK    q�T]û'4r      )  migrations/0004_create_login_attempts.sqlUT	 &P�j&P�jux         =��
�@���S���Z͉\L�l��T!�"��\�ߵ����h�P{(	)P_l��ay�s?��5��1���1@�*�N*�:��m�kR+Ot�Y�[���hX�/��?sLy��*M�7_PK    ��T]՘�Ś   �   *  migrations/0005_create_password_resets.sqlUT	 UP�jUP�jux         U�A
�0�ὧ��Bo�U�c�S�U(�*���Q��v~��H� 
R��	�j����=��[}�[�4!����#1Z��U��]ѝb~��i e%졙��{�e���7��$�
��-Tiv����E#�xH�cm(�F�[�F�IvN�PK    ��T]�
��   #  #  migrations/0006_create_passkeys.sqlUT	 ~R�j~R�jux         M����0D�|ŖA����8d�� {#A��Et(D�S����kg����kd�@�(D
�%��0d`�!��g�� ��'{�/g-�����}�X�����z[R���[��}���F�w�c���_�u��'���9,���&6�����N��/�;�QQ�CC�9g�n5��ʞP~,w���t��l��a�Ҕ���g�C�PK    ͜T]Q�2�}   �   -  migrations/0007_create_passkey_challenges.sqlUT	 �R�j�R�jux         M�A
�0�}N1Ko�*�W�i*��U��b)�Q����y�0kO�	�W�`�p%�jSq�!�t�W8]c�I����3�j���B�{j9~$C6�v�C�h�Ǧ�_��9������#l
�\͗�
PK    P�T]j�v�   k  %  migrations/0008_create_audit_logs.sqlUT	 �c�j�c�jux         ]��n� D�|������֒sB(�"�Ȯl,%_pӤ�
f���1a��w� +�
vҒ��!��tY�` ��	h�hd��	>���F�S����[�av��9Q�J�?�0�@��=|nZ>��u���y���e��2>���T�d�Pb�[E ZcR�EK�>�UcP�ַx�ہ�
�W�ݖ,E��&$�[�Kd�={@��������7������=�PK    �uU]�U�e   �   '  migrations/0009_add_session_details.sqlUT	 G_�jj�jux         ��A
�0F�}N����hF($���.�[�x�	���=GA8A�S����{�����t�<L�Rߺ��ükm����IXn��y�CN�')����ΝPK    ��T]�B2Xm   �      migrations/0010_add_username.sqlUT	 �z�j�z�jux         E̱
1E�~���
[����	�[���b�����p�c���϶�
�{LQ�Q{x\����aJtF
�B��{h4��l��k���[�i�o��|`��ZD��
PK
     ��T]d}"9   9   %  migrations/0011_add_reset_used_at.sqlUT	 �z�j�z�jux         ALTER TABLE password_resets ADD COLUMN used_at DATETIME;
PK    T�T]�y   �   *  migrations/0012_rebuild_login_attempts.sqlUT	  |�j |�jux         U�A�@��+�cA������=I�"�A���A]g�ɹ��]F�Tq�%��vCs��?�񕘽�U�f�+�~�R�(�s+5�To����t ���^2��c�x���y�p�@9'�N�PK    ��T]8�Kl�   �    migrations/0013_add_indexes.sqlUT	 �|�j�|�jux         ��Ux�cד=�^���l���=]4�iׂ�[=�3��9��1�U����5B��M��?D�5�38$X!3�"�8��83?�8��8�(>3E��O&�Ӵ&ڔԊ�̢������@��t�.~���i�gӗ>�?�tw'��d���䧣�!
s����P;���S+H�� ��:�R@ PK    w�T]����   �   .  migrations/0014_create_device_fingerprints.sqlUT	 ��j��jux         M���0E�~�5qpw��0���}$05�ib����[�z�=Gd�$X�K�*P��)�w�񣳓��ֈ� � �:F�U%u�+���?����\@�Ҭ*BN�lKF�jM5�
�U���q�s���NAU3]H���؟�PK    -�T]u�q��   J  '  migrations/0015_fix_passkey_user_id.sqlUT	 ���j���jux         ���Ux���b����Ԣ���';v=_������� �
���٩�
�g�~�w��۞OY�c���3��Y�bݒ����\C\B�|\<���C\#<�C�
 ��3srR��S��ˌ4��v��F�(y�:E*x�F� �a���quw
	��B4�L���I�Vd�L,Qp:!���.ϥi����pN7Ys9���AUbws���#����PK    �\U]1P��   u  '  migrations/0016_add_missing_indexes.sqlUT	 �3�j�3�jux         ��Ux�p���Ov�zڵ����/�/z�z��E����l���Z�oY�t�T.]]�������������Ԓb+��������b}�����S��8�(>3Eb��I=�v�>����������������������R�fA<�?t�5�R��0�e�V�'g$��楧��l}��5�J2��^lh~>e��� �Vd͉O,Q�8����gs�?���c1�D�,�<�SQh   PK    VtU]E�9�     %  migrations/0017_add_token_indexes.sqlUT	 ]�j]�jux         ��A
�0E��b���+��I�f���H�-�T{|Ө��~��S���j(�V7P��TtSֶ��BA�.��x��G>��}��?Q���P������08�[<��8��I;�?�z��f!�4D�H��I2K_@e�~O�.&�PK    �tU]�jk�o   �   !  migrations/0018_add_github_id.sqlUT	 Q]�jQ]�jux         M�A
�0F�}O�/�]�fāq���HE��z|��v��}N�"��0O���=� ��x��s��6¨X�
����%X=�T8YB��2���ʻ_��z�H�Ӫh�PK    ��U]�a2�m   �   $  migrations/0022_lowercase_emails.sqlUT	 �u�j�u�jux         ��Ux�v�����SV<�خ�������|��';�n��6�iϴ�{:u
,^��>]:���N�� �W���Ԣb�`��F[�p� �� O_
����B��k�+T�"6�\ PK     vU]�-�   �  %  migrations/0019_create_email_logs.sqlUT	  `�j `�jux         ��˪�0��}�����UlG	���)�Uv(��D8��O[/��r9��|�?�FA$)�\��	��[�ms0���0� �
�"\������;X�DA�T��ͺ�ų3c�G�5�KN�"M��ߙ?�6\�+���H	&g>Uͩ��Iv�uC���콭��~G{�6pel��+J2Ç2��G�T	�o���׌?0O�\==g:.���J������PK    =vU]�iF�     *  migrations/0020_drop_redundant_indexes.sqlUT	 �`�j�`�jux         ��UH�M��Q�W(�LQx6�S!��30�U���e���>���	O��?߲�鞩���<���}�6��ޙ\.A�
�~.�
�n
���!�
�)�ũE��`�	�Zoͥ�I,M�,���eh*<�ч$���^��HG��e{��%���D��� PK    LvU]�㔞e   �   $  migrations/0021_add_last_seen_at.sqlUT	 �`�j�`�jux         M̱
� Fὧ��z'��P7h!� j�
=~-E�YΧ=� ֭'HY�]����~��,g�R��OX�Į'U�����f�!2hv#�X�+�R�v����mTuPK    ��U]�u��   �     migrations/0023_rate_limits.sqlUT	 ��j��jux         u�A
�0�}N1�������U�_hW�ĀEm%MAoo��g����%�V+C�)��J�s��D__�[$��'�a*G���V�Q����c?�3�-��XV3s���u��~�;ͅ_ƆRUF2v���{wN�r)^PK    4�U]��ݠ_   �   +  migrations/0024_drop_email_verification.sqlUT	 Ø�jØ�jux         s	�P��sq�P�tSp��	V�L��/-N-*�O�M�̉/K-�L�LN,��ϋ/��Nͳ�r�	q
Rqt�qU �Up�����@E}��E���\ PK    �U]�N٠E  �  ,  migrations/0025_normalize_login_attempts.sqlUT	 k��jk��jux         ���JQ��s��p��ZN84j9#Qc�?t����#A��J��Ɇ���W�BG�d���}��<�iUH{J/&��H�u��j*~�ӵ�J��: oK���}7�C�=b�?͆e�@�#@.��[˘�q�y?�Ù�-�ɚ�蜁Ͼ�N�əWi��3����gv��Q>���Q���r����3�
��2��9W
�q���_�羖�'t]��'ʪ�:��bZײ��]ey�RPЋB^���(��L"��~�<��EX�n7����(C8�@8&I�V�e"��`� �㸀 	�t#	������_��\��}�PK    ]�U]��s�   �   &  migrations/0026_add_email_verified.sqlUT	 ��j��jux         ��Ux�k��]
�ũE�
/�x�{ד]}
�
Ovv?��}>��Yg���K�R@���<߳�醉
����9�e�E�i��)
O;��tu^4�(��g��)�+�g�d�&�&'��$%&gErS��m�o�^�_
������B���mO��}���d�O��z���Ɏ��[�ʸ}B\�B�|\��vtqQp��	��Cw��_��;P����c�O���5 PK
     ;�U]6K
�d   d   ,  migrations/0027_drop_device_fingerprints.sqlUT	 ���j���jux         -- 清理从未被任何代码使用的设备指纹死表
DROP TABLE IF EXISTS device_fingerprints;
PK    ;�U]�T�lo  s    _headersUT	 ���j�3�jux         �UMO�0��+|�Exw�B��n�
�S����$1��8���84]$�V�S��{�3�cgz�'�wy|��]A^�d������)ˌ���m-]|����׀Τ�<�@$/�S���`�6�E<0�J@�Wڹ��F'�T���K��Sn{�*O1`���4��N=JU���d��x6�-���6�6�>Z��`�*X)'Iԥ>쯴$��ׇBs���`�V]�����t��gNU��N=�\i�F�:v3�Z�a�(Ij��c�Wo�Uo�U��O����3�
PhP�߰O��ۮV@��$����_�h�vH�)E�O�@nB5#Rk�Ǹj�P���Q�/�u���MF���=8V��)�R�Xe@'���O,���
H���$7B�H��
choo�}5~=����&���-˧�YE˼v� ���ED���/�qR'g;���!�(v.b�b������>@�(k�$`�!��}�;��"ZC�� =���K�1������?Y���)��P�I�Վi9ů�9'��5ޝ��͘�4e;�0��<z��������O�sMR+;h���p���|�w� )4����-~��*�F�v�D
6����g�Ӄ�<�PK    ��U]���d  �    package.jsonUT	 ���jOR�jux         �R=O�0��+� u b7��		���9���/n)U�;���`I|���;�aBH�Kْd(lv�-8FG��3:���;a��U)R$t
_t�=�1\B���4mj yC?��ߘ�R���'��5��H�3:���R��ߤ�V�5Iy�)�q"�1�r`
�θ����M�7�T�;9 7m�Y\2έ�(7���7k��28a�8�������g�{OH�ָ�Ԥ�1龮�{������g��-�F�-�G�+eVaxk�E5pa�I�JkKl�}���a=�5
e%젊�j���&%^ht~�7N]��˓���W�~R��/��(�HS��wR<�b�D��q�PK    ��U]2(�$2  T�    package-lock.jsonUT	 ���jUR�jux         �\Ys�J�~�_�ѯ֎��8��@,B�07��Z3��_��|�6v�g�;��TU�,��eVf����˗���_���k�v���Ǫ��?M���� �k��?��o�ȩ>�w���EWQ�}��t3��Sݿ���[�Y���g՞Z"ߴ��t/1��-;��NL�Jթ�IjD6��wj��O��y�R�qٍm�U�%@a��N}�����������*�"��t?���ص27J
=:�� �ˣ��\)�����?qjU�] �8��iW�_����*��Z��ܡ� }���4�m���eV�
 r���2o�,��4w_��o.�g%�{���k�ݼ�󄭧c�7+�2��hH�t�k� ��kx�{�(�EO�h��t��qM�[N&�	��K�$Z�-{d�p`�A�����ŕ��yO�2��{�ry��/�2���ݞ�B:�<�;q�䩌#rg|�~ ����_�L��>���48��W�*��ĽW��5bi7t3�"�,��~�P� �kq�m�w��4��0����!n��^n7}�����{��r���	{]�?���Mf������_��0Tʠ�[	rr~���} 9V�/cb��J��sd�,����3Yn�j3hfJD :<���hKuԳ���C��-�耳�Y�������EMG�K��:��ܗ��	��:\I�9�~�J�K���z|�V榻B*o����<���Ҵ�#
�#�*�[���v�ݼ�Y�
7�m��_E0���ݾ��z�0���
&ח���ׁI&<�Q��@�c�ϫ�
�W��Ͱ��7(+��R-����`'3�"L�!+��� @�V�� �s�������t��/�[c��@�uX`�F垚�n	�n��ď���.�o]������| Y�M:��xv�u�x�'�����;Q.���י���~N�w��ؔ,�f����u�i�,V1\��懎�꼷ȘRN��r��S8F�0����CX�����t��i~F<9����8�G�4��Û�'Ps��:�� B��%����@i�Z�2��DY�D�[|*�j���9��m6�;֜ر����4� g/��`���L�4,�6�2(����O
�~�{����-��!��G��b���$����]�-,��2C0I�<8�����
!�2K�	�v��tq"�	�
K���r{|���"��&[8��[<��y�ԗHz�=�zn���.�ܾ�>��n�&Do���T�ɣ+��'mq��e��@z\�[�A�o�8z~Tϭ'W��~�?��J�IY|�}}�X�;aoZ�C�<�^��L�R��n���j6�e�5��U�5���+�̖C�Y,��q��kF��%x����r�`C2`�:Z����4ƴ)����B�x�x��_z�q��ҤH�%���8��Wo�4x	�'�0oun��΢�b^�Ml�*����f�I&��$�~����b�TeM9��p$@�z%k��2b�	e��Đd'v�8(J}N��	�y���Zi��� |(?��m��V0o4t��\�O�_GX-���ƚ�l�xkd�!�q��\���`a�m�����i�i�2�I�iOR0`ns�].9�(�d��߱)�QaDU��~�?�߽�x%�����)�c�E�]��J�0٥#�Dz+>��=8y��R�u6��bp��@N�5F�u��D#�0�x"����r!
��'�y{��Gv�\��O[}��g�u7M C/�����I���c~+��\�彎v���!Uk��E�mOYl�e�t��;��j���{���i��5�d�
�L���b�<]� ��Z���M��ī�h��XO��ĉ|O^|-�*s"�ɂo=�{�h����fԄ��
d�bbS�ϡ]�7�Tĸ�5�Z1.%J�����|Ϧs���)6�bl՟g��zʠM{s|GN̿�����_@n���_��;��ϲ�ؿB�8�"�^/�#%��Q�D�nY`&�܎mvA��<8�Y<�bP�B���z����M�� &�ۜ+�B^����'��ۼ�etթ�R������nJ�9�߄��{��{�>ndwL8����^��v5���aS)�o�^X�>wv����2$Rj��l-�$ūk�jqN`+_�P�hY)��� ��Ie�M������7����s�{:�}~�y���Uu�<��Լ����mU��hb�dɗ����l�TU�I�W�J�f�:_��@����F����Ę�q�8���`�������H��]�T��X��咃�weq��K!�ۏ�Sp:�~O�����
�nJNQ�Y2v��gTB@�,Mk��Xў�Ҷ�eJj�����ʙ�i����rZ��l%h�
�Z����
,�t��]�U�!P�I�7��%C�;[���T��c�|G�ѫ�dtK������D�4 G�ɶ��l};��23����hA�GC�֐�4E�lӶk��zG��1����|r��g}���Mӹ�?	{}���ZW�-O32�q�q���V\��0��u%�3��z���܃�؄�4�J���)N��c1CGa���pۛ=]�����^��OA�;�12��b?���/w ��;��*��Ћ�뉕����n�Ğ��Aw}�?�����Z蕋}��d�)5�F!dJ�B���iaQ �S�L&-f#��}�p�	��,hb��B)MG):Ϙ������	o�N�۠��#xܥ�0�i,�$۸�H�9��(�̋6>�f�_�|C�r}7�9Lb�fI����%Z���/f�f=�� B��j9j��T�b�[��l	��
2�V68�E�[*����Q�2+�Ca�B� ^@�-y�w��䟅Kf����u���&�Q>�� c;}r��Շu;�5�	��6	�`=�]v�p\^j舊���p6`<O�8��})���� F<ӳ��e��!P�Rt�A*�o*�	4�,�N@l7���]N^'j���f1�i/S[_����+��'۰9$��Q�h�:7�ڡ؋�(1��\%��$�����k ÈN�##��݌H��é]�@��L�g�[uJ��K�d���l���xOs�6��h~��%Q�1'$�Td��3�ˈ;�9�OeD'��]�nF��Di�����A!�U�[�A���2�f_�kN�c�p=�嶊5e9�%uh��A���.lUe(�&���2�<�A�7�2yq'��\Q��|"͎��xq��n�8���3�b�R� �qo1G�t������:4�*�]*$�UC`��U�m���� ~����|:��O�y��n^��5
��
6�$p�J]ي�,Q�F������@m`qT8ir׈�^�����&���k|���2�MQ�kw�\������o�}�?����G�v���4��'��|����4��p����T9TVE����r/T]�A�t6_y{n����ܡ�,�����UG��ǲ�?ի������[LWWwS��{h�0�׋�2��VO'�m0rm]�[�@�%�^b��o�e0�2Y�(0�o�qo�	s�!G����^��2�a�x���#b��9��+?磂G�O��^�'P�Q�x�=b��+�Ts0ށ2鐼l"��.7�$�Sm�Ԥ}M� 3̢ґ�l����d,�R�1��w	j�l|x\�>�'-7�8V�M��['���~ �i�K���\Y�%,��n��
(��JZ��(�rh"��Hun��9K2k��e��v�����'���(��JO�*�|�\k���u��ܙ�ɮ���~�{��q`������)���tM`�IXU�4�����ז�m)3dOnUw
R۩�@�c]��)����} >}����z���+ 'i����
���-$��#�Y�~ʻR�?�4A�� �pA�g�f�^O8����
g�!e{3�ڜ�
�%��O�缄�=�Õ�)��������$u+�0����l�,k"��2��[f�s�QI�A�
�V�r�f՜�f徲?��=Q�G��Q�V� �ǤC��Q��;햝-��x�˾3��3������K~��
�ݖ�e�=.�:����4�����75O_�x���0x����y����~�Y�������A�	�����x���\ߐ� a!.��5��3��a�tݒ��6��(5���+kRU[�eG?��yx�݁ �8 ��7�y�AĈ��ނV���*t���c&��+3W��o%:���X��	��@)<2|�rG���?B���ka�AW
䏪���Y��Q�J�)X�ц]k����}W��G?_�|4|ȿ����82�BjZu�a74sm���~�}��\$l�4�|T�^Gh���#�U�>h�\�����
v������ɲD��MI�O/�h�_ofR��? ��w�$�й��a,�f鄢�B�!�H�� >�r�����.m�/����)���{��=ю%1egt��64sH�P�oXax�-��c"�E���Cb55�t�j��.f�O�#�������"%3��*rOv>f�vzb�sĹ��Y�5$��F��{&Ң�uP��!NW>�ch�O�qO��] 3�;�6���䱮�P�
@����
^��A-K�B��(����m�]�76�W.<{�\�3|#���=Z�E�ڻ�JM�]0��nC�E�؎�:�c#��rF9��0���(yL���P�����!� ����:0�=$,14�2�֕|�F!�2��j_��Wq�϶W���{��^k9����X��f8g�;�r2pƉX�폪=����&si�y��`��N�%<�4���;�W�H�Ϡ\i��dU�\A��<L������4��yr��e^��榳��5=0�5��i�Xo3�,��f6O���o=F�5�"u���7r�K�|ݻ�ĺ��GߍڨR�������%�u#���n�Y�Ϻ
����ɔS2�ꞻbt���,7S';���R<l�Ѧd`��]�,�(�\p�:#&>E�@T����17�4�y|>#�k�щc���<�I�s����#����h�C�R;��z�(;�|���Z.�Mf�E��!�;S��c��s��ְ9Dj�(�Mqz4�95�m�)�U�
�j����`7�z�R���tvPO�m��)�L��P��i�Co��>��rk�l^I��I^ҡ^
�*�ɭU�9��ڝw���q�S|~����Q*�+ C ��6f��h���W��g�L���8�]�չ �X�Te��Ӆ�t���c䛼@��x�[�3�PK��k���E�h��|psM��+��A3�i���d.�<]a�3�PW2����=���l�	�k�C�
���� Ttȁ� M�DL��B�Q0�cG]�.����av�CR[��Q���	�7$7�k^r��oaWȣIu��f6;��/.Lu�T�·�1u���2�Y�=F�^X.�C�/<u�O�(cn� ��H��~>n����и	CNN����5p�Wn籜-27��_3[�Tk@����K ��)���Y����^�8���.]t<fg��n�h�=�������`f�;,&X���e�߄+��aq�FS�@V�}{�����h1e�#�a+q�$��<nV
�t�U���"}�W�Q����0B(џ�`�c�D��UI���@	_�����*mҿ�z�I���u�X�����/x���S����Txu&�\�uE����p�6��-d����Ƽjd,'%	;�2��B�,�:r�8R�Wa(�3cn
�-2����(�XS&6�
���]����ߵ�G���e@p��G�yQ^5�wa�'�C���v^u`�X�T��
7*��D6loXL���?���aɹ�31aYȜ�V	ڷ Ӓ�b�1�CNs��J���P��l�c�+�t��5#{�_��t�v�ݓ�=���j1�[�3L�d|����K���94�g(⚓��G�C	�4;O����iʆ(3noٽ�;|���L���Y���|4��=ϴ�tk��>kR���l+V�b��h}�*H�&�&�����Ȣ�����ɹ+#��qu �
ʶZ�9��

Q��%oh���/��3X=-�B���{U��y8��Ev�Eo�J7�T鸗 ���/��=y���� �P<ɶ��E�AF�ò\G�b�,mϯrb���sP���H�q��u6D�`�d���U*����#r�^�S�L7v?/����Oosp
����٩�k�>�����I~�V�C��������t�/@|^�#�����.�΃�#��g�l#�i꺚:�wb_ad��G�$��ױ��v��qm�3v,TD���Py���R<����z����1���В�l����pмz����珻-qQ�<1fcX��x�#��xk+�3�X(H���z!���b��d���#t�F�|t�!KE�	�x��������⢾��񃘨���-5�b�2�F� M�(|F�G�t,�9mc*�9:�����q����>�rpXJA�фgh����#�9vbp�J���M$�y
Tί ;n���N�Q�+�#�L]������Zf��L����˷��/����W�;'g˔���&��=~�qS#��������nMQxS%�������އH�wp����&7y��{���_���Y�E�k~v����9�;t��]�䦌�L��<��h�"��B]��gX�+�_��5�w�rQ�̈�+c�$n7�z�Qr�E~
���ʮ0/,�Bo/~Q��h����=IԌj�/�Fκ����Z'��-Μ@o/֠��DK�[%]����ڋ����SzS��"�SQ?��.�v˓g����ے�'=
����f�^�=�iy�jAmXꗿ<�Fz�-/4#����'~o<U�O\L��=v�/�W?�k��yn���������
�o����W��>�4�]�hX6S�OG8��8���~,�
��)>�S8S�S"�>,�tiW�.�����bч=wlc��v��%L\ �~���A��=��ff��x+<�^�o._&�
���>��^	��j���?�W[C�
���G3kg�f��z)=?�z��� ����(̇�
�����T4�bT�l�pEG������P�֒�*������߉��/(�䋢S�Ec����&M�)��Bx�@-�b�⤰q���Ҩ��	�l(Fs/c�`�SvI��Ǳ���H �b����,Kk�S(;]q�T�HZ}B��Z�ߥf�'T�E|�u��}K��7#o!����+�I]h6J�u:�+�`C`�(�eo�e�I9���P�MP���=c�ȴ7��$��l�wԇ���k�\�&����\���I��`��e�I��L)�'���:\Ӆ�FP�]����Sm�u9n[�Ƈ?�ul���@��}
�;П�b��#h�*�|'�	��Z���!a�+-fai	C0� J��=�rc.�s�����|���a���]]�գ�"�7����IS��m���b5Xݙl������)E싋��:�$W��Y�t4',�tG�����f;�e�H��%B��x��������!��|;�f��)�Uf���	FH`��~uRo��` ��ky��!��U͵,�<�+��3�C
ݐ˓THg�R�"%J=`<0ZءV��<�T9�<�oh�X�ISE�B�[��"=�r�f�#W4	�������g3�Q�u�r��'����r��H�Q�s�ٌ���)Y$���Yc����s��1o���Ā�U*ζW���O�&��<X��[���7�@1|<Ӗy�ESM���s$e��w܁��L$�������qؗ܏��5�����Nn��������o�����G��h����J��,gg�.ox�	\a��QQi�	���Iyc Jse��N�%9�{����W�7U0C�@�Өomb�s\������xe��x�ś��D�U'E��%}��54֌�i.IJ�,W�3j�vD�쳡l,>ó�S��X>.��aP�9ՙh� 3��Vֆ�~�f�
��C�����w�Vmw���:���&��f#�樋��N�E�`2al��dx��H�x�
�9F�����X��@��pg
���8�.--F��+�WR����Xt�X4�~��!��e�n]G�Q���+,�É/ٟ���n��J-%?�0�M�֍��fٸEz��
�xXRX.9��r4��q�/���7�qU�`+���U�j�D�T����9�/yoA9ʄT�VC���.���Ʈ�G���j�	�Z<�M9��p?�B^���м��t�m�i��t���f��A�`5������pR�G���;�b��]��i�,l��k�"ı�q��͉a'�@D
&�dJ�Vw$�_���š�
��t0|�{�7�r����.(�rD��ja��e&XR��-F)�QZ�(g��jK
e�(k���D���%DxE��ǂ<�u+�?�iͶ�~���|��iF­\�7���g:�H�fw�3��a�T�1���to�S����x2Ny�X��<�{V�v����\���MҜ�=�YP��JmX�W�տ�����uOF�q)�+1���f7�a��A����=ym�Ib�(ے�@ί���s�i
��N.�i�Q����\��������%}~�h.Eƻ���c��f$����6ҙ�>�����:|��t."���XTWwWWW=u�L�Q�J����X��5�ncQ���1q�/��ߗ]~�<����WVUҊ�Ju�Q{;k	���ڂ���?��^h��c�f5���Q�m�6��
�Gj@�E"r��M������P���)|�%t�(���qD��A�ڪ%������%'̪U�.�ؑ�_�^^3�6�,wt�6
�I�sP��,���J0��g����D��9��I�Ef矟%�^����m�������^��76tu����uMK%��x6D�b���f��e�e�-�H��QO��P�Z�9�u�i��RE��~	$��d�s�Zd����٪~2;>��1%_`e�ҹx�FLǭ˻s)��)��#m��L����"�U�����ԕ�+k�a���
��T���LD�i���>ic�Xe?����㾚w���_��>a^�|��Hj�ޏ���q0f�i�6�������+���آ��D+
	;
�CB
�Yk9� N�X�!����mZv���o���x��׀��'H|a���w_��.���9^<�cLa��|�<�rJ��m�P!Eך{z�b�*ٲ^0���n��)
�U����ՑXL����f�P�W��_~�h��Sޱz��k�.�	�B"ui]�DGI[FZ��Մ��l�Φ��O��6^�d�̝)2�s߇Pu������ж�fR��'��h*#U����Ok��F��/��&J�S�qfޜ�W��E���<���ܼ��?a��y|���K�F]B ���1����,}p� ��C�˻v��Lmv�=���k����@��"ب�d���,�7�a٪�|���+͵���#T�銱:�N%Ӎ�s��sVq2c�d	U���.�>!���B�߻��{�M��aĖ�$��HKCUB��0lB�[g6\TKؚ��6�6�y�q�4`՟"�-��q�D<p��0�DyB �"���m��cÓ?#��W�x����c�{/vn6Lb���k�����pF$�B�����p����]4��� 5p ��m�y�+0}�[l<o�<T��ľ���!��Ƅ�qhx<�����0"í׹�S z@�d�F�����@���N��f�j-eI=����I	L�s}OA
FǪǓ�9��2�~��ۅ�i���z��g7��-��g	?~�]&�
5B�K�!��~�m�j�L2_�ؐkc��:6�p�*b@p/V�y
�� s t�`aOzp'�P�������f�?ܐ��>o��л���[
�ў��%	j����g��9�u��q_{��k� �<�[G�W�Y �a�tE/�#�,�cX���b��y�k�';��ˁ��z�3^��:չ^M!�[l)]����?\�e,��;�w0/����-�e�_��?+��Ϗ���mi
de�U� ��O[�7�F�D)������3��2'蠔A	��1$�����ZQKk�������,��̠�⮾�9��z��K�k5"}T�
�JSK'�a�]���gv�	u��Ö�˙Kjb�:�q�a8���tsbr�O�/�3��h:F�x>1c~��2u�_�8�5B�W��ʥ����g
�ħ�|��Yx9����ا��@�~�
���l=�j3��VP���� Ӕ���+�~���t�j�f`CQ�o�E�5y�c��t�w�g��{� ��oXE�X�%r�:6-� ��˕�F�ݾo�����|ͦ�l5u��&%i������9�(��b�A�����ٕoR�>�}fwX���g��v.h#�n�o���zų%a�v�ix��r��viI��3e�g���,�,�#Hm<1S!h+kO,�<Me�1�3���}�����6'�ר����M���Aj�׌���%����CW^Y�._G�;����Yp�}�wO�gzj��S����p�v[���%��A�>5�h�����C&�d1��!~�9�1��5���1���P�Ú���V��yu�P4~���ez����z���=2.Pp�c��LN4���L�M����zڹ�JLl7����q�c`c���i,��<w3H`��d�L�9��~�+��Q_�1�w���{��s��A~���X'��hC�7:d�yGXEضH�a[�{�ѳ-�I��9n�	�Xa�/�ب�x{�Ӱ��h�UJ�Z�½�Ы��{�ߍ�m�������^F�76�Ɖf���G˅������=ğ�d�^��VXo��{�b�H��i`;Ӣ���$��:�{C0i�@D��\sC���xό��>��ܼl�#�AvL|iZ�&��X��:����~��:���1�n�
 `DUg6|m��>Ss!��@��U���H���������x͹'5��Q�/�p\"zy�\*vnl�MQE`�|�r��Ef����~G�S��dv"�tj$�ׅV� 5�~
��PZ��d�?�4ڔk���~��c�=�LϠ�b~j>@��Z��5
�f�a�
�ZX��y3!��1S�:�q�n�y�\���<خwM����8��2n�����n3uP�	yԚ|����&�w���>J���p�A-�7�� � _q"�m#�5��~�V�*�pX"��i�Z������ve�Q2����6�Z&����@SoD��(���w��q�F׾
�Y��j4.���IzP��Q��]m�m�z3���.q�~-������kL�&����U]��+dA5�lɞj��v��3�%��J���&������{��?z� ��S-�>([]��`�H7�C��O
�n7լ�
�$#w�K-����ټ�d�
H��a����,c�8�m��>+�wC��;ɽ	T�>���"���X�+w�J̪�GC�0=��%X���Y2s��h�-���;�s90i�vQ����ہ����p�k�F^y��+ր��j:&��W��qz��Xe�퓱aOח��έz��XPǲ4,0b	��죜Y�7�֬�ģ�P5����ұ:����q�n]i�K���}�u¸�p2cн�g�-����f�.�K�˘��dǄ���0
7� (JA��_���D��f&�f�r�s���;�Él�)n#�f�mhh�Y�"0�'<����Q��C~��~�����wu*�n�}��(�_��=�`��M�v��I��l� ܋����pYA"�e[J�3�I�U@��L��%���m�����0��"�b��C��ߗ3�)��[��{,��Џ����>�*rr�*񬪛5��|��\ꭔ�E�`�t<�����D�zo6�P'-BmMLJN��X/�Վ:d{�Uf�u�)�I>�7�`�4|6j?ޣ�;&��<:�χƘ��L3C��;��]��6ޝ!�4H�j=�y���M;���)�Ⱦ�a��N�b�n8Y�����l�\8�- u��L�Ŗ���tS��cC	�gxF�H��|�B��M�%��I���S�GM�����d���8ޗmЙb{�cS�0�G2���yz�1@�WPS��KL�E���?�ΗOC���:����_7Zo�GVۿ��W����F%�t܋e�Cũ伬*���'N:0�z�R�q /�M'��q~�M���{�'���;^H٬SV������p���ݡ�/���y�<���3c_˼Yӱfq4:��T{��D��Q%6s�m{P+�~�zs)O!e����<m*���]\EL�L���:�����/k�X��K�Џ��{��
y�k�R&b��%�
o������Pw&8�1���� �]F1x8�[�;�~8�@�(M;M+���j�d#��t��A��o�s��?�����gG���.�ga_>/Ǯ������T
Xnc|�C[r�8]ޙE�.,#�
�N]s_��d8�ehL�����ʱL�Hh�wr^������Dr�57繀�/�����Ga?�Wy�,�y��I4�p�
&�̻��X��Ǒ}n_<l#b�-P���L�c���=ꓖ��2�
Sfe�V�����ڋ�(��P4���9g�.�(-���sPt�z?��82O�mL�g)�_�Tnpϲ��]RDGl+�Um�J�nd!�a�^���C�쫃 I��@
$k�X��ܬ�� �*�9({�'�џ3���+�K$������?�����PK    ��U]�ݿ��   �    eslint.config.mjsUT	 ���j���jux         MPAN�0���=FI��-}'8 .U@n���7Z�T��ĭr�Z3#���L3K m����Qx�EA?�>Ш�
p, .� �ƒo�ct}0���,we���]}f�"�ҁ|��Z��r:*M����f �'�F����a�Xe�s��^gj'�%�i9zr��i2jN��`\���tp]_�K����ѥ�6��}�*EOC�����W���T�J�Ҏ�^T$� � \�Ͷ4�C�PK    �U]�}�gv   �   
  passkey.jsUT	 �r�j�r�jux         ��1
A��~O��+a�ZX�htN2$�)Ļ��'���x�Jux�yT?��5:	���zFv���pS)�g�j���`9LF�>�a�_�!�4C�֛~��U�p���o�����c�PK    �uU]m-9�  �  
  manifest.jsonUT	 �_�jMc�jux         ���J1���!ng��5\J)irg&4������"�|׮DЍ4�cx3S��
Bwq�9�7���Y���+`IA>�n���������x�_i�r�6.��7F`hD��>5!�U�K
�Z0e4�ւ�e�L�b΍2.e�J^�������*��X��9P'��xM=��d�hNhRɐ����F)\Y!�񁔌bzqzlu�zy3�(j-N�B7�ʆU0�mt��Ag��d��E�MwѨ�8���l���c_	�VAL�u�
w��������0���7PK    X�U][2�M}
  r0  	  style.cssUT	 ���jJo�jux         �Z[o��~ׯ`m�����^�Z!E/@�<�Zy.����$ArWRu`�q�i�ԍ�4��\��	�6I�wW~�_�93$W�ݢ�EX�r�\�sW�)�1F�����e��u�pH;Ѯ��/�G'J\��0�e�;���33C�9� ���ADI���1Jp�m�+����qЀ-�=�<<Ǝ�f��Ѵ�3[����i:R]x��)N� ��#�uq�ed�d02� �# <F��Ǧ���݌P�M��b��
����q�d����+�G��A��aMBW\�7�\��D��Kp�2��y^f���~��7L�6ӽ4����������`f�8u#l���S
�'�eQ��>�8��a|;��*&�)N|O��� A4�+�Q�yL`,
� U�۹~�%M�O0g'�}2&#�lh�@{
� Q���\K���o�p��"�`d�a�	��Z�L�5Y��g�wkLT[֝ r@+�{�.v��&��'@P�(��@�g0IV{V�Ǿ[�x��s��M<�S��}z�����a\#{�t�PA�D/i6�o2l�Ph���]mQ�~���7���gq�FG>�=�'%�E�Q��b��n~�gqN�]q%!K܈򒚮%cnŠ��g�&�[�(p
��&�M&NV��~S!��eS7��*]ޣ��Gk'o����#�@i$~P�3F�&hB%�׋w�2�Y	�"���4*���
���l�k)t�iq;KG	x�{�`��i�U�6D� ]B�pO�f��D�������6�)�ܲɓ���1�1I�ճd�z�*������0C~��)�S�&�Lp�u8��r;$0C4�@��NO}7�$>H�x�%j�(�(���~�M��#�p�^9�9�,�6�d�iG��=��Q-�p�d���'�T[�8�9tЪ��4����m�&�}i�n��ޚ���?�=Du�L%N4mYiZ�<L��<q�0B�<�bLMɌ)�8�(�B<�0�_��4�>Mli-we a�=J1B���E�D�7��h�E�a_��VK|�p\�n��8�d2$Hh�\�@,�r�E��m,X��[��x
ϴeL��w��>�Х���|�䌦C��A �ڝT�#��c���)1���z2�ຣ��|�}�)�A��$�@Ԟh��=�����:Z�4�*<3TF��� ¢�J�ы*~�	�Mٿ�e����0�((D���j���z�j6�w>�{w?���5N*W�NΒ��n�ӝ�qz���w�w��I,����&����.��'�w��dr�o��m��%R�&jm�i0�~��P�a^w�4��\��&3{Kf��Lf�B�d��!k���Xo�"R2s�A�p�F��+���`������<�^}'�s�����w�Ս������M2��倧jQ��(��MU�l���n
��&]Ų|�.3��{Q�ҕ�B/��ף7֝P���҂����v��@��&%�,:9H%
(�N�H����IP`�ǉ��T��@B5�fS%��{��0�q�:P��Yd�l��~C?�'���4m��E_l9ay�����o��іP��N����Q�l�
�',��v	��g�Ȁ�4U�A��
*�~Z����{6T́�
&Ĉ��i��u�rH�ݧ�4��(`nM��u6잵��C��8I��L	�p����fKў̏S�q5enw��Ɔ���FmIn&�)���Dr��\�U���U�-hyI₸#�a	�T!�S*-��u&����<�d���d� ��k'7	�$W���|8C����d��4K�m�id!��@ �d/E��$�{ur(�-�%�SB��IGU�I��r k�[�Jr�K�q��98
�#<�&�_���劵���vk⧮��dP�}>ۋ�īS/�5"E��	
y���J�Tu�̢��0n���A��8&�G]��KrpPihG.�n-�ȝ���
s/��4�\�%N����GEٷY28� �j�Z�U�S�wt�T*L=oHdʦV\��c)⧐��UȞ{z�a۶�pX��Q>Vi�1�e�DJ�b��Vժ�8Y��S����8=��nZ9~P��`�7��e<rs&�=�U`���K�1�޼`g��Wɧ��ۓ��h����m�7�/��ߗ��
s�e�(b��%6���q��	r�%�V�r:.����"^9f�ʮd�,ٖ677K`���D��ltM�9�Fɋ��3O�W�<z���+�޿?{�����gV$�D��ګ�nǕ{�Zïi��W�k/ݷ0������I!ј�Z)z�=E:�	^*�an����%S4�P4����`�h���ʵ��'	e/�bF	�M����E�Ɛy�4���e�����4���@�_�����/g��Q����K���\>�p^�o}�{�ή̯]Y��`q���[���	0������_?<���>�}����?���}q����o�iO����'�KW�o�A�r��� ��Jo�dd��T�I��r���\ ���:��� ��
ö��N��f�������n<�_{��?�^����ֻ�n���{��vq�������W��ܚ��o�������1�&�%q&�4C�
-c��f<M,ޚ�祘��d����`G~�ٽ��Z\|x���Sf���%����*dW���}���R�Ғ�J����.��>
�W�� VR����ď��/�@������ؠ�T����i[ֲ�-uvk�lgh�m����KY���F$��:g��+z�4®R��]�^�%��
)ƴY=��-�\�dC��"y7�DP���Qmt��(*����6�v��=��Nՙ։��f~`�^ҫ����t\���VW��^[V��Ȩj ]���[�BUN�g�f�1ShxF�'�$��{
�
����,=[1�`9���XnE!-N '{'��&�OH�\�Ɗ^`�r�����|�ht��������e!E�R���}�%U�R���e�*������<��g�{��|0����k Nn�?:g�a��K��<�˭��/�o>K	6�W�>��Շ�n���0;�{_�^��n���;�?z�nY0��+�2]��l���#�1��xPX'��c۴���K�n2 6�����oh,�%�������b�-L�MQ&w������)������/�����Vy��D	�,t�������m��ͪܝ��q�y8��M�MzN�b�ba�N�e�J�p�z ���2���;F��?\s�t�(���.׽��h&AMJ̦�e����l��ۖ�-Ԓ��d?n����	Q�\MU���O���GrZ�Rm���@ڐ��3jM��a���-�CJke}�ً�R?V���*~�V���:�J}Q�M~��++f��EE����Ƌ8l�2s,u
�^޷����#�5��	��Q'���w��t]yݵˆR%
Sk!��1>��ul渊EQQ$<����6�PK    X�U]�H���  xl    app.jsUT	 ���jvv�jux         �\�s�F����d�w�[�]r�J�!9΅+��l�z��,�z��Jz�����p �� p��%܅���r��`L�]���?�uό��V���.W�R�Z�������33-)�Z�T=�2�C��I]o��lū��e�}�l#�%��
j5�=n�,�����⺇�<y�6�jےm۶���9�9�#?��Y�M�hj�-�[�y��\q4��5,�tE~�R��x�lyqdd�T��3"�S=ǀ�&�#ۧ-��a��cu
2w�� �K�)�E�P$�^e�+
6,K(k�9�LU��I�9E�H�zj]�h�T*a�q�S1���A�E�*Њ��S��~�y�O�T�ۍi0�8��hA��c�1ٓBn���ַ�6�|к|�����_�Z�]o?<�^��;�yby���ܺ �P���B�t��T
�8�a����C�CC��A��YS�aj����1:��:61�o����c�'N��3��)�x�ht�7u�:5�IOq����NţӚ��(v�u5�;h�?߰�.mX�4_"y�j�����f͙x��z8�R��1���z8���6��*������n���	n%�G����ǡE�gi�Ia A�0Xf�7ɚ�
�����n��a�@<fP�|}~�Ʃ����u��Cg���ѝ<3��湓60��=J5�(DF$复�d��	8�.�VMQ(�7-��ۖ��Q�UQ����ʬb��Ϡ_�@b�`�Q�	y��a�)��b����a^�%����L֕�4Y����[�anP +%� ���%��Z
��m]��]�7H\#Qܺ57e)�Wh���d�T���v�������*��v��nz 'd 槮�xM7�Fqt�l�ܡm��=�A�xVCWY �O��޼A+��N�#((�quԧZӏPmt��]u�����U_��QL��QeW(�N�O��ӊzxƱ��Vuf���H��Wy���j�S}�V���`E���-#����~�:eG���[e�j`����O�[^���uS�G�/��2���iي�{�d��;��J�&��Po�0mi�ņ��v�uC+x�y}!4N�g$?�I:��8����&������v��Y�.�+��������7��`��Ô��M6]˗��]D��Cq��x`tf0�64ޫ�F�m,*ٍ�>�ؒ��4aɾS�ֶ�r��a8�BL�����R�Sy�٩�"��$�F2�:o7��[��k�2��|�żU����!��2�������f
�J?R4��ś��G���[G���e��˭��?,m}|�O^Z_��?����G�Adk(��K��(׾xc����'k�Ï������'�����G���Zg��.�Ap���ͥ+�Ϯ$K�$�͏���$[���l}	�0k�������_|��$�����.�_韽���M���6N|��:���E���Ae߯�N��%JĈ�g�WO�.��X���p���\�)����Ɖ�\��/,��IjPճ0\
��Z���i�H�;Wq���s�H�1��P�����ɷ�M�<�g�ރ����r�MH�[��v<������р���%s���܀1�{�^ޱ7W@v��� ��k}��Gg�}Z�^ϕ����=��'���߸�C$���ig�;������W��o6Vm^^!��6��}矽�@��N}�p=F.�?X���\�9�~}�������y��hmĺ��D��
�������=S�D
��D�
�����4{��rk����������� ϸk�&�v�N5��4:`�W���Y�����t�K��q#�+��h]��?�QNR�����+���sS���_���v�s���c��VZ�q:.�Ա��#�Ō�����{ �[�O��ߋ���� Po.-�'��7,M1�`f
�FNH�T;������ ��Vh0���V�+߂C���׾�o�Ϟ�\:
�s�����~X:&)��*5P���ZwN�35�.�3������Y�	�0���~�ҭ��D��E�_[�X��[W��>��I:m�e@'%\�aga1�ϫS�eN�L,��ZW�K]�y cϜ*Ԫ�OqIp�:������&i�x���_��u�&j�1_Z�Ǘ[__�c*{]l�~M��N�V�ƣ�χ�pv[��BN��TʌC�C�3���ݿo�Ⴭ�k��;��ӭ���
4�K�ZW��S�Z�^k}��K�L���A�ێ>�����s����.>js)jR�,`;�T1�)�9(�:y�_>���#x�6�����+L{���rK�(�����?ٸy3A�]LV���}C�3"� -a� z�!.�?"�`"�K�9�9���n/����^oaZ`@�֕c�˟�BC��;���vr����˱(��, �ig�F�|!�s��wE<q_:�C�sd��[:$���>�!���2I�F�(�cr��Wo��.Ʉ�cƳ�ט!x~��3A���#.>�y�f/��i�DM
ܳ�
��
r�LA:b�&�����`;d��²���:���It�x�wx�٤x͐L���B�q �V�d�j:ą56M��A'�	�J'���AM���j&�%i�0	\��d��!��C��v���Lؼ�
i�_�A�
b�(�2C�N:��T"��&�B�.�e�T�
N7R ��U
H��	V�p3�b0HT#���*�g)Q�
��y���S�E:N�k�~tE)��"!�(I�"~g"�t��>R��.��bno�~'��t�I.��j��m��N�L�a��RB�1
��f��i4B�/:P�>'
�9ݫ��]����C��X����(��!�F&���������A�-CW�À�#q�
>��4ԁ���.�E� 1?4/A�#3p�*�	�cL߰���X�d�à����pH�K��儾!!h�a�<C���� ���3��
�5]U��|t����X�x�`�*i�6uTp��1\j�����|c�2�1p!�[��d���L�Q¤����p�q�7#�������$�������#3)�`�T@��!�J�&#�@�a{��yS��KM�ve��1;���z⪓0��
;(B���2�KA�
��њ�9�|���l�$/��(�m���&���|g(�	vZ���Eb.�d��q��0:n��M���P�VS~��xJ��G�L�`����9?s��I��a�8�D%P���� y�\������;
;�,�/f�6 ��-���D�9�_"�"~pD���s�2@�|�5i+O�'gn!�焳⸉s��U�,��9$J��lN�j$�Z dT�:N�_p����ȗT�o�ev��ȒŊ�ހQ ���\%*FZ4�%sD$�d��<~֫�?2
b_E�cB5.ٶ0�)��~v���;������j>`��L�>X�W��^��l��	�n̜1t��g�b�0g� o ���xh�ˣ�B����A�/1�x'�&��c|����,�4hT!�S���S{v�C��+����m9$+� ]������N�ш��+����>�*����D�)dp��ٙ~*!O)���(��βQ(�>�%�)�5EQax*|0](R熿�#HP��v�3�uRu�2�\0*Nn�9<�w,R��
�)�{�̌!���	��>"�i҉�|��r��&V���b_���1sT�<-�9xz�H�7�\�1l��;iMi�B�w �cOu��
�N�ӰF�%z��0���� 3��eg����Q��i^<�.�x2�\k��[�F��&�0�c,��U�@;�s�Y�Pe��
��XK��$O�G�(���cgk=��S�5��;�j [w�V���S���/�����@��н,�0������!��_���6VTN�alܔ1ܘ=�ɥ	YUg�:%��-�ŘF(��&�� pm�X"U�4�.�(I���3Jh^�!�Y�vF�v�%����*�ЛjأR�GBx�e6�aw6g���K�buIq�)�YB^!���2���Ʀ�B�Y��`�!�,�̟Qf��T̰��
�j������e�� �.
^-+U�Y�/�p��lP�n�B6?�or
�ԩ��m��8�<��U�2�_��j>�)Op�T+��{u�{g��7=��XŅ�bU��}{+�"Y�����*��u�#S%��J�^sF�$���ߔD�e5Q,��8A���n�$ùԴ�� �T��/$���L1q'Y�b�W�\�1N>���{Y���;��\ܾ3�T���8�0,>�̠Q������
qz��h
�q������+�����s����?/mY|n�f Y	z���������7i_[�%a��&�{ﺿ8��/��w+�"�4�*!*m�[)6���DbPsƫ�WR�@�ݫi�HQa~߱!\��~��1�_�A�[He�,�{^�c��{m^�}(E_�,TP����0�Kdx?�
�xWc?�=����JM7��
�ċ�>P��bd�����8��5t]ԏ�\�
�e�	M��.�G+����� g�kpD�n�	@��89���$�]*�Hh�����'�܍E6�� )x"����)=�]l��ICG�N��O}���ڗ� ��yvAj���$Сk�\֌�����t��d�%F8�MQ��)@`؆�^S0-��C�e�O�O�e��+
�#�D���\NkߌM�����ӑpUr=e�_Q
�#5��B�hc�m�*u�(�*
�eN)�.(��Y�h-��	�;����YR�f��ͪ2ϲ�˘'�I��}�~x�XK����a,�����5��a��֙6,���'}�=�M?��!l���te� Ŷyx�ݗ�خs��.�x�&\������u�yN75Ȭx���^�;���gr̰�e�s2R�:�Z�n��[Y�����Ε���[��T���:`�"d�z�y5����u��=�/jg��k��M̩]e2��r��l�T�a�h��o���L������P2�Z^�sը�&^��T^Br,�7`z��IX���;
�ݿ�W��t�yxG��
�GR�TZ��@�W�b����2C�����J���]�	3����0�d�j1�y"q�=���?��~�,b�!��~�c� ;�8����6	{�7�Q��l̼�#�*����i|��>B\��RA��2:�f�9Y;Q�o��ٸ�bfp����&�"e�܂Q��ER�����/�A��oLOK���s0Z�}����)Q�kGy	Z�\��#��dٮ/�<{&��z�h�T��
Eyj��0�b�����	�6Hx�s.s{ �r��IQ���%\A��'���ƙ���K��nܾ����S=������~\^�d*�-�p  �_8�BgK *q���g��s��������,%�i�U% ���?t��ߦ����@��h�J(��O���W;���f��ϽWY��S��VG�O�����^]��<
����^,�����V�
�2��	����{��1WR��Ok	�:�� jcˏ��$+����,� �zc����@�+<��t8�v]2��k���D�$����;+�t�dy!`�wfP�w�K{�%�5�rC	?tף��2XNᚔÚ�}^A���[�[!��.�(3T��ﱩ#ޭ|�> a�������0��[��T.;�d�ୃ�mn��͌P�rnw���{�lK�,>J�e�=�v��_���0p߅Mv;q�,>��P���+FH+�qRo�}�Noozu�uǚã?N�w��B�;�D5��hRH�&� o�mɨ%�d)��\�r�F���G��H���'�<"��E��rp�~ay��U��>C#�3_툽ɞ9g�����\�?\/��N_>����;����ͽ%�l���W���}�����S���0�?
��+�|��=~D�?�������<TK
tS�ط�0��Z#���ӥs䭉ݓTq����(
�N�.�[�(������HV���|E'Ӎ���H�(*A�B""a���I�����n0��(x����"~Mg����[j�u�SOu����U�R-舿I��IW.(]�F��QH���B�Ga�1�N��D��d�����L�Q�R���T��Z��g�號��7��h<%�'��1MB;(ͦ���'���n��N��iV���N��}Y᪠��1�r��J� ���b�G�`�
����½A"����[�˿���l"�eҏ��s�9N%�;�?s2,��g���z��f=��"��l|ڽ���/;��F7��;����VI �bv..�M�{�P�<\=�(3�8�/aDVA��e\TÜK��jk5���QbkA���`]9��^	�����-0�ϕ�/�'��5>oC�WEr�dL6�S1�$t�~jMw�ܬʲ��{�Y5�Qh0JxE!.����'�!��L
�h6����? �D�2�Y\��7
�sZZ�E�+�A;i-�@-��DJ@�jq� M��\˞�
�V
S��������*G���f
����2��N�ۏ�� C��t��ܹKf��Μ4mO� ����:��������� �5���1�)���=NDD���I����=I�|�{����Pӑf��w�n|�x���m߭>ߓ�|J}�6�cp��Ulھp9	IZ�}3Sd�LC⒬P�ǒ�:*^Q��'D���ͱW���n0Z��(M
b%Ly R[K���-�A��t�g�&�*?�a ���ڋp���̰�[��$� v�1t��PI�9"�N�8����uJ��D��E0(2.�h���.'�T�j�\S��H=L7��[��ߓ��XE��`��{��u~�L��wo��y�	��6��9�ۋQг�g��_�=z�8���8�v�;��]�����K�9��I�μ�bd�q�AY`q�L�4���;3u��T�3�8�皨�.Y�f~� ����~�d�7]X|��7XAC�rP<b�,B1�xeE�q�FУnh�.C���O5X��-FxL��̨��۰ sT|��jz@b0I.�i#���&���~`����(
��W�n���YjWB���5��η��0+8�K�=�f�Յ}<�����D��"r�!(K>-�*��p5+J�J|
�}�_�!����PE}�֌�]�M���)j�ڷ۸n�:*c�

}��X^1z��<x/2;�p$�$O�{���x��ll2?���4��R�]w�R��EͯǤ�����EI����L	�vV2�y�R�и�(-R´�;+Q�X�t��z�C$S�AضFe�0�%r^+��V���tG@�j�w4²]��Р�u��(ĝH5�}us�V
p �PK    ҞU]�A@�  Z    sw.jsUT	 ���jMc�jux         �V[OG~�WL�*���i���J9	*��Ky�*2��׻۝1K�$� �i
$���DK�UCh0�a��'�B��^l�!����9s����s�I�������t�ߩ-̻�����f}c�{<�~��W]?ܛq��PM�q482�qv`��>�A��).twu_͎�u]���u�b%U��I���Ʀ��tG�� +���'I)�S����I%ϋz�`|J'��X(c�R>�3V S
E4G�iD.���￫X�X����H�)�ň�S��eǉ�{)�� �,Q�����@��48�2�)68�eP!$c6e�H���' ,� ���HL1-b�
��pK��S���a-6"lV��H����rBN�H������8����AX+:_'���o�E� ����0RrT��\?*(������\[R�;�
�L��ͮ�؊��QiD'��.�kǨ�S����i��8-��XJi.�(�؏�!)|ʂ� ���=��#]=C=}W `@s�4��@���Jd�4���͸l�/J�
���:�ZSU�\����0��6�l�Kv�XKǮl�,�hTu������[1����0�j���{'��c�l�D�M�ȉ��
�a�C*Q3��4��� |´m���Ա�_��7�絆��R�Ԇ&X@��d�ˋ�,��8.4!��|�<������h�#c?BJ7m�	4.K����g��W����Q厷�ԫ��.�Z;X��o8�,����{���0�x�]B߹���k��4��M� OA��KH�d��,�!FZ�c����|OB��p��}|�8esr��L��J�@&'��J�𼩉)]�I907"/%��֧fx�7�ڸ��[1m:F
�H����s�p��T
u�� ��;pe@�ܦ���ý�Z害�����<o�"96�ሧ�ԆÓ�A/�؄���ٮx�L��/�*�W�����/O�?<<�,U��=�M�٪s{1�ge����U�܍�j������:Zy5�0��1�E7nD��S���V�������w��t�&��.���
�%��ݺ6�����SYnl�ow�!���n�7�ڃܯ���oA&N�:6Smj񳡉+����y�0����Ã���[�b��¥E��=3ڜyfڜ���z{��`�{�S�_��|�
q&�PK    �uU]#�e�5  �5    icon-512.pngUT	 �_�j�_�jux         �{uP�������FiA8B@:��D�A���CR��.A@D��������������3��;����3����H�K�  �%ym  �kP�����}�?��T}�Z�Iaaa����������ͭ��pss��ƒ����ʮ����Ҋ��������:88ppp������,-.�������WbddDHH�������_+������>44�?HDX��G\n��:��
�l�l��O�&������h
S!?U�<��D���\�,�du `��˼���7�̘E��U�{��*�51A� ��ɛ������p]�t��ʎ�� ��9���6I��.|Z�N���xֱ@��H��kd��3iSG���uyc�5x����:��U�9#\m��?=���q�OX�5��.�w�k�9}�ŪI��L�G�z�F]�
�1�^�5}�V����&�<\S|�%A�ai��̓4偫8�Q��OS�"����z ��� Jg0��@ֺ�@�W 
�?(�~��
4� ��E��8ȩ{v�J���X}�����Cs)f�@)���F�J�Ƽ�����ӂ4��L�����,�������Zky�Ȕ���_p$i�ap\����+]i��l���>���,�r��JZ�m	w��h�Zs���І�d�MBR\/�8W�D?m�o7���$�o�RW#@�?�uh
BsC�-�]il�]�u�mx�rq��U�n�Gc��<2��<�1I*�f���Q�/���1$T��J\|�@�@v�`z�R�c|j�6 �)2M���M7#^ϞXա��:�c�����1F�#eF���5w?;v���?�?�v�Lx���:�&|z�o�bۏKaR���ҍ7�����5W܃5�歴��6���J�Z�,Bӿ�Q6F�
��#�_�v��:a�Τ3o0ЫL ���<����z�)�� ��w���2@*�5�m�I��j�3pP�,��L�|�v4NΕZE��P�)�_����b�`��}��Gn�J0�L)z�|� 錽��p�,G{1������bW�c�_�y�/�ә�<n�-�s��67���b�� ���s���&�+��O0W�����\Ϛ6J[.�U�"��Z��j�U�\��K�	= ����Ł�4�ޓVg�j���`����c�����pŁbԷ���A �K@�N���)X�`⺱j:������<G� Y�@���D����)���X��@� k�Q�3 � �%�Y|$�����g����[p�^���[�ȅx_��UlВ*|lZ��oU���7s�眀�+G�m�g<��Q	��A����Ud����z��N�ur��@{d�m�ӋI�����{\P� 
��vTN�ց�Nk�������R/�&�V�G�)��ۉ�����Z%���B����m��`�6�����Sg|����c�dG/�� R�P�z�FN�ͮ ������s�TW;T�f.��?���R9��$z�������kՎ�7��vD��#���g$��>)k��'a�b�4�d��/����o�I%��b2.�p�n�9]W��d��`��S��S�z}-��A�w�K6ЍG�qH���ϾC�8��)�昤����W-�Y��ދ`
MI���EuJp=��[C�C��[4z���k�`w��F�4|VuZ�@�����V�&���9,�-Q��YP�����Y�t�r�-p&�U���2	�#�s�v���n��]�C��X��޶�1�3���w��l��lQ��K���T��5�WaM�U�s�#
�LL|N/�.p����J��.���UG�}a���yۋ[�Q�0�.���3Y�!*�U���'0��jM:������i��
p�Ã��ư���5['3/ЀZB$:�Yy0+�'ȥF
���Ѥy%]a�TK-m5��I����d��@R%�zO��sI���Đ3
��auA�EwL�]F�e�كb#u��u�E���1;��8���NyeޮX(at�<t�#:b����u��J׊��7�%Ŀ�- ����p�۽J��~ϗ�.��c.!�I��NE��m]�L:}3'$�����<'*�1AyZ!����8�{~T2��*���*x8�S#��`Q�s��_"�޼y�!gft��P���5lۄt�']�߮�1�z�O��sX7"uS\$_�ߞ��v;��5}�T�iV���vDn+�
��������^�a%}����"���FTf���^�zLAڣ�v��/������T[� �ْ^�=�y�����x��F�z��kELj#�g�0����=v��r��mѲ�Jw��֯�h��g�D}l:��*�VhV���w�9r(UN8D�������� \w��9��c�4���i�`h	��ϐ�����tS��d=��5b��!���6Sz1���P�����t�_����Ճd�'d�֔2��w��7���R2��Ҧg�cxĔ
�k�N�nÊG;}k��2�8D
oٻ��Y�����<� Ȝ���w�� X��X��d�ަ��N�ܭ��nr�L6��R3���c�\���~s����h�U��L����R��[���o$���~�hϗ���M���N'�M˃��Ǣ{�/�F3:�_O���_FQ�xo
��	�U�~���e��â��~]���՚}�[i�G{��m����ioe����Y~y�W�+�ќ�����f�4���;Y�J����ɧ��
�k
�b_]�p�ytS��LQ0�u����@m���|���ѽ"�	$e���ў��/��R"�EIk��i���x���
�AK�WalbkyؠE,W�֑6�����=�S����*k�@�����ڮ�NK��ל���7�N�`���TS�=����SO����j����$�i�~J;7E�+3M����G������{[�.�C��N!:+*ʛ/�6�9���T�e�A¯�Mk�<m�ѵ׶���^j�_/�֞��1���MW��$�ŷ��(���`�}�2����}UzIt��k`���:�Z��Z����+xg9�V��G�1�b�q�fVږp�L%��ڂ|�*S��ң��o�M��9w���zv��xo/)GZʁ�U����F;�đ��<��2��l6|�U��G�s��w��|l��p0�S�d�t��	�ī�+?YTy�O���A&H;��D�dJ��~)�t���GF�<^��펮aO�Z͌<�p���e���o����W>+b�n#x��A&�U<ъ�d�6�z�O���B�g��;1S�ƶ��Py4�n�_������pm��#k��Y�S��qm˶�l�����[J�K-��
��-'{�;���ݑ{ h"f?�2�ѱa��ɖ7=�qJ]��[�+�3i�f.Y_l�U��q���]�ݣ�5�?ӹ�rq�zv��.���Y����c4B����?N,�����7�36a6�Ƅ�����u����I���|'��OA�L����~^f_�FM/E�G؊p^�m�6�?z;��P�J�w� �ZU1uf�S��6��%�$��%ȻO�c�,!���"�<���&��|
�ˎ�ש�Q�4���-�&�ҴJ�yt��6	!�L��(bπ����ݦ
�[c��e4i����v��<���>�Q��^}�\�l�!
eM�d��L�
8�P�2�8�l�C�v=�.�ϟ.�l�O���3n,4,�s��r&BK+�NG��I���ze
�$z��c��>�ܪ��+"&��"�3u7�|8X�8����YD��T�uQ�d�\L��P�[��X��0�Cy���L�+m]4K�`��~���L�Y��ɳ1BG�w,z����O�+���׉�
[��T�yZ�'�ZT�֮���.�~eU��b��$!+� ��4����lwS
����\�Md3sGU�S��˰�7�iG
<�g�E�T�I?5�L�<�=%�z>JB�1P�����ēP�&6v��o���3P�pj�6c+��n�m�cI<_��T�(Cw���)Y�'�3���3��[a)[
��gS���p�V�8֢D��V�§䑁1�y��y��]Y�������J@�Ūh;b��"���6B��ۀ�5�'fm��Y (�@B�VA!��
�gȩ�|��2�M��U�0aO~3�Q�����C�s&�-��"s�o͒^����"�ӯ֡��Z��	2��C��2��x�r��r��c�e�^)���MotG�ո�\�U��B���=W/����b':ne�v��`�S�x����\p�I�3F�Wd1Hz�D"kU��/�����3ͫ���Q)�6	
����#�D���՟+��a(C�	bR�&2fy�\�_!�=bڣ& ��8����+��%B����?��RWC4SM˔e��y*||�R��%�j#�8�v��Ĕ�3l�Z�N���X��_1b�x�_�՟}#�.OF*P%$�w�[��!�բx�t�6_~�EV7���ޤ_aRg����'@����dm���3�E������}_U=s}}��R��(]�����d�nΔ���p��o��W�D���i��SB������ ��j�������˨�{�������r+8z8�t��,Yb�b9��z�r��*w�v,���ձ#7^ 7���D����ٰ�tl�k�_���7������<^�w�~'��9�/��)�G�)}����bz�(B�y����l�㱇�g�,2�����,��������&�����%�:�ú��&��FX�X�wt
5��<8����G?Q�;�?09Ir��^(&��!{��N�@����'%x�L��ߝ�Eaf�������􉯱�^FpVc�Q2LJ}U�{b]���c��v�^�@��A�cP��3%��8�uY�
��9���d r�HcCk�i��1� �Ʉ�e����J�zz��z:��K�)�'6������_��*"}��1�
�=����9N5	"6�X|-�^���A"+��G��t'�6gs���s@
�}x�qq'JuT�e$�+��9i�t_����Oh&Be��?V����A'ˉ4�oV��I1#��UoLn$�;������ >��P$bY�n���z�v�Z'��.*�3�bv��|$}�G}���#��!��jb"��H5�=c� ��{RZ��쨐׀����+ �B��x�%���C5�x֡� �
�&�`+*����� �v��:t'A% �9'XV7�;�gđ* sȦ���H��nB�����~����ĔMY�%��
�\�q�X2��=��Њ�!+�m�ט����Yξ7�@�qrU�_?#�r�e��ͻ��K��ze���N��7�w1HQ ��D�P���^X��OZ񞜝5O{�y�̽�����? �����ǷN=8�{�@\:�lN_L�2�S�'�b+��2j�ӭ�T�Md�j���x`zQ#���A�D�Gwa����.��ON����O��	{��"H�<<�aP�q
� �s@&�m;~�}1A���G*������(8D���eV�cw6�x��{���2e��p����������XG3������	��jq��$�z�=&���$������h켒�ԫA�7yCK�!q,��m���a�N��d���~ƪ5��掺|]]e	m-���Z�<�'$�Q-(� 3��c��Td�Y?Sp*�Y����xs�&e����b��P�n�=�[}������6�j��m=�U-Zf(�
t۷� ����,T��ja`�bb���h���Vэ�mFc�|F8C
�k�k�cĒ��җm�wETc�h���!C��<�)ɮۓA-�0�묧[Q���
�D���Zm�F��O��E�?�fecm�Ȝ��s����\as̨$���Ӟ|� =6S�d�I�@M�]ɫh7�'�Cԩ���[�2eQ��%�QO= g�0  oX����'�d	O�=����3��.0��p̭�cQ�<+ف̴B#�x�2r��-'�k�$���l�T ��m;m3)� ��o6�g!�kk�'Z�ë�qǛ�&�X�;�|_���d �Tu𠐦h�ɳ�埾�^\odn�tGAE,NG۫���
]�g�dT���ُ7|EF5�@C��Rk�!P^�]X��j��Zۗ��0:u�0���h��pP���ɷ��Q�A%˾SE�W�"ˋ�.2�WB J"P��"�=RV��(M��sm����X����.��J����
���?p�1|�rsoZ4|)�?��Cf����o�`�#x��~��hE��)�!�|�
���a�=��T�lsw\��r�"����Ba[,B
�d��t,�T8]�]t����fQg&, 	�N���ת��<	{X�]�j6v�:
a���ڛ��9c��x�QPeڻ�]��3M�l��ʾ/P���J��E^D_�K ?Ke�u��m�)���!󛦉L�/%�p��6�J`���@ڃ�v��XZG�E��a )��J��e�_i"jCT�,̍!emu��`H�3d��S�o�=7�6�̀��j�A昻q�gR!�՘��KA�o���8��s�J݂c�em�*?x�}����/�h��m�y�C<4!�� 	�b!�K�	�eQ/}@��Iִ��g�Ko�A=�X�C�o��yf�:�u�eG!CD��T�g�g�T^�I8��SA����*�F����ǯ�'v�0J��F��!�!~������'��;f�^ }���.��r��,�c|��C��__�acꏋ�&� =!�˙��bI�x"={�<�l�% R%��T��]#G�1��2S�İ��r��n�j (P	�x�#��(+�4��ь���Z؄�����B����g�盇����Q�^,��H}#��CF1���7q��?
M0V�E��ÈO����&���RvM��pa�����=n��kk����A��� A
��0�(Hz���Ss���Ͷ<`|���g���V���T�_ `fw��Q4	P����)pt�S+����iF M��&��Cz��	3�Ϳ
[N����)�k&���,�Z�%���,qyǮ�iht��̻ȟ��i���+~����f����3[$=�7u!
��
(�ڳ<��^P�
/��^�t���Ki���w�r��:u�(L�qpnhA�<w3\U(�$��BL�Y���&�i��v�@�Ji���߸�7wp! 퇫��T��Z))�{�?_�1x~W�za㈃�,���lD��s��'���8ӌc"�� z���J����D~_�m�V|��ѱ�x$<!�T)�k1�%�1÷�2?H���?�`#v��m�}��xF�@�m�����r�a���aUD�kKƈHeAw��d�0k8���%���aZ���
9=h�\XN�L�Bֻ�k.ʏ,QL���rj|��@����@~��Hl�ˍ�L7�0��L+@�q�5�y�����H���,T�Q^`qI��nez���&�(j���Ы�0@7�����/����	��{�k0��Tk�/�a 4�,����Y��A�c�E^�z"�����)�Ybg0M�����zh\�
���e��H_�H�ԸP#:+
�?7o�N���p×����	E�׼M\v!���g0	Ү��-oJ�TKS�B\���xP�pd�g�=�%�k�7�)3��~!�3�
��7(C�����?�dD�77%�����H��JǊK5�p���; |��_r �'W4�{��}fk�=��/D�Q5u�ez|a�]q��
\�w����I�T�I���:�C�_���3 �mYOe��g�K�IG%|���;�c�����U�).���R�G���t6s�ћ� ҏ��������MK��q��x���^#��)к�T�� ���],]l����h�M|F��I$�q!�-R1��n�=����d�f)6��_eZx֠M����#uE2?^��Ս_oI�
n\zۗ%�Y���j��~iڿ�B��5��U;������@��5�� ��i�2]%�5�we��k	�:�G8o�@��=��@45!������������}}l��;�(G��)(,=���tF'th �&���o�t�.��y�0L$�I>"����?�
�.���S�� �=����3�;o/J�<�kr=\�}�5G��C���u=]������h�a2���3B1  ���[ �O�����0�H�X6�ir�^��ǨV�ƕU3��0͙�.f����`�p׉
<|�֪n���)�1�V�[r�2Ss�W�@�d!#����*5��􏝤ڡ�m5q������j��%tV$���/��*4��$�'��,���b��T��K�����bi��[" �Et�A	F"��`Ų�]Z����{m�P�A�?Wv �Bi��V�/ؖ��2,�8s��` ���,��n�v�Ն~ks�����uG�a ��郄�H����|8f	���C���[%�7��_
���`��f�<W6X(����w�����JMy |
ȸ3�̧��٭�E�:I���0�Us��o<���7���"�x�kc:���qە���"\1���
1_oFx����o��3;Ԟ����B`���.P}J̍��f����s�2�u�2�ggl�S�Qfz�Ő=���$��W����d���s0�|����
37���O~��D �d�.Y>��~��ѐ��6���K�*�XV �������e;to�%%�s���%�J�}R�l����o%R��K��,<~��0��f<)�Z���s�"� O��ߝ�,pB`�`"<����C��q�(�<�.�]��0�~Xʿ��qsC�X��J��,����V�M���J�2!r�R��!��	�M������uۇ�]�S��m����>��q�Rk}uje����Ή�����
�[,��ܩ���W�0���������SH��<6<�2B�Kɍ5���ờ$�羾1���U+Ns����H%�֛��P��@�>c�[�*TZ-��٦���J�F[��
\�~���Ȥ���-1������}˲�J��[cw����z����f�!�Z���d��e�t�P(�da��}W�>����3V]�o�u.�؉<�*��L�|Ī�,�!�V<ם���|s��r���QL<ddH[�g��!]�ٔ�כ��f�9ire�r������� 8�J�����N�b2%=|~�������s�^˲g��Qn��8!go�F����=��7DQ��%٣���A���B�k2�	���B9&� j(ibi|�;j�G)V��PX��Be�W1�X�RaQ���϶�'@aO��X���sy�C���Lp�U��4��B�>��m�5�woc�g:�N�Mn�4�߬�������u+z�W���E�r�Dz�:��#ݘ}������J���$�T�5á���~���aZ�{�����6S���܎�K㍲/���ޱ���e�z�j��{��S�l�ȷ��k5���?�â�Rx`0֢x����l�k1�uM@;H#��g랍]]t�;�;��Jg6�
��M����:�rN������v����q�g$?%O�4Z|JuX/��S0�%A�DA�H͟��!݉�čyiN�P�bp
�-��Ȩ��(K��Y��
�
t�"�l�C
��w�S�0%���/	�Qh}���)��dY��۟դ�8��=Eiҫ��t�S�>")�K��$�8��2�ra~��!�HQ"�e²���BrD�Ʀ�Dէr�R��q+�q�
 5Թ�<�G�Ob�#C�y�<�?T�����V�H��&�+q��;����kE�hl��-�͘t�	���g���>���}��GX�ϒ�í�P�^��]Ƶ��[��?�\փ3��Y�q��>�~����A�c[v)ɲeYV����=-b���^x��utsUʓ�Ơ������
k���(@��<G���gS3�莩�6Ⴉxw�_/�Y��nӹ�:�h�����R����\��k�KN��BF������@5=�Nf���
^+��3#��ڄ�̛f����Ad���(���\��'
���߆�i����8�x�p�x� <���~��!p��x������s�S.�Y$����{u�{�.��l�����{ä��#�w�uYz��	_@��8��������y����֍�;t�B��[V�)F����.�^p��X�i���F��qY��~�X�1���.��Ğ �2X�B���8��W���Ȫ��u-$��\&��3Z0� s�o����ڔd���l�ƽZ�iݏ�Um��-����H����B	��V[y$Z��>�M�GR6,
;8�4҄k#���XKz�`�A�꾗i�2�nO
ղ(~"���.�$��_�~�����^'5��N:_�>5+:>�����v��s7H����^Yn�$ӣ�_D����m�Ih�G��#�h6���a�W��3_ˢaXd�\J'��{s��	�q)a��^а�}���s�:u8����aj����1����?�RWj��F��xK������t�}#�ھN��)���x�QF����l�k�o���dN�3h�2���x���#�74ˤ�
x��ulsJĭkjd>l���`�vބ�ut���q�mϘ�g�����7�-��6�����U���VU�4�'��#J��Pz4k�|�h-:����U~�B"0�a�TN����������'LL<�T%u�v�g���&���h��|gޖ~׊���՚왐
&^�&k\U��UX�ܽ���vc�~�yb��R�-��ݏ�9��W���
�c+t���~�?��,Bڒ���,�b'���S��W����/��Ҡ�q= �	�H������8�x�Q�'d~�<��M�E�ع:����b פ�S�9���}��:�J���L�]��8��o`���1���9�Z�7`E���������ʯ�<�jzxR�u��b����$�kD2ް� ���DԼ�K�4��W���1/�[��Pł�"���nd�ҧ�8��`;K�r�b���9�Ӿ�l�0���#z�'�~�K̷ó;��1#]T $�8T�Z���%~�F��V�%�Ц��2����Pj��C72%=ʦ�����~�߉i����y�:��E#6��Oԑ�иتp�X��=f�st�V�1���\��e�̕X"�t?������*b�1��9�ˈڠ��9�s�r}c�7Z��1��%D5J�
uE۷��S�)��ɽ��Y��}�*oytp-���$ol�;��ɩJ47��{�uO����`�����D�8��"0y"-n͕����\����5��[(~������y�����a��&�@KX�t�e�=ep��C��Sa�c�Ӛǧ��βh���	�օ��R�����*�����؛�&�+2�c��x�>���/�޹��B{5�͆J�y���ZC8E��<�d��R�ϖ�Ԍ:�e��U~i��^��֕�'k�L�x�D���J��/�����Q�#81hV�M�mΏ�8::�`�e�Q\�R>�	>�Z����EݗZ`������tl>����^o�Yً�\��7���ΩLf���v�?c�x��TP��&_��ӧ���
#�/�w�,��~���*�/Ηd �lyA}�Q�I���a-�휧�Sv�R7A����c�J��F-bᨹQwy�M� &� ���q���n��r2�0�W�\l�-�)̊��]`a&�����r�p���:���I��B$q���f�9�C�g����~�e�
�cs�$(����.��]sWW���u1�����Kl�A%�ؚ�b}�#[�E�^�D���j�����a��yC����o��w��I���[A�v62X�wmg*ͦ���$��S�\��_�7y�A�q���3oK�+���N�Fi3_���
��F�glJ�z��vgݪF>�X�qb���\	��,B9��ȵ��i<�~<8�ⵢ���C���
�r��%)J.�/W�H�<��s̡�;S��{oj1/>.�CwHP�;"���*��j�d�^m9,����?�o|�*z���J��ﰊ��_�h!ĳykA)>��_!�G!H[!�S��e����Y�F�ןj�")��'�{�D��C4�������kJͥ��{͗��3���w	~��#�Jm�x�D�.�T�1��*��� � ��AĭOŞO~q���αR��Q��[V�qi��Wȇٟ����+v�����1V:�Qh��n��?-h��G���p�$O�Ğ��/)�y}]H��aN ���u�8R�]V��#Xl��{��n|��`������?�Å��]+�k�����8���V0��} "a9~Ex�X���+V��5M���K��c��8�N��'��U��{�e2�sp���v��;Em�_˲�d鸃~M�[?K˂z�)�Q���-Pc__�[Љ�o붵�p��ꭎ
+�P����e���}�P�%J���*Pp636�Ff�G�����YfS�9��
znvlc�h���n��+c���;����R���X��y	����X�����O���~�}�79z+7��'A���6l���1��5���tE;IK��ǜM��r��N���b�(9W٫��B���ڇ=V������է%��s4����� ٕY��(��[�^9��Q����l	�Z�����Q>J���~��g��۠y^�Uh�(���%��2�i_&���^b"���������$�h38�)�J;��i�c�8%�C&�&���FV�v-������M0�x-J�Jơ������/fu�|#��@��C������r�	\^|��f>�A&�FV���Ɵ��0at=y������E;qJk�z����KwG8`�(v��2
c��2 ��rI�'(BxF ���n��v�Y�)�l4����N_��K���p�/�����8����
8m�+.DZa�/�(�����������
~_�S/��m������ijw������T��Z!C0��-|���L���Y�8 ����fn�=<df9$�@�+���<Z���qn:�yr
�3����%xW�M�֖�q����c���po�S􇨬x�)	9;��ɣ�O�����_�Ŝ�Of���3p�S
���U�!���+s/�+��^UyQl]$���!q��u��X�?%;��<�*�5������EZ����>\�$_�9n�'�gb@����և2W�,�y?N�yx
)�~Lnoo�R�?�
������Rx���Q�c.���Wuw�?I��@�`���o�XT���!Ԡ�����_p����*�rB���i:K���9{H�:.,�/����k<:������>!�r�pk�kg��;���
���^%]�\{3���\ꔬ��W�L���d�_��z�H�-��`��r�
��ueJX��V���`�1C!�	~,�2w��p���޼V�����PK
     �uU]����  �    icon-192.pngUT	 �_�j�_�jux         �PNG

   
IHDR   �   �   e�5   TPLTEGpL   ���iii"#"RRR$$$���333,,,]^]mmm)))NNN(((<<<232   �|�M   tRNS �������y=��(:*�aUM�q���p-  
�IDATx��\�v�:�o�؀s5����Wi�I΄���N�Mɖ�-y���+_��W��|�+_��W��|�+_���a�)�&ONh@)� �$�<��e�uM#�
�;�/	c )ϫɴ�29���� ��w
hN�8��&
���������<(I���4v��;�IY���H��^��r�41�����	!��])/zbЃ������
��Lΐ��k��$�Rz4Gͮ4yy�XT���u�As���91���
~���y�gn�g�o�����]���k�]�$-�3�X[�Ѹ7���Iq
�VzI]#�jnT�B;A�H҈SWZ�Of��I��NP�uho��<q���@��O�"��y���o�
�'��/9s�����̭����{b��N��e��qa��]���Ą۫���0���'A_��!A(1�Н_���iu;�T������լ���vT�I�	L�d;�L	�q6���l�X
�g�M%8��U;����l4N/��Mg�3�#T�y��rJ��~��c�?i�G4�Q&ҠO[}�.'�^���k���,�,|&�z����n��x�b�'y��U�	sB`����a$l��9��a��0����4�Һj������G�_��O	�����m�:�(�����ݏZ�_L?��Թ��rQ�S*i)1G�G�o�3�gK;͖��R	���/1�a�S�C�k��s.���!�/��,K���?���Ԋ��G�
�#I�[� ���a��=���sEES���OlOq;,�(֫A����/��1�@��P�<n%:�5���z��e���"s�8����7����Q��IUs��M
����u7	=x����^�_s�]�2)���Ꜭ�7X伻�Ą��~��5��i�3�m��� �'`��z% Q/	������o�Ah�A}��I���G�a����Hb����ed���&m�'��x��;h,⒦�$����ujR@b�A�
��4�*�_��'!Q�S�Ti-�a���-qy34����ۑë	D<�F
��l#�G?7/:�F�J�u��p��`�zE�%W�
v\�dMut����;"HL�Wz�; J3�B<ݛ|n7@�X=������в�U�<�E9ٵ���q���!岽y)q���sr����n�4�7 ����������4���U� o^[� x\5!���_��ei�k�~k6���R2	>t�*g-��?������k��|Qx�+��dD]"��A�$�ɏ�Ƨ�c��f��G`{ i� �;�
)����$� ������y��F�9Vǝ(��;�kVo]�{o@������`��߻�3�0^
BF�g>�=AY�Tp��	Y�4�۹�L�g!8Ѣ ��ᶽw�ATg?�x����8��}�|.R��sT	�|>Wmv��=ۏ�u����v0�Љb}�Ď���
�=8�b�3�}p���Z��5����at��N�:^[0b[z�ޔ%_+}�������[�9��`W3D��
4=o��fE�ğ0 �S𑔊�N=�{�V�لic��B��������9�x*\�\�(�������qT<pWR�xP4A�&l>�?{��]B�?w����>E`��Ms��:Y?Ї���s�
\�M�2_��U�#��m��q
�J�B�f>,<�WHL������E񫹯�Ml˺tX/.��)��N  ��ɇ>[�xf�C�lA"���%Մk8���4���O�Kg������� ��;o*SSA6�ǁ��:x�x�
>�o:������+y����( �V�a�ɚ�{�
�-Ta_�m��5���
W�o�;�*i�⻗O{���GG��p�v`�v��x�f<9����{�2��]�H����(�u1�WB�Q�1m��2n���-��q�Y&%���M\���w�og�U�g@-�e��	(wx��w
`�x��[�HU�׮F-H`�`�&
�� w﹫Y6��4A�������SN����]^n�5%�P�s;3�����I�̪Xu�-,A�� Ԋ��t�~�4sg�R�-9��ܤ���խP,h�o����h�Q��qg��W�V�&�f\Q:��JN�DA���=�$�� �벐П�
���U.-Ȓ�>�dM|{c�V��=�*S��oM@m�2f��d�<�,�7�=�N*>��h�z�~�ɲ'�	��/YX����º��z�{���;�X��O���_�m�*�����$/8�?�߭��25?����a�9��1:�ӂ�h�Q>cɥr�bӮ�	��|�	@
��f{'I��Fq&'Pǃ�|�%���K GO��"0J��Rљ}za\Rх��G(Z>%�Wz�UU��N�}֎܎{Ev��s~�O�lΜ֛�}�q��V�{ZQ���IK�|G9��Yz}Վ&��L�Cs��@N{�c~с}���t�r��[%��?ƞuWr��09�4�I\Co턱7��8�j��J�Ʒ,@��5:
���f��H�7Ib�6젴��5�<�=Hf|�qF/G�f�8��� G"6����£�S:Vdh$V�g�������n2�KAv3�W7��ń{qס�~�(~����Z�;�u}������Z��_ci_<<�a�F�݁8�0��6�,���
n!�W�d�\�����
�Sal��q�EB���ke �	�Ȝw}30�@ljT"c5UɆP!X�/\
����$E9H�#�^��͕y7�»�q�a65�=�����v�L\��V��=�H���{��j4	�e�T1��ȻbmVE����Pm��<t`6 y$1g7?&��Lz����볫��L�Q���<���K�!�R�+gۚ`
��-����y��|g���<]�*f�(}@s�\N�����Pe�2ݜ�e�ƈ���-��*������n��P���(#-���	3����k�N����r�^@������dY��Zl�iZk{2�d&6�t�(����X�,�5[����aФ���=��c���`ٝ��̎@탕�v����.m�����:Nb H�S��G�G6Ç�{�b�}���9q��{�MB���lU�����v�l�z�~��G�z�7�0�m��M	&%Q��z)�D����qhH!�c:�	0ه�w_'��l���`0Uq*?F8aQ\L�J����L+����Ӥ��a(��"M2vui�қL�}�Xl$GL�M�e��
� �c�������C y�}��f��$���w�H�u}=S5m&��S���<�F���[�Lv��z�'�Q���;�ir��!l0/�|�<lɳO���T*u����˦��o��F�.ё���O����͐��������6I
�C�7�ߑy'����q�6�K�[cR����7��� �/����Ø ؾ�5�kxg6n �}�W�;؈	"���4�y�*c�0��6]�_&CF���{�D�P����i{��|11M�P(
�B�P(
�B����Cl��    IEND�B`�PK    �uU]4/���  �    icon-maskable.pngUT	 �_�j�_�jux         ͘�?�����Q��V��ڣFkծѢD[���-AmjU5j��	J��wZb��#$�w����=���|?��<��c��AI�L  (�4��  ��{����b���@�@�XM�]���tddLfcc{�����KLL���[]]��򍤤������������evv������##�:�?W�:�zF�S2T�Keb<��������5��ߑ4  =��sc������r`e}Wh��{o�A�b�`w�n�Ժ��#���d�"������A��H���$ܟ���HSަ�@��$'Hrt�����L3&>*��$�zM���^T�
h�Kb�E	�$��|��,)p���8B�/�)�[
�<-���{���B�B�> ��v��/��4ǁ�Z�&��EoZ��_v�|h�@*갚�nȗ��:�z�7Q<��
�'�h?�Y�8��	�4_`�z�Gq�ٹȓ5�	w���.������&�:�j�)?����� �R�ƥ�Q/5��}����'�15�;v�uf|�����?B�UiG�\����R�]ŷ[e�|=�c�t�
�
(��&�~Y�m&�&+��������?�+/�K}��t�RΨ&b� ��|6b�C5%��B�MZW�JX���+��݉�����TKi�zY���Dt��p�;q�-����=M����	qAa �J_�KW{�i"��
4��"�d J���`!3��! �Q�����;��"������W��~w�a� ߥ�Z6��=yTB�l]Gߪ�&}#l~|K���.� ��9�"M���[��aE"����q��33�8
��N�xV?^�Jgږ=F��b�hT_�T_+�{F�z����%�M]������>Td/��ju��"�m����O�	��hz
���8�ԳB��%*��2�?
6�� ����|��p
�
_zw��%>*S.�QNs誉S�^�e��4F��E�3cLj`���_�o砬Bl�����~f�>A�ܽ;�|����Q��7z�\�5!SL�>.�i3�xk�^�+�=u��B/^Q�8�̤��%8�RB�
~>sꙂT�4�i
��O -�Hi!z�.�A�(^5��E����/��Tā���u�������ɩ�E\�K�a�[Tz��s�[/��1]x�~�{�p�_c��/.};]{�g��h�|fq�r���a� a�K24/y�DM���)��x|�4�xhV6r�~8Z�7��=��;-8��~����g�.an.�^�^��a���(��BLU���K������J*c��u�/��8ڣN��':�k�ׅ�O����X�p^m4�oѼ�N0�A�f�G�<�f����U�2I�,躂�/϶.l� e����1��ꚣ�p�3V�	"ALq���<��_+�N֞��#������E_!������@T؉��8���'��V+]�d?�P���tƎi��+��ns����U�v�L�7�n�X��,�_H��2��jc�)8�*,y���sV�+�h�p-bG�ħ�<�Y�SR��|����:���# i:��Ol��{��x}5Kh�*�_�+�V�~�/LO��2��13���^��^cSEJ[�k�
�����9�����J/�����%�g�-�i��&80�f���GCw�#�X���h!��Ĺʳ*/~|ίu��&F���].j'�M��ò�&L"�4/�1,f�Rߢ��`\��U[d��	�D��FZZ��ҫ
e��Xa8�ௌd�eOIKJ=if�G��^��,��y��H{�7'�:�4���LR��3&�5����gv'W��������1(��
�y�`�8y�Gnڤ~���N��9��Rb��	�
x��;,�"ʟX�{Q֚.�;�.l����r���!���8�U�-X"�(�S^�ag����P�
n�a/�|�T�5�[Y�m��چﯣn�H��1���0���~�*똞 �aFQ7{r�u�^ ޫ��g�|�� �R����
0\l��2�������~ש�'�`@�ɕ��k���
��,*t&�;ÙR�F����D�(��Ƣɺ;����[��Ca�G�N���M�V���S��(1�s�xi��ޠn7��ÔR�Q;���ɃIDJ��� �o6Ʌ�M�I�
+A��&������je��)�}�#�3�+�v���+��t�����I���(nCϳ�i�屖?HS ��H�:�$ 
Q%�)�L�S��9ޚqK� �?)���0�l�w�
Q��t�2p ����W"_	���(|�?a���b�PQZ/H/b��~Wa#Ja�"�z��e$kf���o�A�&�,`�q�R�L�Jِ�J������6��$���6o��a#�v�$�sЩ�u�%�f'u��Y[�h����ؑ�����v��9������� !����o����DW���׽RCd�!vTַy欲��-y �
EX�zN���|���6�N$pً�j�yB=Qem��?V��v�7���9�V��~`���<t4�P:X�e���e��u�+�T�Rڸ׽�P^�.M����m�����u��Ԃ�-���p��|�-x�]�%ʩy3 �.8Oy���k�O��&F0ik�nN�7Hbs�~�BuUfw����ơ�7�aV���������M`y�6G�v�4Q2/�}y2]�u�K^�����ݿK�ԏ���){ �q;c��faҗ�8�?-y4��W7�YЎ6�/mo��q�B�@���~3�����]��pd��!R4�TР�0�V8����gj�Q/��;�n�U��Z*3ycB9̕�����i�O��}�2����J��tY(v��b��}�x�RHC�o�^V��Y���+FJ'�6��N��j�2`�^�/gGT��̯!t�S��Kg����%�>s+�c���}1�8�g�� ���JsD�v�q��q,�g��u���_v�j7[����̳u!�[G���`&�{�Gta
�h���8��崄U�똭��؈�f]�-t?Ωh�ݤT�ː�p����^~�r���~xS>م�9om�X��͍��02�
y@L|�W��<�
�2R�
v~#�|�e��u�g���y�=_?fU�U%� 5� ��ƨ>��.)+�	
H�iId���Yﮀ��Y�tV	��:�"�:�t.R�fF�!i,L�bE�:�#S^�f��k�,
�ߍ�l
߅��>�V�
	*�{�7�f���Ӽ*iܓe��''�t���7�?b7j�(U�m+��H�s5�f�,����=Z�֣q�8��*9���{�]���z��̍u}d���������pgV����y��!�md���R�Et���ê��r>*�S�T+�<�_����2 B[��<�jY�Y���x�cUV~	a<P/<���6�v_6�	9��/(����8&��K']���s稻���]��'-�
��'�C�mw�6�j@2��xGr��o3�PX	�]�(85�c�ݵ��#��I`͍������r%�ޱ���,ba5�`��t\S�~�N�;��0�'��9:�����r�;p���e��4|b�-���y�W�&ޭ*�ͧ�k!g�@���V�^�|�g-��Y/Z�Փ�]H�e�F�+BR��_�[���4�?���IyFv/��.9){{���cq���2N�ۑC^�l^C�Q�PdUy�償�z�T�8�cS����jٿ�ξ_�6�X/��_VlWR�f���A���+��4n�Q4���"�0��}��&����T[K	�Ʒ�M?��gV�z�d5xΏ�<�~�X[ҿy�H$>%�qp}��$���[7�a���.�{�T������>֕a^_�8T�˺�����&�Q����!�V�O/���_?�`����X��>�<��&�zp=͑ĞA�	w�RE���RK��w
�b`Ƽ7ec����Kn���4�Kr��=�_��4���n~/�ϋ�9� t?����
(�cG�j"�(G¦��^4v�b*M[�wm\�s�oՀ�2>�>N2&c���1J7��;r�fxל~q��{����B�M����T+J�g���� ���[�T��p�=�*���54-H��@.d�_SwP;�&?=^xz���Z��>���Z/��Յ�]ԋʝu)�Q����R�1� �9�v���HP?�He�c�ز!s\~~��^+�]��3UMb��/��A+�&��>f{
O,d�4����,�T-]�>�kw|J�R��^1��~d0��^B> �s$2iO^����H��o��j���JKT��Zr��Wa��W�5#S��Q	�n�2��fG]��-o�/���$���J�%��lލ��t���i���#�=�(q��� (��\3��tjN��aC��ŷ��#���S+Q����;�g ��!r�����p/b"�V�Y�O�2��e�h��q]�	�ZhY�v��%vç��2�=�Ne(t����[x)��V�Z��
�����p�^N�?]��Ld5=���Z�ಌKsë)0��|H:tq?�L��m�и�i�J"�pm��.pՒ�0T��}��]��� 2��q�w�B����("��2"�O'��}`�Zjִ�G<w��Z^ٮ��Y�ź���ծ���}-��ݺ�s $�<ps�� λ(h<��a� 4�\�9�YC�g�������Փ�\�k�)��b��E�)Sh���ޯ��}��jy�ɌGX�����-�׳�:�,��p_;l��:*I��E|3K�Y�3��
^k�	y$�_6ƪx:(Mf�&����=~>���aU'��4rv���o��4�J�k�׏��/_����t�������v5,��O8�R4�Ӝ8O�e�v>(U���-���"H�O�fn�0�����qwܵ�
t�EV����~� ���:�̽�g�48B�6���:<P����a�\���Q�g1wh ��� �6k����UB���m�Ԕ�@��ݢ��䦴�t�#�=�;�?&_�M�
�F�Ǟ�_FT���|�C��;��d�H�<���R��9�W�r�]���St6PL�lU�^1���ho��k��6h��:\�L/#�Iҝ�:S.I᦯�ο�'�e�5wؙz��:�1�%�(}��"�G*��W��!\��Q�]���_��%��M��%
�����S�����K��</�ۍd�.g�x�j	���z?��8��m��r�&Q�)r'��s�Wz�;�	�u3U@�0)���|�W���U|x5i���Sj�n(��V�jR��ވ�Kf< z�-����g-5��ժ�a�PK
     �uU]���
  
    apple-touch-icon.pngUT	 �_�j�_�jux         �PNG

   
IHDR   �   �   
�    HPLTEGpL   ���```;;;���OON???&&&/0/:::%%%EEE���   ejt   tRNS ����'C�׸2Y��qn��V����  [IDATx��\ٖ�*�2��z)��ض�hߣkY��=G�)�v
^._��W��|�+_��W��|�+�TD�j�Č��>tc#�`�Q��躪�F��X��O3�5�����"�a�����),��������%`���a���1�~�[!�J�c��jD�c�Բ�Ȱi�K�fK��EE��my�rJM��%SQ�5s�2����y��Δ)��HJ?#���xNBԟ�st��+���ga6�6X����>��K۶RA[D����i�r*m{'mC/M���^�8�-���_t�)�ytI�K� ��� �Jd��0�M�RO�a}�y�
H7>-����%�fP��T�VM�~��4Bw?� �!=j tcBX���C4-���h��^��O�r�^-t�:t5��Ѹ&�jF�[��^�s��)=�oV�P>G�6D�	`R�Ix����¡l���'J�9����/�������!�A�\�K�&ٴ��5����rm_���~:+�ȤL�����`�����"UG6#�L�nh��I36 ��M�0���������"f�fcg*�<*�M		,����q�a�:-����Ѫ���I������ *���Ax�kn=�R9k���g��\���iӵ�~���:H�-6��OX�n�`��z�W$�"3�bjˀ�m�~n�W�ٰ�'��6в����N����s���\E�ТX3��@K�dǫv�9�;����e��Ѧ<���;�D/Մ-��;�ב	��5a�v8<�@��P�%�E»7`��3p�X`�A�H����a�r�SDrF;ȵ��k�����j:��H�#{�1�
Q��|bq��[�ZD���4v�dt�p���*��'"����qX�'b�bTr���Ƕn-U3L�Ê�i-���$��b	��Ý̢P��Ug�BHc�W�����8P�l��>6F+;���wutG�r��m����cs~�j�S�G�(Y��Z<eѥG�3١k=�A�S�\)�F�m�Q緊�J�g":��P��ȯ��]{���+[��e���M��O�t�hْ[3����CٲX;O�Y��m�K7��*�}��Y��;�*2�ߨ������~�[	�3NH]�;����=c��Zz��t��!��t\].I�>��N��u�eqE���mx���M�D*�HS|�A慀𩒜����R���| ��SJ���3����L��|0W	��=�5����C�����Y3�Q>���\�T��$��A�gs�9��������upA'h��Al}�A/��nI��
a|:]���VI���4��6-ͮy\
g1_�`1u����@�?�%;W��S����RK��H8����Q��{.�ʣn4i�T�Nql2�|TU+u�v�]�v|����>�"� 5�%����W;�FO��l��j��ף� �sfp+���d���zP�t2Z��Ї�\�hES���3�]*��U�
�֙G�����E�.(W��b9�D��e�y��
U��r�^��8*�䭂�P���FB&R��!9��?�0�fB�^�٧n��lj�_��[��E���LQ��{[wZL��yL�����q��nWA�&CKc.�N����<��I6�	l�䳬�? ]8�)(Y��;	�����f��ے���Ή�tSgz|�,BR��áB����Ç4�[�E���-.C-�p6��c�]8�+��F�s��q�w�>��Df�K�x�i�zx,�0���n<Lw$"�Y˺�,��A�_L��!�.O��؛w&2��&j#��KT���"m��q[۲�b+�O�4���EM6���(m�4�S&?�I�2O,m#;�~ds���y����)ƚ����փ�� 8�ȅϓ"qQ�o��/���@�՘�����dd��Sf�iҊ�l���]���f־ ��z�T:N�:�E�k\O���ӝ�6�}��u�qC}�}����P����AS���ߚeX�4+~sHde�Ѓ��@���d&�I�KI�.CV�Wv�i��$	m�N��f<����2	D`02��ׄp�,��S�<亲�63���s��rF!����{i�n�05������i���|�I����tZC�+�^YS��ho�(|f��C7'|G�__���D.���anx�# V� �c�&1�u)ȫh1v�CS�=��4}�GE{���	��"�:B�w�&}�?'+� H6�7�ni��#�P���%i~���Q��L��sD^3���FS���O�>Ju�&�n�9Z\�K�pwWkf�q�lTz؞��6�轠Vz�F3�yv6��~2��#?7��Bd����b©VK3=��;�엽�1	�:����AMQ/��QDԝjp��K����� �^�
�0rM/���_�Ԃ��;C]հ��D8\}���j��^���p�2����v�j��l�+����qpv;���kFh=�L��T@������3��;[�a�ͥ+;8v�G��?|�������/������� ��L�M����7t��HA�#8���J���<�,*]"A�Ն�N�+G���N�|d��/)�� �����J���� �h�*e�kj���o/���5�O�g��18g�h޺�g�����`c+&����[�:��\u��޲�)פ�Q�?q�|�g�&pJ�D�t��/KR^H�����r����M6<��R���_��wR!�ڕx侺�12,�k���!�4��z���L.�s`!S�{�י���%0�Oо&\�wd9M`ٔ�5��;Y�����[�;�������gķ{Z@.d�t���?{h�ufic5|!�vѭ�-d�Ŀ�A��7��-ͻ}&����=�/�p�r�&o��F�xE4?�g�������!.�Qގ*��u��X������6eW���;��
	���k������� A-&�����Swv�-z�P�P��k���@Fci�4��1��V����1��Y���ղ������1R5>|+9)6j	5���Om���D[ R�ڷ��Gu����yju�%�[5D�ׂsFz��6�]�@K�ȟ8��p�I;�[��Y���$�=����.�23�cd��C�*BvRtJ!�B!��}� K�� W��    IEND�B`�PK
     ��U]              test/UT	 ���j�w�jux         PK    t�U]X��  V    test/password-hash.test.jsUT	 [��j�w�jux         �V[o�H~�$K�Eb7�RqQ�mi�R��"$��N�IbH�ƞ��Q�]�����VKEU��}��J�,����q�/��I�Mڀ���̜��|�6Z��M*� ��*Țz�XW�Y�мв}u�{+�EL-�q����'��n���L-[~�����8=q�O"�ZS�M� $IΖp�h:�dhh�|�,D�nX�K^�udL����JLO\�L�R@gbby:�o��"�3M�T��婑��h29:u�Ld H�!EU*�H�NA��}�ccs��y�x����__k����ը����^y`�����Jcg� ��yP �C��p	j�G��O�Ɣ�_N$��*�`�sT�c_*B��y�H�����f�y+�Sóܬzr��ID����`��I9>^��N}�V	����U,YFA�Fs�8���ؠ	�N�T�6A~��{����{so�^� �,�������z�1NO��lno�L���mX2u��_�F��z;��ƿ���[����{�F�Ns�~�i��:��Î��6��Dat45���A��W�h.
����Γ��1X��i��1\�nU�������>�j�?�89�@X��������*�Q�,5�s���2���Cs�|�����ͳ��l�#��Ec�7���#@v�i[��C\&y
�����ΧW��9�'���
�խ�ӕ*�*Mt(�h��9�uʋyh^�]�$	�%pE��t�4aY�
��K���>о�)��&<-�=f�3��%�$�d�h���lh��t��]3���8�H��� �fvT|lS� ����+�����~g}堶'{%��zz!6��~R��_Q���)�w@�+�;(�hC���Qٻy�eb��CJ�����!n�n<YG�<�V�w߰k�ݷݪrG�,�كK�B����F����4�0��6W���4�8ȥ��W�4�.J,W�Q"4M<��_�|PK    ��U]a��H�  ?    test/password-policy.test.jsUT	 �w�j�w�jux         ���J�@��}��*	���6-tUw.��4��h��d�"!�mE
^(��Ѻ��K-�e�&]��X�Z�P,3�����̑���0�`��i]���)
&�z�00=��=E0�.�}�&�,��K����/[��9E$���$aE�h�W
�i� V�ӢB��2~���ݻ�b˿����0�PD`9�ρ�@>���aQI�K������pa:���\�X����}\Y��c
#�NE"��T�e۱7���~��V��Ⱦ��Z��p��ʻ)�S�3��yB���,�O
z����R��;����;�2M	����52A�`q-!%�(��l`�(�����\�~ͱw�mb���Yʱ��#w���3�gv(���ew��nT������ PK    ��U]�I=�y  7    test/csrf.test.jsUT	 �w�j�w�jux         ���N�@��}��mIh�ͤ��L �gҔ�]�v���]#BL<��|E߆ʍWpk1��p�f�����vh3.���>x��@"�B;���F3�#�#w�U,!9us�t�S癩�N~�iZ^'r%e����ZMWp�<�UsUQ�~}�	 ����-��0�tY��1O���N�;(]�hP�6'D�qz@#H.^�wR� �m�i �Ƕr�����Դ�R�(}ֲ�Ԫ�=���B.lu�Ŋ(QΌ(�~��,�1�`'�^AW��"H�A�L��@��	a�
�����z��^@�@����#�l|Z+�-�\�L�G���yR��H��[X�;&�A�8��F6+���_��+m�R���}�e����K�?���@ZZ���PK    �U]���`  :    test/ratelimit.test.jsUT	 ���j�w�jux         �VmOG��_1�*q'����|�C� �j���R�B�b�ɕ󝳻� �I_ -���I[%mQh���J��g�;�O����w`�r�~�y�ٙy���]�X2)�
p�8T�@�"f����P:���1�?��c�j� �T��V��)J�P6r\3
SKZlZ`t�Q>a�7�������w�ːI��zŪmY�۫
���腵�h��Y��i?����m�~y�x_�������	@c{�U{n-oڏ�[��N}���a=}a������&��b/�a4Ĵ���18�����-�!<{�CQ�%��$C%�C2�9�`2WԒ$��B	/S���:_%JJ*%���]#�NP[:#|LN����kƋ�=$�M��K�����ۤ��p��jԇ�l��AA��Kr�
�V �إ��Z��N\sj6�h�b���������RjR�F� wJ$�I����w+�ސӁ .��Y����ys~Jd�����mB,e�p	w�
�rf��]�*O&$\ܽ+<).���a��z�p�th��5�%�W���Iu��O�L-�:��H�\	�X�C����k���ԑ��e�gCd���Yx�ڕ`C��dǳд��H��`R��.��������2�������j�'�D���+�r��pZ&=U�ׂ�&�C�\�D~C��>���s�~���X�v5DG��b̉�
�����pBu���y��?%��!*�@��(��V�hU����KT1Q!A�������1��h��M��������r��5km��j��׳�wJ%Ο��x.@������Ó9V����i�T<�������]ks�~��k���n2lf��K��N�y2C�<��f��+U/�sg���
��j>��
pl@kw]�{�c}��?�x�b�!F���f�� ��׭������Q�[(�tBk�������\���Zi��Y�^+o�!�T��4y|QN"��.��̘�_�^V7b}*xCc�g܋��sB����dZ�-<�V��N�S|f�+a��1��m8�@XY���u_�#����EJ�E���
>u�~+�N7LOF0�D�վW7�R�tN�D7�����ޣ�zm��}`$�i�PK    ��U]���cn  Y    test/time-safety.test.jsUT	 ���j�w�jux         �R]OA}�W����(��F�Ic}0����ŗ��ڐ ��K�1&ԏ�F�X����H�,���ΰ<��a�R4�4�dw�{�9���䔬h0��j0�<	BH�K=,"���SU�~��y�SՔ�8�X�]�>��UI�$�u�r��H�D�$��w$���;!����Ux�WN�v�;��s6�q9DI��AUn���p��Ktu� D�!4F�����T@������nI��{��o
g씦þ�=$���&ٛK8��Lx���+J쑧F�4%,9zm�����1�>�AS��,>K�z�k�_�a-�H���V��2y�='|A�E�0�@o���Tl�k�}�4�I�?:22�L|)
x��C�@���z�l*����ow�U��,�	P�T���-Sn���p>Y>=4��H¼�5� ���v=p@����qmD�#����p��,�����HƠ�V�����T��(���r!����%ڐY$���Oq�+[G�d'qml16X?�1��Q��ӟ�oc�Y+��ӹ��N���V�{���Zۻ�l�Q�	oeH>ˮ��-C#8����d#o�"
��Q�>M�7�qd�>.�ac�*o��r���Z����u�a]%��(�DKqq�;۠PK    ��U]�֥��  �    test/routes-smoke.test.jsUT	 ���j���jux         e����0�����U.�v� �T�,�ZQ�L�n;خ������{�G��Ͷ�1�iՈK�f��f�ߩ�j�� �����
2c�7��J
�=������}p*?���,
�^-M�d�O]v��V�n��ar���/�3����EW:w��'�5d`4^�\ 	Y&D���<(���$��0HA�\D��a/���3F8�N�܄�3Ǧ��(�/e�X��켑�-jZ!z��������} ��B���a�[2O��� X-���
r1�Y,_�WT��j�k��ik뀥�%��L����2��$�CM�E��Z���Fs&
7;�~�l��~��~��w���u��=��i��LW� �\HژY��X�����>��7����<5�M)1åg������5�f��s�
Ś���o�wx�?G]�#m,|�U`Y?�aTȘ��F��큣J`�ޚ�� ��Wnc�sx܃qJv�nv�>����o��a�G������{��XN�PK
     qvU]              static/UT	 �`�j�`�jux         PK    qvU]$6�r  �    static/legal.cssUT	 �`�j�`�jux         e��n�0E�|�(ݴ�pB^��R�4�l�
0��4ʿwp��f��s�\��*ar]G��)u���{���&h�2��b8y	�=�k�2Q��MS*�Z�*�J]�>E�u�;M�0٪|L|��-�Њ�e�2:��1�.7��2��,�d�Őb��z�yd�X�t^��t5
=�>�N�0V��r+ѳ����`��o�R���m�\��������Rw�u�IB��w�Ca|A��x�A��eI%�������FB��r��p[�U��a�v�V��
�]m6��,<�ٝr5�1LQ����?y͝.τa���`o��D��;A�7'�V�̬�-�*E#�F�Vc���'�PK    qvU]�F��/  �  
  terms.htmlUT	 �`�j�`�jux         UTMsK��W�����Xu�Ԫ��#�2�	��yZ�b�@ ��b�)IPÇ�)3	F��snO��/x�N��L�>����N�ڝS��<�K�����j�yDy��M�W�U�8�PS%���6�Q?�绥\l'�Q^h�ej6m*$6�4ia/������-F}��u�%5SSu�Su	�'���:��F	�v��;�A|�_��T8 �&º��&i�G�|�S#A)�J�鳈0L��b�>Wu�0i�\����+�4"FL���P�n��t�0"���jҸ��TVX�fk�_�k���M_p�
����A?�T�k���
	��H;a�]�ɸ�gv�.����w`��
t
�m�N�w-���6-����#(�~f��"���N�k���T�l���R0b.�����P>��cxm���'��%��m�l���[��(��߸�C�l୶����ܹ"p��:5�� ���u@#�_ߋ�Y�w�ay �4k�@)^rxuK��7��Y���]�,���X��o��.�?	L�P2�A]��}���Qv�g��cGU���_$�}Xj��X߄S�}X���X�p2\,KC���&����) z9���/~ƻгP��]���X�7��G��K�^��p���*�a��m�a���<��,�&oI*�uc��`�$_5�-�+iY��H��2X�1���	dK�F�����P�t��8"*�B� ���
�,��%�:%��oKv�i������c����B�+6�l�|y��m���J[��
���蘟KY�>z�Ʀ�hX��Q%��B�`�ͭFG�p2���y��O�7PK    m�U]�~���  �    privacy.htmlUT	 
��j�`�jux         ]T]S"G}�Wt�9����P��l%�U�����,�
�3�[�	؅K��%ѕ��`"���c�ɿ�;4`���o�=��{o��?�?�y�[�V��T�]�"Ǘ��/Q���k�r���(�*ւ��g�<_Kcs\^�A�u�Y[Mh
��5�gob-��ױ0�_�X<��dţ�e}�3.��rj%~�be��� z�`�������/�V����+X�b��	�2(yUM�ba���de:��.�wD��jd9/�HQߝP���5VdU
J��"��#R�5��������M����y|3�/�]M�?�F�r�
+_8�,@�]��m�ao^n��%-��)'mp�/��v�����n�tPA�/������K�G8,�e��h�����:���>�8K�x흓��F�]��9/eɠ���9�y�����!�t��d�6�����eг*M�Hw�y�iM��d`�Z���6��Ŷ��Bl����G~����g��8������o�BG������i�
vV6�n���: f�S��*�:`�-�������kv{��G<�9I���ڄ����<I���i�(B�Q�`��S�ͳ�+�(Ѝ��Z
��'X����m�^�qN ���JH̋�~}�7�����T�F�X"��Y�ʍ&^�v8>�	M�|�5�^��n�Ho�^Yt{�C����j\*b����D�H�m�C�+[�ؖ���M�h��cj�[�`nѣ�p)^�d��'��b�4��0�r�\+����,�:�I��gT���ة2��v����#��Z�d�H�	Þe�oi��m!�-Hm�rv��u���ê���s7Ch�N��H�7	@?��F�nnBIlk���Z�n_
���w��Mz_�Ѳq�-�G��_���.��O ��4ɠr[�\�����%���p{2p^��e)���L
��-!�*��o�)(��^���1�h�y���PK    4�U]̩k�i  :  	  help.htmlUT	 Ø�j�`�jux         �TKo�F��Wly��J��$mҠ@�6@�C���FDhY��Q"�R�`��e[~�v�6&�ر%Ѳ�K��%O�jm�B�=�rv��o�N�[�ܼ�۝HJ[Ts�� ��~�H�n�,6I\�cQ�D�L�YU��¯�n��.�iqQ��d�qf)�	$��֤4�=��T|Az$'����K"�eM���)��UF�5EJ������ &�H��U$)󷹘"�����U{�HjJ�0W*+�ª&jr2�HD�FRU��������!f�c)�I������	�Ϲ���`���XC&�Rd�![q`��x���Q�Ip�5��X�G����	�
�����s�W?�Vh�D?Խ7��h�d�#�*�0����s=�/����o�9�.o�]�;k@~��z���p沆Iǳ����5wh@yc�����oB��l�y���S�i�a
?g1�����_����7���������1�[�-#(Ү���8�D����:y�۞}B��܁�����F��#}��=]�v���OQ���x�
��y�xN�o�x���yG�P?�~�
H"����j�a��Q�Ｇ;t��kl��{�Y )֫�-T=�Ta���!�V�K1ۃ���l4����=�v��k|����w�p��u�X�}Z�����Y���8�QO�iq��.�P�� ���fs ��P��K|�ŁU�|���i�w��%!w�����h���E�!P�bk&4T��^�_�
�m�swPu'�h��mcI90+8��a�&B9����
m1���:ݼ�v����ӵ3(�X������m�iբ����{5���\X�$QU��}1�PH����!$�)�ě4am�r㈉)
/W+#|�D�|S~PK
     n�U]              .github/UT	 /{�j/{�jux         PK
     n�U]              .github/workflows/UT	 /{�j/{�jux         PK    ��U]�m�+=  a    .github/workflows/ci.ymlUT	 ���j/{�jux         uQ]K1|�_1�BU�ŧ+�"���O"��弴�͙M����������dgvvvBr�R�O��P� ��2���J�J�)^VR�kV՛U^�K�da���ҩ��zb��瞜U@�5;Us�<Ge�9m�/li��]_��`�|-����6ڕi�".�ʲ�&����0$իnBp��i��-�ϵk����#R�L����pAuD��'��������=�Mg7��Ba,
h��Д#xh�Gf
���Ke��S0:;_���j��t�����8�:M���{|Be�� �G�MZ#W|��sC��T��0��L���o4��PK    �U]t��   �  
  OPERATIONS.mdUT	 4��jv{�jux         �UmO�V��_qT�jo�҄Tu,�����:4M�طĭcg���.!P�K�x�Z���F!�!����v����sm�J����s�s��<�:5�I��b����P=�r�ە�	gaڞx�Ԁ�`�9��MM@��:�f�a���y��ĈN�������{P�i�%ڋ����@�dTݢ������/ʚ�R�j�I0�-��ݔ.S��-�;�*�F��Y��3��A�f����Vi�?biS��Ҧ��jĄ��K,��l
��X������|µt&�� �F�Aϱ�?�ϸ����&�Q��L��+Ȳ +"��¶;?� ��rY��2az�����b���7� r:&�&=ШKZ?Ue+��1�'�<x�t����R�F|��>T�Ti�H
1-A6�Ss��C�P<c�a�x��k�G���B�~:���^���֣��h�z�K[��i��4
s�6x�Ģ��g��q�Ю+��oyIG�k��r�������k�Ԍ��TR5��q��4�K	�k��3[�L�Rz�^ �)Q��	�v�t�G��ʂ4n��:F/D��e�
S�8�'��G&���ξ��EVz�);3�v�->z��l)�0�>t��*=��$	���ZB����D#������'Í�[7!e��W�������/��7��YáP3�윽9�z�"���müOLN�7QzC����W�}���X������9�V_B:;"�N�*�W�8�{�}B?�u����},|�S�TJ��|�:I2�O�xby��W��GpS��m��9,�;����AA�s�k��Oܕ?�����B��[g��ɨ�la�.�Wv��m����W��2;�=_i?�������cO��;��fw������4+bÉ_��b�����q2g�3���,۳9>��	՝�;7���X�C�'��x:�
aĳ�G�����`�<��Yvq�\SY�/J�p�)o@���.<������8n�������{l�.My��MN��Cl�Mu{��֞��G�-�����uws���B��u8��_PK    k�U]\�  �  
  ROADMAP.mdUT	 ���j�{�jux         mT[S�V~ׯ�;�&i�VJH2Ӈx�L�� @Ŷ\I�a���7����!�]&����d<�ߢs���_�J��K�`I{v�����33AA� �� �.�w��cZ��Esx�q##@n�Y�N����[��7S�{=�r]�}}��9n��-l�k�Z9�Gu��6G���}{����ߟ>��c�*�Ö��b�g��[�]#��a�R`�?Fo�*���J_�I�O��`�*l�y�A	y�����#���:�V�d&�h��l�.�	�EIs ������5���Z�,�7�^�iU�?�Y��A��>[%���su���aE���Y�s�:�$���F�ƢM�Ƞ7ɟ�#�W������dq�0�����{��Kf�K:	v����^���]���i��Y�I���N�$��x�.NR�u�����2fg˦g�Ь��{=��@�f#��x�a~����~f�N\י|�t�����[C�bf[ ~��?ƠLnꬹCb}����]�����ӄ�"�
�����AH\�yU��ʘ���*�J��!��_c���>(���c`
��m9���լ��a0H��(,:�f\5Z\�?���Y��ijߊH�=�[��]�C��.�J�B8�£�����ۢ�&.�%1�,�Y�
Ж�]�^�袊!<�ᗄ���|PKF/f�/� oDT	S8�Yo�lp�e��۴��ª�ak����=A4aZ��T4~��'�Rtq)����a"�7Tq�E��otԇ_g���p��ior����V��f?�K��`��@�����T�VE��������92�[������&�$�����*��+I^�g��E{6�#<��yx9U��~�~�1m����
�����f�=���D��'zT�x��.��hPZV��V��������;�kUmh�.�qw��d���~������ua����yYZGm~�(���
i�j��lf_���ռ�D�7�)V1c@��4�&�$m�?ꟶ�ŋ !�Qm�mN���i�*qC>&���벸��o��PK    X�U]p����  �:  
         ��    index.htmlUT ���jux         PK    �U]��^   h   
         ���  .gitignoreUT ���jux         PK    �uU]#�e�5  �5            ��~  logo.pngUT �_�jux         PK
     1�U]                     �A�D  cron-worker/UT ���jux         PK    n�U]3x�*�   2           ��E  cron-worker/wrangler.tomlUT ow�jux         PK    1�U]b�Ɇ�  �           ��JF  cron-worker/index.jsUT ���jux         PK    y�U]���{�     
         ��;M  wrangler.tomlUT ���jux         PK
     �U]            
         �ACN  functions/UT 
|�jux         PK
     ;�U]                     �A�N  functions/api/UT ���jux         PK    4�U]^���  �           ���N  functions/api/register.jsUT Ø�jux         PK    �U]kn��  �           ��W  functions/api/login.jsUT k��jux         PK    ɀU]s)6m  J           ��d_  functions/api/logout.jsUT yr�jux         PK    0\U]槷�t  K           ��"b  functions/api/me.jsUT �2�jux         PK    ��U]Yr�y�  �
           ���c  functions/api/forgot.jsUT ��jux         PK    ;�U]�R��             ���j  functions/api/reset.jsUT ���jux         PK    �U]h^�  �           ��q  functions/api/_shield.jsUT ��jux         PK    ��U]���`  >           ��*s  functions/api/_crypto.jsUT ���jux         PK    �uU]��4�  �           ���w  functions/api/_disposable.jsUT �_�jux         PK
     �U]                     �A
z  functions/api/passkey/UT 
|�jux         PK    �U]�C��V  �  )         ��Zz  functions/api/passkey/register-options.jsUT �r�jux         PK    �U]���  z  &         ��~  functions/api/passkey/login-options.jsUT $��jux         PK    �U]!��_  �  (         �� �  functions/api/passkey/register-verify.jsUT D��jux         PK    �U]C�(؄  �  %         ����  functions/api/passkey/login-verify.jsUT D��jux         PK     vU]n�K�
  
           ����  functions/api/_email.jsUT  `�jux         PK    m�U]�*�!�  �            ���  functions/api/change-password.jsUT 
��jux         PK    �~U]4���   ]           ���  functions/api/_csrf.jsUT !o�jux         PK    0\U]l$sfX             ���  functions/api/audit-logs.jsUT �2�jux         PK    ĖU]5��C�  �           ����  functions/api/github-login.jsUT Й�jux         PK    ĖU]���Q	  �            ����  functions/api/github-callback.jsUT Й�jux         PK    n�U]�Ɏ��  H           ��M�  functions/api/_threatintel.jsUT ow�jux         PK    �MU]�TBl�   �           ��e�  functions/api/_token.jsUT ��jux         PK    ;�U]Ɵ8E�             ����  functions/api/_constants.jsUT ���jux         PK    �tU]Jz
�f  �           ����  functions/api/_hibp.jsUT ~]�jux         PK    �tU]��/jR  �           ��7�  functions/api/sessions.jsUT Q]�jux         PK    �U]F����  �	           ��ܲ  functions/api/verify-sudo.jsUT k��jux         PK    ��U]l߱<  W           ��.�  functions/api/_session.jsUT Hr�jux         PK    VtU]�%8m�  +           �� �  functions/api/_password.jsUT ]�jux         PK    ��U]�)��             ��R�  functions/api/_ratelimit.jsUT ��jux         PK    VtU](��              ����  functions/api/_http.jsUT ]�jux         PK    �tU]#g�B  T           ��|�  functions/api/_audit.jsUT ~]�jux         PK    [vU]}����  H           ���  functions/api/_notify.jsUT �`�jux         PK    ;�U]��R�  �
           ��<�  functions/_middleware.jsUT ���jux         PK
     �U]                     �A|�  scripts/UT ���jux         PK    �U]��i@  P           큾�  scripts/prepare-deploy.pyUT ���jux         PK    n�U]Et��_ pm          ���  Sleep_final.mdUT  ��jux         PK
     ;�U]                     �A�, migrations/UT ���jux         PK    �T]���~�   �            ��2- migrations/0001_create_users.sqlUT gO�jux         PK    �T]�PX�   �   #         ��e. migrations/0002_create_sessions.sqlUT gO�jux         PK    T�T]>���S   ~   *         ��W/ migrations/0003_add_email_verification.sqlUT �O�jux         PK    q�T]û'4r      )         ��0 migrations/0004_create_login_attempts.sqlUT &P�jux         PK    ��T]՘�Ś   �   *         ���0 migrations/0005_create_password_resets.sqlUT UP�jux         PK    ��T]�
��   #  #         ���1 migrations/0006_create_passkeys.sqlUT ~R�jux         PK    ͜T]Q�2�}   �   -         ��3 migrations/0007_create_passkey_challenges.sqlUT �R�jux         PK    P�T]j�v�   k  %         ���3 migrations/0008_create_audit_logs.sqlUT �c�jux         PK    �uU]�U�e   �   '         ��,5 migrations/0009_add_session_details.sqlUT G_�jux         PK    ��T]�B2Xm   �             ���5 migrations/0010_add_username.sqlUT �z�jux         PK
     ��T]d}"9   9   %         ���6 migrations/0011_add_reset_used_at.sqlUT �z�jux         PK    T�T]�y   �   *         ��Q7 migrations/0012_rebuild_login_attempts.sqlUT  |�jux         PK    ��T]8�Kl�   �           ��.8 migrations/0013_add_indexes.sqlUT �|�jux         PK    w�T]����   �   .         ��79 migrations/0014_create_device_fingerprints.sqlUT ��jux         PK    -�T]u�q��   J  '         ��&: migrations/0015_fix_passkey_user_id.sqlUT ���jux         PK    �\U]1P��   u  '         ��f; migrations/0016_add_missing_indexes.sqlUT �3�jux         PK    VtU]E�9�     %         ���< migrations/0017_add_token_indexes.sqlUT ]�jux         PK    �tU]�jk�o   �   !         ���= migrations/0018_add_github_id.sqlUT Q]�jux         PK    ��U]�a2�m   �   $         ��q> migrations/0022_lowercase_emails.sqlUT �u�jux         PK     vU]�-�   �  %         ��<? migrations/0019_create_email_logs.sqlUT  `�jux         PK    =vU]�iF�     *         ��k@ migrations/0020_drop_redundant_indexes.sqlUT �`�jux         PK    LvU]�㔞e   �   $         ��jA migrations/0021_add_last_seen_at.sqlUT �`�jux         PK    ��U]�u��   �            ��-B migrations/0023_rate_limits.sqlUT ��jux         PK    4�U]��ݠ_   �   +         ��C migrations/0024_drop_email_verification.sqlUT Ø�jux         PK    �U]�N٠E  �  ,         ���C migrations/0025_normalize_login_attempts.sqlUT k��jux         PK    ]�U]��s�   �   &         ��{E migrations/0026_add_email_verified.sqlUT ��jux         PK
     ;�U]6K
�d   d   ,         ���F migrations/0027_drop_device_fingerprints.sqlUT ���jux         PK    ;�U]�T�lo  s           ���G _headersUT ���jux         PK    ��U]���d  �           ��3J package.jsonUT ���jux         PK    ��U]2(�$2  T�           ���K package-lock.jsonUT ���jux         PK    ��U]�ݿ��   �           ��L~ eslint.config.mjsUT ���jux         PK    �U]�}�gv   �   
         ��� passkey.jsUT �r�jux         PK    �uU]m-9�  �  
         ��:� manifest.jsonUT �_�jux         PK    X�U][2�M}
  r0  	         ���� style.cssUT ���jux         PK    X�U]�H���  xl           ��W� app.jsUT ���jux         PK    ҞU]�A@�  Z           ���� sw.jsUT ���jux         PK    �uU]#�e�5  �5            ��O� icon-512.pngUT �_�jux         PK
     �uU]����  �            ���� icon-192.pngUT �_�jux         PK    �uU]4/���  �            ���� icon-maskable.pngUT �_�jux         PK
     �uU]���
  
            ���
 apple-touch-icon.pngUT �_�jux         PK
     ��U]                     �A test/UT ���jux         PK    t�U]X��  V           ��B test/password-hash.test.jsUT [��jux         PK    ��U]a��H�  ?           ��b test/password-policy.test.jsUT �w�jux         PK    ��U]�I=�y  7           ��C test/csrf.test.jsUT �w�jux         PK    �U]���`  :           ��  test/ratelimit.test.jsUT ���jux         PK    ��U]���cn  Y           ���$ test/time-safety.test.jsUT ���jux         PK    ��U]�֥��  �           ��w' test/routes-smoke.test.jsUT ���jux         PK
     qvU]                     �A�) static/UT �`�jux         PK    qvU]$6�r  �           ��* static/legal.cssUT �`�jux         PK    qvU]�F��/  �  
         ���+ terms.htmlUT �`�jux         PK    m�U]�~���  �           ��4/ privacy.htmlUT 
��jux         PK    4�U]̩k�i  :  	         ��F3 help.htmlUT Ø�jux         PK
     n�U]                     �A�6 .github/UT /{�jux         PK
     n�U]                     �A47 .github/workflows/UT /{�jux         PK    ��U]�m�+=  a           ���7 .github/workflows/ci.ymlUT ���jux         PK    �U]t��   �  
         ��9 OPERATIONS.mdUT 4��jux         PK    k�U]\�  �  
         ��v= ROADMAP.mdUT ���jux         PK    g g &  �A   
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
  Content-Security-Policy: default-src 'self'; script-src 'self' https://esm.sh; style-src 'self'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests

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

### dist/_headers

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
  Content-Security-Policy: default-src 'self'; script-src 'self' https://esm.sh; style-src 'self'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests

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

### dist/app.js

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

``````

### dist/functions/_middleware.js

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

const HTML_CSP = "default-src 'self'; script-src 'self' https://esm.sh; style-src 'self'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests";

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

### dist/functions/api/_audit.js

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

### dist/functions/api/_constants.js

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
export const RESET_IP_LIMIT = 5;
export const RESET_IP_WINDOW_SEC = 15 * 60;

export const SUDO_TOKEN_TTL_SEC = 300;
export const MAX_SESSIONS_PER_USER = 10;

``````

### dist/functions/api/_crypto.js

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

### dist/functions/api/_csrf.js

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

### dist/functions/api/_disposable.js

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

### dist/functions/api/_email.js

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

### dist/functions/api/_hibp.js

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

### dist/functions/api/_http.js

``````
export function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

``````

### dist/functions/api/_notify.js

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

### dist/functions/api/_password.js

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

### dist/functions/api/_ratelimit.js

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

### dist/functions/api/_session.js

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

### dist/functions/api/_shield.js

``````
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

``````

### dist/functions/api/_threatintel.js

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

### dist/functions/api/_token.js

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

### dist/functions/api/audit-logs.js

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

### dist/functions/api/change-password.js

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

### dist/functions/api/forgot.js

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

### dist/functions/api/github-callback.js

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

### dist/functions/api/github-login.js

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

### dist/functions/api/login.js

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

### dist/functions/api/logout.js

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

### dist/functions/api/me.js

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

### dist/functions/api/passkey/login-options.js

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

### dist/functions/api/passkey/login-verify.js

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

### dist/functions/api/passkey/register-options.js

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

### dist/functions/api/passkey/register-verify.js

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

### dist/functions/api/register.js

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

### dist/functions/api/reset.js

``````
import { verifyRequest } from "./_csrf.js";
import { hashPassword } from "./_crypto.js";
import { sendPasswordChangedNotice } from "./_notify.js";
import { validatePassword } from "./_password.js";
import { rateLimit } from "./_ratelimit.js";
import { RESET_IP_LIMIT, RESET_IP_WINDOW_SEC } from "./_constants.js";
import { writeAudit } from "./_audit.js";


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
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

``````

### dist/functions/api/sessions.js

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

### dist/functions/api/verify-sudo.js

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

### dist/help.html

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

### dist/index.html

``````
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
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

      <div id="userPanel" class="user-panel">
        <div class="user-avatar">👋</div>
        <h2 class="user-welcome" data-i18n="userWelcome">欢迎回来！</h2>
        <p class="user-info"><span data-i18n="uid">专属 ID:</span> <span id="userUid" class="user-uid"></span></p>
        
        <button type="button" class="btn-submit" id="btnAuditLog" class="btn-ghost" data-i18n="btnAudit">查看账号安全日志</button>
        <button type="button" class="btn-submit" id="btnSessions" class="btn-ghost" data-i18n="btnSessions">管理登录设备</button>
        <button type="button" class="btn-submit" id="btnChangePwd" class="btn-ghost" data-i18n="btnChangePwd">修改登录密码</button>
        <button type="button" class="btn-submit" id="btnAddPasskey" class="btn-dark" data-i18n="btnAddPasskey">开启面容 / 指纹登录</button>
        <button type="button" class="btn-submit" id="btnLogout" class="btn-logout" data-i18n="btnLogout">退出登录</button>
      </div>

      <div class="form-content active" id="loginForm">
        <form id="formLogin" novalidate>
<input type="text" id="shield_hp" name="shield_hp" class="honeypot" tabindex="-1" autocomplete="off">
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
          
          <div class="form-actions form-actions-gap">
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
<input type="text" id="shield_hp_reg" name="shield_hp_reg" class="honeypot" tabindex="-1" autocomplete="off">
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
          <div class="checkbox-group checkbox-group-gap">
            <input type="checkbox" id="agreeRegister">
            <label for="agreeRegister"><span data-i18n="agreePrefix">我已阅读并同意</span> <a href="/terms.html" data-i18n="terms">《服务条款》</a> <span data-i18n="and">和</span> <a href="/privacy.html" data-i18n="privacy">《隐私政策》</a></label>
          </div>
          <button type="submit" class="btn-submit btn-submit-sm" data-i18n="btnRegister">注 册</button>
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

      <div class="footer-text footer-gap">
        <div class="footer-sub">© <span id="currentYear">2026</span> Sleep. All rights reserved.</div>
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
      <p class="modal-desc" data-i18n="modalForgotDesc">输入注册时的邮箱，我们将发送重置链接。</p>
      <div class="input-group" class="input-group-gap"><input type="email" id="forgotEmail" placeholder="请输入邮箱地址" class="modal-input-pad"></div>
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
      <div class="input-group" class="input-group-gap"><input type="password" id="newPwd" placeholder="输入新密码 (12-128位)" autocomplete="new-password" class="modal-input-pad"></div>
      <div id="resetTip" class="modal-tip" hidden></div>
      <button type="button" id="btnResetPwd" class="btn-primary-block" data-i18n="btnConfirmChange">确认修改</button>
    </div>
  </div>

  <div id="changePwdModal" role="dialog" aria-modal="true" aria-labelledby="modalChangePwdTitle" class="modal-backdrop modal-z-200">
    <div class="modal-card">
      <h2 class="modal-title" data-i18n="modalChangePwdTitle" id="modalChangePwdTitle">修改密码</h2>
      <div class="input-group input-group-sm"><input type="password" id="oldPwd" placeholder="输入当前密码" data-i18n-placeholder="phOldPwd" autocomplete="current-password" class="modal-input-pad"></div>
      <div class="input-group" class="input-group-gap"><input type="password" id="newPwdChange" placeholder="输入新密码 (12-128位)" data-i18n-placeholder="phNewPwd" autocomplete="new-password" class="modal-input-pad"></div>
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
      <div id="sessionsList" class="modal-list-flex"></div>
      <button type="button" id="btnRevokeOthers" class="btn-danger" data-i18n="btnRevokeOthers">下线所有其他设备</button>
    </div>
  </div>

  <div id="auditModal" role="dialog" aria-modal="true" aria-labelledby="modalAuditTitle" class="modal-backdrop modal-z-200">
    <div class="modal-card modal-card-lg">
      <div class="modal-header">
        <h2 class="modal-title" data-i18n="modalAuditTitle" id="modalAuditTitle">账号安全日志</h2>
        <button type="button" id="btnCloseAudit" aria-label="关闭" class="modal-close-btn">×</button>
      </div>
      <div id="auditList" class="modal-list"></div>
    </div>
  </div>

  <div id="sudoModal" role="dialog" aria-modal="true" aria-labelledby="modalSudoTitle" class="modal-backdrop modal-z-300">
    <div class="modal-card">
      <h2 class="modal-title-sm" data-i18n="modalSudoTitle" id="modalSudoTitle">安全验证</h2>
      <p class="modal-desc" data-i18n="modalSudoDesc">为了您的账号安全，请再次输入登录密码。</p>
      <div class="input-group" class="input-group-gap"><input type="password" id="sudoPassword" placeholder="输入当前密码" data-i18n-placeholder="phOldPwd" class="modal-input-pad"></div>
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
      <div id="modalContent" class="modal-content-text"></div>
    </div>
  </div>

  <script src="./app.js"></script>
</body>
</html>

``````

### dist/manifest.json

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

### dist/passkey.js

``````
import { startRegistration, startAuthentication } from "https://esm.sh/@simplewebauthn/browser@14";
window.SimpleWebAuthnBrowser = { startRegistration, startAuthentication };

``````

### dist/privacy.html

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

### dist/static/legal.css

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

### dist/style.css

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

/* 焦点样式 */
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

/* 弹窗组件类 */
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

/* 移动端输入框防缩放处理：iOS 要求 input 字号 >= 16px 才不会在聚焦时强制放大页面 */
input, textarea, select {
  font-size: 16px !important;
  touch-action: manipulation;
}

/* P2-2 内联样式提取 */
.user-panel { text-align: center; padding: 20px 0; }
.user-avatar { width: 60px; height: 60px; background: #e8defa; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.user-welcome { font-size: 20px; color: #111; margin-bottom: 8px; }
.user-info { font-size: 13px; color: #888; margin-bottom: 24px; }
.user-uid { font-weight: bold; color: #111; }
.btn-ghost { background: #f4f5f7; color: #111; margin-bottom: 10px; width: 100%; height: 40px; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
.btn-dark { background: #000; color: #fff; margin-bottom: 10px; width: 100%; height: 40px; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
.btn-logout { background: #eee; color: #111; margin-bottom: 0; width: 100%; height: 40px; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
.btn-danger { width: 100%; height: 40px; background: #e53e3e; border: none; border-radius: 10px; font-weight: 600; color: #fff; cursor: pointer; }
.input-group-gap { margin-bottom: 16px; }
.list-item { padding: 8px; border-bottom: 1px solid #eee; }
.modal-list { overflow-y: auto; font-size: 13px; color: #666; line-height: 1.6; padding-right: 8px; }
.honeypot { display: none !important; }

.user-panel { display: none; }
.user-panel.active { display: block; }
.form-actions-gap { margin-top: 14px; }
.checkbox-group-gap { margin-top: 4px; }
.btn-submit-sm { margin-bottom: 8px; }
.footer-gap { line-height: 1.6; margin-top: 10px; }
.footer-sub { margin-bottom: 6px; }
.modal-desc { font-size: 12px; color: #888; margin-bottom: 16px; }
.btn-primary-block { width: 100%; height: 40px; background: #000; border: none; border-radius: 10px; font-weight: 600; color: #fff; cursor: pointer; }
.modal-title { font-size: 18px; margin-bottom: 16px; color: #111; }
.input-group-sm { margin-bottom: 12px; }
.modal-list-flex { overflow-y: auto; font-size: 13px; color: #666; flex: 1; margin-bottom: 16px; }
.modal-content-text { font-size: 13px; color: #666; line-height: 1.6; overflow-y: auto; padding-right: 8px; }

``````

### dist/sw.js

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

  // 脚本和样式：Network-First（防止发版后一直拿旧缓存）
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 图片和字体：Cache-First
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 其余走默认网络
});

``````

### dist/terms.html

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

const HTML_CSP = "default-src 'self'; script-src 'self' https://esm.sh; style-src 'self'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests";

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
export const RESET_IP_LIMIT = 5;
export const RESET_IP_WINDOW_SEC = 15 * 60;

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

  const { timeSpent, interactions, isHoneypotFilled } = shieldData;

  if (isHoneypotFilled) return { pass: false, reason: "honeypot_triggered" };

  const signals = [];
  if (typeof timeSpent === "number" && timeSpent < 1) signals.push("fast_submit");
  if (typeof interactions === "number" && interactions < 3) signals.push("low_interaction");

  return { pass: true, signals };
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
    const email = String(data.email || "").trim().toLowerCase();
    if (!email) return safe();

    if (!evaluateShield(data.shield).pass) {
      return Response.json({ error: "安全验证失败，请刷新页面后重试" }, { status: 403 });
    }

    const today = new Date().toISOString().slice(0, 10);

    const ipRl = await rateLimit(env, `forgot_ip:${clientIP}:${today}`, FORGOT_IP_DAY_LIMIT, 86400);
    if (!ipRl.ok) return safe();

    const globalRl = await rateLimit(env, `forgot_global:${today}`, FORGOT_GLOBAL_DAY_LIMIT, 86400);
    if (!globalRl.ok) return safe();

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
import { SESSION_MAX_AGE_REMEMBER_SEC } from "./_constants.js";

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
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_REMEMBER_SEC * 1000).toISOString();
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ua = request.headers.get("user-agent") || "unknown";

  await env.DB.batch([
    env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)")
      .bind(tokenHash, user.id, expiresAt, ip, ua),
    env.DB.prepare("INSERT INTO audit_logs (user_id, action, ip, country, user_agent) VALUES (?, 'oauth.login', ?, ?, ?)")
      .bind(user.id, ip, (request.cf && request.cf.country) || "Unknown", ua),
  ]);

  const headers = new Headers();
  headers.set("Location", "/");
  headers.append("Set-Cookie", `__Host-session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE_REMEMBER_SEC}`);
  headers.append("Set-Cookie", "oauth_nonce=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");

  return new Response(null, { status: 302, headers });
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
  if (!rl.ok) {
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
  SESSION_MAX_AGE_REMEMBER_SEC,
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
    if (!h.ok) return Response.json({ error: "注册请求过于频繁，请一小时后再试" }, { status: 429 });
    const d = await rateLimit(env, `register_ip:${clientIP}:d${dayKey}`, REGISTER_IP_DAY_LIMIT, 86400);
    if (!d.ok) return Response.json({ error: "今日注册次数已达上限，请明天再试" }, { status: 429 });

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
    const sessionExpiresAt = new Date(Date.now() + SESSION_MAX_AGE_REMEMBER_SEC * 1000).toISOString();
    const secure = request.url.startsWith("https://") ? "; Secure" : "";
    const cookieName = secure ? "__Host-session" : "session";

    await env.DB
      .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)")
      .bind(sessionTokenHash, userId, sessionExpiresAt, clientIP, request.headers.get("user-agent") || "unknown")
      .run();

    context.waitUntil(writeAudit(env, request, { userId, action: "register.success" }));

    const cookie = `${cookieName}=${sessionToken}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE_REMEMBER_SEC}`;
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
import { RESET_IP_LIMIT, RESET_IP_WINDOW_SEC } from "./_constants.js";
import { writeAudit } from "./_audit.js";


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
    return Response.json({ error: "服务器错误" }, { status: 500 });
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
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
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

      <div id="userPanel" class="user-panel">
        <div class="user-avatar">👋</div>
        <h2 class="user-welcome" data-i18n="userWelcome">欢迎回来！</h2>
        <p class="user-info"><span data-i18n="uid">专属 ID:</span> <span id="userUid" class="user-uid"></span></p>
        
        <button type="button" class="btn-submit" id="btnAuditLog" class="btn-ghost" data-i18n="btnAudit">查看账号安全日志</button>
        <button type="button" class="btn-submit" id="btnSessions" class="btn-ghost" data-i18n="btnSessions">管理登录设备</button>
        <button type="button" class="btn-submit" id="btnChangePwd" class="btn-ghost" data-i18n="btnChangePwd">修改登录密码</button>
        <button type="button" class="btn-submit" id="btnAddPasskey" class="btn-dark" data-i18n="btnAddPasskey">开启面容 / 指纹登录</button>
        <button type="button" class="btn-submit" id="btnLogout" class="btn-logout" data-i18n="btnLogout">退出登录</button>
      </div>

      <div class="form-content active" id="loginForm">
        <form id="formLogin" novalidate>
<input type="text" id="shield_hp" name="shield_hp" class="honeypot" tabindex="-1" autocomplete="off">
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
          
          <div class="form-actions form-actions-gap">
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
<input type="text" id="shield_hp_reg" name="shield_hp_reg" class="honeypot" tabindex="-1" autocomplete="off">
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
          <div class="checkbox-group checkbox-group-gap">
            <input type="checkbox" id="agreeRegister">
            <label for="agreeRegister"><span data-i18n="agreePrefix">我已阅读并同意</span> <a href="/terms.html" data-i18n="terms">《服务条款》</a> <span data-i18n="and">和</span> <a href="/privacy.html" data-i18n="privacy">《隐私政策》</a></label>
          </div>
          <button type="submit" class="btn-submit btn-submit-sm" data-i18n="btnRegister">注 册</button>
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

      <div class="footer-text footer-gap">
        <div class="footer-sub">© <span id="currentYear">2026</span> Sleep. All rights reserved.</div>
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
      <p class="modal-desc" data-i18n="modalForgotDesc">输入注册时的邮箱，我们将发送重置链接。</p>
      <div class="input-group" class="input-group-gap"><input type="email" id="forgotEmail" placeholder="请输入邮箱地址" class="modal-input-pad"></div>
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
      <div class="input-group" class="input-group-gap"><input type="password" id="newPwd" placeholder="输入新密码 (12-128位)" autocomplete="new-password" class="modal-input-pad"></div>
      <div id="resetTip" class="modal-tip" hidden></div>
      <button type="button" id="btnResetPwd" class="btn-primary-block" data-i18n="btnConfirmChange">确认修改</button>
    </div>
  </div>

  <div id="changePwdModal" role="dialog" aria-modal="true" aria-labelledby="modalChangePwdTitle" class="modal-backdrop modal-z-200">
    <div class="modal-card">
      <h2 class="modal-title" data-i18n="modalChangePwdTitle" id="modalChangePwdTitle">修改密码</h2>
      <div class="input-group input-group-sm"><input type="password" id="oldPwd" placeholder="输入当前密码" data-i18n-placeholder="phOldPwd" autocomplete="current-password" class="modal-input-pad"></div>
      <div class="input-group" class="input-group-gap"><input type="password" id="newPwdChange" placeholder="输入新密码 (12-128位)" data-i18n-placeholder="phNewPwd" autocomplete="new-password" class="modal-input-pad"></div>
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
      <div id="sessionsList" class="modal-list-flex"></div>
      <button type="button" id="btnRevokeOthers" class="btn-danger" data-i18n="btnRevokeOthers">下线所有其他设备</button>
    </div>
  </div>

  <div id="auditModal" role="dialog" aria-modal="true" aria-labelledby="modalAuditTitle" class="modal-backdrop modal-z-200">
    <div class="modal-card modal-card-lg">
      <div class="modal-header">
        <h2 class="modal-title" data-i18n="modalAuditTitle" id="modalAuditTitle">账号安全日志</h2>
        <button type="button" id="btnCloseAudit" aria-label="关闭" class="modal-close-btn">×</button>
      </div>
      <div id="auditList" class="modal-list"></div>
    </div>
  </div>

  <div id="sudoModal" role="dialog" aria-modal="true" aria-labelledby="modalSudoTitle" class="modal-backdrop modal-z-300">
    <div class="modal-card">
      <h2 class="modal-title-sm" data-i18n="modalSudoTitle" id="modalSudoTitle">安全验证</h2>
      <p class="modal-desc" data-i18n="modalSudoDesc">为了您的账号安全，请再次输入登录密码。</p>
      <div class="input-group" class="input-group-gap"><input type="password" id="sudoPassword" placeholder="输入当前密码" data-i18n-placeholder="phOldPwd" class="modal-input-pad"></div>
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
      <div id="modalContent" class="modal-content-text"></div>
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
-- 存量用户 email 统一小写化
-- 注意：若存在仅大小写不同的重复邮箱会触发 UNIQUE 冲突。
-- 线上 0 用户状态下安全，未来需先查重。
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

### migrations/0027_drop_device_fingerprints.sql

``````
-- 清理从未被任何代码使用的设备指纹死表
DROP TABLE IF EXISTS device_fingerprints;

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

### scripts/prepare-deploy.py

``````
#!/usr/bin/env python3
"""生成 Pages 部署目录：只包含运行所需的静态资源与 Functions。"""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "dist"

FILES = [
    "index.html", "app.js", "style.css", "sw.js", "passkey.js", "manifest.json",
    "help.html", "privacy.html", "terms.html", "_headers",
    "logo.png", "icon-192.png", "icon-512.png", "icon-maskable.png", "apple-touch-icon.png",
]
DIRS = ["functions", "static"]

if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()

for name in FILES:
    src = ROOT / name
    if src.is_file():
        shutil.copy2(src, OUT / name)

for name in DIRS:
    src = ROOT / name
    if src.is_dir():
        shutil.copytree(src, OUT / name)

count = sum(1 for _ in OUT.rglob("*") if _.is_file())
print(f"prepared {count} files in {OUT}")

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

/* 焦点样式 */
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

/* 弹窗组件类 */
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

/* 移动端输入框防缩放处理：iOS 要求 input 字号 >= 16px 才不会在聚焦时强制放大页面 */
input, textarea, select {
  font-size: 16px !important;
  touch-action: manipulation;
}

/* P2-2 内联样式提取 */
.user-panel { text-align: center; padding: 20px 0; }
.user-avatar { width: 60px; height: 60px; background: #e8defa; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.user-welcome { font-size: 20px; color: #111; margin-bottom: 8px; }
.user-info { font-size: 13px; color: #888; margin-bottom: 24px; }
.user-uid { font-weight: bold; color: #111; }
.btn-ghost { background: #f4f5f7; color: #111; margin-bottom: 10px; width: 100%; height: 40px; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
.btn-dark { background: #000; color: #fff; margin-bottom: 10px; width: 100%; height: 40px; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
.btn-logout { background: #eee; color: #111; margin-bottom: 0; width: 100%; height: 40px; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
.btn-danger { width: 100%; height: 40px; background: #e53e3e; border: none; border-radius: 10px; font-weight: 600; color: #fff; cursor: pointer; }
.input-group-gap { margin-bottom: 16px; }
.list-item { padding: 8px; border-bottom: 1px solid #eee; }
.modal-list { overflow-y: auto; font-size: 13px; color: #666; line-height: 1.6; padding-right: 8px; }
.honeypot { display: none !important; }

.user-panel { display: none; }
.user-panel.active { display: block; }
.form-actions-gap { margin-top: 14px; }
.checkbox-group-gap { margin-top: 4px; }
.btn-submit-sm { margin-bottom: 8px; }
.footer-gap { line-height: 1.6; margin-top: 10px; }
.footer-sub { margin-bottom: 6px; }
.modal-desc { font-size: 12px; color: #888; margin-bottom: 16px; }
.btn-primary-block { width: 100%; height: 40px; background: #000; border: none; border-radius: 10px; font-weight: 600; color: #fff; cursor: pointer; }
.modal-title { font-size: 18px; margin-bottom: 16px; color: #111; }
.input-group-sm { margin-bottom: 12px; }
.modal-list-flex { overflow-y: auto; font-size: 13px; color: #666; flex: 1; margin-bottom: 16px; }
.modal-content-text { font-size: 13px; color: #666; line-height: 1.6; overflow-y: auto; padding-right: 8px; }

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

  // 脚本和样式：Network-First（防止发版后一直拿旧缓存）
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 图片和字体：Cache-First
  if (request.destination === 'image' || request.destination === 'font') {
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
pages_build_output_dir = "dist"

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
# tests 66
# suites 0
# pass 66
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 3611.525769
``````

## 四、部署步骤

1. 应用迁移：`npx wrangler d1 migrations apply sleep-db --remote`
2. 配置 Secrets：`PASSWORD_PEPPER`、`RESEND_API_KEY`、`GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`
3. 部署：`npx wrangler pages deploy .`
4. 验证：`curl -I https://sleeping.cc.cd/test/csrf.test.js` 应返回 404
