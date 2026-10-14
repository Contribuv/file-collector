# 网关集成管理面板 —— 实施计划与进度

> 目标：把 file-collector 的后台功能（信息面板 / 收集链接 / 文件记录 / 用户管理 / 收集设置）
> 原生重建为飞牛统一网关面板 `gateway.html` 内的 tab（独立 CSS/JS，适配网关风格），
> 同时保留原有 TCP 端口直连（`http://NAS-IP:5557/admin`）访问，二者互不影响、不重定向、不 iframe。

## 架构约定

- 旧多页 `/admin` 后台**原样保留**，仅服务 TCP 直连。
- 网关内新面板完全独立：
  - 后端：新建 JSON API 蓝图 `gateway_admin_bp`（`url_prefix=/gateway/admin`）+ 共享业务层 `admin_services.py`。
  - 守卫：`gateway_guard.py` 集中实现「来源隔离 / 管理员鉴权 / CSRF」，`gateway_api.py` 复用。
  - 前端：独立 CSS/JS，5 个 section 用 Jinja include（`templates/gateway/_*.html`），
    模块脚本 `static/js/gateway-admin/gw-<name>.js`，注册到 `window.GWModules` 懒加载。
- 二进制/只读端点复用既有 `/admin/records/*`、`/doc`、`/office`、`/txt` GET 端点（经网关前缀转发任意路径）。
- 变更类操作走新 JSON API。

## 里程碑

### M0 骨架与守卫  ✅ 已完成并验证
- [x] `gateway_guard.py`（来源隔离 / 管理员鉴权 / CSRF）
- [x] `gateway_admin_api.py` 骨架（守卫链 + `/api/ping` + `_current_user`）
- [x] `gateway_api.py` 委托复用守卫
- [x] `app.py` 注册蓝图

### M1 面板外壳与公共前端层  ✅ 已完成并验证
- [x] `static/css/gateway-admin.css`
- [x] `static/js/gateway-admin.js`（`window.GW`：api/base/csrf/toast/confirm/modal/popover/lightbox/pager/copy/...）
- [x] `templates/gateway.html`：head 引入、侧边栏 5 tab、主区 include、`switchSection` + `ensureSection`
- [x] 5 个 section 片段 `templates/gateway/_*.html`

### M2 信息面板  ✅ 已完成并验证
- [x] `admin_services.py`：`dashboard_stats` 等
- [x] `GET /api/dashboard`
- [x] `static/js/gateway-admin/gw-dashboard.js`

### M3 收集链接  ✅ 已完成并验证
- [x] `admin_services.py` links 全套 + `/api/links*` 全套端点
- [x] `static/js/gateway-admin/gw-links.js`（列表/分页/筛选/新建·编辑模态/通行证/分享页/有效期/slug/附件）

### M4 文件记录  ✅ 已完成并验证
- [x] `admin_services.py`：`list_records / delete_records / _owned_records`
- [x] `/api/records`、`/api/records/batch-delete`、`/api/records/set-per-page`、`/api/records/<id>/delete`
- [x] `static/js/gateway-admin/gw-records.js`（列表/筛选/分页/批量删除/详情/预览/下载）

### M5 用户管理 + 邀请码  ✅ 已完成并验证
- [x] `admin_services.py`：`list_users / create_user / toggle_user / edit_user / delete_user / reset_user_password` 与 `list_invites / generate_invite / delete_invite`
- [x] `/api/users*`、`/api/invites*` 端点 + `_ADMIN_ONLY_ENDPOINTS` 登记
- [x] `static/js/gateway-admin/gw-users.js`
- [ ] （可选）浏览器端剩余交互复验：编辑信息 / 重置密码 / 邀请码视图

### M6 收集设置  ✅ 已完成（后端 44/44 冒烟通过；前端已接入）
- [x] `admin_services.py`：设置读写（管理员 `admin_settings` 全局 / 普通用户 `user_settings` 个人，双形态）
      —— `settings_overview / save_account / save_settings / test_smtp / database_backup / restore_database / reverse_proxy_status`
- [x] `gateway_admin_api.py`：`/api/settings*` 端点 + 登记 `_ADMIN_ONLY_ENDPOINTS`、`_PASSWORD_EXEMPT_ENDPOINTS`
- [x] `static/js/gateway-admin/gw-settings.js` + `templates/gateway/_settings.html` 双形态
      （管理员：账号/页面与品牌/默认设置/上传路径/功能开关/邮件/备份恢复/系统信息；
        普通用户：账号/我的默认设置）
      注：反向代理运行状态统一归「公网访问」Tab（见 M7），设置页不再重复展示。
- [x] 接口冒烟（含来源隔离 404、非管理员 403、缺 CSRF 403、备份/恢复、SSO 改密）
- [x] 浏览器验证（管理员/普通用户双形态渲染与交互）

### M7 面板打磨（公网访问重构 + 滚动条）  ✅ 已完成并验证
- [x] 「公网访问」Tab 重排为卡片式（沿用面板 `gwa-card` 视觉）：反向代理（域名/HTTPS 端口/启停/刷新证书）
      + 运行状态（反向代理状态 / 公网地址 / 内网地址）
- [x] 运行状态去重：移除「收集设置」里的「反向代理状态」卡片（`gw-settings.js`），
      `admin_services.reverse_proxy_status` 服务与 `/api/settings/reverse-proxy` 端点保留备用
- [x] 文案重写：域名/端口提示改中性 `gwa-hint`（原两处 ⚠ 警告合并收敛），
      内网地址补「仅同一局域网内可访问」，公网地址补「启动后显示；可分享给外网用户」
- [x] 浮窗滚动条：`.gwa-modal-body / .gwa-popover / .gwa-table-wrap` 统一 6px 细滚动条
      + `--gw-scrollbar` 明暗主题色（Firefox 用 `@supports` 隔离 `scrollbar-width/color`，避免 Chromium 变粗）
- [x] 浏览器验证：公网访问 2 卡片 + 3 状态行、设置页 8 卡片无重复、创建链接浮窗滚动条 6px、
      明暗 `--gw-scrollbar` 分别为 rgba(0,0,0,.16) / rgba(255,255,255,.16)

### M8 面板打磨第二批（深色原生控件 / 操作日志 / 使用说明重构 / 去微信）  ✅ 已完成并验证
- [x] 深色原生控件：`gateway.css` 增 `color-scheme`（`:root` light / `[data-theme=dark]` dark），
      修复深色主题下数字框上下箭头、下拉、日期等浏览器原生部件仍走浅色的问题（保留箭头）
- [x] 移除微信反馈：`gateway.html` 公网访问页的 `wechatCopy/copyTip` DOM、`copyWechat` 绑定与函数，
      以及 gateway.css 中已无引用的 `.feedback-wechat / .copy-tip / .mac-sidebar-feedback` 样式
- [x] 操作日志（审计）：
  - 新建 `activity_logs` 表（app.py `init_db`，含 created_at/category/action 索引）
  - `admin_services.log_activity()`（请求上下文自适应取操作者/IP；异常静默）+
    `list_activity_logs()`（分页/分类/动作/关键字筛选，per_page 钳制 10–200）
  - 埋点：登录/退出（app.py）、上传/下载（`_log_upload`/`_log_download` 内联）、
    建链/编辑/启停/删链、删记录、用户增删改/重置密码、邀请码生成/删除、设置保存/改密（admin_services）
  - 新端点 `GET /gateway/admin/api/logs/activity`（登记进 `_ADMIN_ONLY_ENDPOINTS`，普通用户 403）
  - 前端：`#section-logs` 分段切换「反向代理 / 操作日志」+ 新模块 `gw-logs.js`（筛选/搜索/分页/每页数量）
- [x] 使用说明重构（面向新面板）：重写安装/登录/建链/链接管理/管理面板导航/收集设置卡片顺序/
      批量/公网访问；移除已过时的旧后台截图（01/02/07/08/10）引用，保留仍适用的用户端截图（03–06、09）
- [x] 回归：`smoke_activity` ALL PASS、`smoke_regression` 21/21、`smoke_m6` 44/44、渲染校验 ALL PASS；
      浏览器实测：建链→操作日志出现「收集链接·创建」、删链→「收集链接·删除」，`color-scheme` 随主题切换为 light/dark

### 收尾
- [x] M2–M6 全量回归冒烟
- [ ] 版本号 / changelog / precompile（如需要）
- [ ] git 提交（M0–M6）

## 验收 / 回归清单（必须全绿）

- TCP：`/`、`/collect/<id>`、`/share/<id>`、`/admin`（全部旧功能）零变化。
- 网关：5 个新 tab 全 CRUD；亮/暗主题；移动端；SSO 登录/退出/切号；非管理员访问 users/settings 管理项 → 403；
  TCP 直连 `/gateway/admin/api/*` → 404；CSRF 缺失被拒；默认密码/待改密引导正确。
- 数据一致性：新旧 UI 对同一 DB 的读写结果一致（链接、记录、用户、设置）。
