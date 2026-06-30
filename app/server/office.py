"""
Office 文件预览模块
- PDF 文件：使用 Mozilla PDF.js 官方 viewer（默认 100% 缩放，清晰不模糊）
- 其他 Office 文件：使用 flyfish-dev/file-viewer，在浏览器端纯前端渲染
路由 /office — 无状态预览容器，零磁盘读取。
支持两种参数格式：
  短格式（推荐）：type=c/s/a/ca &lid= &rid= &tk= &ex= &fn=
  长格式（兼容）：file_url= &filename= &download_url=

注意：flyfish renderer 内部会通过 new URL("/assets/...", base) 加载 worker，
由于 /assets/ 是绝对路径，不会拼上 /static/file-viewer/ 前缀。
因此需要注册 /assets/ 路由将其映射到 file-viewer 的 assets 目录。
"""
import os
from urllib.parse import quote
from flask import Blueprint, render_template, request, abort, send_from_directory, session, redirect, url_for

office_bp = Blueprint('office_preview', __name__)

# flyfish renderer 内部硬编码的 /assets/ worker 路径
_FV_ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'file-viewer', 'assets')
_FV_VENDOR_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'file-viewer', 'vendor')

# PDF.js viewer 路径
_PDFJS_WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'pdfjs', 'web')


def _is_pdf(filename):
    """判断文件名是否为 PDF"""
    if not filename:
        return False
    return filename.lower().endswith('.pdf')


@office_bp.route('/assets/<path:filename>')
def serve_flyfish_assets(filename):
    """为 flyfish renderer 提供 worker 等静态资源（如 /assets/pptx.worker-xxx.js）"""
    return send_from_directory(_FV_ASSETS_DIR, filename)


@office_bp.route('/vendor/<path:filename>')
def serve_flyfish_vendor(filename):
    """为 flyfish renderer 提供 vendor 文件（如 /vendor/xlsx/sheet.worker.js）"""
    return send_from_directory(_FV_VENDOR_DIR, filename)


@office_bp.route('/pdf')
def pdf_preview():
    """PDF 预览入口，返回 PDF.js viewer 页面，隐藏静态资源路径。"""
    return send_from_directory(_PDFJS_WEB_DIR, 'viewer.html')


@office_bp.route('/office')
def office_preview():
    """无状态文件预览容器。PDF 走 PDF.js viewer，其他文件走 flyfish。"""

    # 短格式参数
    type_param = request.args.get('type', '')
    lid = request.args.get('lid', '')
    rid = request.args.get('rid', '')
    token = request.args.get('tk', '')
    expires = request.args.get('ex', '')
    filename = request.args.get('fn', '')

    # 长格式参数（向后兼容）
    file_url = request.args.get('file_url', '')
    download_url = request.args.get('download_url', '')
    if not filename:
        filename = request.args.get('filename', '')

    if type_param:
        # ============================================================
        # 权限校验：根据不同 type 验证访问者身份
        # ============================================================
        if type_param == 'a':
            # 后台管理员预览：必须已登录且拥有记录所有权
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

        # 短格式：从构建块重建 URL（使用相对路径，同源无 CORS）
        token_qs = f'?token={token}&expires={expires}' if token else ''
        valid = False

        if type_param == 'c' and lid and rid:
            # collect 记录预览
            file_url = f'/collect/{lid}/preview_file/{rid}{token_qs}'
            download_url = f'/collect/{lid}/download/{rid}{token_qs}'
            valid = True
        elif type_param == 's' and lid and rid:
            # share 记录预览
            file_url = f'/share/{lid}/preview_file/{rid}{token_qs}'
            download_url = f'/share/{lid}/download/{rid}{token_qs}'
            valid = True
        elif type_param == 'a' and rid:
            # admin 记录预览（session 认证，无 token）
            file_url = f'/admin/records/{rid}/preview_file'
            download_url = f'/admin/records/{rid}/download'
            valid = True
        elif type_param == 'ca' and lid:
            # collect 附件预览
            file_url = f'/collect/{lid}/attachment/preview{token_qs}'
            download_url = f'/collect/{lid}/attachment{token_qs}'
            valid = True

        if not valid:
            abort(400)

    if not file_url:
        abort(400)
    if not filename:
        filename = '文件预览'

    if _is_pdf(filename):
        encoded_file = quote(file_url, safe='')
        return redirect(f'/pdf?file={encoded_file}#zoom=100')

    return render_template('office_preview.html',
        file_url=file_url,
        filename=filename,
        download_url=download_url)
