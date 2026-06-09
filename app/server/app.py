#!/usr/bin/env python3
"""
文件收集器 - fnOS Native 应用
基于 Flask + SQLite 的多链接文件收集系统

功能：
- 后台生成多个文件收集链接，每个链接有独立通行证
- 支持收集文件描述，告知用户上传内容
- 上传记录管理（查看、删除，删除链接保留文件）
- 响应式 UI，微信浏览器检测提示
"""
import os
import re
import time
import uuid
import sqlite3
import shutil
import secrets
import logging
import traceback
import tempfile
import urllib.request
import urllib.error
from datetime import datetime, timedelta
from functools import wraps
from pathlib import Path

from flask import (
    Flask, request, render_template, redirect, url_for,
    session, jsonify, flash, send_from_directory, abort
)
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.middleware.proxy_fix import ProxyFix

# ============================================================
# 配置 - 适配 fnOS 环境
# ============================================================
VERSION = "1.1.64"

# 模板目录指向 app/server/templates
_TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
_STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')

app = Flask(__name__, template_folder=_TEMPLATE_DIR, static_folder=_STATIC_DIR)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024 * 1024  # 64GB 硬限制，防止超大文件耗尽磁盘

# 反向代理支持：修正 request.remote_addr / request.scheme
# x_for=2 表示信任最多 2 层反向代理的 X-Forwarded-For 头
# x_proto=1 信任 X-Forwarded-Proto，确保 request.scheme 正确识别 HTTPS
# x_host=1 信任 X-Forwarded-Host，x_port=1 信任 X-Forwarded-Port
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=2, x_proto=1, x_host=1, x_port=1, x_prefix=1)

# 会话安全配置
# 注意：SESSION_COOKIE_SECURE 不在 before_request 中动态修改（会导致多线程竞态条件）
# 反向代理场景：ProxyFix 修正 request.scheme 后，Flask 内部会正确处理
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # 默认 False，适配大多数反代场景（HTTP 回源）
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=8)

@app.before_request
def ensure_csrf_token():
    """确保 CSRF token 在 session 中初始化"""
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(32)

# 上传通行证浏览器缓存有效期默认值（秒）
DEFAULT_PASSCODE_TTL = 7200  # 2小时

def get_passcode_ttl():
    """获取通行证缓存有效期（秒），从数据库设置读取"""
    minutes = get_setting('passcode_ttl_minutes', '120')
    try:
        return int(minutes) * 60
    except (ValueError, TypeError):
        return DEFAULT_PASSCODE_TTL

# 从环境变量读取配置
# 数据库存储：TRIM_PKGVAR（应用私有目录）→ /tmp
# 上传文件存储：UPLOAD_BASE 环境变量（cmd/main 设置为 data-share 子目录）
_PKGVAR = os.environ.get('TRIM_PKGVAR', '/tmp/file-collector')
DATA_DIR = os.environ.get('DATA_DIR', os.path.join(_PKGVAR, 'data'))

PORT = int(os.environ.get('PORT', 5557))

# 上传目录：优先 UPLOAD_BASE 环境变量（cmd/main 设置为 data-share 的 uploads 子目录）
# → 回退到 TRIM_PKGVAR 下的 uploads
_DEFAULT_UPLOAD_BASE = os.environ.get('UPLOAD_BASE',
    os.path.join(_PKGVAR, 'uploads'))
UPLOAD_BASE = _DEFAULT_UPLOAD_BASE  # 启动时默认，后续可能被自定义覆盖

def get_upload_base():
    """获取当前上传目录：自定义路径优先 → 默认路径"""
    custom = get_setting('custom_upload_path', '').strip()
    if custom and os.path.isdir(custom):
        return custom
    return _DEFAULT_UPLOAD_BASE

def refresh_upload_base():
    """刷新全局 UPLOAD_BASE（数据库设置变更后调用）"""
    global UPLOAD_BASE
    UPLOAD_BASE = get_upload_base()

DEBUG_MODE = os.environ.get('FLASK_DEBUG', '0') == '1'

# 确保目录存在
os.makedirs(DATA_DIR, exist_ok=True)
try:
    os.makedirs(UPLOAD_BASE, mode=0o755, exist_ok=True)
except PermissionError:
    pass  # 目录已存在但无权限修改，后续会检查可写性

# 数据库路径
DB_PATH = os.path.join(DATA_DIR, 'file_collector.db')

# 日志配置
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('file_collector')

# 默认设置
DEFAULT_MAX_FILE_SIZE_GB = 1
DEFAULT_MAX_FILES = 10
DEFAULT_ADMIN_USER = 'admin'
DEFAULT_ADMIN_PASS = 'admin123'

# ============================================================
# 数据库初始化
# ============================================================
def get_db():
    """获取数据库连接"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    """初始化数据库表"""
    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS links (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            passcode TEXT NOT NULL,
            max_file_size_gb REAL DEFAULT 1,
            max_files INTEGER DEFAULT 10,
            target_folder TEXT DEFAULT '',  -- 预留字段，当前未使用
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS upload_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            link_id TEXT NOT NULL,
            original_name TEXT NOT NULL,
            stored_name TEXT NOT NULL,
            stored_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            file_size_display TEXT DEFAULT '',
            uploader_ip TEXT DEFAULT '',
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            download_count INTEGER DEFAULT 0,
            FOREIGN KEY (link_id) REFERENCES links(id)
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_records_link_id ON upload_records(link_id);
        CREATE INDEX IF NOT EXISTS idx_records_uploaded_at ON upload_records(uploaded_at);
    ''')

    # 数据库迁移
    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'max_file_size_mb' in columns and 'max_file_size_gb' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN max_file_size_gb REAL DEFAULT 1")
            conn.execute("UPDATE links SET max_file_size_gb = max_file_size_mb / 1024.0 WHERE max_file_size_mb IS NOT NULL AND max_file_size_gb = 1")
            conn.commit()
    except Exception as e:
        print(f"数据库迁移错误: {e}")

    try:
        cursor = conn.execute("PRAGMA table_info(upload_records)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'download_count' not in columns:
            conn.execute("ALTER TABLE upload_records ADD COLUMN download_count INTEGER DEFAULT 0")
            conn.commit()
    except Exception as e:
        print(f"数据库迁移错误(download_count): {e}")

    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'expires_at' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN expires_at TIMESTAMP")
            conn.commit()
    except Exception as e:
        print(f"数据库迁移错误(expires_at): {e}")

    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'allow_delete' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN allow_delete INTEGER DEFAULT 0")
            conn.commit()
    except Exception as e:
        print(f"数据库迁移错误(allow_delete): {e}")

    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'passcode_plain' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN passcode_plain TEXT DEFAULT ''")
            conn.commit()
    except Exception as e:
        print(f"数据库迁移错误(passcode_plain): {e}")

    # 检测是否已有数据库（升级场景）
    existing_admin = conn.execute(
        "SELECT value FROM settings WHERE key = 'admin_username'"
    ).fetchone()

    if existing_admin:
        # 升级安装：数据库已存在，保留所有已有设置，忽略 wizard 环境变量
        logger.info("检测到已有数据库，保留所有数据（升级安装）")
        # 仅补充可能缺失的新增设置项（不影响已有数据）
        new_defaults = {
            'passcode_ttl_minutes': '120',
            'landing_page_enabled': '1',
            'collect_footer_text': '',
            'blocked_extensions': '',
        }
        for key, val in new_defaults.items():
            conn.execute(
                "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
                (key, val)
            )
    else:
        # 首次安装：使用 wizard 环境变量或默认值初始化
        wizard_admin_user = os.environ.get('wizard_admin_user', '').strip()
        wizard_admin_pass = os.environ.get('wizard_admin_pass', '').strip()
        init_admin_user = wizard_admin_user if wizard_admin_user else DEFAULT_ADMIN_USER
        init_admin_pass = wizard_admin_pass if wizard_admin_pass else DEFAULT_ADMIN_PASS
        init_login_tip = '默认账户 admin / admin123，请及时修改' if not wizard_admin_pass else '账户已由安装向导设置'

        defaults = {
            'admin_username': init_admin_user,
            'admin_password_hash': generate_password_hash(init_admin_pass),
            'max_file_size_gb': str(DEFAULT_MAX_FILE_SIZE_GB),
            'max_files': str(DEFAULT_MAX_FILES),
            'site_title': '文件收集器',
            'secret_key': secrets.token_hex(32),
            'login_tip': init_login_tip,
            'collect_footer_text': '',
            'passcode_ttl_minutes': '120',
            'landing_page_enabled': '1',
        }
        for key, val in defaults.items():
            conn.execute(
                "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
                (key, val)
            )
    conn.commit()
    conn.close()

def get_setting(key, default=None):
    """获取单个设置值"""
    conn = get_db()
    row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    conn.close()
    return row['value'] if row else default

def set_setting(key, value):
    """设置单个值"""
    conn = get_db()
    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
        (key, value)
    )
    conn.commit()
    conn.close()

# 初始化
init_db()
refresh_upload_base()  # 从数据库恢复自定义上传路径（如果有）
_key = get_setting('secret_key', None)
if _key is None:
    _key = secrets.token_hex(32)
    set_setting('secret_key', _key)
app.secret_key = _key

# ============================================================
# 频率限制 & CSRF 保护
# ============================================================
_rate_limits = {}

def rate_limit(key, max_attempts=5, window_seconds=60):
    """简单的内存频率限制（定期清理过期条目防止内存泄漏）"""
    now = time.time()
    # 每100次调用清理一次过期条目
    if len(_rate_limits) > 0 and len(_rate_limits) % 100 == 0:
        expired = [k for k, v in _rate_limits.items() if now - v[1] > window_seconds]
        for k in expired:
            del _rate_limits[k]

    if key in _rate_limits:
        attempts, first = _rate_limits[key]
        if now - first > window_seconds:
            _rate_limits[key] = (1, now)
            return True
        if attempts >= max_attempts:
            return False
        _rate_limits[key] = (attempts + 1, first)
    else:
        _rate_limits[key] = (1, now)
    return True

def generate_csrf_token():
    """生成 CSRF token"""
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(32)
    return session['csrf_token']

def validate_csrf():
    """验证 CSRF token"""
    token = request.form.get('csrf_token', '') or request.headers.get('X-CSRFToken', '')
    expected = session.get('csrf_token', '')
    if not token:
        flash('安全验证失败：缺少验证令牌，请刷新页面重试')
        return False
    if not expected or not secrets.compare_digest(token, expected):
        flash('安全验证失败，请刷新页面重试')
        return False
    return True

# ============================================================
# 辅助函数
# ============================================================
def generate_link_id():
    """生成短链接ID (8位字母数字)"""
    return uuid.uuid4().hex[:8]

def format_file_size(size_bytes):
    """格式化文件大小"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} TB"

def _get_client_ip():
    """获取客户端真实IP
    
    支持多种反向代理场景：
    - 普通 HTTP 反向代理（X-Forwarded-For）
    - Unix Socket 反向代理（remote_addr 为空或特殊值）
    - 多层反向代理（X-Forwarded-For 包含多个IP）
    """
    # 优先从 X-Forwarded-For 获取（支持多层代理）
    x_forwarded_for = request.headers.get('X-Forwarded-For', '')
    if x_forwarded_for:
        # X-Forwarded-For 格式: client, proxy1, proxy2, ...
        ip = x_forwarded_for.split(',')[0].strip()
        if ip and ip != 'unknown':
            return ip
    
    # 其次检查 X-Real-IP（某些代理使用此头）
    x_real_ip = request.headers.get('X-Real-IP', '').strip()
    if x_real_ip and x_real_ip != 'unknown':
        return x_real_ip
    
    # 最后使用 remote_addr（ProxyFix 已修正，或直接连接）
    ip = (request.remote_addr or '').strip()
    
    # Unix Socket 场景：remote_addr 可能为空或特殊值
    if not ip or ip == 'unknown' or ip.startswith('unix'):
        # 尝试从其他常见头获取
        for header in ['X-Client-IP', 'X-Forwarded', 'Forwarded-For', 'Forwarded']:
            val = request.headers.get(header, '').strip()
            if val and val != 'unknown':
                # 处理 Forwarded 头格式: for=192.168.0.1;proto=http;host=example.com
                if header.lower() == 'forwarded':
                    for part in val.split(';'):
                        part = part.strip()
                        if part.lower().startswith('for='):
                            ip_val = part[4:].strip()
                            # 移除可能的引号
                            if ip_val.startswith(('"', "'")):
                                ip_val = ip_val[1:-1]
                            return ip_val
                else:
                    return val
        # 如果都没有，返回一个标识性值
        return 'unknown'
    
    return ip

def is_wechat_browser():
    """检测是否来自微信浏览器"""
    ua = request.headers.get('User-Agent', '').lower()
    return 'micromessenger' in ua

def is_verified(link_id, link=None):
    """检查当前 session 中通行证是否已验证且未过期
    如果传入 link 对象且为空通行证，直接返回 True
    """
    if link is not None:
        pp = link['passcode_plain']
        if not pp or not pp.strip():
            return True
    ts = session.get(f'verified_{link_id}', 0)
    return isinstance(ts, (int, float)) and (time.time() - ts) < get_passcode_ttl()

def link_has_passcode(link_id):
    """检查链接是否设置了通行证（passcode_plain 非空）"""
    conn = get_db()
    row = conn.execute("SELECT passcode_plain FROM links WHERE id = ?", (link_id,)).fetchone()
    conn.close()
    if not row:
        return False
    return bool(row['passcode_plain'] and row['passcode_plain'].strip())

def admin_required(f):
    """管理员认证装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('is_admin'):
            if request.path.startswith('/api/'):
                return jsonify({'error': '未登录'}), 401
            return redirect(url_for('admin_login'))
        if request.method == 'POST':
            if not validate_csrf():
                return redirect(request.referrer or url_for('admin_dashboard'))
        admin_hash = get_setting('admin_password_hash', '')
        # 默认密码强制修改：非设置页且非退出页，跳转到设置页
        if check_password_hash(admin_hash, DEFAULT_ADMIN_PASS):
            allowed = ('admin_settings', 'admin_logout')
            if request.endpoint not in allowed:
                flash('安全提醒：您仍在使用默认密码，请立即修改！')
                return redirect(url_for('admin_settings'))
        return f(*args, **kwargs)
    return decorated

@app.after_request
def add_security_headers(response):
    """添加安全响应头"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
    csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://api.github.com"
    response.headers['Content-Security-Policy'] = csp
    return response

@app.context_processor
def inject_globals():
    """注入全局模板变量"""
    title = get_setting('site_title', '文件收集器')
    return {
        'csrf_token': generate_csrf_token(),
        'site_title': title,
        'config_title': title,
        'collect_footer_text': get_setting('collect_footer_text', ''),
    }

def _safe_delete(stored_path):
    """安全删除文件：校验 stored_path 在 UPLOAD_BASE 范围内，防止路径遍历攻击"""
    upload_base = get_upload_base()
    real_path = os.path.realpath(stored_path)
    real_base = os.path.realpath(upload_base)
    if not real_path.startswith(real_base + os.sep) and real_path != real_base:
        logger.warning(f"路径遍历删除拦截: stored_path={stored_path}, upload_base={real_base}")
        return False
    if os.path.exists(real_path) and os.path.isfile(real_path):
        os.remove(real_path)
        return True
    return False

def allowed_file(filename):
    """允许所有文件类型上传，但禁止用户配置的危险扩展名"""
    blocked = get_blocked_extensions()
    if not blocked:
        return True
    _, ext = os.path.splitext(filename.lower())
    if ext in blocked:
        return False
    return True

def get_blocked_extensions():
    """从设置中获取禁止上传的扩展名列表"""
    raw = get_setting('blocked_extensions', '').strip()
    if not raw:
        # 默认：禁止危险脚本和可执行文件
        default_blocked = {'.exe', '.php', '.jsp', '.asp', '.aspx', '.sh', '.bash', '.bat',
                           '.cmd', '.ps1', '.py', '.rb', '.pl', '.cgi', '.so', '.dll',
                           '.jspx', '.php3', '.php4', '.php5', '.phtml', '.shtml'}
        return default_blocked
    # 用户自定义：逗号或空格分隔
    exts = set()
    for part in raw.replace(',', ' ').split():
        part = part.strip().lower()
        if part and not part.startswith('.'):
            part = '.' + part
        if part:
            exts.add(part)
    return exts

def _safe_download(stored_path, original_name):
    """安全下载：校验 stored_path 在 UPLOAD_BASE 范围内，防止路径遍历攻击"""
    upload_base = get_upload_base()
    real_path = os.path.realpath(stored_path)
    real_base = os.path.realpath(upload_base)
    if not real_path.startswith(real_base + os.sep) and real_path != real_base:
        logger.warning(f"路径遍历攻击拦截: stored_path={stored_path}, upload_base={real_base}")
        abort(403)
    directory = os.path.dirname(real_path)
    filename = os.path.basename(real_path)
    if not os.path.isfile(real_path):
        abort(404)
    return send_from_directory(
        directory, filename,
        download_name=original_name,
        as_attachment=True
    )

def create_upload_dir(link_id):
    """为链接创建上传目录（以标题命名）"""
    conn = get_db()
    link = conn.execute("SELECT title FROM links WHERE id = ?", (link_id,)).fetchone()
    conn.close()

    if link and link['title']:
        folder_name = re.sub(r'[<>:"/\\|?*]', '_', link['title'].strip())
        if not folder_name:
            folder_name = 'unnamed'
    else:
        folder_name = 'unnamed'

    # 防止 .. 等路径遍历攻击
    folder_name = os.path.normpath(folder_name).lstrip(os.sep).lstrip('.')
    if not folder_name:
        folder_name = 'unnamed'

    upload_dir = os.path.join(UPLOAD_BASE, folder_name)
    # 双重确保：realpath 必须在 UPLOAD_BASE 范围内
    real_dir = os.path.realpath(upload_dir)
    real_base = os.path.realpath(UPLOAD_BASE)
    if not real_dir.startswith(real_base + os.sep) and real_dir != real_base:
        upload_dir = os.path.join(UPLOAD_BASE, 'unnamed')
        real_dir = os.path.realpath(upload_dir)

    os.makedirs(real_dir, mode=0o755, exist_ok=True)

    # 确保目录可写（修复 NAS 上权限不一致的问题）
    if not os.access(real_dir, os.W_OK):
        try:
            os.chmod(real_dir, 0o755)
        except Exception:
            pass
        if not os.access(real_dir, os.W_OK):
            raise PermissionError(f'上传目录无写入权限: {real_dir}')

    return real_dir

# ============================================================
# 路由 - 文件收集页
# ============================================================
@app.route('/')
def index():
    """根路径 - 根据设置显示介绍页或 404"""
    if get_setting('landing_page_enabled', '1') == '1':
        return render_template('landing.html',
            site_title=get_setting('site_title', '文件收集器'))
    return render_template('error.html',
        error_code=404,
        error_title='页面未找到',
        error_message='您访问的页面不存在或已被移除。'), 404

@app.route('/collect/<link_id>')
def collect_page(link_id):
    """文件收集页面"""
    if not re.match(r'^[a-zA-Z0-9]{8}$', link_id):
        return render_template('error.html',
            error_code=404,
            error_title='链接无效',
            error_message='链接格式不正确'), 404
    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    conn.close()

    if not link:
        return render_template('error.html',
            error_code=404,
            error_title='链接失效',
            error_message='链接不存在或已被停用'), 404

    if link['expires_at']:
        try:
            expire_time = datetime.strptime(link['expires_at'], '%Y-%m-%dT%H:%M')
            if datetime.now() > expire_time:
                return render_template('error.html',
                    error_code=410,
                    error_title='链接已过期',
                    error_message='该收集链接已超过有效期，不再接受文件上传。'), 410
        except (ValueError, TypeError):
            pass

    has_passcode = bool(link['passcode_plain'] and link['passcode_plain'].strip())
    verified = is_verified(link_id) if has_passcode else True
    ttl_minutes = int(get_setting('passcode_ttl_minutes', '120'))
    if ttl_minutes >= 60 and ttl_minutes % 60 == 0:
        ttl_display = f'{ttl_minutes // 60} 小时'
    elif ttl_minutes >= 60:
        ttl_display = f'{ttl_minutes // 60} 小时 {ttl_minutes % 60} 分钟'
    else:
        ttl_display = f'{ttl_minutes} 分钟'

    expire_display = '永不过期'
    if link['expires_at']:
        try:
            expire_time = datetime.strptime(link['expires_at'], '%Y-%m-%dT%H:%M')
            expire_display = expire_time.strftime('%Y-%m-%d %H:%M')
        except (ValueError, TypeError):
            pass

    return render_template('collect.html',
        link_id=link_id,
        task_title=link['title'],
        description=link['description'],
        verified=verified,
        has_passcode=has_passcode,
        in_wechat=is_wechat_browser(),
        max_file_size_gb=link['max_file_size_gb'],
        max_files=link['max_files'],
        allow_delete=bool(link['allow_delete']),
        site_title=get_setting('site_title', '文件收集器'),
        collect_footer_text=get_setting('collect_footer_text', ''),
        public_url=get_setting('public_url', ''),
        version=VERSION,
        passcode_ttl_display=ttl_display,
        expire_display=expire_display)

@app.route('/collect/<link_id>/verify', methods=['POST'])
def verify_passcode(link_id):
    """验证上传通行证"""
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败，请刷新页面重试'}), 403

    client_ip = _get_client_ip()
    if not rate_limit(f'verify_{link_id}_{client_ip}', max_attempts=5, window_seconds=60):
        return jsonify({'success': False, 'message': '验证过于频繁，请1分钟后再试'}), 429

    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    conn.close()

    if not link:
        return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

    has_passcode = bool(link['passcode_plain'] and link['passcode_plain'].strip())
    # 空通行证：直接放行
    if not has_passcode:
        session[f'verified_{link_id}'] = time.time()
        return jsonify({'success': True})

    passcode = request.form.get('passcode', '').strip()
    if passcode and check_password_hash(link['passcode'], passcode):
        session[f'verified_{link_id}'] = time.time()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': '通行证错误'}), 403

@app.route('/collect/<link_id>/logout', methods=['POST'])
def logout_passcode(link_id):
    """退出通行证，清除当前链接的验证缓存"""
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败'}), 403
    session.pop(f'verified_{link_id}', None)
    return jsonify({'success': True, 'message': '已退出通行证'})

# ============================================================
# 路由 - 分享页面（仅下载，无上传）
# ============================================================
@app.route('/share/<link_id>')
def share_page(link_id):
    """文件分享页面（仅查看和下载，无上传功能）"""
    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    conn.close()

    if not link:
        return render_template('error.html',
            error_code=404,
            error_title='链接失效',
            error_message='链接不存在或已被停用'), 404

    if link['expires_at']:
        try:
            expire_time = datetime.strptime(link['expires_at'], '%Y-%m-%dT%H:%M')
            if datetime.now() > expire_time:
                return render_template('error.html',
                    error_code=410,
                    error_title='链接已过期',
                    error_message='该分享链接已超过有效期。'), 410
        except (ValueError, TypeError):
            pass

    has_passcode = bool(link['passcode_plain'] and link['passcode_plain'].strip())
    verified = is_verified(link_id) if has_passcode else True
    ttl_minutes = int(get_setting('passcode_ttl_minutes', '120'))
    if ttl_minutes >= 60 and ttl_minutes % 60 == 0:
        ttl_display = f'{ttl_minutes // 60} 小时'
    elif ttl_minutes >= 60:
        ttl_display = f'{ttl_minutes // 60} 小时 {ttl_minutes % 60} 分钟'
    else:
        ttl_display = f'{ttl_minutes} 分钟'

    expire_display = '永不过期'
    if link['expires_at']:
        try:
            expire_time = datetime.strptime(link['expires_at'], '%Y-%m-%dT%H:%M')
            expire_display = expire_time.strftime('%Y-%m-%d %H:%M')
        except (ValueError, TypeError):
            pass

    return render_template('share.html',
        link_id=link_id,
        task_title=link['title'],
        description=link['description'],
        verified=verified,
        has_passcode=has_passcode,
        in_wechat=is_wechat_browser(),
        allow_delete=bool(link['allow_delete']),
        site_title=get_setting('site_title', '文件收集器'),
        collect_footer_text=get_setting('collect_footer_text', ''),
        public_url=get_setting('public_url', ''),
        version=VERSION,
        passcode_ttl_display=ttl_display,
        expire_display=expire_display)

@app.route('/share/<link_id>/verify', methods=['POST'])
def share_verify_passcode(link_id):
    """分享页验证通行证（复用 collect 验证逻辑）"""
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败，请刷新页面重试'}), 403

    client_ip = _get_client_ip()
    if not rate_limit(f'verify_{link_id}_{client_ip}', max_attempts=5, window_seconds=60):
        return jsonify({'success': False, 'message': '验证过于频繁，请1分钟后再试'}), 429

    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    conn.close()

    if not link:
        return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

    has_passcode = bool(link['passcode_plain'] and link['passcode_plain'].strip())
    # 空通行证：直接放行
    if not has_passcode:
        session[f'verified_{link_id}'] = time.time()
        return jsonify({'success': True})

    passcode = request.form.get('passcode', '').strip()
    if passcode and check_password_hash(link['passcode'], passcode):
        session[f'verified_{link_id}'] = time.time()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': '通行证错误'}), 403

@app.route('/share/<link_id>/logout', methods=['POST'])
def share_logout_passcode(link_id):
    """分享页退出通行证"""
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败'}), 403
    session.pop(f'verified_{link_id}', None)
    return jsonify({'success': True, 'message': '已退出通行证'})

@app.route('/share/<link_id>/records', methods=['GET'])
def share_get_records(link_id):
    """获取分享页文件列表"""
    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()

    if not link:
        conn.close()
        return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

    if not is_verified(link_id, link):
        conn.close()
        return jsonify({'success': False, 'message': '请先验证通行证'}), 403

    records = conn.execute(
        "SELECT id, original_name, file_size_display, uploaded_at, download_count FROM upload_records WHERE link_id = ? ORDER BY uploaded_at DESC LIMIT 50",
        (link_id,)
    ).fetchall()
    conn.close()

    return jsonify({
        'success': True,
        'allow_delete': bool(link['allow_delete']),
        'records': [dict(r) for r in records]
    })

@app.route('/share/<link_id>/preview/<int:record_id>', methods=['GET'])
def share_preview_record(link_id, record_id):
    """预览分享页的文件（内联显示）"""
    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    if not link:
        conn.close()
        return '链接不存在或已失效', 404

    if not is_verified(link_id, link):
        conn.close()
        return '请先验证通行证', 403

    record = conn.execute(
        "SELECT stored_path, original_name FROM upload_records WHERE id = ? AND link_id = ?",
        (record_id, link_id)
    ).fetchone()
    conn.close()
    if not record:
        return '文件不存在', 404

    upload_base = get_upload_base()
    real_path = os.path.realpath(record['stored_path'])
    real_base = os.path.realpath(upload_base)
    if not real_path.startswith(real_base + os.sep) and real_path != real_base:
        logger.warning(f"路径遍历攻击拦截: stored_path={record['stored_path']}, upload_base={real_base}")
        abort(403)
    directory = os.path.dirname(real_path)
    filename = os.path.basename(real_path)
    if not os.path.isfile(real_path):
        abort(404)

    ext = os.path.splitext(record['original_name'])[1].lower()
    image_exts = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'}
    pdf_ext = '.pdf'
    video_exts = {'.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'}

    if ext in image_exts:
        return send_from_directory(directory, filename, mimetype=f'image/{ext[1:]}', as_attachment=False)
    elif ext == pdf_ext:
        return send_from_directory(directory, filename, mimetype='application/pdf', as_attachment=False)
    elif ext in video_exts:
        return send_from_directory(directory, filename, as_attachment=False)
    else:
        return send_from_directory(directory, filename, as_attachment=True)


@app.route('/share/<link_id>/download/<int:record_id>', methods=['GET'])
def share_download_record(link_id, record_id):
    """分享页下载文件"""
    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    if not link:
        conn.close()
        return '链接不存在或已失效', 404

    if not is_verified(link_id, link):
        conn.close()
        return '请先验证通行证', 403

    record = conn.execute(
        "SELECT stored_path, original_name FROM upload_records WHERE id = ? AND link_id = ?",
        (record_id, link_id)
    ).fetchone()

    if not record:
        conn.close()
        return '文件不存在', 404

    conn.execute("UPDATE upload_records SET download_count = download_count + 1 WHERE id = ?", (record_id,))
    conn.commit()
    conn.close()

    return _safe_download(record['stored_path'], record['original_name'])

@app.route('/share/<link_id>/delete_record/<int:record_id>', methods=['POST'])
def share_delete_record(link_id, record_id):
    """分享页删除单条上传记录及文件 - 已禁用"""
    return jsonify({'success': False, 'message': '分享页面不支持删除操作'}), 403

@app.route('/collect/<link_id>/records', methods=['GET'])
def get_upload_records(link_id):
    """获取上传历史记录"""
    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()

    if not link:
        conn.close()
        return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

    if not is_verified(link_id, link):
        conn.close()
        return jsonify({'success': False, 'message': '请先验证通行证'}), 403

    total_uploaded = conn.execute(
        "SELECT COUNT(*) FROM upload_records WHERE link_id = ?", (link_id,)
    ).fetchone()[0]

    records = conn.execute(
        "SELECT id, original_name, file_size_display, uploaded_at, download_count FROM upload_records WHERE link_id = ? ORDER BY uploaded_at DESC LIMIT 50",
        (link_id,)
    ).fetchall()
    conn.close()

    return jsonify({
        'success': True,
        'allow_delete': bool(link['allow_delete']),
        'max_files': link['max_files'],
        'total_uploaded': total_uploaded,
        'records': [dict(r) for r in records]
    })

@app.route('/collect/<link_id>/preview/<int:record_id>', methods=['GET'])
def preview_record(link_id, record_id):
    """预览上传的文件（内联显示）"""
    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    if not link:
        conn.close()
        return '链接不存在或已失效', 404

    if not is_verified(link_id, link):
        conn.close()
        return '请先验证通行证', 403

    record = conn.execute(
        "SELECT stored_path, original_name FROM upload_records WHERE id = ? AND link_id = ?",
        (record_id, link_id)
    ).fetchone()
    conn.close()
    if not record:
        return '文件不存在', 404

    upload_base = get_upload_base()
    real_path = os.path.realpath(record['stored_path'])
    real_base = os.path.realpath(upload_base)
    if not real_path.startswith(real_base + os.sep) and real_path != real_base:
        logger.warning(f"路径遍历攻击拦截: stored_path={record['stored_path']}, upload_base={real_base}")
        abort(403)
    directory = os.path.dirname(real_path)
    filename = os.path.basename(real_path)
    if not os.path.isfile(real_path):
        abort(404)

    ext = os.path.splitext(record['original_name'])[1].lower()
    image_exts = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'}
    pdf_ext = '.pdf'
    video_exts = {'.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'}

    if ext in image_exts:
        return send_from_directory(directory, filename, mimetype=f'image/{ext[1:]}', as_attachment=False)
    elif ext == pdf_ext:
        return send_from_directory(directory, filename, mimetype='application/pdf', as_attachment=False)
    elif ext in video_exts:
        return send_from_directory(directory, filename, as_attachment=False)
    else:
        return send_from_directory(directory, filename, as_attachment=True)


@app.route('/collect/<link_id>/download/<int:record_id>', methods=['GET'])
def download_record(link_id, record_id):
    """下载上传历史记录中的文件"""
    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    if not link:
        conn.close()
        return '链接不存在或已失效', 404

    if not is_verified(link_id, link):
        conn.close()
        return '请先验证通行证', 403

    record = conn.execute(
        "SELECT stored_path, original_name FROM upload_records WHERE id = ? AND link_id = ?",
        (record_id, link_id)
    ).fetchone()

    if not record:
        conn.close()
        return '文件不存在', 404

    conn.execute("UPDATE upload_records SET download_count = download_count + 1 WHERE id = ?", (record_id,))
    conn.commit()
    conn.close()

    return _safe_download(record['stored_path'], record['original_name'])

@app.route('/collect/<link_id>/delete_record/<int:record_id>', methods=['POST'])
def delete_upload_record(link_id, record_id):
    """删除单条上传记录及文件"""
    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()

    if not link:
        conn.close()
        return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

    if not is_verified(link_id, link):
        conn.close()
        return jsonify({'success': False, 'message': '请先验证通行证'}), 403

    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败，请刷新页面重试'}), 403

    if not link['allow_delete']:
        conn.close()
        return jsonify({'success': False, 'message': '该链接不允许删除文件'}), 403

    record = conn.execute(
        "SELECT id, stored_path FROM upload_records WHERE id = ? AND link_id = ?",
        (record_id, link_id)
    ).fetchone()

    if not record:
        conn.close()
        return jsonify({'success': False, 'message': '记录不存在'}), 404

    try:
        _safe_delete(record['stored_path'])
    except Exception:
        pass

    conn.execute("DELETE FROM upload_records WHERE id = ?", (record_id,))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': '已删除'})

@app.route('/collect/<link_id>/upload', methods=['POST'])
def upload_file(link_id):
    """处理文件上传"""
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败，请刷新页面重试'}), 403

    # 上传频率限制
    client_ip = _get_client_ip()
    if not rate_limit(f'upload_{link_id}_{client_ip}', max_attempts=30, window_seconds=60):
        return jsonify({'success': False, 'message': '上传过于频繁，请稍后再试'}), 429

    conn = None
    try:
        conn = get_db()
        link = conn.execute(
            "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
        ).fetchone()

        if not link:
            return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

        # 空通行证直接放行，有通行证才需要验证
        if not is_verified(link_id, link):
            return jsonify({'success': False, 'message': '请先验证通行证'}), 403

        uploaded_files = request.files.getlist('file')
        if not uploaded_files:
            uploaded_files = request.files.getlist('files')

        if not uploaded_files:
            return jsonify({'success': False, 'message': '没有接收到文件'}), 400

        max_files = link['max_files']
        # max_files=0 表示不限制
        if max_files > 0 and len(uploaded_files) > max_files:
            return jsonify({
                'success': False,
                'message': f'单次最多上传 {max_files} 个文件'
            }), 400

        # 检查是否已超过上传总数上限（max_files=0 不限制）
        if max_files > 0:
            current_count = conn.execute(
                "SELECT COUNT(*) FROM upload_records WHERE link_id = ?", (link_id,)
            ).fetchone()[0]
            if current_count >= max_files:
                return jsonify({
                    'success': False,
                    'message': f'已达到最大上传数 {max_files} 个，无法继续上传'
                }), 400

        upload_dir = create_upload_dir(link_id)
        max_size_bytes = round(link['max_file_size_gb'] * 1024 * 1024 * 1024)
        results = []

        for file in uploaded_files:
            if not file or not file.filename:
                continue

            result = {'filename': file.filename, 'success': True}

            if not allowed_file(file.filename):
                result.update({'success': False, 'message': '不支持的文件类型'})
                results.append(result)
                continue

            file.seek(0, os.SEEK_END)
            size = file.tell()
            file.seek(0)

            if size > max_size_bytes:
                limit_display = f'{link["max_file_size_gb"]} GB'
                if link['max_file_size_gb'] < 1:
                    limit_mb = round(link['max_file_size_gb'] * 1024, 2)
                    limit_display = f'{limit_mb} MB'
                result.update({
                    'success': False,
                    'message': f'文件大小 {format_file_size(size)} 超过限制（上限 {limit_display}）'
                })
                results.append(result)
                continue

            safe_name = secure_filename(file.filename)
            if not safe_name:
                safe_name = 'unnamed_file'
            # 保持原文件名，同名则提示重复并禁止上传
            stored_name = safe_name
            stored_path = os.path.join(upload_dir, stored_name)
            if os.path.exists(stored_path):
                result.update({
                    'success': False,
                    'message': f'文件名 "{file.filename}" 已存在，请重命名后重新上传'
                })
                results.append(result)
                continue

            file.save(stored_path)
            logger.info(f"文件已保存: {stored_path} ({format_file_size(size)})")

            conn.execute(
                """INSERT INTO upload_records
                   (link_id, original_name, stored_name, stored_path, file_size,
                    file_size_display, uploader_ip)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (link_id, file.filename, stored_name, stored_path, size,
                 format_file_size(size), _get_client_ip())
            )
            conn.commit()

            result['size'] = format_file_size(size)
            results.append(result)

        success_count = sum(1 for r in results if r['success'])
        fail_count = sum(1 for r in results if not r['success'])

        logger.info(f"上传完成: link={link_id}, 成功={success_count}, 失败={fail_count}")

        return jsonify({
            'success': True,
            'results': results,
            'summary': f'成功 {success_count} 个' + (f'，失败 {fail_count} 个' if fail_count else '')
        })

    except Exception as e:
        logger.error(f"上传异常: link={link_id}, error={e}\n{traceback.format_exc()}")
        return jsonify({'success': False, 'message': '服务器内部错误，请稍后重试'}), 500

    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass

# ============================================================
# 路由 - 管理员后台
# ============================================================
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """管理员登录"""
    if request.method == 'POST':
        if not validate_csrf():
            flash('安全验证失败，请刷新页面重试')
            login_tip = get_setting('login_tip', '')
            return render_template('admin_login.html', login_tip=login_tip)

        client_ip = _get_client_ip()
        if not rate_limit(f'login_{client_ip}', max_attempts=5, window_seconds=60):
            flash('登录尝试过于频繁，请稍后再试')
            login_tip = get_setting('login_tip', '')
            return render_template('admin_login.html', login_tip=login_tip)

        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        admin_user = get_setting('admin_username', DEFAULT_ADMIN_USER)
        admin_hash = get_setting('admin_password_hash', '')

        if username == admin_user and check_password_hash(admin_hash, password):
            session.clear()
            session['is_admin'] = True
            session.permanent = True
            return redirect(url_for('admin_dashboard'))
        else:
            flash('用户名或密码错误')
            login_tip = get_setting('login_tip', '')
            return render_template('admin_login.html', login_tip=login_tip)

    login_tip = get_setting('login_tip', '')
    return render_template('admin_login.html', login_tip=login_tip)

@app.route('/admin')
@admin_required
def admin_dashboard():
    """管理后台首页"""
    conn = get_db()
    total_links = conn.execute("SELECT COUNT(*) FROM links").fetchone()[0]
    active_links = conn.execute(
        "SELECT COUNT(*) FROM links WHERE status = 'active'"
    ).fetchone()[0]
    total_uploads = conn.execute("SELECT COUNT(*) FROM upload_records").fetchone()[0]

    today = datetime.now().strftime('%Y-%m-%d')
    today_uploads = conn.execute(
        "SELECT COUNT(*) FROM upload_records WHERE date(uploaded_at) = ?", (today,)
    ).fetchone()[0]

    recent = conn.execute(
        """SELECT r.*, l.title as link_title
           FROM upload_records r
           LEFT JOIN links l ON r.link_id = l.id
           ORDER BY r.uploaded_at DESC LIMIT 5"""
    ).fetchall()
    conn.close()

    return render_template('admin_dashboard.html',
        total_links=total_links,
        active_links_count=active_links,
        total_uploads=total_uploads,
        today_uploads=today_uploads,
        recent_uploads=recent)

@app.route('/admin/links')
@admin_required
def admin_links():
    """收集链接管理"""
    conn = get_db()
    links = conn.execute(
        "SELECT * FROM links ORDER BY created_at DESC"
    ).fetchall()
    conn.close()

    # 为每个链接标记通行证状态（sqlite3.Row 不可变，需转为 dict）
    processed_links = []
    for link in links:
        d = dict(link)
        pp = d['passcode_plain']
        ph = d['passcode']
        # has_passcode_plain: 是否有明文通行证（非空字符串）
        link_has_pp = bool(pp and pp.strip())
        # is_empty_passcode: 是否为空通行证（passcode 是空字符串的哈希）
        is_empty_pc = check_password_hash(ph, '')
        # is_legacy: 旧版加密存储（passcode 不是空哈希，但没有明文）
        d['_is_legacy'] = not link_has_pp and not is_empty_pc
        d['_has_passcode'] = link_has_pp
        processed_links.append(d)

    return render_template('admin_links.html', links=processed_links, public_url=get_setting('public_url', ''),
                           defaults={'max_files': get_setting('max_files', str(DEFAULT_MAX_FILES)),
                                     'max_file_size_gb': get_setting('max_file_size_gb', str(DEFAULT_MAX_FILE_SIZE_GB))})

@app.route('/admin/links/create', methods=['POST'])
@admin_required
def create_link():
    """创建新的收集链接"""
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    passcode = request.form.get('passcode', '').strip()
    max_files = request.form.get('max_files', DEFAULT_MAX_FILES)
    max_file_size_gb = request.form.get('max_file_size_gb', str(DEFAULT_MAX_FILE_SIZE_GB))

    if not title:
        flash('标题不能为空')
        return redirect(url_for('admin_links'))

    # 通行证为空时给出警告提示（前端已拦截，此处为后端兜底）
    # 允许空通行证，但需要记录

    try:
        _mf = float(max_files)
        if _mf != int(_mf):
            raise ValueError('最大文件数量必须为整数')
        max_files = int(_mf)
        max_file_size_gb = round(float(max_file_size_gb), 2)
        if max_files < 0:
            raise ValueError('最大文件数量不能为负数')
        if max_file_size_gb < 0.01 or max_file_size_gb > 64:
            raise ValueError('单文件上限必须在 0.01-64 GB 之间')
    except ValueError as e:
        flash(str(e) if '必须' in str(e) else '数字格式错误')
        return redirect(url_for('admin_links'))

    expires_at = request.form.get('expires_at', '').strip()
    _max_expire_days = 30
    if not expires_at:
        expire_days = request.form.get('expire_days', '').strip()
        if expire_days:
            try:
                days = int(expire_days)
                if days == 0:
                    expires_at = None
                elif 1 <= days <= _max_expire_days:
                    expires_at = (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%dT%H:%M')
                else:
                    flash(f'有效期天数必须在 0-{_max_expire_days} 天之间')
                    return redirect(url_for('admin_links'))
            except ValueError:
                pass
    elif expires_at:
        # 验证日期格式和合法性（万年历校验）
        try:
            parsed = datetime.strptime(expires_at, '%Y-%m-%dT%H:%M')
            now = datetime.now()
            max_date = now + timedelta(days=_max_expire_days)
            if parsed <= now:
                flash('截止日期必须晚于当前时间')
                return redirect(url_for('admin_links'))
            if parsed > max_date:
                flash(f'截止日期不能超过 {_max_expire_days} 天')
                return redirect(url_for('admin_links'))
        except ValueError:
            flash('日期格式无效，请使用日历选择器选择日期时间')
            return redirect(url_for('admin_links'))

    link_id = generate_link_id()
    allow_delete = 1 if request.form.get('allow_delete') == '1' else 0
    if passcode:
        passcode_hash = generate_password_hash(passcode)
        passcode_plain = passcode
    else:
        # 空通行证：使用空字符串的哈希，passcode_plain 为空
        passcode_hash = generate_password_hash('')
        passcode_plain = ''

    conn = get_db()
    conn.execute(
        """INSERT INTO links (id, title, description, passcode, passcode_plain,
           max_file_size_gb, max_files, expires_at, allow_delete)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (link_id, title, description, passcode_hash, passcode_plain, max_file_size_gb, max_files, expires_at or None, allow_delete)
    )
    conn.commit()
    conn.close()

    flash(f'收集链接已创建: /collect/{link_id}')
    return redirect(url_for('admin_links'))

@app.route('/admin/links/<link_id>/edit', methods=['POST'])
@admin_required
def edit_link(link_id):
    """编辑收集链接"""
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    passcode = request.form.get('passcode', '').strip()
    empty_passcode = request.form.get('empty_passcode') == 'on'  # 新的空通行证复选框
    max_files = request.form.get('max_files', DEFAULT_MAX_FILES)
    max_file_size_gb = request.form.get('max_file_size_gb', str(DEFAULT_MAX_FILE_SIZE_GB))

    try:
        _mf = float(max_files)
        if _mf != int(_mf):
            raise ValueError('最大文件数量必须为整数')
        max_files = int(_mf)
        max_file_size_gb = round(float(max_file_size_gb), 2)
        if max_files < 0:
            raise ValueError('最大文件数量不能为负数')
        if max_file_size_gb < 0.01 or max_file_size_gb > 64:
            raise ValueError('单文件上限必须在 0.01-64 GB 之间')
    except ValueError as e:
        flash(str(e) if '必须' in str(e) else '数字格式错误')
        return redirect(url_for('admin_links'))

    if not title:
        flash('标题不能为空')
        return redirect(url_for('admin_links'))

    expires_at = request.form.get('expires_at', '').strip()
    clear_expiry = request.form.get('clear_expiry') == '1'
    _max_expire_days = 30
    if clear_expiry:
        expires_at = None
    elif not expires_at:
        expire_days = request.form.get('expire_days', '').strip()
        if expire_days:
            try:
                days = int(expire_days)
                if days == 0:
                    expires_at = None
                elif 1 <= days <= _max_expire_days:
                    expires_at = (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%dT%H:%M')
                else:
                    flash(f'有效期天数必须在 0-{_max_expire_days} 天之间')
                    return redirect(url_for('admin_links'))
            except ValueError:
                pass
    elif expires_at:
        # 验证日期格式和合法性（万年历校验）
        try:
            parsed = datetime.strptime(expires_at, '%Y-%m-%dT%H:%M')
            now = datetime.now()
            max_date = now + timedelta(days=_max_expire_days)
            if parsed <= now:
                flash('截止日期必须晚于当前时间')
                return redirect(url_for('admin_links'))
            if parsed > max_date:
                flash(f'截止日期不能超过 {_max_expire_days} 天')
                return redirect(url_for('admin_links'))
        except ValueError:
            flash('日期格式无效，请使用日历选择器选择日期时间')
            return redirect(url_for('admin_links'))

    conn = get_db()
    allow_delete = 1 if request.form.get('allow_delete') == '1' else 0

    # 处理通行证更新逻辑（新的复选框方案）
    if empty_passcode:
        # 用户勾选了空通行证：清空通行证（允许任何人访问）
        passcode_hash = generate_password_hash('')
        passcode_plain = ''
        conn.execute(
            """UPDATE links SET title=?, description=?, passcode=?, passcode_plain=?,
               max_file_size_gb=?, max_files=?, expires_at=?, allow_delete=?, updated_at=CURRENT_TIMESTAMP
               WHERE id=?""",
            (title, description, passcode_hash, passcode_plain, max_file_size_gb, max_files, expires_at or None, allow_delete, link_id)
        )
    elif passcode:
        # 用户输入了新通行证：设置新通行证
        passcode_hash = generate_password_hash(passcode)
        passcode_plain = passcode
        conn.execute(
            """UPDATE links SET title=?, description=?, passcode=?, passcode_plain=?,
               max_file_size_gb=?, max_files=?, expires_at=?, allow_delete=?, updated_at=CURRENT_TIMESTAMP
               WHERE id=?""",
            (title, description, passcode_hash, passcode_plain, max_file_size_gb, max_files, expires_at or None, allow_delete, link_id)
        )
    else:
        # 保持原有通行证不变 - 只更新其他字段
        conn.execute(
            """UPDATE links SET title=?, description=?,
               max_file_size_gb=?, max_files=?, expires_at=?, allow_delete=?, updated_at=CURRENT_TIMESTAMP
               WHERE id=?""",
            (title, description, max_file_size_gb, max_files, expires_at or None, allow_delete, link_id)
        )

    conn.commit()
    conn.close()

    flash('链接已更新')
    return redirect(url_for('admin_links'))

@app.route('/admin/links/<link_id>/toggle', methods=['POST'])
@admin_required
def toggle_link(link_id):
    """启用/禁用链接"""
    conn = get_db()
    link = conn.execute("SELECT status FROM links WHERE id = ?", (link_id,)).fetchone()
    if link:
        new_status = 'inactive' if link['status'] == 'active' else 'active'
        conn.execute("UPDATE links SET status = ? WHERE id = ?", (new_status, link_id))
        conn.commit()
    conn.close()
    flash('状态已更新')
    return redirect(url_for('admin_links'))

@app.route('/admin/links/<link_id>/delete', methods=['POST'])
@admin_required
def delete_link(link_id):
    """删除链接及关联的所有上传文件和记录"""
    conn = get_db()

    # 1. 查询所有关联的上传记录
    records = conn.execute(
        "SELECT id, stored_path FROM upload_records WHERE link_id = ?", (link_id,)
    ).fetchall()

    # 2. 删除磁盘上的文件（使用安全删除函数）
    deleted_count = 0
    for r in records:
        try:
            if _safe_delete(r['stored_path']):
                deleted_count += 1
        except OSError:
            pass

    # 3. 删除上传记录
    conn.execute("PRAGMA foreign_keys = OFF")
    conn.execute("DELETE FROM upload_records WHERE link_id = ?", (link_id,))
    # 4. 删除链接
    conn.execute("DELETE FROM links WHERE id = ?", (link_id,))
    conn.execute("PRAGMA foreign_keys = ON")
    conn.commit()
    conn.close()

    flash(f'链接已删除，同时清理了 {deleted_count} 个文件及 {len(records)} 条上传记录')
    return redirect(url_for('admin_links'))

@app.route('/admin/records')
@admin_required
def admin_records():
    """上传记录管理"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    link_filter = request.args.get('link_id', '').strip()

    conn = get_db()

    if link_filter:
        count = conn.execute(
            "SELECT COUNT(*) FROM upload_records r WHERE r.link_id = ?",
            (link_filter,)
        ).fetchone()[0]
    else:
        count = conn.execute(
            "SELECT COUNT(*) FROM upload_records r"
        ).fetchone()[0]

    total_pages = max(1, (count + per_page - 1) // per_page)
    offset = (page - 1) * per_page

    if link_filter:
        records = conn.execute(
            """SELECT r.*, l.title as link_title
               FROM upload_records r
               LEFT JOIN links l ON r.link_id = l.id
               WHERE r.link_id = ?
               ORDER BY r.uploaded_at DESC
               LIMIT ? OFFSET ?""",
            (link_filter, per_page, offset)
        ).fetchall()
    else:
        records = conn.execute(
            """SELECT r.*, l.title as link_title
               FROM upload_records r
               LEFT JOIN links l ON r.link_id = l.id
               ORDER BY r.uploaded_at DESC
               LIMIT ? OFFSET ?""",
            (per_page, offset)
        ).fetchall()

    links = conn.execute(
        "SELECT id, title FROM links ORDER BY created_at DESC"
    ).fetchall()
    conn.close()

    return render_template('admin_records.html',
        records=records,
        links=links,
        page=page,
        total_pages=total_pages,
        total_count=count,
        link_filter=link_filter)

@app.route('/admin/records/<int:record_id>/download')
@admin_required
def admin_download_record(record_id):
    """管理员下载上传记录中的文件"""
    conn = get_db()
    record = conn.execute(
        "SELECT stored_path, original_name FROM upload_records WHERE id = ?",
        (record_id,)
    ).fetchone()

    if not record:
        conn.close()
        return '文件不存在', 404

    conn.execute("UPDATE upload_records SET download_count = download_count + 1 WHERE id = ?", (record_id,))
    conn.commit()
    conn.close()

    return _safe_download(record['stored_path'], record['original_name'])

@app.route('/admin/records/<int:record_id>/delete', methods=['POST'])
@admin_required
def delete_record(record_id):
    """删除单条上传记录（同时删除文件）"""
    conn = get_db()
    record = conn.execute(
        "SELECT * FROM upload_records WHERE id = ?", (record_id,)
    ).fetchone()

    if record:
        try:
            _safe_delete(record['stored_path'])
        except OSError:
            pass
        conn.execute("DELETE FROM upload_records WHERE id = ?", (record_id,))
        conn.commit()

    conn.close()
    flash('记录已删除')
    return redirect(url_for('admin_records'))

@app.route('/admin/records/batch-delete', methods=['POST'])
@admin_required
def batch_delete_records():
    """批量删除记录"""
    ids = request.form.getlist('ids[]')
    if not ids:
        return jsonify({'success': False, 'message': '未选择记录'})

    conn = get_db()
    for rid in ids:
        record = conn.execute(
            "SELECT stored_path FROM upload_records WHERE id = ?", (rid,)
        ).fetchone()
        if record:
            try:
                _safe_delete(record['stored_path'])
            except OSError:
                pass
        conn.execute("DELETE FROM upload_records WHERE id = ?", (rid,))
    conn.commit()
    conn.close()

    flash(f'已删除 {len(ids)} 条记录')
    return redirect(url_for('admin_records'))

@app.route('/admin/settings', methods=['GET', 'POST'])
@admin_required
def admin_settings():
    """系统设置"""
    if request.method == 'POST':
        action = request.form.get('action', '')

        if action == 'account':
            new_username = request.form.get('new_username', '').strip()
            old_pass = request.form.get('old_password', '')
            new_pass = request.form.get('new_password', '')
            confirm_pass = request.form.get('confirm_password', '')

            admin_hash = get_setting('admin_password_hash', '')
            if not check_password_hash(admin_hash, old_pass):
                flash('原密码错误，无法修改账号信息')
            elif not new_username:
                flash('管理员账号不能为空')
            else:
                set_setting('admin_username', new_username)
                if new_pass:
                    if len(new_pass) < 8:
                        flash('新密码至少8位，且需包含字母和数字')
                    elif not re.search(r'[a-zA-Z]', new_pass) or not re.search(r'[0-9]', new_pass):
                        flash('新密码必须同时包含字母和数字')
                    elif new_pass != confirm_pass:
                        flash('两次密码不一致')
                    else:
                        set_setting('admin_password_hash', generate_password_hash(new_pass))
                        flash('账号信息修改成功')
                else:
                    flash('账号信息修改成功（密码未变）')

        elif action == 'login_tip':
            tip = request.form.get('login_tip_text', '').strip()
            set_setting('login_tip', tip)
            flash('登录页提示已更新')

        elif action == 'defaults':
            max_files = request.form.get('default_max_files', str(DEFAULT_MAX_FILES))
            max_size = request.form.get('default_max_size', str(DEFAULT_MAX_FILE_SIZE_GB))
            site_title = request.form.get('site_title', '文件收集器')

            try:
                _mf = float(max_files)
                if _mf != int(_mf):
                    raise ValueError('默认最大文件数必须为整数')
                max_files = int(_mf)
                max_size = round(float(max_size), 2)
                if max_files < 0:
                    raise ValueError('默认最大文件数不能为负数')
                if max_size < 0.01 or max_size > 64:
                    raise ValueError('单文件上限必须在 0.01-64 GB 之间')
            except ValueError as e:
                flash(str(e) if '必须' in str(e) else '默认值格式错误')
                return redirect(url_for('admin_settings'))

            set_setting('max_files', str(max_files))
            set_setting('max_file_size_gb', str(max_size))
            set_setting('site_title', site_title)
            flash('设置已保存')

        elif action == 'collect_page':
            footer_text = request.form.get('collect_footer_text', '').strip()
            public_url = request.form.get('public_url', '').strip()
            set_setting('collect_footer_text', footer_text)
            set_setting('public_url', public_url)
            flash('收集页设置已保存')

        elif action == 'landing_page':
            enabled = request.form.get('landing_page_enabled', '0')
            set_setting('landing_page_enabled', enabled)
            flash('首页设置已保存')

        elif action == 'passcode_ttl':
            minutes = request.form.get('passcode_ttl_minutes', '120')
            try:
                _m = float(minutes)
                if _m != int(_m):
                    raise ValueError('通行证有效期必须为整数')
                val = int(_m)
                if val < 1 or val > 43200:
                    raise ValueError('通行证有效期必须在 1-43200 分钟之间')
            except ValueError as e:
                flash(str(e) if '必须' in str(e) else '通行证有效期格式错误')
                return redirect(url_for('admin_settings'))
            set_setting('passcode_ttl_minutes', str(val))
            flash('通行证有效期已保存')

        elif action == 'upload_path':
            custom_path = request.form.get('custom_upload_path', '').strip()
            if custom_path:
                # 清空可能存在的子路径
                custom_path = os.path.normpath(custom_path)
                if not os.path.isabs(custom_path):
                    flash('上传路径必须是绝对路径，例如 /vol2/1000/文件收集')
                elif not os.path.exists(custom_path):
                    flash(f'路径不存在: {custom_path}')
                else:
                    set_setting('custom_upload_path', custom_path)
                    refresh_upload_base()
                    # 确保目录可写
                    try:
                        os.makedirs(UPLOAD_BASE, mode=0o755, exist_ok=True)
                    except PermissionError:
                        pass
                    flash('上传路径已更新。请确认飞牛应用设置中已授权该文件夹的读写权限。')
            else:
                set_setting('custom_upload_path', '')
                refresh_upload_base()
                flash('已恢复默认上传路径')

        elif action == 'blocked_extensions':
            raw = request.form.get('blocked_extensions_input', '').strip()
            # 留空则使用默认禁止列表
            if raw:
                import re as _re
                cleaned = _re.sub(r'\s+', ' ', raw).strip()
                set_setting('blocked_extensions', cleaned)
                flash('禁止上传的文件类型已更新')
            else:
                set_setting('blocked_extensions', '')
                flash('已恢复默认禁止列表（.exe .php .sh .bat 等危险类型）')

        return redirect(url_for('admin_settings'))

    admin_user = get_setting('admin_username', DEFAULT_ADMIN_USER)
    custom_upload_path = get_setting('custom_upload_path', '')
    defaults = {
        'max_files': get_setting('max_files', str(DEFAULT_MAX_FILES)),
        'max_file_size_gb': get_setting('max_file_size_gb', str(DEFAULT_MAX_FILE_SIZE_GB)),
        'site_title': get_setting('site_title', '文件收集器'),
        'login_tip': get_setting('login_tip', '默认账户 admin / admin123，请及时修改'),
        'collect_footer_text': get_setting('collect_footer_text', ''),
        'public_url': get_setting('public_url', ''),
        'landing_page_enabled': get_setting('landing_page_enabled', '1'),
        'passcode_ttl_minutes': get_setting('passcode_ttl_minutes', '120'),
        'blocked_extensions': get_setting('blocked_extensions', ''),
    }
    sys_info = {
        'db_path': os.path.dirname(DB_PATH),  # 仅显示目录，不暴露完整文件名
        'upload_base': get_upload_base(),
        'data_dir': os.path.basename(DATA_DIR) or DATA_DIR,
        'port': str(PORT),
    }
    return render_template('admin_settings.html',
        defaults=defaults,
        admin_username=admin_user,
        custom_upload_path=custom_upload_path,
        sys_info=sys_info,
        version=VERSION)

@app.route('/admin/settings/backup-db')
@admin_required
def backup_database():
    """下载数据库备份"""
    if not os.path.exists(DB_PATH):
        flash('数据库文件不存在')
        return redirect(url_for('admin_settings'))
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    download_name = f'file-collector-backup-{timestamp}.db'
    return send_from_directory(
        os.path.dirname(DB_PATH),
        os.path.basename(DB_PATH),
        download_name=download_name,
        as_attachment=True
    )

@app.route('/admin/settings/restore-db', methods=['POST'])
@admin_required
def restore_database():
    """导入数据库备份"""
    if 'db_file' not in request.files:
        flash('请选择数据库文件')
        return redirect(url_for('admin_settings'))

    file = request.files['db_file']
    if not file or not file.filename:
        flash('请选择数据库文件')
        return redirect(url_for('admin_settings'))

    if not file.filename.endswith('.db'):
        flash('仅支持 .db 格式的数据库文件')
        return redirect(url_for('admin_settings'))

    # 保存到临时位置并验证
    tmp = tempfile.NamedTemporaryFile(suffix='.db', delete=False)
    tmp_path = tmp.name
    tmp.close()
    try:
        file.save(tmp_path)

        # 验证文件头：SQLite 数据库前 16 字节必须是 "SQLite format 3\0"
        with open(tmp_path, 'rb') as f:
            header = f.read(16)
        if header != b'SQLite format 3\x00':
            flash('无效的数据库文件：文件格式不正确')
            os.unlink(tmp_path)
            return redirect(url_for('admin_settings'))

        # 验证是否为有效的 SQLite 数据库且包含必要表结构
        try:
            test_conn = sqlite3.connect(tmp_path)
            test_conn.row_factory = sqlite3.Row
            tables = test_conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('settings','links','upload_records')"
            ).fetchall()
            test_conn.close()
            if len(tables) < 3:
                flash('无效的数据库文件：缺少必要的表结构')
                os.unlink(tmp_path)
                return redirect(url_for('admin_settings'))
        except sqlite3.Error:
            flash('无效的数据库文件：无法读取数据库')
            os.unlink(tmp_path)
            return redirect(url_for('admin_settings'))

        # 备份当前数据库
        backup_path = DB_PATH + f'.bak_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
        shutil.copy2(DB_PATH, backup_path)

        # 替换数据库
        shutil.copy2(tmp_path, DB_PATH)
        os.unlink(tmp_path)

        # 重新初始化（执行迁移）
        init_db()
        refresh_upload_base()  # 恢复后刷新自定义上传路径

        # 强制重置 secret_key 和 admin 密码，防止还原数据库导致账户接管
        new_secret = secrets.token_hex(32)
        set_setting('secret_key', new_secret)
        app.secret_key = new_secret

        # 检查还原后的数据库中的路径是否安全（在上传目录范围内）
        conn = get_db()
        rows = conn.execute("SELECT id, stored_path FROM upload_records").fetchall()
        bad_paths = 0
        upload_base = get_upload_base()
        real_base = os.path.realpath(upload_base)
        for row in rows:
            try:
                real_path = os.path.realpath(row['stored_path'])
                if not (real_path.startswith(real_base + os.sep) or real_path == real_base):
                    logger.warning(f"还原数据库发现不安全路径: {row['stored_path']}")
                    bad_paths += 1
            except Exception:
                bad_paths += 1
        conn.close()

        flash(f'数据库已成功导入！Secret Key 已重置，请重新登录。旧数据库已备份。')
        if bad_paths > 0:
            flash(f'警告：发现 {bad_paths} 条记录的文件路径不在上传目录中，已跳过删除保护。')

        # 清除当前 session 强制重新登录
        session.clear()
    except Exception as e:
        logger.error(f"数据库还原失败: {e}")
        flash(f'导入失败，请检查文件是否正确')
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return redirect(url_for('admin_settings'))

@app.route('/logout')
def logout():
    """退出登录"""
    session.clear()
    return redirect(url_for('admin_login'))

# ============================================================
# API 路由
# ============================================================
@app.route('/api/status')
def api_status():
    """应用状态检查"""
    conn = get_db()
    try:
        conn.execute("SELECT 1 FROM settings LIMIT 1")
        db_ok = True
    except:
        db_ok = False
    conn.close()

    return jsonify({
        'status': 'running',
        'db_ok': db_ok,
        'upload_dir_exists': os.path.isdir(UPLOAD_BASE),
    })

@app.route('/api/check-update')
@admin_required
def check_update():
    """检查 GitHub Releases 是否有新版本"""
    try:
        req = urllib.request.Request(
            'https://api.github.com/repos/Contribuv/file-collector/releases',
            headers={
                'User-Agent': 'file-collector/' + VERSION,
                'Accept': 'application/vnd.github.v3+json',
            }
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            import json
            releases = json.loads(resp.read().decode('utf-8'))

        if not releases:
            return jsonify({'has_update': False})

        # 从最新 release 提取版本号
        latest = releases[0]
        tag = latest.get('tag_name', '').lstrip('v')
        html_url = latest.get('html_url', 'https://github.com/Contribuv/file-collector/releases')

        def parse_version(v):
            parts = v.split('.')
            return tuple(int(p) for p in parts if p.isdigit())

        try:
            if parse_version(tag) > parse_version(VERSION):
                return jsonify({'has_update': True, 'latest_version': tag, 'url': html_url})
        except (ValueError, IndexError):
            pass

        return jsonify({'has_update': False})
    except Exception as e:
        logger.warning(f"检查更新失败: {e}")
        return jsonify({'has_update': False, 'error': '检查更新失败'})

# ============================================================
# 错误处理
# ============================================================
@app.errorhandler(500)
def internal_error(e):
    """500 错误处理 - API 路由返回 JSON"""
    logger.error(f"500 错误: {request.path}\n{traceback.format_exc()}")
    # 对 collect/api 路由返回 JSON
    if '/collect/' in request.path or '/api/' in request.path:
        return jsonify({'success': False, 'message': '服务器内部错误，请稍后重试'}), 500
    return render_template('error.html',
        error_code=500,
        error_title='服务器内部错误',
        error_message='服务器遇到内部错误，无法完成您的请求。'), 500

@app.errorhandler(404)
def page_not_found(e):
    return render_template('error.html',
        error_code=404,
        error_title='页面未找到',
        error_message='您访问的页面不存在或已被移除。'), 404

@app.errorhandler(410)
def page_gone(e):
    return render_template('error.html',
        error_code=410,
        error_title='资源已失效',
        error_message='该资源已过期或不再可用。'), 410


# ============================================================
# WSGI 入口（供 Gunicorn 调用）
# ============================================================
# app 对象已在文件顶部创建，Gunicorn 通过 `app:app` 加载

if __name__ == '__main__':
    print(f"文件收集器启动中...")
    print(f"数据目录: {DATA_DIR}")
    print(f"上传目录: {UPLOAD_BASE}")
    print(f"监听端口: {PORT}")
    print(f"管理后台: http://localhost:{PORT}/admin")
    print(f"调试模式: {'开启' if DEBUG_MODE else '关闭'}")
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG_MODE)
