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


class CertManager:
    """飞牛证书发现与管理"""

    @staticmethod
    def load_certs():
        """从飞牛系统配置读取所有证书"""
        if not os.path.exists(FLYFISH_CERT_CONF):
            return []
        try:
            import json
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
    def check_cert_change(current_sum=''):
        """检查证书是否变更（对比 sum 指纹）"""
        cert = CertManager.get_active_cert()
        if not cert:
            return False
        cert_sum = cert.get('sum', '')
        return bool(cert_sum) and cert_sum != current_sum
