"""
集成管理面板 —— 共享业务服务层

把原先散落在 app.py 各 /admin 页面视图中的业务逻辑，集中为「与请求无关」的
纯业务函数，供 gateway_admin_api（网关 JSON API）调用。

设计原则：
  * 不直接依赖 Flask 请求上下文（参数显式传入），便于测试与复用；
  * 数据库连接 / 配置读写等辅助函数惰性从 app 模块导入，避免循环导入；
  * 原 /admin 页面（TCP 端口访问）逻辑保持不变，互不影响。

响应统一为 Python 原生 dict/list，由 API 层负责编码为 JSON。
"""
import json
import os
import re
import secrets
import uuid
from datetime import datetime, timedelta

# 可在前端「操作」中触发预览的扩展名（与旧后台模板保持一致）
PREVIEWABLE_EXTS = {
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'heic', 'heif',
    'mp4', 'webm', 'ogg', 'mov',
    'mp3', 'wav', 'flac', 'aac', 'm4a',
    'pdf', 'txt',
    'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv',
}

IMAGE_EXTS = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'heic', 'heif'}
VIDEO_EXTS = {'mp4', 'webm', 'ogg', 'mov'}
AUDIO_EXTS = {'mp3', 'wav', 'flac', 'aac', 'm4a'}
JIT_PREVIEW_EXTS = {'pdf', 'txt'}
OFFICE_PREVIEW_EXTS = {'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'}


def _app():
    """惰性获取 app 模块（避免蓝图注册阶段的循环导入）。"""
    import app as _app_module
    return _app_module


def _db():
    return _app().get_db()


def ext_of(filename):
    name = filename or ''
    return name.rsplit('.', 1)[-1].lower() if '.' in name else ''


def preview_kind(filename):
    """返回预览类型：'image' / 'video' / 'audio' / 'other'。"""
    ext = ext_of(filename)
    if ext in VIDEO_EXTS:
        return 'video'
    if ext in AUDIO_EXTS:
        return 'audio'
    if ext in IMAGE_EXTS:
        return 'image'
    return 'other'


def is_previewable(filename):
    return ext_of(filename) in PREVIEWABLE_EXTS


# ============================================================
# 信息面板
# ============================================================
def _serialize_record(r):
    """把 upload_records 行（已 join links/users）序列化为前端友好结构。"""
    d = dict(r)
    name = d.get('original_name') or ''
    size = d.get('file_size') or 0
    display = d.get('file_size_display') or ''
    if not display:
        try:
            display = _app().format_file_size(size)
        except Exception:
            display = str(size)
    return {
        'id': d.get('id'),
        'original_name': name,
        # 相对存储名（含子目录，如 zb/x.png），供前端按目录浏览
        'stored_name': d.get('stored_name') or '',
        # 文件所在绝对目录，供「点击文件名 → 打开飞牛文件管理器」定位使用
        'stored_dir': os.path.dirname(d.get('stored_path') or '') if d.get('stored_path') else '',
        # 文件完整绝对路径：桌面端定位目录失败时，可用 openFile 打开文件本身
        'stored_path': d.get('stored_path') or '',
        'file_size': size,
        'file_size_display': display,
        'source': d.get('link_title') or d.get('link_id') or '',
        'link_id': d.get('link_id'),
        'creator': d.get('nickname') or d.get('username') or '未知用户',
        'download_count': d.get('download_count') or 0,
        'uploader_ip': d.get('uploader_ip') or '-',
        'uploaded_at': str(d.get('uploaded_at') or ''),
        'uploader_name': d.get('uploader_name') or '',
        'require_uploader': bool(d.get('require_uploader')),
        'previewable': is_previewable(name),
        'preview_kind': preview_kind(name),
        'ext': ext_of(name),
    }


def dashboard_stats(user_id, is_admin):
    """信息面板统计数据 + 最近 5 条上传记录。

    普通用户仅统计自己名下链接的数据；管理员统计全站数据。
    """
    conn = _db()
    try:
        today = datetime.now().strftime('%Y-%m-%d')
        if is_admin:
            total_links = conn.execute("SELECT COUNT(*) FROM links").fetchone()[0]
            active_links = conn.execute(
                "SELECT COUNT(*) FROM links WHERE status = 'active'").fetchone()[0]
            total_uploads = conn.execute("SELECT COUNT(*) FROM upload_records").fetchone()[0]
            today_uploads = conn.execute(
                "SELECT COUNT(*) FROM upload_records WHERE date(uploaded_at) = ?",
                (today,)).fetchone()[0]
            recent = conn.execute(
                """SELECT r.*, l.title AS link_title, l.require_uploader,
                          u.username, u.nickname
                   FROM upload_records r
                   LEFT JOIN links l ON r.link_id = l.id
                   LEFT JOIN users u ON l.user_id = u.id
                   ORDER BY r.uploaded_at DESC LIMIT 5""").fetchall()
        else:
            total_links = conn.execute(
                "SELECT COUNT(*) FROM links WHERE user_id = ?", (user_id,)).fetchone()[0]
            active_links = conn.execute(
                "SELECT COUNT(*) FROM links WHERE user_id = ? AND status = 'active'",
                (user_id,)).fetchone()[0]
            total_uploads = conn.execute(
                """SELECT COUNT(*) FROM upload_records r
                   INNER JOIN links l ON r.link_id = l.id
                   WHERE l.user_id = ?""", (user_id,)).fetchone()[0]
            today_uploads = conn.execute(
                """SELECT COUNT(*) FROM upload_records r
                   INNER JOIN links l ON r.link_id = l.id
                   WHERE l.user_id = ? AND date(r.uploaded_at) = ?""",
                (user_id, today)).fetchone()[0]
            recent = conn.execute(
                """SELECT r.*, l.title AS link_title, l.require_uploader,
                          u.username, u.nickname
                   FROM upload_records r
                   INNER JOIN links l ON r.link_id = l.id
                   LEFT JOIN users u ON l.user_id = u.id
                   WHERE l.user_id = ?
                   ORDER BY r.uploaded_at DESC LIMIT 5""", (user_id,)).fetchall()
    finally:
        conn.close()

    return {
        'stats': {
            'total_links': total_links,
            'active_links': active_links,
            'total_uploads': total_uploads,
            'today_uploads': today_uploads,
        },
        'recent': [_serialize_record(r) for r in recent],
    }


# ============================================================
# 上传记录（通用）
# ============================================================
def _owned_records(conn, record_ids, user_id, is_admin):
    """返回当前用户有权操作的记录 [{id, stored_path}]。

    管理员可操作全部记录；普通用户仅限自己名下链接的记录。
    """
    ids = [int(x) for x in record_ids]
    if not ids:
        return []
    placeholders = ','.join('?' * len(ids))
    if is_admin:
        rows = conn.execute(
            f"SELECT id, stored_path FROM upload_records WHERE id IN ({placeholders})",
            tuple(ids)).fetchall()
    else:
        rows = conn.execute(
            f"""SELECT r.id, r.stored_path FROM upload_records r
                INNER JOIN links l ON r.link_id = l.id
                WHERE r.id IN ({placeholders}) AND l.user_id = ?""",
            tuple(ids) + (user_id,)).fetchall()
    return [dict(r) for r in rows]


def delete_records(record_ids, user_id, is_admin):
    """删除若干上传记录（含磁盘文件）。返回实际删除条数。"""
    if not record_ids:
        return 0
    app = _app()
    conn = _db()
    try:
        rows = _owned_records(conn, record_ids, user_id, is_admin)
        if not rows:
            return 0
        for row in rows:
            try:
                app._safe_delete(row['stored_path'])
            except OSError:
                pass
        ids = [row['id'] for row in rows]
        ph = ','.join('?' * len(ids))
        conn.execute(f"DELETE FROM upload_records WHERE id IN ({ph})", tuple(ids))
        conn.commit()
        log_activity('delete', 'record', target=','.join(str(i) for i in ids),
                     detail='删除 ' + str(len(ids)) + ' 条文件记录', user_id=user_id)
        return len(ids)
    finally:
        conn.close()


# ============================================================
# 收集链接（links）
# ============================================================
SLUG_PATTERN = re.compile(r'^[a-zA-Z0-9][a-zA-Z0-9_-]{2,31}$')
SLUG_RESERVED = {
    'admin', 'api', 'static', 'login', 'logout', 'register', 'setup',
    'collect', 'share', 'links', 'settings', 'upload', 'download',
    'preview', 'chunk', 'verify', 'records', 'delete', 'toggle',
}

_LINK_LIST_COLS = (
    "l.id, l.user_id, l.title, l.description, l.passcode, l.passcode_plain, l.passcode_empty, "
    "l.max_files, l.max_file_size_gb, l.expires_at, l.created_at, l.updated_at, "
    "l.status, l.allow_delete, l.allow_preview_download, l.allow_download, "
    "l.share_enabled, l.share_passcode, l.share_passcode_plain, l.share_passcode_empty, "
    "l.share_expires_at, l.require_uploader, l.collect_slug, l.share_slug, "
    "u.username, u.nickname"
)


def link_form_defaults(user_id):
    """新建/编辑收集链接表单的默认值。"""
    app = _app()
    return {
        'max_files': app.get_user_setting(user_id, 'max_files', str(app.DEFAULT_MAX_FILES)),
        'max_file_size_gb': app.get_user_setting(user_id, 'max_file_size_gb', str(app.DEFAULT_MAX_FILE_SIZE_GB)),
        'attachment_max_mb': app.fmt_mb(app.get_user_setting(user_id, 'attachment_max_mb', str(app.DEFAULT_ATTACHMENT_MAX_MB))),
        'expire_days': app.get_user_setting(user_id, 'default_link_expire_days', '30'),
    }


def _link_is_expired(expires_at):
    """收集链接（或分享页）是否已过期。

    与 collect/share 页面访问时的判断口径保持一致；expires_at 为空或格式
    异常（历史遗留数据）时一律视为不过期，避免误判把有效链接显示成已停用。
    """
    if not expires_at:
        return False
    text = str(expires_at).strip()
    if not text:
        return False
    for fmt in ('%Y-%m-%dT%H:%M', '%Y-%m-%dT%H:%M:%S',
                '%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M'):
        try:
            return datetime.now() > datetime.strptime(text, fmt)
        except (ValueError, TypeError):
            continue
    return False


def _serialize_link(d):
    """把 links 查询行转换为前端友好的结构（含通行证状态标记）。"""
    app = _app()
    pp = d.get('passcode_plain')
    is_empty = d.get('passcode_empty', 0) == 1
    has_passcode = bool(pp and pp.strip())
    is_legacy = (not has_passcode) and (not is_empty)

    sp = d.get('share_passcode_plain', '')
    sp_empty = d.get('share_passcode_empty', 0) == 1
    sp_hash = d.get('share_passcode', '')
    has_share_passcode = bool(sp and sp.strip())
    is_share_legacy = (not has_share_passcode) and (not sp_empty) and bool(sp_hash)

    # 分享页通行证文本：独立 > 空通行证(空) > 回退收集页通行证
    if has_share_passcode:
        share_pass_text = sp
    elif sp_empty:
        share_pass_text = ''
    else:
        share_pass_text = pp if has_passcode else ''

    collect_slug = d.get('collect_slug') or ''
    share_slug = d.get('share_slug') or ''
    return {
        'id': d.get('id'),
        'title': d.get('title') or '',
        'description': d.get('description') or '',
        'status': d.get('status') or 'active',
        'max_files': d.get('max_files'),
        'max_file_size_gb': d.get('max_file_size_gb'),
        'expires_at': str(d.get('expires_at') or ''),
        'share_expires_at': str(d.get('share_expires_at') or ''),
        # 是否已过期：status 只反映创建者的手动启停，有效期到点后 status 仍可能
        # 是 'active'，前端据此把状态显示为「已停用」
        'expired': _link_is_expired(d.get('expires_at')),
        'share_expired': _link_is_expired(d.get('share_expires_at')),
        'created_at': str(d.get('created_at') or ''),
        'creator_name': d.get('nickname') or d.get('username') or '未知用户',
        'passcode': pp if has_passcode else '',
        'has_passcode': has_passcode,
        'is_legacy': is_legacy,
        'passcode_empty': is_empty,
        'share_passcode': share_pass_text,
        'has_share_passcode': has_share_passcode,
        'is_share_legacy': is_share_legacy,
        'share_passcode_empty': sp_empty,
        'allow_delete': 1 if d.get('allow_delete') else 0,
        'allow_preview_download': 1 if d.get('allow_preview_download') else 0,
        'allow_download': 1 if d.get('allow_download') else 0,
        'share_enabled': 1 if d.get('share_enabled') else 0,
        'require_uploader': 1 if d.get('require_uploader') else 0,
        'collect_slug': collect_slug,
        'share_slug': share_slug,
        'collect_id': collect_slug or d.get('id'),
        'share_id': share_slug or d.get('id'),
    }


def list_links(user_id, is_admin, page=1, per_page=50, creator_filter=''):
    """收集链接列表（分页 + 管理员按创建人筛选）。"""
    app = _app()
    try:
        per_page = int(per_page)
    except (ValueError, TypeError):
        per_page = 50
    per_page = max(5, min(100, per_page))
    try:
        page = int(page)
        if page < 1:
            page = 1
    except (ValueError, TypeError):
        page = 1

    conn = _db()
    try:
        creators = []
        if is_admin:
            creators = [dict(r) for r in conn.execute(
                "SELECT id, username, nickname FROM users ORDER BY nickname, username").fetchall()]

        where = ''
        params = []
        if not is_admin:
            where = 'WHERE l.user_id = ?'
            params.append(user_id)
        elif creator_filter:
            where = 'WHERE l.user_id = ?'
            params.append(creator_filter)

        total = conn.execute(f"SELECT COUNT(*) FROM links l {where}", tuple(params)).fetchone()[0]
        total_pages = max(1, (total + per_page - 1) // per_page)
        page = min(page, total_pages)
        offset = (page - 1) * per_page
        rows = conn.execute(
            f"SELECT {_LINK_LIST_COLS} FROM links l LEFT JOIN users u ON l.user_id = u.id "
            f"{where} ORDER BY l.created_at DESC LIMIT ? OFFSET ?",
            tuple(params) + (per_page, offset)).fetchall()
    finally:
        conn.close()

    return {
        'links': [_serialize_link(dict(r)) for r in rows],
        'page': page,
        'per_page': per_page,
        'total': total,
        'total_pages': total_pages,
        'creators': [{'id': c['id'], 'name': c.get('nickname') or c.get('username') or c['id']} for c in creators],
        'is_admin': bool(is_admin),
        'public_url': app._resolve_public_url(user_id) or '',
    }


def get_link_detail(link_id, user_id, is_admin):
    """获取收集链接详情（用于编辑表单回显）。"""
    app = _app()
    conn = _db()
    try:
        row = conn.execute("SELECT * FROM links WHERE id = ?", (link_id,)).fetchone()
    finally:
        conn.close()
    if not row:
        raise FileNotFoundError('链接不存在')
    d = dict(row)
    if not is_admin and d.get('user_id') != user_id:
        raise PermissionError('无权编辑该链接')

    link = _serialize_link(d)
    link['description'] = d.get('description') or ''
    link['share_description'] = d.get('share_description') or ''
    link['collect_enabled'] = 1 if d.get('collect_enabled', 1) else 0
    link['attachment_name'] = d.get('attachment_name') or ''
    link['attachment_size'] = d.get('attachment_size') or 0

    # 收集页有效期回显
    if d.get('expires_at'):
        val, unit, disp = app._format_expire_for_edit(d['expires_at'])
        link['expire_days_value'], link['expire_unit'], link['expires_display'] = val, unit, disp
        link['has_expiry'] = True
    else:
        link['expire_days_value'], link['expire_unit'], link['expires_display'] = '', '天', '永不过期'
        link['has_expiry'] = False

    # 分享页有效期回显
    if d.get('share_expires_at'):
        val, unit, disp = app._format_expire_for_edit(d['share_expires_at'])
        link['share_expire_days_value'], link['share_expire_unit'], link['share_expires_display'] = val, unit, disp
    else:
        link['share_expire_days_value'], link['share_expire_unit'], link['share_expires_display'] = '', '天', '永不过期'

    link['defaults'] = link_form_defaults(user_id)
    return link


def _validate_slug(field_name, slug_val, exclude_id=None):
    app = _app()
    if not slug_val:
        return None
    if slug_val.lower() in SLUG_RESERVED:
        return f'{field_name}自定义链接"{slug_val}"为系统保留字，请更换'
    if not SLUG_PATTERN.match(slug_val):
        return f'{field_name}自定义链接只能使用3-32位字母数字及-_，且必须以字母或数字开头'
    if not app._check_slug_unique(slug_val, exclude_id=exclude_id):
        return f'{field_name}自定义链接"{slug_val}"已被占用，请更换'
    return None


def _parse_limits(form):
    """解析并校验 最大文件数量 / 单文件上限。"""
    raw_mf = form.get('max_files', _app().DEFAULT_MAX_FILES)
    raw_gb = form.get('max_file_size_gb', str(_app().DEFAULT_MAX_FILE_SIZE_GB))
    try:
        _mf = float(raw_mf)
        if _mf != int(_mf):
            raise ValueError('最大文件数量必须为整数')
        max_files = int(_mf)
        max_file_size_gb = round(float(raw_gb), 6)
    except (ValueError, TypeError):
        raise ValueError('数字格式错误')
    if max_files < 0:
        raise ValueError('最大文件数量不能为负数')
    if max_file_size_gb < 0.01 or max_file_size_gb > 64:
        raise ValueError('单文件上限必须在 0.01-64 GB 之间')
    return max_files, max_file_size_gb


def create_link(form, files, user_id):
    """创建收集链接。返回 (ok, message, link_id)。"""
    app = _app()
    title = (form.get('title') or '').strip()
    if not title:
        return False, '标题不能为空', None
    try:
        description = app.sanitize_html(form.get('description', ''))
    except Exception:
        description = form.get('description', '')

    passcode = (form.get('passcode') or '').strip()
    passcode_mode = form.get('passcode_mode', 'set')
    if passcode_mode == 'set' and not passcode:
        return False, '请输入通行证密码', None
    empty_passcode = 1 if form.get('empty_passcode') == '1' else 0
    if empty_passcode:
        passcode = ''

    try:
        max_files, max_file_size_gb = _parse_limits(form)
    except ValueError as e:
        return False, str(e), None

    max_expire_days = int(app.get_user_setting(user_id, 'default_link_expire_days', '30'))
    expire_days_val = (form.get('expire_days') or '').strip()
    expire_unit = (form.get('expire_unit') or '天').strip()
    expires_at, err = app._parse_expire_input(expire_days_val, expire_unit, max_expire_days)
    if err:
        return False, err, None

    share_expire_days = (form.get('share_expire_days') or '').strip()
    share_expire_unit = (form.get('share_expire_unit') or '天').strip()
    share_expires_at, _ = app._parse_expire_input(share_expire_days, share_expire_unit, max_expire_days)

    collect_slug = (form.get('collect_slug') or '').strip()
    share_slug = (form.get('share_slug') or '').strip()
    for name, val in (('收集页', collect_slug), ('分享页', share_slug)):
        msg = _validate_slug(name, val)
        if msg:
            return False, msg, None

    link_id = app.generate_link_id()
    folder_name = re.sub(r'[<>:"/\\|?*]', '_', title.strip()).strip().lstrip('.')
    if not folder_name:
        folder_name = link_id
    use_root_folder = 1 if app.get_setting('root_folder_enabled', '0') == '1' else 0
    user_folder = app.get_user_folder(user_id)
    check_base = app.UPLOAD_BASE if use_root_folder else user_folder
    if check_base:
        base_name = folder_name
        counter = 1
        while os.path.exists(os.path.join(check_base, folder_name)):
            counter += 1
            folder_name = f"{base_name}_{counter}"

    allow_delete = 1 if form.get('allow_delete') == '1' else 0
    allow_preview_download = 1 if form.get('allow_preview_download') == '1' else 0
    allow_download = 1 if form.get('allow_download') == '1' else 0

    if passcode:
        passcode_hash = app.generate_password_hash(passcode)
        passcode_plain = passcode
    else:
        passcode_hash = app.generate_password_hash('')
        passcode_plain = ''

    share_enabled = 1 if form.get('share_enabled') == '1' else 0
    share_passcode_raw = (form.get('share_passcode') or '').strip()
    share_passcode_empty = 1 if form.get('share_passcode_empty') == '1' else 0
    if share_passcode_raw and not share_passcode_empty:
        share_passcode_hash = app.generate_password_hash(share_passcode_raw)
        share_passcode_plain = share_passcode_raw
    else:
        share_passcode_hash = ''
        share_passcode_plain = ''

    try:
        share_description = app.sanitize_html(form.get('share_description', ''))
    except Exception:
        share_description = form.get('share_description', '')
    collect_enabled = 0 if form.get('collect_disabled') == '1' else 1
    require_uploader = 1 if form.get('require_uploader') == '1' else 0

    collect_slug = collect_slug or None
    share_slug = share_slug or None

    conn = _db()
    try:
        conn.execute(
            """INSERT INTO links (id, user_id, title, description, passcode, passcode_plain,
               max_file_size_gb, max_files, expires_at, allow_delete, allow_preview_download, allow_download, passcode_empty,
               share_enabled, share_passcode, share_passcode_plain, share_passcode_empty,
               share_description, share_expires_at, collect_enabled, require_uploader,
               folder_name, collect_slug, share_slug, use_root_folder)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (link_id, user_id, title, description, passcode_hash, passcode_plain,
             max_file_size_gb, max_files, expires_at or None, allow_delete, allow_preview_download,
             allow_download, empty_passcode,
             share_enabled, share_passcode_hash, share_passcode_plain, share_passcode_empty,
             share_description, share_expires_at, collect_enabled, require_uploader,
             folder_name, collect_slug, share_slug, use_root_folder))
        conn.commit()
    finally:
        conn.close()

    # 侧效应：创建目录 / 保存附件（失败不影响链接创建）
    try:
        uf = app.get_user_folder(user_id)
        if uf and not os.path.exists(uf):
            os.makedirs(uf, exist_ok=True)
        try:
            app.create_upload_dir(link_id)
        except Exception:
            pass
        try:
            att = files.get('attachment') if files else None
            if att and att.filename and att.filename.strip():
                app._save_link_attachment(link_id, att, user_id)
        except Exception:
            pass
    except Exception:
        pass

    display_slug = collect_slug or link_id
    log_activity('create', 'link', target=link_id,
                 detail='创建收集链接「' + (title or display_slug) + '」', user_id=user_id)
    return True, f'收集链接已创建：/collect/{display_slug}', link_id


def update_link(link_id, form, files, user_id, is_admin):
    """编辑收集链接。返回 (ok, message)。"""
    app = _app()
    conn = _db()
    try:
        row = conn.execute("SELECT * FROM links WHERE id = ?", (link_id,)).fetchone()
        if not row:
            return False, '链接不存在'
        if not is_admin and row['user_id'] != user_id:
            return False, '无权编辑该链接'

        title = (form.get('title') or '').strip()
        if not title:
            return False, '标题不能为空'
        try:
            description = app.sanitize_html(form.get('description', ''))
        except Exception:
            description = form.get('description', '')

        passcode = (form.get('passcode') or '').strip()
        empty_passcode = 1 if form.get('empty_passcode') == '1' else 0
        passcode_mode = form.get('passcode_mode', 'keep')
        if passcode_mode == 'set' and not passcode:
            return False, '请输入通行证密码'

        try:
            max_files, max_file_size_gb = _parse_limits(form)
        except ValueError as e:
            return False, str(e)

        max_expire_days = int(app.get_user_setting(user_id, 'default_link_expire_days', '30'))
        clear_expiry = form.get('clear_expiry') == '1'
        if clear_expiry:
            expires_at = None
            share_expires_at = None
        else:
            expire_days_val = (form.get('expire_days') or '').strip()
            expire_unit = (form.get('expire_unit') or '天').strip()
            expires_at, err = app._parse_expire_input(expire_days_val, expire_unit, max_expire_days)
            if err:
                return False, err
            share_expire_days_edit = (form.get('share_expire_days') or '').strip()
            share_expire_unit = (form.get('share_expire_unit') or '天').strip()
            share_expires_at, share_err = app._parse_expire_input(share_expire_days_edit, share_expire_unit, max_expire_days)
            if share_err:
                return False, share_err

        allow_delete = 1 if form.get('allow_delete') == '1' else 0
        allow_preview_download = 1 if form.get('allow_preview_download') == '1' else 0
        allow_download = 1 if form.get('allow_download') == '1' else 0

        share_enabled = 1 if form.get('share_enabled') == '1' else 0
        share_passcode_mode = form.get('share_passcode_mode', 'keep')
        share_passcode_raw = (form.get('share_passcode') or '').strip()
        share_passcode_empty = 1 if form.get('share_passcode_empty') == '1' else 0
        share_changed = bool(share_passcode_raw) or bool(share_passcode_empty) or (share_passcode_mode == 'inherit')
        if share_passcode_empty:
            share_passcode_hash = ''
            share_passcode_plain = ''
            share_passcode_empty = 1
        elif share_passcode_raw:
            share_passcode_hash = app.generate_password_hash(share_passcode_raw)
            share_passcode_plain = share_passcode_raw
            share_passcode_empty = 0
        elif share_passcode_mode == 'inherit':
            share_passcode_hash = ''
            share_passcode_plain = ''
            share_passcode_empty = 0
        else:
            share_passcode_hash = ''
            share_passcode_plain = ''

        try:
            share_description = app.sanitize_html(form.get('share_description', ''))
        except Exception:
            share_description = form.get('share_description', '')
        collect_enabled = 0 if form.get('collect_disabled') == '1' else 1
        require_uploader = 1 if form.get('require_uploader') == '1' else 0

        collect_slug = (form.get('collect_slug') or '').strip() or (row['collect_slug'] or '')
        share_slug = (form.get('share_slug') or '').strip() or (row['share_slug'] or '')
        # 编辑时 slug 一般不可改，仅在原值为空时才校验新值
        if not row['collect_slug'] and collect_slug:
            msg = _validate_slug('收集页', collect_slug, exclude_id=link_id)
            if msg:
                return False, msg
        if not row['share_slug'] and share_slug:
            msg = _validate_slug('分享页', share_slug, exclude_id=link_id)
            if msg:
                return False, msg
        collect_slug = collect_slug or None
        share_slug = share_slug or None

        if empty_passcode:
            passcode_hash = app.generate_password_hash('')
            passcode_plain = ''
            _update_link_row(conn, link_id, title, description, passcode_hash, passcode_plain,
                             max_file_size_gb, max_files, expires_at, allow_delete, allow_preview_download,
                             allow_download, 1,
                             share_enabled, share_passcode_hash, share_passcode_plain, share_passcode_empty,
                             share_description, share_expires_at, collect_enabled, require_uploader,
                             collect_slug, share_slug, share_changed)
        elif passcode:
            passcode_hash = app.generate_password_hash(passcode)
            passcode_plain = passcode
            _update_link_row(conn, link_id, title, description, passcode_hash, passcode_plain,
                             max_file_size_gb, max_files, expires_at, allow_delete, allow_preview_download,
                             allow_download, 0,
                             share_enabled, share_passcode_hash, share_passcode_plain, share_passcode_empty,
                             share_description, share_expires_at, collect_enabled, require_uploader,
                             collect_slug, share_slug, share_changed)
        else:
            # 保持通行证不变：仅更新其他字段
            _update_link_row_keep_passcode(conn, link_id, title, description,
                                           max_file_size_gb, max_files, expires_at, allow_delete,
                                           allow_preview_download, allow_download,
                                           share_enabled, share_passcode_hash, share_passcode_plain, share_passcode_empty,
                                           share_description, share_expires_at, collect_enabled, require_uploader,
                                           collect_slug, share_slug, share_changed)

        # 附件处理
        remove_attachment = form.get('remove_attachment') == '1'
        att_file = files.get('attachment') if files else None
        if remove_attachment:
            old = conn.execute("SELECT attachment_path FROM links WHERE id=?", (link_id,)).fetchone()
            if old and old['attachment_path']:
                app._safe_delete(old['attachment_path'])
            conn.execute("UPDATE links SET attachment_name='', attachment_path='', attachment_size=0 WHERE id=?", (link_id,))
        elif att_file and att_file.filename and att_file.filename.strip():
            att_file.seek(0, 2)
            att_size = att_file.tell()
            att_file.seek(0)
            max_attach = app.get_attachment_max_size(user_id)
            if att_size > max_attach:
                return False, f'附件大小不能超过 {app.format_file_size(max_attach)}'
            old = conn.execute("SELECT attachment_path FROM links WHERE id=?", (link_id,)).fetchone()
            if old and old['attachment_path']:
                app._safe_delete(old['attachment_path'])
            try:
                upload_dir = app.create_upload_dir(link_id, '')
                attach_dir = os.path.join(upload_dir, '_attachment')
                os.makedirs(attach_dir, mode=0o755, exist_ok=True)
                ext = os.path.splitext(att_file.filename)[1]
                safe_name = re.sub(r'[^\w.\-]', '_', att_file.filename) or ('attachment' + ext)
                stored_path = os.path.join(attach_dir, safe_name)
                att_file.save(stored_path)
                conn.execute(
                    "UPDATE links SET attachment_name=?, attachment_path=?, attachment_size=? WHERE id=?",
                    (att_file.filename, stored_path, att_size, link_id))
            except Exception:
                pass

        conn.commit()
    finally:
        conn.close()
    log_activity('update', 'link', target=link_id,
                 detail='编辑收集链接「' + (title or link_id) + '」', user_id=user_id)
    return True, '收集已更新'


def _update_link_row(conn, link_id, title, description, passcode_hash, passcode_plain,
                     max_file_size_gb, max_files, expires_at, allow_delete, allow_preview_download,
                     allow_download, passcode_empty,
                     share_enabled, share_passcode_hash, share_passcode_plain, share_passcode_empty,
                     share_description, share_expires_at, collect_enabled, require_uploader,
                     collect_slug, share_slug, share_changed):
    """更新链接（通行证有变更时）。"""
    base = ("title=?, description=?, passcode=?, passcode_plain=?, "
            "max_file_size_gb=?, max_files=?, expires_at=?, allow_delete=?, "
            "allow_preview_download=?, allow_download=?, passcode_empty=?")
    base_params = [title, description, passcode_hash, passcode_plain,
                   max_file_size_gb, max_files, expires_at or None, allow_delete,
                   allow_preview_download, allow_download, passcode_empty]
    if share_changed:
        sql = (f"UPDATE links SET {base}, share_enabled=?, share_passcode=?, share_passcode_plain=?, "
               "share_passcode_empty=?, share_description=?, share_expires_at=?, collect_enabled=?, "
               "require_uploader=?, collect_slug=?, share_slug=?, updated_at=CURRENT_TIMESTAMP WHERE id=?")
        params = base_params + [share_enabled, share_passcode_hash, share_passcode_plain, share_passcode_empty,
                                share_description, share_expires_at, collect_enabled, require_uploader,
                                collect_slug, share_slug, link_id]
    else:
        sql = (f"UPDATE links SET {base}, share_enabled=?, share_description=?, share_expires_at=?, "
               "collect_enabled=?, require_uploader=?, collect_slug=?, share_slug=?, "
               "updated_at=CURRENT_TIMESTAMP WHERE id=?")
        params = base_params + [share_enabled, share_description, share_expires_at, collect_enabled,
                                require_uploader, collect_slug, share_slug, link_id]
    conn.execute(sql, params)


def _update_link_row_keep_passcode(conn, link_id, title, description,
                                   max_file_size_gb, max_files, expires_at, allow_delete,
                                   allow_preview_download, allow_download,
                                   share_enabled, share_passcode_hash, share_passcode_plain, share_passcode_empty,
                                   share_description, share_expires_at, collect_enabled, require_uploader,
                                   collect_slug, share_slug, share_changed):
    """更新链接（通行证保持不变：不写 passcode 列）。"""
    base = ("title=?, description=?, max_file_size_gb=?, max_files=?, expires_at=?, "
            "allow_delete=?, allow_preview_download=?, allow_download=?")
    base_params = [title, description, max_file_size_gb, max_files, expires_at or None,
                   allow_delete, allow_preview_download, allow_download]
    if share_changed:
        sql = (f"UPDATE links SET {base}, share_enabled=?, share_passcode=?, share_passcode_plain=?, "
               "share_passcode_empty=?, share_description=?, share_expires_at=?, collect_enabled=?, "
               "require_uploader=?, collect_slug=?, share_slug=?, updated_at=CURRENT_TIMESTAMP WHERE id=?")
        params = base_params + [share_enabled, share_passcode_hash, share_passcode_plain, share_passcode_empty,
                                share_description, share_expires_at, collect_enabled, require_uploader,
                                collect_slug, share_slug, link_id]
    else:
        sql = (f"UPDATE links SET {base}, share_enabled=?, share_description=?, share_expires_at=?, "
               "collect_enabled=?, require_uploader=?, collect_slug=?, share_slug=?, "
               "updated_at=CURRENT_TIMESTAMP WHERE id=?")
        params = base_params + [share_enabled, share_description, share_expires_at, collect_enabled,
                                require_uploader, collect_slug, share_slug, link_id]
    conn.execute(sql, params)


def toggle_link(link_id, user_id, is_admin):
    """启用/停用链接。返回新的状态字符串。"""
    conn = _db()
    try:
        row = conn.execute("SELECT status, user_id, title FROM links WHERE id = ?", (link_id,)).fetchone()
        if not row:
            raise FileNotFoundError('链接不存在')
        if not is_admin and row['user_id'] != user_id:
            raise PermissionError('无权操作该链接')
        new_status = 'inactive' if row['status'] == 'active' else 'active'
        conn.execute("UPDATE links SET status = ? WHERE id = ?", (new_status, link_id))
        conn.commit()
        log_activity('toggle', 'link', target=link_id,
                     detail='收集链接「' + (row['title'] or link_id) + '」'
                            + ('已启用' if new_status == 'active' else '已停用'),
                     user_id=user_id)
        return new_status
    finally:
        conn.close()


def delete_links(link_ids, user_id, is_admin):
    """删除若干链接及其所有文件/记录。返回实际删除的链接数。"""
    app = _app()
    conn = _db()
    deleted = 0
    try:
        for link_id in link_ids:
            row = conn.execute("SELECT id, user_id FROM links WHERE id = ?", (link_id,)).fetchone()
            if not row:
                continue
            if not is_admin and row['user_id'] != user_id:
                continue

            records = conn.execute(
                "SELECT id, stored_path FROM upload_records WHERE link_id = ?", (link_id,)).fetchall()
            for r in records:
                if r['stored_path']:
                    try:
                        app._safe_delete(r['stored_path'])
                    except Exception:
                        pass
            try:
                base_dir = app.create_upload_dir(link_id, '')
            except Exception:
                base_dir = None

            record_ids = [r['id'] for r in records]
            conn.execute("PRAGMA foreign_keys = OFF")
            if record_ids:
                ph = ','.join('?' * len(record_ids))
                conn.execute(f"DELETE FROM download_logs WHERE record_id IN ({ph})", record_ids)
            conn.execute("DELETE FROM upload_records WHERE link_id = ?", (link_id,))
            conn.execute("DELETE FROM upload_logs WHERE link_id = ?", (link_id,))
            conn.execute("DELETE FROM chunk_uploads WHERE link_id = ?", (link_id,))
            conn.execute("DELETE FROM links WHERE id = ?", (link_id,))
            conn.execute("PRAGMA foreign_keys = ON")
            conn.commit()

            if base_dir and base_dir != app.UPLOAD_BASE:
                try:
                    app._safe_delete_dir(base_dir)
                except Exception:
                    pass
            deleted += 1
        if deleted:
            log_activity('delete', 'link', target=','.join(str(x) for x in link_ids),
                         detail='删除 ' + str(deleted) + ' 个收集链接', user_id=user_id)
        return deleted
    finally:
        conn.close()


# ============================================================
# 上传记录（列表）
# ============================================================
def list_records(user_id, is_admin, page=1, per_page=None, link_filter='', dir_path=''):
    """上传记录列表（分页 + 按链接筛选 + 目录视图）。

    查询逻辑与旧 /admin/records 保持一致：管理员可见全站，普通用户仅见
    自己名下链接的记录；返回记录列表、分页信息及「链接」筛选下拉选项。
    per_page 未提供时沿用该用户保存的「每页显示」偏好。

    dir_path 为当前浏览的目录（相对上传目录，'' 表示根目录）：返回值中的
    records 只包含「直接位于该目录」的文件，folders 为子文件夹聚合，
    breadcrumb 为面包屑。
    """
    app = _app()
    if per_page in (None, ''):
        try:
            per_page = app.get_user_setting(user_id, 'records_per_page', '50')
        except Exception:
            per_page = 50
    try:
        per_page = int(per_page)
    except (ValueError, TypeError):
        per_page = 50
    per_page = max(5, min(200, per_page))
    try:
        page = int(page)
        if page < 1:
            page = 1
    except (ValueError, TypeError):
        page = 1

    link_filter = (link_filter or '').strip()
    conn = _db()
    try:
        rec_cols = ("r.id, r.original_name, r.file_size, r.file_size_display, r.download_count, "
                    "r.uploader_ip, r.uploaded_at, r.link_id, r.stored_name, r.stored_path, r.uploader_name")

        if is_admin:
            if link_filter:
                where = "WHERE r.link_id = ?"
                count_params = (link_filter,)
                data_params = (link_filter, per_page, (page - 1) * per_page)
            else:
                where = ""
                count_params = ()
                data_params = (per_page, (page - 1) * per_page)
        else:
            if link_filter:
                where = ("WHERE r.link_id IN (SELECT id FROM links l2 WHERE l2.id = ? AND l2.user_id = ?)")
                count_params = (link_filter, user_id)
                data_params = (link_filter, user_id, per_page, (page - 1) * per_page)
            else:
                where = "WHERE r.link_id IN (SELECT id FROM links l2 WHERE l2.user_id = ?)"
                count_params = (user_id,)
                data_params = (user_id, per_page, (page - 1) * per_page)

        # 目录视图：先聚合当前目录的子文件夹，再把查询限定为「直接位于该目录的文件」
        from record_dirs import (normalize_dir, direct_file_condition, combine_where,
                                 query_dir_view, breadcrumb)
        dir_path = normalize_dir(dir_path)
        folders, _direct_count = query_dir_view(conn, where, count_params, dir_path)
        for _f in folders:
            _f['size_display'] = app.format_file_size(_f['size'])
        dcond, dparams = direct_file_condition(dir_path)
        where = combine_where(where, dcond)
        count_params = tuple(count_params) + tuple(dparams)

        count = conn.execute(
            f"SELECT COUNT(*) FROM upload_records r {where}", count_params).fetchone()[0]
        total_pages = max(1, (count + per_page - 1) // per_page)
        page = min(page, total_pages)

        data_sql = f"""SELECT {rec_cols},
                       (SELECT l.title FROM links l WHERE l.id = r.link_id) as link_title,
                       (SELECT l.require_uploader FROM links l WHERE l.id = r.link_id) as require_uploader,
                       COALESCE(
                           (SELECT u.nickname FROM links l JOIN users u ON l.user_id = u.id WHERE l.id = r.link_id),
                           (SELECT u.username FROM links l JOIN users u ON l.user_id = u.id WHERE l.id = r.link_id)
                       ) as nickname
                       FROM upload_records r {where}
                       ORDER BY r.uploaded_at DESC
                       LIMIT ? OFFSET ?"""
        records = conn.execute(data_sql, count_params + (per_page, (page - 1) * per_page)).fetchall()

        if is_admin:
            links = conn.execute("SELECT id, title FROM links ORDER BY created_at DESC").fetchall()
        else:
            links = conn.execute(
                "SELECT id, title FROM links WHERE user_id = ? ORDER BY created_at DESC",
                (user_id,)).fetchall()
    finally:
        conn.close()

    return {
        'records': [_serialize_record(r) for r in records],
        'page': page,
        'per_page': per_page,
        'total': count,
        'total_pages': total_pages,
        'link_filter': link_filter,
        'links': [{'id': r['id'], 'title': r['title'] or r['id']} for r in links],
        'default_per_page': app.get_user_setting(user_id, 'records_per_page', '50'),
        'dir': dir_path,
        'folders': folders,
        'breadcrumb': breadcrumb(dir_path),
    }


# ============================================================
# 上传 / 下载日志（记录详情内嵌展示，替代旧 /admin 独立页面）
# ============================================================
def _paginate(page, per_page, default_per_page=20, lo=5, hi=200):
    """规整分页参数，返回 (page, per_page)。"""
    try:
        page = int(page)
        if page < 1:
            page = 1
    except (ValueError, TypeError):
        page = 1
    try:
        per_page = int(per_page)
    except (ValueError, TypeError):
        per_page = default_per_page
    per_page = max(lo, min(hi, per_page))
    return page, per_page


def _owned_record(conn, record_id, user_id, is_admin):
    """返回当前用户有权访问的记录行（id/original_name/link_id），否则 None。"""
    if is_admin:
        return conn.execute(
            "SELECT id, original_name, link_id FROM upload_records WHERE id = ?",
            (record_id,)).fetchone()
    return conn.execute(
        """SELECT r.id, r.original_name, r.link_id
           FROM upload_records r
           INNER JOIN links l ON r.link_id = l.id
           WHERE r.id = ? AND l.user_id = ?""",
        (record_id, user_id)).fetchone()


def _owned_link(conn, link_id, user_id, is_admin):
    """返回当前用户有权访问的链接行（id/title/require_uploader），否则 None。"""
    if is_admin:
        return conn.execute(
            "SELECT id, title, require_uploader FROM links WHERE id = ?",
            (link_id,)).fetchone()
    return conn.execute(
        "SELECT id, title, require_uploader FROM links WHERE id = ? AND user_id = ?",
        (link_id, user_id)).fetchone()


def _record_exists(conn, record_id):
    try:
        return conn.execute(
            "SELECT 1 FROM upload_records WHERE id = ?", (int(record_id),)).fetchone() is not None
    except (ValueError, TypeError):
        return False


def _link_exists(conn, link_id):
    return conn.execute("SELECT 1 FROM links WHERE id = ?", (link_id,)).fetchone() is not None


DOWNLOAD_SOURCE_LABELS = {
    'admin': '后台管理',
    'share': '分享页',
    'collect': '收集页',
}

UPLOAD_EVENT_LABELS = {
    'chunk_init': '分片初始化',
    'chunk_merge': '分片合并',
    'upload_complete': '上传完成',
    'tus_create': '创建会话',
    'tus_upload': '断点续传完成',
}


def _summarize_upload_detail(details):
    """把 upload_logs.details（JSON 字符串）整理为一行可读摘要。"""
    raw = details or ''
    try:
        data = json.loads(raw)
    except (ValueError, TypeError):
        data = None
    if isinstance(data, dict):
        parts = []
        if data.get('name'):
            parts.append(str(data.get('name')))
        size = data.get('size')
        if size is not None:
            try:
                parts.append(_app().format_file_size(int(size)))
            except Exception:
                parts.append(str(size))
        if data.get('chunks'):
            parts.append(str(data.get('chunks')) + ' 片')
        if data.get('status'):
            parts.append('[' + str(data.get('status')) + ']')
        if parts:
            return ' · '.join(parts)
    return raw


def list_download_logs(record_id, user_id, is_admin, page=1, per_page=20):
    """文件下载日志（分页）。

    无权限抛 PermissionError，记录不存在抛 FileNotFoundError。
    """
    page, per_page = _paginate(page, per_page, 20)
    conn = _db()
    try:
        record = _owned_record(conn, record_id, user_id, is_admin)
        if not record:
            if _record_exists(conn, record_id):
                raise PermissionError('无权访问该文件')
            raise FileNotFoundError('记录不存在')
        total = conn.execute(
            "SELECT COUNT(*) FROM download_logs WHERE record_id = ?", (record_id,)).fetchone()[0]
        total_pages = max(1, (total + per_page - 1) // per_page)
        if page > total_pages:
            page = total_pages
        rows = conn.execute(
            """SELECT * FROM download_logs WHERE record_id = ?
               ORDER BY id DESC LIMIT ? OFFSET ?""",
            (record_id, per_page, (page - 1) * per_page)).fetchall()
        record_name = dict(record).get('original_name') or ''
    finally:
        conn.close()

    logs = []
    for r in rows:
        d = dict(r)
        src = d.get('source') or ''
        logs.append({
            'id': d.get('id'),
            'time': str(d.get('downloaded_at') or '-'),
            'source': src,
            'source_label': DOWNLOAD_SOURCE_LABELS.get(src, src or '-'),
            'ip': d.get('downloader_ip') or '-',
            'user_agent': d.get('user_agent') or '-',
        })
    return {
        'logs': logs,
        'page': page,
        'per_page': per_page,
        'total': total,
        'total_pages': total_pages,
        'record_name': record_name,
    }


def list_upload_logs(user_id, is_admin, link_id=None, record_id=None, page=1, per_page=20):
    """上传日志（按链接或按文件，分页）。

    无权限抛 PermissionError，目标不存在抛 FileNotFoundError。
    """
    page, per_page = _paginate(page, per_page, 20)
    conn = _db()
    try:
        if record_id is not None:
            record = _owned_record(conn, record_id, user_id, is_admin)
            if not record:
                if _record_exists(conn, record_id):
                    raise PermissionError('无权访问该文件')
                raise FileNotFoundError('记录不存在')
            rd = dict(record)
            link_id = rd.get('link_id')
            label = rd.get('original_name') or ''
            where = 'record_id = ?'
            where_params = (record_id,)
            require_uploader = False
            if link_id:
                lrow = conn.execute(
                    "SELECT require_uploader FROM links WHERE id = ?", (link_id,)).fetchone()
                if lrow:
                    require_uploader = bool(lrow['require_uploader'])
        else:
            link = _owned_link(conn, link_id, user_id, is_admin)
            if not link:
                if _link_exists(conn, link_id):
                    raise PermissionError('无权访问该链接')
                raise FileNotFoundError('链接不存在')
            link = dict(link)
            label = link.get('title') or ''
            require_uploader = bool(link.get('require_uploader'))
            where = 'link_id = ?'
            where_params = (link_id,)

        total = conn.execute(
            "SELECT COUNT(*) FROM upload_logs WHERE " + where, where_params).fetchone()[0]
        total_pages = max(1, (total + per_page - 1) // per_page)
        if page > total_pages:
            page = total_pages
        rows = conn.execute(
            "SELECT * FROM upload_logs WHERE " + where +
            " ORDER BY id DESC LIMIT ? OFFSET ?",
            where_params + (per_page, (page - 1) * per_page)).fetchall()
    finally:
        conn.close()

    logs = []
    for r in rows:
        d = dict(r)
        ev = d.get('event') or ''
        logs.append({
            'id': d.get('id'),
            'time': str(d.get('event_time') or '-'),
            'event': ev,
            'event_label': UPLOAD_EVENT_LABELS.get(ev, ev or '-'),
            'detail': _summarize_upload_detail(d.get('details')),
            'uploader_name': d.get('uploader_name') or '',
            'ip': d.get('uploader_ip') or '-',
            'success': 1 if d.get('success') else 0,
        })
    return {
        'logs': logs,
        'page': page,
        'per_page': per_page,
        'total': total,
        'total_pages': total_pages,
        'require_uploader': require_uploader,
        'label': label,
    }


# ============================================================
# 用户管理
# ============================================================
def _clean_nickname(nickname):
    nickname = (nickname or '').strip()
    if not nickname:
        return ''
    try:
        import bleach
        return bleach.clean(nickname)
    except Exception:
        return nickname


def _serialize_user(row):
    d = dict(row)
    return {
        'id': d.get('id'),
        'username': d.get('username') or '',
        'email': d.get('email') or '',
        'nickname': d.get('nickname') or '',
        'is_admin': 1 if d.get('is_admin') else 0,
        'status': d.get('status') or 'active',
        'created_at': d.get('created_at') or '',
        'last_login_at': d.get('last_login_at') or '',
        'sso_need_pwd': 1 if d.get('sso_need_pwd') else 0,
    }


def list_users(search=''):
    """用户列表（含链接数 / 记录数统计，可按关键字过滤）。"""
    conn = _db()
    try:
        rows = conn.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
        try:
            link_counts = {r['user_id']: r['c'] for r in conn.execute(
                "SELECT user_id, COUNT(*) AS c FROM links GROUP BY user_id").fetchall()}
        except Exception:
            link_counts = {}
        try:
            rec_counts = {r['user_id']: r['c'] for r in conn.execute(
                "SELECT user_id, COUNT(*) AS c FROM upload_records GROUP BY user_id").fetchall()}
        except Exception:
            rec_counts = {}
    finally:
        conn.close()

    q = (search or '').strip().lower()
    users = []
    for r in rows:
        u = _serialize_user(r)
        u['link_count'] = link_counts.get(u['id'], 0)
        u['record_count'] = rec_counts.get(u['id'], 0)
        if q and q not in (u['username'] or '').lower() \
                and q not in (u['email'] or '').lower() \
                and q not in (u['nickname'] or '').lower():
            continue
        users.append(u)

    # 统计「可用」管理员（is_admin 且 status=active），用于判定「最后一个管理员」。
    # 只数 is_admin 会把已禁用的管理员也算进去，导致仅剩 1 个可用管理员时
    # 仍可把它禁用/删除，出现「后台无人可管理」的死锁。
    admin_count = sum(
        1 for u in users if u['is_admin'] and (u['status'] or 'active') == 'active')
    return {'users': users, 'total': len(users), 'admin_count': admin_count}


def create_user(username, password, confirm_password, email, nickname, is_admin, status):
    """新增用户。返回 (ok, message, user_id)。"""
    username = (username or '').strip()
    email = (email or '').strip().lower()
    nickname = _clean_nickname(nickname)
    status = status if status in ('active', 'inactive') else 'active'
    is_admin = 1 if is_admin in (1, '1', True, 'true', 'on') else 0

    if not username or len(username) < 3 or len(username) > 20:
        return False, '用户名必须在3-20个字符之间', None
    if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
        return False, '用户名需由3-20个字母、数字或下划线组成', None
    if not email or '@' not in email:
        return False, '请输入有效的邮箱地址', None
    if len(password or '') < 8:
        return False, '密码长度至少需要8位', None
    if not re.search(r'[a-zA-Z]', password) or not re.search(r'[0-9]', password):
        return False, '密码必须同时包含字母和数字', None
    if password != confirm_password:
        return False, '两次输入的密码不一致', None

    app = _app()
    conn = _db()
    try:
        if conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone():
            return False, '用户名已存在', None
        user_id = str(uuid.uuid4())
        conn.execute(
            """INSERT INTO users (id, username, password_hash, email, nickname, is_admin, status)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (user_id, username, app.generate_password_hash(password), email, nickname, is_admin, status))
        conn.commit()
        log_activity('create', 'user', target=username, detail='新增用户「' + username + '」')
        return True, '用户创建成功', user_id
    except Exception as e:
        logger_err = str(e)
        if 'UNIQUE' in logger_err.upper() or 'IntegrityError' in type(e).__name__:
            return False, '用户名已存在', None
        return False, f'创建失败：{e}', None
    finally:
        conn.close()


def toggle_user(user_id):
    """启用 / 禁用用户。返回 (ok, message, new_status)。"""
    conn = _db()
    try:
        u = conn.execute("SELECT status, username, is_admin FROM users WHERE id = ?", (user_id,)).fetchone()
        if not u:
            return False, '用户不存在', None
        new_status = 'inactive' if (u['status'] or 'active') == 'active' else 'active'
        # 与 delete_user 一致：至少保留一个「可用」（active）管理员。
        # 计数只算 status=active，已禁用的管理员不占名额——否则「1 个可用 + 1 个已禁用」
        # 时仍能禁用掉唯一的可用管理员，导致后台无人可管理。
        if new_status == 'inactive' and u['is_admin']:
            active_admins = conn.execute(
                "SELECT COUNT(*) AS c FROM users WHERE is_admin = 1 AND status = 'active'"
            ).fetchone()['c']
            if active_admins <= 1:
                return False, '至少需要保留一个管理员，无法禁用最后一个管理员', None
        conn.execute("UPDATE users SET status = ? WHERE id = ?", (new_status, user_id))
        conn.commit()
        name = u['username'] or user_id
        log_activity('toggle', 'user', target=name,
                     detail='用户「' + name + '」' + ('已启用' if new_status == 'active' else '已禁用'))
        return True, '用户状态已更新', new_status
    finally:
        conn.close()


def edit_user(user_id, new_username, new_password, new_email):
    """编辑用户（用户名 / 邮箱 / 可选新密码）。返回 (ok, message)。"""
    new_username = (new_username or '').strip()
    new_email = (new_email or '').strip().lower()
    new_password = (new_password or '').strip()

    if not new_username:
        return False, '用户名不能为空'
    if not re.match(r'^[a-zA-Z0-9_]{3,20}$', new_username):
        return False, '用户名需由3-20个字母、数字或下划线组成'
    if new_password and len(new_password) < 8:
        return False, '密码长度至少需要8位'

    app = _app()
    conn = _db()
    try:
        u = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not u:
            return False, '用户不存在'
        if conn.execute("SELECT id FROM users WHERE username = ? AND id != ?",
                        (new_username, user_id)).fetchone():
            return False, '用户名已存在'
        if new_email and conn.execute("SELECT id FROM users WHERE email = ? AND id != ?",
                                      (new_email, user_id)).fetchone():
            return False, '该邮箱已被其他用户使用'
        if new_password:
            conn.execute("UPDATE users SET username = ?, password_hash = ?, email = ? WHERE id = ?",
                         (new_username, app.generate_password_hash(new_password), new_email, user_id))
        else:
            conn.execute("UPDATE users SET username = ?, email = ? WHERE id = ?",
                         (new_username, new_email, user_id))
        conn.commit()
        log_activity('update', 'user', target=new_username,
                     detail='编辑用户「' + new_username + '」' + ('（含修改密码）' if new_password else ''))
        return True, '用户信息已更新'
    finally:
        conn.close()


def delete_user(user_id):
    """删除用户（删除后至少保留一个可用管理员）。返回 (ok, message)。"""
    conn = _db()
    try:
        u = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not u:
            return False, '用户不存在'
        if u['is_admin']:
            # 只统计 status=active 的「可用」管理员；删除后剩余可用管理员须 >= 1。
            # 目标是已禁用管理员时不扣减名额，否则「1 可用 + 1 已禁用」场景下
            # 反而会误拦清理已禁用账号的操作。
            active_total = conn.execute(
                "SELECT COUNT(*) AS c FROM users WHERE is_admin = 1 AND status = 'active'"
            ).fetchone()['c']
            target_active = (u['status'] or 'active') == 'active'
            if active_total - (1 if target_active else 0) < 1:
                return False, '至少需要保留一个管理员，无法删除最后一个管理员'
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.execute("UPDATE invite_codes SET used_by = NULL WHERE used_by = ?", (user_id,))
        conn.execute("UPDATE links SET user_id = '' WHERE user_id = ?", (user_id,))
        conn.execute("UPDATE upload_records SET user_id = '' WHERE user_id = ?", (user_id,))
        conn.commit()
        name = u['username'] or user_id
        log_activity('delete', 'user', target=name, detail='删除用户「' + name + '」')
        return True, '用户已删除'
    finally:
        conn.close()


def reset_user_password(user_id):
    """重置用户为随机密码。返回 (ok, message, new_password)。"""
    conn = _db()
    try:
        u = conn.execute("SELECT id, username FROM users WHERE id = ?", (user_id,)).fetchone()
        if not u:
            return False, '用户不存在', None
        new_password = secrets.token_hex(4)  # 8 位随机密码
        app = _app()
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?",
                     (app.generate_password_hash(new_password), user_id))
        conn.commit()
        name = u['username'] or user_id
        log_activity('reset_password', 'user', target=name, detail='重置用户「' + name + '」的密码')
        return True, '密码已重置', new_password
    finally:
        conn.close()


# ============================================================
# 邀请码管理
# ============================================================
def list_invites():
    """邀请码列表（含使用人 / 创建人用户名与状态）。"""
    conn = _db()
    try:
        rows = conn.execute(
            """SELECT ic.*, u.username AS used_by_name, creator.username AS created_by_name
               FROM invite_codes ic
               LEFT JOIN users u ON ic.used_by = u.id
               LEFT JOIN users creator ON ic.created_by = creator.id
               ORDER BY ic.created_at DESC""").fetchall()
    finally:
        conn.close()

    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    items = []
    for r in rows:
        d = dict(r)
        exp = d.get('expires_at') or ''
        is_used = d.get('used_by') is not None
        is_expired = bool(exp) and exp < now
        items.append({
            'id': d.get('id'),
            'code': d.get('code') or '',
            'expires_at': exp,
            'used_by': d.get('used_by'),
            'used_by_name': d.get('used_by_name') or '',
            'used_at': d.get('used_at') or '',
            'created_by_name': d.get('created_by_name') or '',
            'created_at': d.get('created_at') or '',
            'is_used': is_used,
            'is_expired': is_expired,
            'status': 'used' if is_used else ('expired' if is_expired else 'unused'),
        })
    return {'invites': items, 'total': len(items), 'now': now}


def generate_invite(created_by, expire_days=7):
    """生成邀请码。返回 (ok, message, code)。"""
    try:
        expire_days = int(expire_days)
    except (ValueError, TypeError):
        expire_days = 7
    expire_days = max(1, min(365, expire_days))
    code = secrets.token_urlsafe(16)
    expires_at = (datetime.now() + timedelta(days=expire_days)).strftime('%Y-%m-%d %H:%M:%S')
    conn = _db()
    try:
        conn.execute(
            "INSERT INTO invite_codes (id, code, expires_at, created_by) VALUES (?, ?, ?, ?)",
            (str(uuid.uuid4()), code, expires_at, created_by))
        conn.commit()
        log_activity('generate', 'invite', target=code,
                     detail='生成邀请码（有效期 ' + str(expire_days) + ' 天）', user_id=created_by)
        return True, '邀请码已生成', code
    except Exception as e:
        return False, f'生成失败：{e}', None
    finally:
        conn.close()


def delete_invite(invite_id):
    """删除邀请码。返回 (ok, message)。"""
    conn = _db()
    try:
        if not conn.execute("SELECT id FROM invite_codes WHERE id = ?", (invite_id,)).fetchone():
            return False, '邀请码不存在'
        conn.execute("DELETE FROM invite_codes WHERE id = ?", (invite_id,))
        conn.commit()
        log_activity('delete', 'invite', target=invite_id, detail='删除邀请码')
        return True, '邀请码已删除'
    finally:
        conn.close()


# ============================================================
# 收集设置（settings）
# ============================================================
def _settings_account(user_id):
    """当前账号的用户名 / 昵称 / 邮箱。"""
    conn = _db()
    try:
        row = conn.execute(
            "SELECT username, nickname, email FROM users WHERE id = ?", (user_id,)
        ).fetchone()
    finally:
        conn.close()
    if not row:
        return {'username': '', 'nickname': '', 'email': ''}
    return {
        'username': row['username'] or '',
        'nickname': row['nickname'] or '',
        'email': row['email'] or '',
    }


def _settings_defaults(user_id, is_admin):
    """默认设置：管理员返回全局值；普通用户返回个人覆盖值（回退全局）。"""
    a = _app()
    if is_admin:
        defaults = {
            'max_files': a.get_setting('max_files', str(a.DEFAULT_MAX_FILES)),
            'max_file_size_gb': a.get_setting('max_file_size_gb', str(a.DEFAULT_MAX_FILE_SIZE_GB)),
            'upload_batch_limit': a.get_setting('upload_batch_limit', '30'),
            'attachment_max_mb': a.fmt_mb(a.get_setting('attachment_max_mb', str(a.DEFAULT_ATTACHMENT_MAX_MB))),
            'passcode_ttl_minutes': a.get_setting('passcode_ttl_minutes', '120'),
            'default_link_expire_days': a.get_setting('default_link_expire_days', '30'),
            'blocked_extensions': a.get_setting('blocked_extensions', ''),
        }
    else:
        defaults = {
            'max_files': a.get_user_setting(user_id, 'max_files', str(a.DEFAULT_MAX_FILES)),
            'max_file_size_gb': a.get_user_setting(user_id, 'max_file_size_gb', str(a.DEFAULT_MAX_FILE_SIZE_GB)),
            'attachment_max_mb': a.fmt_mb(a.get_user_setting(user_id, 'attachment_max_mb', str(a.DEFAULT_ATTACHMENT_MAX_MB))),
            'passcode_ttl_minutes': a.get_user_setting(user_id, 'passcode_ttl_minutes', '120'),
            'default_link_expire_days': a.get_user_setting(user_id, 'default_link_expire_days', '30'),
        }
    # 分页偏好始终是用户级
    defaults['links_per_page'] = a.get_user_setting(user_id, 'links_per_page', '50')
    defaults['records_per_page'] = a.get_user_setting(user_id, 'records_per_page', '50')
    return defaults


def settings_overview(user_id, is_admin, sso_need_pwd=False, gateway_available=False):
    """设置面板初始数据（按角色裁剪敏感项）。

    :param gateway_available: 是否经统一网关访问（决定公网/反代相关展示）。
    """
    a = _app()
    data = {
        'is_admin': bool(is_admin),
        'sso_need_pwd': bool(sso_need_pwd),
        'account': _settings_account(user_id),
        'defaults': _settings_defaults(user_id, is_admin),
        'version': a.VERSION,
        'gateway_available': bool(gateway_available),
    }
    if not is_admin:
        return data

    rp_status = a.RPROXY_PM.status() or {}
    data['branding'] = {
        'site_title': a.get_setting('site_title', '文件收集器'),
        'share_page_title': a.get_setting('share_page_title', ''),
        'collect_footer_text': a.get_setting('collect_footer_text', ''),
        'share_footer_text': a.get_setting('share_footer_text', ''),
        'login_tip': a.get_setting('login_tip', '默认账户 admin / admin123，请及时修改'),
        'public_url': a._resolve_public_url(),
        'rp_public_url': a.RPROXY_PM.get_public_url(),
        'rp_running': bool(rp_status.get('running')),
    }
    data['toggles'] = {
        'allow_registration': a.get_setting('allow_registration', '0'),
        'landing_page_enabled': a.get_setting('landing_page_enabled', '1'),
        'root_folder_enabled': a.get_setting('root_folder_enabled', '0'),
    }
    data['smtp'] = {
        'smtp_host': a.get_setting('smtp_host', ''),
        'smtp_port': a.get_setting('smtp_port', '587'),
        'smtp_username': a.get_setting('smtp_username', ''),
        'smtp_password': a.get_setting('smtp_password', ''),
        'smtp_use_tls': a.get_setting('smtp_use_tls', '1'),
        'smtp_from_email': a.get_setting('smtp_from_email', ''),
        'smtp_from_name': a.get_setting('smtp_from_name', '文件收集器'),
    }
    data['custom_upload_path'] = a.get_setting('custom_upload_path', '')
    data['sys_info'] = {
        'db_path': os.path.dirname(a.DB_PATH),  # 仅目录，不暴露文件名
        'upload_base': a.get_upload_base(),
        'data_dir': os.path.basename(a.DATA_DIR) or a.DATA_DIR,
        'port': str(a.PORT),
    }
    return data


def save_account(form, user_id, is_admin, sso_need_pwd=False):
    """保存账号设置（管理员 / 普通用户通用）。

    返回 (ok, message, effects)；effects 供 API 层同步会话：
      - nickname: 需要同步到会话的昵称（未改密码时）
      - password_changed / require_relogin / clear_sso_need_pwd
    """
    a = _app()
    new_username = (form.get('new_username') or '').strip()
    new_nickname = _clean_nickname(form.get('new_nickname') or '')
    new_email = (form.get('new_email') or '').strip().lower()
    old_pass = form.get('old_password') or ''
    new_pass = form.get('new_password') or ''
    confirm_pass = form.get('confirm_password') or ''

    conn = _db()
    try:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            return False, '用户不存在', None
        need_set = bool(sso_need_pwd) or bool(user['sso_need_pwd'])

        if not need_set and not a.verify_password(user['password_hash'], old_pass):
            return False, '原密码错误', None
        if not new_username:
            return False, '用户名不能为空', None

        conflict = conn.execute(
            "SELECT id FROM users WHERE username = ? AND id != ?", (new_username, user_id)
        ).fetchone()
        if conflict:
            return False, '该用户名已被使用', None

        if new_email:
            if '@' not in new_email:
                return False, '请输入有效的邮箱地址', None
            conflict = conn.execute(
                "SELECT id FROM users WHERE email = ? AND id != ?", (new_email, user_id)
            ).fetchone()
            if conflict:
                return False, '该邮箱已被其他用户使用', None

        if new_pass:
            if len(new_pass) < 8:
                return False, '新密码至少 8 位，且需包含字母和数字', None
            if not re.search(r'[a-zA-Z]', new_pass) or not re.search(r'[0-9]', new_pass):
                return False, '新密码必须同时包含字母和数字', None
            if new_pass != confirm_pass:
                return False, '两次密码不一致', None

        sets = ["username = ?"]
        params = [new_username]
        if new_nickname:
            sets.append("nickname = ?")
            params.append(new_nickname)
        if new_email:
            sets.append("email = ?")
            params.append(new_email)

        new_hash = None
        if new_pass:
            new_hash = a.generate_password_hash(new_pass)
            sets.append("password_hash = ?")
            params.append(new_hash)
            if need_set:
                sets.append("sso_need_pwd = 0")
        params.append(user_id)
        conn.execute("UPDATE users SET " + ", ".join(sets) + " WHERE id = ?", params)
        conn.commit()
    finally:
        conn.close()

    # 管理员：同步全局 admin_username / admin_password_hash
    if is_admin:
        a.set_setting('admin_username', new_username)
        if new_hash:
            a.set_setting('admin_password_hash', new_hash)

    # 审计：账号设置变更
    log_activity('save', 'settings', target=new_username,
                 detail='更新账号设置「' + new_username + '」' + ('（含修改密码）' if new_pass else ''),
                 user_id=user_id)

    if need_set and not new_pass:
        return True, '账号信息已更新，请设置登录密码', {
            'nickname': None, 'password_changed': False,
            'require_relogin': False, 'clear_sso_need_pwd': False,
        }

    if new_pass:
        effects = {
            'nickname': None,
            'password_changed': True,
            'clear_sso_need_pwd': bool(need_set),
            'require_relogin': not need_set,
        }
        msg = '密码设置成功，可继续使用' if need_set else '密码修改成功，请重新登录'
    else:
        effects = {
            'nickname': new_nickname or None,
            'password_changed': False,
            'require_relogin': False,
            'clear_sso_need_pwd': False,
        }
        msg = '账号信息已更新'
    return True, msg, effects


def _save_global_defaults(a, form):
    """保存管理员全局「默认设置」及用户级分页偏好。返回错误信息或 None。"""
    def num(name, minv, maxv, label, integer=False):
        raw = (form.get(name, '') or '').strip()
        try:
            v = float(raw)
        except (TypeError, ValueError):
            raise ValueError(f'{label}格式错误')
        if integer:
            if v != int(v):
                raise ValueError(f'{label}必须为整数')
            v = int(v)
        if v < minv or v > maxv:
            raise ValueError(f'{label}必须在 {minv}-{maxv} 之间')
        return v

    try:
        max_files = num('default_max_files', 0, 1e9, '默认最大文件数', integer=True)
        max_size = round(num('default_max_size', 0.01, 64, '单文件上限'), 6)
        upload_batch = num('upload_batch_limit', 0, 500, '单次上传个数', integer=True)
        pttl = num('passcode_ttl_minutes', 1, 43200, '通行证有效期', integer=True)
        lexp = num('default_link_expire_days', 1, 3650, '链接有效期天数', integer=True)
        att = round(num('attachment_max_mb', 0.1, 1e7, '收集附件上限'), 1)
        lpp = num('links_per_page_val', 5, 100, '收集链接每页数量', integer=True)
        rpp = num('records_per_page_val', 5, 200, '上传记录每页数量', integer=True)
    except ValueError as e:
        return str(e)

    a.set_setting('max_files', str(max_files))
    a.set_setting('max_file_size_gb', str(max_size))
    a.set_setting('upload_batch_limit', str(upload_batch))
    a.set_setting('passcode_ttl_minutes', str(pttl))
    a.set_setting('default_link_expire_days', str(lexp))
    a.set_setting('attachment_max_mb', a.fmt_mb(str(att)))
    a.set_setting('blocked_extensions', re.sub(r'\s+', ' ', (form.get('blocked_extensions_input') or '').strip()))
    # 分页偏好为个人级
    a.set_user_setting(form.get('_user_id'), 'links_per_page', str(lpp))
    a.set_user_setting(form.get('_user_id'), 'records_per_page', str(rpp))
    return None


def _save_personal_defaults(a, form, user_id):
    """保存普通用户个人「默认设置」。返回错误信息或 None。"""
    def num(name, minv, maxv, label, integer=False):
        raw = (form.get(name, '') or '').strip()
        try:
            v = float(raw)
        except (TypeError, ValueError):
            raise ValueError(f'{label}格式错误')
        if integer:
            if v != int(v):
                raise ValueError(f'{label}必须为整数')
            v = int(v)
        if v < minv or v > maxv:
            raise ValueError(f'{label}必须在 {minv}-{maxv} 之间')
        return v

    try:
        max_files = num('default_max_files', 0, 1e9, '默认最大文件数', integer=True)
        max_size = round(num('default_max_size', 0.01, 64, '单文件上限'), 6)
        pttl = num('passcode_ttl_minutes', 1, 43200, '通行证有效期', integer=True)
        lexp = num('default_link_expire_days', 1, 3650, '链接有效期天数', integer=True)
        att = round(num('attachment_max_mb', 0.1, 1e7, '收集附件上限'), 1)
        lpp = num('links_per_page_val', 5, 100, '收集链接每页数量', integer=True)
        rpp = num('records_per_page_val', 5, 200, '上传记录每页数量', integer=True)
    except ValueError as e:
        return str(e)

    a.set_user_setting(user_id, 'max_files', str(max_files))
    a.set_user_setting(user_id, 'max_file_size_gb', str(max_size))
    a.set_user_setting(user_id, 'passcode_ttl_minutes', str(pttl))
    a.set_user_setting(user_id, 'default_link_expire_days', str(lexp))
    a.set_user_setting(user_id, 'attachment_max_mb', a.fmt_mb(str(att)))
    a.set_user_setting(user_id, 'links_per_page', str(lpp))
    a.set_user_setting(user_id, 'records_per_page', str(rpp))
    return None


def save_settings(section, form, user_id, is_admin):
    """保存设置分区。返回 (ok, message)。

    section:
      account / defaults（管理员全局或用户个人）/ page_branding / upload_path
      / feature_toggles / smtp   —— 后四者仅管理员。
    """
    a = _app()

    def _log(msg):
        log_activity('save', 'settings', target=section, detail=msg, user_id=user_id)

    if section == 'defaults':
        if is_admin:
            # request.form 为 ImmutableMultiDict，需转为可写 dict 才能注入内部字段
            try:
                form = dict(form)
            except Exception:
                pass
            try:
                form['_user_id'] = user_id
            except Exception:
                pass
            err = _save_global_defaults(a, form)
        else:
            err = _save_personal_defaults(a, form, user_id)
        if err:
            return False, err
        _log('保存「默认设置」' + ('（全局）' if is_admin else '（个人）'))
        return True, '默认设置已保存'

    if not is_admin:
        return False, '需要管理员权限'

    if section == 'page_branding':
        title = (form.get('site_title') or '').strip()
        if not title:
            return False, '站点标题不能为空'
        a.set_setting('site_title', title)
        a.set_setting('collect_footer_text', (form.get('collect_footer_text') or '').strip())
        a.set_setting('share_page_title', (form.get('share_page_title') or '').strip())
        a.set_setting('share_footer_text', (form.get('share_footer_text') or '').strip())
        a.set_setting('login_tip', (form.get('login_tip_text') or '').strip())
        # 反代运行时 public_url 只读，不覆盖
        if not a.RPROXY_PM.get_public_url():
            a.set_setting('public_url', (form.get('public_url') or '').strip())
        _log('保存「页面与品牌」设置')
        return True, '页面与品牌设置已保存'

    if section == 'upload_path':
        custom_path = (form.get('custom_upload_path') or '').strip()
        old_base = a.get_upload_base()
        if custom_path:
            custom_path = os.path.normpath(custom_path)
            if not os.path.isabs(custom_path):
                return False, '上传路径必须是绝对路径，例如 /vol2/1000/文件收集'
            if not os.path.exists(custom_path):
                return False, f'路径不存在：{custom_path}'
            a.set_setting('custom_upload_path', custom_path)
            a.refresh_upload_base()
        else:
            a.set_setting('custom_upload_path', '')
            a.refresh_upload_base()
        try:
            os.makedirs(a.UPLOAD_BASE, mode=0o755, exist_ok=True)
        except PermissionError:
            pass
        a._migrate_stored_paths(old_base, a.UPLOAD_BASE)
        _log('更新上传路径为：' + (custom_path or '默认路径'))
        return True, ('上传路径已更新，请确认飞牛应用已授权该目录读写权限'
                      if custom_path else '已恢复默认上传路径')

    if section == 'feature_toggles':
        a.set_setting('allow_registration', form.get('allow_registration', '0'))
        a.set_setting('landing_page_enabled', form.get('landing_page_enabled', '0'))
        a.set_setting('root_folder_enabled', form.get('root_folder_enabled', '0'))
        _log('保存「功能开关」')
        return True, '功能开关已保存'

    if section == 'smtp':
        for f in ('smtp_host', 'smtp_port', 'smtp_username', 'smtp_password',
                  'smtp_use_tls', 'smtp_from_email', 'smtp_from_name'):
            a.set_setting(f, (form.get(f) or '').strip())
        # 自动同步管理员邮箱，确保「忘记密码」可用
        admin_email = (form.get('smtp_from_email') or '').strip()
        if admin_email and '@' in admin_email:
            try:
                admin_username = a.get_setting('admin_username', a.DEFAULT_ADMIN_USER)
                conn = _db()
                conn.execute(
                    "UPDATE users SET email = ? WHERE username = ? AND is_admin = 1 AND (email = '' OR email IS NULL)",
                    (admin_email, admin_username))
                conn.commit()
                conn.close()
            except Exception:
                pass
        _log('保存邮件（SMTP）配置')
        return True, '邮箱配置已保存'

    return False, '未知的设置分区'


def test_smtp(to_email):
    """发送 SMTP 测试邮件。返回 (ok, message)。"""
    a = _app()
    to_email = (to_email or '').strip()
    if not to_email or '@' not in to_email:
        return False, '请输入有效的测试邮箱地址'
    config = a.get_smtp_config()
    if not config['host'] or not config['from_email']:
        return False, '请先配置 SMTP 服务器和发件人邮箱'
    subject = f'[{config["from_name"]}] 测试邮件'
    body = (
        '<!DOCTYPE html><html><head><meta charset="utf-8"></head>'
        '<body style="font-family:sans-serif;padding:24px;">'
        f'<h3>邮件发送测试成功！</h3><p>如果您收到此邮件，说明 SMTP 配置正确，邮件功能可以正常使用。</p>'
        f'<p style="color:#9ca3af;font-size:12px;">此邮件由 {config["from_name"]} 系统自动发送</p>'
        '</body></html>')
    return a.send_email(to_email, subject, body)


def database_backup():
    """返回数据库备份信息 {path, download_name}；数据库不存在时返回 None。"""
    a = _app()
    if not os.path.exists(a.DB_PATH):
        return None
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    return {'path': a.DB_PATH, 'download_name': f'file-collector-backup-{ts}.db'}


def restore_database(file_storage):
    """导入数据库备份。返回 (ok, message)。"""
    import sqlite3
    import shutil
    import tempfile

    a = _app()
    if not file_storage or not file_storage.filename:
        return False, '请选择数据库文件'
    if not file_storage.filename.endswith('.db'):
        return False, '仅支持 .db 格式的数据库文件'

    tmp = tempfile.NamedTemporaryFile(suffix='.db', delete=False)
    tmp_path = tmp.name
    tmp.close()
    try:
        file_storage.save(tmp_path)
        with open(tmp_path, 'rb') as f:
            header = f.read(16)
        if header != b'SQLite format 3\x00':
            return False, '无效的数据库文件：文件格式不正确'

        try:
            test_conn = sqlite3.connect(tmp_path)
            tables = test_conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('settings','links','upload_records')"
            ).fetchall()
            test_conn.close()
            if len(tables) < 3:
                return False, '无效的数据库文件：缺少必要的表结构'
        except sqlite3.Error:
            return False, '无效的数据库文件：无法读取数据库'

        backup_path = a.DB_PATH + f'.bak_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
        shutil.copy2(a.DB_PATH, backup_path)
        shutil.copy2(tmp_path, a.DB_PATH)
        os.unlink(tmp_path)

        try:
            a.init_db()
        except Exception as e:
            shutil.copy2(backup_path, a.DB_PATH)
            return False, f'数据库迁移失败，已自动回滚：{e}'

        a.refresh_upload_base()
        a.set_setting('secret_key', secrets.token_hex(32))
        return True, '数据库已成功导入，Secret Key 已轮换（重启后生效）'
    except Exception as e:
        if os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
        return False, f'导入失败，请检查文件是否正确：{e}'


def reverse_proxy_status():
    """反向代理运行状态（供设置面板轮询）。"""
    a = _app()
    return a.RPROXY_PM.status() or {}


# ============================================================
# 操作日志（审计）
# ============================================================
# 分类与动作的中文标签（前端筛选下拉 / 列表展示）
ACTIVITY_CATEGORY_LABELS = {
    'auth': '登录认证',
    'link': '收集链接',
    'record': '文件记录',
    'user': '用户管理',
    'invite': '邀请码',
    'settings': '收集设置',
    'system': '系统',
}

ACTIVITY_ACTION_LABELS = {
    'login': '登录',
    'logout': '退出登录',
    'create': '创建',
    'update': '编辑',
    'toggle': '启用/停用',
    'delete': '删除',
    'upload': '上传',
    'download': '下载',
    'reset_password': '重置密码',
    'generate': '生成',
    'save': '保存',
    'restore': '恢复',
    'backup': '备份',
}


def _resolve_actor(user_id=None):
    """解析操作者信息（user_id / username / ip）。

    优先使用请求上下文（登录态会话 + 客户端 IP）；无请求上下文时退化为
    显式传入的 user_id，并尝试从 users 表补齐用户名。
    """
    uid = user_id or ''
    uname = ''
    ip = ''
    try:
        from flask import has_request_context, session
        if has_request_context():
            uid = uid or (session.get('user_id') or '')
            uname = session.get('username') or ''
            # 统一走 app._get_client_ip()：它会依次尝试「ProxyFix 修正后的 remote_addr
            # → X-Real-IP → X-Forwarded-For → 其他常见头」，兼容 Nginx 反代、内置反代
            # 以及飞牛统一网关（Unix Socket / 127.0.0.1 回环）等场景。
            # 旧实现只读 X-Forwarded-For，经网关（只注入 X-Real-IP）时会退化成 127.0.0.1，
            # 这正是「实时日志里通过 gateway 操作显示 127.0.0.1」的根因。
            try:
                ip = _app()._get_client_ip() or ''
            except Exception:
                ip = ''
    except Exception:
        pass
    if uid and not uname:
        try:
            conn = _db()
            row = conn.execute('SELECT username FROM users WHERE id = ?', (uid,)).fetchone()
            conn.close()
            if row:
                uname = row['username'] or ''
        except Exception:
            pass
    return uid, uname, ip


def log_activity(action, category='', target='', detail='', user_id=None, username=''):
    """写入一条操作日志；任何异常都静默忽略，绝不影响主业务流程。

    参数：
      action   动作标识（如 create / delete / upload / login）
      category 分类标识（如 link / record / user / auth / settings）
      target   目标对象标识（link_id / record_id / 用户名等）
      detail   人类可读描述
    """
    try:
        uid, uname, ip = _resolve_actor(user_id)
        if not uname and username:
            uname = username
        conn = _db()
        conn.execute(
            """INSERT INTO activity_logs
               (created_at, user_id, username, category, action, target, detail, ip)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
             str(uid or ''), str(uname or ''), str(category or ''),
             str(action or ''), str(target or ''), str(detail or ''),
             str(ip or '')[:64])
        )
        conn.commit()
        conn.close()
        return True
    except Exception:
        return False


def list_activity_logs(page=1, per_page=50, category='', action='', q=''):
    """操作日志分页查询（供网关面板「实时日志 · 操作日志」）。"""
    try:
        page = max(1, int(page))
    except (ValueError, TypeError):
        page = 1
    try:
        per_page = int(per_page)
    except (ValueError, TypeError):
        per_page = 50
    per_page = max(10, min(200, per_page))

    where = []
    params = []
    if category:
        where.append('category = ?')
        params.append(category)
    if action:
        where.append('action = ?')
        params.append(action)
    if q:
        where.append('(detail LIKE ? OR username LIKE ? OR target LIKE ?)')
        like = '%' + q + '%'
        params.extend([like, like, like])
    where_sql = (' WHERE ' + ' AND '.join(where)) if where else ''

    conn = _db()
    try:
        total = conn.execute('SELECT COUNT(*) AS n FROM activity_logs' + where_sql, params).fetchone()['n']
        total_pages = max(1, (total + per_page - 1) // per_page)
        if page > total_pages:
            page = total_pages
        offset = (page - 1) * per_page
        rows = conn.execute(
            'SELECT * FROM activity_logs' + where_sql + ' ORDER BY id DESC LIMIT ? OFFSET ?',
            params + [per_page, offset]
        ).fetchall()

        logs = []
        for r in rows:
            d = dict(r)
            logs.append({
                'id': d.get('id'),
                'time': (d.get('created_at') or '').replace('T', ' '),
                'user': d.get('username') or '（匿名）',
                'user_id': d.get('user_id') or '',
                'category': d.get('category') or '',
                'category_label': ACTIVITY_CATEGORY_LABELS.get(d.get('category'), d.get('category') or '其他'),
                'action': d.get('action') or '',
                'action_label': ACTIVITY_ACTION_LABELS.get(d.get('action'), d.get('action') or '操作'),
                'target': d.get('target') or '',
                'detail': d.get('detail') or '',
                'ip': d.get('ip') or '',
            })
        return {
            'logs': logs,
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': total_pages,
            'categories': [{'value': k, 'label': v} for k, v in ACTIVITY_CATEGORY_LABELS.items()],
            'actions': [{'value': k, 'label': v} for k, v in ACTIVITY_ACTION_LABELS.items()],
        }
    finally:
        try:
            conn.close()
        except Exception:
            pass
