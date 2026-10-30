"""
Gateway 访问配置 API（独立 Blueprint）
无需登录，飞牛统一网关已做认证

原「内置反向代理」功能已移除：应用不再读取飞牛系统证书、不再自行监听 HTTPS 端口。
本模块只负责「访问配置」页：展示应用的内网访问地址，并维护用户自行填写的
公网访问地址（写入 settings.public_url，与 /admin/settings 的「公网网址」同源）。
"""
import os
import socket
import logging
from flask import Blueprint, jsonify, request, render_template, session

# 统一网关访问守卫（共享模块，与 gateway_admin_api 复用同一套安全约束）
from gateway_guard import (
    guard_gateway_access,
    guard_admin_only,
    validate_csrf as _validate_csrf,
)

logger = logging.getLogger('gateway_api')

# Blueprint 必须最早定义，确保 import 本模块时 gateway_bp 始终存在
gateway_bp = Blueprint('gateway', __name__, template_folder='templates')


@gateway_bp.before_request
def _guard_gateway_access():
    """网关页面与接口只能经飞牛统一网关访问。

    端口直连（如 http://127.0.0.1:5557/gateway）不带内部令牌头，一律 404。
    具体判定逻辑见 gateway_guard.guard_gateway_access。
    """
    return guard_gateway_access()


# 仅飞牛管理员可调用的管理类接口（访问配置读写）
_ADMIN_ONLY_ENDPOINTS = {
    'gateway.api_access_info',
    'gateway.api_access_save',
}


@gateway_bp.before_request
def _guard_gateway_admin_only():
    """管理类接口仅飞牛管理员可调用。

    页面上已对普通飞牛账号隐藏「访问配置」Tab，此处再对接口做一次拦截，
    避免绕过前端隐藏直接请求。权限判定逻辑见 gateway_guard.guard_admin_only。
    """
    return guard_admin_only(_ADMIN_ONLY_ENDPOINTS)


def _get_local_ip():
    """获取本机内网 IP"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.1)
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        pass

    # 回退方案1：尝试 socket.if_nameindex + ifaddrs（部分 Python 环境不支持）
    try:
        if_nameindex = getattr(socket, 'if_nameindex', None)
        ifaddrs_fn = getattr(socket, 'ifaddrs', None)
        if if_nameindex and ifaddrs_fn:
            for iface in if_nameindex():
                try:
                    for addr in ifaddrs_fn():
                        if addr[0] == iface[1] and addr[1].family == socket.AF_INET:
                            ip = addr[1].addr
                            if not ip.startswith('127.'):
                                return ip
                except Exception:
                    continue
    except Exception:
        pass

    # 回退方案2：通过 hostname 解析（兼容所有 Python 版本）
    try:
        hostname = socket.gethostname()
        ip = socket.gethostbyname(hostname)
        if ip and not ip.startswith('127.'):
            return ip
    except Exception:
        pass

    return '127.0.0.1'


def _local_address():
    """应用自身的局域网访问地址（用户做反向代理时的后端目标地址）"""
    return f'http://{_get_local_ip()}:{os.environ.get("PORT", "5557")}/'


def _current_public_url():
    """当前生效的公网地址（与应用内分享链接使用的一致）"""
    try:
        import app as _app
        return _app._resolve_public_url() or ''
    except Exception as e:
        logger.warning(f'读取公网地址失败: {e}')
        return ''


def _normalize_public_url(raw):
    """规范化用户填写的公网地址：去首尾空白与结尾斜杠，必须带 http(s)://"""
    url = (raw or '').strip().rstrip('/')
    if not url:
        return '', None
    if not url.lower().startswith(('http://', 'https://')):
        return '', '公网地址需以 http:// 或 https:// 开头，例如 https://file.example.com'
    return url, None


# ============================================================
# 页面渲染
# ============================================================
@gateway_bp.route('')
@gateway_bp.route('/')
def gateway_index():
    """Gateway 访问配置页面"""
    local_ip = _get_local_ip()
    local_port = os.environ.get('PORT', '5557')
    gateway_prefix = os.environ.get('GATEWAY_PREFIX', '/app/file-collector')

    # 获取版本号（与 manifest 同步）
    version = "2.5.0"
    upload_base = ''
    data_dir = ''
    try:
        import app as _app
        version = _app.VERSION
        upload_base = _app.get_upload_base() or ''
        data_dir = os.path.dirname(_app.DB_PATH)
    except Exception as e:
        logger.warning(f'读取应用信息失败: {e}')

    # 当前访客是否为飞牛管理员：以应用会话为准（由网关 SSO 建立），
    # 不直接读取 X-Trim-Isadmin 头（该头可被客户端伪造）
    is_fn_admin = bool(session.get('is_admin'))

    return render_template('gateway.html',
        local_ip=local_ip,
        local_port=local_port,
        gateway_prefix=gateway_prefix,
        public_url=_current_public_url(),
        version=version,
        upload_base=upload_base,
        data_dir=data_dir,
        is_fn_admin=is_fn_admin,
        csrf_token=session.get('csrf_token', ''))


# ============================================================
# API 路由
# ============================================================
@gateway_bp.route('/api/access')
def api_access_info():
    """访问配置信息：内网访问地址 + 当前生效的公网地址"""
    return jsonify({
        'local_url': _local_address(),
        'public_url': _current_public_url(),
    })


@gateway_bp.route('/api/access/public-url', methods=['POST'])
def api_access_save():
    """保存公网访问地址（写入 settings.public_url，与 /admin/settings 同源）"""
    if not _validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败，请刷新页面重试'}), 403
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({'success': False, 'message': '请求格式错误'})

    url, err = _normalize_public_url(data.get('public_url', ''))
    if err:
        return jsonify({'success': False, 'message': err})

    try:
        import app as _app
        _app.set_setting('public_url', url)
    except Exception as e:
        logger.warning(f'保存公网地址失败: {e}')
        return jsonify({'success': False, 'message': '保存失败，请查看应用日志'})

    return jsonify({
        'success': True,
        'public_url': url,
        'message': '公网地址已保存' if url else '已清空公网地址',
    })
