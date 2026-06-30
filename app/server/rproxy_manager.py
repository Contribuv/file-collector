import os
import sys
import json
import time
import socket
import platform
import subprocess
import threading
import requests


RPROXY_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'rproxy')


def _get_binary_path():
    env_path = os.environ.get('RPROXY_BIN_PATH')
    if env_path and os.path.exists(env_path):
        return env_path

    system = platform.system().lower()
    arch = platform.machine().lower()

    if system == 'windows':
        return os.path.join(RPROXY_DIR, 'fc-rproxy.exe')

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
        self.api_port = None
        self.api_base = None
        self._watchdog_thread = None
        self._running = False
        self._start_requested = False
        self._last_config = None

    def is_available(self):
        binary = _get_binary_path()
        if not binary:
            return False
        return os.path.exists(binary) and os.access(binary, os.X_OK if os.name != 'nt' else os.F_OK)

    def _ensure_process(self):
        if self.process and self.process.poll() is None:
            return True

        binary = _get_binary_path()
        if not binary or not os.path.exists(binary):
            return False

        if os.name != 'nt' and not os.access(binary, os.X_OK):
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
                    resp = requests.get(f'{self.api_base}/health', timeout=0.5)
                    if resp.status_code == 200:
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
                resp = requests.get(url, timeout=timeout)
            else:
                resp = requests.post(url, json=data, timeout=timeout)

            if resp.status_code == 200:
                return True, resp.json()
            else:
                return False, resp.text
        except Exception as e:
            return False, str(e)

    def start(self, domain, port, cert_path, key_path, backend_addr,
              gzip_enabled=True, hsts_enabled=True, timeout=600):
        if not self.is_available():
            return False, 'Go 反代二进制文件不可用'

        config = {
            'domain': domain,
            'port': port,
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
            return True, '反代启动成功'
        else:
            msg = result.get('message', str(result)) if isinstance(result, dict) else str(result)
            return False, f'启动失败: {msg}'

    def stop(self):
        if not self._running or not self.process:
            self._start_requested = False
            return True, '反代未运行'

        success, result = self._api_request('POST', '/stop')
        self._start_requested = False

        if success:
            return True, '反代已停止'
        else:
            try:
                self.process.terminate()
                self.process.wait(timeout=5)
            except Exception:
                try:
                    self.process.kill()
                except Exception:
                    pass
            self._running = False
            return True, '反代已停止'

    def reload_cert(self):
        if not self._last_config:
            return False, '没有配置信息'

        success, result = self._api_request('POST', '/reload-cert', {
            'cert_path': self._last_config['cert_path'],
            'key_path': self._last_config['key_path'],
        })

        if success and result.get('success'):
            return True, '证书重载成功'
        else:
            msg = result.get('message', str(result)) if isinstance(result, dict) else str(result)
            return False, f'证书重载失败: {msg}'

    def status(self):
        if not self._running or not self.process:
            return {
                'running': False,
                'port': 0,
                'domain': '',
                'pid': None,
                'started_at': ''
            }

        success, result = self._api_request('GET', '/status')
        if success:
            result['pid'] = self.process.pid
            return result
        else:
            return {
                'running': self.process.poll() is None,
                'port': 0,
                'domain': '',
                'pid': self.process.pid if self.process else None,
                'started_at': ''
            }

    def get_logs(self, limit=200):
        if not self._running:
            return []

        success, result = self._api_request('GET', f'/logs?limit={limit}')
        if success and isinstance(result, dict):
            return result.get('logs', [])
        return []

    def clear_logs(self):
        self._api_request('POST', '/logs/clear')
        return True

    def get_public_url(self):
        if not self._running or not self._last_config:
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
