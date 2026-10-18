"""
统一网关「集成管理面板」JSON API（独立 Blueprint）

目标：把原 /admin 多页面后台的能力，重做为飞牛统一网关面板
（gateway.html）内的 5 个 Tab：
  - 信息面板（dashboard）
  - 收集链接（links）
  - 文件记录（records）
  - 用户管理（users，仅管理员）
  - 收集设置（settings，仅管理员）

约束（与 /gateway 完全一致）：
  * 仅经飞牛统一网关可访问，TCP 端口直连一律 404；
  * 权限以应用会话 session 为准（网关 SSO 建立）；
  * 写操作（POST/PUT/DELETE）强制 CSRF 校验。

统一响应约定：
  成功 -> HTTP 200/201 + JSON（通常含 ok=true）
  失败 -> 非 2xx + {"ok": false, "message": "..."}
"""
import logging

from flask import Blueprint, jsonify, request, session

from gateway_guard import (
    guard_gateway_access,
    guard_admin_only,
    validate_csrf,
)

logger = logging.getLogger('gateway_admin_api')

# Blueprint 必须最早定义，保证 import 本模块时始终存在
gateway_admin_bp = Blueprint('gateway_admin', __name__)

# 仅管理员可访问的接口 endpoint（用户管理 / 收集设置中的管理项）。
# 后续里程碑新增接口时，在此登记。
_ADMIN_ONLY_ENDPOINTS = {
    # 用户管理
    'gateway_admin.api_users_list',
    'gateway_admin.api_user_create',
    'gateway_admin.api_user_toggle',
    'gateway_admin.api_user_edit',
    'gateway_admin.api_user_delete',
    'gateway_admin.api_user_reset_password',
    # 邀请码管理
    'gateway_admin.api_invites_list',
    'gateway_admin.api_invites_generate',
    'gateway_admin.api_invites_delete',
    # 收集设置（管理项：页面品牌 / 上传路径 / 功能开关 / 邮件 / 备份恢复 / 反代状态）
    'gateway_admin.api_settings_page_branding',
    'gateway_admin.api_settings_upload_path',
    'gateway_admin.api_settings_feature_toggles',
    'gateway_admin.api_settings_smtp',
    'gateway_admin.api_settings_test_smtp',
    'gateway_admin.api_settings_backup',
    'gateway_admin.api_settings_restore',
    'gateway_admin.api_settings_reverse_proxy',
    # 操作日志（审计）
    'gateway_admin.api_activity_logs',
}

# 免登录接口（连通性冒烟）
_PUBLIC_ENDPOINTS = {'gateway_admin.api_ping'}

# SSO 强制改密状态下仍可访问的接口（改密入口在「收集设置」）
_PASSWORD_EXEMPT_ENDPOINTS = {
    'gateway_admin.api_ping',
    'gateway_admin.api_settings_overview',
    'gateway_admin.api_settings_account',
}

# 写操作使用的方法集合
_WRITE_METHODS = ('POST', 'PUT', 'PATCH', 'DELETE')


@gateway_admin_bp.before_request
def _guard():
    """统一守卫：来源隔离 -> 登录 -> 管理员鉴权 -> 强制改密 -> CSRF。"""
    # 1. 仅经飞牛统一网关可访问
    guard_gateway_access()

    # 2. 免登录接口（冒烟）
    if request.endpoint in _PUBLIC_ENDPOINTS:
        return None

    # 3. 需登录（网关请求由 app.before_request 的 SSO 自动建立会话）
    if not session.get('user_id'):
        return jsonify({'ok': False, 'message': '未登录或登录已过期'}), 401

    # 4. 指定的管理类接口仅管理员可用（JSON 403）
    denied = guard_admin_only(_ADMIN_ONLY_ENDPOINTS, json_response=True)
    if denied is not None:
        return denied

    # 5. SSO 自动创建账号未设置密码前，除改密入口外一律拦截
    if session.get('sso_need_pwd') and request.endpoint not in _PASSWORD_EXEMPT_ENDPOINTS:
        return jsonify({
            'ok': False,
            'need_password': True,
            'message': '请先在「收集设置」中设置登录密码',
        }), 403

    # 6. 写操作统一校验 CSRF
    if request.method in _WRITE_METHODS and not validate_csrf():
        return jsonify({'ok': False, 'message': '安全验证失败，请刷新页面重试'}), 403

    return None


def _current_user():
    """当前应用会话用户信息（用于调试与前端展示）。"""
    return {
        'user_id': session.get('user_id'),
        'username': session.get('username'),
        'nickname': session.get('nickname'),
        'is_admin': bool(session.get('is_admin')),
    }


# ============================================================
# 冒烟接口（M0）
# ============================================================
@gateway_admin_bp.route('/api/ping')
def api_ping():
    """连通性与会话冒烟检测。

    返回当前适配后的会话态，便于在网关内验证 SSO 是否已建立。
    """
    return jsonify({
        'ok': True,
        'message': 'gateway admin api ready',
        'user': _current_user(),
    })


# ============================================================
# 信息面板（dashboard）
# ============================================================
@gateway_admin_bp.route('/api/dashboard')
def api_dashboard():
    """信息面板：统计数据 + 最近上传记录。"""
    from admin_services import dashboard_stats
    data = dashboard_stats(session.get('user_id'), bool(session.get('is_admin')))
    return jsonify({'ok': True, **data})


# ============================================================
# 上传记录（通用）
# ============================================================
@gateway_admin_bp.route('/api/records')
def api_records_list():
    """上传记录列表（分页 + 按链接筛选）。"""
    from admin_services import list_records
    data = list_records(
        session.get('user_id'),
        bool(session.get('is_admin')),
        page=request.args.get('page', 1),
        per_page=request.args.get('per_page'),
        link_filter=request.args.get('link_id', ''),
        dir_path=request.args.get('dir', ''),
    )
    return jsonify({'ok': True, **data})


@gateway_admin_bp.route('/api/records/batch-delete', methods=['POST'])
def api_records_batch_delete():
    """批量删除上传记录（含文件）。"""
    from admin_services import delete_records
    ids = request.form.get('record_ids', '')
    ids = [x.strip() for x in ids.split(',') if x.strip()]
    if not ids:
        return jsonify({'ok': False, 'message': '未选择任何记录'}), 400
    n = delete_records(ids, session.get('user_id'), bool(session.get('is_admin')))
    return jsonify({'ok': True, 'deleted': n, 'message': f'已删除 {n} 条记录'})


@gateway_admin_bp.route('/api/records/set-per-page', methods=['POST'])
def api_records_set_per_page():
    """保存「每页显示」用户偏好。"""
    try:
        val = int(request.form.get('value', '50'))
    except (ValueError, TypeError):
        return jsonify({'ok': False, 'message': '数值不合法'}), 400
    val = max(5, min(200, val))
    app_module = _app_module()
    app_module.set_user_setting(session.get('user_id'), 'records_per_page', str(val))
    return jsonify({'ok': True, 'value': val})


@gateway_admin_bp.route('/api/records/<int:record_id>/delete', methods=['POST'])
def api_record_delete(record_id):
    """删除单条上传记录（含文件）。"""
    from admin_services import delete_records
    n = delete_records([record_id], session.get('user_id'), bool(session.get('is_admin')))
    if n == 0:
        return jsonify({'ok': False, 'message': '记录不存在或无权操作'}), 404
    return jsonify({'ok': True})


@gateway_admin_bp.route('/api/records/<int:record_id>/download-logs')
def api_record_download_logs(record_id):
    """文件下载日志（分页，供面板内浮窗展示）。"""
    from admin_services import list_download_logs
    try:
        data = list_download_logs(
            record_id, session.get('user_id'), bool(session.get('is_admin')),
            page=request.args.get('page', 1),
            per_page=request.args.get('per_page', 20))
    except FileNotFoundError:
        return jsonify({'ok': False, 'message': '记录不存在'}), 404
    except PermissionError:
        return jsonify({'ok': False, 'message': '无权访问该文件'}), 403
    return jsonify({'ok': True, **data})


# ============================================================
# 收集链接（links）
# ============================================================
@gateway_admin_bp.route('/api/links')
def api_links_list():
    """收集链接列表（分页 + 管理员按创建人筛选）。"""
    from admin_services import list_links
    data = list_links(
        session.get('user_id'),
        bool(session.get('is_admin')),
        page=request.args.get('page', 1),
        per_page=request.args.get('per_page', 50),
        creator_filter=request.args.get('creator', ''),
    )
    return jsonify({'ok': True, **data})


@gateway_admin_bp.route('/api/links/defaults')
def api_links_defaults():
    """新建收集链接表单默认值。"""
    from admin_services import link_form_defaults
    return jsonify({'ok': True, 'defaults': link_form_defaults(session.get('user_id'))})


@gateway_admin_bp.route('/api/links/batch-delete', methods=['POST'])
def api_links_batch_delete():
    """批量删除收集链接。"""
    from admin_services import delete_links
    ids = request.form.get('link_ids', '')
    ids = [x.strip() for x in ids.split(',') if x.strip()]
    if not ids:
        return jsonify({'ok': False, 'message': '未选择任何链接'}), 400
    n = delete_links(ids, session.get('user_id'), bool(session.get('is_admin')))
    return jsonify({'ok': True, 'deleted': n, 'message': f'已删除 {n} 个链接'})


@gateway_admin_bp.route('/api/links/set-per-page', methods=['POST'])
def api_links_set_per_page():
    """保存「每页显示」用户偏好。"""
    try:
        val = int(request.form.get('value', '50'))
    except (ValueError, TypeError):
        return jsonify({'ok': False, 'error': '数值不合法'}), 400
    val = max(5, min(100, val))
    app_module = _app_module()
    app_module.set_user_setting(session.get('user_id'), 'links_per_page', str(val))
    return jsonify({'ok': True, 'value': val})


@gateway_admin_bp.route('/api/links/<link_id>')
def api_links_detail(link_id):
    """收集链接详情（编辑表单回显）。"""
    from admin_services import get_link_detail
    try:
        data = get_link_detail(link_id, session.get('user_id'), bool(session.get('is_admin')))
    except FileNotFoundError:
        return jsonify({'ok': False, 'message': '链接不存在'}), 404
    except PermissionError:
        return jsonify({'ok': False, 'message': '无权访问该链接'}), 403
    return jsonify({'ok': True, 'link': data})


@gateway_admin_bp.route('/api/links', methods=['POST'])
def api_links_create():
    """创建收集链接（multipart/form-data）。"""
    from admin_services import create_link
    ok, message, link_id = create_link(request.form, request.files, session.get('user_id'))
    if not ok:
        return jsonify({'ok': False, 'message': message}), 400
    return jsonify({'ok': True, 'message': message, 'link_id': link_id})


@gateway_admin_bp.route('/api/links/<link_id>', methods=['POST'])
def api_links_update(link_id):
    """编辑收集链接（multipart/form-data）。"""
    from admin_services import update_link
    ok, message = update_link(link_id, request.form, request.files,
                              session.get('user_id'), bool(session.get('is_admin')))
    if not ok:
        return jsonify({'ok': False, 'message': message}), 400
    return jsonify({'ok': True, 'message': message})


@gateway_admin_bp.route('/api/links/<link_id>/toggle', methods=['POST'])
def api_links_toggle(link_id):
    """启用/停用收集链接。"""
    from admin_services import toggle_link
    try:
        new_status = toggle_link(link_id, session.get('user_id'), bool(session.get('is_admin')))
    except FileNotFoundError:
        return jsonify({'ok': False, 'message': '链接不存在'}), 404
    except PermissionError:
        return jsonify({'ok': False, 'message': '无权操作该链接'}), 403
    return jsonify({'ok': True, 'status': new_status})


@gateway_admin_bp.route('/api/links/<link_id>/delete', methods=['POST'])
def api_links_delete(link_id):
    """删除收集链接（含所有文件与记录）。"""
    from admin_services import delete_links
    n = delete_links([link_id], session.get('user_id'), bool(session.get('is_admin')))
    if n == 0:
        return jsonify({'ok': False, 'message': '链接不存在或无权操作'}), 404
    return jsonify({'ok': True, 'message': '链接已删除'})


@gateway_admin_bp.route('/api/links/<link_id>/upload-logs')
def api_link_upload_logs(link_id):
    """收集链接的上传日志（分页，供面板内浮窗展示）。"""
    from admin_services import list_upload_logs
    try:
        data = list_upload_logs(
            session.get('user_id'), bool(session.get('is_admin')), link_id=link_id,
            page=request.args.get('page', 1),
            per_page=request.args.get('per_page', 20))
    except FileNotFoundError:
        return jsonify({'ok': False, 'message': '链接不存在'}), 404
    except PermissionError:
        return jsonify({'ok': False, 'message': '无权访问该链接'}), 403
    return jsonify({'ok': True, **data})


# ============================================================
# 用户管理（仅管理员）
# ============================================================
@gateway_admin_bp.route('/api/users')
def api_users_list():
    """用户列表（可按关键字过滤）。"""
    from admin_services import list_users
    data = list_users(request.args.get('q', ''))
    return jsonify({'ok': True, 'current_user_id': session.get('user_id'), **data})


@gateway_admin_bp.route('/api/users/create', methods=['POST'])
def api_user_create():
    """新增用户。"""
    from admin_services import create_user
    ok, message, user_id = create_user(
        request.form.get('username', ''),
        request.form.get('password', ''),
        request.form.get('confirm_password', ''),
        request.form.get('email', ''),
        request.form.get('nickname', ''),
        request.form.get('is_admin', ''),
        request.form.get('status', 'active'),
    )
    if not ok:
        return jsonify({'ok': False, 'message': message}), 400
    return jsonify({'ok': True, 'message': message, 'user_id': user_id})


@gateway_admin_bp.route('/api/users/<user_id>/toggle', methods=['POST'])
def api_user_toggle(user_id):
    """启用 / 禁用用户。"""
    from admin_services import toggle_user
    ok, message, new_status = toggle_user(user_id)
    if not ok:
        return jsonify({'ok': False, 'message': message}), 404
    return jsonify({'ok': True, 'message': message, 'status': new_status})


@gateway_admin_bp.route('/api/users/<user_id>/edit', methods=['POST'])
def api_user_edit(user_id):
    """编辑用户（用户名 / 邮箱 / 可选新密码）。"""
    from admin_services import edit_user
    ok, message = edit_user(
        user_id,
        request.form.get('new_username', ''),
        request.form.get('new_password', ''),
        request.form.get('new_email', ''),
    )
    if not ok:
        return jsonify({'ok': False, 'message': message}), 400
    # 若编辑的是当前登录用户，同步刷新会话中的用户名
    if session.get('user_id') == user_id:
        session['username'] = (request.form.get('new_username') or '').strip()
    return jsonify({'ok': True, 'message': message})


@gateway_admin_bp.route('/api/users/<user_id>/delete', methods=['POST'])
def api_user_delete(user_id):
    """删除用户。"""
    from admin_services import delete_user
    if str(user_id) == str(session.get('user_id')):
        return jsonify({'ok': False, 'message': '不能删除当前登录的账户'}), 400
    ok, message = delete_user(user_id)
    if not ok:
        return jsonify({'ok': False, 'message': message}), 400
    return jsonify({'ok': True, 'message': message})


@gateway_admin_bp.route('/api/users/<user_id>/reset-password', methods=['POST'])
def api_user_reset_password(user_id):
    """重置用户密码（返回随机新密码）。"""
    from admin_services import reset_user_password
    ok, message, new_password = reset_user_password(user_id)
    if not ok:
        return jsonify({'ok': False, 'message': message}), 404
    return jsonify({'ok': True, 'message': message, 'new_password': new_password})


# ============================================================
# 邀请码管理（仅管理员）
# ============================================================
@gateway_admin_bp.route('/api/invites')
def api_invites_list():
    """邀请码列表。"""
    from admin_services import list_invites
    data = list_invites()
    return jsonify({'ok': True, **data})


@gateway_admin_bp.route('/api/invites/generate', methods=['POST'])
def api_invites_generate():
    """生成邀请码。"""
    from admin_services import generate_invite
    ok, message, code = generate_invite(
        session.get('user_id'), request.form.get('expire_days', 7))
    if not ok:
        return jsonify({'ok': False, 'message': message}), 400
    return jsonify({'ok': True, 'message': message, 'code': code})


@gateway_admin_bp.route('/api/invites/<invite_id>/delete', methods=['POST'])
def api_invites_delete(invite_id):
    """删除邀请码。"""
    from admin_services import delete_invite
    ok, message = delete_invite(invite_id)
    if not ok:
        return jsonify({'ok': False, 'message': message}), 404
    return jsonify({'ok': True, 'message': message})


# ============================================================
# 收集设置（settings）
# 说明：overview / account / defaults 对普通用户开放（个人设置）；
#       页面品牌 / 上传路径 / 功能开关 / 邮件 / 备份恢复 仅管理员。
# ============================================================
@gateway_admin_bp.route('/api/settings')
def api_settings_overview():
    """设置面板初始数据（按角色裁剪管理项）。"""
    from admin_services import settings_overview
    # 经飞牛统一网关访问时（来源校验已通过）视为“公网可用”
    data = settings_overview(
        session.get('user_id'),
        bool(session.get('is_admin')),
        sso_need_pwd=bool(session.get('sso_need_pwd')),
        gateway_available=True,
    )
    return jsonify({'ok': True, **data})


@gateway_admin_bp.route('/api/settings/account', methods=['POST'])
def api_settings_account():
    """保存当前账号设置（用户名 / 昵称 / 邮箱 / 密码）。"""
    from admin_services import save_account
    ok, message, effects = save_account(
        request.form,
        session.get('user_id'),
        bool(session.get('is_admin')),
        sso_need_pwd=bool(session.get('sso_need_pwd')),
    )
    if not ok:
        return jsonify({'ok': False, 'message': message}), 400

    effects = effects or {}
    # 同步会话状态
    new_username = (request.form.get('new_username') or '').strip()
    if new_username:
        session['username'] = new_username
    if effects.get('nickname'):
        session['nickname'] = effects['nickname']
    if effects.get('clear_sso_need_pwd'):
        session['sso_need_pwd'] = False

    resp = {
        'ok': True,
        'message': message,
        'require_relogin': bool(effects.get('require_relogin')),
        'password_changed': bool(effects.get('password_changed')),
    }
    if effects.get('require_relogin'):
        # 密码已变更：清空会话，要求重新登录
        session.clear()
    return jsonify(resp)


@gateway_admin_bp.route('/api/settings/defaults', methods=['POST'])
def api_settings_defaults():
    """保存「默认设置」（管理员=全局，普通用户=个人覆盖）。"""
    from admin_services import save_settings
    ok, message = save_settings(
        'defaults', request.form,
        session.get('user_id'), bool(session.get('is_admin')))
    if not ok:
        return jsonify({'ok': False, 'message': message}), 400
    return jsonify({'ok': True, 'message': message})


@gateway_admin_bp.route('/api/settings/page-branding', methods=['POST'])
def api_settings_page_branding():
    """保存「页面与品牌」设置（仅管理员）。"""
    from admin_services import save_settings
    ok, message = save_settings(
        'page_branding', request.form,
        session.get('user_id'), bool(session.get('is_admin')))
    if not ok:
        return jsonify({'ok': False, 'message': message}), 400
    return jsonify({'ok': True, 'message': message})


@gateway_admin_bp.route('/api/settings/upload-path', methods=['POST'])
def api_settings_upload_path():
    """保存自定义上传路径（仅管理员）。"""
    from admin_services import save_settings
    ok, message = save_settings(
        'upload_path', request.form,
        session.get('user_id'), bool(session.get('is_admin')))
    if not ok:
        return jsonify({'ok': False, 'message': message}), 400
    return jsonify({'ok': True, 'message': message})


@gateway_admin_bp.route('/api/settings/feature-toggles', methods=['POST'])
def api_settings_feature_toggles():
    """保存功能开关（仅管理员）。"""
    from admin_services import save_settings
    ok, message = save_settings(
        'feature_toggles', request.form,
        session.get('user_id'), bool(session.get('is_admin')))
    if not ok:
        return jsonify({'ok': False, 'message': message}), 400
    return jsonify({'ok': True, 'message': message})


@gateway_admin_bp.route('/api/settings/smtp', methods=['POST'])
def api_settings_smtp():
    """保存邮件（SMTP）配置（仅管理员）。"""
    from admin_services import save_settings
    ok, message = save_settings(
        'smtp', request.form,
        session.get('user_id'), bool(session.get('is_admin')))
    if not ok:
        return jsonify({'ok': False, 'message': message}), 400
    return jsonify({'ok': True, 'message': message})


@gateway_admin_bp.route('/api/settings/test-smtp', methods=['POST'])
def api_settings_test_smtp():
    """发送 SMTP 测试邮件（仅管理员）。"""
    from admin_services import test_smtp
    ok, message = test_smtp(request.form.get('test_email', ''))
    if not ok:
        return jsonify({'ok': False, 'message': message}), 400
    return jsonify({'ok': True, 'message': message})


@gateway_admin_bp.route('/api/settings/reverse-proxy')
def api_settings_reverse_proxy():
    """反向代理运行状态（仅管理员，供轮询刷新）。"""
    from admin_services import reverse_proxy_status
    return jsonify({'ok': True, 'status': reverse_proxy_status()})


@gateway_admin_bp.route('/api/settings/backup')
def api_settings_backup():
    """下载数据库备份（仅管理员）。"""
    from admin_services import database_backup
    info = database_backup()
    if not info:
        return jsonify({'ok': False, 'message': '数据库文件不存在'}), 404
    from flask import send_file
    return send_file(info['path'], as_attachment=True,
                     download_name=info['download_name'])


@gateway_admin_bp.route('/api/settings/restore', methods=['POST'])
def api_settings_restore():
    """导入数据库备份（仅管理员）。"""
    from admin_services import restore_database
    ok, message = restore_database(request.files.get('db_file'))
    if not ok:
        return jsonify({'ok': False, 'message': message}), 400
    return jsonify({'ok': True, 'message': message})


# ============================================================
# 操作日志（审计，仅管理员）
# ============================================================
@gateway_admin_bp.route('/api/logs/activity')
def api_activity_logs():
    """操作日志分页查询（登录 / 建链 / 删链 / 上传 / 下载 / 用户 / 设置 …）。"""
    from admin_services import list_activity_logs
    data = list_activity_logs(
        page=request.args.get('page', 1),
        per_page=request.args.get('per_page', 50),
        category=request.args.get('category', ''),
        action=request.args.get('action', ''),
        q=request.args.get('q', ''),
    )
    return jsonify({'ok': True, **data})


def _app_module():
    """惰性获取 app 模块（避免循环导入）。"""
    import app as _app
    return _app
