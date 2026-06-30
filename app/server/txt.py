"""
TXT 文件预览模块
- 小说风格阅读器，深色主题、可调字号/行高/页宽
- 大于 1MB 的文件显示加载进度
路由 /txt — 无状态预览容器。
"""
import os
from urllib.parse import quote
from flask import Blueprint, render_template, request, abort, session, redirect

txt_bp = Blueprint('txt_preview', __name__)


@txt_bp.route('/txt')
def txt_preview():
    """TXT 小说风格预览容器。"""

    type_param = request.args.get('type', '')
    lid = request.args.get('lid', '')
    rid = request.args.get('rid', '')
    token = request.args.get('tk', '')
    expires = request.args.get('ex', '')
    filename = request.args.get('fn', '')

    if not filename:
        filename = request.args.get('filename', '')
    if not filename:
        filename = '文本文件'

    if type_param:
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
        valid = False

        if type_param == 'c' and lid and rid:
            file_url = f'/collect/{lid}/preview_file/{rid}{token_qs}'
            valid = True
        elif type_param == 's' and lid and rid:
            file_url = f'/share/{lid}/preview_file/{rid}{token_qs}'
            valid = True
        elif type_param == 'a' and rid:
            file_url = f'/admin/records/{rid}/preview_file'
            valid = True
        elif type_param == 'ca' and lid:
            file_url = f'/collect/{lid}/attachment/preview{token_qs}'
            valid = True

        if not valid:
            abort(400)
    else:
        file_url = request.args.get('file_url', '')
        if not file_url:
            abort(400)

    return render_template('txt_reader.html',
        file_url=file_url,
        filename=filename)
