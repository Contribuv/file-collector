"""
PDF 预览模块
- PDF 文件：使用 Mozilla PDF.js 官方 viewer
路由 /office — 无状态预览容器（兼容旧 URL）。
"""
import os
from urllib.parse import quote
from flask import Blueprint, request, abort, send_from_directory, session, redirect, make_response

pdf_bp = Blueprint('pdf_preview', __name__)

_PDFJS_WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'pdfjs', 'web')


@pdf_bp.route('/pdf')
def pdf_preview():
    """PDF 预览入口，返回 PDF.js viewer 页面

    viewer.html 内使用 <base href="/static/pdfjs/web/"> 等绝对路径加载资源，
    统一网关（子路径前缀）下需注入路径前缀，否则资源 404。
    """
    viewer_path = os.path.join(_PDFJS_WEB_DIR, 'viewer.html')
    try:
        with open(viewer_path, 'r', encoding='utf-8') as f:
            html = f.read()
    except OSError:
        abort(404)
    prefix = request.script_root  # 统一网关路径前缀（网关下=/app/file-collector，直连为空）
    if prefix:
        html = html.replace('href="/static/pdfjs/web/"', f'href="{prefix}/static/pdfjs/web/"')
        html = html.replace('href="/static/css/_preview-error.css"', f'href="{prefix}/static/css/_preview-error.css"')
        html = html.replace('src="/static/js/pdf-error.js"', f'src="{prefix}/static/js/pdf-error.js"')
    resp = make_response(html)
    resp.headers['Content-Type'] = 'text/html; charset=utf-8'
    return resp


@pdf_bp.route('/office')
def office_preview():
    """PDF 预览容器。兼容旧 /office URL。"""

    type_param = request.args.get('type', '')
    lid = request.args.get('lid', '')
    rid = request.args.get('rid', '')
    token = request.args.get('tk', '')
    expires = request.args.get('ex', '')
    filename = request.args.get('fn', '')

    if not filename:
        filename = request.args.get('filename', '')
    if not filename:
        filename = '文件预览'

    if type_param:
        # 权限校验
        if type_param == 'a':
            if not session.get('user_id'):
                return redirect(request.script_root + '/admin/login')
            try:
                rid_int = int(rid) if rid else 0
            except (ValueError, TypeError):
                abort(400)
            if rid_int:
                from app import _check_record_ownership
                if not _check_record_ownership(rid_int):
                    abort(403)

        # 统一网关下重定向到飞牛 /docs/preview（NAS 原生 PDF 预览）
        if request.headers.get('X-Trim-Userid') or request.script_root:
            from app import _fn_docs_preview_redirect
            resp = _fn_docs_preview_redirect(type_param, lid, rid)
            if resp is not None:
                return resp

        token_qs = f'?token={token}&expires={expires}' if token else ''
        _prefix = request.script_root  # 统一网关路径前缀（网关下=/app/file-collector，直连为空）

        if type_param == 'c' and lid and rid:
            file_url = f'{_prefix}/collect/{lid}/preview_file/{rid}{token_qs}'
        elif type_param == 's' and lid and rid:
            file_url = f'{_prefix}/share/{lid}/preview_file/{rid}{token_qs}'
        elif type_param == 'a' and rid:
            file_url = f'{_prefix}/admin/records/{rid}/preview_file'
        elif type_param == 'ca' and lid:
            file_url = f'{_prefix}/collect/{lid}/attachment/preview{token_qs}'
        else:
            abort(400)
    else:
        file_url = request.args.get('file_url', '')
        if not file_url:
            abort(400)

    encoded_file = quote(file_url, safe='')
    return redirect(f'{request.script_root}/pdf?file={encoded_file}#page=1')
