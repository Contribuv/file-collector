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
import json
import time
import uuid
import sqlite3
import shutil
import secrets
import logging
import unicodedata
import traceback
import tempfile
import threading
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
import bleach
import mimetypes
# smtplib / email 延迟导入（仅邮件功能需要，启动时跳过 ~50ms）

# 确保 CSS / JS 等静态资源的 MIME 类型注册正确
# 某些精简环境（如 fnOS）的 mimetypes 数据库可能缺失这些映射
_ESSENTIAL_MIMETYPES = {
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.mjs':  'application/javascript',
    '.json': 'application/json',
    '.svg':  'image/svg+xml',
    '.ico':  'image/vnd.microsoft.icon',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
    '.html': 'text/html',
    '.htm':  'text/html',
    '.xml':  'application/xml',
    '.txt':  'text/plain; charset=utf-8',
    '.pdf':  'application/pdf',
}
for _ext, _mime in _ESSENTIAL_MIMETYPES.items():
    mimetypes.add_type(_mime, _ext)


# ============================================================
# HTML 压缩 — 去除注释、压缩标签间空白，减小 ~15-30% 响应体积
# ============================================================
import re as _re

_HTML_COMMENT_RE = _re.compile(r'<!--(?!\[if\b).*?-->', _re.DOTALL)
_HTML_TAG_WS_RE  = _re.compile(r'>\s{2,}<')
_HTML_SPACE_RE   = _re.compile(r' {2,}')
_MAX_COMPRESS_BYTES = 512 * 1024  # 超过 512KB 的页面跳过压缩，避免阻塞

def _minify_html(html: str) -> str:
    """压缩 HTML：去掉注释、压缩标签间空白、合并多余空格。
    保护 <pre>/<textarea>/<script>/<style> 内部内容不被篡改。"""
    if len(html) > _MAX_COMPRESS_BYTES:
        return html

    # 1. 保护 <pre>/<textarea>/<script>/<style> 块 — 内容原样保留
    preserved: list[str] = []
    def _save(m: _re.Match) -> str:
        preserved.append(m.group(0))
        return f'\x00P{preserved.__len__()-1}\x00'
    for tag in ('script', 'style', 'pre', 'textarea'):
        html = _re.sub(
            rf'<{tag}[\s>][\s\S]*?</{tag}>',
            _save, html, flags=_re.IGNORECASE
        )

    # 2. 去掉 HTML 注释（保留 IE 条件注释）
    html = _HTML_COMMENT_RE.sub('', html)

    # 3. 压缩标签间连续空白
    html = _HTML_TAG_WS_RE.sub('><', html)

    # 4. 合并文本中多余空格
    html = _HTML_SPACE_RE.sub(' ', html)

    # 5. 去掉首尾空白
    html = html.strip()

    # 6. 还原受保护块
    for i, chunk in enumerate(preserved):
        html = html.replace(f'\x00P{i}\x00', chunk)

    return html


# ============================================================
# 配置 - 适配 fnOS 环境
# ============================================================
VERSION = "2.1.22"

# 模板目录指向 app/server/templates
_TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
_STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')

app = Flask(__name__, template_folder=_TEMPLATE_DIR, static_folder=_STATIC_DIR)
app.config['TEMPLATES_AUTO_RELOAD'] = False  # 生产环境关闭，每次请求不再检查文件变更（节省 ~50ms/请求）
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 3600 * 24  # 静态资源缓存 1 天
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024 * 1024  # 64GB 硬限制，防止超大文件耗尽磁盘
app.config['MAX_FORM_MEMORY_SIZE'] = 1 * 1024 * 1024  # 超过 1MB 的文件流式写入磁盘，避免内存溢出

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
    """确保 CSRF token 在 session 中初始化，并保持已登录 session 永久有效"""
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(32)
    # 已登录用户每请求标记 permanent=True，防止后续 session 修改（如 flash）导致
    # cookie 降级为浏览器会话级而丢失（表现为"等一会儿又要登陆"）
    if session.get('user_id'):
        session.permanent = True

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
    
    # 数据库迁移 - 重要：必须先创建users表（其他表依赖它）
    # 1. 检查并创建 users 表（如果不存在）
    try:
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if not cursor.fetchone():
            conn.execute('''
                CREATE TABLE users (
                    id TEXT PRIMARY KEY,
                    username TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    email TEXT DEFAULT '',
                    nickname TEXT DEFAULT '',
                    is_admin INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login_at TIMESTAMP
                )
            ''')
            conn.commit()
            logger.info("已创建 users 表")
    except Exception as e:
        print(f"数据库迁移错误(users): {e}")
    
    # 2. 检查并创建 invite_codes 表（如果不存在）
    try:
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='invite_codes'")
        if not cursor.fetchone():
            conn.execute('''
                CREATE TABLE invite_codes (
                    id TEXT PRIMARY KEY,
                    code TEXT NOT NULL UNIQUE,
                    expires_at TIMESTAMP NOT NULL,
                    used_by TEXT,
                    used_at TIMESTAMP,
                    created_by TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
            logger.info("已创建 invite_codes 表")
        # 索引始终尝试创建（升级场景下表可能已由 upgrade_callback 创建）
        conn.execute("CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code)")
        conn.commit()
    except Exception as e:
        print(f"数据库迁移错误(invite_codes): {e}")
    
    # 3. 创建其他基础表（使用单独的CREATE TABLE语句，避免外键约束问题）
    try:
        # 3.1 创建 settings 表
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'")
        if not cursor.fetchone():
            conn.execute('''
                CREATE TABLE settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                )
            ''')
            conn.commit()
            logger.info("已创建 settings 表")
    except Exception as e:
        print(f"数据库迁移错误(settings): {e}")

    try:
        # 3.2 创建 links 表（不使用外键约束，应用层处理关联）
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='links'")
        if not cursor.fetchone():
            conn.execute('''
                CREATE TABLE links (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL DEFAULT '',
                    title TEXT NOT NULL,
                    description TEXT DEFAULT '',
                    passcode TEXT NOT NULL,
                    max_file_size_gb REAL DEFAULT 1,
                    max_files INTEGER DEFAULT 10,
                    target_folder TEXT DEFAULT '',
                    folder_name TEXT DEFAULT '',
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
            logger.info("已创建 links 表")
        # 索引始终尝试创建
        conn.execute("CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_links_user_created ON links(user_id, created_at)")
        conn.commit()
    except Exception as e:
        print(f"数据库迁移错误(links): {e}")

    try:
        # 3.3 创建 upload_records 表（不使用外键约束，应用层处理关联）
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='upload_records'")
        if not cursor.fetchone():
            conn.execute('''
                CREATE TABLE upload_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL DEFAULT '',
                    link_id TEXT NOT NULL,
                    original_name TEXT NOT NULL,
                    stored_name TEXT NOT NULL,
                    stored_path TEXT NOT NULL,
                    file_size INTEGER NOT NULL,
                    file_size_display TEXT DEFAULT '',
                    uploader_ip TEXT DEFAULT '',
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    download_count INTEGER DEFAULT 0
                )
            ''')
            conn.commit()
            logger.info("已创建 upload_records 表")
        # 索引始终尝试创建
        conn.execute("CREATE INDEX IF NOT EXISTS idx_records_link_id ON upload_records(link_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_records_uploaded_at ON upload_records(uploaded_at)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_records_user_id ON upload_records(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_records_link_uploaded ON upload_records(link_id, uploaded_at)")
        conn.commit()
    except Exception as e:
        print(f"数据库迁移错误(upload_records): {e}")

    try:
        # 3.3.1 创建 chunk_uploads 表（分片上传断点续传支持）
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='chunk_uploads'")
        if not cursor.fetchone():
            conn.execute('''
                CREATE TABLE chunk_uploads (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    upload_id TEXT NOT NULL UNIQUE,
                    link_id TEXT NOT NULL,
                    user_id TEXT DEFAULT '',
                    original_name TEXT NOT NULL,
                    stored_name TEXT NOT NULL,
                    total_size INTEGER NOT NULL,
                    chunk_size INTEGER NOT NULL,
                    total_chunks INTEGER NOT NULL,
                    uploaded_chunks TEXT DEFAULT '',
                    status TEXT DEFAULT 'uploading',
                    stored_path TEXT DEFAULT '',
                    uploader_ip TEXT DEFAULT '',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
            logger.info("已创建 chunk_uploads 表")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_chunk_uploads_upload_id ON chunk_uploads(upload_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_chunk_uploads_link_id ON chunk_uploads(link_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_chunk_uploads_status ON chunk_uploads(status)")
        conn.commit()
    except Exception as e:
        print(f"数据库迁移错误(chunk_uploads): {e}")

    # 数据库迁移 - 字段升级
    # 0. 检查并创建 verification_codes 表（如果不存在）
    try:
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='verification_codes'")
        if not cursor.fetchone():
            conn.execute('''
                CREATE TABLE verification_codes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL,
                    code TEXT NOT NULL,
                    purpose TEXT DEFAULT 'reset_password',
                    expires_at TIMESTAMP NOT NULL,
                    used INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
            logger.info("已创建 verification_codes 表")
        # 索引始终尝试创建
        conn.execute("CREATE INDEX IF NOT EXISTS idx_vcodes_email ON verification_codes(email)")
        conn.commit()
    except Exception as e:
        print(f"数据库迁移错误(verification_codes): {e}")

    # 4. 检查并创建 user_settings 表（用户级设置）
    try:
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_settings'")
        if not cursor.fetchone():
            conn.execute('''
                CREATE TABLE user_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    key TEXT NOT NULL,
                    value TEXT DEFAULT '',
                    UNIQUE(user_id, key)
                )
            ''')
            conn.commit()
            logger.info("已创建 user_settings 表")
        # 索引始终尝试创建
        conn.execute("CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id)")
        conn.commit()
    except Exception as e:
        print(f"数据库迁移错误(user_settings): {e}")

    # 数据库迁移 - 字段升级（links/upload_records 等）
    # 1. 检查并迁移 links 表添加 user_id 字段
    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'user_id' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN user_id TEXT DEFAULT ''")
            conn.commit()
    except Exception as e:
        print(f"数据库迁移错误(user_id links): {e}")

    # 2. 检查并迁移 upload_records 表添加 user_id 字段
    try:
        cursor = conn.execute("PRAGMA table_info(upload_records)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'user_id' not in columns:
            conn.execute("ALTER TABLE upload_records ADD COLUMN user_id TEXT DEFAULT ''")
            conn.commit()
    except Exception as e:
        print(f"数据库迁移错误(user_id upload_records): {e}")

    # 3. 原有迁移保持不变
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

    # 添加 source 字段（标识文件来源）
    try:
        cursor = conn.execute("PRAGMA table_info(upload_records)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'source' not in columns:
            conn.execute("ALTER TABLE upload_records ADD COLUMN source TEXT DEFAULT 'upload'")
            conn.commit()
            logger.info("已为 upload_records 表添加 source 字段")
    except Exception as e:
        print(f"数据库迁移错误(source): {e}")

    # 添加 passcode_empty 字段（标记空通行证，避免每次请求 check_password_hash）
    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'passcode_empty' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN passcode_empty INTEGER DEFAULT 0")
            conn.commit()
            # 迁移已有数据：对 passcode 为空或空哈希的标记为 1
            conn.execute(
                "UPDATE links SET passcode_empty = 1 WHERE passcode = '' OR passcode IS NULL"
            )
            conn.commit()
            logger.info("已为 links 表添加 passcode_empty 字段")
    except Exception as e:
        print(f"数据库迁移错误(passcode_empty): {e}")

    # 规范化 uploaded_at 时间格式（去除微秒）
    try:
        conn.execute(
            """UPDATE upload_records SET uploaded_at = 
               substr(uploaded_at, 1, 19) 
               WHERE uploaded_at LIKE '%.%'"""
        )
        conn.commit()
    except Exception as e:
        print(f"数据库迁移错误(uploaded_at normalize): {e}")

    # 清理孤儿记录（实际文件已被删除）
    try:
        orphan_records = conn.execute(
            "SELECT id, stored_path FROM upload_records"
        ).fetchall()
        deleted_count = 0
        for r in orphan_records:
            real_path = os.path.realpath(r['stored_path'])
            real_base = os.path.realpath(get_upload_base())
            if (real_path.startswith(real_base + os.sep) or real_path == real_base):
                if not os.path.exists(real_path) or not os.path.isfile(real_path):
                    conn.execute("DELETE FROM upload_records WHERE id = ?", (r['id'],))
                    deleted_count += 1
        if deleted_count > 0:
            conn.commit()
            logger.info(f"已清理 {deleted_count} 条孤儿记录（文件已不存在）")
    except Exception as e:
        print(f"数据库迁移错误(orphan cleanup): {e}")

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

    # 新增分享页开关和独立通行证字段
    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'share_enabled' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN share_enabled INTEGER DEFAULT 0")
            conn.commit()
            logger.info("已为 links 表添加 share_enabled 字段")
    except Exception as e:
        print(f"数据库迁移错误(share_enabled): {e}")
    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'share_passcode' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN share_passcode TEXT DEFAULT ''")
            conn.commit()
            logger.info("已为 links 表添加 share_passcode 字段")
    except Exception as e:
        print(f"数据库迁移错误(share_passcode): {e}")
    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'share_passcode_empty' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN share_passcode_empty INTEGER DEFAULT 0")
            conn.commit()
            logger.info("已为 links 表添加 share_passcode_empty 字段")
    except Exception as e:
        print(f"数据库迁移错误(share_passcode_empty): {e}")

    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'share_passcode_plain' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN share_passcode_plain TEXT DEFAULT ''")
            conn.commit()
            logger.info("已为 links 表添加 share_passcode_plain 字段")
    except Exception as e:
        print(f"数据库迁移错误(share_passcode_plain): {e}")

    # 分享页独立描述、独立有效期、收集开关
    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'share_description' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN share_description TEXT DEFAULT ''")
            conn.commit()
            logger.info("已为 links 表添加 share_description 字段")
    except Exception as e:
        print(f"数据库迁移错误(share_description): {e}")
    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'share_expires_at' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN share_expires_at TIMESTAMP")
            conn.commit()
            logger.info("已为 links 表添加 share_expires_at 字段")
    except Exception as e:
        print(f"数据库迁移错误(share_expires_at): {e}")
    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'collect_enabled' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN collect_enabled INTEGER DEFAULT 1")
            conn.commit()
            logger.info("已为 links 表添加 collect_enabled 字段")
    except Exception as e:
        print(f"数据库迁移错误(collect_enabled): {e}")

    # 为 links 表添加 folder_name 列（用于文件系统文件夹，基于收集名称生成）
    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'folder_name' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN folder_name TEXT DEFAULT ''")
            conn.commit()
            logger.info("已为 links 表添加 folder_name 字段")
            # 迁移旧数据：folder_name 默认为 link_id
            conn.execute("UPDATE links SET folder_name = id WHERE folder_name = '' OR folder_name IS NULL")
            conn.commit()
            logger.info("已迁移旧链接的 folder_name 为 link_id")
    except Exception as e:
        print(f"数据库迁移错误(folder_name): {e}")

    # 为 links 表添加 require_uploader 列（空通行证时是否要求上传者填写身份）
    try:
        cursor = conn.execute("PRAGMA table_info(links)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'require_uploader' not in columns:
            conn.execute("ALTER TABLE links ADD COLUMN require_uploader INTEGER DEFAULT 0")
            conn.commit()
            logger.info("已为 links 表添加 require_uploader 字段")
    except Exception as e:
        print(f"数据库迁移错误(require_uploader): {e}")

    # 为 upload_records 表添加 uploader_name 列（记录上传者身份）
    try:
        cursor = conn.execute("PRAGMA table_info(upload_records)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'uploader_name' not in columns:
            conn.execute("ALTER TABLE upload_records ADD COLUMN uploader_name TEXT DEFAULT ''")
            conn.commit()
            logger.info("已为 upload_records 表添加 uploader_name 字段")
    except Exception as e:
        print(f"数据库迁移错误(upload_records.uploader_name): {e}")

    # 为 upload_logs 表添加 uploader_name 列（从 upload_records 回填）
    try:
        cursor = conn.execute("PRAGMA table_info(upload_logs)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'uploader_name' not in columns:
            conn.execute("ALTER TABLE upload_logs ADD COLUMN uploader_name TEXT DEFAULT ''")
            conn.commit()
            logger.info("已为 upload_logs 表添加 uploader_name 字段")
            # 回填已有日志的 uploader_name
            conn.execute("""
                UPDATE upload_logs SET uploader_name = (
                    SELECT ur.uploader_name FROM upload_records ur WHERE ur.id = upload_logs.record_id
                ) WHERE record_id IS NOT NULL AND uploader_name = ''
            """)
            conn.commit()
            logger.info("已回填 upload_logs 的 uploader_name 字段")
    except Exception as e:
        print(f"数据库迁移错误(upload_logs.uploader_name): {e}")

    # 为 users 表添加 email 列（旧数据库可能缺失）
    try:
        cursor = conn.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'email' not in columns:
            conn.execute("ALTER TABLE users ADD COLUMN email TEXT DEFAULT ''")
            conn.commit()
            logger.info("已为 users 表添加 email 字段")
    except Exception as e:
        print(f"数据库迁移错误(users email): {e}")

    # 为 users 表添加 nickname 列
    try:
        cursor = conn.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'nickname' not in columns:
            conn.execute("ALTER TABLE users ADD COLUMN nickname TEXT DEFAULT ''")
            conn.commit()
            logger.info("已为 users 表添加 nickname 字段")
    except Exception as e:
        print(f"数据库迁移错误(users nickname): {e}")



    # 下载日志表
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS download_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                record_id INTEGER NOT NULL,
                downloader_ip TEXT DEFAULT '',
                downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                source TEXT DEFAULT 'admin',
                user_agent TEXT DEFAULT ''
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_download_logs_record_id ON download_logs(record_id)")
        conn.commit()
        logger.info("download_logs 表检查/创建完成")
    except Exception as e:
        print(f"数据库迁移错误(download_logs): {e}")

    # 上传日志表
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS upload_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                record_id INTEGER,
                link_id TEXT NOT NULL DEFAULT '',
                uploader_ip TEXT DEFAULT '',
                event TEXT NOT NULL DEFAULT '',
                event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                details TEXT DEFAULT '',
                success INTEGER DEFAULT 1
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_upload_logs_record_id ON upload_logs(record_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_upload_logs_link_id ON upload_logs(link_id)")
        conn.commit()
        logger.info("upload_logs 表检查/创建完成")
    except Exception as e:
        print(f"数据库迁移错误(upload_logs): {e}")

    # 检测是否已有数据库（升级场景）
    existing_admin = conn.execute(
        "SELECT value FROM settings WHERE key = 'admin_username'"
    ).fetchone()

    # 检查是否已有用户表数据（先检查表是否存在）
    existing_users = 0
    try:
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if cursor.fetchone():
            existing_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    except Exception as e:
        print(f"检查用户表失败: {e}")

    if existing_admin:
        # 升级安装：数据库已存在，保留所有已有设置，忽略 wizard 环境变量
        logger.info("检测到已有数据库，保留所有数据（升级安装）")
        
        # 创建默认管理员用户（如果不存在）
        if existing_users == 0:
            admin_user = existing_admin['value']
            # 兼容老版本：admin_password_hash 可能不存在
            admin_pass_row = conn.execute(
                "SELECT value FROM settings WHERE key = 'admin_password_hash'"
            ).fetchone()
            if admin_pass_row:
                admin_pass_hash = admin_pass_row['value']
            else:
                # 老版本无该字段，用默认密码生成哈希
                admin_pass_hash = generate_password_hash(DEFAULT_ADMIN_PASS)
                conn.execute(
                    "INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_password_hash', ?)",
                    (admin_pass_hash,)
                )
                logger.info("老版本数据库：自动生成 admin_password_hash（默认密码）")
            
            admin_id = str(uuid.uuid4())
            conn.execute('''
                INSERT INTO users (id, username, password_hash, is_admin, status)
                VALUES (?, ?, ?, 1, 'active')
            ''', (admin_id, admin_user, admin_pass_hash))
            
            # 更新旧数据的 user_id
            conn.execute("UPDATE links SET user_id = ? WHERE user_id = ''", (admin_id,))
            conn.execute("UPDATE upload_records SET user_id = ? WHERE user_id = ''", (admin_id,))
            
            logger.info(f"升级安装：创建管理员用户 {admin_user}，迁移旧数据")
        
        # 仅补充可能缺失的新增设置项（不影响已有数据）
        new_defaults = {
            'passcode_ttl_minutes': '120',
            'landing_page_enabled': '1',
            'collect_footer_text': '',
            'share_page_title': '',
            'share_footer_text': '',
            'blocked_extensions': '',
            'allow_registration': '0',
            'default_invite_expire_days': '7',
            'default_link_expire_days': '30',
            'smtp_host': '',
            'smtp_port': '587',
            'smtp_username': '',
            'smtp_password': '',
            'smtp_use_tls': '1',
            'smtp_from_email': '',
            'smtp_from_name': '文件收集器',
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

        # 创建管理员用户
        admin_id = str(uuid.uuid4())
        conn.execute('''
            INSERT INTO users (id, username, password_hash, is_admin, status)
            VALUES (?, ?, ?, 1, 'active')
        ''', (admin_id, init_admin_user, generate_password_hash(init_admin_pass)))

        defaults = {
            'admin_username': init_admin_user,
            'admin_password_hash': generate_password_hash(init_admin_pass),
            'max_file_size_gb': str(DEFAULT_MAX_FILE_SIZE_GB),
            'max_files': str(DEFAULT_MAX_FILES),
            'site_title': '文件收集器',
            'secret_key': secrets.token_hex(32),
            'login_tip': init_login_tip,
            'collect_footer_text': '',
            'share_page_title': '',
            'share_footer_text': '',
            'passcode_ttl_minutes': '120',
            'landing_page_enabled': '1',
            'allow_registration': '0',
            'default_invite_expire_days': '7',
            'default_link_expire_days': '30',
            'links_per_page': '10',
            'smtp_host': '',
            'smtp_port': '587',
            'smtp_username': '',
            'smtp_password': '',
            'smtp_use_tls': '1',
            'smtp_from_email': '',
            'smtp_from_name': '文件收集器',
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

def get_user_setting(user_id, key, default=None):
    """获取用户级设置，优先用户设置，回退到全局设置"""
    conn = get_db()
    row = conn.execute(
        "SELECT value FROM user_settings WHERE user_id = ? AND key = ?",
        (str(user_id), key)
    ).fetchone()
    conn.close()
    if row:
        return row['value']
    return get_setting(key, default)

def set_user_setting(user_id, key, value):
    """设置用户级设置"""
    conn = get_db()
    conn.execute(
        "INSERT OR REPLACE INTO user_settings (user_id, key, value) VALUES (?, ?, ?)",
        (str(user_id), key, str(value))
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

# 预编译所有模板，消除首次请求时的编译延迟（TTFB 从 ~3s 降至 ~50ms）
_TEMPLATE_NAMES = [
    'base.html', '_admin_sidebar.html',
    'landing.html', 'collect.html', 'share.html', 'error.html',
    'admin_login.html', 'admin_dashboard.html', 'admin_links.html',
    'admin_records.html', 'admin_settings.html', 'admin_users.html',
    'admin_invite_codes.html', 'admin_user_settings.html',
    'register.html', 'forgot_password.html', 'reset_password.html',
]
for _tn in _TEMPLATE_NAMES:
    try:
        app.jinja_env.get_or_select_template(_tn)
    except Exception:
        pass  # 模板可能不存在或依赖上下文变量，忽略编译错误
del _tn, _TEMPLATE_NAMES

# ============================================================
# 频率限制 & CSRF 保护
# ============================================================
_rate_limits = {}
_rate_limit_calls = 0

def rate_limit(key, max_attempts=5, window_seconds=60):
    """简单的内存频率限制（定期清理过期条目防止内存泄漏）"""
    global _rate_limit_calls
    now = time.time()
    _rate_limit_calls += 1
    # 每 100 次调用清理一次过期条目
    if _rate_limit_calls % 100 == 0:
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
def generate_link_id(title=None):
    """生成 8 位纯字母数字短链接ID"""
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

def _log_download(record_id, source='admin'):
    """记录下载日志"""
    try:
        conn = get_db()
        ua = (request.headers.get('User-Agent', '') or '')[:512]
        conn.execute(
            """INSERT INTO download_logs (record_id, downloader_ip, source, user_agent)
               VALUES (?, ?, ?, ?)""",
            (record_id, _get_client_ip(), source, ua)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"下载日志记录失败: {e}")

def _log_upload(link_id, event, record_id=None, details=None, success=1, uploader_name=''):
    """记录上传日志"""
    try:
        conn = get_db()
        detail_str = json.dumps(details, ensure_ascii=False) if isinstance(details, dict) else (details or '')
        conn.execute(
            """INSERT INTO upload_logs (record_id, link_id, uploader_ip, event, details, success, uploader_name)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (record_id, link_id, _get_client_ip(), event, detail_str, success, uploader_name)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"上传日志记录失败: {e}")

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

def is_share_verified(link_id, link=None):
    """检查分享页独立通行证是否已验证（share_passcode 优先，fallback 到收集页通行证）"""
    if link is not None:
        link = dict(link)  # 兼容 sqlite3.Row 传入
        _sp = link.get('share_passcode', '')
        _spe = link.get('share_passcode_empty', 0)
        if _spe:
            return True
        if _sp and _sp.strip():
            has_pass = True
        else:
            # fallback 到收集页通行证
            has_pass = bool(link.get('passcode_plain', '') and link['passcode_plain'].strip())
        if not has_pass:
            return True
    ts = session.get(f'share_verified_{link_id}', 0)
    return isinstance(ts, (int, float)) and (time.time() - ts) < get_passcode_ttl()

def link_has_passcode(link_id):
    """检查链接是否设置了通行证（passcode_plain 非空）"""
    conn = get_db()
    row = conn.execute("SELECT passcode_plain FROM links WHERE id = ?", (link_id,)).fetchone()
    conn.close()
    if not row:
        return False
    return bool(row['passcode_plain'] and row['passcode_plain'].strip())

# ============================================================
# 用户认证相关函数
# ============================================================

def get_current_user():
    """获取当前登录用户信息"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id = ? AND status = 'active'", (user_id,)).fetchone()
    conn.close()
    return dict(user) if user else None

def validate_user_login(username, password):
    """验证用户登录"""
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE username = ? AND status = 'active'", (username,)).fetchone()
    conn.close()
    if user and check_password_hash(user['password_hash'], password):
        return dict(user)
    return None

def validate_invite_code(code):
    """验证邀请码是否有效"""
    conn = get_db()
    invite = None
    try:
        # 检查表是否存在
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='invite_codes'")
        if cursor.fetchone():
            invite = conn.execute(
                "SELECT * FROM invite_codes WHERE code = ? AND expires_at > CURRENT_TIMESTAMP AND used_by IS NULL",
                (code,)
            ).fetchone()
    except Exception as e:
        logger.error(f"验证邀请码失败: {e}")
    conn.close()
    return dict(invite) if invite else None

def mark_invite_code_used(code, user_id):
    """标记邀请码已使用"""
    conn = get_db()
    try:
        conn.execute(
            "UPDATE invite_codes SET used_by = ?, used_at = CURRENT_TIMESTAMP WHERE code = ?",
            (user_id, code)
        )
        conn.commit()
    except Exception as e:
        logger.error(f"标记邀请码失败: {e}")
    conn.close()

def generate_invite_code(created_by, expire_days=7):
    """生成邀请码"""
    code = secrets.token_urlsafe(16)
    expires_at = (datetime.now() + timedelta(days=expire_days)).strftime('%Y-%m-%d %H:%M:%S')
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO invite_codes (id, code, expires_at, created_by) VALUES (?, ?, ?, ?)",
            (str(uuid.uuid4()), code, expires_at, created_by)
        )
        conn.commit()
    except Exception as e:
        logger.error(f"生成邀请码失败: {e}")
        code = None
    conn.close()
    return code

def create_user(username, password, email=''):
    """创建新用户"""
    user_id = str(uuid.uuid4())
    password_hash = generate_password_hash(password)
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (id, username, password_hash, email, is_admin, status) VALUES (?, ?, ?, ?, 0, 'active')",
            (user_id, username, password_hash, email)
        )
        conn.commit()
        return user_id
    except sqlite3.IntegrityError:
        logger.error(f"创建用户失败（用户名已存在）: {username}")
        return None
    except Exception as e:
        logger.error(f"创建用户失败: {e}")
        return None
    finally:
        conn.close()

def get_user_folder(user_id):
    """获取用户的文件存储目录"""
    user = get_user_by_id(user_id)
    if not user:
        return None
    # 使用用户名作为文件夹名（去除特殊字符）
    safe_username = re.sub(r'[^\w\-]', '_', user['username'])
    return os.path.join(get_upload_base(), safe_username)

def get_link_by_id(link_id):
    """根据ID获取链接信息"""
    conn = get_db()
    try:
        link = conn.execute("SELECT * FROM links WHERE id = ?", (link_id,)).fetchone()
        return dict(link) if link else None
    finally:
        conn.close()

def get_link_folder(link_id, user_id=None):
    """获取链接的文件存储目录（兼容新旧数据）"""
    link = get_link_by_id(link_id)
    
    if link and link.get('user_id'):
        # 有用户归属：UPLOAD_BASE/<username>/<folder_name>/
        user = get_user_by_id(link['user_id'])
        if user:
            safe_username = re.sub(r'[^\w\-]', '_', user['username'])
            folder_name = link.get('folder_name', '') or link_id
            return os.path.join(get_upload_base(), safe_username, folder_name)
    
    # 旧数据：保持原位置
    return os.path.join(get_upload_base(), link_id)

def scan_link_folder(link_id, conn=None):
    """扫描链接文件夹，识别手动放入的文件（高性能版：复用连接、批量 INSERT）"""
    should_close = False
    if conn is None:
        conn = get_db()
        should_close = True
    
    try:
        # 从已有连接获取 link 信息（避免额外 DB 连接）
        link = conn.execute("SELECT id, user_id, folder_name FROM links WHERE id = ?", (link_id,)).fetchone()
        if not link:
            return []
        
        user_id = link['user_id']
        # 直接构建文件夹路径（内联 get_link_folder 逻辑）
        if user_id:
            user = get_user_by_id(user_id)
            if user:
                safe_username = re.sub(r'[^\w\-]', '_', user['username'])
                folder_name = link['folder_name'] or link_id
                folder_path = os.path.join(get_upload_base(), safe_username, folder_name)
            else:
                folder_path = os.path.join(get_upload_base(), link_id)
        else:
            folder_path = os.path.join(get_upload_base(), link_id)
        
        if not os.path.exists(folder_path):
            return []
        
        # 获取已记录文件（set 快速查找）
        records = conn.execute(
            "SELECT stored_name FROM upload_records WHERE link_id = ?",
            (link_id,)
        ).fetchall()
        existing_files = {r['stored_name'] for r in records}
        
        # 扫描并批量 INSERT 新文件
        new_files = []
        batch = []
        now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        for filename in os.listdir(folder_path):
            filepath = os.path.join(folder_path, filename)
            if not os.path.isfile(filepath) or filename in existing_files:
                continue
            
            file_size = os.path.getsize(filepath)
            batch.append((link_id, user_id or '', filename, filename, filepath,
                         file_size, 'manual', now_str, 'manual'))
            new_files.append(filename)
        
        if batch:
            conn.executemany(
                """INSERT INTO upload_records 
                   (link_id, user_id, original_name, stored_name, stored_path, file_size, 
                    uploader_ip, uploaded_at, source)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                batch
            )
            conn.commit()
            logger.info(f"扫描链接 {link_id} 发现 {len(new_files)} 个新文件")
        
        return new_files
        
    except Exception as e:
        logger.error(f"扫描链接文件夹错误: {e}")
        return []
    finally:
        if should_close and conn:
            try:
                conn.close()
            except Exception:
                pass

def get_user_by_id(user_id):
    """根据ID获取用户信息"""
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(user) if user else None

def get_user_by_email(email):
    """根据邮箱获取用户信息"""
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ? AND status = 'active'", (email,)).fetchone()
    conn.close()
    return dict(user) if user else None

def sanitize_html(html_text):
    """使用 bleach 清洗 HTML，只允许安全标签和属性
    
    白名单策略：
    - 允许基本格式标签: p, br, strong, b, em, i, u, s, del
    - 允许标题: h1, h2, h3, h4
    - 允许列表: ul, ol, li
    - 允许引用和代码: blockquote, pre, code, sub, sup
    - 允许链接: a (仅 href 属性，强制 nofollow)
    - 允许行内容: span (仅 style 中的颜色相关属性)
    - 禁止: img, video, audio, iframe, script, object, embed 等
    """
    if not html_text or not html_text.strip():
        return ''
    
    allowed_tags = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
        'h1', 'h2', 'h3', 'h4',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code', 'sub', 'sup',
        'a', 'span', 'div', 'hr',
    ]
    
    allowed_attrs = {
        'a': ['href', 'title'],
        'span': ['style'],
    }
    
    allowed_styles = [
        'color', 'background-color', 'background',
        'font-size', 'font-weight', 'font-style',
        'text-decoration',
    ]
    
    # 清洗 HTML
    from bleach.css_sanitizer import CSSSanitizer
    css_sanitizer = CSSSanitizer(allowed_css_properties=allowed_styles)
    cleaned = bleach.clean(
        html_text,
        tags=allowed_tags,
        attributes=allowed_attrs,
        css_sanitizer=css_sanitizer,
        strip=True,
    )
    
    # 对所有链接强制添加 rel="nofollow noopener noreferrer" 和 target="_blank"
    # bleach 的 linkify 可以做到这点
    cleaned = bleach.linkify(
        cleaned,
        callbacks=[
            lambda attrs, new: dict(attrs, **{
                'rel': 'nofollow noopener noreferrer',
                'target': '_blank',
            }) if 'href' in attrs else attrs
        ]
    )
    
    return cleaned


def get_smtp_config():
    """获取 SMTP 配置字典"""
    try:
        port = int(get_setting('smtp_port', '587'))
    except (ValueError, TypeError):
        port = 587
    return {
        'host': get_setting('smtp_host', ''),
        'port': port,
        'username': get_setting('smtp_username', ''),
        'password': get_setting('smtp_password', ''),
        'use_tls': get_setting('smtp_use_tls', '1') == '1',
        'from_email': get_setting('smtp_from_email', ''),
        'from_name': get_setting('smtp_from_name', '文件收集器'),
    }

def send_email(to_email, subject, body_html):
    """发送邮件，返回 (success, message)"""
    # 延迟导入重型邮件模块（启动时不加载）
    import smtplib as _smtplib
    import email.utils as _email_utils
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    config = get_smtp_config()
    if not config['host'] or not config['from_email']:
        return False, 'SMTP 未配置'
    server = None
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = _email_utils.formataddr((config['from_name'], config['from_email']))
        msg['To'] = to_email
        msg['Message-ID'] = _email_utils.make_msgid(domain=config['from_email'].split('@')[-1] if '@' in config['from_email'] else 'localhost')
        msg['Date'] = _email_utils.formatdate(localtime=True)
        msg.attach(MIMEText(body_html, 'html', 'utf-8'))

        if config['use_tls']:
            # STARTTLS: 先建立明文连接，再升级到 TLS
            server = _smtplib.SMTP(config['host'], config['port'], timeout=30)
            server.ehlo()
            server.starttls()
            server.ehlo()
        else:
            # SSL: 直接建立加密连接
            server = _smtplib.SMTP_SSL(config['host'], config['port'], timeout=30)
            server.ehlo()

        if config['username'] and config['password']:
            server.login(config['username'], config['password'])
        server.sendmail(config['from_email'], [to_email], msg.as_string())
        logger.info(f"邮件发送成功: {to_email} - {subject}")
        return True, '发送成功'
    except _smtplib.SMTPAuthenticationError:
        return False, 'SMTP 认证失败，请检查用户名和密码'
    except _smtplib.SMTPException as e:
        return False, f'SMTP 错误: {str(e)[:100]}'
    except Exception as e:
        return False, f'发送失败: {str(e)[:100]}'
    finally:
        if server:
            try:
                server.quit()
            except Exception:
                pass

def cleanup_orphan_records(conn=None):
    """清理孤儿记录（批量版：内存比对 + 批量 DELETE，避免逐行磁盘 I/O）"""
    should_close = False
    if conn is None:
        conn = get_db()
        should_close = True
    try:
        records = conn.execute(
            "SELECT id, stored_path, stored_name, link_id FROM upload_records"
        ).fetchall()
        upload_base = get_upload_base()
        real_base = os.path.realpath(upload_base)
        
        # 构建：(link_id, stored_name) -> record 的映射
        # 同时预检查路径是否存在
        orphan_ids = []
        for r in records:
            real_path = os.path.realpath(r['stored_path'])
            if (real_path.startswith(real_base + os.sep) or real_path == real_base):
                if not os.path.exists(real_path) or not os.path.isfile(real_path):
                    orphan_ids.append(r['id'])
        
        if orphan_ids:
            # 批量删除（SQLite 限制一次最多 999 个参数）
            chunk_size = 500
            for i in range(0, len(orphan_ids), chunk_size):
                chunk = orphan_ids[i:i + chunk_size]
                placeholders = ','.join(['?' for _ in chunk])
                conn.execute(f"DELETE FROM upload_records WHERE id IN ({placeholders})", chunk)
            conn.commit()
            logger.info(f"清理孤儿记录: {len(orphan_ids)} 条")
        return len(orphan_ids)
    except Exception as e:
        logger.error(f"清理孤儿记录失败: {e}")
        return 0
    finally:
        if should_close and conn:
            try:
                conn.close()
            except Exception:
                pass

def cleanup_orphan_records_for_link(conn, link_id):
    """清理指定链接的孤儿记录（批量版）"""
    try:
        records = conn.execute(
            "SELECT id, stored_path FROM upload_records WHERE link_id = ?",
            (link_id,)
        ).fetchall()
        if not records:
            return 0
        
        upload_base = get_upload_base()
        real_base = os.path.realpath(upload_base)
        
        orphan_ids = []
        for r in records:
            real_path = os.path.realpath(r['stored_path'])
            if (real_path.startswith(real_base + os.sep) or real_path == real_base):
                if not os.path.exists(real_path) or not os.path.isfile(real_path):
                    orphan_ids.append(r['id'])
        
        if orphan_ids:
            placeholders = ','.join(['?' for _ in orphan_ids])
            conn.execute(f"DELETE FROM upload_records WHERE id IN ({placeholders})", orphan_ids)
            conn.commit()
        return len(orphan_ids)
    except Exception as e:
        logger.error(f"清理链接 {link_id} 孤儿记录失败: {e}")
        return 0

def get_user_files(user_id):
    """获取用户的所有文件记录（包括直接放入文件夹的文件）"""
    conn = get_db()
    
    # 清理孤儿记录
    cleanup_orphan_records(conn)
    
    # 从数据库获取记录
    records = conn.execute(
        "SELECT * FROM upload_records WHERE user_id = ? ORDER BY uploaded_at DESC",
        (user_id,)
    ).fetchall()
    
    records_list = [dict(r) for r in records]
    
    # 检查用户文件夹中是否有未记录的文件
    try:
        user_folder = get_user_folder(user_id)
        if user_folder and os.path.isdir(user_folder):
            for item in os.listdir(user_folder):
                item_path = os.path.join(user_folder, item)
                if os.path.isfile(item_path):
                    # 检查是否已在数据库中
                    exists = any(r['stored_path'] == item_path for r in records_list)
                    if not exists:
                        # 添加未记录的文件
                        file_size = os.path.getsize(item_path)
                        records_list.append({
                            'id': None,
                            'user_id': user_id,
                            'link_id': None,
                            'original_name': item,
                            'stored_name': item,
                            'stored_path': item_path,
                            'file_size': file_size,
                            'file_size_display': format_file_size(file_size),
                            'uploader_ip': '直接上传',
                            'uploaded_at': datetime.fromtimestamp(os.path.getmtime(item_path)).strftime('%Y-%m-%d %H:%M:%S'),
                            'download_count': 0
                        })
    except Exception as e:
        logger.error(f"扫描用户文件夹失败: {e}")
    
    # 按上传时间排序
    records_list.sort(key=lambda x: x['uploaded_at'], reverse=True)
    conn.close()
    return records_list

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
        # 默认密码提醒（仅 flash 提醒，不强制跳转）
        if check_password_hash(admin_hash, DEFAULT_ADMIN_PASS):
            if request.endpoint not in ('admin_settings', 'admin_logout'):
                flash('安全提醒：您仍在使用默认密码，建议尽快修改！')
        # 昵称未设置提醒
        if session.get('is_admin'):
            conn = get_db()
            user = conn.execute("SELECT nickname FROM users WHERE id = ?", (session['user_id'],)).fetchone()
            conn.close()
            if user and not user['nickname'] and request.endpoint not in ('admin_settings', 'admin_logout'):
                flash('请设置您的昵称，将显示在收集页和分享页中')
        return f(*args, **kwargs)
    return decorated

def login_required(f):
    """登录认证装饰器（管理员和普通用户均可访问）"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('user_id'):
            if request.path.startswith('/api/'):
                return jsonify({'error': '未登录'}), 401
            return redirect(url_for('admin_login'))
        if request.method == 'POST':
            if not validate_csrf():
                return redirect(request.referrer or url_for('admin_dashboard'))
        # 管理员默认密码提醒（仅 flash 提醒，不强制跳转）
        if session.get('is_admin'):
            admin_hash = get_setting('admin_password_hash', '')
            if check_password_hash(admin_hash, DEFAULT_ADMIN_PASS):
                if request.endpoint not in ('admin_settings', 'admin_logout', 'user_settings'):
                    flash('安全提醒：您仍在使用默认密码，建议尽快修改！')
            # 昵称未设置提醒
            conn = get_db()
            user = conn.execute("SELECT nickname FROM users WHERE id = ?", (session['user_id'],)).fetchone()
            conn.close()
            if user and not user['nickname'] and request.endpoint not in ('admin_settings', 'admin_logout', 'user_settings'):
                flash('请设置您的昵称，将显示在收集页和分享页中')
        return f(*args, **kwargs)
    return decorated

def _check_record_ownership(record_id):
    """校验当前用户是否有权访问指定上传记录（非管理员只能访问自己链接下的记录）"""
    if session.get('is_admin'):
        return True
    user_id = session.get('user_id')
    conn = get_db()
    row = conn.execute(
        """SELECT r.id FROM upload_records r
           INNER JOIN links l ON r.link_id = l.id
           WHERE r.id = ? AND l.user_id = ?""",
        (record_id, user_id)
    ).fetchone()
    conn.close()
    return row is not None

def _check_link_ownership(link_id):
    """校验当前用户是否有权访问指定链接（非管理员只能访问自己的链接）"""
    if session.get('is_admin'):
        return True
    user_id = session.get('user_id')
    conn = get_db()
    row = conn.execute(
        "SELECT id FROM links WHERE id = ? AND user_id = ?",
        (link_id, user_id)
    ).fetchone()
    conn.close()
    return row is not None

@app.after_request
def add_security_headers(response):
    """添加安全响应头 + 缓存策略"""
    # HTML 页面不缓存（含动态内容：CSRF token、用户信息等）
    ct = (response.content_type or '')
    if 'text/html' in ct:
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    # 安全头
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
    csp = "default-src 'self' blob:; script-src 'self' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://api.github.com blob:; worker-src 'self' blob:"
    response.headers['Content-Security-Policy'] = csp
    return response


@app.after_request
def minify_html_response(response):
    """压缩 HTML 响应：去除注释和多余空白，减小传输体积"""
    ct = (response.content_type or '')
    if 'text/html' not in ct:
        return response
    # 仅压缩成功响应（200/304），跳过错误页
    if response.status_code not in (200, 304):
        return response
    try:
        data = response.get_data(as_text=True)
        if not data:
            return response
        minified = _minify_html(data)
        response.set_data(minified)
    except Exception:
        pass  # 压缩失败不影响正常响应
    return response


# 静态文件 MIME 类型修复 ——
# X-Content-Type-Options: nosniff 要求 Content-Type 必须精确，
# 而某些部署环境（fnOS 内嵌代理等）可能丢失或错误设置 Content-Type。
@app.after_request
def fix_static_content_type(response):
    """根据文件后缀补全/修正静态资源的 Content-Type"""
    path = request.path or ''
    # 仅处理 /static/ 路径下的请求
    if '/static/' not in path:
        return response
    ext = os.path.splitext(path)[1].lower()
    known = _ESSENTIAL_MIMETYPES.get(ext)
    if not known:
        return response
    current = response.content_type or ''
    # 如果当前类型为空、未设置，或变成了 text/plain/octet-stream，则修正
    if not current or 'text/plain' in current or 'application/octet-stream' in current:
        response.headers['Content-Type'] = known
        return response
    # 为 CSS/JS 补充 charset（某些环境可能缺失）
    if ext in ('.css',) and 'charset' not in current:
        response.headers['Content-Type'] = 'text/css; charset=utf-8'
    elif ext in ('.js', '.mjs') and 'charset' not in current:
        response.headers['Content-Type'] = 'application/javascript; charset=utf-8'
    # 静态资源强缓存：CSS/JS/字体/图片等长期缓存，HTML 不缓存
    if ext in _ESSENTIAL_MIMETYPES and ext not in ('.html', '.htm',):
        response.cache_control.public = True
        response.cache_control.max_age = 3600 * 24
        response.headers['Vary'] = 'Accept-Encoding'
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

@app.template_filter('parse_json')
def parse_json_filter(s):
    """Jinja2 过滤器：安全解析 JSON 字符串为 dict，失败返回 None"""
    if not s:
        return None
    try:
        return json.loads(s)
    except (json.JSONDecodeError, TypeError):
        return None

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

def safe_filename_unicode(filename):
    """安全文件名处理，保留Unicode字符（中文等），仅移除危险字符"""
    if not filename:
        return 'unnamed_file'
    # Unicode 规范化（防止 homoglyph 攻击）
    filename = unicodedata.normalize('NFC', filename)
    # 移除路径分隔符和空字符等危险字符
    filename = filename.replace('/', '_').replace('\\', '_').replace('\x00', '')
    # 移除首尾空白和点（防止隐藏文件）
    filename = filename.strip().strip('.')
    if not filename:
        return 'unnamed_file'
    # 限制长度（保留扩展名）
    if len(filename) > 255:
        name, ext = os.path.splitext(filename)
        filename = name[:251 - len(ext)] + ext
    return filename

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

def create_upload_dir(link_id, uploader_name=''):
    """为链接创建上传目录（用户隔离：UPLOAD_BASE/<username>/<folder_name>/）
    如果提供了 uploader_name，则在其下创建子文件夹：<...>/<folder_name>/<uploader_name>/"""
    conn = get_db()
    link = conn.execute("SELECT title, user_id, folder_name FROM links WHERE id = ?", (link_id,)).fetchone()
    conn.close()

    if not link:
        upload_dir = os.path.join(UPLOAD_BASE, 'unnamed', link_id)
    elif link['user_id']:
        # 有用户归属：UPLOAD_BASE/<username>/<folder_name>/
        user = get_user_by_id(link['user_id'])
        if user:
            safe_username = re.sub(r'[^\w\-]', '_', user['username'])
            folder_name = link['folder_name'] or link_id
            upload_dir = os.path.join(UPLOAD_BASE, safe_username, folder_name)
        else:
            upload_dir = os.path.join(UPLOAD_BASE, 'unnamed', link_id)
    else:
        # 无用户归属（旧数据）：使用标题命名
        folder_name = re.sub(r'[<>:"/\\|?*]', '_', link['title'].strip()) if link['title'] else 'unnamed'
        if not folder_name:
            folder_name = 'unnamed'
        folder_name = os.path.normpath(folder_name).lstrip(os.sep).lstrip('.')
        if not folder_name:
            folder_name = 'unnamed'
        upload_dir = os.path.join(UPLOAD_BASE, folder_name)

    # 双重确保：realpath 必须在 UPLOAD_BASE 范围内
    real_dir = os.path.realpath(upload_dir)
    real_base = os.path.realpath(UPLOAD_BASE)
    if not real_dir.startswith(real_base + os.sep) and real_dir != real_base:
        upload_dir = os.path.join(UPLOAD_BASE, 'unnamed', link_id)
        real_dir = os.path.realpath(upload_dir)

    # 上传者子文件夹
    if uploader_name:
        safe_uploader = _sanitize_uploader_name(uploader_name)
        real_dir = os.path.join(real_dir, safe_uploader)
        # 再次安全检查
        if not os.path.realpath(real_dir).startswith(real_base + os.sep) and os.path.realpath(real_dir) != real_base:
            real_dir = os.path.realpath(os.path.join(upload_dir, 'unknown'))

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
    row = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    conn.close()
    link = dict(row) if row else None

    if not link:
        return render_template('error.html',
            error_code=404,
            error_title='链接失效',
            error_message='链接不存在或已被停用'), 404

    # 检查收集页是否启用
    if not link.get('collect_enabled', 1):
        share_hint = ''
        if link.get('share_enabled', 0):
            share_hint = '收集已关闭，但您仍可通过分享链接查看文件。'
        return render_template('error.html',
            error_code=410,
            error_title='收集已关闭',
            error_message=share_hint or '该收集链接已被创建者关闭。'), 410

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
    require_uploader = bool(link.get('require_uploader', 0))
    passcode_empty = bool(link.get('passcode_empty', 0))
    
    # 上传者身份：从 session 获取（不依赖 passcode_empty）
    uploader_name = ''
    if require_uploader:
        uploader_name = (session.get(f'uploader_{link_id}') or '').strip()
    
    # verified 仅取决于通行证验证，上传者不再作为门禁
    verified = is_verified(link_id) if has_passcode else True
    
    # 自动扫描文件夹中的新文件
    scan_link_folder(link_id)
    
    link_owner_id = link.get('user_id', '')
    ttl_minutes = int(get_user_setting(link_owner_id, 'passcode_ttl_minutes', '120'))
    if ttl_minutes >= 60 and ttl_minutes % 60 == 0:
        ttl_display = f'{ttl_minutes // 60} 小时'
    elif ttl_minutes >= 60:
        ttl_display = f'{ttl_minutes // 60} 小时 {ttl_minutes % 60} 分钟'
    else:
        ttl_display = f'{ttl_minutes} 分钟'

    expire_display = '永不过期'
    expire_days_left = -1  # -1 表示永不过期
    expire_text = '有效期不限'
    expire_level = 'forever'
    if link['expires_at']:
        try:
            expire_time = datetime.strptime(link['expires_at'], '%Y-%m-%dT%H:%M')
            expire_display = expire_time.strftime('%Y-%m-%d %H:%M')
            remain = expire_time - datetime.now()
            expire_days_left = max(0, remain.days)
            total_seconds = remain.total_seconds()
            if total_seconds <= 0:
                expire_text = '已过期'
                expire_level = 'danger'
            elif total_seconds < 60:
                expire_text = '即将过期'
                expire_level = 'danger'
            elif total_seconds < 3600:
                expire_text = f'还剩 {int(total_seconds // 60)} 分钟'
                expire_level = 'danger'
            elif total_seconds < 86400:
                hour_s = int(total_seconds // 3600)
                min_s = int((total_seconds % 3600) // 60)
                expire_text = f'还剩 {hour_s} 小时' if min_s == 0 else f'还剩 {hour_s} 小时 {min_s} 分钟'
                expire_level = 'warn'
            else:
                days = remain.days
                expire_text = f'还剩 {days} 天'
                expire_level = 'normal' if days > 1 else 'warn'
        except (ValueError, TypeError):
            pass

    # 查询创建者名称（优先昵称）
    creator_name = ''
    try:
        conn2 = get_db()
        user_row = conn2.execute("SELECT username, nickname FROM users WHERE id = ?", (link_owner_id,)).fetchone()
        conn2.close()
        if user_row:
            creator_name = user_row['nickname'] or user_row['username']
    except Exception:
        pass

    csrf_token = generate_csrf_token()
    return render_template('collect.html',
        link_id=link_id,
        task_title=link['title'],
        description=link['description'],
        verified=verified,
        has_passcode=has_passcode,
        passcode_empty=passcode_empty,
        require_uploader=require_uploader,
        uploader_name=uploader_name,
        in_wechat=is_wechat_browser(),
        max_file_size_gb=link['max_file_size_gb'],
        max_files=link['max_files'],
        allow_delete=bool(link['allow_delete']),
        site_title=get_user_setting(link_owner_id, 'site_title', '文件收集器'),
        collect_footer_text=get_user_setting(link_owner_id, 'collect_footer_text', ''),
        public_url=get_user_setting(link_owner_id, 'public_url', ''),
        version=VERSION,
        passcode_ttl_display=ttl_display,
        expire_display=expire_display,
        expire_days_left=expire_days_left,
        expire_text=expire_text,
        expire_level=expire_level,
        creator_name=creator_name,
        csrf_token=csrf_token)

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

def _sanitize_uploader_name(name):
    """安全化上传者名称，去除危险字符，用于文件夹名"""
    # 去除路径遍历字符和危险特殊字符
    name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '_', name.strip())
    # 去除首尾的点和空格
    name = name.strip('. ')
    # 限制长度
    if len(name) > 60:
        name = name[:60]
    if not name:
        name = 'unknown'
    return name

@app.route('/collect/<link_id>/set_uploader', methods=['POST'])
def set_uploader(link_id):
    """设置上传者身份（require_uploader 开启时使用）"""
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败'}), 403

    if not re.match(r'^[a-zA-Z0-9]{8}$', link_id):
        return jsonify({'success': False, 'message': '链接格式无效'}), 400

    uploader_name = (request.form.get('uploader_name') or '').strip()
    if not uploader_name:
        return jsonify({'success': False, 'message': '请输入您的身份'}), 400

    # 字数限制
    chinese_count = 0
    other_count = 0
    for c in uploader_name:
        if '\u4e00' <= c <= '\u9fff' or '\u3400' <= c <= '\u4dbf':
            chinese_count += 1
        else:
            other_count += 1
    if chinese_count > 0:
        # 含中文：中文至少2字，最多8字；英文/数字/符号最多20字
        if chinese_count < 2:
            return jsonify({'success': False, 'message': '中文昵称至少填写2个字'}), 400
        if chinese_count > 8:
            return jsonify({'success': False, 'message': '中文字符最多8个'}), 400
        if other_count > 20:
            return jsonify({'success': False, 'message': '英文/数字/符号最多20个'}), 400
    else:
        # 纯英文/数字/符号：至少3字，最多20字
        if other_count < 3:
            return jsonify({'success': False, 'message': '昵称至少填写3个字符'}), 400
        if other_count > 20:
            return jsonify({'success': False, 'message': '英文/数字/符号最多20个'}), 400
    if chinese_count + other_count > 60:
        return jsonify({'success': False, 'message': '总字符数不能超过60个'}), 400

    # 安全化处理
    safe_name = _sanitize_uploader_name(uploader_name)

    conn = get_db()
    link = conn.execute(
        "SELECT passcode_plain, require_uploader FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    conn.close()

    if not link:
        return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

    if not bool(link['require_uploader']):
        return jsonify({'success': False, 'message': '该链接不需要上传者身份'}), 400

    # 有通行证时需先验证
    has_passcode = bool(link['passcode_plain'] and link['passcode_plain'].strip())
    if has_passcode and not is_verified(link_id, link):
        return jsonify({'success': False, 'message': '请先验证通行证'}), 403

    session[f'uploader_{link_id}'] = safe_name
    return jsonify({'success': True, 'uploader_name': safe_name})

@app.route('/collect/<link_id>/logout_uploader', methods=['POST'])
def logout_uploader(link_id):
    """退出上传者身份"""
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败'}), 403
    session.pop(f'uploader_{link_id}', None)
    return jsonify({'success': True, 'message': '已退出身份'})

# ============================================================
# 路由 - 分享页面（仅下载，无上传）
# ============================================================
@app.route('/share/<link_id>')
def share_page(link_id):
    """文件分享页面（仅查看和下载，无上传功能）"""
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    conn.close()
    link = dict(row) if row else None

    if not link:
        return render_template('error.html',
            error_code=404,
            error_title='链接失效',
            error_message='链接不存在或已被停用'), 404

    # 检查分享页是否启用
    if not link.get('share_enabled', 0):
        return render_template('error.html',
            error_code=404,
            error_title='分享未启用',
            error_message='该链接的分享功能未开启。'), 404

    # 分享页有效期：优先使用独立设置，否则回退到收集页有效期
    share_expires_at = link.get('share_expires_at') or link.get('expires_at')
    if share_expires_at:
        try:
            expire_time = datetime.strptime(share_expires_at, '%Y-%m-%dT%H:%M')
            if datetime.now() > expire_time:
                return render_template('error.html',
                    error_code=410,
                    error_title='链接已过期',
                    error_message='该分享链接已超过有效期。'), 410
        except (ValueError, TypeError):
            pass

    # 判断分享页有效通行证
    _sp = link.get('share_passcode', '')
    _spe = link.get('share_passcode_empty', 0)
    if _spe:
        # 分享页空通行证：无需验证
        has_passcode = False
    elif _sp and _sp.strip():
        # 分享页独立通行证
        has_passcode = True
    else:
        # 复用收集页通行证
        has_passcode = bool(link['passcode_plain'] and link['passcode_plain'].strip())

    # 使用独立的 share 验证 session key
    share_session_key = f'share_verified_{link_id}'
    if has_passcode:
        ts = session.get(share_session_key, 0)
        verified = isinstance(ts, (int, float)) and (time.time() - ts) < get_passcode_ttl()
    else:
        verified = True
    
    # 自动扫描文件夹中的新文件
    scan_link_folder(link_id)
    
    share_owner_id = link.get('user_id', '')
    ttl_minutes = int(get_user_setting(share_owner_id, 'passcode_ttl_minutes', '120'))
    if ttl_minutes >= 60 and ttl_minutes % 60 == 0:
        ttl_display = f'{ttl_minutes // 60} 小时'
    elif ttl_minutes >= 60:
        ttl_display = f'{ttl_minutes // 60} 小时 {ttl_minutes % 60} 分钟'
    else:
        ttl_display = f'{ttl_minutes} 分钟'

    expire_display = '永不过期'
    expire_days_left = -1
    expire_text = '有效期不限'
    expire_level = 'forever'
    if share_expires_at:
        try:
            expire_time = datetime.strptime(share_expires_at, '%Y-%m-%dT%H:%M')
            expire_display = expire_time.strftime('%Y-%m-%d %H:%M')
            remain = expire_time - datetime.now()
            expire_days_left = max(0, remain.days)
            total_seconds = remain.total_seconds()
            if total_seconds <= 0:
                expire_text = '已过期'
                expire_level = 'danger'
            elif total_seconds < 60:
                expire_text = '即将过期'
                expire_level = 'danger'
            elif total_seconds < 3600:
                expire_text = f'还剩 {int(total_seconds // 60)} 分钟'
                expire_level = 'danger'
            elif total_seconds < 86400:
                hour_s = int(total_seconds // 3600)
                min_s = int((total_seconds % 3600) // 60)
                expire_text = f'还剩 {hour_s} 小时' if min_s == 0 else f'还剩 {hour_s} 小时 {min_s} 分钟'
                expire_level = 'warn'
            else:
                days = remain.days
                expire_text = f'还剩 {days} 天'
                expire_level = 'normal' if days > 1 else 'warn'
        except (ValueError, TypeError):
            pass

    # 分享页描述：优先独立描述，否则回退到收集页描述
    share_description_text = link.get('share_description') or link.get('description', '')

    # 查询创建者名称（优先昵称）
    creator_name = ''
    try:
        conn2 = get_db()
        user_row = conn2.execute("SELECT username, nickname FROM users WHERE id = ?", (share_owner_id,)).fetchone()
        conn2.close()
        if user_row:
            creator_name = user_row['nickname'] or user_row['username']
    except Exception:
        pass

    csrf_token = generate_csrf_token()
    share_page_title = get_user_setting(share_owner_id, 'share_page_title', '')
    share_footer_text = get_user_setting(share_owner_id, 'share_footer_text', '')
    return render_template('share.html',
        link_id=link_id,
        task_title=link['title'],
        description=share_description_text,
        verified=verified,
        has_passcode=has_passcode,
        in_wechat=is_wechat_browser(),
        site_title=get_user_setting(share_owner_id, 'site_title', '文件收集器'),
        share_page_title=share_page_title,
        collect_footer_text=get_user_setting(share_owner_id, 'collect_footer_text', ''),
        share_footer_text=share_footer_text,
        public_url=get_user_setting(share_owner_id, 'public_url', ''),
        version=VERSION,
        passcode_ttl_display=ttl_display,
        expire_display=expire_display,
        expire_days_left=expire_days_left,
        expire_text=expire_text,
        expire_level=expire_level,
        creator_name=creator_name,
        require_uploader=bool(link.get('require_uploader', 0)),
        csrf_token=csrf_token)

@app.route('/share/<link_id>/verify', methods=['POST'])
def share_verify_passcode(link_id):
    """分享页验证通行证（独立分享通行证 + 复用收集页通行证 fallback）"""
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败，请刷新页面重试'}), 403

    client_ip = _get_client_ip()
    if not rate_limit(f'verify_{link_id}_{client_ip}', max_attempts=5, window_seconds=60):
        return jsonify({'success': False, 'message': '验证过于频繁，请1分钟后再试'}), 429

    conn = get_db()
    row = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    conn.close()
    link = dict(row) if row else None

    if not link:
        return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

    # 判断分享页有效通行证（与 share_page 逻辑一致）
    _sp = link.get('share_passcode', '')
    _spe = link.get('share_passcode_empty', 0)
    share_session_key = f'share_verified_{link_id}'

    if _spe:
        # 分享页空通行证：无需验证
        session[share_session_key] = time.time()
        return jsonify({'success': True})
    elif _sp and _sp.strip():
        # 分享页独立通行证
        passcode = request.form.get('passcode', '').strip()
        if passcode and check_password_hash(_sp, passcode):
            session[share_session_key] = time.time()
            return jsonify({'success': True})
        return jsonify({'success': False, 'message': '通行证错误'}), 403
    else:
        # 复用收集页通行证
        has_passcode = bool(link.get('passcode_plain', '') and link.get('passcode_plain', '').strip())
        if not has_passcode:
            session[share_session_key] = time.time()
            return jsonify({'success': True})
        passcode = request.form.get('passcode', '').strip()
        if passcode and check_password_hash(link.get('passcode', ''), passcode):
            session[share_session_key] = time.time()
            return jsonify({'success': True})
        return jsonify({'success': False, 'message': '通行证错误'}), 403

@app.route('/share/<link_id>/logout', methods=['POST'])
def share_logout_passcode(link_id):
    """分享页退出通行证"""
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败'}), 403
    session.pop(f'share_verified_{link_id}', None)
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

    if not is_share_verified(link_id, link):
        conn.close()
        return jsonify({'success': False, 'message': '请先验证通行证'}), 403

    # 清理孤儿记录（文件已被删除的数据库记录）
    cleanup_orphan_records_for_link(conn, link_id)

    records = conn.execute(
        "SELECT id, original_name, file_size_display, uploaded_at, download_count, uploader_name FROM upload_records WHERE link_id = ? ORDER BY uploaded_at DESC LIMIT 50",
        (link_id,)
    ).fetchall()
    require_uploader = bool(dict(link).get('require_uploader', 0))
    conn.close()

    return jsonify({
        'success': True,
        'require_uploader': require_uploader,
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

    if not is_share_verified(link_id, link):
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

    if not is_share_verified(link_id, link):
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

    _log_download(record_id, 'share')
    return _safe_download(record['stored_path'], record['original_name'])

@app.route('/share/<link_id>/preview_file/<int:record_id>', methods=['GET'])
def share_preview_file(link_id, record_id):
    """分享页预览文件（用于JIT Viewer SDK获取文件内容）"""
    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    if not link:
        conn.close()
        return '链接不存在或已失效', 404

    if not is_share_verified(link_id, link):
        conn.close()
        return '请先验证通行证', 403

    record = conn.execute(
        "SELECT stored_path, original_name FROM upload_records WHERE id = ? AND link_id = ?",
        (record_id, link_id)
    ).fetchone()

    if not record:
        conn.close()
        return '文件不存在', 404

    conn.close()

    upload_base = get_upload_base()
    real_path = os.path.realpath(record['stored_path'])
    real_base = os.path.realpath(upload_base)
    
    # 安全检查
    if not real_path.startswith(real_base + os.sep) and real_path != real_base:
        logger.warning(f"路径遍历攻击拦截: stored_path={record['stored_path']}, upload_base={real_base}")
        abort(403)
    
    if not os.path.isfile(real_path):
        abort(404)

    directory = os.path.dirname(real_path)
    filename = os.path.basename(real_path)
    
    # 不使用 as_attachment，允许SDK读取文件内容
    response = send_from_directory(
        directory, filename,
        download_name=record['original_name'],
        as_attachment=False
    )
    
    # 添加CORS响应头，允许JIT Viewer SDK跨域访问
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    
    return response

@app.route('/share/<link_id>/view/<int:record_id>', methods=['GET'])
def share_jit_view(link_id, record_id):
    """新窗口纯净预览 - JIT Viewer"""
    conn = get_db()
    link = conn.execute(
        "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
    ).fetchone()
    if not link:
        conn.close()
        return '链接不存在或已失效', 404

    if not is_share_verified(link_id, link):
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
    if not os.path.isfile(real_path):
        abort(404)

    file_url = request.host_url.rstrip('/') + '/share/' + link_id + '/preview_file/' + str(record_id)
    download_url = '/share/' + link_id + '/download/' + str(record_id)
    return render_template('jit_preview.html',
        filename=record['original_name'],
        file_url=file_url,
        download_url=download_url)

@app.route('/share/<link_id>/delete_record/<int:record_id>', methods=['POST'])
def share_delete_record(link_id, record_id):
    """分享页不允许删除文件"""
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

    # 清理孤儿记录（文件已被删除的数据库记录）
    cleanup_orphan_records_for_link(conn, link_id)

    require_uploader = bool(dict(link).get('require_uploader', 0))
    uploader_name = (session.get(f'uploader_{link_id}') or '').strip()

    if require_uploader and uploader_name:
        # 上传者已设置身份 → 只看自己上传的文件
        total_uploaded = conn.execute(
            "SELECT COUNT(*) FROM upload_records WHERE link_id = ? AND uploader_name = ?", (link_id, uploader_name)
        ).fetchone()[0]
        records = conn.execute(
            "SELECT id, original_name, file_size_display, uploaded_at, download_count, uploader_name FROM upload_records WHERE link_id = ? AND uploader_name = ? ORDER BY uploaded_at DESC LIMIT 50",
            (link_id, uploader_name)
        ).fetchall()
    elif require_uploader:
        # 开启了上传者但未设置身份 → 什么也看不到
        total_uploaded = 0
        records = []
    else:
        total_uploaded = conn.execute(
            "SELECT COUNT(*) FROM upload_records WHERE link_id = ?", (link_id,)
        ).fetchone()[0]
        records = conn.execute(
            "SELECT id, original_name, file_size_display, uploaded_at, download_count, uploader_name FROM upload_records WHERE link_id = ? ORDER BY uploaded_at DESC LIMIT 50",
            (link_id,)
        ).fetchall()
    conn.close()

    return jsonify({
        'success': True,
        'allow_delete': bool(link['allow_delete']),
        'max_files': link['max_files'],
        'total_uploaded': total_uploaded,
        'require_uploader': require_uploader,
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

    _log_download(record_id, 'collect')
    return _safe_download(record['stored_path'], record['original_name'])

@app.route('/collect/<link_id>/preview_file/<int:record_id>', methods=['GET'])
def collect_preview_file(link_id, record_id):
    """收集页预览文件（用于JIT Viewer SDK获取文件内容）"""
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

    conn.close()

    upload_base = get_upload_base()
    real_path = os.path.realpath(record['stored_path'])
    real_base = os.path.realpath(upload_base)
    
    # 安全检查
    if not real_path.startswith(real_base + os.sep) and real_path != real_base:
        logger.warning(f"路径遍历攻击拦截: stored_path={record['stored_path']}, upload_base={real_base}")
        abort(403)
    
    if not os.path.isfile(real_path):
        abort(404)

    directory = os.path.dirname(real_path)
    filename = os.path.basename(real_path)
    
    # 不使用 as_attachment，允许SDK读取文件内容
    response = send_from_directory(
        directory, filename,
        download_name=record['original_name'],
        as_attachment=False
    )
    
    # 添加CORS响应头，允许JIT Viewer SDK跨域访问
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    
    return response

@app.route('/collect/<link_id>/view/<int:record_id>', methods=['GET'])
def collect_jit_view(link_id, record_id):
    """新窗口纯净预览 - JIT Viewer（收集页）"""
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
    if not os.path.isfile(real_path):
        abort(404)

    file_url = request.host_url.rstrip('/') + '/collect/' + link_id + '/preview_file/' + str(record_id)
    download_url = '/collect/' + link_id + '/download/' + str(record_id)
    return render_template('jit_preview.html',
        filename=record['original_name'],
        file_url=file_url,
        download_url=download_url)

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

        uploader_name = (session.get(f'uploader_{link_id}') or '').strip()
        upload_dir = create_upload_dir(link_id, uploader_name)
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

            safe_name = safe_filename_unicode(file.filename)
            if not safe_name:
                safe_name = 'unnamed_file'
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
                   (link_id, user_id, original_name, stored_name, stored_path, file_size,
                    file_size_display, uploader_ip, uploader_name, uploaded_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (link_id, link['user_id'] or '', file.filename, stored_name, stored_path, size,
                 format_file_size(size), _get_client_ip(), uploader_name,
                 datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
            )
            record_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
            conn.commit()
            _log_upload(link_id, 'upload_complete', record_id=record_id,
                        details={'name': file.filename, 'size': size, 'stored': stored_name},
                        uploader_name=uploader_name)

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

    except PermissionError as e:
        logger.error(f"上传目录无权限: link={link_id}, error={e}")
        return jsonify({'success': False, 'message': '请在飞牛应用设置中添加自定义文件夹的读写权限'}), 500
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
# 路由 - 分片上传 / 断点续传
# ============================================================

CHUNK_SIZE = 5 * 1024 * 1024  # 5MB per chunk (default)
CHUNK_MAX_CONCURRENT = 3       # max concurrent chunk uploads

def _get_chunk_dir(upload_dir, upload_id):
    """获取分片临时目录，确保路径安全"""
    safe_uid = re.sub(r'[^\w\-]', '_', upload_id)
    chunk_dir = os.path.join(upload_dir, '.chunks', safe_uid)
    real_chunk_dir = os.path.realpath(chunk_dir)
    real_base = os.path.realpath(upload_dir)
    if not real_chunk_dir.startswith(real_base + os.sep) and real_chunk_dir != real_base:
        raise ValueError('Invalid chunk path')
    os.makedirs(real_chunk_dir, mode=0o755, exist_ok=True)
    return real_chunk_dir

def _cleanup_abandoned_chunks(upload_dir, max_age_hours=24):
    """清理超时的分片临时文件"""
    import glob as _glob
    chunks_root = os.path.join(upload_dir, '.chunks')
    if not os.path.isdir(chunks_root):
        return
    now = time.time()
    cutoff = now - (max_age_hours * 3600)
    try:
        for uid_dir in os.listdir(chunks_root):
            uid_path = os.path.join(chunks_root, uid_dir)
            if os.path.isdir(uid_path):
                mtime = os.path.getmtime(uid_path)
                if mtime < cutoff:
                    try:
                        shutil.rmtree(uid_path)
                        logger.info(f"清理过期分片目录: {uid_path}")
                    except Exception:
                        pass
    except Exception:
        pass

@app.route('/collect/<link_id>/chunk/status', methods=['GET'])
def chunk_upload_status(link_id):
    """查询分片上传状态，返回已上传分片列表（断点续传用）"""
    if not re.match(r'^[a-zA-Z0-9]{8}$', link_id):
        return jsonify({'success': False, 'message': '链接格式无效'}), 400

    upload_id = request.args.get('upload_id', '').strip()
    if not upload_id or len(upload_id) > 128:
        return jsonify({'success': False, 'message': '缺少有效的 upload_id'}), 400

    conn = get_db()
    try:
        link = conn.execute(
            "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
        ).fetchone()
        if not link:
            return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

        if not is_verified(link_id, link):
            return jsonify({'success': False, 'message': '请先验证通行证'}), 403

        row = conn.execute(
            "SELECT * FROM chunk_uploads WHERE upload_id = ? AND link_id = ?",
            (upload_id, link_id)
        ).fetchone()

        if row:
            uploaded = []
            if row['uploaded_chunks']:
                try:
                    uploaded = json.loads(row['uploaded_chunks'])
                except (json.JSONDecodeError, TypeError):
                    uploaded = []
            return jsonify({
                'success': True,
                'upload_id': upload_id,
                'status': row['status'],
                'total_chunks': row['total_chunks'],
                'chunk_size': row['chunk_size'],
                'total_size': row['total_size'],
                'uploaded_chunks': uploaded,
                'stored_path': row['stored_path'] if row['status'] == 'completed' else ''
            })
        else:
            return jsonify({
                'success': True,
                'upload_id': upload_id,
                'status': 'new',
                'total_chunks': 0,
                'chunk_size': CHUNK_SIZE,
                'total_size': 0,
                'uploaded_chunks': []
            })
    except Exception as e:
        logger.error(f"chunk_status error: {e}\n{traceback.format_exc()}")
        return jsonify({'success': False, 'message': '查询状态失败'}), 500
    finally:
        conn.close()

@app.route('/collect/<link_id>/chunk/init', methods=['POST'])
def chunk_upload_init(link_id):
    """初始化分片上传会话"""
    if not re.match(r'^[a-zA-Z0-9]{8}$', link_id):
        return jsonify({'success': False, 'message': '链接格式无效'}), 400
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败'}), 403

    upload_id = request.form.get('upload_id', '').strip()
    filename = request.form.get('filename', '').strip()
    file_size = request.form.get('file_size', '0').strip()
    chunk_size_str = request.form.get('chunk_size', str(CHUNK_SIZE)).strip()

    if not upload_id or len(upload_id) > 128:
        return jsonify({'success': False, 'message': '缺少有效的 upload_id'}), 400
    if not filename:
        return jsonify({'success': False, 'message': '缺少文件名'}), 400

    try:
        file_size_int = int(file_size)
        chunk_size_int = min(int(chunk_size_str), CHUNK_SIZE)
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': '参数格式错误'}), 400

    if file_size_int <= 0:
        return jsonify({'success': False, 'message': '无效的文件大小'}), 400

    total_chunks = max(1, (file_size_int + chunk_size_int - 1) // chunk_size_int)

    conn = get_db()
    try:
        link = conn.execute(
            "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
        ).fetchone()
        if not link:
            return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

        if not is_verified(link_id, link):
            return jsonify({'success': False, 'message': '请先验证通行证'}), 403

        # 检查数量限制
        max_files = link['max_files']
        if max_files > 0:
            current_count = conn.execute(
                "SELECT COUNT(*) FROM upload_records WHERE link_id = ?", (link_id,)
            ).fetchone()[0]
            if current_count >= max_files:
                return jsonify({
                    'success': False,
                    'message': f'已达到最大上传数 {max_files} 个，无法继续上传'
                }), 400

        # 检查大小限制
        max_size_bytes = round(link['max_file_size_gb'] * 1024 * 1024 * 1024)
        if file_size_int > max_size_bytes:
            limit_display = f'{link["max_file_size_gb"]} GB'
            if link['max_file_size_gb'] < 1:
                limit_mb = round(link['max_file_size_gb'] * 1024, 2)
                limit_display = f'{limit_mb} MB'
            return jsonify({
                'success': False,
                'message': f'文件大小 {format_file_size(file_size_int)} 超过限制（上限 {limit_display}）'
            }), 400

        # 检查文件类型
        if not allowed_file(filename):
            return jsonify({'success': False, 'message': '不支持的文件类型'}), 400

        safe_name = safe_filename_unicode(filename)
        if not safe_name:
            safe_name = 'unnamed_file'

        uploader_name = (session.get(f'uploader_{link_id}') or '').strip()
        upload_dir = create_upload_dir(link_id, uploader_name)
        stored_path = os.path.join(upload_dir, safe_name)

        # 清理过期分片（每次初始化时触发一次）
        _cleanup_abandoned_chunks(upload_dir, max_age_hours=24)

        # 先按 upload_id 精确查找
        existing = conn.execute(
            "SELECT * FROM chunk_uploads WHERE upload_id = ? AND link_id = ?",
            (upload_id, link_id)
        ).fetchone()

        # 如果按 upload_id 找不到，尝试按 文件名+大小 匹配（支持跨页面刷新的断点续传）
        if not existing:
            existing = conn.execute(
                """SELECT * FROM chunk_uploads
                   WHERE link_id = ? AND original_name = ? AND total_size = ?
                   AND status = 'uploading'
                   ORDER BY updated_at DESC LIMIT 1""",
                (link_id, filename, file_size_int)
            ).fetchone()
            if existing:
                upload_id = existing['upload_id']  # 使用已存在的 upload_id
                logger.info(f"断点续传匹配: {filename} → upload_id={upload_id}")

        if existing:
            # 续传：返回已上传的分片
            uploaded = []
            if existing['uploaded_chunks']:
                try:
                    uploaded = json.loads(existing['uploaded_chunks'])
                except (json.JSONDecodeError, TypeError):
                    pass
            # 更新元数据（可能已变更）
            conn.execute(
                """UPDATE chunk_uploads SET
                   original_name=?, stored_name=?, total_size=?, chunk_size=?, total_chunks=?,
                   updated_at=CURRENT_TIMESTAMP
                   WHERE upload_id=? AND link_id=?""",
                (filename, safe_name, file_size_int, chunk_size_int, total_chunks, upload_id, link_id)
            )
            conn.commit()
            _log_upload(link_id, 'chunk_init',
                        details={'name': filename, 'size': file_size_int, 'chunks': total_chunks, 'status': 'resumed', 'uploaded': len(uploaded)},
                        uploader_name=uploader_name)
            return jsonify({
                'success': True,
                'upload_id': upload_id,
                'total_chunks': total_chunks,
                'chunk_size': chunk_size_int,
                'total_size': file_size_int,
                'uploaded_chunks': uploaded
            })
        else:
            # 新建会话
            conn.execute(
                """INSERT INTO chunk_uploads
                   (upload_id, link_id, user_id, original_name, stored_name,
                    total_size, chunk_size, total_chunks, uploaded_chunks, status,
                    uploader_ip)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'uploading', ?)""",
                (upload_id, link_id, link['user_id'] or '', filename, safe_name,
                 file_size_int, chunk_size_int, total_chunks, '[]', _get_client_ip())
            )
            conn.commit()
            _log_upload(link_id, 'chunk_init',
                        details={'name': filename, 'size': file_size_int, 'chunks': total_chunks, 'status': 'initialized'},
                        uploader_name=uploader_name)
            return jsonify({
                'success': True,
                'upload_id': upload_id,
                'total_chunks': total_chunks,
                'chunk_size': chunk_size_int,
                'total_size': file_size_int,
                'uploaded_chunks': []
            })
    except PermissionError as e:
        logger.error(f"chunk_init 目录无权限: {e}")
        return jsonify({'success': False, 'message': '请在飞牛应用设置中添加自定义文件夹的读写权限'}), 500
    except Exception as e:
        logger.error(f"chunk_init error: {e}\n{traceback.format_exc()}")
        return jsonify({'success': False, 'message': '初始化失败'}), 500
    finally:
        conn.close()

@app.route('/collect/<link_id>/chunk/upload', methods=['POST'])
def chunk_upload(link_id):
    """接收单个分片"""
    if not re.match(r'^[a-zA-Z0-9]{8}$', link_id):
        return jsonify({'success': False, 'message': '链接格式无效'}), 400
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败'}), 403

    # 分片上传频率限制（比整文件上传宽松：300次/分钟）
    client_ip = _get_client_ip()
    if not rate_limit(f'chunk_{link_id}_{client_ip}', max_attempts=300, window_seconds=60):
        return jsonify({'success': False, 'message': '上传过于频繁，请稍后再试'}), 429

    upload_id = request.form.get('upload_id', '').strip()
    chunk_index_str = request.form.get('chunk_index', '').strip()

    logger.debug(f"chunk_upload: link={link_id} upload_id={upload_id[:20]}... chunk={chunk_index_str}")

    if not upload_id or len(upload_id) > 128:
        return jsonify({'success': False, 'message': '缺少有效的 upload_id'}), 400
    if not chunk_index_str:
        return jsonify({'success': False, 'message': '缺少 chunk_index'}), 400

    try:
        chunk_index = int(chunk_index_str)
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'chunk_index 格式错误'}), 400

    if 'file' not in request.files:
        return jsonify({'success': False, 'message': '没有接收到分片数据'}), 400

    chunk_file = request.files['file']
    if not chunk_file or not chunk_file.filename:
        return jsonify({'success': False, 'message': '分片数据为空'}), 400

    conn = get_db()
    try:
        link = conn.execute(
            "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
        ).fetchone()
        if not link:
            return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

        if not is_verified(link_id, link):
            return jsonify({'success': False, 'message': '请先验证通行证'}), 403

        session_row = conn.execute(
            "SELECT * FROM chunk_uploads WHERE upload_id = ? AND link_id = ? AND status = 'uploading'",
            (upload_id, link_id)
        ).fetchone()

        if not session_row:
            return jsonify({'success': False, 'message': '上传会话不存在或已结束，请重新初始化'}), 404

        if chunk_index < 0 or chunk_index >= session_row['total_chunks']:
            return jsonify({'success': False, 'message': f'chunk_index 超出范围 (0~{session_row["total_chunks"]-1})'}), 400

        # 检查是否已上传
        uploaded = []
        if session_row['uploaded_chunks']:
            try:
                uploaded = json.loads(session_row['uploaded_chunks'])
            except (json.JSONDecodeError, TypeError):
                pass

        if chunk_index in uploaded:
            return jsonify({
                'success': True,
                'chunk_index': chunk_index,
                'uploaded_chunks': uploaded,
                'skipped': True
            })

        # 保存分片
        uploader_name = (session.get(f'uploader_{link_id}') or '').strip()
        upload_dir = create_upload_dir(link_id, uploader_name)
        chunk_dir = _get_chunk_dir(upload_dir, upload_id)
        chunk_path = os.path.join(chunk_dir, f'chunk_{chunk_index:05d}')
        chunk_file.save(chunk_path)

        # 验证分片大小
        actual_size = os.path.getsize(chunk_path)
        expected_max = session_row['chunk_size']
        # 最后一个分片可能小于 chunk_size
        is_last = (chunk_index == session_row['total_chunks'] - 1)
        if actual_size > expected_max and not is_last:
            os.remove(chunk_path)
            return jsonify({'success': False, 'message': '分片大小异常'}), 400

        # 使用 BEGIN IMMEDIATE 事务防止并发写覆盖（读-改-写竞态条件）
        conn.execute("BEGIN IMMEDIATE")
        try:
            # 重新读取最新的 uploaded_chunks，避免覆盖其他 worker 的写入
            fresh = conn.execute(
                "SELECT uploaded_chunks FROM chunk_uploads WHERE upload_id = ?",
                (upload_id,)
            ).fetchone()
            fresh_uploaded = []
            if fresh and fresh['uploaded_chunks']:
                try:
                    fresh_uploaded = json.loads(fresh['uploaded_chunks'])
                except (json.JSONDecodeError, TypeError):
                    pass
            if chunk_index not in fresh_uploaded:
                fresh_uploaded.append(chunk_index)
                fresh_uploaded.sort()
            conn.execute(
                "UPDATE chunk_uploads SET uploaded_chunks = ?, updated_at = CURRENT_TIMESTAMP WHERE upload_id = ?",
                (json.dumps(fresh_uploaded), upload_id)
            )
            conn.commit()
            uploaded = fresh_uploaded
        except Exception:
            conn.execute("ROLLBACK")
            # 回退到简单更新（写入失败时仍返回成功，容错）
            uploaded.append(chunk_index)
            uploaded.sort()
            try:
                conn.execute(
                    "UPDATE chunk_uploads SET uploaded_chunks = ?, updated_at = CURRENT_TIMESTAMP WHERE upload_id = ?",
                    (json.dumps(uploaded), upload_id)
                )
                conn.commit()
            except Exception:
                pass

        return jsonify({
            'success': True,
            'chunk_index': chunk_index,
            'uploaded_chunks': uploaded,
            'total_chunks': session_row['total_chunks']
        })
    except PermissionError as e:
        logger.error(f"chunk_upload 目录无权限: {e}")
        return jsonify({'success': False, 'message': '请在飞牛应用设置中添加自定义文件夹的读写权限'}), 500
    except Exception as e:
        logger.error(f"chunk_upload error: {e}\n{traceback.format_exc()}")
        return jsonify({'success': False, 'message': '分片上传失败'}), 500
    finally:
        conn.close()

@app.route('/collect/<link_id>/chunk/merge', methods=['POST'])
def chunk_merge(link_id):
    """合并所有分片为最终文件"""
    if not re.match(r'^[a-zA-Z0-9]{8}$', link_id):
        return jsonify({'success': False, 'message': '链接格式无效'}), 400
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败'}), 403

    upload_id = request.form.get('upload_id', '').strip()
    if not upload_id or len(upload_id) > 128:
        return jsonify({'success': False, 'message': '缺少有效的 upload_id'}), 400

    conn = get_db()
    try:
        link = conn.execute(
            "SELECT * FROM links WHERE id = ? AND status = 'active'", (link_id,)
        ).fetchone()
        if not link:
            return jsonify({'success': False, 'message': '链接不存在或已失效'}), 404

        if not is_verified(link_id, link):
            return jsonify({'success': False, 'message': '请先验证通行证'}), 403

        session_row = conn.execute(
            "SELECT * FROM chunk_uploads WHERE upload_id = ? AND link_id = ? AND status = 'uploading'",
            (upload_id, link_id)
        ).fetchone()

        if not session_row:
            # 检查是否已完成
            completed = conn.execute(
                "SELECT * FROM chunk_uploads WHERE upload_id = ? AND link_id = ? AND status = 'completed'",
                (upload_id, link_id)
            ).fetchone()
            if completed:
                return jsonify({
                    'success': True,
                    'message': '文件已合并完成',
                    'stored_path': completed['stored_path'],
                    'status': 'already_completed'
                })
            return jsonify({'success': False, 'message': '上传会话不存在'}), 404

        # 验证所有分片都已上传
        uploaded = []
        if session_row['uploaded_chunks']:
            try:
                uploaded = json.loads(session_row['uploaded_chunks'])
            except (json.JSONDecodeError, TypeError):
                pass

        uploader_name = (session.get(f'uploader_{link_id}') or '').strip()
        upload_dir = create_upload_dir(link_id, uploader_name)
        chunk_dir = _get_chunk_dir(upload_dir, upload_id)
        total_chunks = session_row['total_chunks']

        # 容错：DB 记录可能因并发写丢失了部分分片，检查磁盘实际文件
        if len(uploaded) != total_chunks:
            missing_in_db = [i for i in range(total_chunks) if i not in uploaded]
            actual_missing = []
            for ci in missing_in_db:
                chunk_path = os.path.join(chunk_dir, f'chunk_{ci:05d}')
                if os.path.exists(chunk_path):
                    # 分片文件存在，补齐 DB 记录
                    uploaded.append(ci)
                else:
                    actual_missing.append(ci)
            if actual_missing:
                return jsonify({
                    'success': False,
                    'message': f'还有 {len(actual_missing)} 个分片未上传',
                    'missing_chunks': actual_missing
                }), 400
            # 补齐后更新 DB
            uploaded.sort()
            conn.execute(
                "UPDATE chunk_uploads SET uploaded_chunks = ?, updated_at = CURRENT_TIMESTAMP WHERE upload_id = ?",
                (json.dumps(uploaded), upload_id)
            )
            conn.commit()

        # 标记为合并中
        conn.execute(
            "UPDATE chunk_uploads SET status = 'merging', updated_at = CURRENT_TIMESTAMP WHERE upload_id = ?",
            (upload_id,)
        )
        conn.commit()

        # 合并分片
        stored_name = session_row['stored_name']
        stored_path = os.path.join(upload_dir, stored_name)

        # 检查最终文件是否已存在
        if os.path.exists(stored_path):
            _cleanup_chunk_dir(chunk_dir)
            conn.execute(
                "UPDATE chunk_uploads SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE upload_id = ?",
                (upload_id,)
            )
            conn.commit()
            return jsonify({
                'success': False,
                'message': f'文件名 "{session_row["original_name"]}" 已存在，请重命名后重新上传'
            }), 409

        # 合并写入（带校验和大小验证）
        total_written = 0
        expected_size = session_row['total_size']
        try:
            with open(stored_path, 'wb') as outfile:
                for i in range(total_chunks):
                    chunk_path = os.path.join(chunk_dir, f'chunk_{i:05d}')
                    if not os.path.exists(chunk_path):
                        raise FileNotFoundError(f'分片 {i} 丢失: {chunk_path}')
                    with open(chunk_path, 'rb') as infile:
                        data = infile.read()
                        outfile.write(data)
                        total_written += len(data)

            if total_written != expected_size:
                os.remove(stored_path)
                raise ValueError(
                    f'合并后文件大小不一致: 期望 {expected_size}, 实际 {total_written}'
                )

            logger.info(f"分片合并完成: {stored_path} ({format_file_size(total_written)})")

        except Exception as merge_err:
            # 合并失败，回滚状态
            if os.path.exists(stored_path):
                try:
                    os.remove(stored_path)
                except Exception:
                    pass
            conn.execute(
                "UPDATE chunk_uploads SET status = 'uploading', updated_at = CURRENT_TIMESTAMP WHERE upload_id = ?",
                (upload_id,)
            )
            conn.commit()
            logger.error(f"分片合并失败: {merge_err}")
            return jsonify({
                'success': False,
                'message': f'文件合并失败: {str(merge_err)}'
            }), 500

        # 写入 upload_records
        cursor = conn.execute(
            """INSERT INTO upload_records
               (link_id, user_id, original_name, stored_name, stored_path, file_size,
                file_size_display, uploader_ip, uploader_name, uploaded_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (link_id, link['user_id'] or '', session_row['original_name'],
             stored_name, stored_path, total_written,
             format_file_size(total_written), _get_client_ip(), uploader_name,
             datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        )
        record_id = cursor.lastrowid

        # 标记完成
        conn.execute(
            "UPDATE chunk_uploads SET status = 'completed', stored_path = ?, updated_at = CURRENT_TIMESTAMP WHERE upload_id = ?",
            (stored_path, upload_id)
        )
        conn.commit()

        # 记录分片合并成功日志
        _log_upload(link_id, 'chunk_merge', record_id=record_id,
                    details={'name': session_row['original_name'], 'size': total_written,
                             'chunks': total_chunks, 'stored': stored_name},
                    uploader_name=uploader_name)

        # 清理分片临时文件
        _cleanup_chunk_dir(chunk_dir)

        logger.info(f"分片上传完成: link={link_id}, file={stored_name}, record_id={record_id}")

        return jsonify({
            'success': True,
            'message': '文件上传成功',
            'record_id': record_id,
            'original_name': session_row['original_name'],
            'file_size_display': format_file_size(total_written),
            'stored_path': stored_path
        })

    except Exception as e:
        logger.error(f"chunk_merge error: {e}\n{traceback.format_exc()}")
        return jsonify({'success': False, 'message': '文件合并失败'}), 500
    finally:
        conn.close()

@app.route('/collect/<link_id>/chunk/cancel', methods=['POST'])
def chunk_cancel(link_id):
    """取消/清理分片上传"""
    if not re.match(r'^[a-zA-Z0-9]{8}$', link_id):
        return jsonify({'success': False, 'message': '链接格式无效'}), 400
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败'}), 403

    upload_id = request.form.get('upload_id', '').strip()
    if not upload_id or len(upload_id) > 128:
        return jsonify({'success': False, 'message': '缺少有效的 upload_id'}), 400

    conn = get_db()
    try:
        conn.execute(
            "UPDATE chunk_uploads SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE upload_id = ? AND link_id = ?",
            (upload_id, link_id)
        )
        conn.commit()

        # 清理分片文件
        try:
            uploader_name = (session.get(f'uploader_{link_id}') or '').strip()
            upload_dir = create_upload_dir(link_id, uploader_name)
            chunk_dir = os.path.join(upload_dir, '.chunks', re.sub(r'[^\w\-]', '_', upload_id))
            if os.path.isdir(chunk_dir):
                shutil.rmtree(chunk_dir)
        except Exception:
            pass

        return jsonify({'success': True, 'message': '已取消'})
    except PermissionError:
        # 取消操作即使无权限也忽略
        pass
    except Exception as e:
        logger.error(f"chunk_cancel error: {e}")
        return jsonify({'success': False, 'message': '取消失败'}), 500
    finally:
        conn.close()

def _cleanup_chunk_dir(chunk_dir):
    """安全删除分片目录"""
    try:
        if os.path.isdir(chunk_dir):
            shutil.rmtree(chunk_dir)
    except Exception:
        pass

# ============================================================
# 路由 - 用户注册和邀请码管理
# ============================================================

@app.route('/register', methods=['GET', 'POST'])
def register():
    """用户注册（需要邀请码）"""
    allow_reg = get_setting('allow_registration', '0') == '1'
    if not allow_reg:
        flash('当前未开放注册')
        return redirect(url_for('admin_login'))

    if request.method == 'POST':
        if not validate_csrf():
            flash('安全验证失败')
            return render_template('register.html', allow_registration=True)

        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        email_addr = request.form.get('email', '').strip().lower()
        invite_code = request.form.get('invite_code', '').strip()

        # 验证用户名
        if not username or len(username) < 3 or len(username) > 32:
            flash('用户名必须在3-32个字符之间')
            return render_template('register.html', allow_registration=True)
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
            flash('用户名需由3-20个字母、数字或下划线组成')
            return render_template('register.html', allow_registration=True)

        # 验证邮箱（必须填写）
        if not email_addr or '@' not in email_addr:
            flash('请输入有效的邮箱地址')
            return render_template('register.html', allow_registration=True)

        # 验证密码（8位以上且包含字母和数字）
        if len(password) < 8:
            flash('密码长度至少需要8位')
            return render_template('register.html', allow_registration=True)
        if not re.search(r'[a-zA-Z]', password) or not re.search(r'[0-9]', password):
            flash('密码必须同时包含字母和数字')
            return render_template('register.html', allow_registration=True)

        if password != confirm_password:
            flash('两次输入的密码不一致')
            return render_template('register.html', allow_registration=True)

        # 验证邀请码
        invite = validate_invite_code(invite_code)
        if not invite:
            flash('邀请码无效或已过期')
            return render_template('register.html', allow_registration=True)

        # 检查邮箱是否已被使用
        conn = get_db()
        existing_email = conn.execute("SELECT id FROM users WHERE email = ?", (email_addr,)).fetchone()
        conn.close()
        if existing_email:
            flash('该邮箱已被注册')
            return render_template('register.html', allow_registration=True)

        # 创建用户
        user_id = create_user(username, password, email_addr)
        if not user_id:
            flash('注册失败，请重试（用户名可能已存在）')
            return render_template('register.html', allow_registration=True)

        # 标记邀请码已使用
        mark_invite_code_used(invite_code, user_id)

        # 创建用户文件夹
        user_folder = get_user_folder(user_id)
        if user_folder:
            os.makedirs(user_folder, exist_ok=True)

        # 发送注册欢迎邮件
        try:
            site_title = get_setting('site_title', '文件收集器')
            smtp_config = get_smtp_config()
            if smtp_config['host'] and smtp_config['from_email']:
                welcome_body = f'''<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:30px 0;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
  <tr><td style="background:#6366f1;padding:24px 32px;text-align:center;">
    <h2 style="color:#fff;margin:0;font-size:18px;">{site_title}</h2>
  </td></tr>
  <tr><td style="padding:32px;">
    <h3 style="margin:0 0 12px;color:#111827;font-size:15px;">🎉 欢迎注册 {site_title}</h3>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 20px;">亲爱的 <strong>{username}</strong>，您好！</p>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 20px;">您的账号已成功注册，以下是您的账户信息：</p>
    <div style="background:#f0f4ff;border-radius:8px;padding:16px 24px;margin-bottom:20px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr><td style="padding:4px 0;color:#4b5563;font-size:14px;">用户名</td><td style="padding:4px 0;color:#111827;font-size:14px;font-weight:500;">{username}</td></tr>
        <tr><td style="padding:4px 0;color:#4b5563;font-size:14px;">邮箱</td><td style="padding:4px 0;color:#111827;font-size:14px;font-weight:500;">{email_addr}</td></tr>
        <tr><td style="padding:4px 0;color:#4b5563;font-size:14px;">注册时间</td><td style="padding:4px 0;color:#111827;font-size:14px;font-weight:500;">{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</td></tr>
      </table>
    </div>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 8px;">您现在可以使用此账号登录并使用文件收集服务。</p>
    <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:0;">如非本人操作，请联系管理员。</p>
  </td></tr>
  <tr><td style="border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">此邮件由 {site_title} 系统自动发送</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>'''
                send_email(email_addr, f'[{site_title}] 注册成功 - 欢迎加入', welcome_body)
                logger.info(f"注册欢迎邮件已发送至 {email_addr}")
        except Exception as e:
            logger.error(f"发送注册欢迎邮件失败: {e}")

        flash('注册成功，请登录')
        return redirect(url_for('admin_login'))

    return render_template('register.html', allow_registration=True)

@admin_required
@app.route('/admin/invite_codes')
def admin_invite_codes():
    """邀请码管理页面"""
    conn = get_db()
    codes = []
    
    # 检查表是否存在
    try:
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='invite_codes'")
        if cursor.fetchone():
            codes = conn.execute(
                """SELECT ic.*, u.username as used_by_name, creator.username as created_by_name
                   FROM invite_codes ic
                   LEFT JOIN users u ON ic.used_by = u.id
                   LEFT JOIN users creator ON ic.created_by = creator.id
                   ORDER BY ic.created_at DESC"""
            ).fetchall()
    except Exception as e:
        logger.error(f"查询邀请码失败: {e}")
    
    conn.close()
    
    codes_list = [dict(code) for code in codes]
    return render_template('admin_invite_codes.html', invite_codes=codes_list, now=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

@admin_required
@app.route('/admin/invite_codes/generate', methods=['POST'])
def generate_invite_code_route():
    """生成邀请码"""
    if not validate_csrf():
        flash('安全验证失败')
        return redirect(url_for('admin_invite_codes'))

    expire_days = int(request.form.get('expire_days', 7))
    created_by = session.get('user_id')
    
    code = generate_invite_code(created_by, expire_days)
    if code:
        flash(f'邀请码已生成: {code}')
    else:
        flash('邀请码生成失败')
    return redirect(url_for('admin_invite_codes'))

@admin_required
@app.route('/admin/users')
def admin_users():
    """用户管理页面"""
    conn = get_db()
    users = []
    
    # 检查表是否存在
    try:
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if cursor.fetchone():
            users = conn.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
    except Exception as e:
        logger.error(f"查询用户失败: {e}")
    
    conn.close()
    
    users_list = [dict(user) for user in users]
    return render_template('admin_users.html', users=users_list)

@admin_required
@app.route('/admin/users/<user_id>/toggle', methods=['POST'])
def toggle_user_status(user_id):
    """切换用户状态"""
    if not validate_csrf():
        flash('安全验证失败')
        return redirect(url_for('admin_users'))

    conn = get_db()
    try:
        user = conn.execute("SELECT status FROM users WHERE id = ?", (user_id,)).fetchone()
        if user:
            new_status = 'inactive' if user['status'] == 'active' else 'active'
            conn.execute("UPDATE users SET status = ? WHERE id = ?", (new_status, user_id))
            conn.commit()
    except Exception as e:
        logger.error(f"切换用户状态失败: {e}")
        flash('操作失败')
    conn.close()
    
    flash('用户状态已更新')
    return redirect(url_for('admin_users'))

@admin_required
@app.route('/admin/users/<user_id>/edit', methods=['POST'])
def edit_user(user_id):
    """编辑用户信息"""
    if not validate_csrf():
        flash('安全验证失败')
        return redirect(url_for('admin_users'))
    
    new_username = request.form.get('new_username', '').strip()
    new_password = request.form.get('new_password', '').strip()
    new_email = request.form.get('new_email', '').strip().lower()
    
    if not new_username:
        flash('用户名不能为空')
        return redirect(url_for('admin_users'))
    
    conn = get_db()
    try:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            flash('用户不存在')
            conn.close()
            return redirect(url_for('admin_users'))
        
        # 检查用户名冲突
        existing = conn.execute("SELECT id FROM users WHERE username = ? AND id != ?", (new_username, user_id)).fetchone()
        if existing:
            flash('用户名已存在')
            conn.close()
            return redirect(url_for('admin_users'))
        
        # 检查邮箱冲突
        if new_email:
            email_conflict = conn.execute("SELECT id FROM users WHERE email = ? AND id != ?", (new_email, user_id)).fetchone()
            if email_conflict:
                flash('该邮箱已被其他用户使用')
                conn.close()
                return redirect(url_for('admin_users'))
        
        if new_password:
            password_hash = generate_password_hash(new_password)
            conn.execute("UPDATE users SET username = ?, password_hash = ?, email = ? WHERE id = ?",
                        (new_username, password_hash, new_email, user_id))
        else:
            conn.execute("UPDATE users SET username = ?, email = ? WHERE id = ?",
                        (new_username, new_email, user_id))
        conn.commit()
        # 如果用户登录了，更新 session
        if session.get('user_id') == user_id:
            session['username'] = new_username
        flash('用户信息已更新')
    except Exception as e:
        logger.error(f"编辑用户失败: {e}")
        flash('操作失败')
    conn.close()
    return redirect(url_for('admin_users'))

@admin_required
@app.route('/admin/users/<user_id>/delete', methods=['POST'])
def delete_user(user_id):
    """删除用户"""
    if not validate_csrf():
        flash('安全验证失败')
        return redirect(url_for('admin_users'))
    
    conn = get_db()
    try:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            flash('用户不存在')
            conn.close()
            return redirect(url_for('admin_users'))
        if user['is_admin']:
            flash('不能删除管理员账户')
            conn.close()
            return redirect(url_for('admin_users'))
        
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        # 清理关联数据
        conn.execute("UPDATE invite_codes SET used_by = NULL WHERE used_by = ?", (user_id,))
        conn.execute("UPDATE links SET user_id = '' WHERE user_id = ?", (user_id,))
        conn.execute("UPDATE upload_records SET user_id = '' WHERE user_id = ?", (user_id,))
        conn.commit()
        flash('用户已删除')
    except Exception as e:
        logger.error(f"删除用户失败: {e}")
        flash('操作失败')
    conn.close()
    return redirect(url_for('admin_users'))

@admin_required
@app.route('/admin/users/<user_id>/reset-password', methods=['POST'])
def reset_user_password(user_id):
    """重置用户密码"""
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败'})
    
    conn = get_db()
    try:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            conn.close()
            return jsonify({'success': False, 'message': '用户不存在'})
        
        new_password = secrets.token_hex(4)  # 8位随机密码
        password_hash = generate_password_hash(new_password)
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (password_hash, user_id))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': f'密码已重置为: {new_password}', 'new_password': new_password})
    except Exception as e:
        logger.error(f"重置密码失败: {e}")
        conn.close()
        return jsonify({'success': False, 'message': '操作失败'})

# ============================================================
# 路由 - 管理员后台
# ============================================================
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """管理员/用户登录"""
    # 已登录用户直接进入后台 dashboard
    if session.get('user_id'):
        return redirect(url_for('admin_dashboard'))
    
    if request.method == 'POST':
        if not validate_csrf():
            flash('安全验证失败，请刷新页面重试')
            login_tip = get_setting('login_tip', '')
            allow_reg = get_setting('allow_registration', '0') == '1'
            return render_template('admin_login.html', login_tip=login_tip, allow_registration=allow_reg)

        client_ip = _get_client_ip()
        if not rate_limit(f'login_{client_ip}', max_attempts=5, window_seconds=60):
            flash('登录尝试过于频繁，请稍后再试')
            login_tip = get_setting('login_tip', '')
            allow_reg = get_setting('allow_registration', '0') == '1'
            return render_template('admin_login.html', login_tip=login_tip, allow_registration=allow_reg)

        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        # 使用新的多用户认证
        user = validate_user_login(username, password)
        
        if user:
            session.clear()
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['is_admin'] = user['is_admin'] == 1
            session.permanent = True
            
            # 更新最后登录时间
            conn = get_db()
            conn.execute("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?", (user['id'],))
            conn.commit()
            conn.close()
            
            # 所有登录用户进入后台 dashboard
            return redirect(url_for('admin_dashboard'))
        else:
            flash('用户名或密码错误')
            login_tip = get_setting('login_tip', '')
            allow_reg = get_setting('allow_registration', '0') == '1'
            return render_template('admin_login.html', login_tip=login_tip, allow_registration=allow_reg)

    login_tip = get_setting('login_tip', '')
    allow_reg = get_setting('allow_registration', '0') == '1'
    return render_template('admin_login.html', login_tip=login_tip, allow_registration=allow_reg)

# ============================================================
# 忘记密码 / 重置密码
# ============================================================
@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """忘记密码 - 输入邮箱发送验证码"""
    if session.get('user_id'):
        return redirect(url_for('admin_dashboard'))

    if request.method == 'POST':
        if not validate_csrf():
            flash('安全验证失败')
            return render_template('forgot_password.html')

        email_addr = request.form.get('email', '').strip().lower()
        if not email_addr or '@' not in email_addr:
            flash('请输入有效的邮箱地址')
            return render_template('forgot_password.html')

        # 频率限制：同一邮箱 60 秒内只能发一次
        client_ip = _get_client_ip()
        if not rate_limit(f'forgot_{client_ip}', max_attempts=3, window_seconds=60):
            flash('操作过于频繁，请稍后再试')
            return render_template('forgot_password.html')

        user = get_user_by_email(email_addr)
        if not user:
            # 兼容：管理员初始创建时 users 表 email 为空
            # 若输入邮箱与 SMTP 发件人邮箱一致，允许管理员重置密码
            smtp_config = get_smtp_config()
            if smtp_config['from_email'] and smtp_config['from_email'].lower() == email_addr:
                admin_user = get_setting('admin_username', 'admin')
                conn_admin = get_db()
                user = conn_admin.execute(
                    "SELECT * FROM users WHERE username = ? AND is_admin = 1 AND status = 'active'",
                    (admin_user,)
                ).fetchone()
                conn_admin.close()
                if user:
                    user = dict(user)
                    # 同步 email 到 users 表，下次直接命中
                    try:
                        conn_sync = get_db()
                        conn_sync.execute("UPDATE users SET email = ? WHERE id = ? AND (email = '' OR email IS NULL)",
                                         (email_addr, user['id']))
                        conn_sync.commit()
                        conn_sync.close()
                    except Exception:
                        pass
            if not user:
                flash('该用户暂未注册，请仔细检查邮箱地址')
                return render_template('forgot_password.html')

        # 检查 SMTP 是否已配置
        smtp_config = get_smtp_config()
        if not smtp_config['host'] or not smtp_config['from_email']:
            flash('系统邮件服务未配置，请联系管理员')
            return render_template('forgot_password.html')

        # 生成验证码
        code = ''.join(secrets.choice('0123456789') for _ in range(6))
        expires_at = datetime.now() + timedelta(minutes=10)

        conn = get_db()
        conn.execute(
            "INSERT INTO verification_codes (email, code, purpose, expires_at) VALUES (?, ?, 'reset_password', ?)",
            (email_addr, code, expires_at.strftime('%Y-%m-%dT%H:%M:%S'))
        )
        conn.commit()
        conn.close()

        site_title = get_setting('site_title', '文件收集器')
        body = f'''<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:30px 0;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
  <tr><td style="background:#4f46e5;padding:24px 32px;text-align:center;">
    <h2 style="color:#fff;margin:0;font-size:18px;">{site_title}</h2>
  </td></tr>
  <tr><td style="padding:32px;">
    <h3 style="margin:0 0 12px;color:#111827;font-size:15px;">密码重置验证码</h3>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 20px;">您正在请求重置密码，请使用以下验证码完成验证：</p>
    <div style="background:#f0f4ff;border-radius:8px;padding:16px 24px;text-align:center;margin-bottom:20px;">
      <span style="font-size:28px;font-weight:700;letter-spacing:6px;color:#4f46e5;font-family:'Courier New',monospace;">{code}</span>
    </div>
    <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:0 0 8px;">验证码 10 分钟内有效，请勿泄露给他人。</p>
    <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:0;">如非本人操作，请忽略此邮件。</p>
  </td></tr>
  <tr><td style="border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">此邮件由 {site_title} 系统自动发送</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>'''
        ok, msg = send_email(email_addr, f'[{site_title}] 密码重置验证码', body)

        if ok:
            flash('验证码已发送到您的邮箱，请查收')
            return redirect(url_for('reset_password', email=email_addr))
        else:
            logger.error(f"发送验证码邮件失败: {msg}")
            flash(f'邮件发送失败：{msg}')
        return render_template('forgot_password.html')

    return render_template('forgot_password.html')


@app.route('/reset-password', methods=['GET', 'POST'])
def reset_password():
    """重置密码 - 验证码验证后设置新密码"""
    if session.get('user_id'):
        return redirect(url_for('admin_dashboard'))

    if request.method == 'POST':
        if not validate_csrf():
            flash('安全验证失败')
            return render_template('reset_password.html')

        email_addr = request.form.get('email', '').strip().lower()
        code = request.form.get('code', '').strip()
        new_password = request.form.get('new_password', '')
        confirm_password = request.form.get('confirm_password', '')

        if not all([email_addr, code, new_password, confirm_password]):
            flash('请填写所有字段')
            return render_template('reset_password.html', email=email_addr)

        # 验证验证码
        conn = get_db()
        vcode = conn.execute(
            "SELECT * FROM verification_codes WHERE email = ? AND code = ? "
            "AND purpose = 'reset_password' AND used = 0 AND expires_at > CURRENT_TIMESTAMP "
            "ORDER BY created_at DESC LIMIT 1",
            (email_addr, code)
        ).fetchone()
        if not vcode:
            conn.close()
            flash('验证码无效或已过期')
            return render_template('reset_password.html', email=email_addr)

        # 标记验证码已使用
        conn.execute("UPDATE verification_codes SET used = 1 WHERE id = ?", (vcode['id'],))
        conn.commit()

        # 验证密码
        if len(new_password) < 8:
            conn.close()
            flash('密码长度至少需要8位')
            return render_template('reset_password.html', email=email_addr)

        if not re.search(r'[a-zA-Z]', new_password) or not re.search(r'[0-9]', new_password):
            conn.close()
            flash('密码必须同时包含字母和数字')
            return render_template('reset_password.html', email=email_addr)

        if new_password != confirm_password:
            conn.close()
            flash('两次输入的密码不一致')
            return render_template('reset_password.html', email=email_addr)

        # 更新密码
        password_hash = generate_password_hash(new_password)
        conn.execute("UPDATE users SET password_hash = ? WHERE email = ?", (password_hash, email_addr))
        updated = conn.execute("SELECT changes()").fetchone()[0]
        if updated == 0:
            # 邮箱匹配失败：可能是管理员邮箱刚同步，尝试通过 SMTP 发件人邮箱匹配管理员
            smtp_config = get_smtp_config()
            admin_username = get_setting('admin_username', 'admin')
            if smtp_config['from_email'] and smtp_config['from_email'].lower() == email_addr:
                conn.execute(
                    "UPDATE users SET password_hash = ? WHERE username = ? AND is_admin = 1",
                    (password_hash, admin_username)
                )
                updated = conn.execute("SELECT changes()").fetchone()[0]
                if updated:
                    # 同时同步邮箱
                    conn.execute("UPDATE users SET email = ? WHERE username = ? AND is_admin = 1 AND (email = '' OR email IS NULL)",
                                 (email_addr, admin_username))
        conn.commit()
        conn.close()

        if updated == 0:
            flash('未找到匹配的账户，请确认邮箱地址是否正确')
            return render_template('reset_password.html', email=email_addr)

        flash('密码重置成功，请使用新密码登录')
        return redirect(url_for('admin_login'))

    email_addr = request.args.get('email', '')
    return render_template('reset_password.html', email=email_addr)




@app.route('/admin/user-settings', methods=['GET', 'POST'])
@login_required
def user_settings():
    """普通用户个人设置（继承管理员全局默认值，覆盖保存到 user_settings 表）"""
    user_id = session.get('user_id')
    is_admin = session.get('is_admin', False)
    
    # 管理员去看完整系统设置
    if is_admin:
        return redirect(url_for('admin_settings'))
    
    if request.method == 'POST':
        if not validate_csrf():
            flash('安全验证失败')
            return redirect(url_for('user_settings'))
        
        action = request.form.get('action', '')
        
        if action == 'defaults':
            max_files = request.form.get('default_max_files', str(DEFAULT_MAX_FILES))
            max_size = request.form.get('default_max_size', str(DEFAULT_MAX_FILE_SIZE_GB))
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
                return redirect(url_for('user_settings'))
            set_user_setting(user_id, 'max_files', str(max_files))
            set_user_setting(user_id, 'max_file_size_gb', str(max_size))
            flash('个人默认设置已保存')
        
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
                return redirect(url_for('user_settings'))
            set_user_setting(user_id, 'passcode_ttl_minutes', str(val))
            flash('通行证有效期已保存')
        
        elif action == 'default_link_expiry':
            raw = request.form.get('default_link_expire_days', '30')
            try:
                _v = float(raw)
                if _v != int(_v):
                    raise ValueError('链接有效期天数必须为整数')
                days = int(_v)
                if days < 1 or days > 3650:
                    raise ValueError('链接有效期天数必须在 1-3650 天之间')
            except ValueError as e:
                flash(str(e) if '必须' in str(e) else '链接有效期格式错误')
                return redirect(url_for('user_settings'))
            set_user_setting(user_id, 'default_link_expire_days', str(days))
            flash('个人默认链接有效期已保存')

        elif action == 'links_per_page':
            raw = request.form.get('links_per_page_val', '10')
            try:
                _v = float(raw)
                if _v != int(_v):
                    raise ValueError('每页显示数量必须为整数')
                val = int(_v)
                if val < 5 or val > 100:
                    raise ValueError('每页显示数量必须在 5-100 之间')
            except ValueError as e:
                flash(str(e) if '必须' in str(e) else '每页数量格式错误')
                return redirect(url_for('user_settings'))
            set_user_setting(user_id, 'links_per_page', str(val))
            flash('收集链接显示数量已保存')

        elif action == 'records_per_page':
            raw = request.form.get('records_per_page_val', '10')
            try:
                _v = float(raw)
                if _v != int(_v):
                    raise ValueError('每页显示数量必须为整数')
                val = int(_v)
                if val < 5 or val > 200:
                    raise ValueError('每页显示数量必须在 5-200 之间')
            except ValueError as e:
                flash(str(e) if '必须' in str(e) else '每页数量格式错误')
                return redirect(url_for('user_settings'))
            set_user_setting(user_id, 'records_per_page', str(val))
            flash('上传记录单页数量已保存（仅对自己生效）')
        
        elif action == 'account':
            new_username = request.form.get('new_username', '').strip()
            new_nickname = request.form.get('new_nickname', '').strip()
            new_email = request.form.get('new_email', '').strip().lower()
            old_pass = request.form.get('old_password', '')
            new_pass = request.form.get('new_password', '')
            confirm_pass = request.form.get('confirm_password', '')
            user = get_user_by_id(user_id)
            if not user or not check_password_hash(user['password_hash'], old_pass):
                flash('原密码错误')
            elif not new_username:
                flash('用户名不能为空')
            else:
                conn = get_db()
                # 检查用户名冲突
                conflict = conn.execute("SELECT id FROM users WHERE username = ? AND id != ?",
                                       (new_username, user_id)).fetchone()
                if conflict:
                    flash('该用户名已被使用')
                    conn.close()
                    return redirect(url_for('user_settings'))
                
                # 邮箱校验和冲突检查
                if new_email:
                    if '@' not in new_email:
                        flash('请输入有效的邮箱地址')
                        conn.close()
                        return redirect(url_for('user_settings'))
                    conflict = conn.execute("SELECT id FROM users WHERE email = ? AND id != ?",
                                           (new_email, user_id)).fetchone()
                    if conflict:
                        flash('该邮箱已被其他用户使用')
                        conn.close()
                        return redirect(url_for('user_settings'))
                
                # 构建动态 UPDATE
                updates_sql = "UPDATE users SET username = ?"
                updates_params = [new_username]
                if new_nickname:
                    updates_sql += ", nickname = ?"
                    updates_params.append(new_nickname)
                if new_email:
                    updates_sql += ", email = ?"
                    updates_params.append(new_email)
                if new_pass:
                    if len(new_pass) < 8:
                        flash('新密码至少8位，且需包含字母和数字')
                        conn.close()
                        return redirect(url_for('user_settings'))
                    if not re.search(r'[a-zA-Z]', new_pass) or not re.search(r'[0-9]', new_pass):
                        flash('新密码必须同时包含字母和数字')
                        conn.close()
                        return redirect(url_for('user_settings'))
                    if new_pass != confirm_pass:
                        flash('两次密码不一致')
                        conn.close()
                        return redirect(url_for('user_settings'))
                    updates_sql += ", password_hash = ?"
                    updates_params.append(generate_password_hash(new_pass))
                
                updates_sql += " WHERE id = ?"
                updates_params.append(user_id)
                conn.execute(updates_sql, updates_params)
                conn.commit()
                conn.close()
                
                if new_pass:
                    flash('密码修改成功，请重新登录')
                    session.clear()
                    return redirect(url_for('admin_login'))
                flash('账号信息已更新')
        
        return redirect(url_for('user_settings'))
    
    # GET: 构建 defaults dict（用户设置优先，回退到全局设置）
    defaults = {
        'max_files': get_user_setting(user_id, 'max_files', str(DEFAULT_MAX_FILES)),
        'max_file_size_gb': get_user_setting(user_id, 'max_file_size_gb', str(DEFAULT_MAX_FILE_SIZE_GB)),
        'passcode_ttl_minutes': get_user_setting(user_id, 'passcode_ttl_minutes', '120'),
        'default_link_expire_days': get_user_setting(user_id, 'default_link_expire_days', '30'),
        'links_per_page': get_user_setting(user_id, 'links_per_page', '10'),
        'records_per_page': get_user_setting(user_id, 'records_per_page', '10'),
        'public_url': get_user_setting(user_id, 'public_url', get_setting('public_url', '')),
    }
    user = get_user_by_id(user_id)
    return render_template('admin_user_settings.html', defaults=defaults, user=user)


@app.route('/admin/logout')
def admin_logout():
    """退出登录"""
    session.clear()
    return redirect(url_for('admin_login'))

@app.route('/admin')
@login_required
def admin_dashboard():
    """管理后台首页"""
    user_id = session.get('user_id')
    is_admin = session.get('is_admin', False)
    conn = get_db()
    
    if is_admin:
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
            """SELECT r.*, l.title as link_title, l.require_uploader, u.username, u.nickname
               FROM upload_records r
               LEFT JOIN links l ON r.link_id = l.id
               LEFT JOIN users u ON l.user_id = u.id
               ORDER BY r.uploaded_at DESC LIMIT 5"""
        ).fetchall()
    else:
        total_links = conn.execute(
            "SELECT COUNT(*) FROM links WHERE user_id = ?", (user_id,)
        ).fetchone()[0]
        active_links = conn.execute(
            "SELECT COUNT(*) FROM links WHERE user_id = ? AND status = 'active'", (user_id,)
        ).fetchone()[0]
        # 普通用户只统计自己链接下的上传记录
        total_uploads = conn.execute(
            """SELECT COUNT(*) FROM upload_records r
               INNER JOIN links l ON r.link_id = l.id
               WHERE l.user_id = ?""", (user_id,)
        ).fetchone()[0]
        today = datetime.now().strftime('%Y-%m-%d')
        today_uploads = conn.execute(
            """SELECT COUNT(*) FROM upload_records r
               INNER JOIN links l ON r.link_id = l.id
               WHERE l.user_id = ? AND date(r.uploaded_at) = ?""", (user_id, today)
        ).fetchone()[0]
        recent = conn.execute(
            """SELECT r.*, l.title as link_title, l.require_uploader, u.username, u.nickname
               FROM upload_records r
               INNER JOIN links l ON r.link_id = l.id
               LEFT JOIN users u ON l.user_id = u.id
               WHERE l.user_id = ?
               ORDER BY r.uploaded_at DESC LIMIT 5""", (user_id,)
        ).fetchall()
    
    conn.close()

    # 构建 creator_name（优先昵称）
    recent_list = []
    for r in recent:
        r = dict(r)
        r['creator_name'] = r.get('nickname') or r.get('username') or '未知用户'
        recent_list.append(r)

    return render_template('admin_dashboard.html',
        total_links=total_links,
        active_links_count=active_links,
        total_uploads=total_uploads,
        today_uploads=today_uploads,
        recent_uploads=recent_list)

@app.route('/admin/links')
@login_required
def admin_links():
    """收集链接管理（支持分页）"""
    user_id = session.get('user_id')
    is_admin = session.get('is_admin', False)
    
    # 获取每页显示数量
    per_page = int(get_user_setting(user_id, 'links_per_page', '10'))
    try:
        page = int(request.args.get('page', '1'))
        if page < 1:
            page = 1
    except ValueError:
        page = 1
    
    conn = get_db()
    # 明确指定需要的列（避免拉取不需要的列，但 description 在 data-* 属性中需要）
    _link_cols = ("l.id, l.user_id, l.title, l.description, l.passcode, l.passcode_plain, l.passcode_empty, "
                  "l.max_files, l.max_file_size_gb, l.expires_at, l.created_at, l.updated_at, "
                  "l.status, l.allow_delete, l.share_enabled, l.share_passcode, l.share_passcode_plain, l.share_passcode_empty, "
                  "l.require_uploader, "
                  "u.username, u.nickname")
    if is_admin:
        total = conn.execute("SELECT COUNT(*) FROM links").fetchone()[0]
        total_pages = max(1, (total + per_page - 1) // per_page)
        page = min(page, total_pages)
        offset = (page - 1) * per_page
        links = conn.execute(
            f"SELECT {_link_cols} FROM links l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT ? OFFSET ?",
            (per_page, offset)
        ).fetchall()
    else:
        total = conn.execute(
            "SELECT COUNT(*) FROM links WHERE user_id = ?", (user_id,)
        ).fetchone()[0]
        total_pages = max(1, (total + per_page - 1) // per_page)
        page = min(page, total_pages)
        offset = (page - 1) * per_page
        links = conn.execute(
            f"SELECT {_link_cols} FROM links l LEFT JOIN users u ON l.user_id = u.id WHERE l.user_id = ? ORDER BY l.created_at DESC LIMIT ? OFFSET ?",
            (user_id, per_page, offset)
        ).fetchall()
    conn.close()

    # 为每个链接标记通行证状态（使用 passcode_empty 字段，避免 bcrypt 哈希）
    processed_links = []
    for link in links:
        d = dict(link)
        pp = d['passcode_plain']
        is_empty = d.get('passcode_empty', 0) == 1
        # _has_passcode: 是否有明文通行证（非空字符串）
        d['_has_passcode'] = bool(pp and pp.strip())
        # _is_legacy: 旧版加密存储（passcode 不是空哈希，但没有明文）
        # passcode_empty=0 且无明文 = 旧版（未迁移的旧数据）
        d['_is_legacy'] = not d['_has_passcode'] and not is_empty
        # 分享页通行证状态
        sp = d.get('share_passcode_plain', '')
        sp_empty = d.get('share_passcode_empty', 0) == 1
        sp_hash = d.get('share_passcode', '')
        d['_has_share_passcode'] = bool(sp and sp.strip())
        # _is_share_legacy: 旧版加密存储（share_passcode 有哈希，但无明文，且不是空通行证）
        # 注意：share_passcode 本身就是空字符串时，表示从未设置，不算 legacy
        d['_is_share_legacy'] = not d['_has_share_passcode'] and not sp_empty and bool(sp_hash)
        # 创建者名称（优先昵称）
        d['creator_name'] = d.get('nickname') or d.get('username') or '未知用户'
        processed_links.append(d)

    return render_template('admin_links.html', links=processed_links,
                           public_url=get_user_setting(user_id, 'public_url', get_setting('public_url', '')),
                           page=page, total_pages=total_pages, total=total)

@app.route('/admin/links/new')
@login_required
def admin_link_new():
    """新建链接页面"""
    user_id = session.get('user_id')
    return render_template('admin_link_form.html',
                           edit_link=None,
                           defaults={'max_files': get_user_setting(user_id, 'max_files', str(DEFAULT_MAX_FILES)),
                                     'max_file_size_gb': get_user_setting(user_id, 'max_file_size_gb', str(DEFAULT_MAX_FILE_SIZE_GB)),
                                     'expire_days': get_user_setting(user_id, 'default_link_expire_days', '30')})

@app.route('/admin/links/<link_id>/form')
@login_required
def admin_link_form(link_id):
    """编辑链接页面"""
    if not _check_link_ownership(link_id):
        flash('无权编辑该链接')
        return redirect(url_for('admin_links'))

    conn = get_db()
    link = conn.execute("SELECT * FROM links WHERE id = ?", (link_id,)).fetchone()
    conn.close()

    if not link:
        flash('链接不存在')
        return redirect(url_for('admin_links'))

    link_dict = dict(link)
    # 计算分享页有效期天数（用于编辑表单回显）
    if link_dict.get('share_expires_at'):
        try:
            et = datetime.strptime(link_dict['share_expires_at'], '%Y-%m-%dT%H:%M')
            link_dict['_share_expire_days'] = max(1, (et - datetime.now()).days + 1)
        except (ValueError, TypeError):
            link_dict['_share_expire_days'] = ''

    user_id = session.get('user_id')
    return render_template('admin_link_form.html',
                           edit_link=link_dict,
                           defaults={'max_files': get_user_setting(user_id, 'max_files', str(DEFAULT_MAX_FILES)),
                                     'max_file_size_gb': get_user_setting(user_id, 'max_file_size_gb', str(DEFAULT_MAX_FILE_SIZE_GB)),
                                     'expire_days': get_user_setting(user_id, 'default_link_expire_days', '30')})

@app.route('/admin/links/create', methods=['POST'])
@login_required
def create_link():
    """创建新的收集链接"""
    if not validate_csrf():
        flash('安全验证失败，请刷新页面重试')
        return redirect(url_for('admin_links'))

    title = request.form.get('title', '').strip()
    try:
        description = sanitize_html(request.form.get('description', ''))
    except Exception as e:
        logger.error(f"create_link sanitize_html 失败: {e}\n{traceback.format_exc()}")
        description = request.form.get('description', '')  # 降级：保留原始内容
    passcode = request.form.get('passcode', '').strip()
    empty_passcode = request.form.get('empty_passcode') == 'on'  # 空通行证复选框
    max_files = request.form.get('max_files', DEFAULT_MAX_FILES)
    max_file_size_gb = request.form.get('max_file_size_gb', str(DEFAULT_MAX_FILE_SIZE_GB))

    if not title:
        flash('标题不能为空')
        return redirect(url_for('admin_links'))

    # 如果勾选了空通行证，强制清空 passcode
    if empty_passcode:
        passcode = ''

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
    _max_expire_days = int(get_user_setting(session.get('user_id'), 'default_link_expire_days', '30'))
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
    
    # 获取当前用户ID（用于文件夹命名）
    user_id = session.get('user_id')
    
    # 根据收集名称生成文件夹名
    folder_name = re.sub(r'[<>:"/\\|?*]', '_', title.strip())
    folder_name = folder_name.strip().lstrip('.')
    if not folder_name:
        folder_name = link_id
    # 检查是否与已有文件夹重名，重名则加后缀
    user_folder = get_user_folder(user_id)
    if user_folder:
        base_name = folder_name
        counter = 1
        while os.path.exists(os.path.join(user_folder, folder_name)):
            counter += 1
            folder_name = f"{base_name}_{counter}"
    
    allow_delete = 1 if request.form.get('allow_delete') == '1' else 0
    if passcode:
        passcode_hash = generate_password_hash(passcode)
        passcode_plain = passcode
    else:
        # 空通行证：使用空字符串的哈希，passcode_plain 为空
        passcode_hash = generate_password_hash('')
        passcode_plain = ''

    # 分享页设置
    share_enabled = 1 if request.form.get('share_enabled') == '1' else 0
    share_passcode_raw = request.form.get('share_passcode', '').strip()
    share_passcode_empty = 1 if request.form.get('share_passcode_empty') == '1' else 0
    if share_passcode_raw and not share_passcode_empty:
        share_passcode_hash = generate_password_hash(share_passcode_raw)
        share_passcode_plain = share_passcode_raw
    else:
        share_passcode_hash = ''
        share_passcode_plain = ''

    # 分享页独立描述
    try:
        share_description = sanitize_html(request.form.get('share_description', ''))
    except Exception:
        share_description = request.form.get('share_description', '')
    # 分享页独立有效期（天数）
    share_expire_days = request.form.get('share_expire_days', '').strip()
    share_expires_at = None
    if share_expire_days:
        try:
            sd = int(share_expire_days)
            if sd > 0 and sd <= _max_expire_days:
                share_expires_at = (datetime.now() + timedelta(days=sd)).strftime('%Y-%m-%dT%H:%M')
        except ValueError:
            pass
    # 分享页独立截止日期（优先级高于天数）
    share_expires_at_raw = request.form.get('share_expires_at', '').strip()
    if share_expires_at_raw:
        try:
            parsed = datetime.strptime(share_expires_at_raw, '%Y-%m-%dT%H:%M')
            if parsed > datetime.now() and parsed <= datetime.now() + timedelta(days=_max_expire_days):
                share_expires_at = share_expires_at_raw
        except ValueError:
            pass
    # 收集页开关
    collect_enabled = 0 if request.form.get('collect_disabled') == '1' else 1
    require_uploader = 1 if request.form.get('require_uploader') == '1' else 0

    try:
        conn = get_db()
        passcode_empty = 1 if (not passcode or not passcode.strip()) else 0
        conn.execute(
            """INSERT INTO links (id, user_id, title, description, passcode, passcode_plain,
               max_file_size_gb, max_files, expires_at, allow_delete, passcode_empty,
               share_enabled, share_passcode, share_passcode_plain, share_passcode_empty,
               share_description, share_expires_at, collect_enabled, require_uploader, folder_name)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (link_id, user_id, title, description, passcode_hash, passcode_plain, max_file_size_gb, max_files, expires_at or None, allow_delete, passcode_empty,
             share_enabled, share_passcode_hash, share_passcode_plain, share_passcode_empty,
             share_description, share_expires_at, collect_enabled, require_uploader, folder_name)
        )
        conn.commit()
        conn.close()

        # 创建用户文件夹（如果不存在）
        user_folder = get_user_folder(user_id)
        if user_folder and not os.path.exists(user_folder):
            os.makedirs(user_folder, exist_ok=True)

        # 创建链接专属文件夹（UPLOAD_BASE/<username>/<folder_name>/）
        try:
            create_upload_dir(link_id)
        except Exception as e:
            logger.warning(f"创建链接文件夹失败（不影响链接创建）: {e}")

        flash(f'收集链接已创建: /collect/{link_id}')
    except Exception as e:
        logger.error(f"创建链接失败: {e}\n{traceback.format_exc()}")
        flash(f'创建失败：{e}')
    return redirect(url_for('admin_links'))

@app.route('/admin/links/<link_id>/edit', methods=['POST'])
@login_required
def edit_link(link_id):
    """编辑收集链接"""
    if not validate_csrf():
        flash('安全验证失败，请刷新页面重试')
        return redirect(url_for('admin_links'))

    if not _check_link_ownership(link_id):
        flash('无权编辑该链接')
        return redirect(url_for('admin_links'))

    try:
        title = request.form.get('title', '').strip()
        try:
            description = sanitize_html(request.form.get('description', ''))
        except Exception as e:
            logger.error(f"edit_link sanitize_html 失败: {e}\n{traceback.format_exc()}")
            description = request.form.get('description', '')  # 降级：保留原始内容
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
        _max_expire_days = int(get_user_setting(session.get('user_id'), 'default_link_expire_days', '30'))
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
            # 验证日期格式和合法性
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

        # 分享页设置
        share_enabled = 1 if request.form.get('share_enabled') == '1' else 0
        share_passcode_raw = request.form.get('share_passcode', '').strip()
        share_passcode_empty = 1 if request.form.get('share_passcode_empty') == '1' else 0
        # 分享页通行证是否被用户明确改动（填了新密码 或 勾了空通行证）
        share_changed = bool(share_passcode_raw) or bool(share_passcode_empty)
        if share_passcode_empty:
            share_passcode_hash = ''
            share_passcode_plain = ''
        elif share_passcode_raw:
            share_passcode_hash = generate_password_hash(share_passcode_raw)
            share_passcode_plain = share_passcode_raw
        else:
            share_passcode_hash = ''  # 不会被使用（share_changed=False）
            share_passcode_plain = ''

        # 分享页独立描述
        try:
            share_description = sanitize_html(request.form.get('share_description', ''))
        except Exception:
            share_description = request.form.get('share_description', '')
        # 分享页独立有效期
        share_expires_at_raw = request.form.get('share_expires_at', '').strip()
        share_expires_at = None
        if share_expires_at_raw:
            try:
                parsed = datetime.strptime(share_expires_at_raw, '%Y-%m-%dT%H:%M')
                if parsed > datetime.now() and parsed <= datetime.now() + timedelta(days=_max_expire_days):
                    share_expires_at = share_expires_at_raw
            except ValueError:
                pass
        else:
            share_expire_days = request.form.get('share_expire_days', '').strip()
            if share_expire_days:
                try:
                    sd = int(share_expire_days)
                    if 0 < sd <= _max_expire_days:
                        share_expires_at = (datetime.now() + timedelta(days=sd)).strftime('%Y-%m-%dT%H:%M')
                    elif sd == 0:
                        share_expires_at = None  # 清除
                except ValueError:
                    pass
        # 收集页开关
        collect_enabled = 0 if request.form.get('collect_disabled') == '1' else 1
        require_uploader = 1 if request.form.get('require_uploader') == '1' else 0

        # 处理通行证更新逻辑（新的复选框方案）
        if empty_passcode:
            # 用户勾选了空通行证：清空通行证（允许任何人访问）
            passcode_hash = generate_password_hash('')
            passcode_plain = ''
            if share_changed:
                conn.execute(
                    """UPDATE links SET title=?, description=?, passcode=?, passcode_plain=?,
                       max_file_size_gb=?, max_files=?, expires_at=?, allow_delete=?, passcode_empty=1,
                       share_enabled=?, share_passcode=?, share_passcode_plain=?, share_passcode_empty=?,
                       share_description=?, share_expires_at=?, collect_enabled=?, require_uploader=?, updated_at=CURRENT_TIMESTAMP
                       WHERE id=?""",
                    (title, description, passcode_hash, passcode_plain, max_file_size_gb, max_files, expires_at or None, allow_delete,
                     share_enabled, share_passcode_hash, share_passcode_plain, share_passcode_empty,
                     share_description, share_expires_at, collect_enabled, require_uploader, link_id)
                )
            else:
                conn.execute(
                    """UPDATE links SET title=?, description=?, passcode=?, passcode_plain=?,
                       max_file_size_gb=?, max_files=?, expires_at=?, allow_delete=?, passcode_empty=1,
                       share_enabled=?, share_description=?, share_expires_at=?, collect_enabled=?, require_uploader=?, updated_at=CURRENT_TIMESTAMP
                       WHERE id=?""",
                    (title, description, passcode_hash, passcode_plain, max_file_size_gb, max_files, expires_at or None, allow_delete,
                     share_enabled, share_description, share_expires_at, collect_enabled, require_uploader, link_id)
                )
        elif passcode:
            # 用户输入了新通行证：设置新通行证
            passcode_hash = generate_password_hash(passcode)
            passcode_plain = passcode
            if share_changed:
                conn.execute(
                    """UPDATE links SET title=?, description=?, passcode=?, passcode_plain=?,
                       max_file_size_gb=?, max_files=?, expires_at=?, allow_delete=?, passcode_empty=0,
                       share_enabled=?, share_passcode=?, share_passcode_plain=?, share_passcode_empty=?,
                       share_description=?, share_expires_at=?, collect_enabled=?, require_uploader=?, updated_at=CURRENT_TIMESTAMP
                       WHERE id=?""",
                    (title, description, passcode_hash, passcode_plain, max_file_size_gb, max_files, expires_at or None, allow_delete,
                     share_enabled, share_passcode_hash, share_passcode_plain, share_passcode_empty,
                     share_description, share_expires_at, collect_enabled, require_uploader, link_id)
                )
            else:
                conn.execute(
                    """UPDATE links SET title=?, description=?, passcode=?, passcode_plain=?,
                       max_file_size_gb=?, max_files=?, expires_at=?, allow_delete=?, passcode_empty=0,
                       share_enabled=?, share_description=?, share_expires_at=?, collect_enabled=?, require_uploader=?, updated_at=CURRENT_TIMESTAMP
                       WHERE id=?""",
                    (title, description, passcode_hash, passcode_plain, max_file_size_gb, max_files, expires_at or None, allow_delete,
                     share_enabled, share_description, share_expires_at, collect_enabled, require_uploader, link_id)
                )
        else:
            # 保持原有通行证不变 - 只更新其他字段
            if share_changed:
                conn.execute(
                    """UPDATE links SET title=?, description=?,
                       max_file_size_gb=?, max_files=?, expires_at=?, allow_delete=?,
                       share_enabled=?, share_passcode=?, share_passcode_plain=?, share_passcode_empty=?,
                       share_description=?, share_expires_at=?, collect_enabled=?, require_uploader=?, updated_at=CURRENT_TIMESTAMP
                       WHERE id=?""",
                    (title, description, max_file_size_gb, max_files, expires_at or None, allow_delete,
                     share_enabled, share_passcode_hash, share_passcode_plain, share_passcode_empty,
                     share_description, share_expires_at, collect_enabled, require_uploader, link_id)
                )
            else:
                conn.execute(
                    """UPDATE links SET title=?, description=?,
                       max_file_size_gb=?, max_files=?, expires_at=?, allow_delete=?,
                       share_enabled=?, share_description=?, share_expires_at=?, collect_enabled=?, require_uploader=?, updated_at=CURRENT_TIMESTAMP
                       WHERE id=?""",
                    (title, description, max_file_size_gb, max_files, expires_at or None, allow_delete,
                     share_enabled, share_description, share_expires_at, collect_enabled, require_uploader, link_id)
                )

        conn.commit()
        conn.close()

        flash('链接已更新')
        return redirect(url_for('admin_links'))

    except Exception as e:
        logger.error(f"编辑链接 {link_id} 失败: {e}\n{traceback.format_exc()}")
        flash(f'编辑失败：{e}')
        return redirect(url_for('admin_links'))

@app.route('/admin/links/<link_id>/toggle', methods=['POST'])
@login_required
def toggle_link(link_id):
    """启用/禁用链接"""
    if not _check_link_ownership(link_id):
        flash('无权操作该链接')
        return redirect(url_for('admin_links'))
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
@login_required
def delete_link(link_id):
    """删除链接及关联的所有上传文件和记录"""
    if not _check_link_ownership(link_id):
        flash('无权删除该链接')
        return redirect(url_for('admin_links'))
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

    # 3. 删除上传记录、日志和链接
    conn.execute("PRAGMA foreign_keys = OFF")
    conn.execute("DELETE FROM upload_records WHERE link_id = ?", (link_id,))
    conn.execute("DELETE FROM upload_logs WHERE link_id = ?", (link_id,))
    conn.execute("DELETE FROM download_logs WHERE link_id = ?", (link_id,))
    conn.execute("DELETE FROM links WHERE id = ?", (link_id,))
    conn.execute("PRAGMA foreign_keys = ON")
    conn.commit()
    conn.close()

    flash(f'链接已删除，同时清理了 {deleted_count} 个文件及 {len(records)} 条上传记录')
    return redirect(url_for('admin_links'))

@app.route('/admin/records')
@login_required
def admin_records():
    """上传记录管理（高性能版：后台线程负责扫描和清理，此处仅查询）"""
    page = request.args.get('page', 1, type=int)
    if page < 1:
        page = 1
    user_id = session.get('user_id')
    is_admin = session.get('is_admin', False)
    per_page = int(get_user_setting(user_id, 'records_per_page', '10'))
    link_filter = request.args.get('link_id', '').strip()

    # 验证权限（非管理员只能看自己的链接）
    if link_filter and not is_admin:
        cv = get_db()
        owner = cv.execute("SELECT user_id FROM links WHERE id = ?", (link_filter,)).fetchone()
        cv.close()
        if not owner or owner['user_id'] != user_id:
            flash('无权访问该链接')
            return redirect(url_for('admin_records'))

    conn = get_db()

    # 构建高效的 COUNT 和数据查询
    # 管理员无过滤时无需 JOIN（upload_records 已有 link_id）
    # 使用特定字段而非 SELECT r.* 减少数据传输
    _rec_cols = ("r.id, r.original_name, r.file_size_display, r.download_count, "
                 "r.uploader_ip, r.uploaded_at, r.link_id, r.stored_path, r.stored_name, r.uploader_name")

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
            where = ("WHERE r.link_id IN (SELECT id FROM links l2 WHERE l2.user_id = ?)")
            count_params = (user_id,)
            data_params = (user_id, per_page, (page - 1) * per_page)

    # COUNT 查询（轻量，不用 JOIN）
    count_sql = f"SELECT COUNT(*) FROM upload_records r {where}"
    count = conn.execute(count_sql, count_params).fetchone()[0]

    total_pages = max(1, (count + per_page - 1) // per_page)
    page = min(page, total_pages)

    # 数据查询：用子查询取 link_title、require_uploader 和 nickname（优先昵称）
    data_sql = f"""SELECT {_rec_cols},
                   (SELECT l.title FROM links l WHERE l.id = r.link_id) as link_title,
                   (SELECT l.require_uploader FROM links l WHERE l.id = r.link_id) as require_uploader,
                   COALESCE((SELECT u.nickname FROM links l JOIN users u ON l.user_id = u.id WHERE l.id = r.link_id),
                            (SELECT u.username FROM links l JOIN users u ON l.user_id = u.id WHERE l.id = r.link_id)) as creator_name
                   FROM upload_records r {where}
                   ORDER BY r.uploaded_at DESC
                   LIMIT ? OFFSET ?"""
    records = conn.execute(data_sql, data_params).fetchall()

    # 链接列表（用于筛选下拉）
    if is_admin:
        links = conn.execute("SELECT id, title FROM links ORDER BY created_at DESC").fetchall()
    else:
        links = conn.execute(
            "SELECT id, title FROM links WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
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
@login_required
def admin_download_record(record_id):
    """下载上传记录中的文件"""
    if not _check_record_ownership(record_id):
        return '无权访问', 403
    
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

    _log_download(record_id, 'admin')
    return _safe_download(record['stored_path'], record['original_name'])

@app.route('/admin/records/<int:record_id>/download-logs')
@login_required
def admin_download_logs(record_id):
    """查看文件下载日志"""
    if not _check_record_ownership(record_id):
        return '无权访问', 403

    conn = get_db()
    record = conn.execute(
        "SELECT original_name FROM upload_records WHERE id = ?", (record_id,)
    ).fetchone()
    if not record:
        conn.close()
        return '文件不存在', 404

    logs = conn.execute(
        """SELECT * FROM download_logs
           WHERE record_id = ?
           ORDER BY downloaded_at DESC
           LIMIT 500""",
        (record_id,)
    ).fetchall()
    conn.close()

    return render_template('admin_download_logs.html',
                           record=record,
                           record_id=record_id,
                           logs=logs,
                           now=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

@app.route('/admin/records/<int:record_id>/upload-logs')
@login_required
def admin_upload_logs(record_id):
    """查看文件上传日志"""
    if not _check_record_ownership(record_id):
        return '无权访问', 403

    conn = get_db()
    record = conn.execute(
        """SELECT r.original_name, l.require_uploader
           FROM upload_records r
           LEFT JOIN links l ON r.link_id = l.id
           WHERE r.id = ?""", (record_id,)
    ).fetchone()
    if not record:
        conn.close()
        return '文件不存在', 404

    logs = conn.execute(
        """SELECT * FROM upload_logs
           WHERE record_id = ?
           ORDER BY event_time DESC
           LIMIT 500""",
        (record_id,)
    ).fetchall()
    conn.close()

    return render_template('admin_upload_logs.html',
                           record=record,
                           record_id=record_id,
                           logs=logs,
                           require_uploader=bool(record['require_uploader']) if record['require_uploader'] else False,
                           now=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

@app.route('/admin/links/<link_id>/upload-logs')
@login_required
def admin_link_upload_logs(link_id):
    """查看收集链接的上传日志"""
    if not _check_link_ownership(link_id):
        return '无权访问', 403

    conn = get_db()
    link = conn.execute("SELECT title, require_uploader FROM links WHERE id = ?", (link_id,)).fetchone()
    if not link:
        conn.close()
        return '链接不存在', 404

    logs = conn.execute(
        """SELECT * FROM upload_logs
           WHERE link_id = ?
           ORDER BY event_time DESC
           LIMIT 500""",
        (link_id,)
    ).fetchall()
    conn.close()

    return render_template('admin_upload_logs.html',
                           record={'original_name': link['title']},
                           link_title=link['title'],
                           require_uploader=bool(link['require_uploader']) if link['require_uploader'] else False,
                           back_url=url_for('admin_links'),
                           logs=logs,
                           now=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

@app.route('/admin/records/<int:record_id>/preview_file')
@login_required
def admin_preview_file(record_id):
    """预览文件（用于JIT Viewer SDK获取文件内容）"""
    if not _check_record_ownership(record_id):
        abort(403)
    
    conn = get_db()
    record = conn.execute(
        "SELECT stored_path, original_name FROM upload_records WHERE id = ?",
        (record_id,)
    ).fetchone()

    if not record:
        conn.close()
        return '文件不存在', 404

    conn.close()

    upload_base = get_upload_base()
    real_path = os.path.realpath(record['stored_path'])
    real_base = os.path.realpath(upload_base)
    
    # 安全检查
    if not real_path.startswith(real_base + os.sep) and real_path != real_base:
        logger.warning(f"路径遍历攻击拦截: stored_path={record['stored_path']}, upload_base={real_base}")
        abort(403)
    
    if not os.path.isfile(real_path):
        abort(404)

    directory = os.path.dirname(real_path)
    filename = os.path.basename(real_path)
    
    # 不使用 as_attachment，允许SDK读取文件内容
    response = send_from_directory(
        directory, filename,
        download_name=record['original_name'],
        as_attachment=False
    )
    
    # 添加CORS响应头，允许JIT Viewer SDK跨域访问
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    
    return response

@app.route('/admin/records/<int:record_id>/view')
@login_required
def admin_jit_view(record_id):
    """新窗口纯净预览 - JIT Viewer（管理后台）"""
    if not _check_record_ownership(record_id):
        abort(403)

    conn = get_db()
    record = conn.execute(
        "SELECT stored_path, original_name FROM upload_records WHERE id = ?",
        (record_id,)
    ).fetchone()
    if not record:
        conn.close()
        return '文件不存在', 404
    conn.close()

    upload_base = get_upload_base()
    real_path = os.path.realpath(record['stored_path'])
    real_base = os.path.realpath(upload_base)
    if not real_path.startswith(real_base + os.sep) and real_path != real_base:
        abort(403)
    if not os.path.isfile(real_path):
        abort(404)

    file_url = request.host_url.rstrip('/') + '/admin/records/' + str(record_id) + '/preview_file'
    download_url = '/admin/records/' + str(record_id) + '/download'
    return render_template('jit_preview.html',
        filename=record['original_name'],
        file_url=file_url,
        download_url=download_url)

@app.route('/admin/records/<int:record_id>/delete', methods=['POST'])
@login_required
def delete_record(record_id):
    """删除单条上传记录（同时删除文件）"""
    if not _check_record_ownership(record_id):
        flash('无权删除该记录')
        return redirect(url_for('admin_records'))
    
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

@app.route('/admin/preview_record/<int:record_id>')
@login_required
def admin_preview_record(record_id):
    """预览上传的文件"""
    if not _check_record_ownership(record_id):
        return '<p class="error">无权访问该文件</p>'
    
    conn = get_db()
    record = conn.execute(
        "SELECT * FROM upload_records WHERE id = ?", (record_id,)
    ).fetchone()
    conn.close()

    if not record:
        return '<p class="error">文件不存在</p>'

    stored_path = record['stored_path']
    original_name = record['original_name']
    
    # 路径遍历安全校验
    upload_base = get_upload_base()
    real_path = os.path.realpath(stored_path)
    real_base = os.path.realpath(upload_base)
    if not real_path.startswith(real_base + os.sep) and real_path != real_base:
        logger.warning(f"路径遍历攻击拦截: stored_path={stored_path}, upload_base={real_base}")
        return '<p class="error">无权访问该文件</p>'
    
    # 获取文件扩展名
    _, ext = os.path.splitext(original_name.lower())
    
    # 图片类型
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
    # 视频类型
    video_extensions = ['.mp4', '.webm', '.ogg', '.mov']
    # 文本类型
    text_extensions = ['.txt', '.md', '.log', '.json', '.xml', '.csv']
    
    import html as _html
    safe_original_name = _html.escape(original_name, quote=True)
    
    if ext in image_extensions:
        # 图片预览
        return f'<img src="/admin/records/{record_id}/download" alt="{safe_original_name}" style="max-width:100%;max-height:70vh;">'
    elif ext in video_extensions:
        # 视频预览
        return f'<video controls style="max-width:100%;max-height:70vh;"><source src="/admin/records/{record_id}/download" type="video/mp4">您的浏览器不支持视频播放</video>'
    elif ext in text_extensions:
        # 文本文件预览（使用已校验的 real_path，避免 TOCTOU）
        try:
            with open(real_path, 'r', encoding='utf-8') as f:
                content = f.read()
            if ext == '.md':
                # Markdown文件返回内容，前端用marked.js渲染
                return content
            else:
                import html as _html2
                safe_content = _html2.escape(content, quote=False)
                return f'<pre style="white-space:pre-wrap;word-wrap:break-word;">{safe_content}</pre>'
        except Exception as e:
            return f'<p class="error">无法读取文件内容: {_html.escape(str(e))}</p>'
    else:
        # 不支持的类型（Office文件在前端用JavaScript库处理）
        return f'<p class="info">此文件类型需要前端JavaScript库预览<br>文件名: {safe_original_name}</p>'

@app.route('/admin/records/batch-delete', methods=['POST'])
@login_required
def batch_delete_records():
    """批量删除记录"""
    ids = request.form.getlist('ids[]')
    if not ids:
        return jsonify({'success': False, 'message': '未选择记录'})

    is_admin = session.get('is_admin', False)
    user_id = session.get('user_id')
    conn = get_db()
    deleted = 0
    for rid in ids:
        # 非管理员校验所有权
        if not is_admin:
            row = conn.execute(
                """SELECT r.stored_path FROM upload_records r
                   INNER JOIN links l ON r.link_id = l.id
                   WHERE r.id = ? AND l.user_id = ?""",
                (rid, user_id)
            ).fetchone()
        else:
            row = conn.execute(
                "SELECT stored_path FROM upload_records WHERE id = ?", (rid,)
            ).fetchone()
        if row:
            try:
                _safe_delete(row['stored_path'])
            except OSError:
                pass
            conn.execute("DELETE FROM upload_records WHERE id = ?", (rid,))
            deleted += 1
    conn.commit()
    conn.close()

    flash(f'已删除 {deleted} 条记录')
    return redirect(url_for('admin_records'))

@app.route('/admin/settings', methods=['GET', 'POST'])
@admin_required
def admin_settings():
    """系统设置"""
    if request.method == 'POST':
        action = request.form.get('action', '')

        if action == 'account':
            new_username = request.form.get('new_username', '').strip()
            new_nickname = request.form.get('new_nickname', '').strip()
            new_email = request.form.get('new_email', '').strip().lower()
            old_pass = request.form.get('old_password', '')
            new_pass = request.form.get('new_password', '')
            confirm_pass = request.form.get('confirm_password', '')

            admin_hash = get_setting('admin_password_hash', '')
            if not check_password_hash(admin_hash, old_pass):
                flash('原密码错误，无法修改账号信息')
            elif not new_username:
                flash('管理员账号不能为空')
            else:
                old_admin_user = get_setting('admin_username', 'admin')
                set_setting('admin_username', new_username)
                # 同步更新 users 表中的管理员记录
                conn2 = get_db()
                updates_sql = "UPDATE users SET username = ?"
                updates_params = [new_username]
                if new_nickname:
                    updates_sql += ", nickname = ?"
                    updates_params.append(new_nickname)
                if new_email:
                    if '@' not in new_email:
                        flash('请输入有效的邮箱地址')
                        conn2.close()
                        return redirect(url_for('admin_settings'))
                    conflict = conn2.execute("SELECT id FROM users WHERE email = ? AND id != (SELECT id FROM users WHERE username = ? AND is_admin = 1 LIMIT 1)",
                                           (new_email, new_username)).fetchone()
                    if conflict:
                        conn2.close()
                        flash('该邮箱已被其他用户使用')
                        return redirect(url_for('admin_settings'))
                    updates_sql += ", email = ?"
                    updates_params.append(new_email)
                updates_sql += " WHERE username = ? AND is_admin = 1"
                updates_params.append(old_admin_user)
                conn2.execute(updates_sql, updates_params)
                conn2.commit()
                conn2.close()
                if new_pass:
                    if len(new_pass) < 8:
                        flash('新密码至少8位，且需包含字母和数字')
                    elif not re.search(r'[a-zA-Z]', new_pass) or not re.search(r'[0-9]', new_pass):
                        flash('新密码必须同时包含字母和数字')
                    elif new_pass != confirm_pass:
                        flash('两次密码不一致')
                    else:
                        set_setting('admin_password_hash', generate_password_hash(new_pass))
                        # 同步更新 users 表中的管理员密码
                        conn3 = get_db()
                        conn3.execute("UPDATE users SET password_hash = ? WHERE username = ? AND is_admin = 1",
                                      (generate_password_hash(new_pass), new_username))
                        conn3.commit()
                        conn3.close()
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
            flash('设置已保存')

        elif action == 'site_title':
            title = request.form.get('site_title', '').strip()
            if not title:
                flash('站点标题不能为空')
                return redirect(url_for('admin_settings'))
            set_setting('site_title', title)
            flash('站点标题已保存')

        elif action == 'share_page':
            share_title = request.form.get('share_page_title', '').strip()
            share_footer = request.form.get('share_footer_text', '').strip()
            set_setting('share_page_title', share_title)
            set_setting('share_footer_text', share_footer)
            flash('分享页设置已保存')

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

        elif action == 'registration':
            allow_reg = request.form.get('allow_registration', '0')
            expire_days = request.form.get('default_invite_expire_days', '7')
            try:
                _d = float(expire_days)
                if _d != int(_d):
                    raise ValueError('有效期必须为整数')
                days = int(_d)
                if days < 1 or days > 365:
                    raise ValueError('有效期必须在 1-365 天之间')
            except ValueError as e:
                flash(str(e) if '必须' in str(e) else '有效期格式错误')
                return redirect(url_for('admin_settings'))
            set_setting('allow_registration', allow_reg)
            set_setting('default_invite_expire_days', str(days))
            flash('用户注册设置已保存')

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

        elif action == 'default_link_expiry':
            raw = request.form.get('default_link_expire_days', '30')
            try:
                _v = float(raw)
                if _v != int(_v):
                    raise ValueError('链接有效期天数必须为整数')
                days = int(_v)
                if days < 1 or days > 3650:
                    raise ValueError('链接有效期天数必须在 1-3650 天之间')
            except ValueError as e:
                flash(str(e) if '必须' in str(e) else '链接有效期格式错误')
                return redirect(url_for('admin_settings'))
            set_setting('default_link_expire_days', str(days))
            flash('默认链接有效期已保存')

        elif action == 'links_per_page':
            raw = request.form.get('links_per_page_val', '10')
            try:
                _v = float(raw)
                if _v != int(_v):
                    raise ValueError('每页显示数量必须为整数')
                val = int(_v)
                if val < 5 or val > 100:
                    raise ValueError('每页显示数量必须在 5-100 之间')
            except ValueError as e:
                flash(str(e) if '必须' in str(e) else '每页数量格式错误')
                return redirect(url_for('admin_settings'))
            set_setting('links_per_page', str(val))
            flash('收集链接显示数量已保存')

        elif action == 'records_per_page':
            raw = request.form.get('records_per_page_val', '10')
            try:
                _v = float(raw)
                if _v != int(_v):
                    raise ValueError('每页显示数量必须为整数')
                val = int(_v)
                if val < 5 or val > 200:
                    raise ValueError('每页显示数量必须在 5-200 之间')
            except ValueError as e:
                flash(str(e) if '必须' in str(e) else '每页数量格式错误')
                return redirect(url_for('admin_settings'))
            set_user_setting(session.get('user_id'), 'records_per_page', str(val))
            flash('上传记录单页数量已保存（仅对自己生效）')

        # ---- 合并卡片 actions ----

        elif action == 'page_branding':
            # 站点标题 + 收集页 + 分享页 + 登录页提示
            title = request.form.get('site_title', '').strip()
            if not title:
                flash('站点标题不能为空')
                return redirect(url_for('admin_settings'))
            set_setting('site_title', title)
            footer_text = request.form.get('collect_footer_text', '').strip()
            public_url = request.form.get('public_url', '').strip()
            set_setting('collect_footer_text', footer_text)
            set_setting('public_url', public_url)
            share_title = request.form.get('share_page_title', '').strip()
            share_footer = request.form.get('share_footer_text', '').strip()
            set_setting('share_page_title', share_title)
            set_setting('share_footer_text', share_footer)
            tip = request.form.get('login_tip_text', '').strip()
            set_setting('login_tip', tip)
            flash('页面与品牌设置已保存')

        elif action == 'expiry_settings':
            # 通行证有效期 + 默认链接有效期
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
            raw = request.form.get('default_link_expire_days', '30')
            try:
                _v = float(raw)
                if _v != int(_v):
                    raise ValueError('链接有效期天数必须为整数')
                days = int(_v)
                if days < 1 or days > 3650:
                    raise ValueError('链接有效期天数必须在 1-3650 天之间')
            except ValueError as e:
                flash(str(e) if '必须' in str(e) else '链接有效期格式错误')
                return redirect(url_for('admin_settings'))
            set_setting('default_link_expire_days', str(days))
            flash('有效期设置已保存')

        elif action == 'feature_toggles':
            # 用户注册 + 首页设置
            allow_reg = request.form.get('allow_registration', '0')
            expire_days = request.form.get('default_invite_expire_days', '7')
            try:
                _d = float(expire_days)
                if _d != int(_d):
                    raise ValueError('邀请码有效期必须为整数')
                days = int(_d)
                if days < 1 or days > 365:
                    raise ValueError('邀请码有效期必须在 1-365 天之间')
            except ValueError as e:
                flash(str(e) if '必须' in str(e) else '邀请码有效期格式错误')
                return redirect(url_for('admin_settings'))
            set_setting('allow_registration', allow_reg)
            set_setting('default_invite_expire_days', str(days))
            enabled = request.form.get('landing_page_enabled', '0')
            set_setting('landing_page_enabled', enabled)
            flash('功能开关已保存')

        elif action == 'pagination':
            # 收集链接分页 + 上传记录分页
            raw_links = request.form.get('links_per_page_val', '10')
            try:
                _v = float(raw_links)
                if _v != int(_v):
                    raise ValueError('收集链接每页数量必须为整数')
                val_l = int(_v)
                if val_l < 5 or val_l > 100:
                    raise ValueError('收集链接每页数量必须在 5-100 之间')
            except ValueError as e:
                flash(str(e) if '必须' in str(e) else '每页数量格式错误')
                return redirect(url_for('admin_settings'))
            set_setting('links_per_page', str(val_l))
            raw_records = request.form.get('records_per_page_val', '10')
            try:
                _v2 = float(raw_records)
                if _v2 != int(_v2):
                    raise ValueError('上传记录每页数量必须为整数')
                val_r = int(_v2)
                if val_r < 5 or val_r > 200:
                    raise ValueError('上传记录每页数量必须在 5-200 之间')
            except ValueError as e:
                flash(str(e) if '必须' in str(e) else '每页数量格式错误')
                return redirect(url_for('admin_settings'))
            set_user_setting(session.get('user_id'), 'records_per_page', str(val_r))
            flash('分页设置已保存')

        elif action == 'smtp_config':
            smtp_fields = ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password',
                           'smtp_use_tls', 'smtp_from_email', 'smtp_from_name']
            for f in smtp_fields:
                val = request.form.get(f, '').strip()
                set_setting(f, val)
            flash('邮箱配置已保存')
            # 自动同步管理员邮箱到 users 表，确保「忘记密码」功能可用
            admin_email = request.form.get('smtp_from_email', '').strip()
            if admin_email and '@' in admin_email:
                try:
                    conn3 = get_db()
                    # 为管理员账号设置邮箱
                    admin_username = get_setting('admin_username', 'admin')
                    conn3.execute(
                        "UPDATE users SET email = ? WHERE username = ? AND is_admin = 1 AND (email = '' OR email IS NULL)",
                        (admin_email, admin_username)
                    )
                    updated = conn3.execute(
                        "SELECT changes()"
                    ).fetchone()[0]
                    if updated:
                        conn3.commit()
                        logger.info(f"管理员邮箱已自动同步: {admin_email}")
                    conn3.close()
                except Exception as e:
                    logger.error(f"同步管理员邮箱失败: {e}")

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
    # 获取管理员邮箱和昵称（从 users 表）
    conn = get_db()
    admin_row = conn.execute("SELECT email, nickname FROM users WHERE username = ? AND is_admin = 1",
                             (admin_user,)).fetchone()
    conn.close()
    admin_email = admin_row['email'] if admin_row else ''
    admin_nickname = admin_row['nickname'] if admin_row else ''
    custom_upload_path = get_setting('custom_upload_path', '')
    defaults = {
        'max_files': get_setting('max_files', str(DEFAULT_MAX_FILES)),
        'max_file_size_gb': get_setting('max_file_size_gb', str(DEFAULT_MAX_FILE_SIZE_GB)),
        'site_title': get_setting('site_title', '文件收集器'),
        'login_tip': get_setting('login_tip', '默认账户 admin / admin123，请及时修改'),
        'collect_footer_text': get_setting('collect_footer_text', ''),
        'share_page_title': get_setting('share_page_title', ''),
        'share_footer_text': get_setting('share_footer_text', ''),
        'public_url': get_setting('public_url', ''),
        'landing_page_enabled': get_setting('landing_page_enabled', '1'),
        'passcode_ttl_minutes': get_setting('passcode_ttl_minutes', '120'),
        'blocked_extensions': get_setting('blocked_extensions', ''),
        'allow_registration': get_setting('allow_registration', '0'),
        'default_invite_expire_days': get_setting('default_invite_expire_days', '7'),
        'default_link_expire_days': get_setting('default_link_expire_days', '30'),
        'links_per_page': get_setting('links_per_page', '10'),
        'records_per_page': get_user_setting(session.get('user_id'), 'records_per_page', '10'),
        'smtp_host': get_setting('smtp_host', ''),
        'smtp_port': get_setting('smtp_port', '587'),
        'smtp_username': get_setting('smtp_username', ''),
        'smtp_password': get_setting('smtp_password', ''),
        'smtp_use_tls': get_setting('smtp_use_tls', '1'),
        'smtp_from_email': get_setting('smtp_from_email', ''),
        'smtp_from_name': get_setting('smtp_from_name', '文件收集器'),
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
        admin_email=admin_email,
        admin_nickname=admin_nickname,
        custom_upload_path=custom_upload_path,
        sys_info=sys_info,
        version=VERSION)

@app.route('/admin/settings/test-smtp', methods=['POST'])
@admin_required
def test_smtp():
    """测试 SMTP 邮件发送"""
    if not validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败'})
    to_email = request.form.get('test_email', '').strip()
    if not to_email or '@' not in to_email:
        return jsonify({'success': False, 'message': '请输入有效的测试邮箱地址'})

    config = get_smtp_config()
    if not config['host'] or not config['from_email']:
        return jsonify({'success': False, 'message': '请先配置 SMTP 服务器和发件人邮箱'})

    subject = f'[{config["from_name"]}] 测试邮件'
    body = f'''<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:30px 0;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
  <tr><td style="background:#059669;padding:24px 32px;text-align:center;">
    <h2 style="color:#fff;margin:0;font-size:18px;">{config["from_name"]}</h2>
  </td></tr>
  <tr><td style="padding:32px;text-align:center;">
    <div style="width:56px;height:56px;border-radius:50%%;background:#ecfdf5;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
    </div>
    <h3 style="margin:0 0 8px;color:#111827;font-size:16px;">邮件发送测试成功！</h3>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0;">如果您收到此邮件，说明 SMTP 配置正确，邮件功能可以正常使用。</p>
  </td></tr>
  <tr><td style="border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">此邮件由 {config["from_name"]} 系统自动发送</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>'''
    ok, msg = send_email(to_email, subject, body)
    return jsonify({'success': ok, 'message': msg})

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
        try:
            init_db()
        except Exception as e:
            # 迁移失败，回滚到旧数据库
            logger.error(f"数据库迁移失败，回滚: {e}")
            shutil.copy2(backup_path, DB_PATH)
            flash(f'数据库迁移失败，已自动回滚。原因：{e}')
            return redirect(url_for('admin_settings'))

        refresh_upload_base()  # 恢复后刷新自定义上传路径

        # 轮换 secret_key（仅保存到数据库，下次重启生效）
        # 注意：不能在运行时改 app.secret_key，因为多 gunicorn worker 下只有当前 worker 会更新，
        #       其他 worker 仍是旧 key，导致 cookie 跨 worker 解密失败 → "安全验证失败"
        new_secret = secrets.token_hex(32)
        set_setting('secret_key', new_secret)

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

        flash('数据库已成功导入！Secret Key 已轮换（重启后生效）。')
        if bad_paths > 0:
            flash(f'警告：发现 {bad_paths} 条记录的文件路径不在上传目录中，已跳过删除保护。')

        if bad_paths > 0:
            flash(f'警告：发现 {bad_paths} 条记录的文件路径不在上传目录中，已跳过删除保护。')
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

# ============================================================
# 后台文件监控线程
# ============================================================
_bg_scanner_lock = threading.Lock()
_bg_scanner_state = {
    'running': False,
    'last_scan': None,
    'last_scan_duration': 0,
    'total_new_files': 0,
    'total_orphans_cleaned': 0,
    'error': None,
}

def _bg_file_scanner(interval=30):
    """后台文件扫描线程：定期扫描所有链接文件夹的新文件并清理孤儿记录
    使用 settings 表中的时间戳锁防止多 worker 重复扫描。"""
    # 启动时随机延迟，避免多个 worker 同时竞争
    import random
    time.sleep(random.uniform(0, 3))
    
    _bg_scanner_state['running'] = True
    
    while _bg_scanner_state['running']:
        try:
            # 检查是否需要扫描
            conn = get_db()
            last_val = conn.execute(
                "SELECT value FROM settings WHERE key = 'last_bg_scan'"
            ).fetchone()
            
            now = time.time()
            if last_val:
                try:
                    last_ts = float(last_val['value'])
                    if now - last_ts < interval * 0.8:
                        conn.close()
                        time.sleep(interval * 0.3)
                        continue
                except ValueError:
                    pass
            
            # 乐观锁：更新扫描时间戳来获取锁
            try:
                conn.execute(
                    "INSERT OR REPLACE INTO settings (key, value) VALUES ('last_bg_scan', ?)",
                    (str(now),)
                )
                conn.commit()
            except:
                conn.close()
                time.sleep(interval * 0.3)
                continue
            
            # 执行扫描
            start_time = time.time()
            
            links = conn.execute("SELECT id FROM links").fetchall()
            total_new = 0
            for link in links:
                new_files = scan_link_folder(link['id'], conn)
                total_new += len(new_files)
            
            total_orphan = cleanup_orphan_records(conn)
            
            conn.close()
            
            elapsed = round(time.time() - start_time, 2)
            
            with _bg_scanner_lock:
                _bg_scanner_state['last_scan'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                _bg_scanner_state['last_scan_duration'] = elapsed
                _bg_scanner_state['total_new_files'] += total_new
                _bg_scanner_state['total_orphans_cleaned'] += total_orphan
                _bg_scanner_state['error'] = None
            
            if total_new > 0 or total_orphan > 0:
                logger.info(f"后台扫描: +{total_new} 新文件, -{total_orphan} 孤儿, 耗时 {elapsed}s")
                
        except Exception as e:
            logger.error(f"后台扫描异常: {e}")
            with _bg_scanner_lock:
                _bg_scanner_state['error'] = str(e)[:200]
        
        time.sleep(interval)

def start_bg_scanner(interval=30):
    """启动后台文件扫描线程"""
    thread = threading.Thread(target=_bg_file_scanner, args=(interval,), daemon=True)
    thread.start()
    return thread

@app.route('/api/scan-status')
@login_required
def api_scan_status():
    """获取后台扫描状态（前端轮询用）"""
    with _bg_scanner_lock:
        state = dict(_bg_scanner_state)
    return jsonify(state)

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
    import multiprocessing
    import gunicorn.app.base

    cpu_count = multiprocessing.cpu_count()
    workers = min(cpu_count + 1, 4)

    class GunicornApp(gunicorn.app.base.BaseApplication):
        def __init__(self, app, options=None):
            self.application = app
            self.options = options or {}
            super().__init__()

        def load_config(self):
            for k, v in self.options.items():
                if k in self.cfg.settings and v is not None:
                    self.cfg.set(k.lower(), v)

        def load(self):
            return self.application

    # Gunicorn worker 启动后，启动后台文件扫描线程
    def post_worker_init(worker):
        start_bg_scanner(interval=30)

    options = {
        'bind': f'0.0.0.0:{PORT}',
        'workers': workers,
        'timeout': 0,  # 不限制超时，MAX_CONTENT_LENGTH 和频率限制已提供保护
        'accesslog': '-',
        'errorlog': '-',
        'loglevel': 'info',
        'post_worker_init': post_worker_init,
    }

    print(f"文件收集器 v{VERSION} 启动中 (Gunicorn)...")
    print(f"数据目录: {DATA_DIR}")
    print(f"上传目录: {UPLOAD_BASE}")
    print(f"监听端口: {PORT}")
    print(f"Worker 进程: {workers}")
    print(f"管理后台: http://localhost:{PORT}/admin")

    GunicornApp(app, options).run()
