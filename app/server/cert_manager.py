"""
证书管理模块
自动发现飞牛 NAS 系统证书，供反向代理使用
"""
import os
import time
import logging
from datetime import datetime

logger = logging.getLogger('cert_manager')

# 飞牛系统证书配置文件
FLYFISH_CERT_CONF = "/usr/trim/etc/network_cert_all.conf"
# 飞牛系统证书存放目录（结构：ssls/<domain>/<签发时间戳>/fullchain.crt 等）
FLYFISH_SSL_DIR = "/usr/trim/var/trim_connect/ssls"


class CertManager:
    """飞牛证书发现与管理"""

    @staticmethod
    def _should_exclude(cert):
        """判断证书是否应被排除（fnOS 内置证书和 *.fnos.net 动态域名证书）"""
        domain = cert.get('domain', '')
        if domain == 'fnOS':
            return True
        sans = cert.get('san', [])
        if not sans:
            sans = [domain]
        for s in sans:
            if 'fnos.net' in s:
                return True
        if 'fnos.net' in domain:
            return True
        return False

    @staticmethod
    def load_certs():
        """从飞牛系统配置读取所有证书（排除 fnOS 内置和 *.fnos.net 证书）"""
        if not os.path.exists(FLYFISH_CERT_CONF):
            return []
        try:
            import json
            with open(FLYFISH_CERT_CONF, 'r') as f:
                data = json.load(f)
            if not isinstance(data, list):
                return []
            # 排除 fnOS 内置证书和 *.fnos.net 动态域名证书
            return [c for c in data if not CertManager._should_exclude(c)]
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
    def check_cert_change(current_sum=''):
        """检查证书是否变更（对比 sum 指纹）"""
        cert = CertManager.get_active_cert()
        if not cert:
            return False
        cert_sum = cert.get('sum', '')
        return bool(cert_sum) and cert_sum != current_sum

    @staticmethod
    def find_cert_by_domain(domain):
        """从 conf 中查找指定域名的证书记录"""
        for cert in CertManager.load_certs():
            sans = cert.get('san', cert.get('sans', []))
            if domain in sans or domain == cert.get('domain'):
                return cert
        return None

    @staticmethod
    def resolve_cert_paths(domain):
        """按域名解析当前可读的证书文件路径。

        network_cert_all.conf 是系统侧快照：证书 ACME 自动续期后，conf 记录的
        sum 目录可能是历史版本，且旧目录可能对应用用户不可读。因此：
        1. conf 记录的路径可读 -> 直接使用（常规场景零开销）；
        2. 不可读 -> 扫描 /usr/trim/var/trim_connect/ssls/<domain>/ 下的
           sum 数字目录（签发时间戳），从新到旧取第一个可读版本。

        返回 (cert_path, key_path, err)。err 为 None 表示成功，
        否则为可直接展示给用户的中文错误信息。
        """
        cert = CertManager.find_cert_by_domain(domain)
        if cert is None:
            return None, None, f'未找到域名 {domain} 的证书'

        cert_path = cert.get('fullchain') or cert.get('certificate') or ''
        key_path = cert.get('privateKey') or ''

        if (cert_path and key_path and
                os.access(cert_path, os.R_OK) and os.access(key_path, os.R_OK)):
            return cert_path, key_path, None

        # conf 记录不可读（历史快照/权限收紧）：扫描证书目录找最新可读版本
        if domain and '/' not in domain and '\\' not in domain and '..' not in domain:
            domain_dir = os.path.join(FLYFISH_SSL_DIR, domain)
            key_name = os.path.basename(key_path) if key_path else ''
            if os.path.isdir(domain_dir) and key_name:
                try:
                    sums = sorted(
                        (d for d in os.listdir(domain_dir) if d.isdigit()),
                        key=int, reverse=True)
                except OSError:
                    sums = []
                for s in sums:
                    cand_cert = os.path.join(domain_dir, s, 'fullchain.crt')
                    cand_key = os.path.join(domain_dir, s, key_name)
                    if (os.access(cand_cert, os.R_OK) and
                            os.access(cand_key, os.R_OK)):
                        return cand_cert, cand_key, None

        return None, None, (
            f'证书文件不可读（权限不足或已被系统回收）：'
            f'请在飞牛系统「证书」设置中对 {domain} 重新应用证书后重试')
