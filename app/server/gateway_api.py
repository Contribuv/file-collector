"""
Gateway 反代管理 API（独立 Blueprint）
无需登录，飞牛统一网关已做认证
"""
import os
import json
import socket
import secrets
import logging
from flask import Blueprint, jsonify, request, render_template, abort, session

logger = logging.getLogger('gateway_api')

# Blueprint 必须最早定义，确保 import 本模块时 gateway_bp 始终存在
gateway_bp = Blueprint('gateway', __name__, template_folder='templates')


@gateway_bp.before_request
def _guard_gateway_access():
    """网关页面与接口只能经飞牛统一网关访问。

    飞牛网关经 Unix Socket 转发时会由应用自身的 socket 代理注入内部令牌头；
    而通过应用端口（如 http://127.0.0.1:5557/gateway）直连的请求不带该头，
    一律返回 404，实现网关访问与端口访问的隔离。
    """
    # 本地开发（Windows）或显式关闭守卫时豁免，便于调试前端
    if os.name == 'nt' or os.environ.get('FC_GATEWAY_GUARD', '1') == '0':
        return None
    token = os.environ.get('FC_GATEWAY_INTERNAL_TOKEN', '')
    if not token or request.headers.get('X-FC-Gateway-Proxy') != token:
        abort(404)
    return None


# 仅飞牛管理员可调用的管理类接口（证书、反代启停、日志、端口检测）
_ADMIN_ONLY_ENDPOINTS = {
    'gateway.api_gateway_status',
    'gateway.api_gateway_certs',
    'gateway.api_gateway_start',
    'gateway.api_gateway_stop',
    'gateway.api_gateway_logs',
    'gateway.api_gateway_clear_logs',
    'gateway.api_gateway_check_port',
}


@gateway_bp.before_request
def _guard_gateway_admin_only():
    """管理类接口仅飞牛管理员可调用。

    页面上已对普通飞牛账号隐藏「公网访问 / 反向代理 / 实时日志」Tab，
    此处再对接口做一次拦截，避免绕过前端隐藏直接请求。
    权限以应用会话 session['is_admin'] 为准：该会话仅在请求经飞牛网关转发时
    由 SSO 建立，不直接信任客户端可伪造的 X-Trim-Isadmin 头。
    """
    # 与访问来源守卫保持一致：本地开发或显式关闭守卫时豁免
    if os.name == 'nt' or os.environ.get('FC_GATEWAY_GUARD', '1') == '0':
        return None
    if request.endpoint in _ADMIN_ONLY_ENDPOINTS:
        if not session.get('is_admin'):
            abort(403)
    return None

def _validate_csrf():
    """校验 CSRF：从表单或 X-CSRFToken 头取令牌，与应用 session 中的比对。

    POST 类管理接口（启动/停止反代、清空日志）必须校验，防止管理员
    在已登录状态下被第三方页面诱导发起跨站请求。
    """
    token = request.form.get('csrf_token', '') or request.headers.get('X-CSRFToken', '')
    expected = session.get('csrf_token', '')
    return bool(token) and bool(expected) and secrets.compare_digest(token, expected)


# 延迟导入：避免模块加载时因依赖问题导致 Blueprint 注册失败
RPROXY_PM = None
CertManager = None

def _init_dependencies():
    """延迟初始化依赖，失败时 gateway 页面仍可加载"""
    global RPROXY_PM, CertManager
    try:
        from cert_manager import CertManager as _CertManager
        CertManager = _CertManager
    except Exception as e:
        logger.warning(f"cert_manager 加载失败: {e}")

    try:
        import rproxy_manager
        RPROXY_PM = rproxy_manager.GoRProxyManager()
    except Exception as e:
        logger.warning(f"rproxy_manager 加载失败: {e}")

_init_dependencies()


def _check_rp():
    """检查反代管理器是否可用，不可用时返回错误响应"""
    if RPROXY_PM is None:
        return jsonify({'success': False, 'message': '反向代理模块未加载，请检查日志'})
    return None

def _check_cert():
    """检查证书管理器是否可用，不可用时返回空列表"""
    if CertManager is None:
        return []
    return None

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


def _check_port_available(port):
    """检测端口是否可用（使用 SO_REUSEADDR 避免 TIME_WAIT 干扰）"""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(('0.0.0.0', port))
        s.close()
        return True
    except OSError:
        s.close()
        return False


# ============================================================
# 页面渲染
# ============================================================
@gateway_bp.route('')
@gateway_bp.route('/')
def gateway_index():
    """Gateway 反代管理页面"""
    local_ip = _get_local_ip()
    local_port = os.environ.get('PORT', '5557')
    gateway_prefix = os.environ.get('GATEWAY_PREFIX', '/app/file-collector')

    # 获取所有证书（排除规则已在 load_certs 层处理）
    certs = CertManager.get_certs_for_display() if CertManager else []

    status = RPROXY_PM.status() if RPROXY_PM else {'running': False, 'message': '模块未加载'}
    config = RPROXY_PM.get_config() if RPROXY_PM else {}

    # 获取版本号（与 manifest 同步）
    version = "2.3.49"
    try:
        from app import VERSION
        version = VERSION
    except Exception:
        pass

    # 获取上传目录路径（与 /admin/settings 一致：自定义路径优先，否则默认）
    upload_base = ''
    try:
        from app import get_upload_base
        upload_base = get_upload_base() or ''
    except Exception:
        pass

    # 数据目录（与 /admin/settings「系统信息」一致：仅显示目录，不暴露完整文件名）
    data_dir = ''
    try:
        from app import DB_PATH
        data_dir = os.path.dirname(DB_PATH)
    except Exception:
        pass

    # 当前访客是否为飞牛管理员：以应用会话为准（由网关 SSO 建立），
    # 不直接读取 X-Trim-Isadmin 头（该头可被客户端伪造）
    is_fn_admin = bool(session.get('is_admin'))

    return render_template('gateway.html',
        local_ip=local_ip,
        local_port=local_port,
        gateway_prefix=gateway_prefix,
        certs=certs,
        status=status,
        config=config,
        version=version,
        upload_base=upload_base,
        data_dir=data_dir,
        is_fn_admin=is_fn_admin,
        csrf_token=session.get('csrf_token', ''),
        all_certs_json=json.dumps(certs, ensure_ascii=False))


# ============================================================
# API 路由
# ============================================================
@gateway_bp.route('/api/status')
def api_gateway_status():
    """获取反代运行状态"""
    err = _check_rp()
    if err: return err
    return jsonify(RPROXY_PM.status())


@gateway_bp.route('/api/certs')
def api_gateway_certs():
    """获取飞牛证书列表（返回所有证书，排除规则已在 load_certs 层处理）"""
    if CertManager is None:
        return jsonify({'certs': [], 'domains': []})
    certs = CertManager.get_certs_for_display()
    domains = []
    for cert in certs:
        sans = cert.get('sans', [])
        if not sans:
            sans = [cert.get('domain', '')]
        for san in sans:
            if san and san not in domains:
                domains.append(san)
    return jsonify({'certs': certs, 'domains': domains})


@gateway_bp.route('/api/start', methods=['POST'])
def api_gateway_start():
    """启动反向代理"""
    if not _validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败，请刷新页面重试'}), 403
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({'success': False, 'message': '请求格式错误'})

    domain = (str(data.get('domain', '') or '')).strip()
    port_str = (str(data.get('port', '') or '')).strip()

    if not domain:
        return jsonify({'success': False, 'message': '请选择域名'})

    try:
        port = int(port_str) if port_str else 7786
    except ValueError:
        return jsonify({'success': False, 'message': '端口格式错误'})

    if port < 1 or port > 65535:
        return jsonify({'success': False, 'message': '端口范围 1-65535'})
    if port in (80, 443, 8080):
        return jsonify({'success': False, 'message': f'端口 {port} 已被飞牛系统占用，请使用其他端口（如 7786）'})

    err = _check_rp()
    if err: return err

    # 查找证书
    if CertManager is None:
        return jsonify({'success': False, 'message': '证书模块未加载'})
    certs = CertManager.load_certs()
    cert_path = None
    key_path = None
    for cert in certs:
        # 原始数据字段可能是 'san'（单数）
        sans = cert.get('san', cert.get('sans', []))
        if domain in sans or domain == cert.get('domain'):
            cert_path = cert.get('fullchain') or cert.get('certificate')
            key_path = cert.get('privateKey')
            break

    if not cert_path:
        return jsonify({'success': False, 'message': f'未找到域名 {domain} 的证书'})

    local_port = int(os.environ.get('PORT', 5557))

    success, msg = RPROXY_PM.start(
        domain, port, cert_path, key_path,
        f'http://127.0.0.1:{local_port}',
        gzip_enabled=True, hsts_enabled=True, timeout=600
    )
    return jsonify({'success': success, 'message': msg})


@gateway_bp.route('/api/stop', methods=['POST'])
def api_gateway_stop():
    """停止反向代理"""
    if not _validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败，请刷新页面重试'}), 403
    err = _check_rp()
    if err: return err
    success, msg = RPROXY_PM.stop()
    return jsonify({'success': success, 'message': msg})


@gateway_bp.route('/api/logs')
def api_gateway_logs():
    """获取反代日志"""
    err = _check_rp()
    if err: return err
    limit = request.args.get('limit', '200')
    try:
        limit = int(limit)
    except ValueError:
        limit = 200
    return jsonify({'logs': RPROXY_PM.get_logs(limit)})


@gateway_bp.route('/api/logs/clear', methods=['POST'])
def api_gateway_clear_logs():
    """清除反代日志"""
    if not _validate_csrf():
        return jsonify({'success': False, 'message': '安全验证失败，请刷新页面重试'}), 403
    err = _check_rp()
    if err: return err
    RPROXY_PM.clear_logs()
    return jsonify({'success': True})


@gateway_bp.route('/api/check-port')
def api_gateway_check_port():
    """检测端口是否可用"""
    port_str = request.args.get('port', '')
    try:
        port = int(port_str)
    except ValueError:
        return jsonify({'available': False, 'message': '端口格式错误'})

    if port < 1 or port > 65535:
        return jsonify({'available': False, 'message': '端口范围 1-65535'})

    available = _check_port_available(port)
    result = {
        'available': available,
        'port': port,
        'message': '端口可用' if available else '端口已被占用'
    }
    # 如果被占用，尝试建议一个可用端口
    if not available:
        for p in range(port + 1, port + 100):
            if _check_port_available(p):
                result['suggested_port'] = p
                break
    return jsonify(result)
