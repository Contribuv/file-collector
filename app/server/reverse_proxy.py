"""
内置反向代理引擎
自动获取飞牛 NAS 系统证书，启动 HTTPS 反向代理
"""
import os
import re
import json
import ssl
import time
import gzip
import socket
import logging
import threading
import urllib.request
import urllib.error
from io import BytesIO
from queue import Queue
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn

logger = logging.getLogger('reverse_proxy')

# 飞牛系统证书配置文件
FLYFISH_CERT_CONF = "/usr/trim/etc/network_cert_all.conf"

# 日志最大保留条数
MAX_LOG_LINES = 500

# 反代日志文件路径（与 gunicorn.log 同级的 DATA_DIR 下）
_PKGVAR = os.environ.get('TRIM_PKGVAR', '/tmp/file-collector')
_DATA_DIR = os.environ.get('DATA_DIR', os.path.join(_PKGVAR, 'data'))
RP_LOG_FILE = os.path.join(_DATA_DIR, 'reverse_proxy.log')

# 内部 Flask 端口
INTERNAL_PORT = int(os.environ.get('PORT', 5557))
INTERNAL_HOST = '127.0.0.1'

# 飞牛系统已占用的端口，禁止使用
FORBIDDEN_PORTS = {80, 443, 8080}


# ============================================================
# 证书管理
# ============================================================

class CertManager:
    """飞牛证书发现与管理"""

    @staticmethod
    def load_certs():
        """从飞牛系统配置读取所有证书"""
        if not os.path.exists(FLYFISH_CERT_CONF):
            return []
        try:
            with open(FLYFISH_CERT_CONF, 'r') as f:
                data = json.load(f)
            return data if isinstance(data, list) else []
        except Exception as e:
            logger.error(f"读取证书配置失败: {e}")
            return []

    @staticmethod
    def get_active_cert():
        """
        获取当前使用的证书（used=true）
        返回 dict 或 None
        """
        certs = CertManager.load_certs()
        for cert in certs:
            if cert.get('used'):
                return cert
        return None

    @staticmethod
    def get_certs_for_display():
        """获取所有有效证书供前端展示"""
        certs = CertManager.load_certs()
        result = []
        now_ms = int(time.time() * 1000)
        for cert in certs:
            sans = cert.get('san', [])
            if not sans:
                sans = [cert.get('domain', '')]
            expires_ts = cert.get('validTo', 0) / 1000
            result.append({
                'domain': cert.get('domain', ''),
                'sans': sans,
                'expired': now_ms > cert.get('validTo', 0),
                'expires': datetime.fromtimestamp(expires_ts).strftime('%Y-%m-%d %H:%M') if expires_ts else '未知',
                'used': cert.get('used', False),
                'sum': cert.get('sum', ''),
                'cert_path': cert.get('fullchain') or cert.get('certificate', ''),
                'key_path': cert.get('privateKey', ''),
            })
        return result

    @staticmethod
    def check_cert_change():
        """检查证书是否变更（对比 sum 指纹）"""
        current = CertManager.get_active_cert()
        if not current:
            return False
        config = ProxyManager.get_config()
        saved_sum = config.get('cert_sum', '')
        return current.get('sum', '') != saved_sum


# ============================================================
# 代理请求处理
# ============================================================

# Gzip 压缩的内容类型
GZIP_TYPES = {
    'text/html', 'text/plain', 'text/css', 'text/javascript',
    'application/javascript', 'application/json', 'application/xml',
    'text/xml', 'application/x-javascript', 'image/svg+xml',
}


class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    """禁止 urllib 自动跟随重定向。
    反向代理必须原样把 3xx + Set-Cookie 等响应头返回客户端，
    否则 session cookie / 登录流程会被 urllib 内部吞掉。"""
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

    def http_error_301(self, req, fp, code, msg, headers):
        return fp

    def http_error_302(self, req, fp, code, msg, headers):
        return fp

    def http_error_303(self, req, fp, code, msg, headers):
        return fp

    def http_error_307(self, req, fp, code, msg, headers):
        return fp

    def http_error_308(self, req, fp, code, msg, headers):
        return fp


class ProxyHandler(BaseHTTPRequestHandler):
    """HTTP 代理处理器 —— 转发请求到内部 Flask 并返回响应"""

    # 类级别禁用默认日志（太吵了）
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        self._proxy('GET')

    def do_POST(self):
        self._proxy('POST')

    def do_PUT(self):
        self._proxy('PUT')

    def do_DELETE(self):
        self._proxy('DELETE')

    def do_PATCH(self):
        self._proxy('PATCH')

    def do_HEAD(self):
        self._proxy('HEAD')

    def do_OPTIONS(self):
        self._proxy('OPTIONS')

    def _proxy(self, method):
        try:
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else b''

            # 构建转发 URL
            target_url = f"http://{INTERNAL_HOST}:{INTERNAL_PORT}{self.path}"

            # 构建请求
            req = urllib.request.Request(target_url, data=body, method=method)

            # 透传请求头（排除 hop-by-hop 头）
            skip_headers = {
                'host', 'connection', 'proxy-connection',
                'transfer-encoding', 'upgrade', 'keep-alive',
            }
            for key, value in self.headers.items():
                if key.lower() not in skip_headers:
                    req.add_header(key, value)

            # 添加代理头
            req.add_header('X-Forwarded-For', self.client_address[0])
            req.add_header('X-Forwarded-Proto', 'https')
            req.add_header('X-Real-IP', self.client_address[0])
            # 透传原始 Host，让 Flask ProxyFix 正确识别域名
            # 否则 session cookie / url_for 会使用 127.0.0.1:5557，导致登录失败
            original_host = self.headers.get('Host', '')
            if original_host:
                req.add_header('X-Forwarded-Host', original_host)

            # 一次性读取配置（避免多次 DB 查询）
            _cfg = ProxyManager.get_config()
            req_timeout = _cfg.get('timeout', 600)
            gzip_enabled = _cfg.get('gzip_enabled', True)
            hsts_enabled = _cfg.get('hsts_enabled', True)

            # 发送请求（禁用自动重定向跟随，否则会吞掉 Set-Cookie 等响应头）
            try:
                resp = urllib.request.build_opener(
                    urllib.request.HTTPHandler(),
                    NoRedirectHandler,
                    urllib.request.HTTPDefaultErrorHandler()
                ).open(req, timeout=int(req_timeout))
                status = resp.status
                resp_headers = dict(resp.headers)
                resp_body = resp.read()
            except urllib.error.HTTPError as e:
                status = e.code
                resp_headers = dict(e.headers)
                resp_body = e.read()
            except Exception as e:
                self.send_error(502, f"Backend error: {e}")
                ProxyManager.append_log('ERROR', f"后端错误: {e}")
                return

            # 处理 Gzip（跳过 /admin 后台路径）
            content_type = resp_headers.get('Content-Type', '').split(';')[0].strip()
            # 检测后端是否已经压缩（大小写不敏感）
            backend_encoded = any(k.lower() == 'content-encoding' for k in resp_headers)
            should_gzip = (
                gzip_enabled and
                not self.path.startswith('/admin') and
                content_type in GZIP_TYPES and
                len(resp_body) > 500 and
                not backend_encoded
            )

            if should_gzip:
                buf = BytesIO()
                with gzip.GzipFile(fileobj=buf, mode='wb', compresslevel=6) as gz:
                    gz.write(resp_body)
                resp_body = buf.getvalue()
                resp_headers['Content-Encoding'] = 'gzip'

            # 移除 hop-by-hop 响应头
            for h in ('Transfer-Encoding', 'Connection', 'Keep-Alive', 'Proxy-Connection'):
                resp_headers.pop(h, None)
            # 仅在要重新 gzip 时才移除后端原始 Content-Encoding；
            # 否则保持原样（如后端已压缩的非 gzip 内容不能丢失头）

            # 发送响应
            self.send_response(status)
            for key, value in resp_headers.items():
                if key.lower() == 'content-length':
                    continue
                if key.lower() == 'content-encoding':
                    # 如果要重新 gzip，丢弃原始编码头（下面会重新设置）；
                    # 否则保留原样
                    if should_gzip:
                        continue
                    # 不跳过，保留后端原始 Content-Encoding
                if key.lower() in skip_headers:
                    continue
                self.send_header(key, value)
            self.send_header('Content-Length', str(len(resp_body)))
            if should_gzip:
                self.send_header('Content-Encoding', 'gzip')
            # HSTS 头
            if hsts_enabled:
                self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
            self.end_headers()
            self.wfile.write(resp_body)

            # 记录日志（非静态资源）
            if not self.path.startswith(('/static/', '/favicon.ico')):
                ProxyManager.append_log('INFO',
                    f"{method} {self.path} → {status} | {self.client_address[0]}")

        except Exception as e:
            logger.error(f"代理请求失败: {e}")
            try:
                self.send_error(500, f"Proxy error: {e}")
            except Exception:
                pass
            ProxyManager.append_log('ERROR', f"代理异常: {e}")


# ============================================================
# 双协议服务器（HTTP → HTTPS 301 自动重定向）
# ============================================================

class DualProtocolServer(HTTPServer):
    """在同一端口同时处理 HTTPS 和 HTTP→HTTPS 301 重定向"""

    ssl_context: ssl.SSLContext = None
    redirect_domain: str = ''
    redirect_port: int = 443

    def get_request(self):
        """接受连接，检测协议：TLS 则包装 SSL，HTTP 则发送 301"""
        while True:
            sock, addr = super().get_request()
            try:
                sock.settimeout(3)
                first_byte = sock.recv(1, socket.MSG_PEEK)
                if first_byte and first_byte[0] == 0x16:
                    # TLS ClientHello → 包装 SSL
                    sock.settimeout(self.timeout)
                    sock = self.ssl_context.wrap_socket(sock, server_side=True)
                    return sock, addr
                else:
                    # HTTP 明文请求 → 301 重定向到 HTTPS
                    self._redirect_http(sock, addr)
            except Exception:
                try:
                    sock.close()
                except Exception:
                    pass


class ThreadingDualProtocolServer(ThreadingMixIn, DualProtocolServer):
    """多线程版双协议服务器，支持并发请求处理"""
    daemon_threads = True  # 主线程退出时自动清理子线程
    allow_reuse_address = True

    def _redirect_http(self, sock, addr):
        """发送 HTTP 301 Moved Permanently"""
        target = f"https://{self.redirect_domain}:{self.redirect_port}"
        try:
            sock.settimeout(3)
            request_data = sock.recv(4096).decode('utf-8', errors='ignore')
            path = '/'
            for line in request_data.split('\r\n'):
                if line[:4] in ('GET ', 'POST', 'HEAD', 'PUT ', 'DELE', 'PATC', 'OPTI'):
                    parts = line.split(' ')
                    path = parts[1] if len(parts) > 1 else '/'
                    break
            redirect_url = f"{target}{path}"
        except Exception:
            redirect_url = target

        response = (
            f"HTTP/1.1 301 Moved Permanently\r\n"
            f"Location: {redirect_url}\r\n"
            f"Content-Length: 0\r\n"
            f"Connection: close\r\n"
            f"Server: file-collector\r\n"
            f"\r\n"
        )
        try:
            sock.sendall(response.encode())
        except Exception:
            pass
        try:
            sock.close()
        except Exception:
            pass


# ============================================================
# 代理管理器（单例）
# ============================================================

class ProxyManager:
    """反向代理生命周期管理"""

    _server: HTTPServer = None
    _thread: threading.Thread = None
    _lock = threading.Lock()
    _logs: list = []
    _logs_lock = threading.Lock()
    _running = False
    _config: dict = {}
    _config_cache_ts: float = 0  # 配置缓存时间戳，用于 TTL 过期
    # 异步日志写入：后台线程 + 队列，避免阻塞请求处理
    _log_queue: Queue = Queue()
    _log_writer_started = False
    _log_writer_lock = threading.Lock()

    @classmethod
    def get_config(cls, force_reload=False):
        """获取当前持久化配置。force_reload=True 时强制从 DB 重新加载（跨 worker 同步）
        缓存有效期 5 秒，确保运行中的 worker 能及时感知配置变更（timeout/gzip/hsts）"""
        now = time.time()
        if force_reload or not cls._config or (now - cls._config_cache_ts > 5):
            cls._config = cls._load_config()
            cls._config_cache_ts = now
        return cls._config

    @classmethod
    def _load_config(cls):
        """从数据库加载配置"""
        try:
            from app import get_setting
            raw = get_setting('reverse_proxy_config', '{}')
            return json.loads(raw) if raw else {}
        except Exception:
            return {}

    @classmethod
    def _save_config(cls, config):
        """保存配置到数据库"""
        try:
            from app import set_setting
            set_setting('reverse_proxy_config', json.dumps(config, ensure_ascii=False))
        except Exception as e:
            logger.error(f"保存反代配置失败: {e}")

    @classmethod
    def _start_log_writer(cls):
        """启动后台日志写入线程（仅首次）"""
        with cls._log_writer_lock:
            if cls._log_writer_started:
                return
            cls._log_writer_started = True

        def _writer():
            while True:
                try:
                    entry = cls._log_queue.get()
                    if entry is None:  # 停止信号
                        break
                    with open(RP_LOG_FILE, 'a', encoding='utf-8') as f:
                        f.write(entry)
                except Exception:
                    pass

        t = threading.Thread(target=_writer, daemon=True, name='rp-log-writer')
        t.start()

    @classmethod
    def append_log(cls, level, message):
        """追加日志（异步文件 + 内存 + Python logger，跨 worker 可见）"""
        ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        entry_line = json.dumps({'time': ts, 'level': level, 'msg': message}, ensure_ascii=False) + '\n'

        with cls._logs_lock:
            # 内存（本 worker 快速访问）
            cls._logs.append({'time': ts, 'level': level, 'msg': message})
            if len(cls._logs) > MAX_LOG_LINES:
                cls._logs = cls._logs[-MAX_LOG_LINES:]

        # 文件写入丢到后台线程，不阻塞请求处理
        cls._start_log_writer()
        cls._log_queue.put(entry_line)

        # Python logger（轻量，直接输出）
        log_func = {
            'INFO': logger.info,
            'WARN': logger.warning,
            'ERROR': logger.error,
        }.get(level, logger.info)
        log_func(f"[反代] {message}")

    @classmethod
    def get_logs(cls, max_lines=200):
        """获取日志（从共享文件读取，跨 worker 可见）"""
        # 优先从文件读取（跨 worker 一致）
        try:
            if os.path.exists(RP_LOG_FILE):
                with open(RP_LOG_FILE, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                logs = []
                for line in lines[-MAX_LOG_LINES:]:
                    line = line.strip()
                    if line:
                        try:
                            logs.append(json.loads(line))
                        except json.JSONDecodeError:
                            pass
                return logs[-max_lines:] if len(logs) > max_lines else logs
        except Exception:
            pass
        # 回退：返回内存中的日志
        with cls._logs_lock:
            logs = list(cls._logs)
            return logs[-max_lines:] if len(logs) > max_lines else logs

    @classmethod
    def clear_logs(cls):
        """清除日志（文件 + 内存 + 队列）"""
        with cls._logs_lock:
            cls._logs.clear()
        # 清空待写入队列
        while not cls._log_queue.empty():
            try:
                cls._log_queue.get_nowait()
            except Exception:
                break
        try:
            with open(RP_LOG_FILE, 'w', encoding='utf-8') as f:
                f.write('')
        except Exception:
            pass

    @classmethod
    def start(cls, domain, port, cert_path, key_path, gzip_enabled=True,
              hsts_enabled=True, timeout=600):
        """启动反代"""
        with cls._lock:
            if cls._running:
                return False, "反代已在运行中"

            # 禁止使用飞牛已占用端口
            if int(port) in FORBIDDEN_PORTS:
                return False, f"端口 {port} 已被飞牛系统占用，请使用其他端口（如 7786）"

            # 验证证书文件
            if not os.path.exists(cert_path):
                return False, f"证书文件不存在: {cert_path}"
            if not os.path.exists(key_path):
                return False, f"私钥文件不存在: {key_path}"

            # 创建 SSL 上下文
            try:
                ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
                ssl_context.load_cert_chain(cert_path, key_path)
                ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
            except Exception as e:
                return False, f"SSL 证书加载失败: {e}"

            # 检查证书是否过期
            cert = CertManager.get_active_cert()
            if cert:
                cert_sum = cert.get('sum', '')
                now_ms = int(time.time() * 1000)
                if now_ms > cert.get('validTo', 0):
                    cls.append_log('WARN', '证书已过期，请在飞牛设置中更新证书后重新加载')

            # 创建双协议服务器（自动 HTTP→HTTPS 301）
            try:
                cls._server = ThreadingDualProtocolServer(('0.0.0.0', int(port)), ProxyHandler)
                cls._server.ssl_context = ssl_context
                cls._server.redirect_domain = domain
                cls._server.redirect_port = int(port)
                cls._server.timeout = int(timeout)
            except OSError as e:
                return False, f"端口 {port} 被占用，请更换端口后重试"
            except Exception as e:
                return False, f"服务器创建失败: {e}"

            # 保存配置（含 running 状态，跨 worker 共享）
            config = {
                'domain': domain,
                'port': int(port),
                'cert_path': cert_path,
                'key_path': key_path,
                'cert_sum': cert.get('sum', '') if cert else '',
                'gzip_enabled': gzip_enabled,
                'hsts_enabled': hsts_enabled,
                'timeout': int(timeout),
                'started_at': datetime.now().isoformat(),
                'running': True,
            }
            cls._config = config
            cls._save_config(config)

            # 启动线程
            cls._running = True
            cls._thread = threading.Thread(target=cls._serve, daemon=True)
            cls._thread.start()

            cls.append_log('INFO', f'反向代理已启动: https://{domain}:{port}')
            cls.append_log('INFO', f'转发目标: http://{INTERNAL_HOST}:{INTERNAL_PORT}')
            cls.append_log('INFO', f'HTTP → HTTPS 301 重定向已启用')
            return True, f"反代已启动 → https://{domain}:{port}"

    @classmethod
    def _serve(cls):
        """代理服务主循环（轮询 DB 停止信号，支持跨 worker 停止）"""
        # 仅设置 accept socket 超时为 1 秒用于轮询；
        # cls._server.timeout 保持原值（来自 start()），用于连接读写超时
        cls._server.socket.settimeout(1)
        try:
            while cls._running:
                cls._server.handle_request()
                # 检查 DB 是否有跨 worker 停止信号
                try:
                    db_cfg = cls._load_config()
                    # 只在配置有效且明确标记为停止时才退出（防止 DB 瞬时异常误关）
                    if db_cfg and db_cfg.get('running') is False:
                        cls._running = False
                        cls.append_log('INFO', '检测到 DB 停止信号，正在关闭反向代理...')
                        break
                except Exception:
                    pass
        except Exception as e:
            logger.error(f"反代服务异常退出: {e}")
            cls.append_log('ERROR', f'服务异常退出: {e}')
        finally:
            cls._running = False
            # 释放 server socket，否则端口永远不释放
            if cls._server:
                try:
                    cls._server.server_close()
                except Exception:
                    pass
                cls._server = None
            try:
                cfg = cls._load_config()
                # 防止 DB 异常时用残缺配置覆盖正常配置
                if cfg and cfg.get('domain'):
                    cfg['running'] = False
                    cfg['stopped_at'] = datetime.now().isoformat()
                    cls._save_config(cfg)
            except Exception:
                pass

    @classmethod
    def stop(cls):
        """停止反代（跨 worker 支持：先通过 DB 判断运行状态）"""
        with cls._lock:
            # 跨 worker：如果当前进程不在运行，通过 DB 信号触发实际停止
            if not cls._running:
                db_cfg = cls._load_config()
                if not db_cfg.get('running', False):
                    return False, "反代未在运行"
                # 更新 DB → 运行反代的 worker 1秒内检测到信号并实际停止
                db_cfg['running'] = False
                db_cfg['stopped_at'] = datetime.now().isoformat()
                cls._save_config(db_cfg)
                cls.append_log('INFO', '反向代理停止信号已发出，稍后生效')
                return True, "反代已停止"

            if cls._server:
                try:
                    cls._server.shutdown()
                except Exception as e:
                    logger.warning(f"shutdown 异常: {e}")
                try:
                    cls._server.server_close()
                except Exception as e:
                    logger.warning(f"server_close 异常: {e}")
            cls._running = False

            if cls._thread and cls._thread.is_alive():
                cls._thread.join(timeout=5)

            cls._server = None
            cls._thread = None

            if cls._config:
                cls._config['running'] = False
                cls._config['stopped_at'] = datetime.now().isoformat()
                cls._save_config(cls._config)

            cls.append_log('INFO', '反向代理已停止')
            return True, "反代已停止"

    @classmethod
    def reload_cert(cls):
        """
        热重载证书（更新 DualProtocolServer 的 SSLContext，不重启服务器）
        跨 worker：如果代理在另一个 worker 运行，无法热重载，返回提示
        """
        with cls._lock:
            # 本 worker 正在运行才能热重载（需要访问 local cls._server）
            if not cls._running or not cls._server:
                # 检查是否其他 worker 在运行
                db_cfg = cls._load_config()
                if db_cfg.get('running', False):
                    return False, "反代在另一个进程运行，请刷新页面后重试"
                return False, "反代未在运行"

            cert = CertManager.get_active_cert()
            if not cert:
                return False, "未找到有效证书"

            cert_path = cert.get('fullchain') or cert.get('certificate', '')
            key_path = cert.get('privateKey', '')

            if not os.path.exists(cert_path) or not os.path.exists(key_path):
                return False, "证书文件不存在"

            try:
                new_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
                new_ctx.load_cert_chain(cert_path, key_path)
                new_ctx.minimum_version = ssl.TLSVersion.TLSv1_2

                cls._server.ssl_context = new_ctx

                cls._config['cert_sum'] = cert.get('sum', '')
                cls._config['cert_path'] = cert_path
                cls._config['key_path'] = key_path
                cls._save_config(cls._config)

                cls.append_log('INFO', 'SSL 证书已热重载')
                return True, "证书已重新加载"
            except Exception as e:
                return False, f"证书重载失败: {e}"

    @classmethod
    def status(cls):
        """获取运行状态（跨 worker 安全：以 DB 中的 running 状态为准，辅以端口检测）"""
        config = cls.get_config(force_reload=True)  # 强制从 DB 加载最新状态
        db_running = config.get('running', False)
        port = config.get('port', 0)

        # 跨 worker 同步：DB 标记运行中但当前进程未运行 → 信任 DB
        if db_running and not cls._running:
            # 端口检测证实存活 → 同步本地状态
            if port and cls._is_port_open(port):
                cls._running = True
            # 端口检测失败不修改 DB（可能是高负载抖动），
            # 真正的停止由 stop() 或 _serve() finally 更新 DB

        cert = CertManager.get_active_cert()

        cert_info = {}
        if cert:
            expires_ts = cert.get('validTo', 0) / 1000
            cert_info = {
                'domain': cert.get('domain', ''),
                'sans': cert.get('san', []),
                'expires': datetime.fromtimestamp(expires_ts).strftime('%Y-%m-%d %H:%M') if expires_ts else '',
                'expired': int(time.time() * 1000) > cert.get('validTo', 0),
                'sum': cert.get('sum', ''),
            }

        cert_changed = CertManager.check_cert_change() if (cls._running or db_running) else False

        is_running = cls._running or db_running
        return {
            'running': is_running,
            'domain': config.get('domain', ''),
            'port': config.get('port', 0),
            'gzip_enabled': config.get('gzip_enabled', True),
            'hsts_enabled': config.get('hsts_enabled', True),
            'http_redirect_enabled': True,
            'timeout': config.get('timeout', 600),
            'started_at': config.get('started_at', ''),
            'stopped_at': config.get('stopped_at', ''),
            'cert': cert_info,
            'cert_changed': cert_changed,
            'public_url': cls.get_public_url(),
        }

    @classmethod
    def _is_port_open(cls, port):
        """检测端口是否在监听（辅助判断跨 worker 运行状态）"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(3)
            result = sock.connect_ex(('127.0.0.1', int(port)))
            sock.close()
            return result == 0
        except Exception:
            return False

    @classmethod
    def get_public_url(cls):
        """获取反代公网地址（用于分享/收集链接）"""
        config = cls.get_config(force_reload=True)
        if config.get('running', False) and config.get('domain'):
            return f"https://{config['domain']}:{config.get('port', 7786)}"
        return ''
