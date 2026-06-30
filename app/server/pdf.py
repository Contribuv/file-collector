"""
PDF 预览模块
- PDF 文件：使用 Mozilla PDF.js 官方 viewer
路由 /office — 无状态预览容器（兼容旧 URL）。
"""
import os
from urllib.parse import quote
from flask import Blueprint, request, abort, send_from_directory, session, redirect

pdf_bp = Blueprint('pdf_preview', __name__)

_PDFJS_WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'pdfjs', 'web')


@pdf_bp.route('/pdf')
def pdf_preview():
    """PDF 预览入口，返回 PDF.js viewer 页面"""
    return send_from_directory(_PDFJS_WEB_DIR, 'viewer.html')


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
                return redirect('/admin/login')
            try:
                rid_int = int(rid) if rid else 0
            except (ValueError, TypeError):
                abort(400)
            if rid_int:
                from app import _check_record_ownership
                if not _check_record_ownership(rid_int):
                    abort(403)

        token_qs = f'?token={token}&expires={expires}' if token else ''

        if type_param == 'c' and lid and rid:
            file_url = f'/collect/{lid}/preview_file/{rid}{token_qs}'
        elif type_param == 's' and lid and rid:
            file_url = f'/share/{lid}/preview_file/{rid}{token_qs}'
        elif type_param == 'a' and rid:
            file_url = f'/admin/records/{rid}/preview_file'
        elif type_param == 'ca' and lid:
            file_url = f'/collect/{lid}/attachment/preview{token_qs}'
        else:
            abort(400)
    else:
        file_url = request.args.get('file_url', '')
        if not file_url:
            abort(400)

    encoded_file = quote(file_url, safe='')
    return redirect(f'/pdf?file={encoded_file}#page=1')
