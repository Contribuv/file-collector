/* ============================================================
   用户管理（users）模块
   - 用户列表（角色 / 状态 / 链接·记录数）
   - 操作浮窗：启用·禁用 / 编辑信息 / 重置密码 / 删除用户
   - 新增用户（模态表单）
   - 邀请码管理（切换视图：生成 / 复制 / 删除）
   ============================================================ */
(function () {
    'use strict';
    var GW = window.GW;
    if (!GW) return;
    window.GWModules = window.GWModules || {};

    var esc = GW.escapeHtml;
    var panel = null;
    var state = null;

    function initState() {
        state = {
            view: 'users',            // 'users' | 'invites'
            q: '',
            users: [],
            invites: [],
            adminCount: 0,            // 管理员总数（判定「最后一个管理员」）
            currentUserId: null,      // 当前登录用户 id（禁止删除自己）
            inited: false
        };
    }
    initState();

    /* ---------- 工具 ---------- */
    function fmtTime(t) { return t ? String(t).replace('T', ' ').replace(/\.\d+$/, '') : '-'; }
    function roleBadge(u) {
        return u.is_admin
            ? '<span class="gwa-badge gwa-badge-accent">管理账号</span>'
            : '<span class="gwa-badge">普通用户</span>';
    }
    // 状态列只表达启用/禁用；管理员身份由独立的「角色」列展示，
    // 这里不再返回「管理账号」，否则禁用的管理员看不出已禁用
    function statusBadge(u) {
        return u.status === 'active'
            ? '<span class="gwa-badge gwa-badge-ok">启用</span>'
            : '<span class="gwa-badge gwa-badge-danger">禁用</span>';
    }
    function inviteBadge(c) {
        if (c.is_used) return '<span class="gwa-badge gwa-badge-warn">已使用</span>';
        if (c.is_expired) return '<span class="gwa-badge gwa-badge-danger">已过期</span>';
        return '<span class="gwa-badge gwa-badge-ok">未使用</span>';
    }
    function toForm(obj) {
        var fd = new FormData();
        Object.keys(obj).forEach(function (k) { fd.append(k, obj[k]); });
        return fd;
    }

    /* ---------- 视图切换 ---------- */
    function switchView(v) {
        state.view = v;
        render();
    }

    /* ---------- 列表加载 ---------- */
    function load() {
        if (!panel) panel = document.querySelector('[data-gwa-panel="users"]');
        if (!panel) return;
        panel.innerHTML = '<div class="gwa-card"><div class="gwa-loading"><span class="gwa-spinner"></span>加载中…</div></div>';
        var url = state.view === 'invites'
            ? '/invites'
            : '/users' + (state.q ? '?q=' + encodeURIComponent(state.q) : '');
        GW.api(url).then(function (data) {
            if (state.view === 'invites') state.invites = data.invites || [];
            else {
                state.users = data.users || [];
                state.adminCount = data.admin_count || 0;
                state.currentUserId = (data.current_user_id === undefined || data.current_user_id === null)
                    ? null : String(data.current_user_id);
            }
            render();
        }).catch(function (err) {
            panel.innerHTML = '<div class="gwa-card"><div class="gwa-empty">加载失败：' + esc(err.message || '未知错误') + '</div></div>';
        });
    }

    /* ---------- 渲染 ---------- */
    function render() {
        if (state.view === 'invites') renderInvites();
        else renderUsers();
    }

    function renderUsers() {
        var html = '';
        html += '<div class="gwa-toolbar">';
        html += '<div class="gwa-toolbar-left">';
        html += '<button type="button" class="btn btn-primary btn-sm" data-act="new-user">新增用户</button>';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="to-invites">邀请码管理</button>';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="refresh">刷新</button>';
        html += '</div>';
        html += '<div class="gwa-toolbar-right">';
        html += '<input type="search" class="form-input gwa-filter" data-act="search" placeholder="搜索用户名/邮箱/昵称" value="' + esc(state.q) + '">';
        html += '<span class="gwa-muted">共 ' + state.users.length + ' 个用户</span>';
        html += '</div></div>';

        if (!state.users.length) {
            html += '<div class="gwa-card"><div class="gwa-empty">' + (state.q ? '没有匹配的用户' : '暂无用户<br><span class="gwa-muted">用户可通过邀请码注册账户</span>') + '</div></div>';
        } else {
            html += '<div class="gwa-card">';
            html += '<div class="gwa-table-wrap"><table class="gwa-table"><thead><tr>';
            html += '<th>用户名</th><th>邮箱</th><th>角色</th><th>状态</th>';
            html += '<th class="gwa-nowrap">链接 / 记录</th><th class="gwa-nowrap">注册时间</th><th style="text-align:right">操作</th>';
            html += '</tr></thead><tbody>';
            state.users.forEach(function (u) {
                html += '<tr data-id="' + esc(u.id) + '">';
                html += '<td data-label="用户名"><span class="gwa-ellipsis" title="' + esc(u.username) + '">' + esc(u.username) + '</span>' +
                        (u.nickname ? '<div class="gwa-muted gwa-ellipsis" style="font-size:12px">' + esc(u.nickname) + '</div>' : '') + '</td>';
                html += '<td data-label="邮箱" class="gwa-muted"><span class="gwa-ellipsis" title="' + esc(u.email) + '">' + esc(u.email || '—') + '</span></td>';
                html += '<td data-label="角色">' + roleBadge(u) + '</td>';
                html += '<td data-label="状态">' + statusBadge(u) + '</td>';
                html += '<td data-label="链接 / 记录" class="gwa-muted gwa-nowrap">' + u.link_count + ' / ' + u.record_count + '</td>';
                html += '<td data-label="注册时间" class="gwa-muted gwa-nowrap">' + esc(fmtTime(u.created_at)) + '</td>';
                html += '<td data-label="操作" class="gwa-col-actions">';
                html += '<button type="button" class="btn btn-default btn-sm" data-act="user-actions" data-id="' + esc(u.id) + '">操作</button>';
                html += '</td></tr>';
            });
            html += '</tbody></table></div></div>';
        }
        panel.innerHTML = html;
        bindCommon();
    }

    function renderInvites() {
        var html = '';
        html += '<div class="gwa-toolbar">';
        html += '<div class="gwa-toolbar-left">';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="to-users">返回用户列表</button>';
        html += '<span class="gwa-inline"><label class="gwa-muted">有效期</label>' +
                '<input type="number" class="form-input gwa-invite-days" min="1" max="365" value="7" style="width:80px"><span class="gwa-muted">天</span></span>';
        html += '<button type="button" class="btn btn-primary btn-sm" data-act="gen-invite">生成邀请码</button>';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="refresh">刷新</button>';
        html += '</div>';
        html += '<div class="gwa-toolbar-right"><span class="gwa-muted">共 ' + state.invites.length + ' 个邀请码</span></div>';
        html += '</div>';

        if (!state.invites.length) {
            html += '<div class="gwa-card"><div class="gwa-empty">暂无邀请码<br><span class="gwa-muted">点击「生成邀请码」供用户注册</span></div></div>';
        } else {
            html += '<div class="gwa-card">';
            html += '<div class="gwa-table-wrap"><table class="gwa-table"><thead><tr>';
            html += '<th>邀请码</th><th class="gwa-nowrap">有效期至</th><th>状态</th><th>使用用户</th>';
            html += '<th class="gwa-nowrap">创建时间</th><th style="text-align:right">操作</th>';
            html += '</tr></thead><tbody>';
            state.invites.forEach(function (c) {
                html += '<tr data-id="' + esc(c.id) + '">';
                html += '<td data-label="邀请码"><code class="gwa-mono">' + esc(c.code) + '</code></td>';
                html += '<td data-label="有效期至" class="gwa-muted gwa-nowrap">' + esc(fmtTime(c.expires_at)) + '</td>';
                html += '<td data-label="状态">' + inviteBadge(c) + '</td>';
                html += '<td data-label="使用用户" class="gwa-muted">' + esc(c.used_by_name || '—') + '</td>';
                html += '<td data-label="创建时间" class="gwa-muted gwa-nowrap">' + esc(fmtTime(c.created_at)) + '</td>';
                html += '<td data-label="操作" class="gwa-col-actions">';
                if (!c.is_used && !c.is_expired) {
                    html += '<button type="button" class="btn btn-default btn-sm" data-act="copy-invite" data-code="' + esc(c.code) + '">复制</button> ';
                }
                html += '<button type="button" class="btn btn-danger btn-sm" data-act="del-invite" data-id="' + esc(c.id) + '">删除</button>';
                html += '</td></tr>';
            });
            html += '</tbody></table></div></div>';
        }
        panel.innerHTML = html;
        bindCommon();
    }

    /* ---------- 事件（面板委托） ---------- */
    function bindCommon() {
        // 搜索框实时过滤（回车/输入带防抖）
        var search = panel.querySelector('[data-act="search"]');
        if (search) {
            var timer = null;
            search.addEventListener('input', function () {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    state.q = search.value.trim();
                    load();
                }, 320);
            });
        }
    }

    function onPanelClick(e) {
        var btn = e.target.closest('[data-act]');
        if (!btn) return;
        var act = btn.getAttribute('data-act');
        if (act === 'refresh') { load(); }
        else if (act === 'to-invites') { switchView('invites'); load(); }
        else if (act === 'to-users') { switchView('users'); load(); }
        else if (act === 'new-user') { openCreateModal(); }
        else if (act === 'gen-invite') { genInvite(); }
        else if (act === 'copy-invite') { GW.copy(btn.getAttribute('data-code')); }
        else if (act === 'del-invite') { delInvite(btn.getAttribute('data-id')); }
        else if (act === 'user-actions') {
            var u = state.users.filter(function (x) { return String(x.id) === String(btn.getAttribute('data-id')); })[0];
            if (u) showUserActions(btn, u);
        }
        // 搜索框输入不处理
    }

    /* ---------- 用户操作浮窗 ---------- */
    function showUserActions(anchor, u) {
        var isActive = u.status === 'active';
        var rows = '';
        rows += kv('邮箱', esc(u.email || '—'));
        rows += kv('昵称', esc(u.nickname || '—'));
        rows += kv('角色', esc(u.is_admin ? '管理账号' : '普通用户'));
        rows += kv('状态', isActive ? '<span class="gwa-badge gwa-badge-ok">启用</span>' : '<span class="gwa-badge gwa-badge-danger">禁用</span>');
        rows += kv('链接 / 记录', u.link_count + ' / ' + u.record_count);
        rows += kv('注册于', esc(fmtTime(u.created_at)));
        rows += kv('最近登录', esc(fmtTime(u.last_login_at)));

        // 「最后一个管理员」= 当前仅剩 1 个可用（active）管理员，且目标本身是 active。
        // 目标若是已禁用管理员，它不占用可用名额，应允许删除/清理（与后端口径一致）。
        var lastAdmin = u.is_admin && isActive && state.adminCount <= 1;
        var isSelf = state.currentUserId != null && String(u.id) === state.currentUserId;
        var delBlocked = lastAdmin
            ? '至少需要保留一个管理员，无法删除最后一个管理员'
            : (isSelf ? '不能删除当前登录的账户' : '');
        // 与删除同口径：仅剩一个可用管理员时禁止禁用该管理员（否则后台无人可管理）
        var toggleBlocked = lastAdmin;
        var toggleBlockedMsg = '至少需要保留一个管理员，无法禁用最后一个管理员';

        var html = '<div class="gwa-pop-info">' + rows + '</div>';
        html += '<div class="gwa-pop-actions">';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="toggle"' +
                (toggleBlocked ? ' disabled title="' + esc(toggleBlockedMsg) + '"' : '') + '>' +
                (isActive ? '禁用用户' : '启用用户') + '</button>';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="edit">编辑信息</button>';
        html += '</div>';
        html += '<div class="gwa-pop-actions">';
        html += '<button type="button" class="btn btn-default btn-sm" data-act="reset">重置密码</button>';
        html += '<button type="button" class="btn btn-danger btn-sm" data-act="delete"' +
                (delBlocked ? ' disabled title="' + esc(delBlocked) + '"' : '') + '>删除用户</button>';
        html += '</div>';
        if (toggleBlocked) html += '<div class="gwa-pop-hint">' + esc(toggleBlockedMsg) + '</div>';
        if (delBlocked) html += '<div class="gwa-pop-hint">' + esc(delBlocked) + '</div>';

        GW.popover(anchor, html);
        var pop = document.querySelector('.gwa-popover');
        if (!pop) return;
        pop.addEventListener('click', function (ev) {
            var b = ev.target.closest('[data-act]');
            if (!b || b.disabled) return;
            var a = b.getAttribute('data-act');
            if (a === 'toggle') { GW.closePopover(); toggleUser(u); }
            else if (a === 'edit') { GW.closePopover(); openEditModal(u); }
            else if (a === 'reset') { GW.closePopover(); resetPassword(u); }
            else if (a === 'delete') { GW.closePopover(); deleteUser(u); }
        });
    }

    function kv(k, v) {
        return '<div class="gwa-pop-row"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>';
    }

    /* ---------- 用户操作 ---------- */
    function toggleUser(u) {
        var disable = u.status === 'active';
        // 前端兜底校验：仅剩一个管理员时不可禁用（后端亦有同等校验）
        if (disable && u.is_admin && state.adminCount <= 1) {
            GW.toast('至少需要保留一个管理员，无法禁用最后一个管理员', 'error');
            return;
        }
        GW.confirm('确定' + (disable ? '禁用' : '启用') + '用户「' + u.username + '」？',
                   { danger: disable, okText: disable ? '禁用' : '启用' })
            .then(function (ok) {
                if (!ok) return;
                GW.api('/users/' + encodeURIComponent(u.id) + '/toggle', { method: 'POST' })
                    .then(function (d) { GW.toast(d.message || '已更新', 'success'); load(); })
                    .catch(function (e) { GW.toast(e.message || '操作失败', 'error'); });
            });
    }

    function deleteUser(u) {
        // 前端兜底校验：最后一个「可用」管理员 / 当前登录账户不可删除。
        // 已禁用的管理员不占可用名额，允许删除清理（与后端口径一致）。
        if (u.is_admin && u.status === 'active' && state.adminCount <= 1) { GW.toast('至少需要保留一个管理员，无法删除最后一个管理员', 'error'); return; }
        if (state.currentUserId != null && String(u.id) === state.currentUserId) { GW.toast('不能删除当前登录的账户', 'error'); return; }
        GW.confirm('确定删除用户「' + u.username + '」？\n该操作不可恢复，其名下链接/记录将解除归属。',
                   { danger: true, okText: '确认删除' })
            .then(function (ok) {
                if (!ok) return;
                GW.api('/users/' + encodeURIComponent(u.id) + '/delete', { method: 'POST' })
                    .then(function (d) { GW.toast(d.message || '已删除', 'success'); load(); })
                    .catch(function (e) { GW.toast(e.message || '删除失败', 'error'); });
            });
    }

    function resetPassword(u) {
        GW.confirm('确定重置用户「' + u.username + '」的密码？\n系统将生成随机新密码。',
                   { okText: '确定重置' })
            .then(function (ok) {
                if (!ok) return;
                GW.api('/users/' + encodeURIComponent(u.id) + '/reset-password', { method: 'POST' })
                    .then(function (d) { showPasswordModal(u.username, d.new_password); })
                    .catch(function (e) { GW.toast(e.message || '重置失败', 'error'); });
            });
    }

    function showPasswordModal(username, pwd) {
        var m = GW.modal({
            title: '密码已重置 · ' + username,
            width: '440px',
            bodyHtml:
                '<p style="margin:0 0 10px">用户「' + esc(username) + '」的新登录密码：</p>' +
                '<div class="gwa-note" style="display:flex;align-items:center;justify-content:space-between;gap:10px">' +
                '<code class="gwa-mono" id="gwaNewPwd" style="font-size:15px">' + esc(pwd) + '</code>' +
                '<button type="button" class="btn btn-default btn-sm" data-act="copy-pwd">复制</button></div>' +
                '<p class="gwa-hint" style="margin:10px 0 0">新密码只在此弹窗显示一次，请立即记录或点击「复制」，关闭后将无法再次查看。' +
                '若该用户是飞牛账号登录，仍可用飞牛 SSO 直接进入。</p>',
            footerHtml: '<button type="button" class="btn btn-primary btn-sm" data-act="close">关闭</button>'
        });
        m.body.querySelector('[data-act="copy-pwd"]').addEventListener('click', function () {
            GW.copy(pwd);
        });
        m.footer.querySelector('[data-act="close"]').addEventListener('click', m.close);
    }

    /* ---------- 新增用户模态 ---------- */
    function openCreateModal() {
        var m = GW.modal({
            title: '新增用户',
            width: '520px',
            bodyHtml:
                '<div class="gwa-form">' +
                field('new-username', '用户名', 'text', '3-20位字母、数字或下划线', '3', '20') +
                field('new-email', '邮箱', 'email', '用于密码找回') +
                field('new-password', '密码', 'password', '至少8位，须含字母和数字', '8') +
                field('new-confirm', '确认密码', 'password', '再次输入密码', '8') +
                field('new-nickname', '昵称（选填）', 'text', '显示名称', null, '50') +
                '<div class="gwa-form-row">' +
                '<div class="gwa-field"><label class="form-label">角色权限</label>' +
                '<label class="gwa-switch"><input type="checkbox" id="new-is-admin"><span class="gwa-switch-track"><span class="gwa-switch-thumb"></span></span><span>管理员</span></label>' +
                '<div class="gwa-hint">开启后该用户拥有管理员权限</div></div>' +
                '<div class="gwa-field"><label class="form-label">账号状态</label>' +
                '<div class="gwa-radio-group">' +
                '<label class="gwa-radio checked"><input type="radio" name="new-status" value="active" checked><span class="gwa-radio-body"><span class="gwa-radio-title">启用</span></span></label>' +
                '<label class="gwa-radio"><input type="radio" name="new-status" value="inactive"><span class="gwa-radio-body"><span class="gwa-radio-title">禁用</span></span></label>' +
                '</div></div></div>' +
                '</div>',
            footerHtml:
                '<button type="button" class="btn btn-default btn-sm" data-act="cancel">取消</button>' +
                '<button type="button" class="btn btn-primary btn-sm" data-act="save">创建用户</button>'
        });
        m.footer.querySelector('[data-act="cancel"]').addEventListener('click', m.close);
        m.footer.querySelector('[data-act="save"]').addEventListener('click', function () {
            submitCreate(m);
        });
    }

    function submitCreate(m) {
        var body = m.body;
        var username = body.querySelector('#new-username').value.trim();
        var email = body.querySelector('#new-email').value.trim();
        var password = body.querySelector('#new-password').value;
        var confirm = body.querySelector('#new-confirm').value;
        var nickname = body.querySelector('#new-nickname').value.trim();
        var isAdmin = body.querySelector('#new-is-admin').checked ? '1' : '';
        var statusEl = body.querySelector('input[name="new-status"]:checked');
        var status = statusEl ? statusEl.value : 'active';

        if (!username || username.length < 3 || username.length > 20) { GW.toast('用户名必须在3-20个字符之间', 'error'); return; }
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) { GW.toast('用户名需由3-20个字母、数字或下划线组成', 'error'); return; }
        if (!email || email.indexOf('@') < 0) { GW.toast('请输入有效的邮箱地址', 'error'); return; }
        if (!password || password.length < 8) { GW.toast('密码长度至少需要8位', 'error'); return; }
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) { GW.toast('密码必须同时包含字母和数字', 'error'); return; }
        if (password !== confirm) { GW.toast('两次输入的密码不一致', 'error'); return; }

        GW.api('/users/create', {
            method: 'POST',
            form: toForm({
                username: username, email: email, password: password,
                confirm_password: confirm, nickname: nickname, is_admin: isAdmin, status: status
            })
        }).then(function (d) {
            m.close();
            GW.toast(d.message || '用户创建成功', 'success');
            state.view = 'users';
            load();
        }).catch(function (e) { GW.toast(e.message || '创建失败', 'error'); });
    }

    /* ---------- 编辑用户模态 ---------- */
    function openEditModal(u) {
        var m = GW.modal({
            title: '编辑用户',
            width: '480px',
            bodyHtml:
                '<div class="gwa-form">' +
                field('edit-username', '用户名', 'text', '3-20位字母、数字或下划线', '3', '20', u.username) +
                field('edit-email', '邮箱', 'email', '用于密码找回', null, null, u.email) +
                field('edit-password', '新密码（留空不改）', 'password', '至少8位，须含字母和数字', '8') +
                field('edit-confirm', '确认新密码', 'password', '再次输入新密码', '8') +
                '</div>',
            footerHtml:
                '<button type="button" class="btn btn-default btn-sm" data-act="cancel">取消</button>' +
                '<button type="button" class="btn btn-primary btn-sm" data-act="save">保存</button>'
        });
        m.footer.querySelector('[data-act="cancel"]').addEventListener('click', m.close);
        m.footer.querySelector('[data-act="save"]').addEventListener('click', function () {
            var body = m.body;
            var newUsername = body.querySelector('#edit-username').value.trim();
            var newEmail = body.querySelector('#edit-email').value.trim();
            var newPassword = body.querySelector('#edit-password').value;
            var confirm = body.querySelector('#edit-confirm').value;

            if (!newUsername || !/^[a-zA-Z0-9_]{3,20}$/.test(newUsername)) { GW.toast('用户名需由3-20个字母、数字或下划线组成', 'error'); return; }
            if (newPassword) {
                if (newPassword.length < 8) { GW.toast('密码长度至少需要8位', 'error'); return; }
                if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) { GW.toast('密码必须同时包含字母和数字', 'error'); return; }
                if (newPassword !== confirm) { GW.toast('两次输入的密码不一致', 'error'); return; }
            }
            GW.api('/users/' + encodeURIComponent(u.id) + '/edit', {
                method: 'POST',
                form: toForm({ new_username: newUsername, new_email: newEmail, new_password: newPassword })
            }).then(function (d) {
                m.close();
                GW.toast(d.message || '用户信息已更新', 'success');
                load();
            }).catch(function (e) { GW.toast(e.message || '保存失败', 'error'); });
        });
    }

    function field(id, label, type, placeholder, minlen, maxlen, value) {
        var attrs = '';
        if (minlen) attrs += ' minlength="' + minlen + '"';
        if (maxlen) attrs += ' maxlength="' + maxlen + '"';
        if (value !== undefined && value !== null) attrs += ' value="' + esc(value) + '"';
        return '<div class="gwa-field"><label class="form-label" for="' + id + '">' + label + '</label>' +
            '<input type="' + type + '" id="' + id + '" class="form-input" placeholder="' + esc(placeholder) + '"' + attrs + '></div>';
    }

    /* ---------- 邀请码操作 ---------- */
    function genInvite() {
        var daysEl = panel.querySelector('.gwa-invite-days');
        var days = daysEl ? parseInt(daysEl.value, 10) : 7;
        if (isNaN(days) || days < 1 || days > 365) { GW.toast('有效期需在 1-365 天之间', 'error'); return; }
        GW.api('/invites/generate', { method: 'POST', form: toForm({ expire_days: String(days) }) })
            .then(function (d) {
                GW.toast('邀请码已生成', 'success');
                load();
            })
            .catch(function (e) { GW.toast(e.message || '生成失败', 'error'); });
    }

    function delInvite(id) {
        GW.confirm('确定删除此邀请码？', { danger: true, okText: '确认删除' })
            .then(function (ok) {
                if (!ok) return;
                GW.api('/invites/' + encodeURIComponent(id) + '/delete', { method: 'POST' })
                    .then(function (d) { GW.toast(d.message || '已删除', 'success'); load(); })
                    .catch(function (e) { GW.toast(e.message || '删除失败', 'error'); });
            });
    }

    /* ---------- 入口 ---------- */
    function init() {
        panel = document.querySelector('[data-gwa-panel="users"]');
        if (!panel) return;
        if (!panel.dataset.bound) {
            panel.addEventListener('click', onPanelClick);
            panel.dataset.bound = '1';
        }
        if (!state.inited) {
            state.inited = true;
            load();
        } else {
            load();
        }
    }

    window.GWModules.users = { init: init };
})();
