"""
统一网关访问守卫（共享模块）

集中实现「网关来源隔离 / 管理员鉴权 / CSRF 校验」三项安全约束，
供以下 Blueprint 复用：
  - gateway_api      （反代管理面板 /gateway）
  - gateway_admin_api（集成管理面板 /gateway/admin）

设计要点：
  * 飞牛网关经 Unix Socket 转发时会由应用自身的 socket 代理注入内部令牌头
    （FC_GATEWAY_INTERNAL_TOKEN），通过应用端口直连的请求不带该头，
    因此一律 404，实现「网关访问」与「端口直连」的隔离。
  * 权限一律以应用会话 session['is_admin'] 为准：该会话仅在请求经飞牛网关
    转发时由 SSO 建立，不直接信任客户端可伪造的 X-Trim-Isadmin 头。
  * 本地开发（Windows）或显式设置 FC_GATEWAY_GUARD=0 时豁免，便于调试前端。
"""
import os
import secrets

from flask import request, abort, session, jsonify, make_response


def gateway_guards_disabled():
    """本地开发（Windows）或显式关闭守卫时是否豁免全部校验。"""
    return os.name == 'nt' or os.environ.get('FC_GATEWAY_GUARD', '1') == '0'


def guard_gateway_access():
    """网关页面与接口只能经飞牛统一网关访问，否则 404。"""
    if gateway_guards_disabled():
        return None
    token = os.environ.get('FC_GATEWAY_INTERNAL_TOKEN', '')
    if not token or request.headers.get('X-FC-Gateway-Proxy') != token:
        abort(404)
    return None


def guard_admin_only(admin_endpoints, json_response=False):
    """管理类接口仅飞牛管理员可调用。

    :param admin_endpoints: 需要管理员权限的 endpoint 名称集合
    :param json_response: True 时返回 JSON 403 响应对象（供 JSON API 使用，
                          调用方应 `return` 该值以短路请求），
                          否则直接 abort(403)。
    :return: json_response 模式下越权时返回 Response，否则返回 None。
    """
    if gateway_guards_disabled():
        return None
    if request.endpoint in admin_endpoints and not session.get('is_admin'):
        if json_response:
            return jsonify({'ok': False, 'message': '需要管理员权限'}), 403
        abort(403)
    return None


def validate_csrf():
    """校验 CSRF：从表单或 X-CSRFToken 头取令牌，与应用 session 中的比对。

    写操作（POST/PUT/DELETE）必须校验，防止已登录用户被第三方页面诱导
    发起跨站请求。
    """
    token = request.form.get('csrf_token', '') or request.headers.get('X-CSRFToken', '')
    expected = session.get('csrf_token', '')
    return bool(token) and bool(expected) and secrets.compare_digest(token, expected)
