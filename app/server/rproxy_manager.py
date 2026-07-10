import os
import sys
import json
import time
import signal
import socket
import platform
import subprocess
import threading
import urllib.request
import urllib.error

from cert_manager import CertManager


RPROXY_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'rproxy')


def _get_binary_path():
    env_path = os.environ.get('RPROXY_BIN_PATH')
    if env_path and os.path.exists(env_path):
        return env_path

    system = platform.system().lower()
    arch = platform.machine().lower()

    if system == 'linux':
        if arch in ('aarch64', 'arm64', 'armv8'):
            return os.path.join(RPROXY_DIR, 'fc-rproxy-arm64')
        if arch in ('x86_64', 'amd64'):
            return os.path.join(RPROXY_DIR, 'fc-rproxy-amd64')

    return None


def _find_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
    s.close()
    return port


def _get_data_dir():
    data_dir = os.environ.get('DATA_DIR')
    if not data_dir:
        pkgvar = os.environ.get('TRIM_PKGVAR', '/tmp/file-collector')
        data_dir = os.path.join(pkgvar, 'data')
    return data_dir


def _state_file_path():
    return os.path.join(_get_data_dir(), 'rproxy_state.json')


def _port_occupied(port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(('0.0.0.0', port))
        s.close()
        return False
    except OSError:
        s.close()
        return True


def _find_pid_by_port(port):
    try:
        result = subprocess.run(
            ['ss', '-tlnp', f'sport = :{port}'],
            capture_output=True, text=True, timeout=3
        )
        for line in result.stdout.splitlines():
            if f':{port}' in line and 'LISTEN' in line:
                idx = line.find('users:')
                if idx >= 0:
                    import re
                    m = re.search(r'pid=(\d+)', line[idx:])
                    if m:
                        return int(m.group(1))
    except Exception:
        pass
    return None


def _is_fc_rproxy_process(pid):
    try:
        result = subprocess.run(
            ['cat', f'/proc/{pid}/cmdline'],
            capture_output=True, text=True, timeout=2
        )
        cmdline = result.stdout.replace('\x00', ' ')
        return 'fc-rproxy' in cmdline
    except Exception:
        return False


def _kill_process(pid):
    try:
        os.kill(pid, 15)
        for _ in range(20):
            try:
                os.kill(pid, 0)
                time.sleep(0.1)
            except OSError:
                return True
        try:
            os.kill(pid, 9)
            time.sleep(0.2)
        except OSError:
            pass
        return True
    except Exception:
        return False


class GoRProxyManager:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.process = None
        self._recovered_pid = None
        self.api_port = None
        self.api_base = None
        self._watchdog_thread = None
        self._running = False
        self._start_requested = False
        self._last_config = None
        self._current_cert_sum = ''
        self._recovered = False

    def is_available(self):
        binary = _get_binary_path()
        if not binary:
            return False
        if not os.path.exists(binary):
            return False
        if not os.access(binary, os.X_OK):
            try:
                os.chmod(binary, 0o755)
            except Exception:
                pass
        return True

    def _load_state_file(self):
        path = _state_file_path()
        if not os.path.exists(path):
            return None
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except Exception:
            return None

    def _save_state_file(self, state):
        try:
            path = _state_file_path()
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, 'w') as f:
                json.dump(state, f)
        except Exception:
            pass

    def _clear_state_file(self):
        try:
            path = _state_file_path()
            if os.path.exists(path):
                os.remove(path)
        except Exception:
            pass

    def _try_recover_from_state(self):
        if self._recovered:
            return False
        state = self._load_state_file()
        if not state:
            return False

        # 跨 worker 同步：如果其他 worker 执行了 stop，不恢复
        if state.get('stopped'):
            return False

        api_port = state.get('api_port')
        pid = state.get('pid')
        config = state.get('config')

        if not api_port or not pid:
            self._clear_state_file()
            return False

        try:
            os.kill(pid, 0)
        except OSError:
            self._clear_state_file()
            return False

        api_base = f'http://127.0.0.1:{api_port}'
        try:
            req = urllib.request.Request(f'{api_base}/health', method='GET')
            resp = urllib.request.urlopen(req, timeout=1)
            if resp.status != 200:
                self._clear_state_file()
                return False
        except Exception:
            self._clear_state_file()
            return False

        self.api_port = api_port
        self.api_base = api_base
        self._running = True
        self._recovered_pid = pid
        self._last_config = config
        self._start_requested = config is not None
        self._recovered = True
        self._current_cert_sum = state.get('cert_sum', '')
        return True

    def _ensure_process(self):
        if self.process and self.process.poll() is None:
            self._running = True
            return True

        if self._try_recover_from_state():
            return True

        binary = _get_binary_path()
        if not binary or not os.path.exists(binary):
            return False

        if not os.access(binary, os.X_OK):
            try:
                os.chmod(binary, 0o755)
            except Exception:
                pass

        self.api_port = _find_free_port()
        self.api_base = f'http://127.0.0.1:{self.api_port}'

        try:
            self.process = subprocess.Popen(
                [binary, '-api-port', str(self.api_port)],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                stdin=subprocess.PIPE,
                bufsize=1,
                universal_newlines=True
            )
            self._running = True

            for _ in range(30):
                try:
                    req = urllib.request.Request(f'{self.api_base}/health', method='GET')
                    resp = urllib.request.urlopen(req, timeout=0.5)
                    if resp.status == 200:
                        self._recovered = True
                        return True
                except Exception:
                    pass
                time.sleep(0.1)

            return False
        except Exception as e:
            print(f'[GoRProxy] 启动失败: {e}')
            return False

    def _api_request(self, method, path, data=None, timeout=5):
        if not self._ensure_process():
            return False, 'Go 反代进程启动失败'

        url = f'{self.api_base}{path}'
        try:
            if method == 'GET':
                req = urllib.request.Request(url, method='GET')
                resp = urllib.request.urlopen(req, timeout=timeout)
                body = resp.read().decode('utf-8')
                return True, json.loads(body)
            else:
                body_data = json.dumps(data).encode('utf-8')
                req = urllib.request.Request(url, data=body_data, method='POST')
                req.add_header('Content-Type', 'application/json')
                resp = urllib.request.urlopen(req, timeout=timeout)
                body = resp.read().decode('utf-8')
                return True, json.loads(body)
        except urllib.error.HTTPError as e:
            try:
                body = e.read().decode('utf-8')
                return False, body
            except Exception:
                return False, str(e)
        except Exception as e:
            return False, str(e)

    def _api_request_no_start(self, method, path, data=None, timeout=5):
        if not self._running or not self.api_base:
            return False, '反代未运行'

        url = f'{self.api_base}{path}'
        try:
            if method == 'GET':
                req = urllib.request.Request(url, method='GET')
                resp = urllib.request.urlopen(req, timeout=timeout)
                body = resp.read().decode('utf-8')
                return True, json.loads(body)
            else:
                body_data = json.dumps(data).encode('utf-8')
                req = urllib.request.Request(url, data=body_data, method='POST')
                req.add_header('Content-Type', 'application/json')
                resp = urllib.request.urlopen(req, timeout=timeout)
                body = resp.read().decode('utf-8')
                return True, json.loads(body)
        except urllib.error.HTTPError as e:
            try:
                body = e.read().decode('utf-8')
                return False, body
            except Exception:
                return False, str(e)
        except Exception as e:
            return False, str(e)

    def _cleanup_port(self, port):
        if not _port_occupied(port):
            return True

        pid = _find_pid_by_port(port)
        if not pid:
            return True

        if not _is_fc_rproxy_process(pid):
            return False

        _kill_process(pid)
        time.sleep(0.3)
        return not _port_occupied(port)

    def start(self, domain, port, cert_path, key_path, backend_addr,
              gzip_enabled=True, hsts_enabled=True, timeout=600):
        if not self.is_available():
            return False, 'Go 反代二进制文件不可用'

        try:
            port_int = int(port)
        except (ValueError, TypeError):
            return False, '端口号必须是数字'

        if not self._try_recover_from_state():
            self._cleanup_port(port_int)

        config = {
            'domain': domain,
            'port': port_int,
            'cert_path': cert_path,
            'key_path': key_path,
            'backend_addr': backend_addr,
            'gzip_enabled': gzip_enabled,
            'hsts_enabled': hsts_enabled,
            'timeout': timeout,
        }

        success, result = self._api_request('POST', '/start', config)
        if success and result.get('success'):
            self._start_requested = True
            self._last_config = config
            certs = CertManager.load_certs()
            cert_sum = ''
            for cert in certs:
                if (cert.get('fullchain') == cert_path or
                    cert.get('certificate') == cert_path or
                    domain in cert.get('san', []) or
                    domain == cert.get('domain')):
                    cert_sum = cert.get('sum', '')
                    self._current_cert_sum = cert_sum
                    break

            state = {
                'api_port': self.api_port,
                'pid': self.process.pid if self.process else None,
                'config': config,
                'cert_sum': cert_sum,
            }
            self._save_state_file(state)

            return True, '反代启动成功'
        else:
            msg = result.get('message', str(result)) if isinstance(result, dict) else str(result)
            if 'address already in use' in msg or 'listen failed' in msg:
                if self._cleanup_port(port_int):
                    success2, result2 = self._api_request('POST', '/start', config)
                    if success2 and result2.get('success'):
                        self._start_requested = True
                        self._last_config = config
                        state = {
                            'api_port': self.api_port,
                            'pid': self.process.pid if self.process else None,
                            'config': config,
                            'cert_sum': self._current_cert_sum,
                        }
                        self._save_state_file(state)
                        return True, '反代启动成功（已清理旧进程）'
                return False, f'启动失败：端口 {port_int} 被占用且无法自动清理'
            return False, f'启动失败: {msg}'

    def stop(self):
        if not self._running or not self.api_base:
            # 本 worker 认为未运行，但仍写 stopped 标志通知其他 worker
            state = self._load_state_file() or {}
            state['stopped'] = True
            self._save_state_file(state)
            self._start_requested = False
            self._current_cert_sum = ''
            self._recovered_pid = None
            self._running = False
            return True, '反代未运行'

        # 第一时间设 _running=False，避免并发 status() 读到 True
        api_base = self.api_base
        self._running = False
        self._start_requested = False
        self._current_cert_sum = ''
        self._recovered_pid = None

        # 写 stopped 标志到状态文件，通知所有 worker 已停止
        state = self._load_state_file() or {}
        state['stopped'] = True
        self._save_state_file(state)

        # 直接请求 Go /stop（绕过 _api_request_no_start，因为 _running 已 False）
        stop_ok = False
        try:
            req = urllib.request.Request(f'{api_base}/stop', method='POST')
            resp = urllib.request.urlopen(req, timeout=5)
            result = json.loads(resp.read().decode('utf-8'))
            stop_ok = result.get('success', False)
        except Exception:
            pass

        # 清空日志队列
        try:
            req = urllib.request.Request(f'{api_base}/logs/clear', method='POST')
            urllib.request.urlopen(req, timeout=3)
        except Exception:
            pass

        if stop_ok:
            return True, '反代已停止'
        else:
            # /stop 失败，杀进程
            pid_to_kill = self.process.pid if self.process else None
            try:
                if pid_to_kill:
                    os.kill(pid_to_kill, signal.SIGTERM)
                    time.sleep(0.5)
            except Exception:
                pass
            try:
                if self.process:
                    self.process.terminate()
                    self.process.wait(timeout=5)
            except Exception:
                try:
                    if self.process:
                        self.process.kill()
                except Exception:
                    pass
            try:
                if pid_to_kill and not (self.process and self.process.poll() is None):
                    os.kill(pid_to_kill, 9)
            except Exception:
                pass
            return True, '反代已停止'

    def reload_cert(self):
        if not self._last_config:
            return False, '没有配置信息'

        success, result = self._api_request_no_start('POST', '/reload-cert', {
            'cert_path': self._last_config['cert_path'],
            'key_path': self._last_config['key_path'],
        })

        if success and result.get('success'):
            certs = CertManager.load_certs()
            cert_path = self._last_config['cert_path']
            domain = self._last_config['domain']
            cert_sum = ''
            for cert in certs:
                if (cert.get('fullchain') == cert_path or
                    cert.get('certificate') == cert_path or
                    domain in cert.get('san', []) or
                    domain == cert.get('domain')):
                    cert_sum = cert.get('sum', '')
                    self._current_cert_sum = cert_sum
                    break

            state = self._load_state_file() or {}
            state['cert_sum'] = cert_sum
            state['config'] = self._last_config
            self._save_state_file(state)

            return True, '证书重载成功'
        else:
            msg = result.get('message', str(result)) if isinstance(result, dict) else str(result)
            return False, f'证书重载失败: {msg}'

    def _pid_alive(self, pid):
        """检查 PID 是否存活"""
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False

    def _active_pid(self):
        """返回当前活跃进程的 PID（优先 self.process，回退 self._recovered_pid）"""
        if self.process and self.process.poll() is None:
            return self.process.pid
        if self._recovered_pid and self._pid_alive(self._recovered_pid):
            return self._recovered_pid
        return None

    def _is_process_running(self):
        """检查 Go 反代进程是否在运行（不依赖 API 调用）"""
        if self.process and self.process.poll() is None:
            return True
        if self._recovered_pid and self._pid_alive(self._recovered_pid):
            return True
        return False

    def _check_go_health(self):
        """检查 Go 进程 API 是否可达，只读不写状态"""
        if not self.api_base:
            return False
        try:
            req = urllib.request.Request(f'{self.api_base}/health', method='GET')
            resp = urllib.request.urlopen(req, timeout=2)
            return resp.status == 200
        except Exception:
            return False

    def _ensure_running_flag(self):
        """确保 _running 标志与真实进程/API 状态一致，避免启动过程中误判"""
        if not self._running:
            # 未运行状态下尝试恢复
            if self._try_recover_from_state():
                return
            return

        # _running 为 True 时，先检查进程是否还活着
        if self._is_process_running():
            # 进程活着，再看 API 是否通
            if self.api_base and self._check_go_health():
                return
            # 进程活着但 API 暂时没响应：可能是启动中或短暂繁忙
            # 尝试从状态文件恢复 api_base（如果 self.api_base 为空）
            if not self.api_base:
                self._try_recover_from_state()
            return

        # 进程确实不在，尝试从状态文件恢复
        if self._try_recover_from_state():
            return

        # 都失败，标记为未运行
        self._running = False

    def _sync_from_state(self):
        """从状态文件同步状态到内存（跨 worker 同步，解决多进程状态不一致）"""
        state = self._load_state_file()

        # stopped 标志 → 已停止
        if state and state.get('stopped'):
            self._running = False
            self._start_requested = False
            return False

        pid = state.get('pid') if state else None
        api_port = state.get('api_port') if state else None

        if not pid or not api_port:
            self._running = False
            return False

        # 检查进程存活
        try:
            os.kill(pid, 0)
        except OSError:
            self._running = False
            return False

        # 进程活着，同步状态到内存
        self.api_port = api_port
        self.api_base = f'http://127.0.0.1:{api_port}'
        self._running = True
        self._recovered_pid = pid
        self._recovered = True
        config = state.get('config')
        if config:
            self._last_config = config
        self._start_requested = config is not None
        self._current_cert_sum = state.get('cert_sum', '')
        return True

    def status(self):
        # 完全基于状态文件 + 进程存活判断，不依赖内存 _running/_recovered
        running = self._sync_from_state()

        if not running:
            return {
                'running': False,
                'port': 0,
                'domain': '',
                'pid': None,
                'started_at': '',
                'public_url': '',
                'cert_changed': False,
            }

        # 尝试从 Go 获取额外信息（domain, port, started_at），失败不影响 running
        go_status = {}
        if self.api_base:
            try:
                req = urllib.request.Request(f'{self.api_base}/status', method='GET')
                resp = urllib.request.urlopen(req, timeout=2)
                go_status = json.loads(resp.read().decode('utf-8'))
            except Exception:
                pass

        return {
            'running': True,
            'port': go_status.get('port') or (self._last_config.get('port', 0) if self._last_config else 0),
            'domain': go_status.get('domain') or (self._last_config.get('domain', '') if self._last_config else ''),
            'pid': self._active_pid(),
            'started_at': go_status.get('started_at', ''),
            'public_url': self.get_public_url(),
            'cert_changed': CertManager.check_cert_change(self._current_cert_sum),
        }

    def get_logs(self, limit=200):
        # 确保 api_base 有值（多 worker 下可能未设置）
        if not self.api_base:
            self._sync_from_state()
        if not self.api_base:
            return []
        try:
            url = f'{self.api_base}/logs?limit={limit}'
            req = urllib.request.Request(url, method='GET')
            resp = urllib.request.urlopen(req, timeout=3)
            body = resp.read().decode('utf-8')
            result = json.loads(body)
            if isinstance(result, dict):
                return result.get('logs', [])
        except Exception:
            pass
        return []

    def clear_logs(self):
        if self._running and self.api_base:
            self._api_request_no_start('POST', '/logs/clear')
        return True

    def get_public_url(self):
        if not self._start_requested or not self._last_config:
            return ''
        domain = self._last_config.get('domain', '')
        port = self._last_config.get('port', 443)
        if not domain:
            return ''
        if port == 443:
            return f'https://{domain}'
        return f'https://{domain}:{port}'

    def get_config(self):
        return self._last_config or {}

    def shutdown(self):
        self._running = False
        self._start_requested = False
        self._clear_state_file()
        if self.process:
            try:
                self.process.terminate()
                self.process.wait(timeout=3)
            except Exception:
                try:
                    self.process.kill()
                except Exception:
                    pass
            self.process = None
