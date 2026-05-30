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
import hashlib
import sqlite3
import shutil
import secrets
import logging
import traceback
import tempfile
from datetime import datetime, timedelta
from functools import wraps
from pathlib import Path

from flask import (
    Flask, request, render_template, redirect, url_for,
    session, jsonify, flash, send_from_directory, abort
)
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

# ============================================================
# 配置 - 适配 fnOS 环境
# ============================================================
VERSION = "1.0.63"

# 模板目录指向 app/server/templates
_TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
_STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')

app = Flask(__name__, template_folder=_TEMPLATE_DIR, static_folder=_STATIC_DIR)
app.config['TEMPLATES_AUTO_RELOAD'] = True

# 会话安全配置
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=8)

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
# 数据库存储：优先 TRIM_DATA_SHARE_PATHS → TRIM_PKGVAR → /tmp
# TRIM_DATA_SHARE_PATHS 是飞牛官方应用文件目录，安装时自动分配
_share_raw = os.environ.get('TRIM_DATA_SHARE_PATHS', '')
_share_base = _share_raw.split(':')[0] if _share_raw else None

_DATA_BASE = (
    _share_base or
    os.environ.get('TRIM_PKGVAR') or
    '/tmp/file-collector'
)
DATA_DIR = os.environ.get('DATA_DIR', os.path.join(_DATA_BASE, 'data'))
UPLOAD_BASE = os.environ.get('UPLOAD_BASE', os.path.join(_DATA_BASE, 'uploads'))
PORT = int(os.environ.get('PORT',
    os.environ.get('TRIM_SERVICE_PORT', 5557)))
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
            max_file_size_gb INTEGER DEFAULT 1,
            max_files INTEGER DEFAULT 10,
            target_folder TEXT DEFAULT '',
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
            conn.execute("ALTER TABLE links ADD COLUMN max_file_size_gb INTEGER DEFAULT 1")
            conn.execute("UPDATE links SET max_file_size_gb = max_file_size_mb / 1024 WHERE max_file_size_mb IS NOT NULL AND max_file_size_gb = 1")
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

    # 初始化默认设置
    defaults = {
        'admin_username': DEFAULT_ADMIN_USER,
        'admin_password_hash': generate_password_hash(DEFAULT_ADMIN_PASS),
        'max_file_size_gb': str(DEFAULT_MAX_FILE_SIZE_GB),
        'max_files': str(DEFAULT_MAX_FILES),
        'site_title': '文件收集器',
        'secret_key': secrets.token_hex(32),
        'login_tip': '默认账户 admin / admin123，请及时修改',
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
    """简单的内存频率限制"""
    now = time.time()
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
    token = request.form.get('csrf_token', '')
    expected = session.get('csrf_token', '')
    if not token or not expected or not secrets.compare_digest(token, expected):
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

def is_wechat_browser():
    """检测是否来自微信浏览器"""
    ua = request.headers.get('User-Agent', '').lower()
    return 'micromessenger' in ua

def is_verified(link_id):
    """检查当前 session 中通行证是否已验证且未过期"""
    ts = session.get(f'verified_{link_id}', 0)
    return isinstance(ts, (int, float)) and (time.time() - ts) < get_passcode_ttl()

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
        if check_password_hash(admin_hash, DEFAULT_ADMIN_PASS):
            flash('安全提醒：您仍在使用默认密码，请立即修改！')
        return f(*args, **kwargs)
    return decorated

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

def allowed_file(filename):
    """允许所有文件类型上传"""
    return True

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

    upload_dir = os.path.join(UPLOAD_BASE, folder_name)
    os.makedirs(upload_dir, mode=0o755, exist_ok=True)

    # 确保目录可写（修复 NAS 上权限不一致的问题）
    if not os.access(upload_dir, os.W_OK):
        try:
            os.chmod(upload_dir, 0o755)
        except Exception:
            pass
        if not os.access(upload_dir, os.W_OK):
            raise PermissionError(f'上传目录无写入权限: {upload_dir}')

    return upload_dir

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

    verified = is_verified(link_id)
    ttl_minutes = int(get_setting('passcode_ttl_minutes', '120'))
    if ttl_minutes >= 60 and ttl_minutes % 60 == 0:
        ttl_display = f'{ttl_minutes // 60} 小时'
    elif ttl_minutes >= 60:
        ttl_display = f'{ttl_minutes // 60} 小时 {ttl_minutes % 60} 分钟'
    else:
        ttl_display = f'{ttl_minutes} 分钟'

    return render_template('collect.html',
        link_id=link_id,
        task_title=link['title'],
        description=link['description'],
        verified=verified,
        in_wechat=is_wechat_browser(),
        max_file_size_gb=link['max_file_size_gb'],
        max_files=link['max_files'],
        allow_delete=bool(link['allow_delete']),
        site_title=get_setting('site_title', '文件收集器'),
        collect_footer_text=get_setting('collect_footer_text', ''),
        public_url=get_setting('public_url', ''),
        version=VERSION,
        passcode_ttl_display=ttl_display)

@app.route('/collect/<link_id>/verify', methods=['POST'])
def verify_passcode(link_id):
    """验证上传通行证"""
    client_ip = request.remote_addr or '0.0.0.0'
    if not rate_limit(f'verify_{link_id}_{client_ip}', max_attempts=5, window_seconds=60):
        return jsonify({'success': False, 'message': '验证过于频繁，请1分钟后再试'}), 429

    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    conn.close()

    if not link:
        return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

    passcode = request.form.get('passcode', '').strip()
    if passcode == link['passcode']:
        session[f'verified_{link_id}'] = time.time()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': '通行证错误'}), 403

@app.route('/collect/<link_id>/logout', methods=['POST'])
def logout_passcode(link_id):
    """退出通行证，清除当前链接的验证缓存"""
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

    verified = is_verified(link_id)
    ttl_minutes = int(get_setting('passcode_ttl_minutes', '120'))
    if ttl_minutes >= 60 and ttl_minutes % 60 == 0:
        ttl_display = f'{ttl_minutes // 60} 小时'
    elif ttl_minutes >= 60:
        ttl_display = f'{ttl_minutes // 60} 小时 {ttl_minutes % 60} 分钟'
    else:
        ttl_display = f'{ttl_minutes} 分钟'

    return render_template('share.html',
        link_id=link_id,
        task_title=link['title'],
        description=link['description'],
        verified=verified,
        in_wechat=is_wechat_browser(),
        allow_delete=bool(link['allow_delete']),
        site_title=get_setting('site_title', '文件收集器'),
        collect_footer_text=get_setting('collect_footer_text', ''),
        public_url=get_setting('public_url', ''),
        version=VERSION,
        passcode_ttl_display=ttl_display)

@app.route('/share/<link_id>/verify', methods=['POST'])
def share_verify_passcode(link_id):
    """分享页验证通行证（复用 collect 验证逻辑）"""
    client_ip = request.remote_addr or '0.0.0.0'
    if not rate_limit(f'verify_{link_id}_{client_ip}', max_attempts=5, window_seconds=60):
        return jsonify({'success': False, 'message': '验证过于频繁，请1分钟后再试'}), 429

    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    conn.close()

    if not link:
        return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

    passcode = request.form.get('passcode', '').strip()
    if passcode == link['passcode']:
        session[f'verified_{link_id}'] = time.time()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': '通行证错误'}), 403

@app.route('/share/<link_id>/logout', methods=['POST'])
def share_logout_passcode(link_id):
    """分享页退出通行证"""
    session.pop(f'verified_{link_id}', None)
    return jsonify({'success': True, 'message': '已退出通行证'})

@app.route('/share/<link_id>/records', methods=['GET'])
def share_get_records(link_id):
    """获取分享页文件列表"""
    if not is_verified(link_id):
        return jsonify({'success': False, 'message': '请先验证通行证'}), 403

    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()

    if not link:
        conn.close()
        return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

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

@app.route('/share/<link_id>/download/<int:record_id>', methods=['GET'])
def share_download_record(link_id, record_id):
    """分享页下载文件"""
    if not is_verified(link_id):
        return jsonify({'success': False, 'message': '请先验证通行证'}), 403

    conn = get_db()
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

    directory = os.path.dirname(record['stored_path'])
    filename = os.path.basename(record['stored_path'])
    return send_from_directory(
        directory, filename,
        download_name=record['original_name'],
        as_attachment=True
    )

@app.route('/share/<link_id>/delete_record/<int:record_id>', methods=['POST'])
def share_delete_record(link_id, record_id):
    """分享页删除单条上传记录及文件"""
    if not is_verified(link_id):
        return jsonify({'success': False, 'message': '请先验证通行证'}), 403

    conn = get_db()
    link = conn.execute(
        "SELECT allow_delete FROM links WHERE id = ?", (link_id,)
    ).fetchone()

    if not link or not link['allow_delete']:
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
        if os.path.exists(record['stored_path']):
            os.remove(record['stored_path'])
    except Exception:
        pass

    conn.execute("DELETE FROM upload_records WHERE id = ?", (record_id,))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': '已删除'})

@app.route('/collect/<link_id>/records', methods=['GET'])
def get_upload_records(link_id):
    """获取上传历史记录"""
    if not is_verified(link_id):
        return jsonify({'success': False, 'message': '请先验证通行证'}), 403

    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()

    if not link:
        conn.close()
        return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

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

@app.route('/collect/<link_id>/download/<int:record_id>', methods=['GET'])
def download_record(link_id, record_id):
    """下载上传历史记录中的文件"""
    if not is_verified(link_id):
        return jsonify({'success': False, 'message': '请先验证通行证'}), 403

    conn = get_db()
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

    directory = os.path.dirname(record['stored_path'])
    filename = os.path.basename(record['stored_path'])
    return send_from_directory(
        directory, filename,
        download_name=record['original_name'],
        as_attachment=True
    )

@app.route('/collect/<link_id>/delete_record/<int:record_id>', methods=['POST'])
def delete_upload_record(link_id, record_id):
    """删除单条上传记录及文件"""
    if not is_verified(link_id):
        return jsonify({'success': False, 'message': '请先验证通行证'}), 403

    conn = get_db()
    link = conn.execute(
        "SELECT allow_delete FROM links WHERE id = ?", (link_id,)
    ).fetchone()

    if not link or not link['allow_delete']:
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
        if os.path.exists(record['stored_path']):
            os.remove(record['stored_path'])
    except Exception:
        pass

    conn.execute("DELETE FROM upload_records WHERE id = ?", (record_id,))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': '已删除'})

@app.route('/collect/<link_id>/upload', methods=['POST'])
def upload_file(link_id):
    """处理文件上传"""
    conn = None
    try:
        conn = get_db()
        link = conn.execute(
            "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
        ).fetchone()

        if not link:
            return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

        if not is_verified(link_id):
            return jsonify({'success': False, 'message': '请先验证通行证'}), 403

        uploaded_files = request.files.getlist('file')
        if not uploaded_files:
            uploaded_files = request.files.getlist('files')

        if not uploaded_files:
            return jsonify({'success': False, 'message': '没有接收到文件'}), 400

        max_files = link['max_files']
        if len(uploaded_files) > max_files:
            return jsonify({
                'success': False,
                'message': f'单次最多上传 {max_files} 个文件'
            }), 400

        upload_dir = create_upload_dir(link_id)
        max_size_bytes = link['max_file_size_gb'] * 1024 * 1024 * 1024
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
                result.update({
                    'success': False,
                    'message': f'文件超过 {link["max_file_size_gb"]}GB 限制'
                })
                results.append(result)
                continue

            safe_name = secure_filename(file.filename)
            if not safe_name:
                safe_name = 'unnamed_file'
            stored_name = safe_name
            stored_path = os.path.join(upload_dir, stored_name)

            file.save(stored_path)
            logger.info(f"文件已保存: {stored_path} ({format_file_size(size)})")

            conn.execute(
                """INSERT INTO upload_records
                   (link_id, original_name, stored_name, stored_path, file_size,
                    file_size_display, uploader_ip)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (link_id, file.filename, stored_name, stored_path, size,
                 format_file_size(size), request.remote_addr)
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
        return jsonify({'success': False, 'message': f'服务器内部错误: {str(e)}'}), 500

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
        client_ip = request.remote_addr or '0.0.0.0'
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
    return render_template('admin_links.html', links=links, public_url=get_setting('public_url', ''))

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

    if not passcode:
        flash('通行证不能为空')
        return redirect(url_for('admin_links'))

    try:
        max_files = int(max_files)
        max_file_size_gb = int(float(max_file_size_gb))
    except ValueError:
        flash('数字格式错误')
        return redirect(url_for('admin_links'))

    expires_at = request.form.get('expires_at', '').strip()
    if not expires_at:
        expire_days = request.form.get('expire_days', '').strip()
        if expire_days:
            try:
                days = int(expire_days)
                if days > 0:
                    expires_at = (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%dT%H:%M')
            except ValueError:
                pass

    link_id = generate_link_id()
    allow_delete = 1 if request.form.get('allow_delete') == '1' else 0

    conn = get_db()
    conn.execute(
        """INSERT INTO links (id, title, description, passcode,
           max_file_size_gb, max_files, expires_at, allow_delete)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (link_id, title, description, passcode, max_file_size_gb, max_files, expires_at or None, allow_delete)
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
    max_files = request.form.get('max_files', DEFAULT_MAX_FILES)
    max_file_size_gb = request.form.get('max_file_size_gb', str(DEFAULT_MAX_FILE_SIZE_GB))

    try:
        max_files = int(max_files)
        max_file_size_gb = int(float(max_file_size_gb))
    except ValueError:
        flash('数字格式错误')
        return redirect(url_for('admin_links'))

    if not title or not passcode:
        flash('标题和通行证不能为空')
        return redirect(url_for('admin_links'))

    expires_at = request.form.get('expires_at', '').strip()
    clear_expiry = request.form.get('clear_expiry') == '1'
    if clear_expiry:
        expires_at = None
    elif not expires_at:
        expire_days = request.form.get('expire_days', '').strip()
        if expire_days:
            try:
                days = int(expire_days)
                if days > 0:
                    expires_at = (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%dT%H:%M')
            except ValueError:
                pass

    conn = get_db()
    allow_delete = 1 if request.form.get('allow_delete') == '1' else 0
    conn.execute(
        """UPDATE links SET title=?, description=?, passcode=?,
           max_file_size_gb=?, max_files=?, expires_at=?, allow_delete=?, updated_at=CURRENT_TIMESTAMP
           WHERE id=?""",
        (title, description, passcode, max_file_size_gb, max_files, expires_at or None, allow_delete, link_id)
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

    # 2. 删除磁盘上的文件
    deleted_count = 0
    for r in records:
        try:
            if os.path.exists(r['stored_path']):
                os.remove(r['stored_path'])
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

    directory = os.path.dirname(record['stored_path'])
    filename = os.path.basename(record['stored_path'])
    return send_from_directory(
        directory, filename,
        download_name=record['original_name'],
        as_attachment=True
    )

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
            os.remove(record['stored_path'])
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
                os.remove(record['stored_path'])
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
                    if len(new_pass) < 6:
                        flash('新密码至少6位')
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

            set_setting('max_files', max_files)
            set_setting('max_file_size_gb', max_size)
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
                val = int(minutes)
                if val < 1:
                    val = 1
                elif val > 43200:
                    val = 43200
            except ValueError:
                val = 120
            set_setting('passcode_ttl_minutes', str(val))
            flash('通行证有效期已保存')

        return redirect(url_for('admin_settings'))

    admin_user = get_setting('admin_username', DEFAULT_ADMIN_USER)
    defaults = {
        'max_files': get_setting('max_files', str(DEFAULT_MAX_FILES)),
        'max_file_size_gb': get_setting('max_file_size_gb', str(DEFAULT_MAX_FILE_SIZE_GB)),
        'site_title': get_setting('site_title', '文件收集器'),
        'login_tip': get_setting('login_tip', '默认账户 admin / admin123，请及时修改'),
        'collect_footer_text': get_setting('collect_footer_text', ''),
        'public_url': get_setting('public_url', ''),
        'landing_page_enabled': get_setting('landing_page_enabled', '1'),
        'passcode_ttl_minutes': get_setting('passcode_ttl_minutes', '120'),
    }
    sys_info = {
        'db_path': DB_PATH,
        'upload_base': UPLOAD_BASE,
        'data_dir': DATA_DIR,
        'port': str(PORT),
    }
    return render_template('admin_settings.html',
        defaults=defaults,
        admin_username=admin_user,
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

        # 验证是否为有效的 SQLite 数据库
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
        except sqlite3.Error as e:
            flash(f'无效的数据库文件：{e}')
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

        # 刷新 secret_key
        global app
        _key = get_setting('secret_key', None)
        if _key:
            app.secret_key = _key

        flash(f'数据库已成功导入！旧数据库已备份至 {os.path.basename(backup_path)}')
    except Exception as e:
        flash(f'导入失败：{e}')
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
